-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN DE TICKETS PARA RIFA SILVERADO Z71 2024
-- ============================================================================
-- Este script crea todos los tickets del 1 al 10000 en la base de datos
-- Ejecutar solo UNA VEZ después de crear las tablas

-- Verificar si ya existen tickets para evitar duplicados
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.tickets LIMIT 1) THEN
        -- Insertar todos los tickets del 1 al 10000 como disponibles
        INSERT INTO public.tickets (number, status, created_at)
        SELECT 
            generate_series AS number,
            'disponible' AS status,
            NOW() AS created_at
        FROM generate_series(1, 10000);
        
        RAISE NOTICE 'Se han creado 10,000 tickets exitosamente';
    ELSE
        RAISE NOTICE 'Los tickets ya existen en la base de datos';
    END IF;
END
$$;

-- Verificar que se crearon correctamente
SELECT 
    COUNT(*) as total_tickets,
    COUNT(CASE WHEN status = 'disponible' THEN 1 END) as disponibles,
    COUNT(CASE WHEN status = 'reservado' THEN 1 END) as reservados,
    COUNT(CASE WHEN status = 'vendido' THEN 1 END) as vendidos,
    MIN(number) as min_numero,
    MAX(number) as max_numero
FROM public.tickets;

-- Crear índices para optimizar performance
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON public.tickets(number);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON public.tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_available ON public.tickets(status) WHERE status = 'disponible';

-- Verificar la estructura final
\d public.tickets;

RAISE NOTICE 'Inicialización de tickets completada exitosamente!';