'use client';

// ============================================================================
// HOOK UNIFICADO DE CONTADORES - INTERFAZ SIMPLIFICADA
// ============================================================================

import { useMasterCounters, useDisplayStats, useAdminCounters, useTicketStats, forceMasterUpdate } from './useMasterCounters';

// ============================================================================
// HOOK PRINCIPAL - INTERFAZ SIMPLIFICADA
// ============================================================================

/**
 * Hook principal para obtener todos los contadores necesarios
 * Interfaz unificada que simplifica el uso de contadores en componentes
 */
export const useCounters = () => {
  const master = useMasterCounters();
  
  return {
    // === DATOS PARA UI PÚBLICA ===
    display: {
      soldCount: master.fomoSoldTickets, // Usar FOMO para display
      soldPercentage: master.fomoPercentage,
      availableCount: master.availableTickets,
      reservedCount: master.reservedTickets,
      totalCount: master.totalTickets,
      
      // Formateo automático
      soldCountFormatted: master.fomoSoldTickets.toLocaleString('es-MX'),
      availableCountFormatted: master.availableTickets.toLocaleString('es-MX'),
      
      // Estados de urgencia
      isNearlyFull: master.fomoPercentage > 85,
      isCritical: master.fomoPercentage > 95,
      urgencyLevel: master.availableTickets > 3000 ? 'low' :
                   master.availableTickets > 1500 ? 'medium' :
                   master.availableTickets > 500 ? 'high' : 'critical'
    },
    
    // === DATOS REALES (ADMIN) ===
    real: {
      soldCount: master.soldTickets,
      soldPercentage: master.soldPercentage,
      availableCount: master.availableTickets,
      reservedCount: master.reservedTickets
    },
    
    // === ESTADO FOMO ===
    fomo: {
      isActive: master.fomoIsActive,
      difference: master.fomoSoldTickets - master.soldTickets
    },
    
    // === METADATA ===
    meta: {
      isConnected: master.isConnected,
      loading: master.isLoading,
      lastUpdate: master.lastUpdate,
      totalTickets: master.totalTickets
    },
    
    // === ACCIONES ===
    actions: {
      refresh: () => forceMasterUpdate()
    }
  };
};

// ============================================================================
// HOOKS ESPECIALIZADOS PARA CASOS ESPECÍFICOS
// ============================================================================

/**
 * Hook para estadísticas de display (componentes públicos)
 */
export const useDisplayCounters = () => {
  const counters = useCounters();
  return {
    ...counters.display,
    isConnected: counters.meta.isConnected,
    lastUpdate: counters.meta.lastUpdate
  };
};

/**
 * Hook para panel de administración
 */
export const useAdminDisplayCounters = () => {
  const counters = useCounters();
  return {
    display: counters.display,
    real: counters.real,
    fomo: counters.fomo,
    meta: counters.meta,
    actions: counters.actions,
    
    // COMPATIBILIDAD con AdminPanel
    visualPercentage: counters.display.soldPercentage,
    refreshData: counters.actions.refresh,
    isConnected: counters.meta.isConnected
  };
};

/**
 * Hook para mostrar estadísticas en ticket grid
 */
export const useTicketGridCounters = () => {
  const counters = useCounters();
  return {
    soldCount: counters.display.soldCount,
    availableCount: counters.display.availableCount,
    soldPercentage: counters.display.soldPercentage,
    urgencyLevel: counters.display.urgencyLevel,
    isNearlyFull: counters.display.isNearlyFull,
    isCritical: counters.display.isCritical,
    actions: counters.actions
  };
};

/**
 * Hook para componentes de precio y compra
 */
export const usePricingCounters = () => {
  const counters = useCounters();
  
  const PRECIO_POR_TICKET = 250;
  
  const calculatePrice = (quantity: number) => quantity * PRECIO_POR_TICKET;
  const formatPrice = (amount: number) => `$${amount.toLocaleString('es-MX')} MXN`;
  
  return {
    availableCount: counters.display.availableCount,
    soldPercentage: counters.display.soldPercentage,
    urgencyLevel: counters.display.urgencyLevel,
    isConnected: counters.meta.isConnected,
    
    // Funciones de precio
    calculatePrice,
    formatPrice,
    pricePerTicket: PRECIO_POR_TICKET
  };
};

// ============================================================================
// EXPORTACIONES POR DEFECTO
// ============================================================================

export default useCounters;

// Re-exportar hooks del Master Counter para compatibilidad
export {
  useMasterCounters,
  useDisplayStats,
  useAdminCounters,
  useTicketStats
} from './useMasterCounters';