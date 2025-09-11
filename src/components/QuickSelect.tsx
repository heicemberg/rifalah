// ============================================================================
// COMPONENTE QUICK SELECT PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useCallback, useMemo } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { QUICK_SELECT_OPTIONS, TICKET_PRICE } from '../lib/constants';
import { formatPrice, cn } from '../lib/utils';
import { useRealTimeTickets } from '../hooks/useRealTimeTickets';

// ============================================================================
// TIPOS
// ============================================================================

interface QuickSelectButtonProps {
  tickets: number;
  price: number;
  discount: number;
  popular?: boolean;
  mostSold?: boolean;
  isDisabled: boolean;
  onSelect: () => void;
  context?: 'feed' | 'modal';
}

// ============================================================================
// COMPONENTE DE BOTÓN INDIVIDUAL
// ============================================================================

const QuickSelectButton: React.FC<QuickSelectButtonProps> = React.memo(({
  tickets,
  price,
  discount,
  popular = false,
  mostSold = false,
  isDisabled,
  onSelect,
  context = 'modal'
}) => {
  // Hook para formateo mexicano (dentro del componente)
  const { formatPriceMXN, PRECIO_POR_BOLETO_MXN } = useRealTimeTickets();
  
  // Calcular precio según contexto
  const originalPrice = tickets * PRECIO_POR_BOLETO_MXN;
  const displayPrice = context === 'feed' ? originalPrice : price;
  const displayDiscount = context === 'feed' ? 0 : discount;
  const savings = originalPrice - displayPrice;
  
  return (
    <div className="relative group/card">
      {/* Background effect - optimized without heavy blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl border border-white/30 shadow-xl opacity-0 group-hover/card:opacity-100 transition-all duration-200 transform scale-98 group-hover/card:scale-100" />
      
      <button
        onClick={onSelect}
        disabled={isDisabled}
        className={cn(
          'relative w-full p-6 rounded-3xl border-2 transition-all duration-200 ease-out',
          'group overflow-hidden shadow-md hover:shadow-xl',
          'transform-gpu will-change-transform',
          {
            // Estado habilitado - Optimized without heavy blur
            'border-slate-200/60 bg-gradient-to-br from-white/90 via-white/80 to-slate-50/90': !isDisabled && !popular && !mostSold,
            'hover:border-blue-400/70 hover:shadow-blue-500/20 hover:shadow-xl hover:scale-105 hover:from-blue-50/95 hover:via-blue-50/85 hover:to-blue-100/95 hover:-translate-y-0.5': !isDisabled && !popular && !mostSold,
            
            // Estado popular - Optimized
            'border-purple-300/70 bg-gradient-to-br from-purple-50/95 via-pink-50/85 to-purple-100/90': !isDisabled && popular && !mostSold,
            'hover:border-purple-400/80 hover:shadow-purple-500/25 hover:shadow-xl hover:scale-105 hover:from-purple-100/95 hover:via-pink-100/85 hover:to-purple-200/95 hover:-translate-y-0.5': !isDisabled && popular && !mostSold,
            'ring-2 ring-purple-200/60 shadow-purple-200/40': popular && !mostSold,
            
            // Estado más vendido - Optimized animation
            'border-orange-300/70 bg-gradient-to-br from-orange-50/95 via-red-50/85 to-orange-100/90': !isDisabled && mostSold,
            'hover:border-orange-400/80 hover:shadow-orange-500/25 hover:shadow-xl hover:scale-105 hover:from-orange-100/95 hover:via-red-100/85 hover:to-orange-200/95 hover:-translate-y-0.5': !isDisabled && mostSold,
            'ring-2 ring-orange-200/60 shadow-orange-200/40': mostSold,
            
            // Estado deshabilitado
            'border-gray-200/30 bg-gradient-to-br from-gray-100/50 to-gray-200/50 cursor-not-allowed opacity-60': isDisabled
          }
        )}
      >
        {/* Badge Popular - Mejorado */}
        {popular && !mostSold && (
          <div className="absolute -top-3 -right-3 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-sm opacity-60 animate-pulse" />
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-xl transform rotate-12 border-2 border-white/90 backdrop-blur-sm">
                ⭐ POPULAR
              </div>
            </div>
          </div>
        )}
        
        {/* Badge MÁS VENDIDO - Ultra mejorado */}
        {mostSold && (
          <div className="absolute -top-3 -left-3 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-md opacity-70 animate-pulse" />
              <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-2xl transform -rotate-12 border-2 border-white/90 backdrop-blur-sm animate-bounce">
                🔥 EL MÁS VENDIDO
              </div>
            </div>
          </div>
        )}
        
        {/* Optimized hover effects - removed heavy blur */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          {/* Simple shine effect */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-200',
            'group-hover:opacity-10',
            {
              'from-blue-400 to-transparent': !popular && !mostSold,
              'from-purple-400 to-transparent': popular && !mostSold,
              'from-orange-400 to-transparent': mostSold
            }
          )} />
        </div>
        
        {/* Contenido */}
        <div className="relative z-10 text-center space-y-3">
          {/* Cantidad de tickets - Mejorada con icono */}
          <div className="space-y-1">
            <div className={cn(
              'text-4xl font-black mb-1 tracking-tight',
              {
                'text-slate-800 bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent': !isDisabled && !popular && !mostSold,
                'text-purple-800 bg-gradient-to-br from-purple-800 to-pink-600 bg-clip-text text-transparent': !isDisabled && popular && !mostSold,
                'text-orange-800 bg-gradient-to-br from-orange-800 to-red-600 bg-clip-text text-transparent': !isDisabled && mostSold,
                'text-gray-500': isDisabled
              }
            )}>
              {tickets}
            </div>
            
            <div className={cn(
              'text-sm font-bold uppercase tracking-wider',
              {
                'text-slate-600': !isDisabled && !popular && !mostSold,
                'text-purple-600': !isDisabled && popular && !mostSold,
                'text-orange-600': !isDisabled && mostSold,
                'text-gray-400': isDisabled
              }
            )}>
              🎫 {tickets === 1 ? 'Boleto' : 'Boletos'}
            </div>
          </div>
          
          {/* Precio - Mejorado con badge */}
          <div className="relative">
            <div className={cn(
              'inline-block px-4 py-2 rounded-2xl font-black text-xl shadow-md',
              {
                'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-2 border-emerald-200/60': !isDisabled && !popular && !mostSold,
                'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-2 border-purple-200/60': !isDisabled && popular && !mostSold,
                'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-2 border-orange-200/60': !isDisabled && mostSold,
                'bg-gray-100 text-gray-400 border-2 border-gray-200': isDisabled
              }
            )}>
              {formatPriceMXN(displayPrice)}
            </div>
          </div>
          
          {/* Descuento y ahorro - Ultra mejorados - Solo en modal */}
          {displayDiscount > 0 && (
            <div className="space-y-2 pt-2">
              {/* Precio original tachado con mejor estilo */}
              <div className={cn(
                'text-sm line-through font-medium px-3 py-1 rounded-lg',
                {
                  'text-slate-500 bg-slate-100/60': !isDisabled,
                  'text-gray-400 bg-gray-100/60': isDisabled
                }
              )}>
                Antes: {formatPriceMXN(originalPrice)}
              </div>
              
              {/* Badge de descuento mejorado */}
              <div className="relative inline-block">
                <div className={cn(
                  'text-sm font-black px-4 py-2 rounded-xl shadow-lg border-2 transform transition-transform duration-300',
                  'group-hover:scale-110',
                  {
                    'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300 shadow-red-200/50': !isDisabled,
                    'bg-gray-200 text-gray-400 border-gray-300': isDisabled
                  }
                )}>
                  💥 {displayDiscount}% OFF
                </div>
              </div>
              
              {/* Ahorro destacado */}
              <div className={cn(
                'text-sm font-bold px-3 py-1 rounded-lg',
                {
                  'text-emerald-700 bg-emerald-100/80 border border-emerald-200': !isDisabled,
                  'text-gray-400 bg-gray-100/80': isDisabled
                }
              )}>
                ✨ Ahorras {formatPriceMXN(savings)}
              </div>
            </div>
          )}
          
          {/* Incentivo adicional para mostSold */}
          {mostSold && !isDisabled && (
            <div className="pt-2">
              <div className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-200 animate-pulse">
                🎯 67% de clientes prefieren esta opción
              </div>
            </div>
          )}
          
          {/* Incentivo adicional para popular */}
          {popular && !mostSold && !isDisabled && (
            <div className="pt-2">
              <div className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                🌟 Opción recomendada por descuento
              </div>
            </div>
          )}
        </div>
        
        {/* Indicador de no disponible */}
        {isDisabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-xl">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600 mb-1">
                No disponible
              </div>
              <div className="text-xs text-gray-600">
                Tickets insuficientes
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
});

QuickSelectButton.displayName = 'QuickSelectButton';

// ============================================================================
// COMPONENTE PRINCIPAL - OPTIMIZADO CON MEMO
// ============================================================================

interface QuickSelectProps {
  context?: 'feed' | 'modal';
}

export const QuickSelect: React.FC<QuickSelectProps> = React.memo(({ context = 'modal' }) => {
  // ✅ PERFORMANCE: Optimized store selectors with useMemo
  const storeState = useRaffleStore(
    useCallback((state) => ({
      availableTickets: state.availableTickets,
      quickSelect: state.quickSelect,
      selectedTickets: state.selectedTickets,
      clearSelection: state.clearSelection
    }), [])
  );
  
  const {
    availableTickets,
    quickSelect,
    selectedTickets,
    clearSelection
  } = storeState;
  
  // Hook para formateo mexicano
  const { formatMexicanNumber, formatPriceMXN, calculatePrice, PRECIO_POR_BOLETO_MXN } = useRealTimeTickets();
  
  // Handler para selección rápida OPTIMIZADO - Sin delay artificial
  const handleQuickSelect = useCallback((tickets: number) => {
    // Limpiar selección actual antes de hacer nueva selección
    if (selectedTickets.length > 0) {
      clearSelection();
    }
    
    // ✅ PERFORMANCE: Eliminar delay artificial - ejecución instantánea
    quickSelect(tickets);
  }, [quickSelect, selectedTickets.length, clearSelection]);
  
  return (
    <div className="w-full">
      {/* Título */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Selección Rápida
        </h3>
        <p className="text-gray-600 text-base leading-relaxed">
          Elige una opción y seleccionaremos tus boletos automáticamente
        </p>
      </div>
      
      {/* Información de disponibilidad */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/60 rounded-2xl border border-blue-200/50 backdrop-blur-sm">
        <div className="flex items-center justify-between text-base">
          <span className="text-blue-700 font-semibold">
            📊 Boletos disponibles:
          </span>
          <span className="text-blue-800 font-black text-lg">
            {formatMexicanNumber(availableTickets.length)}
          </span>
        </div>
      </div>
      
      {/* ✅ PERFORMANCE: Memoized options grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {useMemo(() => 
          QUICK_SELECT_OPTIONS.map((option) => {
            const isDisabled = availableTickets.length < option.tickets;
            const isMostSold = option.tickets === 10; // El paquete de 10 boletos es el más vendido
            
            return (
              <QuickSelectButton
                key={option.tickets}
                tickets={option.tickets}
                price={option.price}
                discount={option.discount}
                popular={option.popular}
                mostSold={isMostSold}
                isDisabled={isDisabled}
                onSelect={() => handleQuickSelect(option.tickets)}
                context={context}
              />
            );
          }), [availableTickets.length, handleQuickSelect, context])
        }
      </div>
      
      {/* Mensaje de ayuda con estadísticas */}
      <div className="mt-6 space-y-4">
        {/* Mensaje de popularidad del paquete de 10 */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="text-orange-500 text-xl">🔥</div>
            <div className="text-sm text-orange-800">
              <div className="font-bold mb-1">¡El paquete de 10 boletos es el favorito!</div>
              <div className="text-xs">67% de compradores eligen este paquete por su excelente descuento</div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="text-yellow-500 text-xl">💡</div>
            <div className="text-sm text-gray-700">
              <div className="font-medium mb-1">Consejos para ahorrar:</div>
              <ul className="space-y-1 text-xs">
                <li>• Compra más boletos para obtener mejores descuentos</li>
                <li>• El paquete de 10 boletos tiene 20% de descuento</li>
                <li>• Puedes cambiar tu selección las veces que quieras</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comparación de precios */}
      <div className="mt-4 hidden lg:block">
        <div className="text-center text-xs text-gray-500">
          <div className="mb-2">Comparación de precios por boleto:</div>
          <div className="flex justify-center gap-4">
            {QUICK_SELECT_OPTIONS.map((option) => {
              const pricePerTicket = option.price / option.tickets;
              return (
                <div key={option.tickets} className="text-center">
                  <div className="font-medium">{option.tickets} boletos</div>
                  <div className={cn(
                    'text-xs',
                    {
                      'text-purple-600 font-bold': option.popular && option.tickets !== 10,
                      'text-orange-600 font-bold': option.tickets === 10,
                      'text-gray-600': !option.popular && option.tickets !== 10
                    }
                  )}>
                    {formatPriceMXN(pricePerTicket)}/boleto
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Estado cuando no hay tickets disponibles */}
      {availableTickets.length === 0 && (
        <div className="mt-6 p-6 bg-red-50 rounded-lg border border-red-200 text-center">
          <div className="text-red-600 text-lg font-bold mb-2">
            🎉 ¡Todos los boletos están vendidos!
          </div>
          <div className="text-red-700 text-sm">
            Gracias por tu interés. Mantente atento para futuras rifas.
          </div>
        </div>
      )}
      
      {/* Indicador de tickets seleccionados actualmente */}
      {selectedTickets.length > 0 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-purple-700">
              ✅ Tienes {selectedTickets.length} boleto{selectedTickets.length !== 1 ? 's' : ''} seleccionado{selectedTickets.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearSelection}
              className="text-purple-600 hover:text-purple-800 font-medium text-xs underline"
            >
              Limpiar selección
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

QuickSelect.displayName = 'QuickSelect';

export default QuickSelect;