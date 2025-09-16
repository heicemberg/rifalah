// ============================================================================
// HOOK PARA LIMPIEZA AUTOMÁTICA DE RESERVACIONES VENCIDAS
// ============================================================================

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { RESERVATION_TIME } from '../lib/constants';
import { adminToast } from '../lib/toast-utils';

interface ReservationCleanupConfig {
  enableAutoCleanup: boolean;
  cleanupIntervalMinutes: number;
  showLogs: boolean;
}

export function useReservationCleanup(config: Partial<ReservationCleanupConfig> = {}) {
  const defaultConfig: ReservationCleanupConfig = {
    enableAutoCleanup: true,
    cleanupIntervalMinutes: 5, // Cada 5 minutos
    showLogs: false,
    ...config
  };

  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCleaningRef = useRef(false);

  // ============================================================================
  // FUNCIÓN DE LIMPIEZA MANUAL DE RESERVACIONES VENCIDAS
  // ============================================================================
  const cleanupExpiredReservations = useCallback(async (): Promise<number> => {
    if (isCleaningRef.current) {
      console.log('⏳ Cleanup already in progress, skipping...');
      return 0;
    }

    isCleaningRef.current = true;

    try {
      // Calcular timestamp de expiración (30 minutos atrás)
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() - RESERVATION_TIME);
      const expirationISO = expirationTime.toISOString();

      if (defaultConfig.showLogs) {
        console.log(`🧹 CLEANUP: Starting reservation cleanup (older than ${expirationISO})`);
      }

      // Buscar tickets reservados que han expirado
      const { data: expiredTickets, error: selectError } = await supabase
        .from('tickets')
        .select('number, reserved_at, customer_id, purchase_id')
        .eq('status', 'reservado')
        .lt('reserved_at', expirationISO);

      if (selectError) {
        console.error('❌ CLEANUP: Error querying expired reservations:', selectError);
        return 0;
      }

      if (!expiredTickets || expiredTickets.length === 0) {
        if (defaultConfig.showLogs) {
          console.log('✅ CLEANUP: No expired reservations found');
        }
        return 0;
      }

      const expiredNumbers = expiredTickets.map(t => t.number);

      console.log(`🧹 CLEANUP: Found ${expiredNumbers.length} expired reservations:`, {
        tickets: expiredNumbers,
        expirationTime: expirationISO
      });

      // Liberar tickets expirados en una sola transacción
      const { data: releasedTickets, error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'disponible',
          customer_id: null,
          purchase_id: null,
          reserved_at: null
        })
        .in('number', expiredNumbers)
        .eq('status', 'reservado') // Doble verificación
        .select('number');

      if (updateError) {
        console.error('❌ CLEANUP: Error releasing expired tickets:', updateError);
        return 0;
      }

      const actuallyReleased = releasedTickets?.length || 0;

      if (actuallyReleased > 0) {
        console.log(`✅ CLEANUP: Released ${actuallyReleased} expired reservations`);

        if (defaultConfig.showLogs) {
          adminToast.info(`🧹 Cleanup: ${actuallyReleased} reservaciones expiradas liberadas`);
        }

        // Disparar evento de sincronización
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('raffle-counters-updated', {
            detail: {
              source: 'reservation-cleanup',
              releasedTickets: actuallyReleased,
              timestamp: new Date().toISOString()
            }
          }));
        }
      }

      return actuallyReleased;

    } catch (error) {
      console.error('❌ CLEANUP: Unexpected error during cleanup:', error);
      return 0;
    } finally {
      isCleaningRef.current = false;
    }
  }, [defaultConfig.showLogs]);

  // ============================================================================
  // FUNCIÓN PARA LIMPIAR RESERVACIONES DE UNA COMPRA ESPECÍFICA
  // ============================================================================
  const cleanupPurchaseReservations = useCallback(async (purchaseId: string): Promise<boolean> => {
    try {
      console.log(`🧹 CLEANUP: Releasing reservations for purchase ${purchaseId}`);

      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'disponible',
          customer_id: null,
          purchase_id: null,
          reserved_at: null
        })
        .eq('purchase_id', purchaseId)
        .eq('status', 'reservado');

      if (error) {
        console.error('❌ CLEANUP: Error releasing purchase reservations:', error);
        return false;
      }

      console.log(`✅ CLEANUP: Released reservations for purchase ${purchaseId}`);

      // Disparar evento de sincronización
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('raffle-counters-updated', {
          detail: {
            source: 'purchase-cleanup',
            purchaseId,
            timestamp: new Date().toISOString()
          }
        }));
      }

      return true;
    } catch (error) {
      console.error('❌ CLEANUP: Error in purchase cleanup:', error);
      return false;
    }
  }, []);

  // ============================================================================
  // CONFIGURAR LIMPIEZA AUTOMÁTICA
  // ============================================================================
  useEffect(() => {
    if (!defaultConfig.enableAutoCleanup) {
      console.log('🧹 CLEANUP: Auto-cleanup disabled');
      return;
    }

    console.log(`🧹 CLEANUP: Starting auto-cleanup (every ${defaultConfig.cleanupIntervalMinutes} minutes)`);

    // Ejecutar limpieza inicial después de 1 minuto
    const initialTimeout = setTimeout(() => {
      cleanupExpiredReservations();
    }, 60000);

    // Configurar intervalo de limpieza
    cleanupIntervalRef.current = setInterval(() => {
      cleanupExpiredReservations();
    }, defaultConfig.cleanupIntervalMinutes * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, [defaultConfig.enableAutoCleanup, defaultConfig.cleanupIntervalMinutes, cleanupExpiredReservations]);

  // ============================================================================
  // LIMPIEZA AL DESMONTAR EL COMPONENTE
  // ============================================================================
  useEffect(() => {
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, []);

  return {
    cleanupExpiredReservations,
    cleanupPurchaseReservations,
    isRunning: isCleaningRef.current
  };
}