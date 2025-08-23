-- ============================================================================
-- ESQUEMA DE BASE DE DATOS PARA RIFA SILVERADO Z71 2024
-- ============================================================================
-- Ejecuta este script en tu Supabase Dashboard > SQL Editor

-- 1. CREAR TABLA PRINCIPAL PARA CLIENTES Y COMPRAS
CREATE TABLE IF NOT EXISTS public.clientes_compras (
  -- IDs y timestamps
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Datos del cliente
  nombre varchar(100) NOT NULL,
  apellidos varchar(100) NOT NULL,
  telefono varchar(20),
  email varchar(100),
  estado varchar(50),
  ciudad varchar(100),
  info_adicional text,
  
  -- Información de la compra
  cantidad_boletos integer NOT NULL CHECK (cantidad_boletos > 0),
  precio_unitario decimal(10,2) NOT NULL CHECK (precio_unitario > 0),
  precio_total decimal(10,2) NOT NULL CHECK (precio_total > 0),
  descuento_aplicado decimal(5,2) DEFAULT 0,
  
  -- Método de pago
  metodo_pago varchar(50) NOT NULL,
  referencia_pago varchar(100),
  
  -- Archivos
  captura_comprobante_url text,
  captura_nombre_archivo varchar(255),
  captura_tamano bigint,
  
  -- Metadata del dispositivo/navegador
  navegador text,
  dispositivo varchar(20),
  ip_address inet,
  user_agent text,
  
  -- Estado de la compra
  estado_compra varchar(20) DEFAULT 'pendiente' CHECK (estado_compra IN ('pendiente', 'confirmada', 'cancelada')),
  fecha_confirmacion timestamp with time zone,
  notas_admin text,
  
  -- Índices para búsquedas rápidas
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' OR email IS NULL)
);

-- 2. CREAR ÍNDICES PARA MEJOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clientes_compras_created_at ON public.clientes_compras(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_compras_estado ON public.clientes_compras(estado_compra);
CREATE INDEX IF NOT EXISTS idx_clientes_compras_email ON public.clientes_compras(email);
CREATE INDEX IF NOT EXISTS idx_clientes_compras_telefono ON public.clientes_compras(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_compras_metodo_pago ON public.clientes_compras(metodo_pago);

-- 3. CREAR FUNCIÓN PARA ACTUALIZAR updated_at AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. CREAR TRIGGER PARA ACTUALIZAR updated_at
DROP TRIGGER IF EXISTS update_clientes_compras_updated_at ON public.clientes_compras;
CREATE TRIGGER update_clientes_compras_updated_at
  BEFORE UPDATE ON public.clientes_compras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. CONFIGURAR SECURITY (RLS - Row Level Security)
ALTER TABLE public.clientes_compras ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción (cualquier usuario puede crear una compra)
CREATE POLICY "Permitir insertar compras" ON public.clientes_compras
  FOR INSERT WITH CHECK (true);

-- Política para permitir lectura (solo admin o propietario)
CREATE POLICY "Permitir leer compras propias" ON public.clientes_compras
  FOR SELECT USING (
    -- Permitir acceso total si es admin (configurar según tu lógica)
    auth.role() = 'service_role' OR
    -- O si es el propietario (por email)
    auth.jwt() ->> 'email' = email
  );

-- 6. CREAR BUCKET PARA ALMACENAR CAPTURAS DE PANTALLA
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO NOTHING;

-- 7. POLÍTICA DE STORAGE PARA SUBIR ARCHIVOS
CREATE POLICY "Permitir subir comprobantes" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'comprobantes');

CREATE POLICY "Permitir ver comprobantes" ON storage.objects
  FOR SELECT USING (bucket_id = 'comprobantes');

-- 8. CREAR VISTA PARA ESTADÍSTICAS (OPCIONAL)
CREATE OR REPLACE VIEW public.estadisticas_compras AS
SELECT 
  COUNT(*) as total_compras,
  SUM(cantidad_boletos) as total_boletos_vendidos,
  SUM(precio_total) as ingresos_totales,
  AVG(precio_total) as compra_promedio,
  COUNT(CASE WHEN estado_compra = 'confirmada' THEN 1 END) as compras_confirmadas,
  COUNT(CASE WHEN estado_compra = 'pendiente' THEN 1 END) as compras_pendientes,
  COUNT(CASE WHEN estado_compra = 'cancelada' THEN 1 END) as compras_canceladas,
  COUNT(DISTINCT email) as clientes_unicos,
  date_trunc('day', created_at) as fecha
FROM public.clientes_compras
GROUP BY date_trunc('day', created_at)
ORDER BY fecha DESC;

-- ============================================================================
-- DATOS DE PRUEBA (OPCIONAL - COMENTADO)
-- ============================================================================

-- Descomenta las siguientes líneas para insertar datos de prueba:

/*
INSERT INTO public.clientes_compras (
  nombre, apellidos, telefono, email, estado, ciudad,
  cantidad_boletos, precio_unitario, precio_total,
  metodo_pago, estado_compra
) VALUES 
  ('Juan', 'Pérez García', '+52-55-1234-5678', 'juan@email.com', 'CDMX', 'Ciudad de México', 
   5, 10.00, 45.00, 'Binance Pay', 'confirmada'),
  ('María', 'López Rodríguez', '+52-33-9876-5432', 'maria@email.com', 'Jalisco', 'Guadalajara', 
   10, 10.00, 80.00, 'OXXO', 'pendiente'),
  ('Carlos', 'Martínez Sánchez', '+52-81-5555-1234', 'carlos@email.com', 'Nuevo León', 'Monterrey', 
   2, 10.00, 20.00, 'Banco Azteca', 'confirmada');
*/

-- ============================================================================
-- INSTRUCCIONES DE USO
-- ============================================================================

-- 1. Ve a tu proyecto Supabase: https://supabase.com/dashboard
-- 2. Navega a SQL Editor
-- 3. Pega y ejecuta este script completo
-- 4. Ve a Storage > Create bucket si no se creó automáticamente
-- 5. Copia tu URL y ANON KEY del proyecto
-- 6. Crea archivo .env.local con las credenciales
-- 7. ¡Listo! Ya puedes capturar datos de clientes