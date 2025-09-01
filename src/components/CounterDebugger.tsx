'use client';

import React, { useState } from 'react';
import { useMasterCounters, testMathConsistency, forceMasterUpdate } from '../hooks/useMasterCounters';
import { useDisplayStats, useAdminCounters } from '../hooks/useMasterCounters';

// ============================================================================
// COMPONENTE DE DEBUG PARA CONTADORES
// ============================================================================

export const CounterDebugger: React.FC<{ 
  show?: boolean;
  className?: string; 
}> = ({ 
  show = false, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  
  const masterCounters = useMasterCounters();
  const displayStats = useDisplayStats();
  const adminCounters = useAdminCounters();

  const runTest = () => {
    console.log('🧪 RUNNING COUNTER TEST FROM DEBUG COMPONENT...');
    const result = testMathConsistency();
    setTestResults(result ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED - Check console');
    
    // También usar el test global si está disponible
    if (typeof window !== 'undefined' && (window as any).raffleCounterTest) {
      (window as any).raffleCounterTest.runFullTest();
    }
  };

  const forceUpdate = async () => {
    console.log('🔄 FORCING UPDATE FROM DEBUG COMPONENT...');
    await forceMasterUpdate();
    setTestResults('🔄 UPDATE COMPLETED - Check console for details');
  };

  if (!show) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="bg-blue-600 px-4 py-2 cursor-pointer flex justify-between items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="font-bold text-sm">🔧 Counter Debugger</span>
          <span className="text-xs">{isExpanded ? '▼' : '▲'}</span>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 space-y-4 max-w-md">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-green-400">Real Sold:</div>
                <div>{masterCounters.soldTickets.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-blue-400">Available:</div>
                <div>{masterCounters.availableTickets.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-orange-400">Reserved:</div>
                <div>{masterCounters.reservedTickets.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-purple-400">FOMO Sold:</div>
                <div>{masterCounters.fomoSoldTickets.toLocaleString()}</div>
              </div>
            </div>

            {/* Math Check */}
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-300 mb-1">Math Check:</div>
              <div className="text-xs font-mono">
                {masterCounters.soldTickets} + {masterCounters.availableTickets} + {masterCounters.reservedTickets} = {' '}
                {masterCounters.soldTickets + masterCounters.availableTickets + masterCounters.reservedTickets}
                <span className={
                  (masterCounters.soldTickets + masterCounters.availableTickets + masterCounters.reservedTickets) === masterCounters.totalTickets
                    ? ' text-green-400'
                    : ' text-red-400 font-bold'
                }>
                  {' '}({(masterCounters.soldTickets + masterCounters.availableTickets + masterCounters.reservedTickets) === masterCounters.totalTickets ? '✅' : '❌'})
                </span>
              </div>
            </div>

            {/* FOMO Status */}
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-300 mb-1">FOMO Status:</div>
              <div className="text-xs">
                <span className={masterCounters.fomoIsActive ? 'text-yellow-400' : 'text-gray-400'}>
                  {masterCounters.fomoIsActive ? '🎭 ACTIVE' : '😴 INACTIVE'}
                </span>
                <span className="text-gray-400 ml-2">
                  (+{masterCounters.fomoSoldTickets - masterCounters.soldTickets} fake)
                </span>
              </div>
            </div>

            {/* Connection Status */}
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-300 mb-1">Connection:</div>
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  masterCounters.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={masterCounters.isConnected ? 'text-green-400' : 'text-red-400'}>
                  {masterCounters.isConnected ? 'Connected' : 'Offline'}
                </span>
                <span className="text-gray-400 ml-auto">
                  {masterCounters.lastUpdate?.toLocaleTimeString('es-MX') || 'Never'}
                </span>
              </div>
            </div>

            {/* Test Results */}
            {testResults && (
              <div className="border-t border-gray-600 pt-2">
                <div className="text-xs text-gray-300 mb-1">Last Test:</div>
                <div className={`text-xs font-bold ${
                  testResults.includes('✅') ? 'text-green-400' : 
                  testResults.includes('❌') ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {testResults}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-600 pt-2 flex gap-2">
              <button
                onClick={runTest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs font-bold transition-colors"
              >
                🧪 Test Math
              </button>
              <button
                onClick={forceUpdate}
                className="flex-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-bold transition-colors"
              >
                🔄 Force Update
              </button>
            </div>

            {/* Console Helper */}
            <div className="border-t border-gray-600 pt-2">
              <div className="text-xs text-gray-300 mb-1">Console Commands:</div>
              <div className="text-xs font-mono text-gray-400">
                <div>raffleCounterTest.runFullTest()</div>
                <div>raffleCounterTest.testMath()</div>
                <div>raffleCounterTest.forceUpdate()</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CounterDebugger;