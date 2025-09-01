// ============================================================================
// HOOK SMART COUNTERS - ALIAS DEL MASTER COUNTER
// ============================================================================

'use client';

import { useMasterCounters, useDisplayStats as useMasterDisplayStats, useAdminCounters as useMasterAdminCounters } from './useMasterCounters';

/**
 * Hook de contadores inteligentes - Alias del Master Counter
 * Mantiene compatibilidad con el código existente
 */
export const useSmartCounters = () => {
  return useMasterCounters();
};

/**
 * Hook para estadísticas de display - Alias del Master Counter
 * Mantiene compatibilidad con el código existente
 */
export const useDisplayStats = () => {
  return useMasterDisplayStats();
};

/**
 * Hook para contadores de admin - Alias del Master Counter
 * Mantiene compatibilidad con el código existente
 */
export const useAdminCounters = () => {
  return useMasterAdminCounters();
};

// Exportaciones por defecto
export default useSmartCounters;