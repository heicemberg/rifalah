// ============================================================================
// BOTÓN FLOTANTE DE COMPRA - OPTIMIZADO PARA MÓVILES MEXICANOS
// Se muestra solo cuando hay tickets seleccionados
// ============================================================================

'use client';

import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatPrice } from '../lib/utils';

interface FloatingPurchaseButtonProps {
  selectedTickets: number[];
  onOpenPurchaseModal: () => void;
  isVisible: boolean;
}

const FloatingPurchaseButton: React.FC<FloatingPurchaseButtonProps> = ({
  selectedTickets,
  onOpenPurchaseModal,
  isVisible
}) => {
  const ticketCount = selectedTickets.length;
  const totalPrice = ticketCount * 250; // $250 MXN por ticket

  if (!isVisible || ticketCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 animate-slide-up">
      <button
        onClick={onOpenPurchaseModal}
        className={cn(
          'flex items-center gap-4 px-8 py-4',
          'bg-gradient-to-r from-green-600 via-green-500 to-green-600',
          'hover:from-green-500 hover:to-green-700',
          'text-white font-bold text-lg',
          'rounded-2xl shadow-2xl shadow-green-500/50',
          'border-2 border-green-400/50',
          'transition-all duration-300',
          'hover:scale-105 hover:shadow-green-500/70',
          'active:scale-95',
          // Optimización para móviles
          'min-h-[64px] min-w-[200px]',
          'touch-manipulation'
        )}
      >
        <div className="flex items-center gap-2">
          <ShoppingCart size={24} />
          <div className="flex flex-col text-left">
            <div className="text-sm leading-tight">
              {ticketCount} número{ticketCount !== 1 ? 's' : ''}
            </div>
            <div className="text-xl font-black leading-tight">
              {formatPrice(totalPrice)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Comprar</span>
          <ArrowRight size={20} />
        </div>
        
        {/* Efecto de pulso para llamar atención */}
        <div className="absolute inset-0 rounded-2xl bg-white opacity-20 animate-pulse pointer-events-none" />
      </button>
    </div>
  );
};

export default FloatingPurchaseButton;