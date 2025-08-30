'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRaffleStore } from '../stores/raffle-store';
import { useSupabaseSync } from './useSupabaseSync';

// ============================================================================
// HOOK PARA SINCRONIZACIÓN EN TIEMPO REAL DE TICKETS
// ============================================================================

export interface TicketStats {
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  reservedTickets: number;
  soldPercentage: number;
  availablePercentage: number;
  isNearlyFull: boolean; // >85%
  isCritical: boolean;   // >95%
  lastUpdate: Date;
}

export const useRealTimeTickets = () => {
  const { soldTickets, reservedTickets } = useRaffleStore();
  const { realTicketsCount, isConnected, visualPercentage, isFomoActive } = useSupabaseSync();
  const [stats, setStats] = useState<TicketStats>({
    totalTickets: 10000,
    soldTickets: 0,
    availableTickets: 10000,
    reservedTickets: 0,
    soldPercentage: 0,
    availablePercentage: 100,
    isNearlyFull: false,
    isCritical: false,
    lastUpdate: new Date()
  });

  const calculateStats = useCallback((): TicketStats => {
    const totalTickets = 10000;
    
    // Si estamos conectados a Supabase
    if (isConnected) {
      const realSoldCount = realTicketsCount;
      const reservedCount = reservedTickets.length;
      
      // Mostrar números unificados hasta el 18%, después solo reales
      const displaySoldCount = isFomoActive() ? soldTickets.length : realSoldCount;
      const displaySoldPercentage = isFomoActive() 
        ? (soldTickets.length / totalTickets) * 100
        : (realSoldCount / totalTickets) * 100;
      
      // Los disponibles se calculan coherentemente con lo mostrado
      const availableCount = isFomoActive() 
        ? totalTickets - soldTickets.length - reservedCount
        : totalTickets - realSoldCount - reservedCount;
      
      const availablePercentage = (availableCount / totalTickets) * 100;

      return {
        totalTickets,
        soldTickets: displaySoldCount,
        availableTickets: availableCount, // Siempre reales disponibles
        reservedTickets: reservedCount,
        soldPercentage: Math.round(displaySoldPercentage * 100) / 100,
        availablePercentage: Math.round(availablePercentage * 100) / 100,
        isNearlyFull: displaySoldPercentage > 85,
        isCritical: displaySoldPercentage > 95,
        lastUpdate: new Date()
      };
    } else {
      // Fallback para modo offline
      const soldCount = soldTickets.length;
      const reservedCount = reservedTickets.length;
      const availableCount = totalTickets - soldCount - reservedCount;
      const soldPercentage = (soldCount / totalTickets) * 100;
      const availablePercentage = (availableCount / totalTickets) * 100;

      return {
        totalTickets,
        soldTickets: soldCount,
        availableTickets: availableCount,
        reservedTickets: reservedCount,
        soldPercentage: Math.round(soldPercentage * 100) / 100,
        availablePercentage: Math.round(availablePercentage * 100) / 100,
        isNearlyFull: soldPercentage > 85,
        isCritical: soldPercentage > 95,
        lastUpdate: new Date()
      };
    }
  }, [soldTickets.length, reservedTickets.length, realTicketsCount, isConnected, isFomoActive]);

  useEffect(() => {
    const newStats = calculateStats();
    setStats(newStats);
  }, [calculateStats]);

  // Formateo mexicano para números
  const formatMexicanNumber = useCallback((num: number): string => {
    return num.toLocaleString('es-MX');
  }, []);

  // Precio por boleto en pesos mexicanos
  const PRECIO_POR_BOLETO_MXN = 200; // $200 MXN por boleto
  
  const calculatePrice = useCallback((ticketCount: number, hasDiscount = false): number => {
    let basePrice = ticketCount * PRECIO_POR_BOLETO_MXN;
    
    if (hasDiscount || ticketCount >= 5) {
      if (ticketCount >= 50) {
        basePrice *= 0.75; // 25% descuento
      } else if (ticketCount >= 20) {
        basePrice *= 0.8;  // 20% descuento
      } else if (ticketCount >= 10) {
        basePrice *= 0.85; // 15% descuento
      } else if (ticketCount >= 5) {
        basePrice *= 0.9;  // 10% descuento
      }
    }
    
    return Math.round(basePrice);
  }, []);

  const formatPriceMXN = useCallback((price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }, []);

  // Estados de urgencia
  const getUrgencyLevel = useCallback(() => {
    if (stats.isCritical) return 'critical';
    if (stats.isNearlyFull) return 'high';
    if (stats.soldPercentage > 70) return 'medium';
    return 'low';
  }, [stats.isCritical, stats.isNearlyFull, stats.soldPercentage]);

  const getUrgencyMessage = useCallback(() => {
    const urgency = getUrgencyLevel();
    const remaining = stats.availableTickets;
    
    switch (urgency) {
      case 'critical':
        return `¡ÚLTIMOS ${formatMexicanNumber(remaining)} BOLETOS! Se agota muy pronto`;
      case 'high':
        return `¡Quedan solo ${formatMexicanNumber(remaining)} boletos disponibles!`;
      case 'medium':
        return `${formatMexicanNumber(remaining)} boletos disponibles - ¡No te quedes fuera!`;
      default:
        return `${formatMexicanNumber(remaining)} boletos disponibles`;
    }
  }, [getUrgencyLevel, stats.availableTickets, formatMexicanNumber]);

  const getUrgencyColor = useCallback(() => {
    const urgency = getUrgencyLevel();
    switch (urgency) {
      case 'critical': return 'from-red-600 to-red-700';
      case 'high': return 'from-orange-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-orange-500';
      default: return 'from-green-500 to-emerald-600';
    }
  }, [getUrgencyLevel]);

  // Verificar si un rango de boletos está disponible
  const areTicketsAvailable = useCallback((ticketNumbers: number[]): boolean => {
    return ticketNumbers.every(num => 
      !soldTickets.includes(num) && 
      !reservedTickets.some(reserved => reserved === num)
    );
  }, [soldTickets, reservedTickets]);

  // Obtener próximos boletos disponibles
  const getNextAvailableTickets = useCallback((count: number): number[] => {
    const available: number[] = [];
    let current = 1;
    
    while (available.length < count && current <= 10000) {
      if (!soldTickets.includes(current) && 
          !reservedTickets.some(reserved => reserved === current)) {
        available.push(current);
      }
      current++;
    }
    
    return available;
  }, [soldTickets, reservedTickets]);

  return {
    stats,
    formatMexicanNumber,
    formatPriceMXN,
    calculatePrice,
    getUrgencyLevel,
    getUrgencyMessage,
    getUrgencyColor,
    areTicketsAvailable,
    getNextAvailableTickets,
    PRECIO_POR_BOLETO_MXN,
    // Valores constantes mexicanos
    PREMIO_EFECTIVO_MXN: 54000, // $3,000 USD ≈ $54,000 MXN (tipo de cambio 18:1)
    PREMIO_TOTAL_MXN: 810000,   // $45,000 USD ≈ $810,000 MXN
  };
};

// Hook simplificado para componentes que solo necesitan estadísticas básicas
export const useTicketStats = () => {
  const { stats, formatMexicanNumber, getUrgencyMessage, getUrgencyColor } = useRealTimeTickets();
  
  return {
    soldCount: stats.soldTickets,
    availableCount: stats.availableTickets,
    totalCount: stats.totalTickets,
    soldPercentage: stats.soldPercentage,
    isNearlyFull: stats.isNearlyFull,
    isCritical: stats.isCritical,
    urgencyMessage: getUrgencyMessage(),
    urgencyColor: getUrgencyColor(),
    formatNumber: formatMexicanNumber,
    lastUpdate: stats.lastUpdate
  };
};