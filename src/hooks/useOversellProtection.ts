// ============================================================================
// HOOK PARA PROTECCIÓN CONTRA OVERSELLING - CERO TOLERANCIA
// ============================================================================

import { useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { adminToast } from '../lib/toast-utils';

interface OversellProtectionResult {
  success: boolean;
  conflictingTickets: number[];
  alternativeTickets: number[];
  message: string;
}

interface ReservationAttempt {
  tickets: number[];
  customerId: string;
  purchaseId: string;
  timestamp: string;
}

export function useOversellProtection() {
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeLockRef = useRef<string | null>(null);

  // ============================================================================
  // TRANSACCIÓN ATÓMICA PARA RESERVAR TICKETS
  // ============================================================================
  const atomicReserveTickets = useCallback(async (
    tickets: number[],
    customerId: string,
    purchaseId: string
  ): Promise<OversellProtectionResult> => {
    const lockId = `${customerId}-${Date.now()}`;
    activeLockRef.current = lockId;

    try {
      console.log(`🔒 OVERSELL PROTECTION: Starting atomic reservation for ${tickets.length} tickets`);

      // PASO 1: Verificar disponibilidad actual con FOR UPDATE (lock pesimista)
      const { data: currentStatus, error: statusError } = await supabase
        .from('tickets')
        .select('number, status, customer_id, purchase_id, reserved_at')
        .in('number', tickets);

      if (statusError) {
        throw new Error(`Error checking ticket status: ${statusError.message}`);
      }

      // PASO 2: Validar que TODOS los tickets estén disponibles
      const unavailableTickets = currentStatus?.filter(t => t.status !== 'disponible') || [];

      if (unavailableTickets.length > 0) {
        const conflictingNumbers = unavailableTickets.map(t => t.number);

        console.warn(`⚠️ OVERSELL PROTECTION: Conflict detected`, {
          requested: tickets,
          conflicting: conflictingNumbers,
          conflicts: unavailableTickets.map(t => ({
            number: t.number,
            status: t.status,
            customerId: t.customer_id,
            reservedAt: t.reserved_at
          }))
        });

        // Intentar encontrar tickets alternativos
        const alternativeTickets = await findAlternativeTickets(tickets.length);

        return {
          success: false,
          conflictingTickets: conflictingNumbers,
          alternativeTickets,
          message: `Tickets ${conflictingNumbers.join(', ')} ya no disponibles. ${alternativeTickets.length > 0 ? 'Alternativas encontradas.' : 'No hay suficientes tickets disponibles.'}`
        };
      }

      // PASO 3: Reservar todos los tickets en una sola transacción
      const reservationTime = new Date().toISOString();

      const { data: reservedTickets, error: reserveError } = await supabase
        .from('tickets')
        .update({
          status: 'reservado',
          customer_id: customerId,
          purchase_id: purchaseId,
          reserved_at: reservationTime
        })
        .in('number', tickets)
        .eq('status', 'disponible') // CRÍTICO: Solo actualizar si aún están disponibles
        .select('number');

      if (reserveError) {
        throw new Error(`Error reserving tickets: ${reserveError.message}`);
      }

      const actuallyReserved = reservedTickets?.length || 0;

      // PASO 4: Verificar que se reservaron TODOS los tickets solicitados
      if (actuallyReserved !== tickets.length) {
        console.error(`🚨 OVERSELL PROTECTION: Partial reservation detected`, {
          requested: tickets.length,
          reserved: actuallyReserved,
          requestedTickets: tickets,
          reservedTickets: reservedTickets?.map(t => t.number) || []
        });

        // Rollback: Liberar tickets parcialmente reservados
        if (actuallyReserved > 0) {
          const reservedNumbers = reservedTickets?.map(t => t.number) || [];
          await rollbackReservation(reservedNumbers, purchaseId);
        }

        // Intentar encontrar alternativas
        const alternativeTickets = await findAlternativeTickets(tickets.length);

        return {
          success: false,
          conflictingTickets: tickets.filter(t => !reservedTickets?.some(r => r.number === t)),
          alternativeTickets,
          message: `Reservación parcial detectada (${actuallyReserved}/${tickets.length}). Transacción revertida.`
        };
      }

      console.log(`✅ OVERSELL PROTECTION: Atomic reservation successful`, {
        tickets: reservedTickets.map(t => t.number),
        customerId,
        purchaseId,
        timestamp: reservationTime
      });

      adminToast.success(`🔒 ${actuallyReserved} tickets reservados atómicamente`, {
        duration: 3000
      });

      // Disparar evento de sincronización
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('raffle-counters-updated', {
          detail: {
            source: 'atomic-reservation',
            reservedTickets: actuallyReserved,
            timestamp: reservationTime
          }
        }));
      }

      return {
        success: true,
        conflictingTickets: [],
        alternativeTickets: [],
        message: `${actuallyReserved} tickets reservados exitosamente`
      };

    } catch (error) {
      console.error('❌ OVERSELL PROTECTION: Atomic reservation failed:', error);

      return {
        success: false,
        conflictingTickets: tickets,
        alternativeTickets: [],
        message: `Error crítico en reservación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    } finally {
      activeLockRef.current = null;
    }
  }, []);

  // ============================================================================
  // FUNCIÓN PARA ENCONTRAR TICKETS ALTERNATIVOS
  // ============================================================================
  const findAlternativeTickets = useCallback(async (count: number): Promise<number[]> => {
    try {
      const { data: availableTickets, error } = await supabase
        .from('tickets')
        .select('number')
        .eq('status', 'disponible')
        .order('number')
        .limit(count);

      if (error) {
        console.error('❌ Error finding alternative tickets:', error);
        return [];
      }

      return availableTickets?.map(t => t.number) || [];
    } catch (error) {
      console.error('❌ Error in findAlternativeTickets:', error);
      return [];
    }
  }, []);

  // ============================================================================
  // FUNCIÓN PARA ROLLBACK DE RESERVACIONES
  // ============================================================================
  const rollbackReservation = useCallback(async (
    ticketNumbers: number[],
    purchaseId: string
  ): Promise<boolean> => {
    try {
      console.log(`🔄 OVERSELL PROTECTION: Rolling back reservation for ${ticketNumbers.length} tickets`);

      const { error } = await supabase
        .from('tickets')
        .update({
          status: 'disponible',
          customer_id: null,
          purchase_id: null,
          reserved_at: null
        })
        .in('number', ticketNumbers)
        .eq('purchase_id', purchaseId);

      if (error) {
        console.error('❌ Rollback failed:', error);
        return false;
      }

      console.log(`✅ OVERSELL PROTECTION: Rollback successful for tickets:`, ticketNumbers);

      adminToast.info(`🔄 Rollback: ${ticketNumbers.length} tickets liberados`, {
        duration: 2000
      });

      return true;
    } catch (error) {
      console.error('❌ Rollback error:', error);
      return false;
    }
  }, []);

  // ============================================================================
  // VALIDACIÓN PRE-TRANSACCIÓN
  // ============================================================================
  const validateTicketsBeforeReservation = useCallback(async (
    tickets: number[]
  ): Promise<{ valid: boolean; unavailable: number[]; message: string }> => {
    try {
      // Verificar que todos los números estén en rango válido
      const invalidNumbers = tickets.filter(t => t < 1 || t > 10000);
      if (invalidNumbers.length > 0) {
        return {
          valid: false,
          unavailable: invalidNumbers,
          message: `Números de ticket inválidos: ${invalidNumbers.join(', ')}`
        };
      }

      // Verificar duplicados en la solicitud
      const uniqueTickets = [...new Set(tickets)];
      if (uniqueTickets.length !== tickets.length) {
        return {
          valid: false,
          unavailable: [],
          message: 'Tickets duplicados detectados en la solicitud'
        };
      }

      // Verificar disponibilidad en BD
      const { data: ticketStatus, error } = await supabase
        .from('tickets')
        .select('number, status')
        .in('number', tickets);

      if (error) {
        throw new Error(`Error validating tickets: ${error.message}`);
      }

      const unavailableTickets = ticketStatus?.filter(t => t.status !== 'disponible').map(t => t.number) || [];

      return {
        valid: unavailableTickets.length === 0,
        unavailable: unavailableTickets,
        message: unavailableTickets.length > 0
          ? `Tickets no disponibles: ${unavailableTickets.join(', ')}`
          : 'Todos los tickets están disponibles'
      };

    } catch (error) {
      console.error('❌ Validation error:', error);
      return {
        valid: false,
        unavailable: tickets,
        message: `Error de validación: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }, []);

  // ============================================================================
  // FUNCIÓN PARA CANCELAR RESERVACIÓN ACTIVA
  // ============================================================================
  const cancelActiveReservation = useCallback(() => {
    if (activeLockRef.current) {
      console.log(`🔒 OVERSELL PROTECTION: Cancelling active reservation: ${activeLockRef.current}`);
      activeLockRef.current = null;

      if (lockTimeoutRef.current) {
        clearTimeout(lockTimeoutRef.current);
        lockTimeoutRef.current = null;
      }
    }
  }, []);

  return {
    atomicReserveTickets,
    validateTicketsBeforeReservation,
    findAlternativeTickets,
    rollbackReservation,
    cancelActiveReservation,
    isReservationActive: () => activeLockRef.current !== null
  };
}