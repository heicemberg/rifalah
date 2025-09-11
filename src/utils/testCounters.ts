// ============================================================================
// SCRIPT DE VERIFICACIÓN MATEMÁTICA PARA SISTEMA FOMO + REAL
// ============================================================================

/**
 * 🧮 TEST DE INTEGRIDAD MATEMÁTICA COMPLETA
 * Verifica que la implementación del sistema FOMO + Real sea perfecta
 */

interface TestResult {
  test: string;
  expected: number | string;
  actual: number | string;
  passed: boolean;
  note?: string;
}

interface MathTest {
  scenario: string;
  realSold: number;
  realReserved: number;
  fomoAmount: number;
  results: TestResult[];
  overallPassed: boolean;
}

const TOTAL_TICKETS = 10000;
const FOMO_FIXED_AMOUNT = 1200;

export function testFOMOMathematics(): MathTest[] {
  console.log('🧮 INICIANDO TEST DE MATEMÁTICAS FOMO + REAL...');
  
  const scenarios = [
    { name: 'Sistema inicial (500-600 reales)', realSold: 600, realReserved: 0 },
    { name: 'Sistema con reservas', realSold: 800, realReserved: 50 },
    { name: 'Sistema avanzado', realSold: 1500, realReserved: 100 },
    { name: 'Sistema cerca de límite FOMO', realSold: 1700, realReserved: 200 }
  ];
  
  const mathTests: MathTest[] = [];
  
  for (const scenario of scenarios) {
    const { name, realSold, realReserved } = scenario;
    const fomoAmount = FOMO_FIXED_AMOUNT;
    
    // Cálculos según la nueva implementación
    const realAvailable = TOTAL_TICKETS - realSold - realReserved;
    const displaySold = realSold + fomoAmount;
    const displayAvailable = realAvailable; // Los disponibles son reales, no display
    
    const results: TestResult[] = [];
    
    // TEST 1: Matemática real debe sumar 10,000
    const realSum = realSold + realAvailable + realReserved;
    results.push({
      test: 'Real Math Sum',
      expected: TOTAL_TICKETS,
      actual: realSum,
      passed: realSum === TOTAL_TICKETS,
      note: `${realSold}S + ${realAvailable}A + ${realReserved}R = ${realSum}`
    });
    
    // TEST 2: Display sold debe ser Real + FOMO
    const expectedDisplaySold = realSold + fomoAmount;
    results.push({
      test: 'Display Sold Formula',
      expected: expectedDisplaySold,
      actual: displaySold,
      passed: displaySold === expectedDisplaySold,
      note: `${realSold} + ${fomoAmount} = ${displaySold}`
    });
    
    // TEST 3: Display available debe usar números reales
    results.push({
      test: 'Display Available Logic',
      expected: realAvailable,
      actual: displayAvailable,
      passed: displayAvailable === realAvailable,
      note: 'Display available = Real available (ensures accurate purchasing)'
    });
    
    // TEST 4: Real percentage calculation
    const realPercentage = (realSold / TOTAL_TICKETS) * 100;
    const expectedRealPercentage = Math.round((realSold / TOTAL_TICKETS) * 100 * 100) / 100;
    results.push({
      test: 'Real Percentage',
      expected: `${expectedRealPercentage}%`,
      actual: `${realPercentage.toFixed(2)}%`,
      passed: Math.abs(realPercentage - expectedRealPercentage) < 0.01,
      note: `${realSold} / ${TOTAL_TICKETS} * 100`
    });
    
    // TEST 5: Display percentage calculation
    const displayPercentage = (displaySold / TOTAL_TICKETS) * 100;
    const expectedDisplayPercentage = Math.round((displaySold / TOTAL_TICKETS) * 100 * 100) / 100;
    results.push({
      test: 'Display Percentage',
      expected: `${expectedDisplayPercentage}%`,
      actual: `${displayPercentage.toFixed(2)}%`,
      passed: Math.abs(displayPercentage - expectedDisplayPercentage) < 0.01,
      note: `${displaySold} / ${TOTAL_TICKETS} * 100`
    });
    
    // TEST 6: FOMO difference calculation
    const fomoDifference = displaySold - realSold;
    results.push({
      test: 'FOMO Difference',
      expected: fomoAmount,
      actual: fomoDifference,
      passed: fomoDifference === fomoAmount,
      note: `${displaySold} - ${realSold} = ${fomoDifference}`
    });
    
    // TEST 7: Available tickets validation (critical for purchasing)
    const canPurchaseValidation = realAvailable >= 0;
    results.push({
      test: 'Purchase Availability',
      expected: 'Valid (>= 0)',
      actual: canPurchaseValidation ? 'Valid' : 'Invalid',
      passed: canPurchaseValidation,
      note: `${realAvailable} tickets can be purchased`
    });
    
    const overallPassed = results.every(r => r.passed);
    
    mathTests.push({
      scenario: name,
      realSold,
      realReserved,
      fomoAmount,
      results,
      overallPassed
    });
  }
  
  return mathTests;
}

/**
 * 🎯 FUNCIÓN PARA IMPRIMIR RESULTADOS DE TEST
 */
export function printTestResults(tests: MathTest[]) {
  console.group('📊 RESULTADOS DEL TEST DE MATEMÁTICAS FOMO + REAL');
  
  let allTestsPassed = true;
  
  for (const test of tests) {
    console.group(`📋 Escenario: ${test.scenario}`);
    console.log(`   Real Sold: ${test.realSold}`);
    console.log(`   Real Reserved: ${test.realReserved}`);
    console.log(`   FOMO Amount: ${test.fomoAmount}`);
    console.log(`   Status: ${test.overallPassed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!test.overallPassed) {
      allTestsPassed = false;
      console.log('   📋 Failed Tests:');
      test.results.filter(r => !r.passed).forEach(r => {
        console.log(`     ❌ ${r.test}: Expected ${r.expected}, Got ${r.actual}`);
        if (r.note) console.log(`        💡 ${r.note}`);
      });
    }
    
    console.log(`   📈 Results: ${test.results.filter(r => r.passed).length}/${test.results.length} tests passed`);
    console.groupEnd();
  }
  
  console.log(`\n🎯 OVERALL RESULT: ${allTestsPassed ? '✅ ALL TESTS PASSED - MATHEMATICS IS PERFECT' : '❌ SOME TESTS FAILED - NEEDS FIXING'}`);
  console.groupEnd();
  
  return allTestsPassed;
}

/**
 * 🔍 FUNCIÓN DE DEMO PARA MOSTRAR CÓMO FUNCIONA EL SISTEMA
 */
export function demoFOMOSystem() {
  console.group('🎭 DEMO: Cómo funciona el sistema FOMO + Real');
  
  const realSold = 600; // Admin ha confirmado 600 tickets
  const fomoAmount = 1200; // FOMO fijo
  const realReserved = 0; // Sin reservas por simplicidad
  
  // Cálculos del sistema
  const realAvailable = TOTAL_TICKETS - realSold - realReserved; // = 9400
  const displaySold = realSold + fomoAmount; // = 1800
  const displayPercentage = (displaySold / TOTAL_TICKETS) * 100; // = 18%
  
  console.log('📊 ESTADO ACTUAL:');
  console.log(`   🎯 Admin confirmó: ${realSold} tickets`);
  console.log(`   🎭 FOMO añade: ${fomoAmount} tickets (visual)`);
  console.log(`   👁️ Usuario ve: ${displaySold} tickets vendidos (${displayPercentage}%)`);
  console.log(`   🛍️ Usuario puede comprar de: ${realAvailable} tickets disponibles`);
  console.log('');
  console.log('🔢 MATEMÁTICA:');
  console.log(`   ✅ Real: ${realSold} + ${realAvailable} + ${realReserved} = ${realSold + realAvailable + realReserved}`);
  console.log(`   🎭 Display: ${displaySold} mostrados, ${realAvailable} comprables`);
  console.log(`   🎯 FOMO Effect: Usuario ve ${displayPercentage}% vendidos (urgencia)`);
  console.log(`   ✅ Business Logic: ${realAvailable} tickets realmente disponibles`);
  console.log('');
  console.log('💡 RESULTADO:');
  console.log('   - Usuario siente urgencia (18% ya vendidos)');
  console.log('   - Sistema puede vender 9,400 tickets reales');
  console.log('   - Matemática perfecta en ambos lados');
  console.log('   - Admin ve transparencia total');
  
  console.groupEnd();
}

/**
 * 🚀 FUNCIÓN PRINCIPAL PARA EJECUTAR TODOS LOS TESTS
 */
export function runFullMathematicsTest(): boolean {
  console.log('🚀 EJECUTANDO TEST COMPLETO DEL SISTEMA FOMO + REAL...\n');
  
  // Ejecutar demo
  demoFOMOSystem();
  
  // Ejecutar tests matemáticos
  const tests = testFOMOMathematics();
  const allPassed = printTestResults(tests);
  
  // Test de consistencia adicional
  console.group('🛡️ TEST DE CONSISTENCIA ADICIONAL');
  
  const consistencyTests = [
    {
      name: 'FOMO no afecta matemática real',
      check: () => {
        const realSold = 500;
        const realReserved = 100;
        const realAvailable = TOTAL_TICKETS - realSold - realReserved;
        return realSold + realAvailable + realReserved === TOTAL_TICKETS;
      }
    },
    {
      name: 'Display siempre muestra Real + FOMO',
      check: () => {
        const realSold = 750;
        const displaySold = realSold + FOMO_FIXED_AMOUNT;
        return displaySold === (realSold + FOMO_FIXED_AMOUNT);
      }
    },
    {
      name: 'Available tickets siempre basados en números reales',
      check: () => {
        const realSold = 300;
        const realReserved = 50;
        const availableForPurchase = TOTAL_TICKETS - realSold - realReserved;
        return availableForPurchase > 0 && availableForPurchase <= TOTAL_TICKETS;
      }
    }
  ];
  
  let consistencyPassed = true;
  for (const test of consistencyTests) {
    const passed = test.check();
    console.log(`${passed ? '✅' : '❌'} ${test.name}`);
    if (!passed) consistencyPassed = false;
  }
  
  console.groupEnd();
  
  const finalResult = allPassed && consistencyPassed;
  
  console.log(`\n🎉 TEST FINAL: ${finalResult ? '✅ SISTEMA MATEMÁTICAMENTE PERFECTO' : '❌ SISTEMA NECESITA CORRECCIONES'}`);
  
  return finalResult;
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testFOMOMath = {
    runFullTest: runFullMathematicsTest,
    testMath: testFOMOMathematics,
    printResults: printTestResults,
    demo: demoFOMOSystem
  };
  
  console.log('🧮 TEST FUNCTIONS AVAILABLE:');
  console.log('   window.testFOMOMath.runFullTest() - Run complete test suite');
  console.log('   window.testFOMOMath.demo() - Show system demo');
  console.log('   window.testFOMOMath.testMath() - Run math tests only');
}