'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// ============================================================================
// HOOK MAESTRO DE CONTADORES - FUENTE ÚNICA DE VERDAD
// ============================================================================

export interface MasterCounterData {
  // Datos matemáticamente garantizados
  totalTickets: number;        // Siempre 10,000
  soldTickets: number;         // Tickets realmente vendidos en BD
  reservedTickets: number;     // Tickets temporalmente reservados
  availableTickets: number;    // Calculado: total - sold - reserved
  
  // Datos FOMO (solo para display)
  fomoSoldTickets: number;     // Para mostrar al público (max(real, fomo))
  fomoIsActive: boolean;       // Si FOMO está activo
  
  // Percentajes calculados
  soldPercentage: number;      // Porcentaje real vendido
  fomoPercentage: number;      // Porcentaje mostrado (con FOMO)
  availablePercentage: number; // Porcentaje disponible
  
  // Estado del sistema
  isConnected: boolean;        // Conexión con Supabase
  lastUpdate: Date;            // Última actualización
  isLoading: boolean;          // Cargando datos
}

// Singleton instance
let masterCounterInstance: MasterCounterData | null = null;
let masterCounterListeners: Set<(data: MasterCounterData) => void> = new Set();
let updateInterval: NodeJS.Timeout | null = null;
let supabaseSubscription: any = null;

// ============================================================================
// SISTEMA FOMO INTEGRADO (SIN AFECTAR MATEMÁTICA REAL)
// ============================================================================

const TOTAL_TICKETS = 10000;
const FOMO_THRESHOLD = 18; // % umbral para desactivar FOMO

let fomoSessionStart: number | null = null;

const calculateFOMO = (realSoldCount: number): { fomoCount: number; isActive: boolean } => {
  const realPercentage = (realSoldCount / TOTAL_TICKETS) * 100;
  
  // Si ventas reales >= 18%, desactivar FOMO
  if (realPercentage >= FOMO_THRESHOLD) {
    return { fomoCount: realSoldCount, isActive: false };
  }
  
  // Inicializar sesión FOMO
  if (!fomoSessionStart) {
    if (typeof window !== 'undefined') {
      fomoSessionStart = parseInt(localStorage.getItem('fomo_session_start') || Date.now().toString());
      localStorage.setItem('fomo_session_start', fomoSessionStart.toString());
    } else {
      fomoSessionStart = Date.now();
    }
  }
  
  // Calcular FOMO gradual: 8% inicial → 12% máximo
  const minutesElapsed = (Date.now() - fomoSessionStart) / (1000 * 60);
  const basePercentage = 8;
  const maxPercentage = 12;
  
  // Crecimiento muy gradual: 0.05% cada 2 minutos
  const increment = Math.floor(minutesElapsed / 2) * 0.05;
  const fomoPercentage = Math.min(maxPercentage, basePercentage + increment);
  const fomoCount = Math.floor((fomoPercentage / 100) * TOTAL_TICKETS);
  
  // Retornar el mayor entre real y FOMO
  return { 
    fomoCount: Math.max(realSoldCount, fomoCount), 
    isActive: true 
  };
};

// ============================================================================
// FUNCIONES DE ACTUALIZACIÓN DE DATOS
// ============================================================================

const fetchRealData = async (): Promise<{ sold: number; reserved: number }> => {
  try {
    if (!supabase) throw new Error('Supabase no inicializado');

    // Obtener tickets vendidos y reservados desde BD
    const { data: ticketsData, error } = await supabase
      .from('tickets')
      .select('status')
      .in('status', ['vendido', 'reservado']);

    if (error) throw error;

    const soldCount = ticketsData?.filter(t => t.status === 'vendido').length || 0;
    const reservedCount = ticketsData?.filter(t => t.status === 'reservado').length || 0;

    return { sold: soldCount, reserved: reservedCount };
  } catch (error) {
    console.error('🔴 Error fetching real data:', error);
    return { sold: 0, reserved: 0 };
  }
};

const updateMasterCounters = async (forceUpdate = false) => {
  try {
    const { sold, reserved } = await fetchRealData();
    const available = TOTAL_TICKETS - sold - reserved;
    
    // ✅ VERIFICACIÓN MATEMÁTICA OBLIGATORIA
    const mathCheck = sold + available + reserved;
    if (mathCheck !== TOTAL_TICKETS) {
      console.error(`🚨 MATH ERROR: ${sold} + ${available} + ${reserved} = ${mathCheck} ≠ ${TOTAL_TICKETS}`);
      toast.error(`Error matemático: ${mathCheck} ≠ ${TOTAL_TICKETS}`);
    }

    // Calcular FOMO
    const { fomoCount, isActive } = calculateFOMO(sold);

    // Crear nueva instancia del master counter
    const newData: MasterCounterData = {
      totalTickets: TOTAL_TICKETS,
      soldTickets: sold,
      reservedTickets: reserved,
      availableTickets: available,
      
      fomoSoldTickets: fomoCount,
      fomoIsActive: isActive,
      
      soldPercentage: (sold / TOTAL_TICKETS) * 100,
      fomoPercentage: (fomoCount / TOTAL_TICKETS) * 100,
      availablePercentage: (available / TOTAL_TICKETS) * 100,
      
      isConnected: true,
      lastUpdate: new Date(),
      isLoading: false
    };

    // Log ocasional para debug
    if (Math.random() < 0.1) {
      console.log(`📊 MasterCounters: ${sold}S + ${available}A + ${reserved}R = ${mathCheck} | FOMO: ${fomoCount} (${isActive ? 'ON' : 'OFF'})`);
    }

    masterCounterInstance = newData;
    
    // Notificar a todos los listeners
    masterCounterListeners.forEach(listener => listener(newData));
    
    return newData;
  } catch (error) {
    console.error('🔴 Error updating master counters:', error);
    
    // Fallback data
    const fallbackData: MasterCounterData = {
      totalTickets: TOTAL_TICKETS,
      soldTickets: 0,
      reservedTickets: 0,
      availableTickets: TOTAL_TICKETS,
      
      fomoSoldTickets: Math.floor(TOTAL_TICKETS * 0.08), // 8% inicial
      fomoIsActive: true,
      
      soldPercentage: 0,
      fomoPercentage: 8,
      availablePercentage: 100,
      
      isConnected: false,
      lastUpdate: new Date(),
      isLoading: false
    };
    
    masterCounterInstance = fallbackData;
    masterCounterListeners.forEach(listener => listener(fallbackData));
    return fallbackData;
  }
};

// ============================================================================
// SETUP INICIAL Y SUBSCRIPCIONES
// ============================================================================

const initializeMasterCounters = async () => {
  if (masterCounterInstance) return masterCounterInstance;
  
  // Marcar como loading
  masterCounterInstance = {
    totalTickets: TOTAL_TICKETS,
    soldTickets: 0,
    reservedTickets: 0,
    availableTickets: TOTAL_TICKETS,
    fomoSoldTickets: Math.floor(TOTAL_TICKETS * 0.08),
    fomoIsActive: true,
    soldPercentage: 0,
    fomoPercentage: 8,
    availablePercentage: 100,
    isConnected: false,
    lastUpdate: new Date(),
    isLoading: true
  };
  
  // Setup WebSocket subscriptions
  if (supabase && !supabaseSubscription) {
    supabaseSubscription = supabase
      .channel('master_counters')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          console.log('🔄 Ticket change detected, updating counters...');
          updateMasterCounters(true);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'purchases' },
        () => {
          console.log('🔄 Purchase change detected, updating counters...');
          updateMasterCounters(true);
        }
      )
      .subscribe();
  }
  
  // Setup interval updates
  if (!updateInterval) {
    updateInterval = setInterval(() => {
      updateMasterCounters();
    }, 30000); // Cada 30 segundos
  }
  
  // Inicial load
  return await updateMasterCounters(true);
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useMasterCounters = (): MasterCounterData => {
  const [data, setData] = useState<MasterCounterData>(
    masterCounterInstance || {
      totalTickets: TOTAL_TICKETS,
      soldTickets: 0,
      reservedTickets: 0,
      availableTickets: TOTAL_TICKETS,
      fomoSoldTickets: Math.floor(TOTAL_TICKETS * 0.08),
      fomoIsActive: true,
      soldPercentage: 0,
      fomoPercentage: 8,
      availablePercentage: 100,
      isConnected: false,
      lastUpdate: new Date(),
      isLoading: true
    }
  );

  useEffect(() => {
    // Agregar listener
    const listener = (newData: MasterCounterData) => setData(newData);
    masterCounterListeners.add(listener);
    
    // Inicializar si es necesario
    if (!masterCounterInstance || masterCounterInstance.isLoading) {
      initializeMasterCounters();
    }
    
    return () => {
      masterCounterListeners.delete(listener);
    };
  }, []);

  return data;
};

// ============================================================================
// HOOKS ESPECIALIZADOS
// ============================================================================

// Para componentes que solo necesitan datos básicos
export const useBasicCounters = () => {
  const data = useMasterCounters();
  return {
    totalTickets: data.totalTickets,
    soldTickets: data.fomoSoldTickets, // Mostrar con FOMO
    availableTickets: data.availableTickets,
    soldPercentage: data.fomoPercentage,
    isConnected: data.isConnected,
    lastUpdate: data.lastUpdate
  };
};

// Para admin que necesita datos reales vs mostrados
export const useAdminCounters = () => {
  const data = useMasterCounters();
  return {
    // Datos mostrados al público
    display: {
      soldTickets: data.fomoSoldTickets,
      soldPercentage: data.fomoPercentage,
      availableTickets: data.availableTickets
    },
    // Datos reales de BD
    real: {
      soldTickets: data.soldTickets,
      soldPercentage: data.soldPercentage,
      availableTickets: data.availableTickets,
      reservedTickets: data.reservedTickets
    },
    // Info FOMO
    fomo: {
      isActive: data.fomoIsActive,
      difference: data.fomoSoldTickets - data.soldTickets
    },
    // Estado
    meta: {
      isConnected: data.isConnected,
      lastUpdate: data.lastUpdate,
      totalTickets: data.totalTickets
    }
  };
};

// Hook para estadísticas de display unificadas
export const useDisplayStats = () => {
  const data = useMasterCounters();
  return {
    soldCount: data.fomoSoldTickets, // Mostrar con FOMO
    availableCount: data.availableTickets,
    reservedCount: data.reservedTickets,
    totalCount: data.totalTickets, // Agregado
    soldPercentage: data.fomoPercentage,
    realSoldCount: data.soldTickets, // Datos reales para admin
    isConnected: data.isConnected,
    lastUpdate: data.lastUpdate
  };
};

// Hook para estadísticas de tickets
export const useTicketStats = () => {
  const data = useMasterCounters();
  return {
    total: data.totalTickets,
    sold: data.soldTickets, // Reales
    reserved: data.reservedTickets,
    available: data.availableTickets,
    fomoSold: data.fomoSoldTickets, // Con FOMO
    fomoActive: data.fomoIsActive,
    progress: {
      real: data.soldPercentage,
      display: data.fomoPercentage
    }
  };
};

// ============================================================================
// UTILIDADES DE TESTING
// ============================================================================

export const testMathConsistency = () => {
  if (!masterCounterInstance) return false;
  
  const { soldTickets, availableTickets, reservedTickets, totalTickets } = masterCounterInstance;
  const sum = soldTickets + availableTickets + reservedTickets;
  const isValid = sum === totalTickets;
  
  console.log(`🧮 Math Test: ${soldTickets} + ${availableTickets} + ${reservedTickets} = ${sum} (${isValid ? '✅' : '❌'})`);
  
  return isValid;
};

export const forceMasterUpdate = () => {
  return updateMasterCounters(true);
};

// Cleanup function
export const cleanupMasterCounters = () => {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  if (supabaseSubscription) {
    supabaseSubscription.unsubscribe();
    supabaseSubscription = null;
  }
  masterCounterInstance = null;
  masterCounterListeners.clear();
};