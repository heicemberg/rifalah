// ============================================================================
// HOOK REALTIME TICKETS - ALIAS DEL MASTER COUNTER
// ============================================================================

'use client';

import { useMasterCounters } from './useMasterCounters';

// Precios en pesos mexicanos
export const PRECIO_POR_BOLETO_MXN = 250;

/**
 * Hook que proporciona funciones de formateo y estadísticas en tiempo real
 * Compatible con la interfaz anterior pero usa el Master Counter como fuente única
 */
export const useRealTimeTickets = () => {
  const master = useMasterCounters();

  // Formateo mexicano de números
  const formatMexicanNumber = (num: number): string => {
    return num.toLocaleString('es-MX');
  };

  // Formateo de precios mexicanos
  const formatPriceMXN = (amount: number): string => {
    return `$${formatMexicanNumber(amount)} MXN`;
  };

  // Cálculo de precio basado en cantidad
  const calculatePrice = (quantity: number): number => {
    return quantity * PRECIO_POR_BOLETO_MXN;
  };

  // Estadísticas en tiempo real desde Master Counter
  const stats = {
    soldCount: master.fomoSoldTickets, // Usar FOMO para display
    availableCount: master.availableTickets,
    reservedCount: master.reservedTickets,
    totalCount: master.totalTickets,
    soldPercentage: master.fomoPercentage,
    isConnected: master.isConnected,
    lastUpdate: master.lastUpdate
  };

  return {
    // Funciones de formateo
    formatMexicanNumber,
    formatPriceMXN,
    calculatePrice,
    
    // Constantes
    PRECIO_POR_BOLETO_MXN,
    
    // Estadísticas en tiempo real
    stats,
    
    // Datos directos (compatibilidad)
    soldCount: master.fomoSoldTickets,
    availableCount: master.availableTickets,
    soldPercentage: master.fomoPercentage,
    totalCount: master.totalTickets
  };
};

export default useRealTimeTickets;