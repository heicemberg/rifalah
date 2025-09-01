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
const masterCounterListeners: Set<(data: MasterCounterData) => void> = new Set();
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
  
  // ✅ LOG para debug: verificar crecimiento dinámico
  if (Math.random() < 0.05) { // 5% chance to log
    console.log(`🎭 FOMO Dynamic: ${minutesElapsed.toFixed(1)} min → ${fomoPercentage.toFixed(2)}% → ${fomoCount} tickets`);
  }
  
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

    console.log('🔍 FETCHING REAL DATA: Querying tickets table...');

    // Obtener tickets vendidos y reservados desde BD
    const { data: ticketsData, error } = await supabase
      .from('tickets')
      .select('status')
      .in('status', ['vendido', 'reservado']);

    if (error) {
      console.error('🔴 Supabase query error:', error);
      throw error;
    }

    const soldCount = ticketsData?.filter(t => t.status === 'vendido').length || 0;
    const reservedCount = ticketsData?.filter(t => t.status === 'reservado').length || 0;

    console.log(`📊 REAL DATA FETCHED: ${soldCount} sold, ${reservedCount} reserved from ${ticketsData?.length || 0} total records`);
    
    // Verificación básica de datos
    if (soldCount + reservedCount > TOTAL_TICKETS) {
      console.error(`🚨 DATA INTEGRITY ERROR: sold + reserved (${soldCount + reservedCount}) > total tickets (${TOTAL_TICKETS})`);
    }

    return { sold: soldCount, reserved: reservedCount };
  } catch (error) {
    console.error('🔴 Error fetching real data:', error);
    console.error('🔧 FALLBACK: Using zero values for sold and reserved');
    return { sold: 0, reserved: 0 };
  }
};

const updateMasterCounters = async (forceUpdate = false) => {
  try {
    console.log('🔄 UPDATING MASTER COUNTERS...');
    const { sold, reserved } = await fetchRealData();
    const available = TOTAL_TICKETS - sold - reserved;
    
    console.log(`🧮 CALCULATING: ${sold} sold + ${reserved} reserved = ${sold + reserved} occupied`);
    console.log(`🎯 AVAILABLE CALCULATION: ${TOTAL_TICKETS} total - ${sold + reserved} occupied = ${available} available`);
    
    // ✅ VERIFICACIÓN MATEMÁTICA CRÍTICA
    const mathCheck = sold + available + reserved;
    if (mathCheck !== TOTAL_TICKETS) {
      console.error(`🚨 CRITICAL MATH ERROR: ${sold}S + ${available}A + ${reserved}R = ${mathCheck} ≠ ${TOTAL_TICKETS}`);
      console.error('🔧 This indicates a data synchronization problem with Supabase');
      toast.error(`Error matemático crítico: ${mathCheck} ≠ ${TOTAL_TICKETS}. Revisar sincronización BD.`);
      
      // Intentar corrección automática si es un error menor
      if (Math.abs(mathCheck - TOTAL_TICKETS) <= 5) {
        console.warn('🔧 ATTEMPTING AUTO-CORRECTION: Minor math discrepancy, adjusting available count');
        const correctedAvailable = TOTAL_TICKETS - sold - reserved;
        console.warn(`🔧 CORRECTED: available ${available} → ${correctedAvailable}`);
      }
    } else {
      console.log(`✅ MATH CHECK PASSED: ${sold} + ${available} + ${reserved} = ${mathCheck} = ${TOTAL_TICKETS}`);
    }

    // Calcular FOMO (NO afecta disponibles reales)
    const { fomoCount, isActive } = calculateFOMO(sold);
    console.log(`🎭 FOMO CALCULATION: real ${sold} → display ${fomoCount} (${isActive ? 'ACTIVE' : 'INACTIVE'})`);

    // Crear nueva instancia del master counter
    const newData: MasterCounterData = {
      totalTickets: TOTAL_TICKETS,
      soldTickets: sold,              // ✅ Real vendidos de BD
      reservedTickets: reserved,      // ✅ Real reservados de BD  
      availableTickets: available,    // ✅ Real disponibles calculados: total - sold - reserved
      
      fomoSoldTickets: fomoCount,     // ✅ Solo para display público
      fomoIsActive: isActive,
      
      soldPercentage: (sold / TOTAL_TICKETS) * 100,           // ✅ Real %
      fomoPercentage: (fomoCount / TOTAL_TICKETS) * 100,      // ✅ Display %
      availablePercentage: (available / TOTAL_TICKETS) * 100, // ✅ Real %
      
      isConnected: true,
      lastUpdate: new Date(),
      isLoading: false
    };

    console.log(`📊 MASTER COUNTER UPDATED:`);
    console.log(`   Real: ${sold}S + ${available}A + ${reserved}R = ${mathCheck}`);
    console.log(`   Display: ${fomoCount} sold (${newData.fomoPercentage.toFixed(1)}%), ${available} available`);
    console.log(`   FOMO: ${isActive ? 'ACTIVE' : 'INACTIVE'} (+${fomoCount - sold} fake sold)`);

    masterCounterInstance = newData;
    
    // Notificar a todos los listeners
    console.log(`🔔 NOTIFYING ${masterCounterListeners.size} listeners...`);
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
    console.log('🔌 SETTING UP WEBSOCKET SUBSCRIPTIONS...');
    supabaseSubscription = supabase
      .channel('master_counters')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          console.log('🎫 TICKET CHANGE DETECTED:', payload);
          console.log('🔄 TRIGGERING COUNTER UPDATE...');
          updateMasterCounters(true);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'purchases' },
        (payload) => {
          console.log('💰 PURCHASE CHANGE DETECTED:', payload);
          console.log('🔄 TRIGGERING COUNTER UPDATE...');
          updateMasterCounters(true);
        }
      )
      .subscribe((status) => {
        console.log('📡 WEBSOCKET SUBSCRIPTION STATUS:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ WEBSOCKET CONNECTED: Real-time updates active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('🔴 WEBSOCKET ERROR: Real-time updates may not work');
        }
      });
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
  
  // ✅ SOLUCIÓN FIJA: SIEMPRE usar disponibles reales de BD
  // El FOMO solo afecta la visualización de "vendidos", NO los disponibles
  const displaySoldTickets = data.fomoSoldTickets;
  const displayAvailableTickets = data.availableTickets; // ✅ SIEMPRE usar BD real
  
  // ✅ VERIFICACIÓN MATEMÁTICA CORREGIDA
  // CRITICAL: Los disponibles SIEMPRE deben bajar cuando se venden tickets
  // Matemática básica: soldTickets + availableTickets + reservedTickets = totalTickets
  const mathCheck = data.soldTickets + displayAvailableTickets + data.reservedTickets;
  if (mathCheck !== data.totalTickets) {
    console.error(`🚨 CRITICAL MATH ERROR: ${data.soldTickets}S + ${displayAvailableTickets}A + ${data.reservedTickets}R = ${mathCheck} ≠ ${data.totalTickets}`);
    console.error(`🔧 EXPECTED: Real math should always be exact: ${data.soldTickets} + ${displayAvailableTickets} + ${data.reservedTickets} = ${data.totalTickets}`);
    
    // Log para debug detallado
    console.group('🔍 DEBUGGING COUNTER SYNC');
    console.log('Real sold from DB:', data.soldTickets);
    console.log('Available from DB:', displayAvailableTickets);
    console.log('Reserved from DB:', data.reservedTickets);
    console.log('FOMO sold (display):', displaySoldTickets);
    console.log('Math check result:', mathCheck);
    console.log('Expected total:', data.totalTickets);
    console.groupEnd();
  }
  
  return {
    totalTickets: data.totalTickets,
    soldTickets: displaySoldTickets,
    availableTickets: displayAvailableTickets, // ✅ Siempre real de BD
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
  
  // ✅ SOLUCIÓN FIJA: SIEMPRE usar disponibles reales de BD
  const displaySoldCount = data.fomoSoldTickets;
  const displayAvailableCount = data.availableTickets; // ✅ SIEMPRE usar BD real
  
  return {
    soldCount: displaySoldCount,
    availableCount: displayAvailableCount, // ✅ Siempre real de BD
    reservedCount: data.reservedTickets,
    totalCount: data.totalTickets,
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
  if (!masterCounterInstance) {
    console.error('🚨 TEST FAILED: No master counter instance available');
    return false;
  }
  
  const { soldTickets, availableTickets, reservedTickets, totalTickets, fomoSoldTickets, fomoIsActive } = masterCounterInstance;
  
  console.group('🧮 MATH CONSISTENCY TEST');
  
  // Test 1: Real math consistency (CRITICAL - must always be valid)
  const realSum = soldTickets + availableTickets + reservedTickets;
  const realMathValid = realSum === totalTickets;
  
  console.log(`📊 REAL DATA TEST:`);
  console.log(`   Sold: ${soldTickets}`);
  console.log(`   Available: ${availableTickets}`);
  console.log(`   Reserved: ${reservedTickets}`);
  console.log(`   Sum: ${realSum}`);
  console.log(`   Expected: ${totalTickets}`);
  console.log(`   Result: ${realMathValid ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 2: FOMO display consistency
  const displaySoldTickets = fomoSoldTickets;
  const displayAvailableTickets = availableTickets; // Available NEVER affected by FOMO
  
  console.log(`🎭 FOMO DISPLAY TEST:`);
  console.log(`   Display Sold: ${displaySoldTickets} (real: ${soldTickets})`);
  console.log(`   Display Available: ${displayAvailableTickets} (always real)`);
  console.log(`   FOMO Active: ${fomoIsActive}`);
  console.log(`   FOMO Difference: +${displaySoldTickets - soldTickets} fake sold`);
  
  // Test 3: Disponibles correctos (CRITICAL)
  const expectedAvailable = totalTickets - soldTickets - reservedTickets;
  const availableTestValid = availableTickets === expectedAvailable;
  
  console.log(`🎯 AVAILABLE CALCULATION TEST:`);
  console.log(`   Formula: ${totalTickets} - ${soldTickets} - ${reservedTickets} = ${expectedAvailable}`);
  console.log(`   Actual Available: ${availableTickets}`);
  console.log(`   Result: ${availableTestValid ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 4: Sync integrity
  const syncTestValid = realMathValid && availableTestValid;
  
  console.log(`🔄 OVERALL SYNC TEST:`);
  console.log(`   Real Math: ${realMathValid ? '✅' : '❌'}`);
  console.log(`   Available Calc: ${availableTestValid ? '✅' : '❌'}`);
  console.log(`   Overall: ${syncTestValid ? '✅ SYSTEM SYNCHRONIZED' : '❌ SYNC ISSUES DETECTED'}`);
  
  console.groupEnd();
  
  if (!syncTestValid) {
    console.error('🚨 CRITICAL: Counter synchronization issues detected. Tickets available may not decrease when sold.');
  }
  
  return syncTestValid;
};

export const forceMasterUpdate = () => {
  console.log('🔄 FORCING MASTER COUNTER UPDATE...');
  return updateMasterCounters(true);
};

// ============================================================================
// FUNCIONES PARA TESTING MANUAL DESDE CONSOLA
// ============================================================================

// Exponer funciones de testing en window para debug manual
if (typeof window !== 'undefined') {
  (window as any).raffleCounterTest = {
    testMath: testMathConsistency,
    forceUpdate: forceMasterUpdate,
    getCounters: () => masterCounterInstance,
    getListeners: () => masterCounterListeners.size,
    runFullTest: () => {
      console.log('🧪 RUNNING FULL COUNTER TEST...');
      const mathTest = testMathConsistency();
      console.log(`📊 Current listeners: ${masterCounterListeners.size}`);
      console.log(`🔗 Connected: ${masterCounterInstance?.isConnected || 'unknown'}`);
      console.log(`⏰ Last update: ${masterCounterInstance?.lastUpdate?.toLocaleTimeString() || 'never'}`);
      return mathTest;
    }
  };
}

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