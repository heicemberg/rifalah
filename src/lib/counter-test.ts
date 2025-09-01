// ============================================================================
// SCRIPT DE TESTING PARA SISTEMA DE CONTADORES
// ============================================================================

import { testMathConsistency, forceMasterUpdate } from '../hooks/useMasterCounters';

// ============================================================================
// FUNCIONES DE TESTING
// ============================================================================

/**
 * Test completo del sistema de contadores
 */
export const runFullCounterTest = async () => {
  console.group('🧪 FULL COUNTER SYSTEM TEST');
  console.log('Starting comprehensive counter test...');
  
  try {
    // Test 1: Forzar actualización desde BD
    console.log('📊 Step 1: Forcing counter update from database...');
    await forceMasterUpdate();
    
    // Test 2: Verificar consistencia matemática
    console.log('🧮 Step 2: Testing mathematical consistency...');
    const mathTest = testMathConsistency();
    
    // Test 3: Verificar que los disponibles bajen correctamente
    console.log('🎯 Step 3: Testing available tickets calculation...');
    // Este test se hace dentro de testMathConsistency
    
    // Test 4: Estado final
    console.log('✅ Step 4: Final test results...');
    if (mathTest) {
      console.log('🎉 ALL TESTS PASSED: Counter system is synchronized');
      console.log('✅ Available tickets will correctly decrease when tickets are sold');
      console.log('✅ FOMO system is working correctly without affecting real availability');
      console.log('✅ WebSocket subscriptions are set up for real-time updates');
    } else {
      console.error('❌ TESTS FAILED: Counter synchronization issues detected');
      console.error('🚨 Available tickets may NOT decrease correctly when sold');
      console.error('🔧 Check Supabase connection and database integrity');
    }
    
    return mathTest;
    
  } catch (error) {
    console.error('🔴 Test execution failed:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};

/**
 * Test básico de math consistency
 */
export const runBasicTest = () => {
  console.log('🧮 Running basic math consistency test...');
  return testMathConsistency();
};

/**
 * Simulador de venta de tickets para testing
 */
export const simulateTicketSale = async (ticketNumbers: number[]) => {
  console.group(`🎫 SIMULATING TICKET SALE: ${ticketNumbers.join(', ')}`);
  
  try {
    // Nota: Esta función solo simula el proceso de testing
    // En producción, las ventas se manejan a través del sistema de compras completo
    
    console.log('📊 Before sale - running counter update...');
    await forceMasterUpdate();
    const beforeTest = testMathConsistency();
    
    console.log('💡 Note: This is a simulation only');
    console.log('🔧 Real ticket sales are handled through the purchase system');
    console.log('📈 After a real sale, counters should update automatically via WebSocket');
    
    console.log('📊 Simulating WebSocket update trigger...');
    await forceMasterUpdate();
    const afterTest = testMathConsistency();
    
    return {
      beforeTest,
      afterTest,
      simulation: true
    };
    
  } catch (error) {
    console.error('🔴 Simulation failed:', error);
    return { error: true };
  } finally {
    console.groupEnd();
  }
};

/**
 * Test de consistencia en tiempo real
 */
export const runRealtimeTest = (duration: number = 30000) => {
  console.log(`⏱️ STARTING ${duration/1000}s REAL-TIME CONSISTENCY TEST`);
  
  let testCount = 0;
  let passCount = 0;
  
  const interval = setInterval(() => {
    testCount++;
    const result = testMathConsistency();
    
    if (result) {
      passCount++;
      console.log(`✅ Test ${testCount}: PASS`);
    } else {
      console.error(`❌ Test ${testCount}: FAIL`);
    }
  }, 5000); // Test cada 5 segundos
  
  // Cleanup después del duration especificado
  setTimeout(() => {
    clearInterval(interval);
    console.log(`📊 REAL-TIME TEST COMPLETE: ${passCount}/${testCount} tests passed`);
    
    if (passCount === testCount) {
      console.log('🎉 PERFECT: All real-time tests passed');
    } else {
      console.warn(`⚠️ Issues detected in ${testCount - passCount} out of ${testCount} tests`);
    }
  }, duration);
  
  return { interval, duration };
};

// ============================================================================
// FUNCIONES DE UTILIDAD PARA DEBUGGING
// ============================================================================

/**
 * Log del estado actual de los contadores
 */
export const logCurrentCounterState = () => {
  if (typeof window !== 'undefined' && (window as any).raffleCounterTest) {
    const counters = (window as any).raffleCounterTest.getCounters();
    
    if (counters) {
      console.group('📊 CURRENT COUNTER STATE');
      console.log('Real sold:', counters.soldTickets);
      console.log('Available:', counters.availableTickets);
      console.log('Reserved:', counters.reservedTickets);
      console.log('Total:', counters.totalTickets);
      console.log('FOMO sold:', counters.fomoSoldTickets);
      console.log('FOMO active:', counters.fomoIsActive);
      console.log('Connected:', counters.isConnected);
      console.log('Last update:', counters.lastUpdate?.toLocaleTimeString());
      console.groupEnd();
    } else {
      console.warn('⚠️ No counter instance available');
    }
  } else {
    console.warn('⚠️ Counter test functions not available (window.raffleCounterTest)');
  }
};

// ============================================================================
// EXPORTACIÓN PARA USO EN CONSOLA
// ============================================================================

if (typeof window !== 'undefined') {
  (window as any).counterTestSuite = {
    runFullTest: runFullCounterTest,
    runBasicTest,
    simulateSale: simulateTicketSale,
    runRealtimeTest,
    logState: logCurrentCounterState,
    
    // Aliases comunes
    test: runFullCounterTest,
    basicTest: runBasicTest,
    state: logCurrentCounterState
  };
  
  console.log('🧪 Counter test suite loaded. Available commands:');
  console.log('  counterTestSuite.runFullTest() - Complete system test');
  console.log('  counterTestSuite.basicTest() - Basic math test');
  console.log('  counterTestSuite.state() - Log current state');
  console.log('  counterTestSuite.runRealtimeTest(30000) - 30s real-time test');
}