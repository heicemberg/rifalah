// ============================================================================
// BANNER DE URGENCIA FLOTANTE PARA MAXIMIZAR CONVERSIÓN
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useTickets } from '../stores/raffle-store';
import { cn } from '../lib/utils';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface Props {
  onOpenPurchaseModal: () => void;
}

const UrgencyBanner: React.FC<Props> = ({ onOpenPurchaseModal }) => {
  const { availableTickets, soldPercentage } = useTickets();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Calcular tiempo restante hasta fin de oferta (ejemplo: 6 horas)
  useEffect(() => {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 6); // 6 horas desde ahora

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mostrar banner solo después de salir del hero
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight; // Altura completa del hero
      const scrolled = window.scrollY > heroHeight - 200; // 200px antes del final del hero
      const fewTicketsLeft = availableTickets.length < 1000;
      const highSoldPercentage = soldPercentage > 70;
      
      const shouldShow = (scrolled || fewTicketsLeft || highSoldPercentage) && window.scrollY > 300;
      
      if (shouldShow && !isVisible) {
        setIsVisible(true);
      } else if (!shouldShow && isVisible && window.scrollY <= 300) {
        setIsVisible(false);
      }
    };

    // No mostrar inicialmente
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [availableTickets.length, soldPercentage, isVisible]);

  if (!isVisible) return null;

  const urgencyLevel = availableTickets.length < 500 ? 'critical' : 
                      availableTickets.length < 1000 ? 'high' : 'medium';

  const bannerStyles = {
    critical: 'bg-gradient-to-r from-red-600 to-red-700 animate-pulse',
    high: 'bg-gradient-to-r from-orange-600 to-red-600',
    medium: 'bg-gradient-to-r from-yellow-600 to-orange-600'
  };

  const urgencyMessages = {
    critical: '🚨 CRÍTICO: Últimos boletos disponibles',
    high: '⚠️ URGENTE: Quedan pocos boletos',
    medium: '⏰ OFERTA LIMITADA: No te quedes sin participar'
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40">
      <div
        className={cn(
          'transform transition-all duration-500 ease-out',
          isVisible ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className={cn('text-white py-2 px-4 shadow-lg', bannerStyles[urgencyLevel])}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-3">
              {/* Mensaje principal */}
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="font-bold text-sm md:text-base">
                    {urgencyMessages[urgencyLevel]}
                  </span>
                </div>
                
                <div className="hidden md:flex items-center gap-3 text-xs">
                  <div className="bg-white/20 rounded-full px-2 py-1">
                    <span className="font-semibold">{availableTickets.length.toLocaleString()}</span> restantes
                  </div>
                  <div className="bg-white/20 rounded-full px-2 py-1">
                    <span className="font-semibold">{soldPercentage.toFixed(1)}%</span> vendido
                  </div>
                </div>
              </div>

              {/* Contador de tiempo y acciones */}
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 text-xs">
                  <span>Termina en:</span>
                  <div className="flex gap-1">
                    <div className="bg-white/20 rounded px-1.5 py-0.5 font-mono font-bold text-xs">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 rounded px-1.5 py-0.5 font-mono font-bold text-xs">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <span>:</span>
                    <div className="bg-white/20 rounded px-1.5 py-0.5 font-mono font-bold text-xs">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Botón de acción */}
                <button
                  onClick={onOpenPurchaseModal}
                  className="bg-white text-gray-900 font-bold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors shadow-md transform hover:scale-105 text-sm"
                >
                  🎫 Comprar
                </button>

                {/* Botón cerrar */}
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Cerrar banner"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrgencyBanner;