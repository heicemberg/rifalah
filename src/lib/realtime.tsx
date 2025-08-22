// ============================================================================
// SIMULADOR DE TIEMPO REAL PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { 
  generateRandomName, 
  getRandomCity, 
  randomBetween,
  generateId
} from './utils';
import { MEXICAN_CITIES } from './constants';

// ============================================================================
// TIPOS
// ============================================================================

interface RealtimeConfig {
  activityInterval: {
    min: number;
    max: number;
  };
  viewersInterval: {
    min: number;
    max: number;
  };
  rushMode: boolean;
  ticketSaleChance: number; // Porcentaje (0-100)
  maxTicketsPerSale: number;
}

interface SimulationState {
  isRunning: boolean;
  activityTimer: NodeJS.Timeout | null;
  viewersTimer: NodeJS.Timeout | null;
  rushTimer: NodeJS.Timeout | null;
  config: RealtimeConfig;
  stats: {
    activitiesGenerated: number;
    viewerUpdates: number;
    ticketsSold: number;
    rushEvents: number;
  };
}

// ============================================================================
// CONFIGURACIÓN PREDETERMINADA
// ============================================================================

const DEFAULT_CONFIG: RealtimeConfig = {
  activityInterval: {
    min: 45000,  // 45 segundos
    max: 120000  // 2 minutos
  },
  viewersInterval: {
    min: 30000,  // 30 segundos
    max: 60000   // 1 minuto
  },
  rushMode: false,
  ticketSaleChance: 15, // 15% de probabilidad
  maxTicketsPerSale: 12 // Compras de 8-12 boletos
};

// ============================================================================
// CLASE REALTIME MANAGER (SINGLETON)
// ============================================================================

class RealtimeManager {
  private static instance: RealtimeManager | null = null;
  private state: SimulationState;
  private storeActions: {
    addSoldTicket?: (ticket: unknown) => void;
    updateLiveActivity?: (activity: unknown[]) => void;
    setViewingCount?: (count: number) => void;
    addLiveActivity?: (activity: { buyerName: string; ticketCount: number }) => void;
    availableTickets?: unknown[];
    markTicketsAsSold?: (tickets: number[], customerId: string) => void;
    soldPercentage?: number;
  } = {};

  private constructor() {
    this.state = {
      isRunning: false,
      activityTimer: null,
      viewersTimer: null,
      rushTimer: null,
      config: { ...DEFAULT_CONFIG },
      stats: {
        activitiesGenerated: 0,
        viewerUpdates: 0,
        ticketsSold: 0,
        rushEvents: 0
      }
    };
  }

  // Singleton pattern
  public static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  // Configurar acciones del store
  public setStoreActions(actions: {
    addSoldTicket?: (ticket: unknown) => void;
    updateLiveActivity?: (activity: unknown[]) => void;
    setViewingCount?: (count: number) => void;
    addLiveActivity?: (activity: { buyerName: string; ticketCount: number }) => void;
    availableTickets?: unknown[];
    markTicketsAsSold?: (tickets: number[], customerId: string) => void;
    soldPercentage?: number;
  }): void {
    this.storeActions = actions;
  }

  // Iniciar simulación
  public start(): void {
    if (this.state.isRunning || !this.storeActions) {
      return;
    }

    console.log('🚀 Iniciando simulador de tiempo real');
    this.state.isRunning = true;

    this.scheduleActivityGeneration();
    this.scheduleViewerUpdates();
    this.scheduleRushEvents();
  }

  // Detener simulación
  public stop(): void {
    if (!this.state.isRunning) {
      return;
    }

    console.log('⏹️ Deteniendo simulador de tiempo real');
    this.state.isRunning = false;

    // Limpiar todos los timers
    if (this.state.activityTimer) {
      clearTimeout(this.state.activityTimer);
      this.state.activityTimer = null;
    }

    if (this.state.viewersTimer) {
      clearTimeout(this.state.viewersTimer);
      this.state.viewersTimer = null;
    }

    if (this.state.rushTimer) {
      clearTimeout(this.state.rushTimer);
      this.state.rushTimer = null;
    }
  }

  // Simular rush de actividad
  public simulateRush(duration: number = 30000): void {
    if (!this.state.isRunning) {
      return;
    }

    console.log('🔥 Simulando rush de actividad');
    this.state.config.rushMode = true;
    this.state.config.activityInterval = { min: 1000, max: 3000 };
    this.state.config.ticketSaleChance = 15; // Mayor probabilidad durante rush
    this.state.stats.rushEvents++;

    // Restaurar configuración normal después del duration
    setTimeout(() => {
      if (this.state.isRunning) {
        console.log('✨ Finalizando modo rush');
        this.state.config.rushMode = false;
        this.state.config = { ...DEFAULT_CONFIG };
      }
    }, duration);
  }

  // Programar generación de actividades
  private scheduleActivityGeneration(): void {
    if (!this.state.isRunning) return;

    const delay = randomBetween(
      this.state.config.activityInterval.min,
      this.state.config.activityInterval.max
    );

    this.state.activityTimer = setTimeout(() => {
      this.generateActivity();
      this.scheduleActivityGeneration(); // Reprogramar
    }, delay);
  }

  // Programar actualizaciones de viewers
  private scheduleViewerUpdates(): void {
    if (!this.state.isRunning) return;

    const delay = randomBetween(
      this.state.config.viewersInterval.min,
      this.state.config.viewersInterval.max
    );

    this.state.viewersTimer = setTimeout(() => {
      this.updateViewers();
      this.scheduleViewerUpdates(); // Reprogramar
    }, delay);
  }

  // Programar eventos de rush aleatorios
  private scheduleRushEvents(): void {
    if (!this.state.isRunning) return;

    // Rush aleatorio cada 2-10 minutos
    const delay = randomBetween(120000, 600000);

    this.state.rushTimer = setTimeout(() => {
      // 30% de probabilidad de rush
      if (Math.random() < 0.3) {
        this.simulateRush(randomBetween(20000, 45000));
      }
      this.scheduleRushEvents(); // Reprogramar
    }, delay);
  }

  // Generar actividad fake
  private generateActivity(): void {
    if (!this.storeActions) return;

    const currentHour = new Date().getHours();
    
    // Reducir actividad 90% en madrugada (2am-6am)
    if (currentHour >= 2 && currentHour <= 6) {
      if (Math.random() < 0.9) return; // 90% menos actividad
    }

    const buyerName = generateRandomName();
    const city = this.getRealisticCity();
    const ticketCount = randomBetween(8, this.state.config.maxTicketsPerSale); // 8-12 boletos

    // Determinar si es compra real o solo actividad
    const isRealPurchase = Math.random() * 100 < this.state.config.ticketSaleChance;

    if (isRealPurchase) {
      // Simular compra real - marcar tickets como vendidos
      this.simulateRealPurchase(ticketCount);
    }

    // Siempre agregar actividad visual
    this.storeActions.addLiveActivity?.({
      buyerName,
      ticketCount
    });

    this.state.stats.activitiesGenerated++;

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Actividad generada: ${buyerName} de ${city} - ${ticketCount} boletos${isRealPurchase ? ' (COMPRA REAL)' : ''}`);
    }
  }

  // Obtener ciudad realista con distribución 70% grandes ciudades, 30% otras
  private getRealisticCity(): string {
    const majorCities = [
      'CDMX', 'Guadalajara', 'Monterrey', 'Zapopan', 'Tlalnepantla',
      'Naucalpan', 'Chimalhuacán', 'Ecatepec', 'Nezahualcóyotl'
    ];
    
    // 70% de las veces usar ciudades grandes
    if (Math.random() < 0.7) {
      return majorCities[Math.floor(Math.random() * majorCities.length)];
    } else {
      // 30% otras ciudades
      const otherCities = MEXICAN_CITIES.filter(city => 
        !majorCities.some(major => city.includes(major.replace('CDMX', 'Ciudad de México')))
      );
      return otherCities[Math.floor(Math.random() * otherCities.length)].split(',')[0];
    }
  }

  // Simular compra real
  private simulateRealPurchase(ticketCount: number): void {
    if (!this.storeActions) return;

    const availableTickets = this.storeActions.availableTickets;
    
    // Verificar si hay suficientes tickets disponibles
    if (!availableTickets || !Array.isArray(availableTickets) || availableTickets.length < ticketCount) {
      return;
    }

    // Seleccionar tickets aleatorios
    const selectedTickets = [];
    const shuffled = [...availableTickets].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < ticketCount && i < shuffled.length; i++) {
      selectedTickets.push(shuffled[i]);
    }

    if (selectedTickets.length > 0) {
      // Generar ID de customer fake
      const customerId = generateId();
      
      // Marcar como vendidos
      this.storeActions.markTicketsAsSold?.(selectedTickets as number[], customerId);
      this.state.stats.ticketsSold += selectedTickets.length;

      console.log(`💰 Compra real simulada: ${selectedTickets.length} tickets vendidos`);
    }
  }

  // Actualizar contador de viewers
  private updateViewers(): void {
    if (!this.storeActions) return;

    const currentSoldPercentage = this.storeActions.soldPercentage || 0;
    const currentHour = new Date().getHours();
    let baseViewers: number;

    // Viewers base entre 89-347 personas
    baseViewers = randomBetween(89, 347);

    // Aplicar modificadores por hora
    if (currentHour >= 2 && currentHour <= 6) {
      // Madrugada: reducir viewers significativamente
      baseViewers = Math.floor(baseViewers * 0.3);
    } else if (currentHour >= 18 && currentHour <= 22) {
      // Horario pico nocturno: más viewers
      baseViewers = Math.floor(baseViewers * 1.4);
    } else if (currentHour >= 12 && currentHour <= 14) {
      // Hora de comida: más viewers
      baseViewers = Math.floor(baseViewers * 1.2);
    }

    // Aplicar multiplicador si está en modo rush
    if (this.state.config.rushMode) {
      baseViewers = Math.floor(baseViewers * randomBetween(1.3, 1.8));
    }

    // Añadir fluctuación aleatoria ±10%
    const fluctuation = randomBetween(-10, 10);
    const newViewerCount = Math.max(
      89, // Mínimo 89 viewers
      Math.min(347, Math.floor(baseViewers + (baseViewers * fluctuation / 100)))
    );

    this.storeActions.setViewingCount?.(newViewerCount);
    this.state.stats.viewerUpdates++;

    if (process.env.NODE_ENV === 'development') {
      console.log(`👥 Viewers actualizados: ${newViewerCount} (${currentSoldPercentage}% vendido)`);
    }
  }

  // Obtener estadísticas
  public getStats(): typeof this.state.stats {
    return { ...this.state.stats };
  }

  // Obtener estado
  public getState(): { isRunning: boolean; config: RealtimeConfig } {
    return {
      isRunning: this.state.isRunning,
      config: { ...this.state.config }
    };
  }

  // Actualizar configuración
  public updateConfig(newConfig: Partial<RealtimeConfig>): void {
    this.state.config = { ...this.state.config, ...newConfig };
    console.log('⚙️ Configuración actualizada:', this.state.config);
  }
}

// ============================================================================
// HOOK PARA COMPONENTES
// ============================================================================

export const useRealtime = () => {
  const manager = RealtimeManager.getInstance();
  const storeActions = useRaffleStore();
  const isInitialized = useRef(false);

  // Configurar store actions una sola vez
  useEffect(() => {
    if (!isInitialized.current) {
      manager.setStoreActions(storeActions);
      isInitialized.current = true;
    }
  }, [manager, storeActions]);

  // Control functions
  const start = useCallback(() => {
    manager.start();
  }, [manager]);

  const stop = useCallback(() => {
    manager.stop();
  }, [manager]);

  const simulateRush = useCallback((duration?: number) => {
    manager.simulateRush(duration);
  }, [manager]);

  const getStats = useCallback(() => {
    return manager.getStats();
  }, [manager]);

  const getState = useCallback(() => {
    return manager.getState();
  }, [manager]);

  const updateConfig = useCallback((config: Partial<RealtimeConfig>) => {
    manager.updateConfig(config);
  }, [manager]);

  return {
    start,
    stop,
    simulateRush,
    getStats,
    getState,
    updateConfig
  };
};

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

// Auto-start cuando se importa el módulo (solo en cliente)
if (typeof window !== 'undefined') {
  // Esperar un poco para que el store esté listo
  setTimeout(() => {
    const manager = RealtimeManager.getInstance();
    
    // Verificar si ya está corriendo para evitar duplicados
    if (!manager.getState().isRunning) {
      console.log('🔄 Auto-iniciando simulador de tiempo real...');
      
      // Intentar iniciar cada segundo hasta que tenga acceso al store
      const initInterval = setInterval(() => {
        try {
          // Acceder al store de forma dinámica
          const storeState = (window as { __RAFFLE_STORE__?: unknown }).__RAFFLE_STORE__;
          if (storeState) {
            manager.setStoreActions(storeState);
            manager.start();
            clearInterval(initInterval);
          }
        } catch {
          // Continuar intentando...
        }
      }, 1000);

      // Timeout de seguridad (30 segundos)
      setTimeout(() => {
        clearInterval(initInterval);
      }, 30000);
    }
  }, 2000);
}

// ============================================================================
// HOOK DE DEBUG PARA DESARROLLO
// ============================================================================

export const useRealtimeDebug = () => {
  const realtime = useRealtime();
  const [stats, setStats] = React.useState(realtime.getStats());
  const [state, setState] = React.useState(realtime.getState());

  // Actualizar stats cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(realtime.getStats());
      setState(realtime.getState());
    }, 5000);

    return () => clearInterval(interval);
  }, [realtime]);

  return {
    ...realtime,
    stats,
    state
  };
};

// ============================================================================
// COMPONENTE DE DEBUG (SOLO DESARROLLO)
// ============================================================================

export const RealtimeDebugPanel: React.FC = () => {
  const { stats, state, simulateRush } = useRealtimeDebug();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-xs">
      <div className="font-bold text-gray-800 mb-2">Realtime Debug</div>
      
      <div className="space-y-1 text-gray-600">
        <div>Estado: {state.isRunning ? '🟢 Activo' : '🔴 Inactivo'}</div>
        <div>Rush Mode: {state.config.rushMode ? '🔥 Sí' : '❄️ No'}</div>
        <div>Actividades: {stats.activitiesGenerated}</div>
        <div>Actualizaciones viewers: {stats.viewerUpdates}</div>
        <div>Tickets vendidos: {stats.ticketsSold}</div>
        <div>Eventos rush: {stats.rushEvents}</div>
      </div>

      <button
        onClick={() => simulateRush(15000)}
        className="mt-2 bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
      >
        Simular Rush
      </button>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default RealtimeManager;
export type { RealtimeConfig, SimulationState };