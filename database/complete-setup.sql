-- ============================================================================
-- SETUP COMPLETO PARA RIFA SILVERADO Z71 2024 - SUPABASE
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Copia TODO este archivo completo
-- 2. Pégalo en SQL Editor de Supabase
-- 3. Ejecuta una sola vez
-- 4. Verifica los resultados al final
-- ============================================================================

-- Limpiar tablas existentes si existen (opcional - descomenta si necesitas limpiar)
-- DROP TABLE IF EXISTS public.tickets CASCADE;
-- DROP TABLE IF EXISTS public.purchases CASCADE; 
-- DROP TABLE IF EXISTS public.customers CASCADE;

-- ============================================================================
-- 1. CREAR TABLA CUSTOMERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 2. CREAR TABLA PURCHASES  
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  total_amount numeric NOT NULL,
  unit_price numeric NOT NULL DEFAULT 200.00,
  discount_applied integer DEFAULT 0 CHECK (discount_applied >= 0 AND discount_applied <= 100),
  payment_method text NOT NULL,
  payment_reference text,
  payment_proof_url text,
  status text DEFAULT 'pendiente'::text CHECK (status = ANY (ARRAY['pendiente'::text, 'confirmada'::text, 'cancelada'::text])),
  verified_at timestamp with time zone,
  verified_by text,
  notes text,
  browser_info text,
  device_info text,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT purchases_pkey PRIMARY KEY (id),
  CONSTRAINT purchases_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE
);

-- ============================================================================
-- 3. CREAR TABLA TICKETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE CHECK (number >= 1 AND number <= 10000),
  status text DEFAULT 'disponible'::text CHECK (status = ANY (ARRAY['disponible'::text, 'reservado'::text, 'vendido'::text])),
  customer_id uuid,
  purchase_id uuid,
  reserved_at timestamp with time zone,
  sold_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL,
  CONSTRAINT tickets_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE SET NULL
);

-- ============================================================================
-- 4. CREAR ÍNDICES PARA PERFORMANCE ÓPTIMA
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);

CREATE INDEX IF NOT EXISTS idx_purchases_customer_id ON public.purchases(customer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases(created_at);

CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets(number);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON public.tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_purchase_id ON public.tickets(purchase_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_available ON public.tickets(status) WHERE status = 'disponible';
CREATE INDEX IF NOT EXISTS idx_tickets_status_sold ON public.tickets(status) WHERE status = 'vendido';

-- ============================================================================
-- 5. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Políticas para customers
DROP POLICY IF EXISTS "Customers can be created by anyone" ON public.customers;
CREATE POLICY "Customers can be created by anyone" ON public.customers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can be viewed by anyone" ON public.customers;
CREATE POLICY "Customers can be viewed by anyone" ON public.customers
  FOR SELECT USING (true);

-- Políticas para purchases  
DROP POLICY IF EXISTS "Purchases can be created by anyone" ON public.purchases;
CREATE POLICY "Purchases can be created by anyone" ON public.purchases
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Purchases can be viewed by anyone" ON public.purchases;
CREATE POLICY "Purchases can be viewed by anyone" ON public.purchases
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Purchases can be updated by anyone" ON public.purchases;
CREATE POLICY "Purchases can be updated by anyone" ON public.purchases
  FOR UPDATE USING (true);

-- Políticas para tickets
DROP POLICY IF EXISTS "Tickets can be viewed by anyone" ON public.tickets;
CREATE POLICY "Tickets can be viewed by anyone" ON public.tickets
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tickets can be updated by anyone" ON public.tickets;
CREATE POLICY "Tickets can be updated by anyone" ON public.tickets
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Tickets can be inserted by anyone" ON public.tickets;
CREATE POLICY "Tickets can be inserted by anyone" ON public.tickets
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 6. CREAR TODOS LOS 10,000 TICKETS AUTOMÁTICAMENTE
-- ============================================================================
DO $$
BEGIN
    -- Verificar si ya existen tickets para evitar duplicados
    IF NOT EXISTS (SELECT 1 FROM public.tickets LIMIT 1) THEN
        -- Insertar todos los tickets del 1 al 10000 como disponibles
        INSERT INTO public.tickets (number, status, created_at)
        SELECT 
            generate_series AS number,
            'disponible' AS status,
            NOW() AS created_at
        FROM generate_series(1, 10000);
        
        RAISE NOTICE '✅ Se crearon 10,000 tickets exitosamente (números 1-10000)';
    ELSE
        RAISE NOTICE '⚠️  Los tickets ya existen en la base de datos';
    END IF;
END
$$;

-- ============================================================================
-- 7. CREAR FUNCIONES HELPER PARA LA APLICACIÓN
-- ============================================================================

-- Función para liberar reservas expiradas automáticamente
CREATE OR REPLACE FUNCTION liberar_reservas_expiradas()
RETURNS INTEGER AS $$
DECLARE
    tickets_liberados INTEGER;
BEGIN
    UPDATE public.tickets 
    SET 
        status = 'disponible',
        customer_id = NULL,
        reserved_at = NULL
    WHERE 
        status = 'reservado' 
        AND reserved_at < (NOW() - INTERVAL '30 minutes');
        
    GET DIAGNOSTICS tickets_liberados = ROW_COUNT;
    
    RETURN tickets_liberados;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tickets disponibles aleatoriamente
CREATE OR REPLACE FUNCTION obtener_tickets_aleatorios(cantidad INTEGER)
RETURNS TABLE(number INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT t.number 
    FROM public.tickets t
    WHERE t.status = 'disponible'
    ORDER BY RANDOM()
    LIMIT cantidad;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. CONFIGURAR REALTIME PARA ACTUALIZACIONES EN VIVO
-- ============================================================================
-- Habilitar realtime en las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;

-- ============================================================================
-- 9. CREAR STORAGE BUCKET PARA COMPROBANTES
-- ============================================================================
-- Crear bucket para comprobantes de pago
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir subir archivos
DROP POLICY IF EXISTS "Comprobantes upload policy" ON storage.objects;
CREATE POLICY "Comprobantes upload policy" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'comprobantes');

DROP POLICY IF EXISTS "Comprobantes view policy" ON storage.objects;
CREATE POLICY "Comprobantes view policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'comprobantes');

-- ============================================================================
-- 10. INSERTAR DATOS DE PRUEBA (OPCIONAL)
-- ============================================================================
-- Crear cliente de prueba
INSERT INTO public.customers (name, email, phone, city, state) 
VALUES ('Cliente Prueba', 'prueba@test.com', '+52 55 1234 5678', 'Ciudad de México', 'CDMX')
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 11. VERIFICACIÓN FINAL - MOSTRAR RESULTADOS
-- ============================================================================
DO $$
DECLARE
    total_tickets INTEGER;
    disponibles INTEGER;
    reservados INTEGER;
    vendidos INTEGER;
    total_customers INTEGER;
    total_purchases INTEGER;
BEGIN
    -- Contar tickets por estado
    SELECT COUNT(*) INTO total_tickets FROM public.tickets;
    SELECT COUNT(*) INTO disponibles FROM public.tickets WHERE status = 'disponible';
    SELECT COUNT(*) INTO reservados FROM public.tickets WHERE status = 'reservado';  
    SELECT COUNT(*) INTO vendidos FROM public.tickets WHERE status = 'vendido';
    
    -- Contar otras tablas
    SELECT COUNT(*) INTO total_customers FROM public.customers;
    SELECT COUNT(*) INTO total_purchases FROM public.purchases;
    
    -- Mostrar resultados
    RAISE NOTICE '';
    RAISE NOTICE '🎯 ============================================';
    RAISE NOTICE '🎯 SETUP COMPLETO - RIFA SILVERADO Z71 2024';
    RAISE NOTICE '🎯 ============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 TICKETS:';
    RAISE NOTICE '   - Total: % tickets', total_tickets;
    RAISE NOTICE '   - Disponibles: % tickets', disponibles;
    RAISE NOTICE '   - Reservados: % tickets', reservados;
    RAISE NOTICE '   - Vendidos: % tickets', vendidos;
    RAISE NOTICE '';
    RAISE NOTICE '👥 CUSTOMERS: % registros', total_customers;
    RAISE NOTICE '🛒 PURCHASES: % registros', total_purchases;
    RAISE NOTICE '';
    
    IF total_tickets = 10000 AND disponibles = 10000 THEN
        RAISE NOTICE '✅ TODO CONFIGURADO CORRECTAMENTE!';
        RAISE NOTICE '✅ Listo para conectar la aplicación';
    ELSE
        RAISE NOTICE '❌ Error en la configuración';
        RAISE NOTICE '❌ Verifica los datos arriba';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Próximos pasos:';
    RAISE NOTICE '   1. Copia las URLs y keys de Supabase';  
    RAISE NOTICE '   2. Configura .env.local en tu proyecto';
    RAISE NOTICE '   3. Ejecuta: npm run dev';
    RAISE NOTICE '   4. Ve a /admin para gestionar compras';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ¡Sistema listo para recibir compras!';
    RAISE NOTICE '🎯 ============================================';
END
$$;

-- ============================================================================
-- 12. COMANDOS ÚTILES PARA MONITOREO (COMENTADOS)
-- ============================================================================
-- Para verificar el estado después:
-- SELECT status, COUNT(*) as cantidad FROM public.tickets GROUP BY status;
-- SELECT * FROM public.customers ORDER BY created_at DESC LIMIT 5;  
-- SELECT * FROM public.purchases ORDER BY created_at DESC LIMIT 5;
-- SELECT number FROM public.tickets WHERE status = 'disponible' ORDER BY number LIMIT 10;

-- Para limpiar todo si necesitas empezar de nuevo:
-- TRUNCATE TABLE public.tickets, public.purchases, public.customers CASCADE;

-- ============================================================================
-- FIN DEL SETUP - NO MODIFICAR NADA DEBAJO DE ESTA LÍNEA
-- ============================================================================