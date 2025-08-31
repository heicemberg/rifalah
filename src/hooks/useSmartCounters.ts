'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSupabaseSync } from './useSupabaseSync';
import { useRaffleStore } from '../stores/raffle-store';

// ============================================================================
// HOOK PARA CONTADORES INTELIGENTES CON FOMO
// ============================================================================

export interface SmartCounters {
  // Datos reales (solo compras completed y tickets sold)
  realSoldCount: number;
  realReservedCount: number;
  realAvailableCount: number;
  realSoldPercentage: number;
  
  // Datos mostrados (con FOMO inteligente)
  displaySoldCount: number;
  displaySoldPercentage: number;
  displayAvailableCount: number;
  
  // Estado FOMO
  fomoBase: number; // 8-18% base ficticio
  fomoIsActive: boolean; // true si < 18% ventas reales
  fomoIncrement: number; // incremento actual del FOMO
  
  // Metadatos
  lastUpdate: Date;
  isConnected: boolean;
  totalTickets: number;
}

export const useSmartCounters = (): SmartCounters => {
  const [fomoIncrement, setFomoIncrement] = useState(0);
  const [sessionStart, setSessionStart] = useState(Date.now());
  
  // Inicializar sessionStart en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rifa_session_start');
      const startTime = stored ? parseInt(stored) : Date.now();
      setSessionStart(startTime);
    }
  }, []);
  
  // Hooks de dependencias
  const { 
    isConnected, 
    realTicketsCount, 
    lastSyncTime 
  } = useSupabaseSync();
  
  const { reservedTickets } = useRaffleStore(state => ({
    reservedTickets: state.reservedTickets
  }));

  // Constantes
  const TOTAL_TICKETS = 10000;
  const FOMO_THRESHOLD_PERCENTAGE = 18; // Umbral para desactivar FOMO

  // ============================================================================
  // CÁLCULO DEL FOMO BASE (8% inicial, sube gradualmente a 18%)
  // ============================================================================
  const calculateFomoBase = useCallback((): number => {
    // Solo proceder si sessionStart está inicializado
    if (!sessionStart) return Math.floor((8 / 100) * TOTAL_TICKETS);
    
    const now = Date.now();
    const minutesElapsed = (now - sessionStart) / (1000 * 60);
    
    // Base: 8% inicial
    const basePercentage = 8;
    const maxPercentage = 12; // Máximo FOMO ficticio reducido para crecimiento más orgánico
    
    // Incremento MUCHO más gradual: 0.1% cada 5 minutos
    const timeIncrement = Math.floor(minutesElapsed / 5) * 0.1;
    
    // Variación aleatoria muy pequeña ±0.1%
    const randomVariation = (Math.random() - 0.5) * 0.2;
    
    const fomoPercentage = Math.min(
      maxPercentage,
      Math.max(basePercentage, basePercentage + timeIncrement + randomVariation)
    );
    
    // DEBUG: Log para verificar el cálculo
    if (typeof window !== 'undefined' && Math.random() < 0.1) {
      console.log(`🎯 FOMO Debug: ${minutesElapsed.toFixed(1)}min elapsed, ${fomoPercentage.toFixed(1)}% FOMO`);
    }
    
    return Math.floor((fomoPercentage / 100) * TOTAL_TICKETS);
  }, [sessionStart]);

  // ============================================================================
  // ACTUALIZAR INCREMENTO FOMO GRADUALMENTE
  // ============================================================================
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('rifa_session_start')) {
      localStorage.setItem('rifa_session_start', sessionStart.toString());
    }

    const updateFomoIncrement = () => {
      const newIncrement = calculateFomoBase();
      setFomoIncrement(newIncrement);
    };

    // Actualizar inmediatamente
    updateFomoIncrement();

    // Actualizar cada 15 segundos para ver el crecimiento gradual más rápido (testing)
    const interval = setInterval(updateFomoIncrement, 15 * 1000);

    return () => clearInterval(interval);
  }, [calculateFomoBase, sessionStart]);

  // ============================================================================
  // CÁLCULOS PRINCIPALES
  // ============================================================================
  const smartCounters: SmartCounters = useMemo(() => {
    // Datos reales de la base de datos
    const realSoldCount = realTicketsCount;
    const realReservedCount = reservedTickets.length;
    const realAvailableCount = TOTAL_TICKETS - realSoldCount - realReservedCount;
    const realSoldPercentage = (realSoldCount / TOTAL_TICKETS) * 100;

    // Determinar si FOMO debe estar activo
    const fomoIsActive = realSoldPercentage < FOMO_THRESHOLD_PERCENTAGE;
    const fomoBase = fomoIncrement;

    // Calcular números mostrados usando max(real, fomo)
    let displaySoldCount: number;
    let displaySoldPercentage: number;
    let displayAvailableCount: number;

    if (fomoIsActive && isConnected) {
      // Mostrar el mayor entre ventas reales y FOMO ficticio
      displaySoldCount = Math.max(realSoldCount, fomoBase);
      displaySoldPercentage = (displaySoldCount / TOTAL_TICKETS) * 100;
      
      // Los disponibles siempre se calculan con datos reales
      displayAvailableCount = realAvailableCount;
    } else {
      // Mostrar solo datos reales
      displaySoldCount = realSoldCount;
      displaySoldPercentage = realSoldPercentage;
      displayAvailableCount = realAvailableCount;
    }

    return {
      // Datos reales
      realSoldCount,
      realReservedCount,
      realAvailableCount,
      realSoldPercentage,
      
      // Datos mostrados
      displaySoldCount,
      displaySoldPercentage,
      displayAvailableCount,
      
      // Estado FOMO
      fomoBase,
      fomoIsActive,
      fomoIncrement,
      
      // Metadatos
      lastUpdate: lastSyncTime || new Date(),
      isConnected,
      totalTickets: TOTAL_TICKETS
    };
  }, [
    realTicketsCount,
    reservedTickets.length,
    fomoIncrement,
    isConnected,
    lastSyncTime
  ]);

  return smartCounters;
};

// ============================================================================
// HOOK SIMPLIFICADO PARA COMPONENTES QUE SOLO NECESITAN STATS BÁSICAS
// ============================================================================
export const useDisplayStats = () => {
  const counters = useSmartCounters();
  
  return {
    soldCount: counters.displaySoldCount,
    soldPercentage: counters.displaySoldPercentage,
    availableCount: counters.displayAvailableCount,
    reservedCount: counters.realReservedCount,
    totalCount: counters.totalTickets,
    isConnected: counters.isConnected,
    lastUpdate: counters.lastUpdate
  };
};

// ============================================================================
// HOOK PARA ADMINS - INCLUYE DATOS REALES VS MOSTRADOS
// ============================================================================
export const useAdminCounters = () => {
  const counters = useSmartCounters();
  
  return {
    // Datos para mostrar al público
    display: {
      soldCount: counters.displaySoldCount,
      soldPercentage: counters.displaySoldPercentage,
      availableCount: counters.displayAvailableCount
    },
    
    // Datos reales (solo para admin)
    real: {
      soldCount: counters.realSoldCount,
      soldPercentage: counters.realSoldPercentage,
      availableCount: counters.realAvailableCount
    },
    
    // Estado FOMO (solo para admin)
    fomo: {
      isActive: counters.fomoIsActive,
      baseCount: counters.fomoBase,
      increment: counters.fomoIncrement
    },
    
    // Metadatos
    meta: {
      isConnected: counters.isConnected,
      lastUpdate: counters.lastUpdate,
      totalTickets: counters.totalTickets
    }
  };
};