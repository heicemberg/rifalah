-- ============================================================================
-- FUNCIONES ÚTILES PARA EL SISTEMA DE RIFAS
-- ============================================================================
-- Funciones específicas para integrar con CompactPurchaseModal y el store

-- ============================================================================
-- FUNCIONES PARA EL FLUJO DE COMPRA
-- ============================================================================

-- Función para obtener tickets disponibles reales (sin FOMO)
CREATE OR REPLACE FUNCTION get_real_available_tickets()
RETURNS TABLE(ticket_number INTEGER) AS $$
BEGIN
    -- Primero limpiar reservas expiradas
    PERFORM release_expired_reservations();
    
    -- Retornar tickets realmente disponibles
    RETURN QUERY
    SELECT t.number as ticket_number
    FROM tickets t
    WHERE t.status = 'available'
    ORDER BY t.number;
END;
$$ LANGUAGE plpgsql;

-- Función para reservar tickets automáticamente
CREATE OR REPLACE FUNCTION reserve_random_tickets(
    p_customer_id UUID,
    p_ticket_count INTEGER
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    reserved_tickets INTEGER[]
) AS $$
DECLARE
    available_count INTEGER;
    selected_tickets INTEGER[];
    reservation_expires TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Verificar tickets disponibles
    SELECT COUNT(*) INTO available_count
    FROM tickets t
    WHERE t.status = 'available';
    
    IF available_count < p_ticket_count THEN
        RETURN QUERY SELECT false, 'No hay suficientes tickets disponibles', ARRAY[]::INTEGER[];
        RETURN;
    END IF;
    
    -- Seleccionar tickets aleatorios
    SELECT ARRAY_AGG(t.number ORDER BY RANDOM())
    INTO selected_tickets
    FROM (
        SELECT t.number
        FROM tickets t
        WHERE t.status = 'available'
        ORDER BY RANDOM()
        LIMIT p_ticket_count
    ) t;
    
    -- Establecer expiración de reserva (30 minutos)
    reservation_expires := CURRENT_TIMESTAMP + INTERVAL '30 minutes';
    
    -- Reservar tickets
    UPDATE tickets
    SET 
        status = 'reserved',
        customer_id = p_customer_id,
        reserved_at = CURRENT_TIMESTAMP,
        reservation_expires_at = reservation_expires,
        updated_at = CURRENT_TIMESTAMP
    WHERE number = ANY(selected_tickets);
    
    RETURN QUERY SELECT true, 'Tickets reservados exitosamente', selected_tickets;
END;
$$ LANGUAGE plpgsql;

-- Función para crear compra completa con todos los pasos
CREATE OR REPLACE FUNCTION create_complete_purchase(
    p_customer_data JSONB,
    p_ticket_count INTEGER,
    p_total_amount DECIMAL,
    p_payment_method payment_method,
    p_discount_percentage INTEGER DEFAULT 0
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    purchase_id UUID,
    customer_id UUID,
    reserved_tickets INTEGER[]
) AS $$
DECLARE
    v_customer_id UUID;
    v_purchase_id UUID;
    v_reserved_tickets INTEGER[];
    v_discount_amount DECIMAL;
    v_final_amount DECIMAL;
    v_existing_customer UUID;
BEGIN
    -- Verificar si el cliente ya existe por email o whatsapp
    SELECT id INTO v_existing_customer
    FROM customers c
    WHERE c.email = (p_customer_data->>'email') 
       OR c.whatsapp = (p_customer_data->>'whatsapp')
    LIMIT 1;
    
    IF v_existing_customer IS NOT NULL THEN
        -- Actualizar cliente existente
        UPDATE customers
        SET 
            name = COALESCE(p_customer_data->>'name', name),
            email = COALESCE(p_customer_data->>'email', email),
            whatsapp = COALESCE(p_customer_data->>'whatsapp', whatsapp),
            city = COALESCE(p_customer_data->>'city', city),
            state = COALESCE(p_customer_data->>'state', state),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_existing_customer;
        
        v_customer_id := v_existing_customer;
    ELSE
        -- Crear nuevo cliente
        INSERT INTO customers (
            name, email, whatsapp, city, state, status
        ) VALUES (
            p_customer_data->>'name',
            p_customer_data->>'email', 
            p_customer_data->>'whatsapp',
            p_customer_data->>'city',
            p_customer_data->>'state',
            'active'
        ) RETURNING id INTO v_customer_id;
    END IF;
    
    -- Calcular descuento
    v_discount_amount := p_total_amount * (p_discount_percentage / 100.0);
    v_final_amount := p_total_amount - v_discount_amount;
    
    -- Crear la compra
    INSERT INTO purchases (
        customer_id,
        ticket_count,
        total_amount,
        discount_percentage,
        discount_amount,
        final_amount,
        payment_method,
        status,
        step_1_completed,
        step_2_completed,
        step_3_completed,
        step_1_completed_at,
        step_2_completed_at,
        step_3_completed_at
    ) VALUES (
        v_customer_id,
        p_ticket_count,
        p_total_amount,
        p_discount_percentage,
        v_discount_amount,
        v_final_amount,
        p_payment_method,
        'pending',
        true,
        true,
        true,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_purchase_id;
    
    -- Reservar tickets aleatorios
    SELECT rt.reserved_tickets INTO v_reserved_tickets
    FROM reserve_random_tickets(v_customer_id, p_ticket_count) rt
    WHERE rt.success = true;
    
    IF v_reserved_tickets IS NULL THEN
        RETURN QUERY SELECT false, 'No se pudieron reservar los tickets', NULL::UUID, NULL::UUID, ARRAY[]::INTEGER[];
        RETURN;
    END IF;
    
    -- Asociar tickets con la compra
    INSERT INTO purchase_tickets (purchase_id, ticket_id, ticket_number)
    SELECT 
        v_purchase_id,
        t.id,
        t.number
    FROM tickets t
    WHERE t.number = ANY(v_reserved_tickets);
    
    -- Crear actividad en vivo para FOMO
    INSERT INTO live_activities (buyer_name, ticket_count, purchase_id)
    VALUES (
        SUBSTRING(p_customer_data->>'name' FROM 1 FOR POSITION(' ' IN p_customer_data->>'name')) || 
        SUBSTRING(SPLIT_PART(p_customer_data->>'name', ' ', -1) FROM 1 FOR 1) || '.',
        p_ticket_count,
        v_purchase_id
    );
    
    RETURN QUERY SELECT true, 'Compra creada exitosamente', v_purchase_id, v_customer_id, v_reserved_tickets;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES PARA COMPROBANTES Y OCR
-- ============================================================================

-- Función para procesar comprobante subido
CREATE OR REPLACE FUNCTION process_uploaded_receipt(
    p_purchase_id UUID,
    p_customer_id UUID,
    p_filename VARCHAR,
    p_file_size BIGINT,
    p_file_type VARCHAR,
    p_original_url TEXT,
    p_compressed_url TEXT DEFAULT NULL,
    p_thumbnail_url TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    receipt_id UUID
) AS $$
DECLARE
    v_receipt_id UUID;
    v_file_extension VARCHAR(10);
BEGIN
    -- Extraer extensión del archivo
    v_file_extension := LOWER(SUBSTRING(p_filename FROM '\.([^.]*)$'));
    
    -- Crear registro del comprobante
    INSERT INTO receipts (
        purchase_id,
        customer_id,
        original_filename,
        file_size,
        file_type,
        file_extension,
        original_url,
        compressed_url,
        thumbnail_url,
        status,
        uploaded_at
    ) VALUES (
        p_purchase_id,
        p_customer_id,
        p_filename,
        p_file_size,
        p_file_type,
        v_file_extension,
        p_original_url,
        p_compressed_url,
        p_thumbnail_url,
        'pending',
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_receipt_id;
    
    -- Actualizar paso 4 de la compra
    UPDATE purchases
    SET 
        step_4_completed = true,
        step_4_completed_at = CURRENT_TIMESTAMP,
        status = 'confirmed',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_purchase_id;
    
    RETURN QUERY SELECT true, 'Comprobante subido exitosamente', v_receipt_id;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar datos de OCR
CREATE OR REPLACE FUNCTION update_receipt_ocr_data(
    p_receipt_id UUID,
    p_ocr_text TEXT,
    p_ocr_confidence DECIMAL,
    p_parsed_amount DECIMAL DEFAULT NULL,
    p_parsed_date TIMESTAMP DEFAULT NULL,
    p_parsed_reference VARCHAR DEFAULT NULL,
    p_parsed_account VARCHAR DEFAULT NULL,
    p_parsed_bank VARCHAR DEFAULT NULL,
    p_ocr_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    UPDATE receipts
    SET 
        ocr_text = p_ocr_text,
        ocr_confidence = p_ocr_confidence,
        parsed_amount = p_parsed_amount,
        parsed_date = p_parsed_date,
        parsed_reference = p_parsed_reference,
        parsed_account = p_parsed_account,
        parsed_bank = p_parsed_bank,
        ocr_metadata = p_ocr_metadata,
        status = 'processing',
        processed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_receipt_id;
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Datos de OCR actualizados exitosamente';
    ELSE
        RETURN QUERY SELECT false, 'Comprobante no encontrado';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES PARA ADMINISTRACIÓN
-- ============================================================================

-- Función para aprobar comprobante y completar compra
CREATE OR REPLACE FUNCTION approve_purchase(
    p_purchase_id UUID,
    p_admin_email VARCHAR,
    p_admin_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    sold_tickets INTEGER[]
) AS $$
DECLARE
    v_ticket_numbers INTEGER[];
    v_customer_id UUID;
BEGIN
    -- Obtener datos de la compra
    SELECT customer_id INTO v_customer_id
    FROM purchases
    WHERE id = p_purchase_id AND status IN ('confirmed', 'verified');
    
    IF v_customer_id IS NULL THEN
        RETURN QUERY SELECT false, 'Compra no encontrada o ya procesada', ARRAY[]::INTEGER[];
        RETURN;
    END IF;
    
    -- Obtener tickets de la compra
    SELECT ARRAY_AGG(ticket_number) INTO v_ticket_numbers
    FROM purchase_tickets
    WHERE purchase_id = p_purchase_id;
    
    -- Marcar tickets como vendidos
    UPDATE tickets
    SET 
        status = 'sold',
        sold_at = CURRENT_TIMESTAMP,
        reservation_expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE number = ANY(v_ticket_numbers);
    
    -- Actualizar compra como completada
    UPDATE purchases
    SET 
        status = 'completed',
        confirmed_at = CURRENT_TIMESTAMP,
        confirmed_by = p_admin_email,
        admin_notes = p_admin_notes,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_purchase_id;
    
    -- Aprobar comprobante si existe
    UPDATE receipts
    SET 
        status = 'verified',
        verified_by = p_admin_email,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE purchase_id = p_purchase_id;
    
    -- Log de la acción
    INSERT INTO admin_logs (admin_email, action, entity_type, entity_id, details)
    VALUES (
        p_admin_email,
        'approve_purchase',
        'purchase',
        p_purchase_id,
        jsonb_build_object(
            'ticket_numbers', v_ticket_numbers,
            'admin_notes', p_admin_notes
        )
    );
    
    RETURN QUERY SELECT true, 'Compra aprobada exitosamente', v_ticket_numbers;
END;
$$ LANGUAGE plpgsql;

-- Función para rechazar comprobante
CREATE OR REPLACE FUNCTION reject_receipt(
    p_receipt_id UUID,
    p_admin_email VARCHAR,
    p_rejection_reason TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_purchase_id UUID;
BEGIN
    -- Obtener purchase_id
    SELECT purchase_id INTO v_purchase_id
    FROM receipts
    WHERE id = p_receipt_id;
    
    IF v_purchase_id IS NULL THEN
        RETURN QUERY SELECT false, 'Comprobante no encontrado';
        RETURN;
    END IF;
    
    -- Rechazar comprobante
    UPDATE receipts
    SET 
        status = 'rejected',
        rejection_reason = p_rejection_reason,
        rejected_by = p_admin_email,
        rejected_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_receipt_id;
    
    -- Actualizar compra como fallida
    UPDATE purchases
    SET 
        status = 'failed',
        admin_notes = 'Comprobante rechazado: ' || p_rejection_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_purchase_id;
    
    -- Liberar tickets reservados
    UPDATE tickets
    SET 
        status = 'available',
        customer_id = NULL,
        reserved_at = NULL,
        reservation_expires_at = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id IN (
        SELECT t.id
        FROM tickets t
        JOIN purchase_tickets pt ON t.id = pt.ticket_id
        WHERE pt.purchase_id = v_purchase_id
    );
    
    -- Log de la acción
    INSERT INTO admin_logs (admin_email, action, entity_type, entity_id, details)
    VALUES (
        p_admin_email,
        'reject_receipt',
        'receipt',
        p_receipt_id,
        jsonb_build_object('reason', p_rejection_reason)
    );
    
    RETURN QUERY SELECT true, 'Comprobante rechazado exitosamente';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES PARA ESTADÍSTICAS Y REPORTING
-- ============================================================================

-- Función para obtener estadísticas en tiempo real
CREATE OR REPLACE FUNCTION get_raffle_stats()
RETURNS TABLE(
    total_tickets INTEGER,
    available_tickets INTEGER,
    reserved_tickets INTEGER,
    sold_tickets INTEGER,
    sold_percentage DECIMAL,
    total_revenue DECIMAL,
    pending_purchases INTEGER,
    completed_purchases INTEGER
) AS $$
BEGIN
    -- Limpiar reservas expiradas primero
    PERFORM release_expired_reservations();
    
    RETURN QUERY
    SELECT 
        10000 as total_tickets,
        COUNT(*) FILTER (WHERE t.status = 'available')::INTEGER as available_tickets,
        COUNT(*) FILTER (WHERE t.status = 'reserved')::INTEGER as reserved_tickets,
        COUNT(*) FILTER (WHERE t.status = 'sold')::INTEGER as sold_tickets,
        ROUND((COUNT(*) FILTER (WHERE t.status = 'sold')::DECIMAL / 10000) * 100, 2) as sold_percentage,
        COALESCE(SUM(p.final_amount) FILTER (WHERE p.status = 'completed'), 0) as total_revenue,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status IN ('pending', 'confirmed', 'verified'))::INTEGER as pending_purchases,
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed')::INTEGER as completed_purchases
    FROM tickets t
    LEFT JOIN purchase_tickets pt ON t.id = pt.ticket_id
    LEFT JOIN purchases p ON pt.purchase_id = p.id;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener actividades recientes para FOMO
CREATE OR REPLACE FUNCTION get_recent_activities(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    id UUID,
    buyer_name VARCHAR,
    ticket_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Limpiar actividades expiradas
    PERFORM cleanup_old_activities();
    
    RETURN QUERY
    SELECT 
        la.id,
        la.buyer_name,
        la.ticket_count,
        la.created_at
    FROM live_activities la
    ORDER BY la.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES PARA MANTENIMIENTO
-- ============================================================================

-- Función para limpiar y mantener la base de datos
CREATE OR REPLACE FUNCTION maintenance_cleanup()
RETURNS TABLE(
    task VARCHAR,
    result INTEGER,
    message TEXT
) AS $$
DECLARE
    released_reservations INTEGER;
    cleaned_activities INTEGER;
    old_logs INTEGER;
BEGIN
    -- Liberar reservas expiradas
    SELECT release_expired_reservations() INTO released_reservations;
    
    -- Limpiar actividades viejas
    SELECT cleanup_old_activities() INTO cleaned_activities;
    
    -- Limpiar logs viejos (más de 30 días)
    DELETE FROM admin_logs WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    GET DIAGNOSTICS old_logs = ROW_COUNT;
    
    -- Retornar resultados
    RETURN QUERY VALUES 
        ('released_reservations', released_reservations, 'Reservas liberadas'),
        ('cleaned_activities', cleaned_activities, 'Actividades limpiadas'),
        ('old_logs_deleted', old_logs, 'Logs antiguos eliminados');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIONES PARA INTEGRACIÓN CON SUPABASE STORAGE
-- ============================================================================

-- Función para obtener URL firmada de comprobante
CREATE OR REPLACE FUNCTION get_receipt_signed_url(
    p_receipt_id UUID,
    p_type VARCHAR DEFAULT 'original' -- 'original', 'compressed', 'thumbnail'
)
RETURNS TEXT AS $$
DECLARE
    v_url TEXT;
BEGIN
    SELECT 
        CASE 
            WHEN p_type = 'compressed' THEN compressed_url
            WHEN p_type = 'thumbnail' THEN thumbnail_url
            ELSE original_url
        END
    INTO v_url
    FROM receipts
    WHERE id = p_receipt_id;
    
    RETURN v_url;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CONSULTAS ÚTILES COMO FUNCIONES
-- ============================================================================

-- Obtener compras pendientes de verificación
CREATE OR REPLACE FUNCTION get_pending_verifications(limit_count INTEGER DEFAULT 50)
RETURNS TABLE(
    purchase_id UUID,
    customer_name VARCHAR,
    customer_email VARCHAR,
    customer_whatsapp VARCHAR,
    ticket_count INTEGER,
    final_amount DECIMAL,
    payment_method payment_method,
    receipt_status receipt_status,
    original_filename VARCHAR,
    uploaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        c.name,
        c.email,
        c.whatsapp,
        p.ticket_count,
        p.final_amount,
        p.payment_method,
        r.status,
        r.original_filename,
        r.uploaded_at,
        p.created_at
    FROM purchases p
    JOIN customers c ON p.customer_id = c.id
    LEFT JOIN receipts r ON p.id = r.purchase_id
    WHERE p.status IN ('pending', 'confirmed', 'verified')
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Obtener historial de compras de un cliente
CREATE OR REPLACE FUNCTION get_customer_history(p_customer_email VARCHAR)
RETURNS TABLE(
    purchase_id UUID,
    ticket_count INTEGER,
    final_amount DECIMAL,
    payment_method payment_method,
    status purchase_status,
    created_at TIMESTAMP WITH TIME ZONE,
    ticket_numbers INTEGER[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.ticket_count,
        p.final_amount,
        p.payment_method,
        p.status,
        p.created_at,
        ARRAY_AGG(pt.ticket_number ORDER BY pt.ticket_number)
    FROM purchases p
    JOIN customers c ON p.customer_id = c.id
    LEFT JOIN purchase_tickets pt ON p.id = pt.purchase_id
    WHERE c.email = p_customer_email
    GROUP BY p.id, p.ticket_count, p.final_amount, p.payment_method, p.status, p.created_at
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FINALIZACIÓN
-- ============================================================================

SELECT 'Utility functions created successfully! Ready for integration.' as status;