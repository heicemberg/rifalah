// ============================================================================
// COMPONENTE QUICK SELECT PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useCallback } from 'react';

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
  onSelect
}) => {
  // Hook para formateo mexicano (dentro del componente)
  const { formatPriceMXN, PRECIO_POR_BOLETO_MXN } = useRealTimeTickets();
  
  // Calcular precio original y ahorro
  const originalPrice = tickets * PRECIO_POR_BOLETO_MXN;
  const savings = originalPrice - price;
  
  return (
    <div className="relative">
      <button
        onClick={onSelect}
        disabled={isDisabled}
        className={cn(
          'relative w-full p-5 rounded-2xl border-2 transition-all duration-500',
          'group overflow-hidden backdrop-blur-sm shadow-sm hover:shadow-xl',
          {
            // Estado habilitado
            'border-gray-200/60 bg-gradient-to-br from-white/90 to-gray-50/90': !isDisabled && !popular,
            'hover:border-blue-400/70 hover:shadow-2xl hover:scale-105 hover:from-blue-50/90 hover:to-blue-100/90 hover:shadow-blue-200/50': !isDisabled && !popular,
            
            // Estado popular
            'border-purple-300/70 bg-gradient-to-br from-purple-50/90 to-pink-50/90': !isDisabled && popular && !mostSold,
            'hover:border-purple-400/80 hover:shadow-2xl hover:scale-105 hover:from-purple-100/90 hover:to-pink-100/90 hover:shadow-purple-300/50': !isDisabled && popular && !mostSold,
            'ring-2 ring-purple-200/50': popular && !mostSold,
            
            // Estado más vendido
            'border-orange-300/70 bg-gradient-to-br from-orange-50/90 to-red-50/90': !isDisabled && mostSold,
            'hover:border-orange-400/80 hover:shadow-2xl hover:scale-105 hover:from-orange-100/90 hover:to-red-100/90 hover:shadow-orange-300/50': !isDisabled && mostSold,
            'ring-2 ring-orange-200/50': mostSold,
            
            // Estado deshabilitado
            'border-gray-200/40 bg-gradient-to-br from-gray-100/60 to-gray-200/60 cursor-not-allowed opacity-50': isDisabled
          }
        )}
      >
        {/* Badge Popular */}
        {popular && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl transform rotate-12 border-2 border-white backdrop-blur-sm">
              POPULAR
            </div>
          </div>
        )}
        
        {/* Badge MÁS VENDIDO */}
        {mostSold && (
          <div className="absolute -top-2 -left-2 z-10">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl transform -rotate-12 animate-pulse border-2 border-white backdrop-blur-sm">
              🔥 EL MÁS VENDIDO
            </div>
          </div>
        )}
        
        {/* Efecto de gradiente en hover */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-300',
          'group-hover:opacity-10',
          {
            'from-blue-500 to-purple-500': !popular && !mostSold,
            'from-purple-500 to-pink-500': popular && !mostSold,
            'from-orange-500 to-red-500': mostSold
          }
        )} />
        
        {/* Contenido */}
        <div className="relative z-10 text-center">
          {/* Cantidad de tickets */}
          <div className={cn(
            'text-2xl font-bold mb-2',
            {
              'text-gray-800': !isDisabled,
              'text-gray-500': isDisabled
            }
          )}>
            {tickets}
          </div>
          
          <div className={cn(
            'text-sm font-medium mb-3',
            {
              'text-gray-600': !isDisabled,
              'text-gray-400': isDisabled
            }
          )}>
            {tickets === 1 ? 'Boleto' : 'Boletos'}
          </div>
          
          {/* Precio */}
          <div className={cn(
            'text-xl font-bold mb-1',
            {
              'text-green-600': !isDisabled,
              'text-gray-400': isDisabled
            }
          )}>
            {formatPriceMXN(price)}
          </div>
          
          {/* Descuento y ahorro */}
          {discount > 0 && (
            <div className="space-y-1">
              {/* Precio original tachado */}
              <div className={cn(
                'text-sm line-through',
                {
                  'text-gray-500': !isDisabled,
                  'text-gray-400': isDisabled
                }
              )}>
                {formatPriceMXN(originalPrice)}
              </div>
              
              {/* Porcentaje de descuento */}
              <div className={cn(
                'text-sm font-bold px-2 py-1 rounded-full',
                {
                  'bg-red-100 text-red-700': !isDisabled,
                  'bg-gray-100 text-gray-400': isDisabled
                }
              )}>
                {discount}% OFF
              </div>
              
              {/* Ahorro */}
              <div className={cn(
                'text-xs',
                {
                  'text-green-600': !isDisabled,
                  'text-gray-400': isDisabled
                }
              )}>
                Ahorras {formatPriceMXN(savings)}
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
// COMPONENTE PRINCIPAL
// ============================================================================

export const QuickSelect: React.FC = () => {
  // Estado del store
  const {
    availableTickets,
    quickSelect,
    selectedTickets,
    clearSelection
  } = useRaffleStore();
  
  // Hook para formateo mexicano
  const { formatMexicanNumber, formatPriceMXN, calculatePrice, PRECIO_POR_BOLETO_MXN } = useRealTimeTickets();
  
  // Handler para selección rápida
  const handleQuickSelect = useCallback((tickets: number) => {
    // Limpiar selección actual antes de hacer nueva selección
    if (selectedTickets.length > 0) {
      clearSelection();
    }
    
    // Pequeño delay para mejor UX
    setTimeout(() => {
      quickSelect(tickets);
    }, 100);
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
      
      {/* Grid de opciones */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {QUICK_SELECT_OPTIONS.map((option) => {
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
            />
          );
        })}
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
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

QuickSelect.displayName = 'QuickSelect';

export default QuickSelect;