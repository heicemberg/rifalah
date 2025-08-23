'use client';

import React, { useState, useEffect } from 'react';
import { useRaffleStore } from '../stores/raffle-store';
import { useRealTimeTickets } from '../hooks/useRealTimeTickets';

// ============================================================================
// CONTADOR DE TIEMPO REAL HASTA SORTEO O AGOTAMIENTO
// ============================================================================

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC = () => {
  const { formatMexicanNumber, PRECIO_POR_BOLETO_MXN, formatPriceMXN, stats } = useRealTimeTickets();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);
  
  // Obtener datos de tickets desde el hook
  const soldTickets = Array.from({ length: stats.soldTickets }, (_, i) => i + 1);
  const totalTickets = stats.totalTickets;

  // Fecha del sorteo: 24 de Noviembre 2025, 8:00 PM México
  const SORTEO_DATE = new Date('2025-11-24T20:00:00-06:00').getTime();

  useEffect(() => {
    setIsClient(true);
    
    const calculateTimeLeft = (): TimeLeft => {
      const now = Date.now();
      const difference = SORTEO_DATE - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Actualizar inmediatamente
    setTimeLeft(calculateTimeLeft());

    // Actualizar cada segundo
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isClient) {
    // Render placeholder durante hidratación
    return (
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-700 text-white py-4 px-6 rounded-2xl shadow-2xl border-2 border-red-400">
        <div className="text-center">
          <div className="text-sm font-bold mb-2 text-red-100">
            ⏰ SORTEO OFICIAL
          </div>
          <div className="grid grid-cols-4 gap-3 mb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mb-1">
                  <div className="text-2xl font-black">--</div>
                </div>
                <div className="text-xs font-medium text-red-100">-</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calcular porcentaje vendido
  const soldPercentage = Math.round((soldTickets.length / totalTickets) * 100);
  const ticketsLeft = totalTickets - soldTickets.length;
  
  // Determinar si se acaban los boletos antes del sorteo
  const willSellOut = soldPercentage > 85; // Si ya se vendió el 85%

  return (
    <div className="bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white py-8 px-8 rounded-3xl shadow-2xl border-2 border-red-400/50 backdrop-blur-sm hover:shadow-3xl transition-all duration-500">
      <div className="text-center">
        {/* Header dinámico */}
        <div className="text-base font-bold mb-4 text-red-100 tracking-wide">
          {willSellOut ? (
            <>⚡ SE AGOTAN RÁPIDO - QUEDAN {formatMexicanNumber(ticketsLeft)} BOLETOS</>
          ) : (
            <>⏰ SORTEO OFICIAL - 24 NOVIEMBRE 2025</>
          )}
        </div>

        {/* Contador principal */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center group">
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4 mb-2 border border-white/40 group-hover:bg-white/35 transition-all duration-300 shadow-lg">
              <div className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                {timeLeft.days.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-sm font-medium text-red-100">DÍAS</div>
          </div>
          
          <div className="text-center group">
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4 mb-2 border border-white/40 group-hover:bg-white/35 transition-all duration-300 shadow-lg">
              <div className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-sm font-medium text-red-100">HORAS</div>
          </div>
          
          <div className="text-center group">
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4 mb-2 border border-white/40 group-hover:bg-white/35 transition-all duration-300 shadow-lg">
              <div className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-sm font-medium text-red-100">MIN</div>
          </div>
          
          <div className="text-center group">
            <div className="bg-white/25 backdrop-blur-md rounded-2xl p-4 mb-2 border border-white/40 group-hover:bg-white/35 transition-all duration-300 shadow-lg">
              <div className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
            </div>
            <div className="text-sm font-medium text-red-100">SEG</div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-5 border border-white/30 shadow-lg">
          <div className="text-base font-medium mb-2 text-white">
            📅 Lunes 24 de Noviembre, 8:00 PM (Hora México)
          </div>
          <div className="text-sm text-red-100">
            🏛️ Sorteo certificado por Notario Público
          </div>
        </div>

        {/* Barra de progreso de tickets */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-red-100 mb-1">
            <span>Boletos vendidos: {soldTickets.length.toLocaleString()}</span>
            <span>{soldPercentage}% vendido</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${soldPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-center text-red-100 mt-1">
            {ticketsLeft > 0 ? (
              <>Quedan {ticketsLeft.toLocaleString()} boletos disponibles</>
            ) : (
              <>🎉 ¡TODOS LOS BOLETOS VENDIDOS!</>
            )}
          </div>
        </div>

        {/* Urgencia condicional */}
        {willSellOut && (
          <div className="mt-3 bg-yellow-400 text-yellow-900 px-3 py-2 rounded-lg font-bold text-sm">
            ⚠️ ¡ÚLTIMOS BOLETOS! El sorteo podría adelantarse si se agotan
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;