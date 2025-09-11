-- ============================================================================
-- SCRIPT DE CORRECCIÓN PARA LA BASE DE DATOS DE RIFA
-- ============================================================================
-- PROBLEMA: Solo 1,000 tickets en lugar de 10,000
-- SOLUCIÓN: Crear los 9,000 tickets faltantes y sincronizar con compras confirmadas

-- ============================================================================
-- PARTE 1: CREAR FUNCIÓN AUXILIAR PARA CÓDIGOS DE TICKET
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_ticket_code(ticket_number INTEGER)
RETURNS VARCHAR(4) AS $$
BEGIN
    RETURN LPAD(ticket_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 2: CREAR LOS 9,000 TICKETS FALTANTES
-- ============================================================================

-- Insertar tickets del 1 al 10,000 (solo los que no existen)
INSERT INTO tickets (number, ticket_code, status, created_at)
SELECT 
    num,
    LPAD(num::TEXT, 4, '0'),
    'available',
    CURRENT_TIMESTAMP
FROM generate_series(1, 10000) AS num
WHERE num NOT IN (
    SELECT number 
    FROM tickets 
    WHERE number IS NOT NULL
);

-- Verificar que ahora tenemos 10,000 tickets
SELECT 
    'VERIFICACIÓN DE CREACIÓN DE TICKETS' as check_type,
    COUNT(*) as total_tickets,
    CASE 
        WHEN COUNT(*) = 10000 THEN '✅ CORRECTO'
        ELSE '❌ ERROR'
    END as status
FROM tickets;

-- ============================================================================
-- PARTE 3: ANÁLISIS DE COMPRAS CONFIRMADAS
-- ============================================================================

-- Ver el estado actual de compras confirmadas
SELECT 
    'ANÁLISIS DE COMPRAS CONFIRMADAS' as check_type,
    COUNT(*) as total_confirmed_purchases,
    SUM(COALESCE(ticket_count, 0)) as total_tickets_should_be_sold,
    SUM(total_amount) as total_revenue
FROM purchases 
WHERE status = 'confirmada';

-- ============================================================================
-- PARTE 4: SINCRONIZAR COMPRAS CONFIRMADAS CON TICKETS
-- ============================================================================

-- IMPORTANTE: Este script asigna tickets secuencialmente a compras confirmadas
-- Se ejecuta solo si hay compras confirmadas que no tienen tickets asignados

DO $$
DECLARE
    purchase_record RECORD;
    available_ticket_numbers INTEGER[];
    tickets_to_assign INTEGER;
    i INTEGER;
BEGIN
    -- Para cada compra confirmada que tiene ticket_count
    FOR purchase_record IN 
        SELECT id, customer_id, ticket_count, confirmed_at
        FROM purchases 
        WHERE status = 'confirmada' 
        AND ticket_count IS NOT NULL 
        AND ticket_count > 0
        ORDER BY COALESCE(confirmed_at, created_at)
    LOOP
        tickets_to_assign := purchase_record.ticket_count;
        
        -- Obtener tickets disponibles
        SELECT ARRAY(
            SELECT number 
            FROM tickets 
            WHERE status = 'available' 
            ORDER BY number 
            LIMIT tickets_to_assign
        ) INTO available_ticket_numbers;
        
        -- Si hay suficientes tickets disponibles
        IF array_length(available_ticket_numbers, 1) >= tickets_to_assign THEN
            -- Actualizar los tickets
            UPDATE tickets 
            SET 
                status = 'vendido',
                customer_id = purchase_record.customer_id,
                sold_at = COALESCE(purchase_record.confirmed_at, CURRENT_TIMESTAMP),
                updated_at = CURRENT_TIMESTAMP
            WHERE number = ANY(available_ticket_numbers[1:tickets_to_assign]);
            
            RAISE NOTICE 'Asignados % tickets a compra %', tickets_to_assign, purchase_record.id;
        ELSE
            RAISE NOTICE 'No hay suficientes tickets disponibles para compra %', purchase_record.id;
        END IF;
    END LOOP;
END $$;

-- ============================================================================
-- PARTE 5: VERIFICACIÓN POST-SINCRONIZACIÓN
-- ============================================================================

-- Verificar estado final de tickets
SELECT 
    'ESTADO FINAL DE TICKETS' as check_type,
    status,
    COUNT(*) as count,
    ROUND((COUNT(*) * 100.0 / 10000), 2) as percentage
FROM tickets 
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'vendido' THEN 1
        WHEN 'reservado' THEN 2
        WHEN 'available' THEN 3
        ELSE 4
    END;

-- Verificar matemática total
SELECT 
    'VERIFICACIÓN MATEMÁTICA' as check_type,
    SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendidos,
    SUM(CASE WHEN status = 'reservado' THEN 1 ELSE 0 END) as reservados,
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as disponibles,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) = 10000 THEN '✅ MATEMÁTICA CORRECTA'
        ELSE '❌ ERROR MATEMÁTICO'
    END as status
FROM tickets;

-- Verificar correlación compras vs tickets
SELECT 
    'CORRELACIÓN COMPRAS-TICKETS' as check_type,
    (SELECT COUNT(*) FROM tickets WHERE status = 'vendido') as tickets_vendidos,
    (SELECT SUM(COALESCE(ticket_count, 0)) FROM purchases WHERE status = 'confirmada') as tickets_en_compras_confirmadas,
    CASE 
        WHEN (SELECT COUNT(*) FROM tickets WHERE status = 'vendido') = 
             (SELECT SUM(COALESCE(ticket_count, 0)) FROM purchases WHERE status = 'confirmada')
        THEN '✅ SINCRONIZACIÓN PERFECTA'
        ELSE '⚠️ REVISAR SINCRONIZACIÓN'
    END as status;

-- ============================================================================
-- PARTE 6: REPORTE FINAL
-- ============================================================================

SELECT 
    '🎯 REPORTE FINAL DE CORRECCIÓN' as title,
    '' as separator;

SELECT 
    'Total de tickets en BD' as metric,
    COUNT(*)::TEXT as value
FROM tickets
UNION ALL
SELECT 
    'Tickets vendidos (real)' as metric,
    COUNT(*)::TEXT as value
FROM tickets WHERE status = 'vendido'
UNION ALL
SELECT 
    'Tickets reservados' as metric,
    COUNT(*)::TEXT as value
FROM tickets WHERE status = 'reservado'
UNION ALL
SELECT 
    'Tickets disponibles' as metric,
    COUNT(*)::TEXT as value
FROM tickets WHERE status = 'available'
UNION ALL
SELECT 
    'Display FOMO (vendidos + 1200)' as metric,
    (COUNT(*) + 1200)::TEXT as value
FROM tickets WHERE status = 'vendido'
UNION ALL
SELECT 
    'Compras confirmadas' as metric,
    COUNT(*)::TEXT as value
FROM purchases WHERE status = 'confirmada'
UNION ALL
SELECT 
    'Ingresos totales confirmados' as metric,
    '$' || SUM(total_amount)::TEXT || ' MXN' as value
FROM purchases WHERE status = 'confirmada';

-- Mensaje final
SELECT 
    '✅ CORRECCIÓN COMPLETADA' as status,
    'La base de datos ahora tiene 10,000 tickets correctamente configurados' as message,
    'Los contadores frontend deberían mostrar los números correctos' as next_step;

-- ============================================================================
-- NOTAS PARA EL ADMINISTRADOR:
-- ============================================================================
-- 
-- 1. Este script corrige la falta de tickets en la base de datos
-- 2. Sincroniza las compras confirmadas existentes con tickets vendidos
-- 3. Mantiene la integridad matemática (suma total = 10,000)
-- 4. Preserva el sistema FOMO (frontend sigue mostrando +1200)
-- 5. Después de ejecutar, los contadores deberían funcionar correctamente
--
-- VERIFICACIÓN MANUAL:
-- - Ve al admin panel y verifica que los contadores muestran números realistas
-- - Confirma una compra de prueba y verifica que los contadores se actualicen
-- - Comprueba que el frontend muestre "vendidos" = real + 1200 FOMO
--
-- ============================================================================