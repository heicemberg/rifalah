// ============================================================================
// CONTADORES DE URGENCIA PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useEffect, useState, useRef } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { useDisplayStats } from '../hooks/useSmartCounters';
import { randomBetween, cn } from '../lib/utils';
import { TOTAL_TICKETS } from '../lib/constants';

// ============================================================================
// TIPOS
// ============================================================================

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

// ============================================================================
// HOOK PARA COUNTDOWN TIMER
// ============================================================================

const useCountdown = (targetDate: Date): TimeRemaining => {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false
      });
    };

    // Actualizar inmediatamente
    updateCountdown();

    // Actualizar cada segundo
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeRemaining;
};

// ============================================================================
// HOOK PARA SIMULAR VIEWING COUNT FLUCTUANTE
// ============================================================================

const useFluctuatingViewers = () => {
  const { viewingCount, soldTickets, setViewingCount } = useRaffleStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateViewers = () => {
      const currentHour = new Date().getHours();
      let baseViewers: number;
      
      // Viewers base entre 89-347 personas
      baseViewers = randomBetween(89, 347);

      // Aplicar modificadores por hora
      if (currentHour >= 2 && currentHour <= 6) {
        // Madrugada: reducir viewers significativamente
        baseViewers = Math.floor(baseViewers * 0.3);
      } else if (currentHour >= 18 && currentHour <= 22) {
        // Horario pico nocturno: más viewers
        baseViewers = Math.floor(baseViewers * 1.4);
      } else if (currentHour >= 12 && currentHour <= 14) {
        // Hora de comida: más viewers
        baseViewers = Math.floor(baseViewers * 1.2);
      }

      // Añadir fluctuación aleatoria ±10%
      const fluctuation = randomBetween(-10, 10);
      const newCount = Math.max(
        89, // Mínimo 89 viewers
        Math.min(347, Math.floor(baseViewers + (baseViewers * fluctuation / 100)))
      );

      setViewingCount(newCount);

      // Programar siguiente actualización (30-60 segundos)
      const nextUpdate = randomBetween(30000, 60000);
      intervalRef.current = setTimeout(updateViewers, nextUpdate);
    };

    // Iniciar ciclo de actualizaciones
    updateViewers();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [soldTickets.length, setViewingCount]);

  return viewingCount;
};

// ============================================================================
// FUNCIÓN PARA DETERMINAR NIVEL DE URGENCIA (Basado en tickets restantes)
// ============================================================================

const getUrgencyLevel = (remainingTickets: number): UrgencyLevel => {
  if (remainingTickets > 3000) return 'low';
  if (remainingTickets > 1500) return 'medium';
  if (remainingTickets > 500) return 'high';
  return 'critical';
};

// ============================================================================
// COMPONENTE DE TIEMPO RESTANTE
// ============================================================================

const CountdownDisplay: React.FC<{ time: TimeRemaining }> = React.memo(({ time }) => {
  if (time.isExpired) {
    return (
      <div className="text-center p-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg text-white">
        <div className="text-2xl font-bold mb-2">🎉 ¡SORTEO REALIZADO!</div>
        <div className="text-sm opacity-90">La rifa ha terminado</div>
      </div>
    );
  }

  const timeUnits = [
    { value: time.days, label: 'Días', short: 'D' },
    { value: time.hours, label: 'Horas', short: 'H' },
    { value: time.minutes, label: 'Min', short: 'M' },
    { value: time.seconds, label: 'Seg', short: 'S' }
  ];

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-1">
          ⏰ Tiempo restante para el sorteo
        </h3>
        <p className="text-sm text-gray-600">
          31 de Diciembre 2024, 8:00 PM
        </p>
      </div>

      {/* Contador principal - Desktop */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg p-4 text-center"
          >
            <div className="text-2xl font-bold mb-1">
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-medium opacity-90">
              {unit.label}
            </div>
          </div>
        ))}
      </div>

      {/* Contador compacto - Mobile */}
      <div className="md:hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 text-center">
          <div className="text-xl font-bold mb-2">
            {timeUnits.map((unit, idx) => (
              <span key={unit.label}>
                {unit.value.toString().padStart(2, '0')}{unit.short}
                {idx < timeUnits.length - 1 && <span className="mx-1">:</span>}
              </span>
            ))}
          </div>
          <div className="text-sm opacity-90">
            Días : Horas : Min : Seg
          </div>
        </div>
      </div>
    </div>
  );
});

CountdownDisplay.displayName = 'CountdownDisplay';

// ============================================================================
// COMPONENTE DE BARRA DE URGENCIA
// ============================================================================

const UrgencyBar: React.FC<{ remainingTickets: number }> = React.memo(({ remainingTickets }) => {
  const urgencyLevel = getUrgencyLevel(remainingTickets);

  const urgencyConfig = {
    low: {
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      message: `✅ Quedan ${remainingTickets.toLocaleString()} boletos`,
      pulse: false
    },
    medium: {
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      message: `⚠️ Solo quedan ${remainingTickets.toLocaleString()} boletos`,
      pulse: false
    },
    high: {
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
      message: `🔥 Solo quedan ${remainingTickets.toLocaleString()} boletos disponibles`,
      pulse: true
    },
    critical: {
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      message: `🚨 ¡ÚLTIMOS ${remainingTickets.toLocaleString()} BOLETOS!`,
      pulse: true
    }
  };

  const config = urgencyConfig[urgencyLevel];

  return (
    <div className={cn(
      'p-4 rounded-lg border-2 transition-all duration-500',
      config.bgColor,
      config.borderColor,
      {
        'animate-pulse': config.pulse
      }
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className={cn('font-bold text-sm', config.textColor)}>
          {config.message}
        </span>
        <span className={cn('text-sm font-medium', config.textColor)}>
          {Math.round((remainingTickets / TOTAL_TICKETS) * 100)}% disponible
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="relative h-3 bg-white rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-gradient-to-r transition-all duration-1000',
            config.color,
            {
              'animate-pulse': config.pulse
            }
          )}
          style={{
            width: `${Math.min(100, (remainingTickets / TOTAL_TICKETS) * 100)}%`
          }}
        />
        
        {/* Efecto de brillo */}
        {config.pulse && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
        )}
      </div>

      {/* Estadísticas adicionales */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <div className={cn('font-bold', config.textColor)}>
            {randomBetween(847, 1200)}
          </div>
          <div className="text-gray-600">vendidos últimas 24h</div>
        </div>
        <div className="text-center">
          <div className={cn('font-bold', config.textColor)}>
            8.7
          </div>
          <div className="text-gray-600">promedio por compra</div>
        </div>
      </div>
    </div>
  );
});

UrgencyBar.displayName = 'UrgencyBar';

// ============================================================================
// COMPONENTE DE VIEWERS EN VIVO
// ============================================================================

const LiveViewers: React.FC<{ count: number }> = React.memo(({ count }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">
              {count.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">
              personas viendo
            </div>
          </div>
        </div>
        <div className="text-2xl">👥</div>
      </div>
      
      {/* Mensaje dinámico basado en cantidad */}
      <div className="mt-3 text-center">
        {count < 150 && (
          <div className="text-xs text-blue-600">
            📈 Interés moderado
          </div>
        )}
        {count >= 150 && count < 250 && (
          <div className="text-xs text-orange-600">
            🔥 Alta demanda
          </div>
        )}
        {count >= 250 && (
          <div className="text-xs text-red-600 font-bold">
            🚨 Demanda extrema
          </div>
        )}
      </div>
    </div>
  );
});

LiveViewers.displayName = 'LiveViewers';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const UrgencyCounters: React.FC = () => {
  // Estado del store
  const { adminConfig } = useRaffleStore();
  const smartStats = useDisplayStats();
  
  // Calcular boletos restantes usando estadísticas inteligentes
  const remainingTickets = smartStats.availableCount;
  
  // Hooks personalizados
  const timeRemaining = useCountdown(adminConfig.sorteoDate);
  const viewingCount = useFluctuatingViewers();

  return (
    <div className="w-full space-y-6">
      {/* Countdown Timer */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <CountdownDisplay time={timeRemaining} />
      </div>

      {/* Grid de indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barra de Urgencia */}
        <div>
          <UrgencyBar remainingTickets={remainingTickets} />
        </div>

        {/* Live Viewers */}
        <div>
          <LiveViewers count={viewingCount} />
        </div>
      </div>

      {/* Mensaje de urgencia adicional */}
      {remainingTickets < 3000 && (
        <div className={cn(
          'text-white rounded-lg p-4 text-center',
          remainingTickets < 1000 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 animate-pulse' 
            : 'bg-gradient-to-r from-orange-500 to-red-500'
        )}>
          <div className="text-lg font-bold mb-2">
            {remainingTickets < 1000 ? '🚨 ¡ÚLTIMOS BOLETOS!' : '⚠️ ¡POCOS BOLETOS!'}
          </div>
          <div className="text-sm">
            Solo quedan {remainingTickets.toLocaleString()} boletos disponibles. ¡Asegura el tuyo!
          </div>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-800">
            {smartStats.soldCount.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600">Boletos vendidos</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-800">
            {remainingTickets.toLocaleString()}
          </div>
          <div className="text-xs text-red-600">Boletos restantes</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-800">
            {randomBetween(847, 1200)}
          </div>
          <div className="text-xs text-green-600">Vendidos últimas 24h</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-purple-800">
            8.7
          </div>
          <div className="text-xs text-purple-600">Promedio por compra</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

UrgencyCounters.displayName = 'UrgencyCounters';

export default UrgencyCounters;