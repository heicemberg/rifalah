'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useMasterCounters, forceMasterUpdate } from './useMasterCounters';
import toast from 'react-hot-toast';

// ============================================================================
// HOOK DE SINCRONIZACIÓN ADMIN - SINCRONIZACIÓN INMEDIATA POST-CONFIRMACIÓN
// ============================================================================

interface AdminSyncConfig {
  enableAutoSync: boolean;
  syncDelay: number;
  showToasts: boolean;
}

export interface AdminSyncData {
  // Datos integrados FOMO + Real
  display: {
    soldCount: number;        // Real + FOMO (1200)
    soldPercentage: number;   // Percentage with FOMO
    availableCount: number;   // Calculated display available
  };
  
  // Datos reales de negocio
  real: {
    soldCount: number;        // Solo tickets realmente vendidos
    soldPercentage: number;   // Percentage real sin FOMO
    availableCount: number;   // Real available (10000 - sold - reserved)
    reservedCount: number;    // Tickets reservados
  };
  
  // FOMO transparente para admin
  fomo: {
    isActive: boolean;        // Si FOMO está activo
    fomoAmount: number;       // Cantidad FOMO fija (1200)
    difference: number;       // Diferencia entre display y real
  };
  
  // Estado de sincronización
  sync: {
    isConnected: boolean;
    lastUpdate: Date;
    isLoading: boolean;
  };
}

export const useAdminSync = (config: Partial<AdminSyncConfig> = {}): AdminSyncData & {
  forceSync: () => Promise<void>;
  onAdminConfirmation: () => Promise<void>;
} => {
  const defaultConfig: AdminSyncConfig = {
    enableAutoSync: true,
    syncDelay: 500,
    showToasts: true,
    ...config
  };
  
  const masterCounters = useMasterCounters();
  const lastSoldCountRef = useRef<number>(masterCounters.soldTickets);
  const syncInProgressRef = useRef<boolean>(false);
  
  // ============================================================================
  // FORCE SYNC FUNCTION
  // ============================================================================
  const forceSync = useCallback(async (): Promise<void> => {
    if (syncInProgressRef.current) {
      console.log('🔄 ADMIN SYNC: Sync already in progress, skipping...');
      return;
    }
    
    syncInProgressRef.current = true;
    
    try {
      console.log('🔄 ADMIN SYNC: Force updating master counters...');
      await forceMasterUpdate();
      
      if (defaultConfig.showToasts) {
        const currentData = masterCounters;
        toast.success(`🔄 Sincronizado: Real ${currentData.soldTickets}, Display ${Math.round((currentData.fomoSoldTickets / 10000) * 100)}%`, {
          duration: 3000,
          position: 'top-right'
        });
      }
      
    } catch (error) {
      console.error('❌ ADMIN SYNC: Force sync failed:', error);
      
      if (defaultConfig.showToasts) {
        toast.error('Error al sincronizar contadores', {
          duration: 4000
        });
      }
    } finally {
      syncInProgressRef.current = false;
    }
  }, [masterCounters, defaultConfig.showToasts]);
  
  // ============================================================================
  // ADMIN CONFIRMATION HANDLER
  // ============================================================================
  const onAdminConfirmation = useCallback(async (): Promise<void> => {
    console.log('🎯 ADMIN SYNC: Admin confirmation detected, executing enhanced sync...');
    
    if (syncInProgressRef.current) {
      console.log('⚠️ ADMIN SYNC: Sync in progress, queueing confirmation sync...');
      setTimeout(() => onAdminConfirmation(), 1000);
      return;
    }
    
    syncInProgressRef.current = true;
    
    try {
      // Step 1: Immediate sync
      console.log('📊 ADMIN SYNC: Step 1 - Immediate counter update');
      await forceMasterUpdate();
      
      // Step 2: Brief delay for DB propagation
      console.log('⏱️ ADMIN SYNC: Step 2 - DB propagation delay');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 3: Final verification sync
      console.log('✅ ADMIN SYNC: Step 3 - Final verification sync');
      await forceMasterUpdate();
      
      if (defaultConfig.showToasts) {
        const finalData = masterCounters;
        toast.success(`🎯 Admin confirmación procesada: ${finalData.soldTickets} reales + 1200 FOMO = ${finalData.fomoSoldTickets} display`, {
          duration: 5000,
          position: 'top-center'
        });
      }
      
      console.log('✅ ADMIN SYNC: Admin confirmation sync completed successfully');
      
    } catch (error) {
      console.error('❌ ADMIN SYNC: Admin confirmation sync failed:', error);
      
      if (defaultConfig.showToasts) {
        toast.error('Error procesando confirmación admin', {
          duration: 4000
        });
      }
    } finally {
      syncInProgressRef.current = false;
    }
  }, [masterCounters, defaultConfig.showToasts, forceSync]);
  
  // ============================================================================
  // AUTO-SYNC ON REAL SOLD COUNT CHANGES
  // ============================================================================
  useEffect(() => {
    if (!defaultConfig.enableAutoSync) return;
    
    const currentSoldCount = masterCounters.soldTickets;
    const previousSoldCount = lastSoldCountRef.current;
    
    // Detect real sold count changes (admin confirmations)
    if (currentSoldCount !== previousSoldCount) {
      console.log(`🔄 ADMIN SYNC: Real sold count changed ${previousSoldCount} → ${currentSoldCount}`);
      lastSoldCountRef.current = currentSoldCount;
      
      // Trigger auto-sync after a brief delay
      setTimeout(() => {
        if (!syncInProgressRef.current) {
          console.log('🔄 ADMIN SYNC: Auto-syncing after real count change');
          forceSync();
        }
      }, defaultConfig.syncDelay);
    }
  }, [masterCounters.soldTickets, defaultConfig.enableAutoSync, defaultConfig.syncDelay, forceSync]);
  
  // ============================================================================
  // WEBSOCKET EVENT LISTENERS FOR ADMIN CONFIRMATIONS
  // ============================================================================
  useEffect(() => {
    const handleAdminConfirmation = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { isAdminConfirmation } = customEvent.detail || {};
      
      if (isAdminConfirmation) {
        console.log('🎯 ADMIN SYNC: WebSocket admin confirmation detected');
        onAdminConfirmation();
      }
    };
    
    window.addEventListener('purchase-status-changed', handleAdminConfirmation);
    
    return () => {
      window.removeEventListener('purchase-status-changed', handleAdminConfirmation);
    };
  }, [onAdminConfirmation]);
  
  // ============================================================================
  // COMPUTE FINAL ADMIN DATA
  // ============================================================================
  
  // Display calculations (what users see - Real + FOMO)
  const displaySoldCount = masterCounters.fomoSoldTickets;  // Already contains Real + FOMO
  const displayAvailableCount = masterCounters.totalTickets - displaySoldCount - masterCounters.reservedTickets;
  const displaySoldPercentage = masterCounters.fomoPercentage;
  
  // Real business logic calculations
  const realSoldCount = masterCounters.soldTickets;
  const realAvailableCount = masterCounters.availableTickets;
  const realSoldPercentage = masterCounters.soldPercentage;
  const realReservedCount = masterCounters.reservedTickets;
  
  // FOMO analysis
  const fomoAmount = 1200; // Fixed FOMO amount
  const fomoIsActive = masterCounters.fomoIsActive;
  const fomoDifference = displaySoldCount - realSoldCount;
  
  const adminSyncData: AdminSyncData = {
    display: {
      soldCount: displaySoldCount,
      soldPercentage: displaySoldPercentage,
      availableCount: displayAvailableCount
    },
    
    real: {
      soldCount: realSoldCount,
      soldPercentage: realSoldPercentage,
      availableCount: realAvailableCount,
      reservedCount: realReservedCount
    },
    
    fomo: {
      isActive: fomoIsActive,
      fomoAmount: fomoAmount,
      difference: fomoDifference
    },
    
    sync: {
      isConnected: masterCounters.isConnected,
      lastUpdate: masterCounters.lastUpdate,
      isLoading: masterCounters.isLoading
    }
  };
  
  return {
    ...adminSyncData,
    forceSync,
    onAdminConfirmation
  };
};

// ============================================================================
// HOOK LEGACY COMPATIBILITY - useAdminDisplayCounters (DEPRECATED)
// ============================================================================
/**
 * @deprecated Use useAdminSync instead for better functionality
 */
export const useAdminDisplayCounters = () => {
  const adminSync = useAdminSync();
  
  return {
    // Legacy format
    display: {
      soldCount: adminSync.display.soldCount,
      soldPercentage: adminSync.display.soldPercentage,
    },
    real: {
      soldCount: adminSync.real.soldCount,
      soldPercentage: adminSync.real.soldPercentage,
    },
    isConnected: adminSync.sync.isConnected,
    visualPercentage: adminSync.display.soldPercentage,
    refreshData: adminSync.forceSync,
  };
};

export default useAdminSync;