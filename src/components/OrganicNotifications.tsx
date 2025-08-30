'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRaffleStore } from '../stores/raffle-store';
import { useRealTimeTickets } from '../hooks/useRealTimeTickets';
import { 
  MEXICAN_FIRST_NAMES, 
  MEXICAN_SURNAMES, 
  MEXICAN_CITIES 
} from '../lib/constants';

interface NotificationData {
  id: string;
  buyerName: string;
  ticketCount: number;
  city: string;
  action: string;
  timeAgo: string;
  timestamp: number;
}

const OrganicNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null);
  const { markTicketsAsSold, availableTickets } = useRaffleStore();
  const { stats, formatMexicanNumber } = useRealTimeTickets();
  const soldPercentage = stats.soldPercentage;

  // Función para generar nombres realistas
  const generateRealisticName = useCallback(() => {
    const firstName = MEXICAN_FIRST_NAMES[Math.floor(Math.random() * MEXICAN_FIRST_NAMES.length)];
    const surname = MEXICAN_SURNAMES[Math.floor(Math.random() * MEXICAN_SURNAMES.length)];
    return `${firstName} ${surname.charAt(0)}.`;
  }, []);

  // Función para generar número de boletos con distribución realista
  const generateTicketCount = useCallback(() => {
    const random = Math.random();
    
    // Distribución de boletos más realista
    if (random < 0.5) return 1; // 50% - 1 boleto
    if (random < 0.7) return Math.floor(Math.random() * 3) + 2; // 20% - 2-4 boletos
    if (random < 0.85) return Math.floor(Math.random() * 6) + 5; // 15% - 5-10 boletos
    if (random < 0.95) return Math.floor(Math.random() * 15) + 10; // 10% - 10-25 boletos
    return Math.floor(Math.random() * 25) + 25; // 5% - 25-50 boletos
  }, []);

  // Función para crear una nueva notificación
  const createNotification = useCallback(() => {
    const buyerName = generateRealisticName();
    const ticketCount = generateTicketCount();
    const city = MEXICAN_CITIES[Math.floor(Math.random() * MEXICAN_CITIES.length)];
    const actions = ['compró', 'adquirió', 'se llevó'];
    const timeMessages = ['hace 1m', 'hace 2m', 'hace 3m', 'recién'];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const timeAgo = timeMessages[Math.floor(Math.random() * timeMessages.length)];
    
    const notification: NotificationData = {
      id: `notif-${Date.now()}-${Math.random()}`,
      buyerName,
      ticketCount,
      city,
      action,
      timeAgo,
      timestamp: Date.now()
    };

    return notification;
  }, [generateRealisticName, generateTicketCount]);

  // Función para mostrar notificación
  const showNotification = useCallback((notification: NotificationData) => {
    setCurrentNotification(notification);
    
    // Ocultar después de 2-2.5 segundos (muy rápido y discreto)
    const hideDelay = 2000 + Math.random() * 500;
    setTimeout(() => {
      setCurrentNotification(prev => prev?.id === notification.id ? null : prev);
    }, hideDelay);
  }, []);


  // Sistema principal de notificaciones
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextNotification = () => {
      // Solo mostrar notificaciones si hay actividad real
      if (soldPercentage >= 30) {
        return;
      }

      // Intervalo aleatorio entre 2 y 5 minutos (más realista)
      const MIN_INTERVAL = 120000; // 2 minutos
      const MAX_INTERVAL = 300000; // 5 minutos
      const interval = MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);

      timeoutId = setTimeout(() => {
        const notification = createNotification();
        
        // Agregar a la lista de notificaciones
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Mantener últimas 50
        
        // Mostrar notificación
        showNotification(notification);
        
        
        // Programar siguiente notificación
        scheduleNextNotification();
      }, interval);
    };

    // Iniciar después de 8 segundos
    const initialTimeout = setTimeout(scheduleNextNotification, 8000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [createNotification, showNotification, soldPercentage]);

  // Renderizar notificación actual
  if (!currentNotification) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-10 max-w-fit">
      <div className="backdrop-blur-sm bg-white/15 border border-white/10 rounded-full shadow-none px-3 py-1.5 animate-in slide-in-from-left-2 duration-500 ease-out opacity-40 hover:opacity-60 transition-opacity">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-gray-500 rounded-full opacity-50"></div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-gray-700 font-medium truncate">
              {currentNotification.buyerName} compró {formatMexicanNumber(currentNotification.ticketCount)} boleto{currentNotification.ticketCount !== 1 ? 's' : ''}
            </span>
            <span className="text-[10px] text-gray-500 font-normal">
              {currentNotification.timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganicNotifications;