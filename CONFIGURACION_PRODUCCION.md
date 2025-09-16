# 🚀 CONFIGURACIÓN PARA PRODUCCIÓN - RIFA SILVERADO

## 📋 CHECKLIST DE CONFIGURACIÓN

### ✅ **PASO 1: Variables de Entorno**

Configura estas variables en tu plataforma de hosting (Netlify/Vercel):

```bash
# ============================================================================
# BINANCE PAY - PRODUCCIÓN
# ============================================================================
NEXT_PUBLIC_BINANCE_EMAIL_PROD=tu-email-real@binance.com

# ============================================================================
# BANCOPPEL - PRODUCCIÓN
# ============================================================================
NEXT_PUBLIC_BANCOPPEL_CARD_PROD=1234 5678 9012 3456
NEXT_PUBLIC_BANCOPPEL_OWNER_PROD=TU NOMBRE REAL
NEXT_PUBLIC_BANCOPPEL_CLABE_PROD=137180000123456789

# ============================================================================
# BANCO AZTECA - PRODUCCIÓN
# ============================================================================
NEXT_PUBLIC_AZTECA_CARD_PROD=5204 8765 4321 0987
NEXT_PUBLIC_AZTECA_OWNER_PROD=TU NOMBRE REAL
NEXT_PUBLIC_AZTECA_CLABE_PROD=127180000987654321

# ============================================================================
# OXXO - PRODUCCIÓN
# ============================================================================
NEXT_PUBLIC_OXXO_REF_PROD=RIF-TU-REF-2024

# ============================================================================
# WALLETS CRYPTO - PRODUCCIÓN (OPCIONALES)
# ============================================================================
NEXT_PUBLIC_BTC_WALLET_PROD=tu-wallet-bitcoin
NEXT_PUBLIC_ETH_WALLET_PROD=tu-wallet-ethereum
NEXT_PUBLIC_USDT_WALLET_PROD=tu-wallet-usdt
NEXT_PUBLIC_USDC_WALLET_PROD=tu-wallet-usdc
NEXT_PUBLIC_SOL_WALLET_PROD=tu-wallet-solana

# ============================================================================
# SUPABASE - PRODUCCIÓN
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### ✅ **PASO 2: Configuración en Netlify**

1. **Ve a tu sitio en Netlify Dashboard**
2. **Settings → Environment Variables**
3. **Add Variable** para cada una de las variables arriba
4. **Redeploy** el sitio

### ✅ **PASO 3: Configuración en Vercel**

1. **Ve a tu proyecto en Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Add** cada variable con valor de producción
4. **Environment**: Selecciona "Production"
5. **Redeploy** desde dashboard

---

## 🏦 GUÍA DE MÉTODOS DE PAGO

### **1. BINANCE PAY**
```
✅ QUÉ NECESITAS:
- Cuenta Binance verificada
- Email asociado a tu cuenta
- Asegurar que tengas P2P habilitado

✅ CÓMO CONFIGURAR:
NEXT_PUBLIC_BINANCE_EMAIL_PROD=tu-email@binance.com
```

### **2. BANCOPPEL**
```
✅ QUÉ NECESITAS:
- Tarjeta de débito BanCoppel
- CLABE interbancaria
- Nombre del titular

✅ CÓMO CONFIGURAR:
NEXT_PUBLIC_BANCOPPEL_CARD_PROD=1234 5678 9012 3456
NEXT_PUBLIC_BANCOPPEL_OWNER_PROD=JUAN PEREZ GOMEZ
NEXT_PUBLIC_BANCOPPEL_CLABE_PROD=137180000123456789
```

### **3. BANCO AZTECA**
```
✅ QUÉ NECESITAS:
- Tarjeta de débito Banco Azteca
- CLABE interbancaria
- Nombre del titular

✅ CÓMO CONFIGURAR:
NEXT_PUBLIC_AZTECA_CARD_PROD=5204 8765 4321 0987
NEXT_PUBLIC_AZTECA_OWNER_PROD=JUAN PEREZ GOMEZ
NEXT_PUBLIC_AZTECA_CLABE_PROD=127180000987654321
```

### **4. OXXO**
```
✅ QUÉ NECESITAS:
- Referencia personalizada única
- Preferiblemente tu nombre/empresa

✅ CÓMO CONFIGURAR:
NEXT_PUBLIC_OXXO_REF_PROD=RIF-JUAN-2024-001
```

### **5. WALLETS CRYPTO (OPCIONAL)**
```
✅ QUÉ NECESITAS:
- Wallets en exchanges confiables
- Preferiblemente Binance, Coinbase, etc.

✅ CÓMO CONFIGURAR:
NEXT_PUBLIC_BTC_WALLET_PROD=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
NEXT_PUBLIC_ETH_WALLET_PROD=0x742d35Cc6084C2532f9429C7f5aE63bcB3a18aC
# ... etc
```

---

## 🛡️ VALIDACIÓN DE CONFIGURACIÓN

### **Herramienta de Validación Incluida**

El proyecto incluye un validador automático. Para usarlo:

1. **En desarrollo**: Componente `PaymentValidator` muestra estado
2. **En producción**: Checa variables en tiempo real
3. **Debugging**: Console.log con detalles de configuración

### **Comandos de Verificación**

```bash
# Verificar variables locales
npm run dev
# Ve a /comprar y verifica que todos los métodos aparezcan

# Verificar build de producción
npm run build
npm start
# Ve a /comprar y verifica configuración
```

---

## 🔄 PROCESO DE MIGRACIÓN A PRODUCCIÓN

### **Opción 1: Variables de Entorno (RECOMENDADO)**
```bash
# 1. En Netlify/Vercel, configura todas las variables _PROD
# 2. Deploy automáticamente usará configuración de producción
# 3. No necesitas cambiar código
```

### **Opción 2: Archivo de Configuración**
```bash
# 1. Edita src/lib/config/payment-config.ts
# 2. Cambia valores directamente en PRODUCTION_CONFIG
# 3. Commit y deploy
```

---

## ⚠️ CHECKLIST ANTES DE LANZAR

### **Configuración**
- [ ] Todas las variables _PROD configuradas
- [ ] Supabase configurado con datos reales
- [ ] PaymentValidator sin errores
- [ ] Build de producción exitoso

### **Métodos de Pago**
- [ ] Binance Pay funcional
- [ ] BanCoppel validado
- [ ] Banco Azteca validado
- [ ] OXXO configurado
- [ ] Wallets crypto (si aplica)

### **Testing**
- [ ] Flujo completo probado en staging
- [ ] Conversión crypto funcionando
- [ ] Upload de comprobantes OK
- [ ] Emails/notifications configurados

### **Seguridad**
- [ ] Variables sensibles no en código
- [ ] SSL habilitado
- [ ] CORS configurado
- [ ] Rate limiting en API

---

## 🚨 TROUBLESHOOTING

### **"Métodos de pago no aparecen"**
```
✅ SOLUCIÓN:
1. Verifica NODE_ENV=production en deployment
2. Checa que variables _PROD estén configuradas
3. Ve console.log para errores de configuración
```

### **"Precios crypto no cargan"**
```
✅ SOLUCIÓN:
1. CoinGecko API puede tener rate limits
2. Usa precios fallback incluidos
3. Verifica conexión a internet
```

### **"Binance no muestra email"**
```
✅ SOLUCIÓN:
1. Verifica NEXT_PUBLIC_BINANCE_EMAIL_PROD
2. Asegurar que email sea válido
3. Checa que Binance P2P esté habilitado
```

---

## 📞 SOPORTE

Si tienes problemas:

1. **Revisa console.log** en browser developer tools
2. **Usa PaymentValidator** para debugging
3. **Verifica variables** en platform dashboard
4. **Testing local** con NODE_ENV=production

**¡El sistema está optimizado para migración de desarrollo a producción en menos de 10 minutos!** 🚀