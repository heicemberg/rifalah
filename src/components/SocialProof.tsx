// ============================================================================
// COMPONENTE DE PRUEBA SOCIAL PARA AUMENTAR CONVERSIÓN
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

interface SocialProofItem {
  type: 'purchase' | 'viewing' | 'winner';
  message: string;
  location: string;
  time: string;
  avatar: string;
}

// ============================================================================
// DATOS DE PRUEBA SOCIAL
// ============================================================================

const socialProofItems: SocialProofItem[] = [
  {
    type: 'purchase',
    message: 'María compró 5 boletos',
    location: 'Guadalajara, JAL',
    time: 'hace 2 minutos',
    avatar: 'MG'
  },
  {
    type: 'viewing',
    message: '47 personas viendo',
    location: 'Ciudad de México',
    time: 'ahora mismo',
    avatar: '👥'
  },
  {
    type: 'purchase',
    message: 'Carlos compró 10 boletos',
    location: 'Monterrey, NL',
    time: 'hace 5 minutos',
    avatar: 'CM'
  },
  {
    type: 'winner',
    message: 'Ana ganó la rifa pasada',
    location: 'Puebla, PUE',
    time: 'mes pasado',
    avatar: 'AG'
  },
  {
    type: 'purchase',
    message: 'Roberto compró 25 boletos',
    location: 'Tijuana, BC',
    time: 'hace 8 minutos',
    avatar: 'RS'
  },
  {
    type: 'viewing',
    message: '12 personas seleccionando',
    location: 'Querétaro, QRO',
    time: 'ahora mismo',
    avatar: '🎯'
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SocialProof: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar primera notificación después de 10 segundos
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    // Cambiar notificación cada 20-30 segundos (más razonable)
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % socialProofItems.length);
        setIsVisible(true);
      }, 300);
    }, 20000 + Math.random() * 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const currentItem = socialProofItems[currentIndex];

  const getItemStyles = (type: SocialProofItem['type']) => {
    switch (type) {
      case 'purchase':
        return {
          bg: 'bg-green-50 border-green-200',
          dot: 'bg-green-500',
          icon: '🛒'
        };
      case 'viewing':
        return {
          bg: 'bg-blue-50 border-blue-200',
          dot: 'bg-blue-500',
          icon: '👀'
        };
      case 'winner':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          dot: 'bg-yellow-500',
          icon: '🏆'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          dot: 'bg-gray-500',
          icon: '📢'
        };
    }
  };

  const styles = getItemStyles(currentItem.type);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-3 left-3 z-10 max-w-fit">
      <div
        className={cn(
          'transform transition-all duration-300 ease-out',
          isVisible 
            ? 'translate-x-0 opacity-40 scale-95' 
            : '-translate-x-full opacity-0 scale-90'
        )}
      >
        <div className="backdrop-blur-sm bg-white/15 border border-white/10 rounded-full shadow-none px-3 py-1.5 hover:opacity-60 transition-opacity">
          <div className="flex items-center gap-2">
            {/* Small dot indicator */}
            <div className="w-1 h-1 bg-gray-500 rounded-full opacity-50"></div>
            
            {/* Complete content but compact */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-700 font-medium">
                {currentItem.message}
              </span>
              <span className="text-[10px] text-gray-500 font-normal">
                {currentItem.time}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProof;