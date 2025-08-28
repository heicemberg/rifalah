#!/usr/bin/env node

/**
 * SCRIPT DE DIAGNÓSTICO NETLIFY - RIFA SILVERADO Z71 2024
 * 
 * Identifica problemas comunes de conexión Supabase en Netlify
 * Ejecutar: node scripts/diagnose-netlify.js
 */

console.log('🔍 DIAGNÓSTICO NETLIFY - RIFA SILVERADO Z71 2024');
console.log('='.repeat(60));

// 1. VERIFICAR VARIABLES DE ENTORNO
console.log('\n1️⃣ VERIFICANDO VARIABLES DE ENTORNO:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('✓ NODE_ENV:', process.env.NODE_ENV);
console.log('✓ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ NO DEFINIDA');
console.log('✓ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ NO DEFINIDA');

// 2. VALIDAR FORMATO DE CREDENCIALES
console.log('\n2️⃣ VALIDANDO FORMATO DE CREDENCIALES:');
try {
  if (!supabaseUrl) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL no está definida');
  } else if (!supabaseUrl.includes('.supabase.co') && !supabaseUrl.includes('localhost')) {
    console.log('❌ URL de Supabase inválida:', supabaseUrl);
  } else {
    console.log('✅ URL de Supabase válida');
  }

  if (!supabaseKey) {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
  } else if (!supabaseKey.startsWith('eyJ')) {
    console.log('❌ Clave anónima no es un JWT válido');
  } else {
    console.log('✅ Clave anónima válida');
  }
} catch (error) {
  console.log('❌ Error validando credenciales:', error.message);
}

// 3. PROBAR CONEXIÓN DIRECTA
console.log('\n3️⃣ PROBANDO CONEXIÓN DIRECTA:');
if (supabaseUrl && supabaseKey && typeof fetch !== 'undefined') {
  try {
    console.log('🔄 Intentando conectar a Supabase...');
    
    fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10s timeout
    })
    .then(response => {
      if (response.ok) {
        console.log('✅ Conexión exitosa a Supabase');
        return response.json();
      } else {
        console.log('❌ Error HTTP:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}`);
      }
    })
    .then(data => {
      console.log('✅ Respuesta de Supabase recibida');
    })
    .catch(error => {
      console.log('❌ Error de conexión:', error.message);
      
      // Diagnóstico específico de errores
      if (error.message.includes('timeout')) {
        console.log('💡 SOLUCIÓN: El timeout sugiere problemas de red o CSP');
      } else if (error.message.includes('CORS')) {
        console.log('💡 SOLUCIÓN: Error de CORS - verifica dominios en Supabase');
      } else if (error.message.includes('403')) {
        console.log('💡 SOLUCIÓN: Error 403 - verifica RLS y permisos');
      } else if (error.message.includes('401')) {
        console.log('💡 SOLUCIÓN: Error 401 - verifica la clave API');
      }
    });
    
  } catch (error) {
    console.log('❌ Error configurando test de conexión:', error.message);
  }
} else {
  console.log('⏭️ Saltando test de conexión (faltan credenciales o fetch no disponible)');
}

// 4. INFORMACIÓN DEL ENTORNO
console.log('\n4️⃣ INFORMACIÓN DEL ENTORNO:');
console.log('✓ Platform:', process.platform);
console.log('✓ Node Version:', process.version);
console.log('✓ Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
console.log('✓ User Agent:', typeof navigator !== 'undefined' ? navigator.userAgent?.substring(0, 50) : 'N/A (Server)');

// 5. RECOMENDACIONES
console.log('\n5️⃣ RECOMENDACIONES PARA NETLIFY:');
console.log(`
🔧 PASOS PARA SOLUCIONAR EN NETLIFY:

1. **Variables de Entorno en Netlify UI:**
   - Ve a: Site Settings > Environment Variables
   - Agrega: NEXT_PUBLIC_SUPABASE_URL = ${supabaseUrl || 'https://tu-proyecto.supabase.co'}
   - Agrega: NEXT_PUBLIC_SUPABASE_ANON_KEY = ${supabaseKey ? '(tu clave actual)' : '(tu clave de Supabase)'}

2. **Verificar CSP en Headers:**
   - Revisa netlify.toml > Content-Security-Policy
   - Debe incluir: connect-src 'self' https://*.supabase.co wss://*.supabase.co

3. **Verificar Build Command:**
   - Build command: npm run build
   - Publish directory: dist

4. **Después de cambios:**
   - Haz un nuevo deploy (no solo republish)
   - Verifica logs de deploy en Netlify
   - Prueba en modo incógnito

5. **Si persiste el error:**
   - Agrega console.log en src/lib/supabase-client.ts
   - Revisa Function logs en Netlify
   - Verifica que no hay Edge Functions interferiendo
`);

console.log('\n' + '='.repeat(60));
console.log('🏁 DIAGNÓSTICO COMPLETADO');

// Export para usar en otros scripts
module.exports = {
  checkEnvironment: () => ({ supabaseUrl, supabaseKey }),
  testConnection: async () => {
    // Implementación del test para uso programático
  }
};