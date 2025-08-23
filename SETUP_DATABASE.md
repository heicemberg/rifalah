# 🗄️ CONFIGURACIÓN DE BASE DE DATOS SUPABASE

Este archivo contiene las instrucciones y scripts SQL para configurar la base de datos de la Rifa Silverado Z71 2024.

## 📋 PASOS PARA CONFIGURAR SUPABASE

### 1. Crear cuenta y proyecto
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Espera que se inicialice (2-3 minutos)

### 2. Obtener credenciales
1. Ve a **Settings** > **API**
2. Copia la **URL** del proyecto
3. Copia la **anon public key**
4. Actualiza el archivo `.env.local` con estos valores

### 3. Ejecutar SQL para crear tablas
Ve a **SQL Editor** en Supabase y ejecuta el siguiente código:

```sql
-- ============================================================================
-- CONFIGURACIÓN DE BASE DE DATOS PARA RIFA SILVERADO Z71 2024
-- ============================================================================

-- Eliminar tabla si existe (solo para desarrollo)
DROP TABLE IF EXISTS clientes_compras;

-- Crear tabla para guardar las compras de los clientes
CREATE TABLE clientes_compras (
    -- Identificadores
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Datos del cliente
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(254) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    info_adicional TEXT,
    
    -- Información de la compra
    cantidad_boletos INTEGER NOT NULL CHECK (cantidad_boletos > 0),
    numeros_boletos INTEGER[] DEFAULT '{}',
    numeros_boletos_formateados TEXT,
    precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 10.00,
    precio_total DECIMAL(10,2) NOT NULL,
    descuento_aplicado INTEGER DEFAULT 0 CHECK (descuento_aplicado >= 0 AND descuento_aplicado <= 100),
    
    -- Método de pago
    metodo_pago VARCHAR(50) NOT NULL,
    referencia_pago VARCHAR(100),
    
    -- Archivos y comprobantes
    captura_comprobante_url TEXT,
    captura_nombre_archivo VARCHAR(255),
    captura_tamano INTEGER,
    
    -- Metadata técnica
    navegador TEXT,
    dispositivo VARCHAR(20),
    ip_address INET,
    user_agent TEXT,
    
    -- Estado de la compra
    estado_compra VARCHAR(20) DEFAULT 'pendiente' CHECK (estado_compra IN ('pendiente', 'confirmada', 'cancelada')),
    fecha_confirmacion TIMESTAMP WITH TIME ZONE,
    notas_admin TEXT
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_clientes_compras_email ON clientes_compras(email);
CREATE INDEX idx_clientes_compras_estado ON clientes_compras(estado_compra);
CREATE INDEX idx_clientes_compras_fecha ON clientes_compras(created_at);
CREATE INDEX idx_clientes_compras_telefono ON clientes_compras(telefono);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_clientes_compras_updated_at 
    BEFORE UPDATE ON clientes_compras 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CONFIGURACIÓN DE STORAGE PARA COMPROBANTES DE PAGO
-- ============================================================================

-- Crear bucket para almacenar comprobantes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comprobantes', 'comprobantes', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuarios suban archivos
CREATE POLICY "Cualquiera puede subir comprobantes" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'comprobantes');

-- Política para permitir que usuarios vean archivos públicos
CREATE POLICY "Archivos públicos visibles" ON storage.objects
    FOR SELECT USING (bucket_id = 'comprobantes');

-- Política para permitir que admin elimine archivos
CREATE POLICY "Admin puede eliminar archivos" ON storage.objects
    FOR DELETE USING (bucket_id = 'comprobantes');

-- ============================================================================
-- CONFIGURACIÓN DE RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS en la tabla
ALTER TABLE clientes_compras ENABLE ROW LEVEL SECURITY;

-- Política para permitir insertar nuevas compras (público)
CREATE POLICY "Cualquiera puede insertar compras" ON clientes_compras
    FOR INSERT WITH CHECK (true);

-- Política para permitir ver todas las compras (para admin)
CREATE POLICY "Admin puede ver todas las compras" ON clientes_compras
    FOR SELECT USING (true);

-- Política para permitir actualizar compras (para admin)
CREATE POLICY "Admin puede actualizar compras" ON clientes_compras
    FOR UPDATE USING (true);

-- ============================================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- ============================================================================

-- Insertar algunos datos de prueba
INSERT INTO clientes_compras (
    nombre, apellidos, telefono, email, estado, ciudad,
    cantidad_boletos, precio_total, metodo_pago, estado_compra
) VALUES 
(
    'Juan Carlos', 'Pérez García', '+52 55 1234 5678', 'juan.perez@email.com',
    'CDMX', 'Ciudad de México', 5, 45.00, 'Binance Pay', 'confirmada'
),
(
    'María Fernanda', 'López Rodríguez', '+52 33 9876 5432', 'maria.lopez@email.com',
    'Jalisco', 'Guadalajara', 10, 80.00, 'OXXO', 'pendiente'
),
(
    'Carlos Eduardo', 'Martínez Sánchez', '+52 81 5555 1234', 'carlos.martinez@email.com',
    'Nuevo León', 'Monterrey', 25, 187.50, 'Banco Azteca', 'pendiente'
);
```

### 4. Configurar variables de entorno
Actualiza el archivo `.env.local` con tus credenciales reales de Supabase.

### 5. Reiniciar el servidor
```bash
npm run dev
```
