'use client';

import { useEffect } from 'react';
import { useMasterCounters, testMathConsistency, forceMasterUpdate } from '../hooks/useMasterCounters';
import { useMathValidator } from '../hooks/useMathValidator';

// ============================================================================
// COMPONENTE DE DEBUGGING MATEMÁTICO PARA DESARROLLO
// ============================================================================

export const MathDebugger: React.FC<{ show?: boolean }> = ({ show = false }) => {
  const { validateNow } = useMathValidator();
  
  useEffect(() => {
    // Exponer funciones de debugging globalmente
    if (typeof window !== 'undefined') {
      (window as any).raffleDebug = {
        validateMath: validateNow,
        testConsistency: testMathConsistency,
        forceUpdate: forceMasterUpdate,
        runFullDiagnostic: () => {
          console.log('🔬 RUNNING FULL RAFFLE DIAGNOSTIC...');
          console.log('1. Testing math consistency...');
          const mathResult = testMathConsistency();
          console.log('2. Running validation...');
          const validationResult = validateNow();
          console.log('3. Forcing counter update...');
          forceMasterUpdate();
          
          return {
            mathTest: mathResult,
            validation: validationResult,
            timestamp: new Date().toISOString()
          };
        }
      };
    }
  }, [validateNow]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg border border-gray-600 max-w-sm">
      <div className="text-xs font-bold mb-2">🔬 RAFFLE MATH DEBUGGER</div>
      <div className="space-y-2 text-xs">
        <button
          onClick={validateNow}
          className="block w-full text-left bg-blue-600 px-2 py-1 rounded text-white hover:bg-blue-700"
        >
          Validate Math
        </button>
        <button
          onClick={testMathConsistency}
          className="block w-full text-left bg-green-600 px-2 py-1 rounded text-white hover:bg-green-700"
        >
          Test Consistency
        </button>
        <button
          onClick={forceMasterUpdate}
          className="block w-full text-left bg-purple-600 px-2 py-1 rounded text-white hover:bg-purple-700"
        >
          Force Update
        </button>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-300">
        Use console: <code>raffleDebug.runFullDiagnostic()</code>
      </div>
    </div>
  );
};

export default MathDebugger;