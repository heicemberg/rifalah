'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRaffleStore } from '../stores/raffle-store';
import { 
  MEXICAN_FIRST_NAMES, 
  MEXICAN_SURNAMES, 
  MEXICAN_CITIES, 
  FOMO_CONFIG 
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
  const { soldPercentage, markTicketsAsSold, availableTickets } = useRaffleStore();

  // Función para generar nombres realistas
  const generateRealisticName = useCallback(() => {
    const firstName = MEXICAN_FIRST_NAMES[Math.floor(Math.random() * MEXICAN_FIRST_NAMES.length)];
    const surname = MEXICAN_SURNAMES[Math.floor(Math.random() * MEXICAN_SURNAMES.length)];
    return `${firstName} ${surname.charAt(0)}.`;
  }, []);

  // Función para generar número de boletos con distribución realista
  const generateTicketCount = useCallback(() => {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (const range of FOMO_CONFIG.TICKET_RANGES) {
      cumulativeWeight += range.weight;
      if (random <= cumulativeWeight) {
        return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
      }
    }
    
    return 1; // Fallback
  }, []);

  // Función para crear una nueva notificación
  const createNotification = useCallback(() => {
    const buyerName = generateRealisticName();
    const ticketCount = generateTicketCount();
    const city = MEXICAN_CITIES[Math.floor(Math.random() * MEXICAN_CITIES.length)];
    const action = FOMO_CONFIG.PURCHASE_MESSAGES[Math.floor(Math.random() * FOMO_CONFIG.PURCHASE_MESSAGES.length)];
    const timeAgo = FOMO_CONFIG.TIME_MESSAGES[Math.floor(Math.random() * FOMO_CONFIG.TIME_MESSAGES.length)];
    
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
    
    // Ocultar después de 4-6 segundos
    const hideDelay = 4000 + Math.random() * 2000;
    setTimeout(() => {
      setCurrentNotification(prev => prev?.id === notification.id ? null : prev);
    }, hideDelay);
  }, []);

  // Función para simular ventas reales
  const simulateSale = useCallback((ticketCount: number) => {
    if (soldPercentage < FOMO_CONFIG.MAX_FAKE_PERCENTAGE && availableTickets.length >= ticketCount) {
      // Seleccionar tickets aleatorios disponibles
      const randomTickets = availableTickets
        .sort(() => Math.random() - 0.5)
        .slice(0, ticketCount);
      
      // Marcar como vendidos
      markTicketsAsSold(randomTickets, `fake-customer-${Date.now()}`);
    }
  }, [soldPercentage, availableTickets, markTicketsAsSold]);

  // Sistema principal de notificaciones
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextNotification = () => {
      // Solo mostrar notificaciones si no hemos alcanzado el límite de FOMO
      if (soldPercentage >= FOMO_CONFIG.MAX_FAKE_PERCENTAGE) {
        return;
      }

      // Intervalo aleatorio entre 20 segundos y 3 minutos
      const interval = FOMO_CONFIG.MIN_INTERVAL + 
        Math.random() * (FOMO_CONFIG.MAX_INTERVAL - FOMO_CONFIG.MIN_INTERVAL);

      timeoutId = setTimeout(() => {
        const notification = createNotification();
        
        // Agregar a la lista de notificaciones
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Mantener últimas 50
        
        // Mostrar notificación
        showNotification(notification);
        
        // Simular venta real (60% de probabilidad)
        if (Math.random() < 0.6) {
          simulateSale(notification.ticketCount);
        }
        
        // Programar siguiente notificación
        scheduleNextNotification();
      }, interval);
    };

    // Iniciar después de 3 segundos
    const initialTimeout = setTimeout(scheduleNextNotification, 3000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [createNotification, showNotification, simulateSale, soldPercentage]);

  // Renderizar notificación actual
  if (!currentNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-white border border-green-300 rounded-lg shadow-2xl p-4 animate-in slide-in-from-right-full duration-300">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0 mt-1"></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {currentNotification.buyerName}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                • {currentNotification.timeAgo}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-tight">
              {currentNotification.action}{' '}
              <span className="font-semibold text-green-600">
                {currentNotification.ticketCount} boleto{currentNotification.ticketCount !== 1 ? 's' : ''}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">
              📍 {currentNotification.city}
            </p>
          </div>
        </div>
        
        {/* Barra de progreso sutil */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(soldPercentage, FOMO_CONFIG.MAX_FAKE_PERCENTAGE)}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 font-medium">
            {Math.min(soldPercentage, FOMO_CONFIG.MAX_FAKE_PERCENTAGE).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrganicNotifications;