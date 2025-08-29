# 🎫 Configuración Supabase para Sistema de Rifas

Este documento explica cómo configurar la base de datos Supabase optimizada para tu sistema de rifas con CompactPurchaseModal.

## 📋 Requisitos Previos

1. Cuenta de Supabase (gratis o pro)
2. Proyecto creado en Supabase
3. Variables de entorno configuradas en tu aplicación

## 🚀 Configuración Inicial

### 1. Crear el Schema de Base de Datos

Ejecuta los siguientes archivos SQL en el Editor SQL de Supabase **en este orden**:

1. **Primero**: `supabase-schema.sql` - Crea todas las tablas, índices y funciones básicas
2. **Segundo**: `supabase-functions.sql` - Agrega funciones utilitarias para la aplicación

```sql
-- En el Editor SQL de Supabase, ejecuta:
-- 1. Todo el contenido de supabase-schema.sql
-- 2. Todo el contenido de supabase-functions.sql
```

### 2. Configurar Storage para Comprobantes

En el panel de Supabase Storage:

1. Crear bucket `receipts` con configuración:
   ```
   - Bucket name: receipts
   - Public: false (privado por seguridad)
   - File size limit: 5MB
   - Allowed MIME types: image/*, application/pdf
   ```

2. Configurar políticas RLS para el bucket:
   ```sql
   -- Política para subir comprobantes
   CREATE POLICY "Anyone can upload receipts" ON storage.objects
   FOR INSERT WITH CHECK (bucket_id = 'receipts');
   
   -- Política para ver comprobantes (solo admin)
   CREATE POLICY "Admin can view receipts" ON storage.objects
   FOR SELECT USING (bucket_id = 'receipts' AND auth.role() = 'admin');
   ```

### 3. Variables de Entorno

Agrega a tu archivo `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

## 🔧 Integración con la Aplicación

### 1. Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

### 2. Configurar Cliente Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Usar el Cliente Optimizado

```typescript
// src/hooks/useSupabaseRaffle.ts
import { useSupabaseRaffle } from '../supabase-integration';

export function useRaffleData() {
  return useSupabaseRaffle(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## 💻 Uso en CompactPurchaseModal

### Integración del Modal con Supabase

```typescript
// En CompactPurchaseModal.tsx
import { useSupabaseRaffle } from '../supabase-integration';

const CompactPurchaseModal = ({ isOpen, onClose }) => {
  const { client } = useSupabaseRaffle(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleCompletePurchase = async () => {
    try {
      // Paso 1-3: Crear compra con datos del modal
      const purchaseResult = await client.createCompletePurchase({
        customerInfo,
        selectedOption,
        selectedPayment
      });

      if (!purchaseResult.success) {
        toast.error(purchaseResult.message);
        return;
      }

      // Paso 4: Subir comprobante
      if (uploadedFile && purchaseResult.purchaseId) {
        const uploadResult = await client.uploadReceipt(
          uploadedFile,
          purchaseResult.purchaseId,
          purchaseResult.customerId!
        );

        if (uploadResult.success) {
          await client.processUploadedReceipt({
            purchaseId: purchaseResult.purchaseId,
            customerId: purchaseResult.customerId!,
            file: uploadedFile,
            originalUrl: uploadResult.originalUrl!
          });
        }
      }

      toast.success('¡Compra registrada exitosamente!');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar la compra');
    }
  };
};
```

## 🎯 Funcionalidades Principales

### ✅ Sistema de 4 Pasos del Modal

1. **Paso 1**: Selección de tickets → `step_1_completed = true`
2. **Paso 2**: Datos del cliente → `step_2_completed = true`
3. **Paso 3**: Método de pago → `step_3_completed = true`
4. **Paso 4**: Subir comprobante → `step_4_completed = true`

### ✅ Gestión de Tickets

- **Reserva Automática**: Tickets se reservan por 30 minutos
- **Liberación Automática**: Reservas expiradas se liberan automáticamente
- **Estados**: available → reserved → sold
- **Sin Conflictos**: Sistema previene compra de tickets ocupados

### ✅ Clientes Recurrentes

- **Detección Automática**: Por email o WhatsApp
- **Puntos de Lealtad**: 1 punto por cada $10 gastados
- **Historial Completo**: Todas las compras anteriores
- **Actualizaciones Automáticas**: Estadísticas se actualizan con cada compra

### ✅ Sistema OCR de Comprobantes

- **Subida Automática**: A Supabase Storage con compresión
- **Procesamiento OCR**: Extracción automática de texto
- **Datos Parseados**: Monto, fecha, referencia, banco
- **Estados Múltiples**: pending → processing → verified/rejected

### ✅ Tiempo Real (Real-time)

- **WebSocket**: Actualizaciones instantáneas de tickets
- **FOMO**: Actividades en vivo para crear urgencia
- **Admin Live**: Notificaciones en tiempo real para admin
- **Sincronización**: Estado siempre actualizado

## 📊 Panel de Administración

### Consultas Útiles para Admin

```sql
-- Ver compras pendientes
SELECT * FROM get_pending_verifications(50);

-- Ver estadísticas en tiempo real
SELECT * FROM get_raffle_stats();

-- Ver actividades recientes
SELECT * FROM get_recent_activities(10);

-- Aprobar compra
SELECT approve_purchase(
  'purchase-uuid-here',
  'admin@empresa.com',
  'Comprobante verificado'
);

-- Rechazar comprobante
SELECT reject_receipt(
  'receipt-uuid-here',
  'admin@empresa.com',
  'Comprobante ilegible'
);
```

### Vistas Útiles Creadas

1. `raffle_stats` - Estadísticas en tiempo real
2. `pending_verifications` - Compras pendientes
3. `recurring_customers` - Clientes frecuentes

## 🔧 Mantenimiento Automático

El sistema incluye funciones de mantenimiento automático:

```sql
-- Ejecutar limpieza (recomendado cada hora)
SELECT * FROM maintenance_cleanup();

-- Liberar reservas expiradas manualmente
SELECT release_expired_reservations();

-- Limpiar actividades viejas
SELECT cleanup_old_activities();
```

## 🛡️ Seguridad (RLS Configurado)

- **Row Level Security** habilitado en todas las tablas
- **Políticas de Acceso** configuradas para lectura pública segura
- **Storage Privado** para comprobantes sensibles
- **Logs de Admin** para auditoría completa

## 📈 Optimizaciones Incluidas

### Índices Principales

- `idx_tickets_status_number` - Búsqueda rápida de tickets
- `idx_customers_email` - Búsqueda por email
- `idx_purchases_status_created` - Compras por estado y fecha
- `idx_receipts_status_uploaded` - Comprobantes por verificar

### Triggers Automáticos

- **updated_at**: Se actualiza automáticamente en todas las tablas
- **customer_stats**: Estadísticas de cliente se actualizan automáticamente
- **ticket_cleanup**: Limpieza automática de reservas expiradas

### Funciones Optimizadas

- **get_real_available_tickets()**: Solo tickets realmente disponibles
- **reserve_random_tickets()**: Reserva inteligente sin conflictos
- **create_complete_purchase()**: Transacción atómica completa

## 🚀 Despliegue en Producción

### 1. Configurar Webhooks (Opcional)

Para procesamiento OCR automático:

```typescript
// API route: /api/webhooks/process-ocr
export async function POST(request: Request) {
  const { receiptId, ocrText, confidence } = await request.json();
  
  const client = new SupabaseRaffleClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  await client.supabase.rpc('update_receipt_ocr_data', {
    p_receipt_id: receiptId,
    p_ocr_text: ocrText,
    p_ocr_confidence: confidence
  });
}
```

### 2. Configurar Cron Jobs

Para mantenimiento automático:

```typescript
// API route: /api/cron/maintenance
export async function GET() {
  const client = new SupabaseRaffleClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const results = await client.runMaintenance();
  return Response.json(results);
}
```

### 3. Monitoreo

Métricas importantes a monitorear:

- Tickets disponibles vs reservados
- Compras pendientes de verificación
- Tiempo promedio de procesamiento
- Tasa de aprobación de comprobantes

## ✅ Checklist de Configuración

- [ ] Esquema SQL ejecutado correctamente
- [ ] Funciones SQL creadas
- [ ] Bucket 'receipts' configurado
- [ ] Variables de entorno configuradas
- [ ] RLS habilitado y políticas creadas
- [ ] Cliente TypeScript integrado
- [ ] CompactPurchaseModal conectado
- [ ] Suscripciones real-time funcionando
- [ ] Sistema de mantenimiento configurado

## 🆘 Troubleshooting

### Error: "relation does not exist"

```bash
# Verificar que el esquema se ejecutó correctamente
psql -h your-host -d your-db -c "\dt"
```

### Error: "RLS policy prevents access"

```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'tickets';
```

### Error: "Storage bucket not found"

```bash
# Verificar bucket en Supabase Dashboard > Storage
```

## 📞 Soporte

Si encuentras algún problema:

1. Verificar logs en Supabase Dashboard
2. Revisar variables de entorno
3. Comprobar políticas RLS
4. Validar permisos de Storage

¡El sistema está optimizado para que las personas siempre puedan comprar sin errores! 🎯