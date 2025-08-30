'use client';

import { useState, useEffect } from 'react';

export function useVisualFomo() {
  const [visualPercentage, setVisualPercentage] = useState(8);
  const [visualTicketsCount, setVisualTicketsCount] = useState(800);
  
  useEffect(() => {
    const updateVisualPercentage = () => {
      const now = Date.now();
      const sessionStart = parseInt(localStorage.getItem('rifa_session_start') || now.toString());
      
      // Si es la primera vez, guardar hora de inicio
      if (!localStorage.getItem('rifa_session_start')) {
        localStorage.setItem('rifa_session_start', now.toString());
      }
      
      // Tiempo transcurrido en minutos
      const minutesElapsed = (now - sessionStart) / (1000 * 60);
      
      // Incremento gradual: empezar en 8%, subir 0.5% cada 10 minutos hasta 16%
      const basePercentage = 8;
      const maxPercentage = 16;
      const increment = Math.floor(minutesElapsed / 10) * 0.5;
      const randomFactor = (Math.random() - 0.5) * 0.3; // +/- 0.15% de variación
      
      const newPercentage = Math.min(
        maxPercentage, 
        basePercentage + increment + randomFactor
      );
      
      const newTicketsCount = Math.floor((newPercentage / 100) * 10000);
      
      setVisualPercentage(parseFloat(newPercentage.toFixed(1)));
      setVisualTicketsCount(newTicketsCount);
    };
    
    // Actualizar inmediatamente
    updateVisualPercentage();
    
    // Actualizar cada 30 segundos para simular crecimiento orgánico
    const interval = setInterval(updateVisualPercentage, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Generar tickets visuales (para mostrar, no para vender)
  const generateVisualTickets = (realSoldTickets: number[]): number[] => {
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
  
  return {
    visualPercentage,
    visualTicketsCount,
    generateVisualTickets
  };
}