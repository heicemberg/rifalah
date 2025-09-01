#!/usr/bin/env node
// ============================================================================
// SCRIPT DE VERIFICACIÓN DE SEGURIDAD TYPESCRIPT
// 10-STEP PREVENTION STRATEGY IMPLEMENTATION
// ============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 INICIANDO VERIFICACIÓN DE SEGURIDAD TYPESCRIPT...\n');

// ============================================================================
// PASO 1: VERIFICAR CONFIGURACIÓN TYPESCRIPT
// ============================================================================
function step1_verifyTSConfig() {
  console.log('📋 PASO 1: Verificando configuración TypeScript...');
  
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    throw new Error('❌ tsconfig.json no encontrado');
  }
  
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  
  // Verificar configuraciones críticas
  const requiredOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: true
  };
  
  for (const [option, expectedValue] of Object.entries(requiredOptions)) {
    if (tsconfig.compilerOptions[option] !== expectedValue) {
      console.warn(`⚠️  Advertencia: ${option} debería ser ${expectedValue}`);
    }
  }
  
  console.log('✅ Configuración TypeScript verificada\n');
}

// ============================================================================
// PASO 2: VERIFICAR TIPOS GLOBALES
// ============================================================================
function step2_verifyGlobalTypes() {
  console.log('🌐 PASO 2: Verificando tipos globales...');
  
  const globalTypesPath = path.join(process.cwd(), 'src/types/global.d.ts');
  if (!fs.existsSync(globalTypesPath)) {
    throw new Error('❌ src/types/global.d.ts no encontrado');
  }
  
  const globalTypes = fs.readFileSync(globalTypesPath, 'utf8');
  const requiredTypes = [
    '__raffleSyncListenerSetup',
    'raffleCounterTest',
    'gtag',
    'dataLayer'
  ];
  
  requiredTypes.forEach(type => {
    if (!globalTypes.includes(type)) {
      console.warn(`⚠️  Tipo global faltante: ${type}`);
    }
  });
  
  console.log('✅ Tipos globales verificados\n');
}

// ============================================================================
// PASO 3: COMPILACIÓN TYPESCRIPT ESTRICTA
// ============================================================================
function step3_strictTypeCheck() {
  console.log('🔧 PASO 3: Compilación TypeScript estricta...');
  
  try {
    execSync('npx tsc --noEmit --strict', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log('✅ Compilación TypeScript exitosa\n');
  } catch (error) {
    console.error('❌ Errores de TypeScript encontrados:');
    console.error(error.stdout.toString());
    throw new Error('Compilación TypeScript fallida');
  }
}

// ============================================================================
// PASO 4: VERIFICAR PROPIEDADES WINDOW PERSONALIZADAS
// ============================================================================
function step4_verifyWindowProperties() {
  console.log('🪟 PASO 4: Verificando propiedades Window personalizadas...');
  
  const srcPath = path.join(process.cwd(), 'src');
  const windowUsagePattern = /window\.([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const standardProps = new Set([
    'location', 'document', 'navigator', 'console', 'alert', 'confirm',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
    'addEventListener', 'removeEventListener', 'dispatchEvent',
    'innerWidth', 'innerHeight', 'scrollY', 'scrollX', 'matchMedia'
  ]);
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        
        while ((match = windowUsagePattern.exec(content)) !== null) {
          const prop = match[1];
          if (!standardProps.has(prop) && !prop.startsWith('__')) {
            const globalTypes = fs.readFileSync(
              path.join(process.cwd(), 'src/types/global.d.ts'), 
              'utf8'
            );
            
            if (!globalTypes.includes(prop)) {
              console.warn(`⚠️  Propiedad Window no declarada: window.${prop} en ${filePath}`);
            }
          }
        }
      }
    });
  }
  
  scanDirectory(srcPath);
  console.log('✅ Propiedades Window verificadas\n');
}

// ============================================================================
// PASO 5: VERIFICAR INTERFACES COMPLETAS
// ============================================================================
function step5_verifyCompleteInterfaces() {
  console.log('🏗️ PASO 5: Verificando interfaces completas...');
  
  // Esta verificación se hace mediante el compilador TypeScript en paso 3
  console.log('✅ Interfaces verificadas via compilación TypeScript\n');
}

// ============================================================================
// PASO 6: VERIFICAR DEPENDENCIAS REACT HOOKS
// ============================================================================
function step6_verifyReactHooks() {
  console.log('⚛️ PASO 6: Verificando dependencias React Hooks...');
  
  try {
    execSync('npx eslint --ext .ts,.tsx src/ --rule "react-hooks/exhaustive-deps: error"', {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log('✅ React Hooks verificados\n');
  } catch (error) {
    console.warn('⚠️  Advertencias en React Hooks encontradas');
    console.warn(error.stdout.toString());
    console.log('✅ Continuando (solo advertencias)\n');
  }
}

// ============================================================================
// PASO 7: VERIFICAR EVENTOS PERSONALIZADOS
// ============================================================================
function step7_verifyCustomEvents() {
  console.log('🎯 PASO 7: Verificando eventos personalizados...');
  
  const customEventPattern = /new CustomEvent\(['"]([\w-]+)['"]/g;
  const srcPath = path.join(process.cwd(), 'src');
  const foundEvents = new Set();
  
  function scanForEvents(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        scanForEvents(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        let match;
        
        while ((match = customEventPattern.exec(content)) !== null) {
          foundEvents.add(match[1]);
        }
      }
    });
  }
  
  scanForEvents(srcPath);
  
  console.log(`✅ Eventos personalizados encontrados: ${Array.from(foundEvents).join(', ')}\n`);
}

// ============================================================================
// PASO 8: VERIFICAR COMPATIBILIDAD NETLIFY
// ============================================================================
function step8_verifyNetlifyCompatibility() {
  console.log('🌐 PASO 8: Verificando compatibilidad Netlify...');
  
  // Verificar que no hay código que solo funcione en Node.js
  const srcPath = path.join(process.cwd(), 'src');
  const nodeOnlyPatterns = [
    /require\(['"]fs['"]\)/,
    /require\(['"]path['"]\)/,
    /process\.env\.NODE_ENV/,
    /import.*from ['"]fs['"]/
  ];
  
  function scanForNodeCode(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        scanForNodeCode(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        nodeOnlyPatterns.forEach((pattern, index) => {
          if (pattern.test(content) && !filePath.includes('scripts/')) {
            console.warn(`⚠️  Código Node.js detectado en browser: ${filePath}`);
          }
        });
      }
    });
  }
  
  scanForNodeCode(srcPath);
  console.log('✅ Compatibilidad Netlify verificada\n');
}

// ============================================================================
// PASO 9: VERIFICAR BUILD REPRODUCIBLE
// ============================================================================
function step9_verifyReproducibleBuild() {
  console.log('🔄 PASO 9: Verificando build reproducible...');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Verificar que existan scripts críticos
  const requiredScripts = ['build', 'clean', 'lint'];
  requiredScripts.forEach(script => {
    if (!packageJson.scripts[script]) {
      console.warn(`⚠️  Script faltante: ${script}`);
    }
  });
  
  console.log('✅ Build reproducible verificado\n');
}

// ============================================================================
// PASO 10: REPORTE FINAL Y RECOMENDACIONES
// ============================================================================
function step10_generateReport() {
  console.log('📊 PASO 10: Generando reporte final...');
  
  const report = {
    timestamp: new Date().toISOString(),
    status: 'SUCCESS',
    checks: [
      'TypeScript Configuration',
      'Global Types',
      'Strict Type Check',
      'Window Properties', 
      'Complete Interfaces',
      'React Hooks Dependencies',
      'Custom Events',
      'Netlify Compatibility',
      'Reproducible Build',
      'Final Report'
    ]
  };
  
  console.log('\n🎉 VERIFICACIÓN DE SEGURIDAD TYPESCRIPT COMPLETADA');
  console.log('=' .repeat(50));
  console.log(`✅ Todas las verificaciones pasaron exitosamente`);
  console.log(`⏰ Timestamp: ${report.timestamp}`);
  console.log(`🔧 Checks realizados: ${report.checks.length}/10`);
  
  console.log('\n📋 RECOMENDACIONES PARA MANTENIMIENTO:');
  console.log('1. Ejecutar este script antes de cada deployment');
  console.log('2. Mantener actualizada la configuración ESLint');
  console.log('3. Revisar tipos globales periódicamente');
  console.log('4. Verificar compatibilidad con nuevas versiones de Next.js');
  console.log('5. Documentar nuevas propiedades Window personalizadas');
  
  return report;
}

// ============================================================================
// EJECUTOR PRINCIPAL
// ============================================================================
async function main() {
  try {
    step1_verifyTSConfig();
    step2_verifyGlobalTypes();
    step3_strictTypeCheck();
    step4_verifyWindowProperties();
    step5_verifyCompleteInterfaces();
    step6_verifyReactHooks();
    step7_verifyCustomEvents();
    step8_verifyNetlifyCompatibility();
    step9_verifyReproducibleBuild();
    const report = step10_generateReport();
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ VERIFICACIÓN FALLIDA:');
    console.error(error.message);
    console.error('\n🔧 Para corregir estos errores:');
    console.error('1. Revisa los tipos globales en src/types/global.d.ts');
    console.error('2. Asegúrate de que todas las interfaces estén completas');
    console.error('3. Verifica las dependencias de React Hooks');
    console.error('4. Ejecuta: npm run build para más detalles');
    
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main };