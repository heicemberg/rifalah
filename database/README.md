# Base de Datos - Rifa Silverado Z71 2024

## Configuración Inicial

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Configura tu contraseña y región
3. Espera a que se inicialice el proyecto

### 2. Configurar Variables de Entorno
1. Copia `.env.example` a `.env.local`
2. Ve a Settings > API en tu proyecto Supabase
3. Copia la URL del proyecto y la clave `anon/public`
4. Pega los valores en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_del_proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
```

### 3. Crear las Tablas
Las tablas ya están creadas según tu esquema:

- `customers` - Información de clientes
- `purchases` - Compras realizadas
- `tickets` - Todos los boletos (1-10000)

### 4. Inicializar Tickets
Ejecuta el script `init-tickets.sql` en el SQL Editor de Supabase:

1. Ve a SQL Editor en tu dashboard de Supabase
2. Copia el contenido completo de `init-tickets.sql`
3. Pégalo y ejecuta
4. Verifica que se crearon 10,000 tickets

## Configuración de Storage (Opcional)

Para subir comprobantes de pago:

1. Ve a Storage en Supabase
2. Crea un bucket llamado `comprobantes`
3. Configura las políticas de acceso según necesites

## Estructura de la Base de Datos

### Tabla `customers`
```sql
- id (uuid, primary key)
- name (text)
- email (text, unique)
- phone (text)
- city (text)
- state (text)
- created_at (timestamp)
```

### Tabla `purchases`
```sql
- id (uuid, primary key)
- customer_id (uuid, foreign key)
- total_amount (numeric)
- unit_price (numeric)
- discount_applied (integer, 0-100)
- payment_method (text)
- payment_reference (text)
- payment_proof_url (text)
- status ('pendiente' | 'confirmada' | 'cancelada')
- verified_at (timestamp)
- verified_by (text)
- notes (text)
- browser_info (text)
- device_info (text)
- ip_address (inet)
- user_agent (text)
- created_at (timestamp)
```

### Tabla `tickets`
```sql
- id (uuid, primary key)
- number (integer, unique, 1-10000)
- status ('disponible' | 'reservado' | 'vendido')
- customer_id (uuid, foreign key, nullable)
- purchase_id (uuid, foreign key, nullable)
- reserved_at (timestamp, nullable)
- sold_at (timestamp, nullable)
- created_at (timestamp)
```

## Funciones Automáticas

El sistema incluye:

- **Sistema FOMO**: Muestra 8-18% de tickets vendidos visualmente
- **Reservas temporales**: Tickets reservados por 30 minutos
- **Sincronización en tiempo real**: Updates automáticos via websockets
- **Asignación automática**: Números asignados al confirmar compra

## Seguridad

- Row Level Security (RLS) configurado
- Políticas de acceso para usuarios anónimos
- Validaciones de integridad de datos
- Índices optimizados para performance

## Monitoreo

El admin panel muestra:
- Estado de conexión con Supabase
- Porcentaje FOMO actual
- Estadísticas en tiempo real
- Gestión de compras y tickets