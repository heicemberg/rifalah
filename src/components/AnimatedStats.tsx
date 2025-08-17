// ============================================================================
// COMPONENTE DE ESTADÍSTICAS ANIMADAS
// ============================================================================

'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { TOTAL_TICKETS } from '../lib/constants';
import { formatPrice, cn } from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

export interface StatItem {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: string;
  color?: string;
  format?: 'number' | 'currency' | 'percentage';
}

interface AnimatedStatsProps {
  stats?: StatItem[];
  className?: string;
  columns?: 2 | 3 | 4;
  showDefaultStats?: boolean;
  loading?: boolean;
}

interface CounterProps {
  value: number;
  format?: 'number' | 'currency' | 'percentage';
  prefix?: string;
  suffix?: string;
  duration?: number;
  trigger?: boolean;
}

// ============================================================================
// HOOK INTERSECTION OBSERVER
// ============================================================================

const useIntersectionObserver = (
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.3,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);

  return isIntersecting;
};

// ============================================================================
// COMPONENTE CONTADOR ANIMADO
// ============================================================================

const AnimatedCounter: React.FC<CounterProps> = ({
  value,
  format = 'number',
  prefix = '',
  suffix = '',
  duration = 2000,
  trigger = true
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animación con react-spring
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: trigger ? value : 0 },
    config: {
      ...config.gentle,
      duration
    },
    onRest: () => {
      setDisplayValue(value);
    }
  });

  // Formatear número según tipo
  const formatNumber = useCallback((num: number): string => {
    switch (format) {
      case 'currency':
        return formatPrice(num);
      case 'percentage':
        return `${num.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('es-MX').format(Math.floor(num));
    }
  }, [format]);

  return (
    <animated.span className="font-bold">
      {number.to(n => `${prefix}${formatNumber(n)}${suffix}`)}
    </animated.span>
  );
};

// ============================================================================
// COMPONENTE SKELETON
// ============================================================================

const StatSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE STAT INDIVIDUAL
// ============================================================================

const StatCard: React.FC<{
  stat: StatItem;
  trigger: boolean;
  index: number;
}> = ({ stat, trigger, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Animación de la card
  const cardAnimation = useSpring({
    from: { 
      opacity: 0, 
      transform: 'translateY(30px) scale(0.95)' 
    },
    to: { 
      opacity: trigger ? 1 : 0, 
      transform: trigger 
        ? `translateY(0px) scale(${isHovered ? 1.02 : 1})` 
        : 'translateY(30px) scale(0.95)' 
    },
    config: config.gentle,
    delay: index * 150
  });

  // Animación del icono
  const iconAnimation = useSpring({
    from: { transform: 'rotate(0deg) scale(1)' },
    to: { 
      transform: isHovered 
        ? 'rotate(5deg) scale(1.1)' 
        : 'rotate(0deg) scale(1)' 
    },
    config: config.wobbly
  });

  // Animación del glow effect
  const glowAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: isHovered ? 0.1 : 0 },
    config: config.gentle
  });

  return (
    <animated.div
      style={cardAnimation}
      className="group relative bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <animated.div
        style={{
          ...glowAnimation,
          background: stat.color || '#3b82f6'
        }}
        className="absolute inset-0 rounded-xl"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <animated.div
            style={iconAnimation}
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl',
              'shadow-lg'
            )}
            style={{
              backgroundColor: stat.color || '#3b82f6'
            }}
          >
            {stat.icon || '📊'}
          </animated.div>
          
          {/* Trend indicator */}
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 text-xs">↗</span>
          </div>
        </div>

        {/* Label */}
        <p className="text-sm font-medium text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
          {stat.label}
        </p>

        {/* Value */}
        <div className="text-2xl lg:text-3xl text-gray-800">
          <AnimatedCounter
            value={stat.value}
            format={stat.format}
            prefix={stat.prefix}
            suffix={stat.suffix}
            trigger={trigger}
            duration={1500 + index * 200}
          />
        </div>

        {/* Sparkline effect */}
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <animated.div
            className="h-full rounded-full"
            style={{
              backgroundColor: stat.color || '#3b82f6',
              width: trigger 
                ? `${Math.min((stat.value / 10000) * 100, 100)}%` 
                : '0%',
              transition: 'width 2s ease-out'
            }}
          />
        </div>
      </div>
    </animated.div>
  );
};

// ============================================================================
// HOOK PARA STATS DINÁMICAS
// ============================================================================

const useDefaultStats = (): StatItem[] => {
  const { 
    soldTickets, 
    availableTickets, 
    viewingCount, 
    soldPercentage 
  } = useRaffleStore();

  const totalRevenue = soldTickets.length * 50;

  return [
    {
      id: 'sold-tickets',
      label: 'Boletos Vendidos',
      value: soldTickets.length,
      suffix: '',
      icon: '🎫',
      color: '#10b981',
      format: 'number'
    },
    {
      id: 'total-revenue',
      label: 'Ingresos Totales',
      value: totalRevenue,
      prefix: '',
      suffix: '',
      icon: '💰',
      color: '#3b82f6',
      format: 'currency'
    },
    {
      id: 'available-tickets',
      label: 'Boletos Disponibles',
      value: availableTickets.length,
      suffix: '',
      icon: '📋',
      color: '#f59e0b',
      format: 'number'
    },
    {
      id: 'viewers',
      label: 'Personas Viendo',
      value: viewingCount,
      suffix: '',
      icon: '👥',
      color: '#8b5cf6',
      format: 'number'
    },
    {
      id: 'sold-percentage',
      label: 'Progreso de Ventas',
      value: soldPercentage,
      suffix: '',
      icon: '📈',
      color: '#ef4444',
      format: 'percentage'
    },
    {
      id: 'conversion-rate',
      label: 'Tasa de Conversión',
      value: (soldTickets.length / TOTAL_TICKETS) * 100,
      suffix: '',
      icon: '🎯',
      color: '#06b6d4',
      format: 'percentage'
    }
  ];
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const AnimatedStats: React.FC<AnimatedStatsProps> = ({
  stats: customStats,
  className = '',
  columns = 3,
  showDefaultStats = true,
  loading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef);
  const defaultStats = useDefaultStats();
  
  // Determinar qué stats usar
  const statsToShow = customStats || (showDefaultStats ? defaultStats : []);

  // Grid classes basado en columnas
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  // Estado para forzar re-render cuando cambian las stats
  const [forceUpdate, setForceUpdate] = useState(0);

  // Detectar cambios en las stats para re-animar
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [JSON.stringify(statsToShow.map(s => s.value))]);

  // Loading state
  if (loading) {
    return (
      <div className={cn('grid gap-6', gridClasses[columns], className)}>
        {Array.from({ length: columns }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('grid gap-6', gridClasses[columns], className)}
    >
      {statsToShow.map((stat, index) => (
        <StatCard
          key={`${stat.id}-${forceUpdate}`}
          stat={stat}
          trigger={isVisible}
          index={index}
        />
      ))}
    </div>
  );
};

// ============================================================================
// COMPONENTE COMPACTO PARA HEROES
// ============================================================================

export const CompactAnimatedStats: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { soldTickets, availableTickets, viewingCount } = useRaffleStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(containerRef);

  const compactStats = [
    {
      id: 'sold',
      label: 'Vendidos',
      value: soldTickets.length,
      icon: '✅',
      color: '#10b981'
    },
    {
      id: 'available',
      label: 'Disponibles', 
      value: availableTickets.length,
      icon: '🎫',
      color: '#3b82f6'
    },
    {
      id: 'viewing',
      label: 'Viendo',
      value: viewingCount,
      icon: '👁️',
      color: '#8b5cf6'
    }
  ];

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-wrap gap-4 justify-center', className)}
    >
      {compactStats.map((stat, index) => (
        <animated.div
          key={stat.id}
          className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200 flex items-center gap-3"
          style={useSpring({
            from: { opacity: 0, transform: 'translateY(20px)' },
            to: { 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0px)' : 'translateY(20px)' 
            },
            config: config.gentle,
            delay: index * 100
          })}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: stat.color }}
          >
            {stat.icon}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600">{stat.label}</p>
            <p className="text-lg font-bold text-gray-800">
              <AnimatedCounter
                value={stat.value}
                trigger={isVisible}
                duration={1000 + index * 200}
              />
            </p>
          </div>
        </animated.div>
      ))}
    </div>
  );
};

// ============================================================================
// HOOK PERSONALIZADO PARA USAR EN OTROS COMPONENTES
// ============================================================================

export const useAnimatedStats = () => {
  const defaultStats = useDefaultStats();
  
  return {
    stats: defaultStats,
    createCustomStat: (stat: Omit<StatItem, 'id'>): StatItem => ({
      id: `custom-${Date.now()}`,
      ...stat
    })
  };
};

// ============================================================================
// EXPORT CON DISPLAY NAMES
// ============================================================================

AnimatedStats.displayName = 'AnimatedStats';
CompactAnimatedStats.displayName = 'CompactAnimatedStats';

export default AnimatedStats;