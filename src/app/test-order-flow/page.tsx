'use client';

import React, { useState } from 'react';
import OrderFlowDebugger from '../../lib/debug-order-flow';
import toast from 'react-hot-toast';

// ============================================================================
// TEST PAGE FOR ORDER FLOW DEBUGGING
// ============================================================================

export default function TestOrderFlowPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runFullTest = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const orderDebugger = new OrderFlowDebugger();
      const result = await orderDebugger.testCompleteOrderFlow();
      
      setResults(result);
      debugger.printSummary();
      
      if (result.success) {
        toast.success('🎉 Order flow test completed successfully!');
      } else {
        toast.error('❌ Order flow test failed. Check console for details.');
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error(`Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testCounters = async () => {
    try {
      const orderDebugger = new OrderFlowDebugger();
      const result = await debugger.testCounterSync();
      
      if (result.success) {
        toast.success('✅ Counter sync test passed!');
      } else {
        toast.error('❌ Counter sync issues detected. Check console.');
      }
      
      console.log('Counter test result:', result);
    } catch (error) {
      console.error('Counter test failed:', error);
      toast.error('Counter test failed. Check console.');
    }
  };

  const testQuickOrder = async () => {
    toast.loading('Testing quick order submission...');
    
    try {
      // This simulates what happens in ComprehensivePurchaseModal
      console.log('🚀 Testing quick order submission...');
      
      // Test data
      const testOrder = {
        nombre: 'Test',
        apellidos: 'Customer',
        telefono: '+52 55 1234 5678',
        email: 'test@example.com',
        cantidad_boletos: 2,
        precio_total: 398,
        metodo_pago: 'Test Method'
      };
      
      // This would normally go through ComprehensivePurchaseModal.handleSubmit
      console.log('Order data prepared:', testOrder);
      
      // Save to localStorage as backup (same as modal does)
      const comprasAnteriores = JSON.parse(localStorage.getItem('compras-registradas') || '[]');
      const nuevaCompra = {
        ...testOrder,
        id: `test-${Date.now()}`,
        timestamp: Date.now(),
        fecha_compra: new Date().toISOString(),
        estado_compra: 'pendiente',
        source: 'test-submission',
        numeros_boletos: [1234, 5678] // Sample ticket numbers
      };
      
      comprasAnteriores.push(nuevaCompra);
      localStorage.setItem('compras-registradas', JSON.stringify(comprasAnteriores));
      
      console.log('✅ Order saved to localStorage:', nuevaCompra.id);
      toast.success('🎯 Quick order test completed! Check admin panel.', { id: 'loading' });
      
    } catch (error) {
      console.error('Quick order test failed:', error);
      toast.error('❌ Quick order test failed. Check console.', { id: 'loading' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 Order Flow Testing Dashboard
          </h1>
          
          <div className="space-y-6">
            
            {/* Test Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={runFullTest}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isRunning ? '🔄 Testing...' : '🚀 Run Complete Flow Test'}
              </button>
              
              <button
                onClick={testCounters}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🧮 Test Counter Sync
              </button>
              
              <button
                onClick={testQuickOrder}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ⚡ Test Quick Order
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <h3 className="font-bold text-blue-800 mb-2">Testing Instructions:</h3>
              <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
                <li><strong>Complete Flow Test</strong>: Tests full database cycle (Customer → Purchase → Tickets → Admin → Cleanup)</li>
                <li><strong>Counter Sync</strong>: Verifies mathematical consistency of ticket counters</li>
                <li><strong>Quick Order</strong>: Simulates order submission (saves to localStorage for admin testing)</li>
                <li>Check browser console for detailed logs and test results</li>
                <li>Use admin panel (/admin) to see orders and test confirmation flow</li>
              </ol>
            </div>

            {/* Console Access */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded">
              <h3 className="font-bold text-gray-800 mb-2">Console Commands:</h3>
              <div className="text-sm text-gray-600 space-y-1 font-mono">
                <div><code>await testOrderFlow()</code> - Run complete order flow test</div>
                <div><code>await testCounters()</code> - Test counter synchronization</div>
                <div><code>window.__ORDER_FLOW_DEBUGGER__.testCompleteOrderFlow()</code> - Full debugger instance</div>
              </div>
            </div>

            {/* Results Display */}
            {results && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Test Results:</h3>
                
                <div className={`p-4 rounded-lg border-l-4 ${
                  results.success 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-400'
                }`}>
                  <div className={`font-bold ${results.success ? 'text-green-800' : 'text-red-800'}`}>
                    {results.success ? '✅ SUCCESS' : '❌ FAILED'}: {results.summary}
                  </div>
                  
                  {results.tests && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Test Steps:</h4>
                      <div className="space-y-2">
                        {results.tests.map((test: any, index: number) => (
                          <div key={index} className="text-sm flex items-start space-x-2">
                            <span className="flex-shrink-0">
                              {test.status === 'success' ? '✅' : 
                               test.status === 'error' ? '❌' : '⏳'}
                            </span>
                            <div>
                              <span className="font-medium">{test.step}:</span> {test.message}
                              {test.data && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {JSON.stringify(test.data, null, 2)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Quick Links:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <a 
                  href="/" 
                  className="text-blue-600 hover:text-blue-800 text-center block bg-blue-50 py-2 px-4 rounded hover:bg-blue-100 transition-colors"
                >
                  🏠 Home
                </a>
                <a 
                  href="/admin" 
                  className="text-green-600 hover:text-green-800 text-center block bg-green-50 py-2 px-4 rounded hover:bg-green-100 transition-colors"
                >
                  👤 Admin Panel
                </a>
                <a 
                  href="/comprar" 
                  className="text-purple-600 hover:text-purple-800 text-center block bg-purple-50 py-2 px-4 rounded hover:bg-purple-100 transition-colors"
                >
                  🛒 Purchase
                </a>
                <button
                  onClick={() => {
                    console.clear();
                    toast.success('Console cleared!');
                  }}
                  className="text-gray-600 hover:text-gray-800 text-center block bg-gray-50 py-2 px-4 rounded hover:bg-gray-100 transition-colors"
                >
                  🧹 Clear Console
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}