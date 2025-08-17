// ============================================================================
// BARRA DE ESTADÍSTICAS PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useEffect, useState } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { TOTAL_TICKETS } from '../lib/constants';
import { formatPrice, cn } from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

interface StatItemProps {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isHighlighted?: boolean;
}

// ============================================================================
// COMPONENTE DE STAT INDIVIDUAL
// ============================================================================

const StatItem: React.FC<StatItemProps> = React.memo(({
  label,
  value,
  icon,
  color,
  isHighlighted = false
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    orange: 'text-orange-600 bg-orange-50 border-orange-200',
    red: 'text-red-600 bg-red-50 border-red-200'
  };

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border transition-all duration-300',
      colorClasses[color],
      {
        'ring-2 ring-opacity-50': isHighlighted,
        'ring-purple-300': isHighlighted && color === 'purple',
        'ring-blue-300': isHighlighted && color === 'blue',
        'ring-green-300': isHighlighted && color === 'green',
        'ring-orange-300': isHighlighted && color === 'orange',
        'ring-red-300': isHighlighted && color === 'red',
        'scale-105': isHighlighted,
      }
    )}>
      <div className="text-xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className={cn(
          'text-lg font-bold truncate',
          {
            'text-blue-800': color === 'blue',
            'text-green-800': color === 'green',
            'text-purple-800': color === 'purple',
            'text-orange-800': color === 'orange',
            'text-red-800': color === 'red',
          }
        )}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className={cn(
          'text-xs font-medium truncate',
          {
            'text-blue-600': color === 'blue',
            'text-green-600': color === 'green',
            'text-purple-600': color === 'purple',
            'text-orange-600': color === 'orange',
            'text-red-600': color === 'red',
          }
        )}>
          {label}
        </div>
      </div>
    </div>
  );
});

StatItem.displayName = 'StatItem';

// ============================================================================
// COMPONENTE DE PROGRESS BAR ANIMADO
// ============================================================================

const AnimatedProgressBar: React.FC<{
  percentage: number;
  label: string;
  color?: 'blue' | 'green' | 'purple';
}> = React.memo(({ percentage, label, color = 'blue' }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500'
  };

  const bgColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-bold text-gray-800">{percentage}%</span>
      </div>
      <div className={cn('h-3 rounded-full overflow-hidden', bgColorClasses[color])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            colorClasses[color],
            {
              'bg-gradient-to-r from-blue-400 to-blue-600': color === 'blue',
              'bg-gradient-to-r from-green-400 to-green-600': color === 'green',
              'bg-gradient-to-r from-purple-400 to-purple-600': color === 'purple',
            }
          )}
          style={{
            width: `${Math.min(animatedPercentage, 100)}%`,
            transition: 'width 1000ms ease-out'
          }}
        />
      </div>
    </div>
  );
});

AnimatedProgressBar.displayName = 'AnimatedProgressBar';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const StatsBar: React.FC = () => {
  // Estado del store - se actualiza automáticamente
  const {
    soldTickets,
    reservedTickets,
    selectedTickets,
    availableTickets,
    soldPercentage,
    totalSelected,
    totalPrice,
    viewingCount
  } = useRaffleStore();

  // Calcular estadísticas derivadas
  const soldCount = soldTickets.length;
  const reservedCount = reservedTickets.length;
  const availableCount = availableTickets.length;
  const totalSoldAndReserved = soldCount + reservedCount;

  return (
    <div className="w-full bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Título */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          📊 Estadísticas de la Rifa
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Actualizando en tiempo real</span>
        </div>
      </div>

      {/* Progress Bar Principal */}
      <div className="mb-6">
        <AnimatedProgressBar
          percentage={soldPercentage}
          label="Progreso de ventas"
          color="blue"
        />
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatItem
          icon="🎫"
          label="Disponibles"
          value={availableCount}
          color="green"
        />
        
        <StatItem
          icon="✅"
          label="Vendidos"
          value={soldCount}
          color="blue"
        />
        
        <StatItem
          icon="⏳"
          label="Reservados"
          value={reservedCount}
          color="orange"
        />
        
        <StatItem
          icon="👥"
          label="Personas viendo"
          value={viewingCount}
          color="purple"
        />
      </div>

      {/* Resumen de Selección Actual */}
      {totalSelected > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            🛒 Tu Selección Actual
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatItem
              icon="🎯"
              label="Boletos seleccionados"
              value={totalSelected}
              color="purple"
              isHighlighted={true}
            />
            
            <StatItem
              icon="💰"
              label="Total a pagar"
              value={formatPrice(totalPrice)}
              color="green"
              isHighlighted={true}
            />
            
            <StatItem
              icon="💵"
              label="Precio por boleto"
              value={formatPrice(Math.round(totalPrice / totalSelected))}
              color="blue"
            />
          </div>

          {/* Información adicional de descuento */}
          {totalSelected > 1 && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-700 font-medium">
                  🎉 Descuento aplicado automáticamente
                </span>
                <span className="text-purple-800 font-bold">
                  Ahorras {formatPrice((totalSelected * 50) - totalPrice)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas Avanzadas */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-800">
              {TOTAL_TICKETS.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Total de boletos
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(soldCount * 50)}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Recaudado
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {((availableCount / TOTAL_TICKETS) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Disponible
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.ceil(availableCount / viewingCount)}
            </div>
            <div className="text-xs text-gray-600 font-medium">
              Boletos por persona
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje motivacional */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="text-center">
          {soldPercentage < 25 && (
            <div className="text-blue-700">
              <div className="font-bold">🚀 ¡La rifa acaba de comenzar!</div>
              <div className="text-sm">Asegura tus números favoritos ahora</div>
            </div>
          )}
          
          {soldPercentage >= 25 && soldPercentage < 50 && (
            <div className="text-orange-700">
              <div className="font-bold">🔥 ¡Vendiendo rápido!</div>
              <div className="text-sm">Ya se vendió el {soldPercentage}% de los boletos</div>
            </div>
          )}
          
          {soldPercentage >= 50 && soldPercentage < 75 && (
            <div className="text-red-700">
              <div className="font-bold">⚡ ¡Más de la mitad vendidos!</div>
              <div className="text-sm">Quedan {availableCount.toLocaleString()} boletos disponibles</div>
            </div>
          )}
          
          {soldPercentage >= 75 && soldPercentage < 90 && (
            <div className="text-red-700">
              <div className="font-bold">🎯 ¡Últimas oportunidades!</div>
              <div className="text-sm">Solo queda el {(100 - soldPercentage).toFixed(1)}% disponible</div>
            </div>
          )}
          
          {soldPercentage >= 90 && soldPercentage < 100 && (
            <div className="text-red-800">
              <div className="font-bold">🚨 ¡CASI AGOTADO!</div>
              <div className="text-sm">Solo {availableCount} boletos restantes</div>
            </div>
          )}
          
          {soldPercentage === 100 && (
            <div className="text-purple-700">
              <div className="font-bold">🎉 ¡VENDIDO COMPLETAMENTE!</div>
              <div className="text-sm">Gracias por participar</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

StatsBar.displayName = 'StatsBar';

export default StatsBar;