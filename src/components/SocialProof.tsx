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
    // Mostrar primera notificación después de 3 segundos
    const initialTimeout = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Cambiar notificación cada 8 segundos
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % socialProofItems.length);
        setIsVisible(true);
      }, 500);
    }, 8000);

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
    <div className="fixed bottom-6 left-6 z-50 max-w-sm">
      <div
        className={cn(
          'transform transition-all duration-500 ease-out',
          isVisible 
            ? 'translate-x-0 opacity-100 scale-100' 
            : '-translate-x-full opacity-0 scale-95'
        )}
      >
        <div className={cn(
          'bg-white border-l-4 rounded-lg shadow-xl p-4',
          styles.bg
        )}>
          <div className="flex items-start gap-3">
            {/* Avatar/Icon */}
            <div className="flex-shrink-0">
              {currentItem.avatar.length <= 2 ? (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentItem.avatar}
                </div>
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {currentItem.avatar}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{styles.icon}</span>
                <div className={cn('w-2 h-2 rounded-full animate-pulse', styles.dot)}></div>
              </div>
              
              <p className="text-sm font-medium text-gray-900 mb-1">
                {currentItem.message}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>📍 {currentItem.location}</span>
                <span>{currentItem.time}</span>
              </div>
            </div>

            {/* Close button */}
            <button 
              onClick={() => setIsVisible(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProof;