#!/usr/bin/env node

// ============================================================================
// SCRIPT DE VALIDACIÓN DE VARIABLES DE ENTORNO
// Valida que todas las variables estén configuradas correctamente antes del deploy
// ============================================================================

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function validateUrl(url, name) {
  const errors = [];
  
  if (!url) {
    errors.push(`${name} no está definida`);
    return { isValid: false, errors };
  }
  
  // Verificar formato básico
  if (!url.startsWith('https://')) {
    errors.push(`${name} debe empezar con 'https://'`);
  }
  
  // Verificar trailing slash
  if (url.endsWith('/')) {
    errors.push(`${name} NO debe terminar en '/' (trailing slash)`);
  }
  
  // Verificar que sea de Supabase o localhost
  if (!url.includes('.supabase.co') && !url.includes('localhost')) {
    errors.push(`${name} no parece ser una URL válida de Supabase`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: url
  };
}

function validateJWT(token, name) {
  const errors = [];
  
  if (!token) {
    errors.push(`${name} no está definida`);
    return { isValid: false, errors };
  }
  
  // Verificar formato JWT básico
  if (!token.startsWith('eyJ')) {
    errors.push(`${name} no parece ser un JWT válido (debe empezar con 'eyJ')`);
  }
  
  // Verificar que tenga al menos 3 partes separadas por puntos
  const parts = token.split('.');
  if (parts.length < 3) {
    errors.push(`${name} no tiene el formato JWT correcto (debe tener 3 partes separadas por puntos)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    value: token.substring(0, 20) + '...'
  };
}

async function testSupabaseConnection(url, anonKey) {
  if (!url || !anonKey) {
    return { success: false, error: 'URL o clave no disponibles' };
  }
  
  try {
    // Import dinámico para evitar problemas con ES modules
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey
      },
      timeout: 10000
    });
    
    if (response.ok || response.status === 404) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
  }
}

function checkPackageJsonScripts() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      return { hasValidateScript: false, error: 'package.json no encontrado' };
    }
    
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const hasValidateScript = pkg.scripts && pkg.scripts['validate-env'];
    
    return { hasValidateScript };
  } catch (error) {
    return { hasValidateScript: false, error: error.message };
  }
}

async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🔍 VALIDACIÓN DE VARIABLES DE ENTORNO - SUPABASE', 'bold');
  log('='.repeat(60), 'cyan');
  
  let hasErrors = false;
  const warnings = [];
  
  // 1. Verificar variables requeridas
  log('\n📋 Verificando variables requeridas...', 'blue');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const nodeEnv = process.env.NODE_ENV;
  
  // Validar URL
  const urlValidation = validateUrl(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL');
  if (urlValidation.isValid) {
    log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${urlValidation.value}`, 'green');
  } else {
    hasErrors = true;
    log(`❌ NEXT_PUBLIC_SUPABASE_URL: ERRORES`, 'red');
    urlValidation.errors.forEach(error => {
      log(`   • ${error}`, 'red');
    });
  }
  
  // Validar Anon Key
  const keyValidation = validateJWT(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (keyValidation.isValid) {
    log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${keyValidation.value}`, 'green');
  } else {
    hasErrors = true;
    log(`❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: ERRORES`, 'red');
    keyValidation.errors.forEach(error => {
      log(`   • ${error}`, 'red');
    });
  }
  
  // 2. Verificar variables opcionales
  log('\n📋 Verificando variables opcionales...', 'blue');
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const serviceKeyValidation = validateJWT(process.env.SUPABASE_SERVICE_ROLE_KEY, 'SUPABASE_SERVICE_ROLE_KEY');
    if (serviceKeyValidation.isValid) {
      log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${serviceKeyValidation.value}`, 'green');
    } else {
      warnings.push('SUPABASE_SERVICE_ROLE_KEY tiene formato incorrecto');
      log(`⚠️  SUPABASE_SERVICE_ROLE_KEY: FORMATO INCORRECTO`, 'yellow');
    }
  } else {
    log(`ℹ️  SUPABASE_SERVICE_ROLE_KEY: No configurada (opcional)`, 'cyan');
  }
  
  if (process.env.NEXT_TELEMETRY_DISABLED === '1') {
    log(`✅ NEXT_TELEMETRY_DISABLED: Configurada correctamente`, 'green');
  } else {
    warnings.push('NEXT_TELEMETRY_DISABLED no está configurada');
    log(`⚠️  NEXT_TELEMETRY_DISABLED: No configurada (recomendada)`, 'yellow');
  }
  
  // 3. Test de conexión si las variables son válidas
  if (urlValidation.isValid && keyValidation.isValid) {
    log('\n🌐 Probando conexión a Supabase...', 'blue');
    
    const connectionTest = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    if (connectionTest.success) {
      log(`✅ Conexión a Supabase: EXITOSA`, 'green');
    } else {
      log(`❌ Conexión a Supabase: FALLÓ`, 'red');
      log(`   Error: ${connectionTest.error}`, 'red');
      hasErrors = true;
    }
  }
  
  // 4. Verificar archivos de configuración
  log('\n📁 Verificando archivos de configuración...', 'blue');
  
  // Verificar netlify.toml
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
  if (fs.existsSync(netlifyTomlPath)) {
    log(`✅ netlify.toml: Encontrado`, 'green');
    
    const netlifyContent = fs.readFileSync(netlifyTomlPath, 'utf8');
    if (netlifyContent.includes('NEXT_PUBLIC_SUPABASE_URL') && netlifyContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      log(`✅ netlify.toml: Contiene variables de Supabase`, 'green');
    } else {
      warnings.push('netlify.toml no contiene variables de Supabase');
      log(`⚠️  netlify.toml: No contiene todas las variables de Supabase`, 'yellow');
    }
    
    if (netlifyContent.includes('connect-src') && netlifyContent.includes('.supabase.co')) {
      log(`✅ netlify.toml: CSP configurado para Supabase`, 'green');
    } else {
      hasErrors = true;
      log(`❌ netlify.toml: CSP no incluye dominios de Supabase`, 'red');
    }
  } else {
    hasErrors = true;
    log(`❌ netlify.toml: No encontrado`, 'red');
  }
  
  // Verificar package.json scripts
  const scriptCheck = checkPackageJsonScripts();
  if (scriptCheck.hasValidateScript) {
    log(`✅ package.json: Script validate-env configurado`, 'green');
  } else {
    warnings.push('Script validate-env no está en package.json');
    log(`⚠️  package.json: Script validate-env no encontrado`, 'yellow');
  }
  
  // 5. Información del entorno
  log('\n🔧 Información del entorno:', 'blue');
  log(`   NODE_ENV: ${nodeEnv || 'no definido'}`, 'cyan');
  log(`   Platform: ${process.platform}`, 'cyan');
  log(`   Node version: ${process.version}`, 'cyan');
  log(`   Working directory: ${process.cwd()}`, 'cyan');
  
  // 6. Resumen final
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMEN DE VALIDACIÓN', 'bold');
  log('='.repeat(60), 'cyan');
  
  if (hasErrors) {
    log(`❌ VALIDACIÓN FALLÓ: Se encontraron errores críticos`, 'red');
    log(`   🚫 El deploy probablemente fallará`, 'red');
  } else {
    log(`✅ VALIDACIÓN EXITOSA: Todas las variables críticas están configuradas`, 'green');
    log(`   🚀 El deploy debería funcionar correctamente`, 'green');
  }
  
  if (warnings.length > 0) {
    log(`⚠️  ${warnings.length} advertencia(s):`, 'yellow');
    warnings.forEach(warning => {
      log(`   • ${warning}`, 'yellow');
    });
  }
  
  // 7. Instrucciones para solucionar problemas
  if (hasErrors || warnings.length > 0) {
    log('\n🔧 INSTRUCCIONES PARA SOLUCIONAR PROBLEMAS:', 'magenta');
    log('\n1. Variables de entorno en Netlify:', 'magenta');
    log('   • Ve a tu sitio en Netlify Dashboard', 'magenta');
    log('   • Site settings > Environment variables', 'magenta');
    log('   • Agrega: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY', 'magenta');
    
    log('\n2. Obtener credenciales correctas:', 'magenta');
    log('   • Ve a https://supabase.com > Tu proyecto', 'magenta');
    log('   • Settings > API', 'magenta');
    log('   • Copia URL (sin trailing slash) y anon public key', 'magenta');
    
    log('\n3. Verificar netlify.toml:', 'magenta');
    log('   • Debe incluir variables en [build.environment]', 'magenta');
    log('   • CSP debe permitir tu dominio de Supabase', 'magenta');
    
    log('\n4. Re-deploy después de cambios:', 'magenta');
    log('   • Trigger deploy en Netlify después de cambiar variables', 'magenta');
  }
  
  log('');
  
  // Exit code
  process.exit(hasErrors ? 1 : 0);
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { validateUrl, validateJWT, testSupabaseConnection };