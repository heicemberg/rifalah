'use client';

import { useEffect } from 'react';
import { useMasterCounters } from './useMasterCounters';

// ============================================================================
// HOOK PARA VALIDACIÓN MATEMÁTICA CONTINUA
// ============================================================================

export const useMathValidator = (enableLogging = false) => {
  const masterData = useMasterCounters();

  useEffect(() => {
    // Verificación matemática cada 5 segundos
    const interval = setInterval(() => {
      const {
        totalTickets,
        soldTickets,
        reservedTickets,
        availableTickets,
        fomoSoldTickets,
        fomoIsActive
      } = masterData;

      // Test 1: Matemática real debe ser exacta
      const realSum = soldTickets + availableTickets + reservedTickets;
      const realMathValid = realSum === totalTickets;

      // Test 2: FOMO display debe mantener total correcto
      const fomoAvailable = totalTickets - fomoSoldTickets - reservedTickets;
      const fomoSum = fomoSoldTickets + fomoAvailable + reservedTickets;
      const fomoMathValid = fomoSum === totalTickets;

      // Test 3: FOMO nunca debe ser menor que real
      const fomoLogicValid = fomoSoldTickets >= soldTickets;

      const allValid = realMathValid && fomoMathValid && fomoLogicValid;

      if (!allValid) {
        console.error('🚨 MATH VALIDATION FAILED:');
        console.error('Real Math:', { soldTickets, availableTickets, reservedTickets, sum: realSum, expected: totalTickets, valid: realMathValid });
        console.error('FOMO Math:', { fomoSoldTickets, fomoAvailable, reservedTickets, sum: fomoSum, expected: totalTickets, valid: fomoMathValid });
        console.error('FOMO Logic:', { fomoSoldTickets, soldTickets, valid: fomoLogicValid });
      }

      if (enableLogging && allValid) {
        console.log('✅ MATH VALIDATION PASSED:', {
          real: { sold: soldTickets, available: availableTickets, reserved: reservedTickets },
          fomo: { sold: fomoSoldTickets, available: fomoAvailable, active: fomoIsActive },
          totals: { real: realSum, fomo: fomoSum, expected: totalTickets }
        });
      }

    }, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, [masterData, enableLogging]);

  // Función para testing manual
  const validateNow = () => {
    const {
      totalTickets,
      soldTickets,
      reservedTickets,
      availableTickets,
      fomoSoldTickets
    } = masterData;

    const realSum = soldTickets + availableTickets + reservedTickets;
    const fomoAvailable = totalTickets - fomoSoldTickets - reservedTickets;
    const fomoSum = fomoSoldTickets + fomoAvailable + reservedTickets;

    const results = {
      realMath: {
        sum: realSum,
        expected: totalTickets,
        valid: realSum === totalTickets,
        breakdown: { soldTickets, availableTickets, reservedTickets }
      },
      fomoMath: {
        sum: fomoSum,
        expected: totalTickets,
        valid: fomoSum === totalTickets,
        breakdown: { sold: fomoSoldTickets, available: fomoAvailable, reserved: reservedTickets }
      },
      fomoLogic: {
        valid: fomoSoldTickets >= soldTickets,
        difference: fomoSoldTickets - soldTickets
      }
    };

    console.group('🧮 MANUAL MATH VALIDATION');
    console.log('Real Math:', results.realMath.valid ? '✅ PASS' : '❌ FAIL', results.realMath);
    console.log('FOMO Math:', results.fomoMath.valid ? '✅ PASS' : '❌ FAIL', results.fomoMath);
    console.log('FOMO Logic:', results.fomoLogic.valid ? '✅ PASS' : '❌ FAIL', results.fomoLogic);
    console.log('Overall:', results.realMath.valid && results.fomoMath.valid && results.fomoLogic.valid ? '✅ ALL PASS' : '❌ FAILED');
    console.groupEnd();

    return results;
  };

  return {
    validateNow,
    masterData
  };
};

// Exponer función global para testing desde consola
if (typeof window !== 'undefined') {
  (window as any).validateRaffleMath = () => {
    console.log('🧪 Running raffle math validation...');
    // Esta función será implementada por el componente que use el hook
  };
}