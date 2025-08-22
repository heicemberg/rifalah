// ============================================================================
// HOOK PARA SELECTORES ESTABLES Y OPTIMIZADOS
// ============================================================================

'use client';

import { useRef, useCallback, useMemo } from 'react';
import { useRaffleStore } from '../stores/raffle-store';

// ============================================================================
// TIPOS
// ============================================================================

type Selector<T> = (state: any) => T;
type EqualityFn<T> = (a: T, b: T) => boolean;

// ============================================================================
// IMPLEMENTACIÓN DE SHALLOW COMPARISON
// ============================================================================

const shallowEqual = <T,>(a: T, b: T): boolean => {
  if (Object.is(a, b)) return true;
  
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!(key in b) || !Object.is((a as any)[key], (b as any)[key])) {
      return false;
    }
  }
  
  return true;
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook que crea un selector estable memoizado para prevenir re-renderizados innecesarios
 */
export function useStableSelector<T,>(
  selector: Selector<T>,
  equalityFn: EqualityFn<T> = shallowEqual
): T {
  // Memoizar el selector para evitar recreaciones
  const stableSelector = useCallback(selector, []);
  
  // Usar el selector memoizado con el store
  return useRaffleStore(stableSelector, equalityFn);
}

// ============================================================================
// HOOKS ESPECIALIZADOS OPTIMIZADOS
// ============================================================================

/**
 * Hook optimizado para datos básicos de tickets
 */
export function useTicketData() {
  return useStableSelector(
    useCallback((state) => ({
      selectedCount: state.selectedTickets.length,
      soldCount: state.soldTickets.length,
      availableCount: state.availableTickets.length,
      totalPrice: state.totalPrice,
      soldPercentage: state.soldPercentage
    }), [])
  );
}

/**
 * Hook optimizado para acciones de tickets (estas no cambian)
 */
export function useTicketActions() {
  return useStableSelector(
    useCallback((state) => ({
      selectTicket: state.selectTicket,
      deselectTicket: state.deselectTicket,
      quickSelect: state.quickSelect,
      clearSelection: state.clearSelection
    }), [])
  );
}

/**
 * Hook optimizado para estado de loading y errores
 */
export function useAppStatus() {
  return useStableSelector(
    useCallback((state) => ({
      loading: state.loading,
      errors: state.errors,
      hasErrors: state.errors.length > 0
    }), [])
  );
}

/**
 * Hook optimizado para actividades en vivo
 */
export function useLiveData() {
  return useStableSelector(
    useCallback((state) => ({
      liveActivities: state.liveActivities,
      viewingCount: state.viewingCount,
      recentActivity: state.liveActivities[0] || null
    }), [])
  );
}

// ============================================================================
// HOOK PARA VALORES INDIVIDUALES (MÁS EFICIENTE)
// ============================================================================

/**
 * Hook para obtener un solo valor del store de manera muy eficiente
 */
export function useSingleValue<T,>(selector: Selector<T>): T {
  const selectorRef = useRef(selector);
  const lastResultRef = useRef<T | undefined>(undefined);
  
  // Actualizar selector si cambió
  selectorRef.current = selector;
  
  return useRaffleStore(
    useCallback((state) => {
      const result = selectorRef.current(state);
      
      // Solo actualizar si realmente cambió
      if (!Object.is(result, lastResultRef.current)) {
        lastResultRef.current = result;
      }
      
      return lastResultRef.current as T;
    }, [])
  );
}

// ============================================================================
// HOOKS DE CONVENIENCIA PARA VALORES ÚNICOS
// ============================================================================

export const useSoldPercentage = () => useSingleValue(state => state.soldPercentage);
export const useSelectedCount = () => useSingleValue(state => state.selectedTickets.length);
export const useAvailableCount = () => useSingleValue(state => state.availableTickets.length);
export const useTotalPrice = () => useSingleValue(state => state.totalPrice);
export const useViewingCount = () => useSingleValue(state => state.viewingCount);
export const useLoadingState = () => useSingleValue(state => state.loading);

// ============================================================================
// EXPORTS
// ============================================================================

export default useStableSelector;