'use client';

import { useState, useEffect } from 'react';

export function useVisualFomo(realSoldCount: number = 0) {
  const [visualPercentage, setVisualPercentage] = useState(8);
  const [visualTicketsCount, setVisualTicketsCount] = useState(800);
  
  useEffect(() => {
    const updateVisualPercentage = () => {
      // Calcular el porcentaje real de ventas
      const realPercentage = (realSoldCount / 10000) * 100;
      
      // Si las ventas reales han alcanzado 18% (1800 tickets), desactivar FOMO visual
      if (realPercentage >= 18) {
        setVisualPercentage(parseFloat(realPercentage.toFixed(1)));
        setVisualTicketsCount(realSoldCount);
        return;
      }
      
      const now = Date.now();
      let sessionStart = now;
      
      // Solo usar localStorage en el cliente
      if (typeof window !== 'undefined') {
        sessionStart = parseInt(localStorage.getItem('rifa_session_start') || now.toString());
        
        // Si es la primera vez, guardar hora de inicio
        if (!localStorage.getItem('rifa_session_start')) {
          localStorage.setItem('rifa_session_start', now.toString());
        }
      }
      
      // Tiempo transcurrido en minutos
      const minutesElapsed = (now - sessionStart) / (1000 * 60);
      
      // Incremento MUY gradual: empezar en 8%, subir 0.1% cada 5 minutos hasta 12%
      const basePercentage = 8;
      const maxPercentage = 12; // Reducido para más realismo
      const increment = Math.floor(minutesElapsed / 5) * 0.1; // Más gradual
      const randomFactor = (Math.random() - 0.5) * 0.1; // +/- 0.05% de variación muy sutil
      
      const newPercentage = Math.min(
        maxPercentage, 
        basePercentage + increment + randomFactor
      );
      
      const newTicketsCount = Math.floor((newPercentage / 100) * 10000);
      
      // DEBUG: Log ocasional para verificar progresión
      if (typeof window !== 'undefined' && Math.random() < 0.05) {
        console.log(`📊 VisualFomo: ${minutesElapsed.toFixed(1)}min → ${newPercentage.toFixed(1)}% (${newTicketsCount} tickets)`);
      }
      
      setVisualPercentage(parseFloat(newPercentage.toFixed(1)));
      setVisualTicketsCount(newTicketsCount);
    };
    
    // Actualizar inmediatamente
    updateVisualPercentage();
    
    // Actualizar cada 30 segundos para simular crecimiento orgánico
    const interval = setInterval(updateVisualPercentage, 30 * 1000);
    
    return () => clearInterval(interval);
  }, [realSoldCount]);
  
  // Generar tickets visuales (para mostrar, no para vender)
  const generateVisualTickets = (realSoldTickets: number[]): number[] => {
    // Si las ventas reales han alcanzado 18%, solo mostrar tickets reales
    const realPercentage = (realSoldCount / 10000) * 100;
    if (realPercentage >= 18) {
      return realSoldTickets;
    }
    
    if (realSoldTickets.length >= visualTicketsCount) {
      return realSoldTickets;
    }
    
    const realTicketsSet = new Set(realSoldTickets);
    const visualTickets = [...realSoldTickets];
    const visualNeeded = visualTicketsCount - realSoldTickets.length;
    
    // Usar seed basado en el día para consistencia
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed += today.charCodeAt(i);
    }
    
    // Generar tickets visuales de forma determinística
    let attempts = 0;
    while (visualTickets.length < visualTicketsCount && attempts < visualNeeded * 3) {
      const pseudoRandom = (seed + attempts * 1337) % 10000;
      const ticketNumber = (pseudoRandom % 10000) + 1;
      
      if (!realTicketsSet.has(ticketNumber) && !visualTickets.includes(ticketNumber)) {
        visualTickets.push(ticketNumber);
      }
      attempts++;
    }
    
    return visualTickets.sort((a, b) => a - b);
  };
  
  // Verificar si el FOMO visual está activo
  const isFomoActive = () => {
    const realPercentage = (realSoldCount / 10000) * 100;
    return realPercentage < 18;
  };

  return {
    visualPercentage,
    visualTicketsCount,
    generateVisualTickets,
    isFomoActive
  };
}