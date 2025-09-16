// ============================================================================
// ZUSTAND STORE PARA SISTEMA DE RIFA DE CAMIONETA EN MÉXICO
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { useCallback } from 'react';

// Implementación propia de shallow comparison para mayor control
const shallow = <T>(a: T, b: T): boolean => {
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

// Importar tipos, constantes y utilidades de archivos anteriores
import type {
  Ticket,
  Customer,
  LiveActivity,
  AdminConfig,
  TicketStatus
} from '../lib/types';

import {
  TOTAL_TICKETS,
  DEFAULT_ADMIN_CONFIG,
  RESERVATION_TIME_MS
} from '../lib/constants';

import {
  calculatePrice,
  formatTicketNumber,
  generateId,
  generateRandomName,
  randomBetween
} from '../lib/utils';

// ============================================================================
// TIPOS DEL STORE
// ============================================================================

export type RaffleStep = 'selecting' | 'checkout' | 'payment' | 'success';

export interface RaffleState {
  // Estado de tickets
  tickets: Ticket[];
  selectedTickets: number[];
  soldTickets: number[];
  reservedTickets: number[];
  
  // Estado del cliente
  customerData: Customer | null;
  currentStep: RaffleStep;
  fixedPrice: number | null; // Precio fijo para cards principales
  
  // Estado de actividades y configuración
  liveActivities: LiveActivity[];
  viewingCount: number;
  adminConfig: AdminConfig;
  
  // Estado de UI
  loading: boolean;
  errors: string[];
}

export interface RaffleActions {
  // Acciones de selección de tickets
  selectTicket: (ticketNumber: number) => void;
  deselectTicket: (ticketNumber: number) => void;
  quickSelect: (count: number) => void;
  quickSelectMainCard: (count: number, fixedPrice: number) => void; // Nueva función para cards principales
  clearSelection: () => void;
  
  // Acciones de cliente y checkout
  setCustomerData: (customer: Partial<Customer>) => void;
  setCurrentStep: (step: RaffleStep) => void;
  
  // Acciones de tickets (reserva y venta)
  reserveTickets: (ticketNumbers: number[], customerId: string) => void;
  markTicketsAsSold: (ticketNumbers: number[], customerId: string) => void;
  releaseReservedTickets: (ticketNumbers: number[]) => void;
  
  // Acciones de actividades en vivo
  addLiveActivity: (activity: Omit<LiveActivity, 'id' | 'createdAt'>) => void;
  generateFakeActivity: () => void;
  setViewingCount: (count: number) => void;
  
  // Acciones de configuración
  updateAdminConfig: (config: Partial<AdminConfig>) => void;
  
  // Acciones de UI
  setLoading: (loading: boolean) => void;
  addError: (error: string) => void;
  clearErrors: () => void;
  
  // Acciones de inicialización
  initializeTickets: () => void;
  resetStore: () => void;
  
  // Acciones para sincronización con Supabase
  setSoldTicketsFromDB: (tickets: number[]) => void;
  setReservedTicketsFromDB: (tickets: number[]) => void;
  
  // Funciones internas
  _updateAvailableTickets: () => void;
}

export interface RaffleComputed {
  // Tickets computados
  availableTickets: number[];
  totalSelected: number;
  totalPrice: number;
  soldPercentage: number;
  
  // Estadísticas
  availableCount: number;
  soldCount: number;
  reservedCount: number;
  selectedCount: number;
}

export type RaffleStore = RaffleState & RaffleActions & RaffleComputed;

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: RaffleState = {
  tickets: [],
  selectedTickets: [],
  soldTickets: [], // Inicializamos vacío para cargar desde Supabase
  reservedTickets: [],
  customerData: null,
  currentStep: 'selecting',
  fixedPrice: null,
  liveActivities: [],
  viewingCount: randomBetween(89, 347),
  adminConfig: DEFAULT_ADMIN_CONFIG,
  loading: false,
  errors: []
};

// ============================================================================
// STORE PRINCIPAL CON ZUSTAND
// ============================================================================

export const useRaffleStore = create<RaffleStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        ...initialState,
        
        // ========================================================================
        // COMPUTED VALUES (getters)
        // ========================================================================
        
        get availableTickets() {
          const { soldTickets, reservedTickets } = get();
          const allTickets = Array.from({ length: TOTAL_TICKETS }, (_, i) => i + 1);
          
          // 🔢 PURE BUSINESS LOGIC: Only real sold and reserved tickets affect availability
          const available = allTickets.filter(ticketNum => 
            !soldTickets.includes(ticketNum) && 
            !reservedTickets.includes(ticketNum)
          );
          
          // ✅ REAL MATHEMATICS VERIFICATION: sold + available + reserved = 10,000
          const realSoldCount = soldTickets.length;
          const realReservedCount = reservedTickets.length;
          const realAvailableCount = available.length;
          const totalCalculated = realSoldCount + realReservedCount + realAvailableCount;
          const mathIsCorrect = totalCalculated === TOTAL_TICKETS;
          
          if (!mathIsCorrect) {
            console.error('🚨 STORE MATH ERROR - Real mathematics broken:', {
              totalTickets: TOTAL_TICKETS,
              realSoldCount,
              realReservedCount,
              realAvailableCount,
              totalCalculated,
              mathCheck: `${realSoldCount} + ${realReservedCount} + ${realAvailableCount} = ${totalCalculated}`,
              isCorrect: mathIsCorrect,
              missing: TOTAL_TICKETS - totalCalculated,
              note: 'This indicates database synchronization issues'
            });
          } else if (available.length < 9000) {
            // Only log diagnostic if we have unusually few available tickets
            console.log('🔍 STORE availableTickets - Low availability diagnostic:', {
              realSoldCount,
              realReservedCount,
              realAvailableCount,
              mathCheck: `${realSoldCount} + ${realReservedCount} + ${realAvailableCount} = ${totalCalculated} ✅`,
              note: 'Math is correct, low availability is normal'
            });
          }
          
          return available;
        },
        
        // 🔄 SUPABASE SYNC: Update real tickets only (no FOMO contamination)
        setSoldTicketsFromDB: (tickets: number[]) => {
          console.log(`🔄 STORE SYNC: Setting ${tickets.length} real sold tickets from DB`);
          set({ soldTickets: tickets });
          // Available tickets will be recalculated automatically via getter
        },
        
        setReservedTicketsFromDB: (tickets: number[]) => {
          console.log(`🔄 STORE SYNC: Setting ${tickets.length} real reserved tickets from DB`);
          set({ reservedTickets: tickets });
          // Available tickets will be recalculated automatically via getter
        },
        
        // ❌ DEPRECATED - availableTickets getter handles this automatically now
        _updateAvailableTickets: () => {
          console.warn('⚠️ _updateAvailableTickets is DEPRECATED - availableTickets getter handles this automatically');
          // No-op: The getter recalculates automatically when sold/reserved change
        },
        
        get totalSelected() {
          return get().selectedTickets.length;
        },
        
        get totalPrice() {
          const { selectedTickets } = get();
          return calculatePrice(selectedTickets.length);
        },
        
        get soldPercentage() {
          const { soldTickets } = get();
          // 🔢 REAL PERCENTAGE: Based only on real sold tickets (no FOMO)
          return Math.round((soldTickets.length / TOTAL_TICKETS) * 100);
        },
        
        get availableCount() {
          return get().availableTickets.length;
        },
        
        get soldCount() {
          return get().soldTickets.length;
        },
        
        get reservedCount() {
          return get().reservedTickets.length;
        },
        
        get selectedCount() {
          return get().selectedTickets.length;
        },
        
        // ========================================================================
        // ACCIONES DE SELECCIÓN DE TICKETS
        // ========================================================================
        
        selectTicket: (ticketNumber: number) => {
          set(state => {
            const { selectedTickets, soldTickets, reservedTickets } = state;

            console.log('🎯 STORE: selectTicket called', {
              ticketNumber,
              alreadySelected: selectedTickets.includes(ticketNumber),
              isSold: soldTickets.includes(ticketNumber),
              isReserved: reservedTickets.includes(ticketNumber)
            });

            // ✅ CRITICAL: Prevent duplicate selection
            if (selectedTickets.includes(ticketNumber)) {
              console.warn(`⚠️ STORE: Ticket ${ticketNumber} already selected, ignoring duplicate`);
              return state;
            }

            // Verificar que el ticket esté disponible
            if (soldTickets.includes(ticketNumber) || reservedTickets.includes(ticketNumber)) {
              console.error(`❌ STORE: Ticket ${ticketNumber} is not available (sold/reserved)`);
              return {
                ...state,
                errors: [...state.errors, `El ticket ${formatTicketNumber(ticketNumber)} ya no está disponible`]
              };
            }

            // ✅ ENHANCED: Validate ticket range
            if (ticketNumber < 1 || ticketNumber > 10000) {
              console.error(`❌ STORE: Invalid ticket number ${ticketNumber}`);
              return {
                ...state,
                errors: [...state.errors, `Número de ticket inválido: ${ticketNumber}`]
              };
            }

            const newSelectedTickets = [...selectedTickets, ticketNumber].sort((a, b) => a - b);

            // ✅ FINAL VALIDATION: Ensure no duplicates in final array
            const uniqueTickets = [...new Set(newSelectedTickets)];
            if (uniqueTickets.length !== newSelectedTickets.length) {
              console.error('❌ STORE: Duplicate detected in final selection, filtering');
              return {
                ...state,
                selectedTickets: uniqueTickets.sort((a, b) => a - b),
                errors: state.errors.filter(error => !error.includes('ya no está disponible'))
              };
            }

            console.log('✅ STORE: Ticket selected successfully', {
              newTicket: ticketNumber,
              totalSelected: newSelectedTickets.length
            });

            return {
              ...state,
              selectedTickets: newSelectedTickets,
              errors: state.errors.filter(error => !error.includes('ya no está disponible'))
            };
          });
        },
        
        deselectTicket: (ticketNumber: number) => {
          set(state => ({
            ...state,
            selectedTickets: state.selectedTickets.filter(num => num !== ticketNumber)
          }));
        },
        
        quickSelect: (count: number) => {
          console.log('🎯 STORE: quickSelect called with count:', count);
          set(state => {
            // ✅ CRITICAL FIX: Get fresh state to prevent stale data
            const freshState = get();
            const { availableTickets, soldTickets, reservedTickets } = freshState;

            console.log('🎯 STORE: Fresh state validation:', {
              availableCount: availableTickets.length,
              soldCount: soldTickets.length,
              reservedCount: reservedTickets.length,
              mathCheck: availableTickets.length + soldTickets.length + reservedTickets.length === TOTAL_TICKETS
            });

            // ✅ VALIDATION: Enhanced availability check
            if (!Array.isArray(availableTickets) || availableTickets.length === 0) {
              console.error('❌ CRITICAL: No available tickets in store', {
                type: typeof availableTickets,
                length: availableTickets?.length || 0
              });
              return {
                ...state,
                errors: [...state.errors, 'Sistema no disponible temporalmente. Intenta de nuevo.']
              };
            }

            if (availableTickets.length < count) {
              console.warn(`❌ Insufficient tickets: Requested ${count}, Available ${availableTickets.length}`);
              return {
                ...state,
                errors: [...state.errors, `Solo quedan ${availableTickets.length} boletos disponibles`]
              };
            }

            // ✅ PREVENTION: Advanced duplicate prevention with Set-based validation
            const unavailableSet = new Set([...soldTickets, ...reservedTickets]);
            const trulyAvailable = availableTickets.filter(ticket => !unavailableSet.has(ticket));

            if (trulyAvailable.length < count) {
              console.warn(`❌ RACE CONDITION: Sync issue detected. True available: ${trulyAvailable.length}, Requested: ${count}`);
              return {
                ...state,
                errors: [...state.errors, `Solo ${trulyAvailable.length} boletos disponibles tras sincronización`]
              };
            }

            // ✅ ALGORITHM: Cryptographically secure random selection
            const selected: number[] = [];
            const poolCopy = [...trulyAvailable];

            for (let i = 0; i < count; i++) {
              if (poolCopy.length === 0) break;

              // Use crypto.getRandomValues for true randomness
              const randomIndex = typeof window !== 'undefined' && window.crypto
                ? Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296) * poolCopy.length)
                : Math.floor(Math.random() * poolCopy.length);

              const selectedTicket = poolCopy.splice(randomIndex, 1)[0];
              selected.push(selectedTicket);
            }

            // ✅ VERIFICATION: Final conflict check
            const finalConflicts = selected.filter(ticket => unavailableSet.has(ticket));
            if (finalConflicts.length > 0) {
              console.error('🚨 CRITICAL: Final conflict detected!', { conflicts: finalConflicts });
              return {
                ...state,
                errors: [...state.errors, 'Error de sincronización. Por favor recarga la página.']
              };
            }

            console.log('✅ STORE: Perfect quickSelect execution', {
              requested: count,
              selected: selected.length,
              tickets: selected,
              verified: selected.every(t => !unavailableSet.has(t))
            });

            return {
              ...state,
              selectedTickets: selected,
              currentStep: 'payment' as RaffleStep,
              errors: state.errors.filter(e => !e.includes('boletos disponibles') && !e.includes('Sistema no disponible'))
            };
          });
        },

        // Nueva función para cards principales (precio fijo sin descuentos)
        quickSelectMainCard: (count: number, fixedPrice: number) => {
          console.log('🎯 STORE: quickSelectMainCard called with count:', count, 'fixedPrice:', fixedPrice);
          set(state => {
            // Reutilizar la misma lógica de selección de tickets que quickSelect
            const { availableTickets } = get();

            if (availableTickets.length < count) {
              console.error('❌ Not enough available tickets for main card selection');
              return {
                ...state,
                errors: [...state.errors, `Solo ${availableTickets.length} boletos disponibles, se necesitan ${count}`]
              };
            }

            // Fisher-Yates shuffle para selección aleatoria
            const shuffled = [...availableTickets];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            const selected = shuffled.slice(0, count).sort((a, b) => a - b);

            console.log('✅ STORE: Main card selection complete:', {
              count,
              fixedPrice,
              selected: selected.length,
              tickets: selected
            });

            return {
              ...state,
              selectedTickets: selected,
              fixedPrice: fixedPrice, // Guardar precio fijo
              errors: []
            };
          });
        },

        clearSelection: () => {
          set(state => ({
            ...state,
            selectedTickets: [],
            fixedPrice: null // Limpiar precio fijo también
          }));
        },
        
        // ========================================================================
        // ACCIONES DE CLIENTE Y CHECKOUT
        // ========================================================================
        
        setCustomerData: (customer: Partial<Customer>) => {
          set(state => ({
            ...state,
            customerData: state.customerData 
              ? { ...state.customerData, ...customer }
              : {
                  id: generateId(),
                  name: '',
                  email: '',
                  whatsapp: '',
                  selectedTickets: [],
                  totalAmount: 0,
                  paymentMethod: 'bancoppel',
                  status: 'pending',
                  createdAt: new Date(),
                  ...customer
                } as Customer
          }));
        },
        
        setCurrentStep: (step: RaffleStep) => {
          set(state => ({
            ...state,
            currentStep: step
          }));
        },
        
        // ========================================================================
        // ACCIONES DE TICKETS (RESERVA Y VENTA)
        // ========================================================================
        
        reserveTickets: (ticketNumbers: number[], customerId: string) => {
          set(state => {
            const now = new Date();
            const newReservedTickets = [...state.reservedTickets, ...ticketNumbers];
            
            // Crear tickets con estado reservado
            const reservedTicketObjects: Ticket[] = ticketNumbers.map(num => ({
              id: generateId(),
              number: formatTicketNumber(num),
              status: 'reserved' as TicketStatus,
              buyerId: customerId,
              reservedAt: now
            }));
            
            // Actualizar o agregar tickets al array de tickets
            const updatedTickets = [...state.tickets];
            reservedTicketObjects.forEach(newTicket => {
              const existingIndex = updatedTickets.findIndex(t => t.number === newTicket.number);
              if (existingIndex >= 0) {
                updatedTickets[existingIndex] = newTicket;
              } else {
                updatedTickets.push(newTicket);
              }
            });
            
            // Programar liberación automática de tickets
            setTimeout(() => {
              get().releaseReservedTickets(ticketNumbers);
            }, RESERVATION_TIME_MS);
            
            const newState = {
              ...state,
              reservedTickets: newReservedTickets,
              tickets: updatedTickets,
              selectedTickets: []
            };
            
            // NOTA: Master Counter actualiza disponibles automáticamente
            
            return newState;
          });
        },
        
        markTicketsAsSold: (ticketNumbers: number[], customerId: string) => {
          set(state => {
            const now = new Date();
            const newSoldTickets = [...state.soldTickets, ...ticketNumbers];
            
            // Remover de reservados si estaban ahí
            const updatedReservedTickets = state.reservedTickets.filter(
              num => !ticketNumbers.includes(num)
            );
            
            // Crear tickets con estado vendido
            const soldTicketObjects: Ticket[] = ticketNumbers.map(num => ({
              id: generateId(),
              number: formatTicketNumber(num),
              status: 'sold' as TicketStatus,
              buyerId: customerId,
              purchaseDate: now
            }));
            
            // Actualizar tickets
            const updatedTickets = [...state.tickets];
            soldTicketObjects.forEach(newTicket => {
              const existingIndex = updatedTickets.findIndex(t => t.number === newTicket.number);
              if (existingIndex >= 0) {
                updatedTickets[existingIndex] = newTicket;
              } else {
                updatedTickets.push(newTicket);
              }
            });
            
            const newState = {
              ...state,
              soldTickets: newSoldTickets,
              reservedTickets: updatedReservedTickets,
              tickets: updatedTickets
            };
            
            // NOTA: Master Counter actualiza disponibles automáticamente
            
            return newState;
          });
        },
        
        releaseReservedTickets: (ticketNumbers: number[]) => {
          set(state => {
            const updatedReservedTickets = state.reservedTickets.filter(
              num => !ticketNumbers.includes(num)
            );
            
            // Actualizar estado de tickets a disponible
            const updatedTickets = state.tickets.map(ticket => {
              const ticketNum = parseInt(ticket.number);
              if (ticketNumbers.includes(ticketNum) && ticket.status === 'reserved') {
                return {
                  ...ticket,
                  status: 'available' as TicketStatus,
                  buyerId: undefined,
                  reservedAt: undefined
                };
              }
              return ticket;
            });
            
            const newState = {
              ...state,
              reservedTickets: updatedReservedTickets,
              tickets: updatedTickets
            };
            
            // NOTA: Master Counter actualiza disponibles automáticamente
            
            return newState;
          });
        },
        
        // ========================================================================
        // ACCIONES DE ACTIVIDADES EN VIVO
        // ========================================================================
        
        addLiveActivity: (activity: Omit<LiveActivity, 'id' | 'createdAt'>) => {
          set(state => {
            const newActivity: LiveActivity = {
              ...activity,
              id: generateId(),
              createdAt: new Date()
            };
            
            // Mantener solo las últimas 50 actividades
            const updatedActivities = [newActivity, ...state.liveActivities].slice(0, 50);
            
            return {
              ...state,
              liveActivities: updatedActivities
            };
          });
        },
        
        generateFakeActivity: () => {
          const ticketCount = randomBetween(1, 10);
          const buyerName = generateRandomName();
          
          get().addLiveActivity({
            buyerName,
            ticketCount
          });
        },
        
        setViewingCount: (count: number) => {
          set(state => ({
            ...state,
            viewingCount: count
          }));
        },
        
        // ========================================================================
        // ACCIONES DE CONFIGURACIÓN
        // ========================================================================
        
        updateAdminConfig: (config: Partial<AdminConfig>) => {
          set(state => ({
            ...state,
            adminConfig: {
              ...state.adminConfig,
              ...config
            }
          }));
        },
        
        // ========================================================================
        // ACCIONES DE UI
        // ========================================================================
        
        setLoading: (loading: boolean) => {
          set(state => ({
            ...state,
            loading
          }));
        },
        
        addError: (error: string) => {
          set(state => ({
            ...state,
            errors: [...state.errors, error]
          }));
        },
        
        clearErrors: () => {
          set(state => ({
            ...state,
            errors: []
          }));
        },
        
        // ========================================================================
        // ACCIONES DE INICIALIZACIÓN
        // ========================================================================
        
        initializeTickets: () => {
          set(state => {
            // Solo inicializar si no hay tickets
            if (state.tickets.length > 0) {
              return state;
            }
            
            const tickets: Ticket[] = Array.from({ length: TOTAL_TICKETS }, (_, i) => ({
              id: generateId(),
              number: formatTicketNumber(i + 1),
              status: 'available' as TicketStatus
            }));
            
            const newState = {
              ...state,
              tickets
            };
            
            // NOTA: Master Counter maneja disponibles automáticamente
            
            return newState;
          });
        },
        
        resetStore: () => {
          set(() => ({
            ...initialState,
            viewingCount: randomBetween(45, 89),
            adminConfig: DEFAULT_ADMIN_CONFIG
          }));
        }
      }),
      {
        name: 'raffle-store',
        // Persistir solo datos críticos
        partialize: (state) => ({
          soldTickets: state.soldTickets,
          reservedTickets: state.reservedTickets,
          adminConfig: state.adminConfig,
          liveActivities: state.liveActivities.slice(0, 20) // Solo las últimas 20
        }),
        // Versión para manejar migraciones
        version: 1,
        // Configuración para SSR compatibility
        skipHydration: true,
        // Usar storage por defecto con manejo de errores mejorado
        onRehydrateStorage: () => (state) => {
          if (state) {
            // NOTA: Master Counter maneja la sincronización automáticamente
            console.log('Store rehidratado - Master Counter manejará los disponibles');
          }
        }
      }
    ),
    {
      name: 'raffle-store'
    }
  )
);

// ============================================================================
// HOOKS ESPECIALIZADOS
// ============================================================================

/**
 * Hook para obtener solo los datos de tickets
 */
export const useTickets = () => {
  return useRaffleStore(
    useCallback((state) => ({
      tickets: state.tickets,
      selectedTickets: state.selectedTickets,
      soldTickets: state.soldTickets,
      reservedTickets: state.reservedTickets,
      availableTickets: state.availableTickets,
      totalSelected: state.totalSelected,
      totalPrice: state.totalPrice,
      soldPercentage: state.soldPercentage
    }), []),
    shallow
  );
};

/**
 * Hook para obtener solo las acciones de tickets
 */
export const useTicketActions = () => {
  return useRaffleStore(
    useCallback((state) => ({
      selectTicket: state.selectTicket,
      deselectTicket: state.deselectTicket,
      quickSelect: state.quickSelect,
      clearSelection: state.clearSelection,
      reserveTickets: state.reserveTickets,
      markTicketsAsSold: state.markTicketsAsSold
    }), []),
    shallow
  );
};

/**
 * Hook para obtener datos del cliente y checkout
 */
export const useCheckout = () => {
  return useRaffleStore(
    useCallback((state) => ({
      customerData: state.customerData,
      currentStep: state.currentStep,
      setCustomerData: state.setCustomerData,
      setCurrentStep: state.setCurrentStep,
      loading: state.loading,
      errors: state.errors
    }), []),
    shallow
  );
};

/**
 * Hook para obtener actividades en vivo
 */
export const useLiveActivities = () => {
  return useRaffleStore(
    useCallback((state) => ({
      liveActivities: state.liveActivities,
      viewingCount: state.viewingCount,
      addLiveActivity: state.addLiveActivity,
      generateFakeActivity: state.generateFakeActivity,
      setViewingCount: state.setViewingCount
    }), []),
    shallow
  );
};

/**
 * Hook para obtener configuración de admin
 */
export const useAdminConfig = () => {
  return useRaffleStore(
    useCallback((state) => ({
      adminConfig: state.adminConfig,
      updateAdminConfig: state.updateAdminConfig
    }), []),
    shallow
  );
};

// ============================================================================
// EXPORT DEL STORE Y TIPOS
// ============================================================================

// Exponer store globalmente para acceso desde Master Counter
if (typeof window !== 'undefined') {
  (window as any).__ZUSTAND_RAFFLE_STORE__ = useRaffleStore;
  
  // Log para debug
  console.log('🔧 ZUSTAND STORE exposed globally for Master Counter sync');
}

export default useRaffleStore;