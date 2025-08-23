// ============================================================================
// NOTIFICACIONES EN VIVO PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { 
  generateRandomName, 
  getRandomCity, 
  formatRelativeTime, 
  randomBetween,
  cn
} from '../lib/utils';
import { TOTAL_TICKETS } from '../lib/constants';

// ============================================================================
// TIPOS
// ============================================================================

interface LiveNotification {
  id: string;
  buyerName: string;
  city: string;
  ticketCount: number;
  createdAt: Date;
  isVisible: boolean;
  type: 'purchase' | 'viewing' | 'urgency';
  message?: string;
}

interface NotificationItemProps {
  notification: LiveNotification;
  onHide: (id: string) => void;
}

// ============================================================================
// COMPONENTE DE NOTIFICACIÓN INDIVIDUAL
// ============================================================================

const NotificationItem: React.FC<NotificationItemProps> = React.memo(({ 
  notification, 
  onHide 
}) => {
  const [isEntering, setIsEntering] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animación de entrada
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 100);

    // Auto-hide después de 2.5 segundos (aparición muy breve)
    timeoutRef.current = setTimeout(() => {
      setIsLeaving(true);
      
      // Después de la animación de salida, notificar al padre
      setTimeout(() => {
        onHide(notification.id);
      }, 300);
    }, 2500);

    return () => {
      clearTimeout(enterTimer);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [notification.id, onHide]);

  const handleClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLeaving(true);
    setTimeout(() => {
      onHide(notification.id);
    }, 300);
  };

  return (
    <div
      className={cn(
        'backdrop-blur-sm bg-white/15 rounded-full shadow-none px-2 py-0.5 mb-0.5',
        'cursor-pointer transition-all duration-300 ease-in-out',
        'max-w-fit border border-white/5 opacity-40 hover:opacity-60',
        {
          'transform translate-x-8 opacity-0 scale-90': isEntering || isLeaving,
          'transform translate-x-0 opacity-40 scale-95': !isEntering && !isLeaving,
        }
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <div className="w-0.5 h-0.5 bg-gray-400 rounded-full opacity-50"></div>
        <span className="text-gray-600 font-normal text-[9px] tracking-tight">
          {notification.type === 'purchase' 
            ? `${notification.buyerName?.split(' ')[0]?.substring(0, 4)} +${notification.ticketCount}`
            : notification.type === 'viewing'
            ? `${notification.message?.match(/\d+/)?.[0]}`
            : '·'
          }
        </span>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const LiveNotifications: React.FC = () => {
  const { addLiveActivity, soldTickets } = useRaffleStore();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIdCounter = useRef(0);

  // Generar ciudad específica (no estado completo)
  const getSpecificCity = () => {
    const majorCities = [
      'CDMX', 'Guadalajara', 'Monterrey', 'Zapopan', 'Tlalnepantla',
      'Naucalpan', 'Puebla', 'León', 'Tijuana', 'Juárez'
    ];
    
    // 70% de las veces usar ciudades grandes
    if (Math.random() < 0.7) {
      return majorCities[Math.floor(Math.random() * majorCities.length)];
    } else {
      const otherCities = ['Querétaro', 'Mérida', 'Saltillo', 'Aguascalientes', 'Morelia'];
      return otherCities[Math.floor(Math.random() * otherCities.length)];
    }
  };

  // Función para generar diferentes tipos de notificaciones
  const generateActivity = useCallback(() => {
    const remainingTickets = TOTAL_TICKETS - soldTickets.length;
    
    // Solo generar si no se han vendido todos los tickets
    if (soldTickets.length >= TOTAL_TICKETS) {
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    // Reducir actividad 90% en madrugada (2am-6am)
    if (currentHour >= 2 && currentHour <= 6) {
      if (Math.random() < 0.9) return;
    }

    const notificationType = Math.random();
    let newNotification: LiveNotification;

    if (notificationType < 0.6) {
      // 60% - Notificaciones de compra
      const buyerName = generateRandomName();
      const city = getSpecificCity();
      const ticketCount = randomBetween(8, 12);
      
      newNotification = {
        id: `notif-${++notificationIdCounter.current}`,
        buyerName,
        city,
        ticketCount,
        createdAt: now,
        isVisible: true,
        type: 'purchase',
        message: `${buyerName} de ${city} acaba de comprar ${ticketCount} boletos`
      };
      
      // Agregar al store
      addLiveActivity({
        buyerName,
        ticketCount
      });
    } else if (notificationType < 0.8) {
      // 20% - Notificaciones de personas viendo
      const viewerCount = randomBetween(12, 28);
      
      newNotification = {
        id: `notif-${++notificationIdCounter.current}`,
        buyerName: '',
        city: '',
        ticketCount: 0,
        createdAt: now,
        isVisible: true,
        type: 'viewing',
        message: `⚡ ${viewerCount} personas viendo este boleto`
      };
    } else {
      // 20% - Notificaciones de urgencia
      const urgencyMessages = [
        `🔥 Solo quedan ${remainingTickets.toLocaleString()} boletos disponibles`,
        `⏰ Última compra hace ${randomBetween(2, 7)} minutos`,
        `📈 ${randomBetween(647, 1200)} boletos vendidos en las últimas 24 horas`,
        `🎯 Promedio de compra: 8.7 boletos por persona`,
        `🚨 ${Math.round((soldTickets.length / TOTAL_TICKETS) * 100)}% vendido - Date prisa`
      ];
      
      newNotification = {
        id: `notif-${++notificationIdCounter.current}`,
        buyerName: '',
        city: '',
        ticketCount: 0,
        createdAt: now,
        isVisible: true,
        type: 'urgency',
        message: urgencyMessages[Math.floor(Math.random() * urgencyMessages.length)]
      };
    }

    // Agregar a notificaciones locales
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Mantener solo 1 notificación para máxima discreción
      return updated.slice(0, 1);
    });
  }, [soldTickets.length, addLiveActivity]);

  // Función para ocultar notificación
  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Efecto para configurar el intervalo de generación
  useEffect(() => {
    // Generar primera notificación después de un tiempo considerable
    const initialTimer = setTimeout(() => {
      generateActivity();
    }, 30000); // 30 segundos de espera inicial

    // Configurar intervalo regular
    const scheduleNext = () => {
      const currentHour = new Date().getHours();
      let delay;
      
      // Intervalos extremadamente espaciados para máxima discreción
      if (currentHour >= 2 && currentHour <= 6) {
        delay = randomBetween(1200000, 1800000); // 20-30 minutos en madrugada
      } else if (currentHour >= 18 && currentHour <= 22) {
        delay = randomBetween(240000, 480000); // 4-8 minutos en horario pico
      } else {
        delay = randomBetween(360000, 600000); // 6-10 minutos normal
      }
      
      intervalRef.current = setTimeout(() => {
        generateActivity();
        scheduleNext(); // Programar el siguiente
      }, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(initialTimer);
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [soldTickets.length]); // Re-ejecutar si cambia el número de tickets vendidos

  // No mostrar en móviles muy pequeños
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // No renderizar en móviles pequeños
  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-3 right-3 z-10 pointer-events-none">
      <div className="flex flex-col-reverse gap-0.5">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onHide={hideNotification}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// HOOK PERSONALIZADO PARA CONTROL MANUAL
// ============================================================================

/**
 * Hook para controlar manualmente las notificaciones en vivo
 * Útil para testing o control administrativo
 */
export const useLiveNotifications = () => {
  const { addLiveActivity } = useRaffleStore();

  const triggerNotification = (customData?: {
    buyerName?: string;
    city?: string;
    ticketCount?: number;
  }) => {
    const buyerName = customData?.buyerName || generateRandomName();
    const city = customData?.city || getRandomCity();
    const ticketCount = customData?.ticketCount || randomBetween(1, 8);

    addLiveActivity({
      buyerName,
      ticketCount
    });

    // También podríamos disparar una notificación visual custom aquí
    console.log(`Notificación disparada: ${buyerName} de ${city} compró ${ticketCount} boletos`);
  };

  return {
    triggerNotification
  };
};

// ============================================================================
// COMPONENTE DE CONTROL PARA DESARROLLO
// ============================================================================

export const LiveNotificationsDebug: React.FC = () => {
  const { triggerNotification } = useLiveNotifications();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
      <div className="text-sm font-bold text-gray-800 mb-2">
        Debug: Live Notifications
      </div>
      <button
        onClick={() => triggerNotification()}
        className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600 transition-colors"
      >
        Disparar Notificación
      </button>
    </div>
  );
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

LiveNotifications.displayName = 'LiveNotifications';

export default LiveNotifications;