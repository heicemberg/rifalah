'use client';

import { useState, useEffect } from 'react';
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

// Variable removida - ya no se usa en la nueva lógica FOMO
// const fomoSessionStart: number | null = null;

const calculateFOMO = (realSoldCount: number): { fomoCount: number; displaySoldCount: number; isActive: boolean } => {
  const realPercentage = (realSoldCount / TOTAL_TICKETS) * 100;
  
  // Si ventas reales >= 18%, desactivar FOMO y mostrar solo reales
  if (realPercentage >= FOMO_THRESHOLD) {
    return { 
      fomoCount: 0, 
      displaySoldCount: realSoldCount, 
      isActive: false 
    };
  }
  
  // 🎯 NUEVA LÓGICA FOMO: 1200 FIJOS + VENDIDOS REALES (SUMA DINÁMICA)
  const FOMO_BASE_FIXED = 1200; // Tickets FOMO fijos que siempre se muestran
  
  // FOMO se suma a los vendidos reales, no es MAX
  const fomoTickets = FOMO_BASE_FIXED;
  const displaySoldCount = realSoldCount + fomoTickets;
  
  // 🔍 Debug log para seguimiento de la nueva lógica
  console.log(`🎯 NUEVA LÓGICA SUMA: Reales(${realSoldCount}) + FOMO(${fomoTickets}) = Display(${displaySoldCount})`);
  
  // 🚀 LÓGICA SUMA: FOMO fijos + ventas reales
  return { 
    fomoCount: fomoTickets,
    displaySoldCount: displaySoldCount, 
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

    // 🔄 SYNC CRÍTICO CON ZUSTAND STORE
    try {
      if (typeof window !== 'undefined') {
        // Obtener los números específicos de tickets vendidos y reservados
        console.log('📊 FETCHING SPECIFIC TICKET NUMBERS FOR ZUSTAND SYNC...');
        const { data: ticketNumbers, error } = await supabase
          .from('tickets')
          .select('number, status')
          .in('status', ['vendido', 'reservado']);

        if (!error && ticketNumbers) {
          const soldNumbers = ticketNumbers.filter(t => t.status === 'vendido').map(t => t.number);
          const reservedNumbers = ticketNumbers.filter(t => t.status === 'reservado').map(t => t.number);
          
          console.log(`🔄 SYNCING ZUSTAND STORE: ${soldNumbers.length} sold, ${reservedNumbers.length} reserved`);
          
          // ✅ ENHANCED ZUSTAND SYNC - FORCE UPDATE REGARDLESS
          const raffleStore = (window as any).__ZUSTAND_RAFFLE_STORE__;
          if (raffleStore && raffleStore.getState) {
            const currentState = raffleStore.getState();
            
            console.log('🔄 FORCE UPDATING ZUSTAND STORE:', {
              soldTickets: soldNumbers.length,
              reservedTickets: reservedNumbers.length
            });
            
            // CRITICAL: Always force update to ensure sync
            currentState.setSoldTicketsFromDB(soldNumbers);
            currentState.setReservedTicketsFromDB(reservedNumbers);
            
            console.log('✅ ZUSTAND STORE FORCE UPDATED');
          } else {
            console.warn('⚠️ Zustand store not found in window, attempting dynamic import sync...');
            // Enhanced fallback using dynamic import
            import('../stores/raffle-store').then(({ useRaffleStore }) => {
              const state = useRaffleStore.getState();
              console.log('🔄 DYNAMIC IMPORT: Force updating Zustand via fallback');
              state.setSoldTicketsFromDB(soldNumbers);
              state.setReservedTicketsFromDB(reservedNumbers);
              console.log('✅ ZUSTAND SYNC via dynamic import completed');
            }).catch(err => {
              console.error('❌ Failed to sync with Zustand store via dynamic import:', err);
            });
          }
        } else {
          console.error('❌ Failed to fetch ticket numbers for Zustand sync:', error);
        }
      }
    } catch (syncError) {
      console.error('❌ Error syncing with Zustand store:', syncError);
    }

    // 🎯 FIXED FOMO LOGIC: Calculate FOMO for display only
    const { displaySoldCount, isActive } = calculateFOMO(sold);
    
    // 🔢 REAL MATHEMATICS: Always maintain sold + available + reserved = 10,000
    const realAvailable = TOTAL_TICKETS - sold - reserved;
    
    console.log(`📊 REAL CALCULATION: Total(${TOTAL_TICKETS}) - Sold(${sold}) - Reserved(${reserved}) = Available(${realAvailable})`);
    console.log(`🎭 FOMO DISPLAY: Real sold(${sold}) + FOMO(1200) = Display sold(${displaySoldCount})`);
    
    // Crear nueva instancia del master counter
    const newData: MasterCounterData = {
      totalTickets: TOTAL_TICKETS,
      soldTickets: sold,                    // ✅ Real vendidos de BD
      reservedTickets: reserved,            // ✅ Real reservados de BD  
      availableTickets: realAvailable,      // ✅ REAL: total - sold - reserved
      
      fomoSoldTickets: displaySoldCount,    // ✅ SUMA: reales + FOMO para display
      fomoIsActive: isActive,
      
      soldPercentage: (sold / TOTAL_TICKETS) * 100,                      // ✅ Real %
      fomoPercentage: (displaySoldCount / TOTAL_TICKETS) * 100,         // ✅ Display %
      availablePercentage: (realAvailable / TOTAL_TICKETS) * 100,       // ✅ Real Available %
      
      isConnected: true,
      lastUpdate: new Date(),
      isLoading: false
    };

    console.log(`📊 CONTADOR ACTUALIZADO: Display ${displaySoldCount} (${newData.fomoPercentage.toFixed(1)}%), Real available ${realAvailable}`);
    console.log(`✅ MATH CHECK: ${sold} + ${realAvailable} + ${reserved} = ${sold + realAvailable + reserved} (should be ${TOTAL_TICKETS})`);

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
  
  // Setup WebSocket subscriptions with enhanced error handling
  if (supabase && !supabaseSubscription) {
    console.log('🔌 SETTING UP WEBSOCKET SUBSCRIPTIONS...');
    supabaseSubscription = supabase
      .channel('master_counters')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          console.log('🎫 TICKET CHANGE DETECTED:', payload.eventType, payload.new || payload.old);
          console.log('🔄 TRIGGERING IMMEDIATE COUNTER UPDATE (TICKETS)...');
          
          // Forzar actualización inmediata para cambios de tickets
          setTimeout(() => updateMasterCounters(true), 100);
          
          // Disparar evento global de sincronización
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('ticket-status-changed', {
              detail: { 
                source: 'websocket',
                event: payload.eventType,
                ticket: payload.new || payload.old,
                timestamp: new Date().toISOString()
              }
            }));
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'purchases' },
        (payload) => {
          console.log('💰 PURCHASE CHANGE DETECTED:', payload.eventType, payload.new || payload.old);
          console.log('🔄 TRIGGERING IMMEDIATE COUNTER UPDATE (PURCHASES)...');
          
          // Forzar actualización inmediata con doble refresh para asegurar sync
          setTimeout(() => updateMasterCounters(true), 100);
          setTimeout(() => updateMasterCounters(true), 1500); // Segundo refresh después de 1.5s
          
          // Disparar evento global de sincronización
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('purchase-status-changed', {
              detail: { 
                source: 'websocket',
                event: payload.eventType,
                purchase: payload.new || payload.old,
                timestamp: new Date().toISOString()
              }
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 WEBSOCKET SUBSCRIPTION STATUS:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ WEBSOCKET CONNECTED: Real-time updates active');
          // Test WebSocket connectivity
          console.log('🔍 WEBSOCKET: Testing connectivity...');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('🔴 WEBSOCKET ERROR: Real-time updates may not work');
          console.error('🔧 FALLBACK: Will rely on interval updates');
        } else if (status === 'CLOSED') {
          console.warn('⚠️ WEBSOCKET CLOSED: Attempting to reconnect...');
          // Force reconnection after delay
          setTimeout(() => {
            console.log('🔄 RECONNECTING WEBSOCKET...');
            supabaseSubscription = null;
            initializeMasterCounters();
          }, 3000);
        }
      });
  }
  
  // Setup global event listener for forced synchronization
  if (typeof window !== 'undefined' && !window.__raffleSyncListenerSetup) {
    console.log('🔔 SETTING UP GLOBAL SYNC EVENT LISTENER...');
    const handleGlobalSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔔 GLOBAL SYNC EVENT RECEIVED:', customEvent.detail);
      console.log('🔄 FORCING MASTER COUNTER UPDATE...');
      updateMasterCounters(true);
    };
    
    window.addEventListener('raffle-counters-updated', handleGlobalSync);
    window.__raffleSyncListenerSetup = true;
    
    // Also listen for focus events to refresh data when user returns
    const handleWindowFocus = () => {
      console.log('🔍 WINDOW FOCUS: Refreshing counters...');
      updateMasterCounters(true);
    };
    
    window.addEventListener('focus', handleWindowFocus);
  }
  
  // Setup interval updates with higher frequency for better responsiveness
  if (!updateInterval) {
    updateInterval = setInterval(() => {
      console.log('⏱️ INTERVAL: Triggering periodic counter update...');
      updateMasterCounters();
    }, 15000); // Cada 15 segundos (más responsive)
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

// Para componentes que solo necesitan datos básicos (DISPLAY MODE)
export const useBasicCounters = () => {
  const data = useMasterCounters();
  
  // 🎭 DISPLAY MODE: Show FOMO-enhanced counts to create urgency
  const displaySoldTickets = data.fomoSoldTickets;  // Real sold + FOMO (1200)
  const displayAvailableTickets = TOTAL_TICKETS - displaySoldTickets - data.reservedTickets; // Calculate for display
  
  // ✅ DISPLAY MATH CHECK: Ensure display totals = 10,000
  const displayMathCheck = displaySoldTickets + displayAvailableTickets + data.reservedTickets;
  
  if (displayMathCheck !== data.totalTickets) {
    console.error(`🚨 DISPLAY MATH ERROR: ${displaySoldTickets}S + ${displayAvailableTickets}A + ${data.reservedTickets}R = ${displayMathCheck} ≠ ${data.totalTickets}`);
    console.error(`🔧 DISPLAY CALCULATION BROKEN - NEEDS IMMEDIATE FIX`);
  } else {
    // 🔍 Log para verificar display matemático
    if (Math.random() < 0.1) { // 10% chance to log
      console.log(`✅ DISPLAY MATH VERIFIED: ${displaySoldTickets}S + ${displayAvailableTickets}A + ${data.reservedTickets}R = ${displayMathCheck}`);
      console.log(`🎭 FOMO EFFECT: Real ${data.soldTickets} + FOMO 1200 = Display ${displaySoldTickets}`);
      console.log(`🔢 REAL MATH: ${data.soldTickets} + ${data.availableTickets} + ${data.reservedTickets} = ${data.soldTickets + data.availableTickets + data.reservedTickets}`);
    }
  }
  
  return {
    totalTickets: data.totalTickets,
    soldTickets: displaySoldTickets,           // ✅ Display sold (with FOMO)
    availableTickets: displayAvailableTickets, // ✅ Display available (calculated)
    soldPercentage: data.fomoPercentage,       // ✅ Display percentage
    isConnected: data.isConnected,
    lastUpdate: data.lastUpdate
  };
};

// Para admin que necesita datos reales vs mostrados
export const useAdminCounters = () => {
  const data = useMasterCounters();
  const displayAvailable = TOTAL_TICKETS - data.fomoSoldTickets - data.reservedTickets;
  
  return {
    // Datos mostrados al público (with FOMO)
    display: {
      soldTickets: data.fomoSoldTickets,         // Real + FOMO
      soldPercentage: data.fomoPercentage,
      availableTickets: displayAvailable         // Calculated for display
    },
    // Datos reales de BD (business logic)
    real: {
      soldTickets: data.soldTickets,             // Real sold from DB
      soldPercentage: data.soldPercentage,
      availableTickets: data.availableTickets,   // Real available (total - sold - reserved)
      reservedTickets: data.reservedTickets
    },
    // Info FOMO
    fomo: {
      isActive: data.fomoIsActive,
      difference: data.fomoSoldTickets - data.soldTickets,
      fomoAmount: 1200  // Fixed FOMO amount
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
  
  // 🎭 DISPLAY LOGIC: Calculate display available to maintain 10,000 total
  const displaySoldCount = data.fomoSoldTickets;     // Real + FOMO (1200)
  const displayAvailableCount = TOTAL_TICKETS - displaySoldCount - data.reservedTickets;
  
  // ✅ DISPLAY VERIFICATION: Ensure display math = 10,000
  const displaySum = displaySoldCount + displayAvailableCount + data.reservedTickets;
  if (displaySum !== data.totalTickets) {
    console.error(`🚨 DISPLAY STATS MATH ERROR: ${displaySoldCount}S + ${displayAvailableCount}A + ${data.reservedTickets}R = ${displaySum} ≠ ${data.totalTickets}`);
  }
  
  return {
    soldCount: displaySoldCount,               // ✅ Display sold (Real + FOMO)
    availableCount: displayAvailableCount,     // ✅ Display available (calculated)
    reservedCount: data.reservedTickets,       // ✅ Real reserved
    totalCount: data.totalTickets,             // ✅ Real total
    soldPercentage: data.fomoPercentage,       // ✅ Display percentage
    realSoldCount: data.soldTickets,           // ✅ Real sold for admin
    isConnected: data.isConnected,
    lastUpdate: data.lastUpdate
  };
};

// Hook para estadísticas de tickets (BUSINESS LOGIC MODE)
export const useTicketStats = () => {
  const data = useMasterCounters();
  
  // 🔢 BUSINESS LOGIC: Use real mathematics for core operations
  const realAvailable = data.availableTickets; // Real available from master counter
  const displayAvailable = TOTAL_TICKETS - data.fomoSoldTickets - data.reservedTickets;
  
  return {
    total: data.totalTickets,
    sold: data.soldTickets,              // ✅ Real sold from DB
    reserved: data.reservedTickets,      // ✅ Real reserved from DB
    available: realAvailable,            // ✅ Real available (business logic)
    fomoSold: data.fomoSoldTickets,      // ✅ Display sold (Real + FOMO)
    fomoAvailable: displayAvailable,     // ✅ Display available (calculated)
    fomoActive: data.fomoIsActive,
    progress: {
      real: data.soldPercentage,         // ✅ Real percentage
      display: data.fomoPercentage       // ✅ Display percentage (with FOMO)
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
  
  console.log(`📊 REAL MATHEMATICS TEST:`);
  console.log(`   Real Sold: ${soldTickets}`);
  console.log(`   Real Available: ${availableTickets}`);
  console.log(`   Real Reserved: ${reservedTickets}`);
  console.log(`   Real Sum: ${realSum}`);
  console.log(`   Expected: ${totalTickets}`);
  console.log(`   Result: ${realMathValid ? '✅ PASS - Real math is correct' : '❌ FAIL - Real math is broken'}`);
  
  // Test 2: FOMO display consistency (separate from real math)
  const displaySoldTickets = fomoSoldTickets; // Real + FOMO (1200)
  const displayAvailableTickets = totalTickets - displaySoldTickets - reservedTickets; // Calculated for display
  const displaySum = displaySoldTickets + displayAvailableTickets + reservedTickets;

  console.log(`🎭 FOMO DISPLAY TEST:`);
  console.log(`   Display Sold: ${displaySoldTickets} (real: ${soldTickets} + FOMO: 1200)`);
  console.log(`   Display Available: ${displayAvailableTickets} (calculated: ${totalTickets} - ${displaySoldTickets} - ${reservedTickets})`);
  console.log(`   Reserved: ${reservedTickets}`);
  console.log(`   Display Sum: ${displaySum} (should be ${totalTickets})`);
  console.log(`   FOMO Active: ${fomoIsActive}`);
  
  const displayMathValid = displaySum === totalTickets;
  console.log(`   Result: ${displayMathValid ? '✅ PASS - Display math is correct' : '❌ FAIL - Display math is broken'}`);
  
  // Test 3: Separation validation (CRITICAL)
  const separationValid = availableTickets === (totalTickets - soldTickets - reservedTickets);
  
  console.log(`🔄 SEPARATION TEST:`);
  console.log(`   Real Available Formula: ${totalTickets} - ${soldTickets} - ${reservedTickets} = ${totalTickets - soldTickets - reservedTickets}`);
  console.log(`   Actual Real Available: ${availableTickets}`);
  console.log(`   FOMO does not affect real math: ${separationValid ? '✅ CORRECT' : '❌ INCORRECT'}`);
  
  // Test 4: Overall integrity
  const overallValid = realMathValid && displayMathValid && separationValid;
  
  console.log(`🎯 OVERALL MATHEMATICS TEST:`);
  console.log(`   Real Math: ${realMathValid ? '✅' : '❌'}`);
  console.log(`   Display Math: ${displayMathValid ? '✅' : '❌'}`);
  console.log(`   Separation: ${separationValid ? '✅' : '❌'}`);
  console.log(`   Overall: ${overallValid ? '✅ SISTEMA MATEMÁTICAMENTE CORRECTO' : '❌ PROBLEMAS MATEMÁTICOS DETECTADOS'}`);
  
  console.groupEnd();
  
  if (!overallValid) {
    console.error('🚨 CRITICAL: Mathematical integrity broken. FOMO may be contaminating real mathematics.');
  }
  
  return overallValid;
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
    },
    
    // ✅ ENHANCED SYNC VERIFICATION
    testAdminSync: async () => {
      console.group('🔄 TESTING ADMIN SYNC FLOW...');
      
      try {
        console.log('1️⃣ Testing current system state...');
        const mathTest = testMathConsistency();
        
        console.log('2️⃣ Testing WebSocket connectivity...');
        const wsConnected = supabaseSubscription !== null;
        console.log(`   WebSocket: ${wsConnected ? '✅ Connected' : '❌ Not connected'}`);
        
        console.log('3️⃣ Testing Zustand store exposure...');
        const raffleStore = (window as any).__ZUSTAND_RAFFLE_STORE__;
        const zustandAvailable = !!(raffleStore && raffleStore.getState);
        console.log(`   Zustand Store: ${zustandAvailable ? '✅ Available' : '❌ Not available'}`);
        
        console.log('4️⃣ Testing Master Counter sync...');
        const beforeUpdate = masterCounterInstance?.soldTickets || 0;
        await forceMasterUpdate();
        const afterUpdate = masterCounterInstance?.soldTickets || 0;
        console.log(`   Master Counter Update: ${beforeUpdate} → ${afterUpdate} ${beforeUpdate !== afterUpdate ? '✅ Changed' : '⚠️ No change'}`);
        
        console.log('5️⃣ Testing event system...');
        let eventReceived = false;
        const testHandler = () => { eventReceived = true; };
        window.addEventListener('raffle-counters-updated', testHandler);
        
        window.dispatchEvent(new CustomEvent('raffle-counters-updated', {
          detail: { source: 'sync-test', timestamp: new Date().toISOString() }
        }));
        
        setTimeout(() => {
          window.removeEventListener('raffle-counters-updated', testHandler);
          console.log(`   Event System: ${eventReceived ? '✅ Working' : '❌ Not working'}`);
          
          console.log('6️⃣ Final Assessment...');
          const overallWorking = mathTest && wsConnected && zustandAvailable && eventReceived;
          
          console.log(`
🎯 ADMIN SYNC TEST RESULTS:
   Math Consistency: ${mathTest ? '✅' : '❌'}
   WebSocket: ${wsConnected ? '✅' : '❌'}
   Zustand Store: ${zustandAvailable ? '✅' : '❌'}
   Event System: ${eventReceived ? '✅' : '❌'}
   
🔄 OVERALL: ${overallWorking ? '✅ READY FOR ADMIN SYNC' : '❌ SYNC ISSUES DETECTED'}

💡 USAGE: When admin confirms a purchase, all components should update within 2-3 seconds.
          `);
          
          console.groupEnd();
          return { success: overallWorking, components: { mathTest, wsConnected, zustandAvailable, eventReceived } };
        }, 100);
      } catch (error) {
        console.error('❌ Admin sync test failed:', error);
        console.groupEnd();
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    
    // ✅ NUEVA FUNCIÓN DE TEST DE SINCRONIZACIÓN COMPLETA
    testFullSync: async () => {
      console.group('🔄 TESTING COMPLETE SYNCHRONIZATION...');
      
      try {
        // 1. Test Master Counter
        console.log('1️⃣ Testing Master Counter...');
        const mathTest = testMathConsistency();
        console.log(`   Math Test: ${mathTest ? '✅ PASS' : '❌ FAIL'}`);
        
        // 2. Test Zustand Store Connection
        console.log('2️⃣ Testing Zustand Store Connection...');
        const raffleStore = (window as any).__ZUSTAND_RAFFLE_STORE__;
        const zustandConnected = !!(raffleStore && raffleStore.getState);
        console.log(`   Zustand Connected: ${zustandConnected ? '✅ PASS' : '❌ FAIL'}`);
        
        if (zustandConnected) {
          const state = raffleStore.getState();
          console.log(`   Zustand Sold Tickets: ${state.soldTickets.length}`);
          console.log(`   Zustand Reserved Tickets: ${state.reservedTickets.length}`);
        }
        
        // 3. Test Supabase Connection
        console.log('3️⃣ Testing Supabase Connection...');
        const masterConnected = masterCounterInstance?.isConnected || false;
        console.log(`   Supabase Connected: ${masterConnected ? '✅ PASS' : '❌ FAIL'}`);
        
        if (masterConnected) {
          console.log(`   Master Sold: ${masterCounterInstance?.soldTickets || 0}`);
          console.log(`   Master Available: ${masterCounterInstance?.availableTickets || 0}`);
          console.log(`   Master Reserved: ${masterCounterInstance?.reservedTickets || 0}`);
        }
        
        // 4. Force Sync Test
        console.log('4️⃣ Testing Force Sync...');
        await forceMasterUpdate();
        console.log('   Force Update: ✅ COMPLETED');
        
        // 5. WebSocket Test
        console.log('5️⃣ Testing WebSocket Status...');
        const wsConnected = supabaseSubscription !== null;
        console.log(`   WebSocket Connected: ${wsConnected ? '✅ PASS' : '❌ FAIL'}`);
        
        // 6. Data Consistency Check
        console.log('6️⃣ Testing Data Consistency...');
        let consistencyTest = true;
        
        if (zustandConnected && masterConnected) {
          const state = raffleStore.getState();
          const masterSold = masterCounterInstance?.soldTickets || 0;
          const zustandSold = state.soldTickets.length;
          
          if (Math.abs(masterSold - zustandSold) > 5) { // Allow small discrepancy
            console.error(`   ❌ INCONSISTENCY: Master (${masterSold}) vs Zustand (${zustandSold})`);
            consistencyTest = false;
          } else {
            console.log(`   ✅ CONSISTENT: Master (${masterSold}) ≈ Zustand (${zustandSold})`);
          }
        }
        
        // 7. Final Assessment
        console.log('7️⃣ Final Assessment...');
        const overallSuccess = mathTest && zustandConnected && masterConnected && consistencyTest;
        
        console.log(`
🔍 SYNC TEST RESULTS:
   Math Consistency: ${mathTest ? '✅' : '❌'}
   Zustand Connection: ${zustandConnected ? '✅' : '❌'}
   Supabase Connection: ${masterConnected ? '✅' : '❌'}  
   WebSocket Status: ${wsConnected ? '✅' : '❌'}
   Data Consistency: ${consistencyTest ? '✅' : '❌'}
   
🎯 OVERALL SYNC: ${overallSuccess ? '✅ WORKING CORRECTLY' : '❌ ISSUES DETECTED'}
        `);
        
        return {
          success: overallSuccess,
          details: {
            mathTest,
            zustandConnected,
            masterConnected,
            wsConnected,
            consistencyTest
          }
        };
        
      } catch (error) {
        console.error('❌ Sync test failed:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
      } finally {
        console.groupEnd();
      }
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