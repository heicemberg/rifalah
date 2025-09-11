'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import { useCryptoPrice } from './useCryptoPrice';

/**
 * Hook lazy que solo carga crypto prices cuando es necesario
 * Optimizado para eliminar lag en modal cuando no se usa Binance
 */
export const useLazyCryptoPrice = (mxnAmount: number = 250) => {
  const [isActive, setIsActive] = useState(false);
  const hasBeenActivatedRef = useRef(false);
  
  // Función para activar cuando sea necesario (ej: selecciona Binance)
  const activate = useCallback(() => {
    if (!hasBeenActivatedRef.current) {
      console.log('🚀 LAZY CRYPTO: Activating crypto price loading');
      setIsActive(true);
      hasBeenActivatedRef.current = true;
    }
  }, []);
  
  // Solo usar el hook de crypto si está activo
  const shouldLoadCrypto = isActive && hasBeenActivatedRef.current;
  const cryptoData = useCryptoPrice(shouldLoadCrypto ? mxnAmount : 0);
  
  // Memoizar respuesta para evitar recreaciones
  const result = useMemo(() => {
    if (!isActive) {
      // Estado inicial - no datos de crypto
      return {
        convertedAmounts: null,
        cryptoPrices: null,
        loading: false,
        error: null,
        lastUpdate: null,
        refresh: () => {},
        activate,
        isActive: false,
        hasBeenActivated: false
      };
    }
    
    // Estado activo - retornar datos reales
    return {
      ...cryptoData,
      activate,
      isActive: true,
      hasBeenActivated: true
    };
  }, [isActive, cryptoData, activate]);
  
  return result;
};

export default useLazyCryptoPrice;