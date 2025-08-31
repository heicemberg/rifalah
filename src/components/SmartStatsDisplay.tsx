'use client';

import React, { useMemo } from 'react';
import { useSmartCounters, useAdminCounters, useDisplayStats } from '../hooks/useSmartCounters';
import { Eye, TrendingUp, Target, Users, Clock, Database } from 'lucide-react';
import { cn } from '../lib/utils';

// ============================================================================
// COMPONENTE DE ESTADÍSTICAS INTELIGENTES CON FOMO
// ============================================================================

interface SmartStatsDisplayProps {
  className?: string;
  showAdminInfo?: boolean;
  compact?: boolean;
  variant?: 'hero' | 'sidebar' | 'full';
}

export const SmartStatsDisplay: React.FC<SmartStatsDisplayProps> = ({
  className = '',
  showAdminInfo = false,
  compact = false,
  variant = 'full'
}) => {
  // Usar hook apropiado según si es admin o no
  const adminData = useAdminCounters();
  const displayData = useDisplayStats();
  const smartCounters = useSmartCounters();

  // Formatear números mexicanos
  const formatMexicanNumber = (num: number): string => {
    return num.toLocaleString('es-MX');
  };

  // Formatear precios mexicanos
  const formatPriceMXN = (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Stats para mostrar al público
  const publicStats = useMemo(() => [
    {
      id: 'sold',
      label: 'Boletos Vendidos',
      value: displayData.soldCount,
      percentage: displayData.soldPercentage,
      icon: <Target className="w-5 h-5" />,
      color: 'from-emerald-500 to-green-600',
      format: 'number' as const
    },
    {
      id: 'available',
      label: 'Boletos Disponibles',
      value: displayData.availableCount,
      percentage: (displayData.availableCount / displayData.totalCount) * 100,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-600',
      format: 'number' as const
    },
    {
      id: 'reserved',
      label: 'Reservados',
      value: displayData.reservedCount,
      percentage: (displayData.reservedCount / displayData.totalCount) * 100,
      icon: <Clock className="w-5 h-5" />,
      color: 'from-amber-500 to-orange-600',
      format: 'number' as const
    }
  ], [displayData]);

  // Componente compacto para hero
  if (compact || variant === 'hero') {
    return (
      <div className={cn('flex flex-wrap justify-center gap-4', className)}>
        {publicStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-4 py-3 shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-gradient-to-r ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatMexicanNumber(stat.value)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Version completa con información admin opcional
  return (
    <div className={cn('space-y-6', className)}>
      {/* Estadísticas públicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {publicStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} text-white shadow-md`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatMexicanNumber(stat.value)}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{stat.label}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(100, stat.percentage)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado de conexión */}
      <div className="flex justify-center">
        <div className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
          smartCounters.isConnected
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
        )}>
          <div className={cn(
            'w-2 h-2 rounded-full',
            smartCounters.isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
          )} />
          {smartCounters.isConnected ? 'Conectado en tiempo real' : 'Modo offline'}
          {smartCounters.lastUpdate && (
            <span className="text-xs opacity-75">
              • {smartCounters.lastUpdate.toLocaleTimeString('es-MX')}
            </span>
          )}
        </div>
      </div>

      {/* Información de admin (solo si showAdminInfo es true) */}
      {showAdminInfo && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-purple-900">
              Panel de Control - Vista Admin
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Datos mostrados al público */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mostrado al Público
              </h4>
              <div className="space-y-1 text-sm">
                <div>Vendidos: <span className="font-bold">{formatMexicanNumber(adminData.display.soldCount)}</span></div>
                <div>Porcentaje: <span className="font-bold">{adminData.display.soldPercentage.toFixed(1)}%</span></div>
                <div>Disponibles: <span className="font-bold">{formatMexicanNumber(adminData.display.availableCount)}</span></div>
              </div>
            </div>

            {/* Datos reales de la BD */}
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Datos Reales (BD)
              </h4>
              <div className="space-y-1 text-sm">
                <div>Vendidos: <span className="font-bold">{formatMexicanNumber(adminData.real.soldCount)}</span></div>
                <div>Porcentaje: <span className="font-bold">{adminData.real.soldPercentage.toFixed(1)}%</span></div>
                <div>Disponibles: <span className="font-bold">{formatMexicanNumber(adminData.real.availableCount)}</span></div>
              </div>
            </div>

            {/* Estado FOMO */}
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Sistema FOMO
              </h4>
              <div className="space-y-1 text-sm">
                <div>
                  Estado: 
                  <span className={cn(
                    'ml-1 font-bold',
                    adminData.fomo.isActive ? 'text-amber-600' : 'text-gray-600'
                  )}>
                    {adminData.fomo.isActive ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </div>
                <div>Base FOMO: <span className="font-bold">{formatMexicanNumber(adminData.fomo.baseCount)}</span></div>
                <div>
                  Diferencia: 
                  <span className="font-bold text-purple-600">
                    +{formatMexicanNumber(adminData.display.soldCount - adminData.real.soldCount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Explicación del sistema */}
          <div className="bg-purple-100 rounded-lg p-3 text-xs text-purple-800">
            <p className="font-semibold mb-1">🧠 Sistema FOMO Inteligente:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>FOMO activo cuando ventas reales {'<'} 18%</li>
              <li>Muestra max(ventas_reales, fomo_ficticio)</li>
              <li>FOMO inicia en 8% y sube gradualmente a 16%</li>
              <li>Al superar 18% de ventas reales, solo muestra datos reales</li>
              <li>Boletos disponibles SIEMPRE son los reales de la BD</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE COMPACTO PARA BARRAS LATERALES
// ============================================================================
export const CompactSmartStats: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { soldCount, soldPercentage, availableCount } = useDisplayStats();

  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {soldCount.toLocaleString('es-MX')}
        </div>
        <div className="text-sm text-gray-600">Boletos Vendidos</div>
        <div className="text-xs text-gray-500">{soldPercentage.toFixed(1)}%</div>
      </div>
      
      <div className="text-center">
        <div className="text-xl font-bold text-blue-600">
          {availableCount.toLocaleString('es-MX')}
        </div>
        <div className="text-sm text-gray-600">Disponibles</div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, soldPercentage)}%` }}
        />
      </div>
    </div>
  );
};

export default SmartStatsDisplay;