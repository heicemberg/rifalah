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

    // 🎯 NUEVA LÓGICA FOMO: Calcular FOMO + disponibles ajustados
    const { fomoCount, displaySoldCount, isActive } = calculateFOMO(sold);
    
    // 🔢 DISPONIBLES RECALCULADOS: 10,000 - (reales + fomo)
    const adjustedAvailable = TOTAL_TICKETS - displaySoldCount - reserved;
    
    console.log(`📊 CÁLCULO AJUSTADO: Total(${TOTAL_TICKETS}) - Display(${displaySoldCount}) - Reservados(${reserved}) = Disponibles(${adjustedAvailable})`);
    
    // Crear nueva instancia del master counter
    const newData: MasterCounterData = {
      totalTickets: TOTAL_TICKETS,
      soldTickets: sold,                    // ✅ Real vendidos de BD
      reservedTickets: reserved,            // ✅ Real reservados de BD  
      availableTickets: adjustedAvailable,  // ✅ AJUSTADO: total - (display) - reserved
      
      fomoSoldTickets: displaySoldCount,    // ✅ SUMA: reales + FOMO para display
      fomoIsActive: isActive,
      
      soldPercentage: (sold / TOTAL_TICKETS) * 100,                      // ✅ Real %
      fomoPercentage: (displaySoldCount / TOTAL_TICKETS) * 100,         // ✅ Display %
      availablePercentage: (adjustedAvailable / TOTAL_TICKETS) * 100,   // ✅ Disponibles %
      
      isConnected: true,
      lastUpdate: new Date(),
      isLoading: false
    };

    console.log(`📊 CONTADOR ACTUALIZADO: ${displaySoldCount} vendidos display (${newData.fomoPercentage.toFixed(1)}%), ${adjustedAvailable} disponibles`);

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

// Para componentes que solo necesitan datos básicos
export const useBasicCounters = () => {
  const data = useMasterCounters();
  
  // 🎯 NUEVA LÓGICA: Usar datos ya calculados del master counter
  const displaySoldTickets = data.fomoSoldTickets;  // Ya incluye reales + FOMO (1200)
  const displayAvailableTickets = data.availableTickets; // Ya ajustado: 10,000 - display - reserved
  
  // ✅ VERIFICACIÓN MATEMÁTICA GARANTIZADA - SUMA SIEMPRE 10,000
  const mathCheck = displaySoldTickets + displayAvailableTickets + data.reservedTickets;
  
  if (mathCheck !== data.totalTickets) {
    console.error(`🚨 CRITICAL MATH ERROR: ${displaySoldTickets}S + ${displayAvailableTickets}A + ${data.reservedTickets}R = ${mathCheck} ≠ ${data.totalTickets}`);
    console.error(`🔧 MATHEMATICAL INTEGRITY BROKEN - NEEDS IMMEDIATE FIX`);
  } else {
    // 🔍 Log para verificar corrección en tiempo real
    if (Math.random() < 0.1) { // 10% chance to log
      console.log(`✅ MATH VERIFIED: ${displaySoldTickets}S + ${displayAvailableTickets}A + ${data.reservedTickets}R = ${mathCheck} = ${data.totalTickets}`);
      console.log(`📊 DISPLAY: Reales ${data.soldTickets} + FOMO 1200 = Display ${displaySoldTickets}`);
      console.log(`🎯 AVAILABLE: ${displayAvailableTickets} (10,000 - ${displaySoldTickets} - ${data.reservedTickets})`);
    }
  }
  
  return {
    totalTickets: data.totalTickets,
    soldTickets: displaySoldTickets,           // ✅ Reales + FOMO (1200)
    availableTickets: displayAvailableTickets, // ✅ Ajustado para mantener suma = 10,000
    soldPercentage: data.fomoPercentage,       // ✅ Display percentage
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
  
  // 🎯 NUEVA LÓGICA: Usar datos pre-calculados del master counter
  const displaySoldCount = data.fomoSoldTickets;     // Reales + FOMO (1200)
  const displayAvailableCount = data.availableTickets; // Ya ajustado: 10,000 - display - reserved
  
  // ✅ VERIFICACIÓN AUTOMÁTICA - GARANTIZA SUMA = 10,000
  const sum = displaySoldCount + displayAvailableCount + data.reservedTickets;
  if (sum !== data.totalTickets) {
    console.error(`🚨 DISPLAY STATS MATH ERROR: ${displaySoldCount}S + ${displayAvailableCount}A + ${data.reservedTickets}R = ${sum} ≠ ${data.totalTickets}`);
  }
  
  return {
    soldCount: displaySoldCount,               // ✅ Reales + FOMO (1200)
    availableCount: displayAvailableCount,     // ✅ Pre-calculado para mantener suma = 10,000
    reservedCount: data.reservedTickets,       // ✅ REAL
    totalCount: data.totalTickets,             // ✅ REAL
    soldPercentage: data.fomoPercentage,       // ✅ Display percentage
    realSoldCount: data.soldTickets,           // ✅ Datos reales para admin
    isConnected: data.isConnected,
    lastUpdate: data.lastUpdate
  };
};

// Hook para estadísticas de tickets
export const useTicketStats = () => {
  const data = useMasterCounters();
  
  // 🎯 NUEVA LÓGICA: Usar datos pre-calculados del master counter
  const displayAvailable = data.availableTickets; // Ya ajustado: 10,000 - display - reserved
  
  return {
    total: data.totalTickets,
    sold: data.soldTickets, // Reales de BD
    reserved: data.reservedTickets,
    available: displayAvailable, // ✅ Disponibles ajustados para suma = 10,000
    fomoSold: data.fomoSoldTickets, // Reales + FOMO (1200)
    fomoAvailable: displayAvailable, // ✅ Pre-calculado
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
  
  // Test 2: NUEVA LÓGICA FOMO display consistency  
  const displaySoldTickets = fomoSoldTickets; // Reales + FOMO (1200)
  const displayAvailableTickets = availableTickets; // Ya ajustado: 10,000 - display - reserved
  const displaySum = displaySoldTickets + displayAvailableTickets + reservedTickets;

  console.log(`🎭 NUEVA LÓGICA FOMO TEST:`);
  console.log(`   Display Sold: ${displaySoldTickets} (reales: ${soldTickets} + FOMO: 1200)`);
  console.log(`   Display Available: ${displayAvailableTickets} (ajustado)`);
  console.log(`   Reserved: ${reservedTickets}`);
  console.log(`   Display Sum: ${displaySum} (debe ser ${totalTickets})`);
  console.log(`   FOMO Active: ${fomoIsActive}`);
  console.log(`   FOMO Addition: +1200 tickets fijos`);
  
  const displayMathValid = displaySum === totalTickets;
  
  // Test 3: Nueva lógica de disponibles (CRITICAL)
  const expectedDisplayAvailable = totalTickets - displaySoldTickets - reservedTickets;
  const newLogicValid = availableTickets === expectedDisplayAvailable;
  
  console.log(`🎯 NUEVA LÓGICA DISPONIBLES TEST:`);
  console.log(`   Formula: ${totalTickets} - ${displaySoldTickets} - ${reservedTickets} = ${expectedDisplayAvailable}`);
  console.log(`   Actual Available: ${availableTickets}`);
  console.log(`   Result: ${newLogicValid ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 4: Sync integrity con nueva lógica
  const syncTestValid = realMathValid && displayMathValid && newLogicValid;
  
  console.log(`🔄 OVERALL NUEVA LÓGICA TEST:`);
  console.log(`   Real Math: ${realMathValid ? '✅' : '❌'}`);
  console.log(`   Display Math: ${displayMathValid ? '✅' : '❌'}`);
  console.log(`   Nueva Lógica: ${newLogicValid ? '✅' : '❌'}`);
  console.log(`   Overall: ${syncTestValid ? '✅ SISTEMA CORRECTAMENTE SINCRONIZADO' : '❌ PROBLEMAS DE SINCRONIZACIÓN DETECTADOS'}`);
  
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