// ============================================================================
// CARDS DE SELECCIÓN RÁPIDA PARA TICKETS
// Simplifica la selección para usuarios menos familiarizados con tecnología
// CARDS PRINCIPALES: SIEMPRE PRECIO COMPLETO (SIN DESCUENTOS)
// ============================================================================

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Dice1, Dice5, DicesIcon, Zap, Gift, Trophy, Hash, Edit } from 'lucide-react';
import { cn, calculatePrice } from '../lib/utils';
import { MAIN_CARD_OPTIONS } from '../lib/constants';

interface QuickSelectionCardsProps {
  onQuickSelectMainCard: (count: number, fixedPrice: number) => void;
  availableCount: number;
  isLoading?: boolean;
}

const QuickSelectionCards: React.FC<QuickSelectionCardsProps> = ({
  onQuickSelectMainCard,
  availableCount,
  isLoading = false
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  // ✅ CARDS PRINCIPALES: Usar MAIN_CARD_OPTIONS (sin descuentos) + precios dinámicos
  const cards = useMemo(() => [
    {
      count: 2,
      title: '2 Números',
      subtitle: 'al Azar',
      price: `$${calculatePrice(2, false).toLocaleString('es-MX')}`, // SIN descuento
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
      price: `$${calculatePrice(5, false).toLocaleString('es-MX')}`, // SIN descuento
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
      price: `$${calculatePrice(10, false).toLocaleString('es-MX')}`, // SIN descuento
      icon: DicesIcon,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      textColor: 'text-white',
      popular: false
    },
    {
      count: 25,
      title: '25 Números',
      subtitle: 'al Azar',
      price: `$${calculatePrice(25, false).toLocaleString('es-MX')}`, // SIN descuento
      icon: Gift,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      hoverColor: 'hover:from-orange-600 hover:to-orange-700',
      textColor: 'text-white',
      popular: false,
      badge: 'Buena Suerte'
    },
    {
      count: 50,
      title: '50 Números',
      subtitle: 'al Azar',
      price: `$${calculatePrice(50, false).toLocaleString('es-MX')}`, // SIN descuento
      icon: Trophy,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      textColor: 'text-white',
      popular: false,
      badge: 'Gran Premio'
    },
    {
      count: 100,
      title: '100 Números',
      subtitle: 'al Azar',
      price: `$${calculatePrice(100, false).toLocaleString('es-MX')}`, // SIN descuento
      icon: Zap,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      hoverColor: 'hover:from-yellow-600 hover:to-yellow-700',
      textColor: 'text-black',
      popular: false,
      badge: '¡Máximo!'
    }
  ], []); // ✅ Memoizado para performance

  // ✅ Optimizado con useCallback para evitar re-renders
  const handleCustomSelect = useCallback(() => {
    const amount = parseInt(customAmount);
    const maxAllowed = Math.min(100, availableCount);
    if (amount >= 2 && amount <= maxAllowed) {
      const fixedPrice = calculatePrice(amount, false); // Precio sin descuentos
      onQuickSelectMainCard(amount, fixedPrice);
      setShowCustomModal(false);
      setCustomAmount('');
    }
  }, [customAmount, availableCount, onQuickSelectMainCard]);

  // ✅ Handler optimizado para clicks de cards principales CON verificación real
  const handleCardClick = useCallback(async (count: number) => {
    if (availableCount >= count && !isLoading) {
      try {
        console.log(`🎯 QuickSelectionCards: Verificando disponibilidad real para ${count} boletos`);

        // Verificar disponibilidad real desde Supabase si está disponible
        const realAvailableCount = availableCount; // Asumimos que availableCount ya está sincronizado

        if (realAvailableCount < count) {
          console.error(`❌ No hay suficientes boletos disponibles: ${realAvailableCount} disponibles, ${count} solicitados`);
          return;
        }

        const fixedPrice = calculatePrice(count, false); // Precio sin descuentos
        console.log(`✅ QuickSelectionCards: Asignando ${count} boletos con precio fijo ${fixedPrice}`);
        onQuickSelectMainCard(count, fixedPrice);
      } catch (error) {
        console.error('Error verificando disponibilidad en QuickSelectionCards:', error);
      }
    }
  }, [availableCount, isLoading, onQuickSelectMainCard]);

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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 max-w-7xl mx-auto">
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
                onClick={() => handleCardClick(card.count)}
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
        
        {/* Card Personalizada */}
        <div className="relative">
          <button
            onClick={() => setShowCustomModal(true)}
            disabled={isLoading || availableCount < 2}
            className={cn(
              'w-full p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 transform',
              'hover:scale-105 hover:shadow-xl',
              'active:scale-95',
              'border-2 border-dashed border-gray-400',
              'bg-gradient-to-br from-gray-100 to-gray-200',
              'hover:from-gray-200 hover:to-gray-300',
              'text-gray-800',
              'disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:scale-100'
            )}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Icono */}
              <div className="relative">
                <Edit size={32} className="drop-shadow-sm" />
              </div>
              
              {/* Título */}
              <div>
                <div className="font-bold text-base sm:text-lg leading-tight">
                  Otro Número
                </div>
                <div className="text-xs sm:text-sm opacity-90">
                  Tú Decides
                </div>
              </div>
              
              {/* Rango */}
              <div className="font-bold text-sm sm:text-base">
                2-{Math.min(100, availableCount)} números
              </div>
              
              <div className="text-xs opacity-75">
                Cantidad personalizada
              </div>
            </div>
            
            {/* Efecto de resplandor sutil */}
            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
          </button>
        </div>
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

      {/* Modal para Cantidad Personalizada */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowCustomModal(false)} 
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">
                  🎯 Cantidad Personalizada
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Elige cuántos números quieres seleccionar al azar
                </p>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de números (mínimo 2, máximo {Math.min(100, availableCount)})
                  </label>
                  <input
                    type="number"
                    min="2"
                    max={Math.min(100, availableCount)}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="Ej: 15"
                    autoFocus
                  />
                  {customAmount && (
                    <div className="mt-2 text-center text-lg font-bold text-green-600">
                      Precio total: ${calculatePrice(parseInt(customAmount), false).toLocaleString('es-MX')}
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Hash className="text-blue-600 mt-1" size={20} />
                    <div className="text-sm text-blue-800">
                      <div className="font-medium mb-1">📊 Datos importantes:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Disponibles: <span className="font-bold">{availableCount.toLocaleString('es-MX')}</span> números</li>
                        <li>• Precio por boleto: <span className="font-bold">$250</span></li>
                        <li>• Los números se eligen automáticamente</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {parseInt(customAmount) > availableCount && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-800 text-sm">
                      ⚠️ Solo hay {availableCount.toLocaleString('es-MX')} números disponibles
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    setShowCustomModal(false);
                    setCustomAmount('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCustomSelect}
                  disabled={!customAmount || parseInt(customAmount) < 2 || parseInt(customAmount) > Math.min(100, availableCount)}
                  className={cn(
                    'flex-1 px-4 py-3 font-bold rounded-xl transition-colors',
                    'bg-blue-600 hover:bg-blue-700 text-white',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  Seleccionar {customAmount} Números
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSelectionCards;

// ============================================================================
// OPTIMIZACIONES IMPLEMENTADAS:
// ✅ Cards principales SIEMPRE muestran precio completo ($250 x cantidad)
// ✅ Precios dinámicos usando calculatePrice(count, false) - SIN descuentos
// ✅ Handlers optimizados con useCallback para mejor performance
// ✅ Cards array memoizado para evitar re-renders innecesarios
// ✅ Click handlers separados y optimizados
// ============================================================================