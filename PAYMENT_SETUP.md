# Configuración de Métodos de Pago - Rifa Silverado 2024

Esta guía explica cómo configurar los métodos de pago para desarrollo y producción.

## 🚀 Características Implementadas

### ✅ Sistema de Configuración Dual
- **Desarrollo**: Datos de prueba automáticos
- **Producción**: Configuración via variables de entorno
- **Validación**: Verificación automática de configuración

### ✅ Conversión de Criptomonedas Mejorada
- **API CoinGecko**: Precios en tiempo real
- **Fallback**: Precios aproximados sin conexión
- **Cache**: 5 minutos de caché para performance
- **Monedas soportadas**: USDT, USDC, BTC, ETH, SOL, BNB

### ✅ Interface de Usuario Mejorada
- **Parsing mejorado**: Manejo correcto de detalles de cuenta
- **Copy/Paste**: Botones de copiar optimizados
- **Validación visual**: Indicadores de campos principales
- **Instrucciones claras**: Guías paso a paso

---

## 📋 Configuración para Desarrollo

Los valores de desarrollo ya están configurados en `.env.local`:

```bash
# Métodos de pago para desarrollo (valores de prueba)
NEXT_PUBLIC_BINANCE_EMAIL_DEV=rifadesilverado2024@gmail.com
NEXT_PUBLIC_BANCOPPEL_CARD_DEV=4169 1598 7643 2108
NEXT_PUBLIC_BANCOPPEL_OWNER_DEV=RIFA SILVERADO 2024
NEXT_PUBLIC_BANCOPPEL_CLABE_DEV=137180000123456789
NEXT_PUBLIC_AZTECA_CARD_DEV=5204 8765 4321 0987
NEXT_PUBLIC_AZTECA_OWNER_DEV=RIFA SILVERADO 2024
NEXT_PUBLIC_AZTECA_CLABE_DEV=127180000987654321
NEXT_PUBLIC_OXXO_REF_DEV=RIF-SIL-2024-001
```

---

## 🏭 Configuración para Producción

### 1. Variables de Entorno Requeridas

Para producción, configura estas variables en tu hosting (Netlify, Vercel, etc.):

#### Binance Pay
```bash
NEXT_PUBLIC_BINANCE_EMAIL_PROD=tu-email-binance@real.com
```

#### BanCoppel
```bash
NEXT_PUBLIC_BANCOPPEL_CARD_PROD=1234 5678 9012 3456
NEXT_PUBLIC_BANCOPPEL_OWNER_PROD=NOMBRE REAL DEL TITULAR
NEXT_PUBLIC_BANCOPPEL_CLABE_PROD=123456789012345678
```

#### Banco Azteca
```bash
NEXT_PUBLIC_AZTECA_CARD_PROD=9876 5432 1098 7654
NEXT_PUBLIC_AZTECA_OWNER_PROD=NOMBRE REAL DEL TITULAR
NEXT_PUBLIC_AZTECA_CLABE_PROD=987654321098765432
```

#### OXXO
```bash
NEXT_PUBLIC_OXXO_REF_PROD=TU-REFERENCIA-REAL
```

### 2. Configuración en Netlify

1. Ve a tu dashboard de Netlify
2. Selecciona tu proyecto
3. Ve a **Site Configuration** > **Environment Variables**
4. Agrega cada variable con su valor real

### 3. Configuración en Vercel

1. Ve a tu dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega cada variable con su valor real

---

## 🔧 Validación de Configuración

### Validación Automática

El sistema valida automáticamente la configuración:

```typescript
import { validatePaymentConfig } from '@/lib/config/payment-config';

const validation = validatePaymentConfig();
if (!validation.valid) {
  console.log('Faltan variables:', validation.missing);
}
```

### Indicadores Visuales

- ✅ **Verde**: Configuración completa
- ⚠️ **Amarillo**: Faltan variables de producción
- ❌ **Rojo**: Error en configuración

---

## 💱 Sistema de Conversión Crypto

### Características

- **Tiempo real**: Precios actualizados cada 60 segundos
- **Fallback robusto**: Precios aproximados sin internet
- **Cache inteligente**: 5 minutos de caché por monto
- **Manejo de errores**: Retry automático con backoff

### Monedas Soportadas

| Moneda | Precisión | Recomendación |
|--------|-----------|---------------|
| USDT   | 2 decimales | ⭐ Recomendado |
| USDC   | 2 decimales | ⭐ Recomendado |
| BTC    | 8 decimales | Popular |
| ETH    | 6 decimales | Popular |
| SOL    | 4 decimales | Rápido |
| BNB    | 4 decimales | Binance nativo |

### Uso en Código

```typescript
import { useCryptoConversion } from '@/hooks/useCryptoConversion';

const {
  conversions,
  stablecoins,
  mainCryptos,
  loading,
  error,
  refresh
} = useCryptoConversion(totalPrice, enabled);
```

---

## 🛠️ Troubleshooting

### Problema: Cuentas no se muestran

**Causa**: Variables de entorno mal configuradas o parsing incorrecto

**Solución**:
1. Verifica que las variables estén configuradas
2. Revisa que tengan el formato correcto
3. Reinicia el servidor después de cambiar variables

### Problema: Precios crypto no cargan

**Causa**: API de CoinGecko bloqueada o sin internet

**Solución**:
1. El sistema usa fallback automático
2. Los precios aproximados se muestran
3. Funciona sin conexión

### Problema: Formato de detalles incorrecto

**Causa**: Formato de `accountDetails` en configuración

**Solución**:
```typescript
// Formato correcto:
accountDetails: "Tarjeta: 1234 5678\nTitular: NOMBRE\nCLABE: 123456"

// Formato incorrecto:
accountDetails: "Tarjeta 1234 5678 Titular NOMBRE"
```

---

## 📦 Archivos Relacionados

### Configuración
- `src/lib/config/payment-config.ts` - Configuración principal
- `.env.local` - Variables de entorno
- `.env.production` - Variables de producción

### Hooks
- `src/hooks/useCryptoConversion.ts` - Conversión mejorada
- `src/hooks/useLazyCryptoPrice.ts` - Sistema lazy (legacy)

### Componentes
- `src/components/PurchaseWizard.tsx` - Modal de compra
- Sección "Payment Methods" actualizada

---

## 🔒 Seguridad

### Variables de Entorno
- ✅ Usa `NEXT_PUBLIC_` para datos públicos (cuentas bancarias)
- ❌ NO uses para datos privados (claves privadas)
- ✅ Configura diferentes valores para dev/prod

### Datos Sensibles
- Las cuentas bancarias son públicas por naturaleza
- Los emails de Binance Pay son públicos
- Las referencias OXXO son públicas

### Validación
- Valida formato de datos en runtime
- Maneja errores gracefully
- Fallback a valores por defecto seguros

---

## 🚀 Deploy a Producción

1. **Configura variables de entorno** en tu hosting
2. **Verifica configuración** con `validatePaymentConfig()`
3. **Testea métodos de pago** con valores reales
4. **Documenta cuentas** para tu equipo
5. **Monitorea errores** en producción

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la consola del navegador
2. Verifica variables de entorno
3. Testea en modo desarrollo primero
4. Revisa este documento

**¡El sistema está listo para producción!** 🎉