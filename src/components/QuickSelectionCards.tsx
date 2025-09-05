// ============================================================================
// CARDS DE SELECCIÓN RÁPIDA PARA TICKETS
// Simplifica la selección para usuarios menos familiarizados con tecnología
// ============================================================================

'use client';

import React from 'react';
import { Dice1, Dice5, DicesIcon, Zap, Gift, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';

interface QuickSelectionCardsProps {
  onQuickSelect: (count: number) => void;
  availableCount: number;
  isLoading?: boolean;
}

const QuickSelectionCards: React.FC<QuickSelectionCardsProps> = ({
  onQuickSelect,
  availableCount,
  isLoading = false
}) => {
  const cards = [
    {
      count: 1,
      title: '1 Número',
      subtitle: 'al Azar',
      price: '$250',
      icon: Dice1,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      textColor: 'text-white',
      popular: false
    },
    {
      count: 5,
      title: '5 Números',
      subtitle: 'al Azar',
      price: '$1,250',
      icon: Dice5,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
      textColor: 'text-white',
      popular: true,
      badge: 'Más Popular'
    },
    {
      count: 10,
      title: '10 Números',
      subtitle: 'al Azar',
      price: '$2,500',
      icon: DicesIcon,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white',
      popular: false
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎯 Selección Rápida
        </h3>
        <p className="text-gray-600 text-sm">
          ¡Deja que la suerte elija por ti! Números seleccionados automáticamente
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          const canSelect = availableCount >= card.count;
          
          return (
            <div
              key={card.count}
              className="relative"
            >
              {/* Badge "Más Popular" */}
              {card.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    ⭐ {card.badge}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => canSelect && !isLoading && onQuickSelect(card.count)}
                disabled={!canSelect || isLoading}
                className={cn(
                  'w-full p-6 rounded-2xl shadow-lg transition-all duration-300 transform',
                  'hover:scale-105 hover:shadow-xl',
                  'active:scale-95',
                  'border-2 border-transparent',
                  card.color,
                  card.hoverColor,
                  card.textColor,
                  !canSelect && 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg',
                  isLoading && 'opacity-70 cursor-wait'
                )}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Icono */}
                  <div className="relative">
                    <Icon size={32} className="drop-shadow-sm" />
                    {card.popular && (
                      <div className="absolute -top-1 -right-1">
                        <Trophy size={16} className="text-yellow-300" />
                      </div>
                    )}
                  </div>
                  
                  {/* Título */}
                  <div>
                    <div className="font-bold text-lg leading-tight">
                      {card.title}
                    </div>
                    <div className="text-sm opacity-90">
                      {card.subtitle}
                    </div>
                  </div>
                  
                  {/* Precio */}
                  <div className="font-extrabold text-xl">
                    {card.price}
                  </div>
                  
                  {/* Estado de disponibilidad */}
                  {!canSelect && (
                    <div className="text-xs opacity-75 mt-1">
                      Solo {availableCount} números disponibles
                    </div>
                  )}
                </div>
                
                {/* Efecto de resplandor sutil */}
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="text-center mt-4">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
          <Zap size={16} className="text-yellow-500" />
          <span>Los números se seleccionan automáticamente de los disponibles</span>
        </div>
      </div>
      
      {/* Separador visual */}
      <div className="flex items-center my-8">
        <div className="flex-1 border-t border-gray-200"></div>
        <div className="px-4 text-sm text-gray-500 font-medium">
          O selecciona manualmente abajo
        </div>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>
    </div>
  );
};

export default QuickSelectionCards;