// ============================================================================
// NOTIFICACIONES EN VIVO PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useEffect, useRef, useState } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { 
  generateRandomName, 
  getRandomCity, 
  formatRelativeTime, 
  randomBetween,
  cn
} from '../lib/utils';

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
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Animación de entrada
    const enterTimer = setTimeout(() => {
      setIsEntering(false);
    }, 100);

    // Auto-hide después de 4 segundos
    timeoutRef.current = setTimeout(() => {
      setIsLeaving(true);
      
      // Después de la animación de salida, notificar al padre
      setTimeout(() => {
        onHide(notification.id);
      }, 300);
    }, 4000);

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
        'bg-white border border-gray-200 rounded-lg shadow-lg p-4 mb-3',
        'cursor-pointer transition-all duration-300 ease-out',
        'hover:shadow-xl hover:border-blue-300',
        'max-w-sm w-full',
        {
          'transform translate-x-full opacity-0': isEntering,
          'transform translate-x-0 opacity-100': !isEntering && !isLeaving,
          'transform translate-x-full opacity-0': isLeaving,
        }
      )}
      onClick={handleClick}
    >
      {/* Header con icono y tiempo */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-600">
            Nueva compra
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      {/* Contenido principal */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">
            {notification.buyerName}
          </span>
          <span className="text-xs text-gray-500">de</span>
          <span className="text-xs font-medium text-blue-600">
            {notification.city}
          </span>
        </div>
        
        <div className="text-sm text-gray-700">
          compró{' '}
          <span className="font-bold text-purple-600">
            {notification.ticketCount} boleto{notification.ticketCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Indicador de click para cerrar */}
      <div className="mt-2 text-xs text-gray-400 text-right">
        Click para cerrar
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
  const intervalRef = useRef<NodeJS.Timeout>();
  const notificationIdCounter = useRef(0);

  // Función para generar una nueva actividad fake
  const generateFakeActivity = () => {
    // Solo generar si no se han vendido todos los tickets
    if (soldTickets.length >= 10000) {
      return;
    }

    const buyerName = generateRandomName();
    const city = getRandomCity();
    const ticketCount = randomBetween(1, 12);
    const now = new Date();

    const newNotification: LiveNotification = {
      id: `notif-${++notificationIdCounter.current}`,
      buyerName,
      city,
      ticketCount,
      createdAt: now,
      isVisible: true
    };

    // Agregar al store
    addLiveActivity({
      buyerName,
      ticketCount
    });

    // Agregar a notificaciones locales
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Mantener solo las últimas 3 notificaciones
      return updated.slice(0, 3);
    });
  };

  // Función para ocultar notificación
  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  // Efecto para configurar el intervalo de generación
  useEffect(() => {
    // Generar primera notificación inmediatamente
    const initialTimer = setTimeout(() => {
      generateFakeActivity();
    }, 1000);

    // Configurar intervalo regular
    const scheduleNext = () => {
      const delay = randomBetween(3000, 8000); // 3-8 segundos
      intervalRef.current = setTimeout(() => {
        generateFakeActivity();
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
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className="flex flex-col-reverse gap-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onHide={hideNotification}
            />
          </div>
        ))}
      </div>

      {/* Indicador de actividad (solo visible si hay notificaciones) */}
      {notifications.length > 0 && (
        <div className="fixed bottom-2 right-2 pointer-events-none">
          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            🔴 En vivo
          </div>
        </div>
      )}
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