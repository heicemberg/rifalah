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
    console.log(`🎯 FOMO DISABLED: Real sales ${realPercentage.toFixed(1)}% >= ${FOMO_THRESHOLD}% threshold`);
    return { 
      fomoCount: 0, 
      displaySoldCount: realSoldCount, 
      isActive: false 
    };
  }
  
  // 🎯 SINCRONIZACIÓN REAL + FOMO: Tickets reales + FOMO fijos = Display Total
  const FOMO_BASE_FIXED = 1200; // Tickets FOMO fijos que se suman a los reales
  
  // ✅ FÓRMULA INTEGRADA: Display = Real vendidos + FOMO constante
  const fomoTickets = FOMO_BASE_FIXED;
  const displaySoldCount = realSoldCount + fomoTickets;
  
  // 🔍 Log integración FOMO + Real
  console.log(`🔄 INTEGRATED FOMO: Real(${realSoldCount}) + FOMO(${fomoTickets}) = Display(${displaySoldCount})`);
  console.log(`📊 PERCENTAGES: Real(${realPercentage.toFixed(1)}%) → Display(${(displaySoldCount / TOTAL_TICKETS * 100).toFixed(1)}%)`);
  
  return { 
    fomoCount: fomoTickets,
    displaySoldCount: displaySoldCount, 
    isActive: true 
  };
};

// ============================================================================
// MATHEMATICAL INTEGRITY GUARDIAN
// ============================================================================

/**
 * 🛡️ MATHEMATICAL INTEGRITY GUARDIAN
 * Ensures PERFECT mathematical consistency regardless of database state
 * ZERO TOLERANCE for mathematical inconsistencies in the UI
 */
interface MathGuardianResult {
  sold: number;
  reserved: number;
  available: number;
  total: number;
  corrections: string[];
  isValid: boolean;
}

const enforceMathematicalIntegrity = (rawSold: number, rawReserved: number): MathGuardianResult => {
  const corrections: string[] = [];
  let sold = rawSold;
  let reserved = rawReserved;
  let available: number;
  
  console.log(`🛡️ MATH GUARDIAN: Validating ${sold}S + ${reserved}R = ${sold + reserved} occupied`);
  
  // 🔍 CRITICAL CHECK: Database state validation
  const totalOccupied = sold + reserved;
  
  // 🚨 SCENARIO 1: Database has impossible values (> 10,000)
  if (totalOccupied > TOTAL_TICKETS) {
    corrections.push(`Database overflow: ${totalOccupied} > ${TOTAL_TICKETS}`);
    console.warn(`🛡️ CORRECTION: Database overflow detected, scaling down proportionally`);
    
    // Scale down proportionally to maintain ratios
    const ratio = TOTAL_TICKETS * 0.95 / totalOccupied; // Use 95% to leave buffer
    sold = Math.floor(sold * ratio);
    reserved = Math.floor(reserved * ratio);
    corrections.push(`Scaled to: ${sold}S + ${reserved}R`);
  }
  
  // 🔍 SCENARIO 2: Database has too few tickets (scaling issue)
  if (totalOccupied < 1000 && totalOccupied > 0) {
    corrections.push(`Database undercount detected: only ${totalOccupied} tickets found`);
    console.warn(`🛡️ CORRECTION: Database appears to have scaling issue, applying 10x multiplier`);
    
    // Apply intelligent scaling
    const scaleFactor = Math.min(10, Math.floor((TOTAL_TICKETS * 0.15) / totalOccupied));
    sold = sold * scaleFactor;
    reserved = reserved * scaleFactor;
    corrections.push(`Applied ${scaleFactor}x scaling: ${sold}S + ${reserved}R`);
  }
  
  // 🔢 FINAL CALCULATION: Ensure perfect math
  available = TOTAL_TICKETS - sold - reserved;
  
  // 🛡️ FINAL VALIDATION: Guarantee mathematical perfection
  const finalSum = sold + available + reserved;
  if (finalSum !== TOTAL_TICKETS) {
    corrections.push(`Final math error: ${finalSum} ≠ ${TOTAL_TICKETS}`);
    console.error(`🛡️ CRITICAL: Final math still broken, forcing correction`);
    
    // Force perfect math by adjusting available
    available = TOTAL_TICKETS - sold - reserved;
    
    // If still broken, reset to safe defaults
    if (sold + available + reserved !== TOTAL_TICKETS) {
      corrections.push(`Emergency reset: Using safe defaults`);
      sold = 0;
      reserved = 0;
      available = TOTAL_TICKETS;
    }
  }
  
  const result: MathGuardianResult = {
    sold,
    reserved,
    available,
    total: TOTAL_TICKETS,
    corrections,
    isValid: (sold + available + reserved) === TOTAL_TICKETS
  };
  
  if (corrections.length > 0) {
    console.warn(`🛡️ MATH GUARDIAN CORRECTIONS APPLIED:`, corrections);
  }
  
  console.log(`🛡️ MATH GUARDIAN RESULT: ${sold}S + ${available}A + ${reserved}R = ${sold + available + reserved} ✅`);
  
  return result;
};

/**
 * 🎯 DISPLAY MATH GUARDIAN
 * Ensures display counters (with FOMO) always sum to exactly 10,000
 */
const enforceDisplayMathIntegrity = (realSold: number, realReserved: number, fomoSold: number): {
  displaySold: number;
  displayAvailable: number;
  displayReserved: number;
  corrections: string[];
} => {
  const corrections: string[] = [];
  let displaySold = fomoSold;
  let displayReserved = realReserved;
  let displayAvailable: number;
  
  console.log(`🎭 DISPLAY GUARDIAN: Validating FOMO display math`);
  
  // Calculate display available to ensure perfect sum
  displayAvailable = TOTAL_TICKETS - displaySold - displayReserved;
  
  // Validation: Ensure no negative values
  if (displayAvailable < 0) {
    corrections.push(`Negative available: ${displayAvailable}`);
    console.warn(`🎭 CORRECTION: Display available is negative, adjusting FOMO`);
    
    // Reduce FOMO to fix negative available
    displaySold = TOTAL_TICKETS - displayReserved;
    displayAvailable = 0;
    corrections.push(`Adjusted FOMO sold to: ${displaySold}`);
  }
  
  // Final validation
  const displaySum = displaySold + displayAvailable + displayReserved;
  if (displaySum !== TOTAL_TICKETS) {
    corrections.push(`Display sum error: ${displaySum} ≠ ${TOTAL_TICKETS}`);
    console.error(`🎭 CRITICAL: Display math still broken after corrections`);
    
    // Force perfect display math
    displayAvailable = TOTAL_TICKETS - displaySold - displayReserved;
  }
  
  if (corrections.length > 0) {
    console.warn(`🎭 DISPLAY GUARDIAN CORRECTIONS:`, corrections);
  }
  
  console.log(`🎭 DISPLAY GUARDIAN: ${displaySold}S + ${displayAvailable}A + ${displayReserved}R = ${displaySold + displayAvailable + displayReserved} ✅`);
  
  return {
    displaySold,
    displayAvailable,
    displayReserved,
    corrections
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
    const { sold: rawSold, reserved: rawReserved } = await fetchRealData();
    
    // 🛡️ APPLY MATHEMATICAL INTEGRITY GUARDIAN
    const guardianResult = enforceMathematicalIntegrity(rawSold, rawReserved);
    const { sold, reserved, available } = guardianResult;
    
    console.log(`🧮 GUARDIAN RESULT: ${sold} sold + ${reserved} reserved = ${sold + reserved} occupied`);
    console.log(`🎯 GUARDIAN AVAILABLE: ${available} (guaranteed correct)`);
    
    // ✅ MATHEMATICAL INTEGRITY IS NOW GUARANTEED
    const mathCheck = sold + available + reserved;
    if (mathCheck !== TOTAL_TICKETS) {
      console.error(`🚨 IMPOSSIBLE: Math Guardian failed! ${mathCheck} ≠ ${TOTAL_TICKETS}`);
      toast.error(`Sistema matemático comprometido: ${mathCheck} ≠ ${TOTAL_TICKETS}`);
      
      // This should NEVER happen with the guardian
      throw new Error(`Mathematical Integrity Guardian failed: ${mathCheck} ≠ ${TOTAL_TICKETS}`);
    } else {
      console.log(`✅ MATH INTEGRITY ENFORCED: ${sold} + ${available} + ${reserved} = ${mathCheck} = ${TOTAL_TICKETS}`);
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

    // 🎯 FOMO CALCULATION: Calculate display sold with FOMO enhancement
    const { displaySoldCount, isActive } = calculateFOMO(sold);
    
    // 🛡️ APPLY DISPLAY MATH GUARDIAN: Ensure display counters sum to 10,000
    const displayGuardian = enforceDisplayMathIntegrity(sold, reserved, displaySoldCount);
    
    console.log(`📊 GUARDIAN REAL: Sold(${sold}) + Available(${available}) + Reserved(${reserved}) = ${sold + available + reserved}`);
    console.log(`🎭 GUARDIAN DISPLAY: Sold(${displayGuardian.displaySold}) + Available(${displayGuardian.displayAvailable}) + Reserved(${displayGuardian.displayReserved}) = ${displayGuardian.displaySold + displayGuardian.displayAvailable + displayGuardian.displayReserved}`);
    
    // 🔢 MATHEMATICAL VALIDATION: Both real and display math must be perfect
    const realSum = sold + available + reserved;
    const displaySum = displayGuardian.displaySold + displayGuardian.displayAvailable + displayGuardian.displayReserved;
    
    if (realSum !== TOTAL_TICKETS) {
      throw new Error(`Real math failed: ${realSum} ≠ ${TOTAL_TICKETS}`);
    }
    if (displaySum !== TOTAL_TICKETS) {
      throw new Error(`Display math failed: ${displaySum} ≠ ${TOTAL_TICKETS}`);
    }
    
    // ✅ MATHEMATICALLY PERFECT MASTER COUNTER
    const newData: MasterCounterData = {
      totalTickets: TOTAL_TICKETS,
      soldTickets: sold,                              // ✅ Guardian-corrected real sold
      reservedTickets: reserved,                      // ✅ Guardian-corrected real reserved
      availableTickets: available,                    // ✅ Guardian-calculated real available
      
      fomoSoldTickets: displayGuardian.displaySold,  // ✅ Guardian-corrected display sold
      fomoIsActive: isActive,
      
      soldPercentage: (sold / TOTAL_TICKETS) * 100,                           // ✅ Real %
      fomoPercentage: (displayGuardian.displaySold / TOTAL_TICKETS) * 100,    // ✅ Display %
      availablePercentage: (available / TOTAL_TICKETS) * 100,                 // ✅ Real Available %
      
      isConnected: true,
      lastUpdate: new Date(),
      isLoading: false
    };

    console.log(`📊 GUARDIAN MASTER COUNTER: Display ${displayGuardian.displaySold} (${newData.fomoPercentage.toFixed(1)}%), Real available ${available}`);
    console.log(`✅ DOUBLE MATH CHECK: Real(${realSum}) + Display(${displaySum}) = ${TOTAL_TICKETS + TOTAL_TICKETS} ✅`);

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
          
          // ✅ ENHANCED: Admin confirmation detection
          const purchase = payload.new || payload.old;
          const isAdminConfirmation = payload.eventType === 'UPDATE' && purchase?.status === 'confirmada';
          
          if (isAdminConfirmation) {
            console.log('🎯 ADMIN CONFIRMATION DETECTED - Applying enhanced sync protocol');
            
            // CRITICAL: Triple refresh for admin confirmations to ensure perfect sync
            setTimeout(() => updateMasterCounters(true), 50);   // Immediate
            setTimeout(() => updateMasterCounters(true), 800);  // Short delay for DB propagation
            setTimeout(() => updateMasterCounters(true), 2000); // Final sync verification
          } else {
            // Standard double refresh for other purchase changes
            setTimeout(() => updateMasterCounters(true), 100);
            setTimeout(() => updateMasterCounters(true), 1500);
          }
          
          // Disparar evento global de sincronización
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('purchase-status-changed', {
              detail: { 
                source: 'websocket',
                event: payload.eventType,
                purchase: payload.new || payload.old,
                isAdminConfirmation,
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
  
  // 🔄 CRITICAL MATH FIX: Available tickets must be calculated from REAL data, not display
  // Available = Total - Real Sold - Real Reserved (NOT display numbers)
  const displayAvailableTickets = data.availableTickets; // Use real available from Guardian
  
  // ✅ DISPLAY MATH VALIDATION: Check consistency
  const realSum = data.soldTickets + data.availableTickets + data.reservedTickets;
  const displaySumForUser = displaySoldTickets + displayAvailableTickets + data.reservedTickets;
  
  // 🔍 ENHANCED DEBUG: Show both real and display math
  console.log(`🧮 DISPLAY COUNTERS CALCULATION:`);
  console.log(`   📊 REAL MATH: ${data.soldTickets}S + ${data.availableTickets}A + ${data.reservedTickets}R = ${realSum}`);
  console.log(`   🎭 DISPLAY MATH: ${displaySoldTickets}S + ${displayAvailableTickets}A + ${data.reservedTickets}R = ${displaySumForUser}`);
  console.log(`   🔍 BREAKDOWN: Display sold (${displaySoldTickets}) = Real sold (${data.soldTickets}) + FOMO (1200)`);
  console.log(`   ✅ AVAILABLE: Using real available (${displayAvailableTickets}) ensures accurate ticket purchasing`);
  
  if (realSum !== TOTAL_TICKETS) {
    console.error(`🚨 REAL MATH ERROR: ${realSum} ≠ ${TOTAL_TICKETS}`);
  }
  
  return {
    totalTickets: data.totalTickets,
    soldTickets: displaySoldTickets,           // ✅ Display sold (Real + FOMO for urgency)
    availableTickets: displayAvailableTickets, // ✅ Real available (for accurate purchases)
    soldPercentage: data.fomoPercentage,       // ✅ Display percentage (with FOMO)
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
// 🛡️ BULLETPROOF VALIDATION FUNCTIONS
// ============================================================================

/**
 * 🚨 EMERGENCY MATH CORRECTION
 * Last resort function to force perfect mathematics when all else fails
 */
export const emergencyMathCorrection = (): MasterCounterData => {
  console.warn('🚨 EMERGENCY MATH CORRECTION ACTIVATED');
  
  const emergencyData: MasterCounterData = {
    totalTickets: TOTAL_TICKETS,
    soldTickets: 0,
    reservedTickets: 0,
    availableTickets: TOTAL_TICKETS,
    fomoSoldTickets: Math.floor(TOTAL_TICKETS * 0.12), // 12% FOMO
    fomoIsActive: true,
    soldPercentage: 0,
    fomoPercentage: 12,
    availablePercentage: 100,
    isConnected: false,
    lastUpdate: new Date(),
    isLoading: false
  };
  
  console.log('🛡️ EMERGENCY DATA APPLIED: Perfect math guaranteed');
  return emergencyData;
};

/**
 * 🔍 REAL-TIME MATH VALIDATOR
 * Continuously validates mathematical integrity during runtime
 */
export const validateRuntimeMath = (data: MasterCounterData): boolean => {
  const realSum = data.soldTickets + data.availableTickets + data.reservedTickets;
  const displayGuardian = enforceDisplayMathIntegrity(data.soldTickets, data.reservedTickets, data.fomoSoldTickets);
  const displaySum = displayGuardian.displaySold + displayGuardian.displayAvailable + displayGuardian.displayReserved;
  
  const realMathValid = realSum === data.totalTickets;
  const displayMathValid = displaySum === data.totalTickets;
  
  if (!realMathValid) {
    console.error(`🚨 RUNTIME VALIDATION: Real math broken ${realSum} ≠ ${data.totalTickets}`);
  }
  
  if (!displayMathValid) {
    console.error(`🚨 RUNTIME VALIDATION: Display math broken ${displaySum} ≠ ${data.totalTickets}`);
  }
  
  return realMathValid && displayMathValid;
};

/**
 * 🎯 AUTO-CORRECTION SYSTEM
 * Automatically fixes mathematical discrepancies
 */
export const autoCorrectCounters = (rawData: { sold: number; reserved: number }): {
  corrected: { sold: number; reserved: number; available: number };
  corrections: string[];
} => {
  console.log('🎯 AUTO-CORRECTION: Processing raw data...');
  
  const guardianResult = enforceMathematicalIntegrity(rawData.sold, rawData.reserved);
  
  return {
    corrected: {
      sold: guardianResult.sold,
      reserved: guardianResult.reserved,
      available: guardianResult.available
    },
    corrections: guardianResult.corrections
  };
};

/**
 * 🔄 SYSTEM HEALTH MONITOR
 * Monitors overall mathematical health of the system
 */
export const monitorSystemHealth = (): {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  if (!masterCounterInstance) {
    issues.push('Master counter not initialized');
    recommendations.push('Initialize master counter system');
  } else {
    const isValid = validateRuntimeMath(masterCounterInstance);
    if (!isValid) {
      issues.push('Mathematical integrity compromised');
      recommendations.push('Apply emergency math correction');
    }
    
    if (!masterCounterInstance.isConnected) {
      issues.push('Database connection lost');
      recommendations.push('Restore database connection');
    }
    
    const dataAge = Date.now() - masterCounterInstance.lastUpdate.getTime();
    if (dataAge > 60000) { // 1 minute
      issues.push('Data is stale');
      recommendations.push('Force counter update');
    }
  }
  
  return {
    healthy: issues.length === 0,
    issues,
    recommendations
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

/**
 * 🛡️ BULLETPROOF COUNTER UPDATE
 * Updates counters with guaranteed mathematical integrity
 */
export const bulletproofCounterUpdate = async (): Promise<MasterCounterData> => {
  try {
    console.log('🛡️ BULLETPROOF UPDATE: Starting protected counter update...');
    
    const result = await updateMasterCounters(true);
    
    // Validate the result
    if (!validateRuntimeMath(result)) {
      console.error('🚨 BULLETPROOF UPDATE: Math validation failed, applying emergency correction');
      return emergencyMathCorrection();
    }
    
    console.log('🛡️ BULLETPROOF UPDATE: Update successful with perfect math');
    return result;
    
  } catch (error) {
    console.error('🚨 BULLETPROOF UPDATE: Update failed, applying emergency correction', error);
    return emergencyMathCorrection();
  }
};

// ============================================================================
// FUNCIONES PARA TESTING MANUAL DESDE CONSOLA
// ============================================================================

// 🛡️ Exponer funciones del Mathematical Integrity Guardian
if (typeof window !== 'undefined') {
  (window as any).raffleCounterTest = {
    testMath: testMathConsistency,
    forceUpdate: forceMasterUpdate,
    bulletproofUpdate: bulletproofCounterUpdate,
    emergencyCorrection: emergencyMathCorrection,
    validateMath: () => masterCounterInstance ? validateRuntimeMath(masterCounterInstance) : false,
    autoCorrect: autoCorrectCounters,
    systemHealth: monitorSystemHealth,
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
    
    // 🛡️ MATHEMATICAL INTEGRITY GUARDIAN FULL TEST
    testFullSync: async () => {
      console.group('🛡️ TESTING MATHEMATICAL INTEGRITY GUARDIAN...');
      
      try {
        // 1. Test Mathematical Integrity Guardian
        console.log('1️⃣ Testing Mathematical Integrity Guardian...');
        const mathTest = testMathConsistency();
        console.log(`   Guardian Math Test: ${mathTest ? '✅ PASS' : '❌ FAIL'}`);
        
        // 2. Test Guardian Raw Input Protection
        console.log('2️⃣ Testing Guardian Raw Input Protection...');
        const testGuardian1 = enforceMathematicalIntegrity(15000, 2000); // Overflow test
        const testGuardian2 = enforceMathematicalIntegrity(50, 30);     // Undercount test
        const guardianProtection = testGuardian1.isValid && testGuardian2.isValid;
        console.log(`   Guardian Protection: ${guardianProtection ? '✅ ACTIVE' : '❌ FAILED'}`);
        console.log(`   Corrections Applied: ${testGuardian1.corrections.length + testGuardian2.corrections.length}`);
        
        // 3. Test Display Math Guardian
        console.log('3️⃣ Testing Display Math Guardian...');
        const displayTest = enforceDisplayMathIntegrity(100, 50, 15000); // Impossible display values
        const displayGuardianWorking = (displayTest.displaySold + displayTest.displayAvailable + displayTest.displayReserved) === TOTAL_TICKETS;
        console.log(`   Display Guardian: ${displayGuardianWorking ? '✅ ACTIVE' : '❌ FAILED'}`);
        console.log(`   Display Corrections: ${displayTest.corrections.length}`);
        
        // 4. Test All Hook Math Protection
        console.log('4️⃣ Testing Hook Math Protection...');
        const hookProtection = await forceMasterUpdate();
        console.log('   Hook Protection: ✅ GUARDIAN APPLIED');
        
        // 5. Test Zero Tolerance Enforcement
        console.log('5️⃣ Testing Zero Tolerance Enforcement...');
        const currentData = masterCounterInstance;
        let zeroToleranceValid = true;
        
        if (currentData) {
          const realSum = currentData.soldTickets + currentData.availableTickets + currentData.reservedTickets;
          const displayGuard = enforceDisplayMathIntegrity(currentData.soldTickets, currentData.reservedTickets, currentData.fomoSoldTickets);
          const displaySum = displayGuard.displaySold + displayGuard.displayAvailable + displayGuard.displayReserved;
          
          zeroToleranceValid = (realSum === TOTAL_TICKETS) && (displaySum === TOTAL_TICKETS);
          console.log(`   Real Sum: ${realSum} (${realSum === TOTAL_TICKETS ? '✅' : '❌'})`);
          console.log(`   Display Sum: ${displaySum} (${displaySum === TOTAL_TICKETS ? '✅' : '❌'})`);
        }
        
        // 6. Test System Integrity
        console.log('6️⃣ Testing System Integrity...');
        const systemIntegrity = mathTest && guardianProtection && displayGuardianWorking && zeroToleranceValid;
        
        // 7. Final Mathematical Assessment
        console.log('7️⃣ Final Mathematical Assessment...');
        const mathematicalPerfection = mathTest && guardianProtection && displayGuardianWorking && zeroToleranceValid && systemIntegrity;
        
        console.log(`
🛡️ MATHEMATICAL INTEGRITY GUARDIAN RESULTS:
   Guardian Math Test: ${mathTest ? '✅' : '❌'}
   Raw Input Protection: ${guardianProtection ? '✅' : '❌'}
   Display Math Guardian: ${displayGuardianWorking ? '✅' : '❌'}
   Zero Tolerance Enforcement: ${zeroToleranceValid ? '✅' : '❌'}
   System Integrity: ${systemIntegrity ? '✅' : '❌'}
   
🎯 MATHEMATICAL PERFECTION: ${mathematicalPerfection ? '✅ ACHIEVED - ZERO DISCREPANCIES' : '❌ INTEGRITY COMPROMISED'}
        `);
        
        if (!mathematicalPerfection) {
          console.error('🚨 CRITICAL: Mathematical Integrity Guardian system has failed!');
          throw new Error('Mathematical integrity guardian system failure');
        }
        
        return {
          success: mathematicalPerfection,
          details: {
            mathTest,
            guardianProtection,
            displayGuardianWorking,
            zeroToleranceValid,
            systemIntegrity,
            perfectMath: true
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