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
    // === DATOS PARA UI PÚBLICA (DISPLAY MODE) ===
    display: {
      soldCount: master.fomoSoldTickets, // FOMO-enhanced sold count
      soldPercentage: master.fomoPercentage,
      availableCount: master.totalTickets - master.fomoSoldTickets - master.reservedTickets, // Calculated for display
      reservedCount: master.reservedTickets,
      totalCount: master.totalTickets,
      
      // Formateo automático
      soldCountFormatted: master.fomoSoldTickets.toLocaleString('es-MX'),
      availableCountFormatted: (master.totalTickets - master.fomoSoldTickets - master.reservedTickets).toLocaleString('es-MX'),
      
      // Estados de urgencia basados en display available
      isNearlyFull: master.fomoPercentage > 85,
      isCritical: master.fomoPercentage > 95,
      urgencyLevel: (master.totalTickets - master.fomoSoldTickets - master.reservedTickets) > 3000 ? 'low' :
                   (master.totalTickets - master.fomoSoldTickets - master.reservedTickets) > 1500 ? 'medium' :
                   (master.totalTickets - master.fomoSoldTickets - master.reservedTickets) > 500 ? 'high' : 'critical'
    },
    
    // === DATOS REALES (BUSINESS LOGIC) ===
    real: {
      soldCount: master.soldTickets,           // Real sold from DB
      soldPercentage: master.soldPercentage,   // Real percentage
      availableCount: master.availableTickets, // Real available (total - sold - reserved)
      reservedCount: master.reservedTickets    // Real reserved
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