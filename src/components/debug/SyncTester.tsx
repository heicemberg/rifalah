'use client';

import React, { useState } from 'react';
import { useMasterCounters, forceMasterUpdate, testMathConsistency } from '../../hooks/useMasterCounters';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS
// ============================================================================

interface TestResult {
  test: string;
  details: string;
  success: boolean;
  timestamp: Date;
}

// ============================================================================
// COMPONENTE DE TESTING DE SINCRONIZACIÓN
// ============================================================================

export default function SyncTester() {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const masterCounters = useMasterCounters();

  const runSyncTest = async () => {
    console.log('🧪 INICIANDO SYNC TEST COMPLETO...');
    toast.loading('Ejecutando test de sincronización...');

    const results: TestResult[] = [];

    try {
      // Test 1: Verificar matemática básica
      console.log('📊 Test 1: Verificación matemática');
      const mathTest = testMathConsistency();
      results.push({
        test: 'Matemática básica',
        success: mathTest,
        details: `${masterCounters.soldTickets} + ${masterCounters.availableTickets} + ${masterCounters.reservedTickets} = ${masterCounters.soldTickets + masterCounters.availableTickets + masterCounters.reservedTickets}`,
        timestamp: new Date()
      });

      // Test 2: Force update manual
      console.log('🔄 Test 2: Force update manual');
      await forceMasterUpdate();
      results.push({
        test: 'Force update manual',
        success: true,
        details: `Última actualización: ${new Date().toLocaleTimeString()}`,
        timestamp: new Date()
      });

      // Test 3: Global event dispatch
      console.log('🔔 Test 3: Event dispatch global');
      window.dispatchEvent(new CustomEvent('raffle-counters-updated', {
        detail: { 
          source: 'sync-test',
          timestamp: new Date().toISOString()
        }
      }));
      results.push({
        test: 'Event dispatch global',
        success: true,
        details: 'Evento disparado correctamente',
        timestamp: new Date()
      });

      // Test 4: Verificar FOMO consistency
      console.log('🎭 Test 4: FOMO consistency');
      const fomoTest = masterCounters.fomoSoldTickets >= masterCounters.soldTickets;
      results.push({
        test: 'FOMO consistency',
        success: fomoTest,
        details: `FOMO: ${masterCounters.fomoSoldTickets} >= Real: ${masterCounters.soldTickets}`,
        timestamp: new Date()
      });

      // Test 5: WebSocket connection
      console.log('📡 Test 5: WebSocket status');
      results.push({
        test: 'WebSocket connection',
        success: masterCounters.isConnected,
        details: masterCounters.isConnected ? 'Conectado' : 'Desconectado',
        timestamp: new Date()
      });

      // Test 6: Data freshness
      console.log('⏰ Test 6: Data freshness');
      const now = new Date();
      const lastUpdate = masterCounters.lastUpdate;
      const timeDiff = now.getTime() - lastUpdate.getTime();
      const isFresh = timeDiff < 60000; // Less than 1 minute
      results.push({
        test: 'Data freshness',
        success: isFresh,
        details: `Última actualización hace ${Math.floor(timeDiff / 1000)} segundos`,
        timestamp: new Date()
      });

      setTestResults(results);
      
      const successCount = results.filter(r => r.success).length;
      const totalTests = results.length;
      
      if (successCount === totalTests) {
        toast.success(`✅ Todos los tests pasaron (${successCount}/${totalTests})`);
        console.log('🎉 SYNC TEST COMPLETADO: Todos los tests exitosos');
      } else {
        toast.error(`❌ ${totalTests - successCount} tests fallaron (${successCount}/${totalTests})`);
        console.error(`❌ SYNC TEST FALLÓ: ${totalTests - successCount} tests fallaron`);
      }

    } catch (error) {
      console.error('❌ Error durante sync test:', error);
      toast.error('Error durante el test de sincronización');
      results.push({
        test: 'Test execution',
        success: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      });
      setTestResults(results);
    }
  };

  const runBenchmarkTest = async () => {
    console.log('⚡ INICIANDO BENCHMARK TEST...');
    toast.loading('Ejecutando benchmark de performance...');

    const iterations = 10;
    const times: number[] = [];

    try {
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await forceMasterUpdate();
        const endTime = performance.now();
        times.push(endTime - startTime);
        
        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      console.log(`⚡ BENCHMARK RESULTS:`);
      console.log(`   Average: ${avgTime.toFixed(2)}ms`);
      console.log(`   Min: ${minTime.toFixed(2)}ms`);
      console.log(`   Max: ${maxTime.toFixed(2)}ms`);

      toast.success(`⚡ Benchmark: ${avgTime.toFixed(1)}ms avg (${minTime.toFixed(1)}-${maxTime.toFixed(1)}ms)`);

    } catch (error) {
      console.error('❌ Error durante benchmark:', error);
      toast.error('Error durante el benchmark');
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-16 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 shadow-lg"
        >
          🧪 Sync Test
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 right-4 w-96 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">🧪 Sync Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 font-bold"
        >
          ×
        </button>
      </div>

      {/* Current Status */}
      <div className="p-3 border-b bg-gray-50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Status:</span>
            <span className={`ml-1 font-medium ${masterCounters.isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {masterCounters.isConnected ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Loading:</span>
            <span className={`ml-1 font-medium ${masterCounters.isLoading ? 'text-orange-600' : 'text-green-600'}`}>
              {masterCounters.isLoading ? '⏳ Yes' : '✅ No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Real:</span>
            <span className="ml-1 font-mono text-green-600">{masterCounters.soldTickets}</span>
          </div>
          <div>
            <span className="text-gray-600">FOMO:</span>
            <span className="ml-1 font-mono text-blue-600">
              {masterCounters.fomoSoldTickets} ({masterCounters.fomoIsActive ? 'ON' : 'OFF'})
            </span>
          </div>
          <div>
            <span className="text-gray-600">Available:</span>
            <span className="ml-1 font-mono text-purple-600">{masterCounters.availableTickets}</span>
          </div>
          <div>
            <span className="text-gray-600">Reserved:</span>
            <span className="ml-1 font-mono text-orange-600">{masterCounters.reservedTickets}</span>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="max-h-32 overflow-y-auto border-b">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-2 border-b last:border-b-0 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium">{result.test}</div>
                  <div className="text-xs text-gray-600">{result.details}</div>
                </div>
                <div className="text-sm">
                  {result.success ? '✅' : '❌'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="p-2 bg-gray-50 flex gap-2 flex-wrap">
        <button
          onClick={runSyncTest}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          🧪 Full Test
        </button>
        <button
          onClick={runBenchmarkTest}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          ⚡ Benchmark
        </button>
        <button
          onClick={() => forceMasterUpdate()}
          className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600"
        >
          🔄 Force Update
        </button>
        <button
          onClick={() => setTestResults([])}
          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>
    </div>
  );
}