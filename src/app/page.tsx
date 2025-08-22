'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTickets, useTicketActions } from '../stores/raffle-store';
import ComprehensivePurchaseModal from '../components/ComprehensivePurchaseModal';
import OrganicNotifications from '../components/OrganicNotifications';
import TicketGrid from '../components/TicketGrid';
import SoundEffects from '../components/SoundEffects';
import PrizeShowcase from '../components/PrizeShowcase';
import SocialProof from '../components/SocialProof';
import UrgencyBanner from '../components/UrgencyBanner';
import { formatPrice } from '../lib/utils';

// Utilidad para clases condicionales
const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// ============================================================================
// HERO SECTION COMPLETAMENTE REDISEÑADO
// ============================================================================

const HeroSection: React.FC<{ onOpenPurchaseModal: () => void }> = ({ onOpenPurchaseModal }) => {
  
  return (
    <div className="relative h-screen overflow-hidden group">
      {/* Imagen de fondo full screen de la camioneta completa */}
      <div className="absolute inset-0">
        <Image
          src="/premios/premio-rifa.png"
          alt="Chevrolet Silverado Z71 2024"
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-1000"
          priority
          quality={100}
        />
        
        {/* Overlay optimizado para mejor legibilidad del texto */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-1000">
          {/* Gradients más suaves para mostrar mejor la imagen */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>
        </div>
      </div>
      
      
      {/* Hero Content - Reorganizado para evitar superposiciones */}
      <div className="relative z-20 h-screen flex items-center justify-center">
        
        {/* Badge flotante superior */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-6 py-2 rounded-full font-black text-xs md:text-sm shadow-2xl animate-pulse border-2 border-white/30 backdrop-blur-sm">
            🔥 ÚLTIMOS BOLETOS DISPONIBLES
          </div>
        </div>
        
        {/* Valor del premio flotante - esquina superior derecha sin sobreposición */}
        <div className="absolute top-20 right-4 md:right-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-3 md:p-4 rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-sm transform rotate-2 hover:rotate-0 transition-transform duration-500 z-30">
          <div className="text-white text-center">
            <div className="text-xs font-bold mb-1">PREMIO TOTAL</div>
            <div className="text-lg md:text-2xl font-black">$45,000</div>
            <div className="text-xs font-bold">USD</div>
          </div>
        </div>
        
        {/* Título principal centrado con más espacio */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pt-16 pb-32">
          <h1 className="text-4xl md:text-6xl xl:text-8xl font-black leading-none mb-6 tracking-tight">
            <div className="mb-3">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl" 
                    style={{textShadow: '0 0 40px rgba(59, 130, 246, 0.5)'}}>
                GANA LA
              </span>
            </div>
            <div className="mb-3">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl" 
                    style={{textShadow: '0 0 40px rgba(251, 191, 36, 0.8)'}}>
                SILVERADO
              </span>
            </div>
            <div>
              <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent drop-shadow-2xl" 
                    style={{textShadow: '0 0 40px rgba(16, 185, 129, 0.5)'}}>
                Z71 2024
              </span>
            </div>
          </h1>
          
          {/* Propuesta de valor más compacta */}
          <div className="bg-gradient-to-r from-black/60 via-purple-900/50 to-black/60 backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-6 border border-white/20 shadow-2xl max-w-3xl">
            <div className="text-lg md:text-2xl text-white space-y-2">
              <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-black">PlayStation 5</span> 
                <span className="text-white/80 text-xl md:text-2xl">+</span>
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-black">$3,000 USD</span>
              </div>
              <div className="bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent font-black text-xl md:text-3xl">
                ¡SOLO $10 USD POR BOLETO!
              </div>
            </div>
          </div>
        </div>
        
        {/* Botones flotantes - parte inferior sin sobreposición */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-3 items-center z-30">
          <button 
            onClick={() => onOpenPurchaseModal(25, false)}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white text-lg md:text-xl font-black px-8 py-3 rounded-xl shadow-2xl transform hover:scale-110 transition-all duration-300 border-2 border-white/30 backdrop-blur-sm animate-pulse hover:animate-none"
          >
            🎫 COMPRAR AHORA
          </button>
          
          <button 
            onClick={() => document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-800 text-white text-base font-bold px-6 py-2 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/30 backdrop-blur-sm"
          >
            🎯 VER NÚMEROS
          </button>
        </div>
        
        {/* Características flotantes - esquina inferior izquierda sin sobreposición */}
        <div className="absolute bottom-6 left-4 md:left-8 bg-gradient-to-r from-black/70 to-purple-900/70 backdrop-blur-xl rounded-xl p-3 border border-white/20 shadow-xl z-30">
          <div className="text-white text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-400">💳</span>
              <span>Pago Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">📺</span>
              <span>Sorteo EN VIVO</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🚚</span>
              <span>Entrega Garantizada</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Elegant particles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-1/4 left-20 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-32 w-1 h-1 bg-yellow-400/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 left-16 w-1 h-1 bg-emerald-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-20 w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
      </div>
      
      {/* Removed scroll indicator */}
    </div>
  );
};

// ============================================================================
// QUICK SELECT SECTION MEJORADA
// ============================================================================

const QuickSelectSection: React.FC<{ onOpenPurchaseModal: (tickets: number) => void }> = ({ onOpenPurchaseModal }) => {
  
  const quickOptions = [
    { tickets: 2, price: 20, discount: 0, popular: false, badge: '' },
    { tickets: 5, price: 45, discount: 10, popular: false, badge: '' },
    { tickets: 10, price: 80, discount: 20, popular: true, badge: '🔥 EL MÁS VENDIDO' },
    { tickets: 25, price: 187, discount: 25, popular: false, badge: '' },
    { tickets: 50, price: 350, discount: 30, popular: false, badge: '⚡ AHORRO EXTREMO' },
    { tickets: 100, price: 650, discount: 35, popular: false, badge: '🏆 PAQUETE VIP' }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm mb-4 shadow-xl">
            ⚡ PAQUETES CON DESCUENTO
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            🎯 <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">COMPRA MÁS</span> Y <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">AHORRA MÁS</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {quickOptions.map((option) => (
            <button
              key={option.tickets}
              onClick={() => onOpenPurchaseModal(option.tickets)}
              className={cn(
                'relative group bg-slate-800/70 backdrop-blur-lg border-2 rounded-xl p-3 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg',
                option.popular 
                  ? 'border-purple-400 ring-2 ring-purple-400/30 bg-gradient-to-br from-purple-600/20 to-pink-600/20' 
                  : 'border-slate-600 hover:border-purple-500'
              )}
            >
              {/* Badge especial */}
              {option.badge && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {option.badge.includes('VIP') ? 'VIP' : option.badge.includes('EXTREMO') ? 'AHORRO' : 'TOP'}
                </div>
              )}
              
              {/* Popular badge */}
              {option.popular && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12 shadow-lg">
                  #1
                </div>
              )}
              
              {/* Número de boletos */}
              <div className="text-2xl md:text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform duration-300">
                {option.tickets}
              </div>
              
              <div className="text-xs font-bold text-slate-300 mb-2">
                {option.tickets === 1 ? 'BOLETO' : 'BOLETOS'}
              </div>
              
              {/* Precio */}
              <div className="space-y-1">
                <div className="text-lg md:text-xl font-black text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text">
                  {formatPrice(option.price)}
                </div>
                
                {option.discount > 0 && (
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full inline-block shadow-lg">
                    -{option.discount}%
                  </div>
                )}
              </div>
              
              {/* Precio por boleto */}
              <div className="mt-2 pt-2 border-t border-slate-600">
                <div className="text-xs text-slate-400">Por boleto:</div>
                <div className="text-sm font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                  {formatPrice(option.price / option.tickets)}
                </div>
              </div>
              
              {/* Botón de compra */}
              <div className="mt-3">
                <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white text-xs font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  COMPRAR
                </div>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-purple-600/0 to-pink-600/0 group-hover:from-blue-600/10 group-hover:via-purple-600/10 group-hover:to-pink-600/10 rounded-2xl transition-all duration-300"></div>
            </button>
          ))}
        </div>
        
        {/* Información de confianza */}
        <div className="mt-16 bg-gradient-to-r from-black/60 via-purple-900/50 to-black/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center text-white">
            <h3 className="text-2xl font-bold mb-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">🔒 COMPRA SEGURA Y CONFIABLE</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">📺</div>
                <div className="text-slate-200">Sorteo transmitido en vivo</div>
              </div>
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">📋</div>
                <div className="text-slate-200">Con notario público</div>
              </div>
              <div>
                <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">🏆</div>
                <div className="text-slate-200">Entrega garantizada 24h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HomePage() {
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedTicketAmount, setSelectedTicketAmount] = useState(25);
  const [hasPromotionalDiscount, setHasPromotionalDiscount] = useState(false);
  const { 
    totalSelected, 
    totalPrice 
  } = useTickets();
  
  const scrollToTickets = () => {
    document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openPurchaseModal = (tickets: number = 25, hasDiscount: boolean = false) => {
    setSelectedTicketAmount(tickets);
    setHasPromotionalDiscount(hasDiscount);
    setIsPurchaseModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Efectos de sonido */}
      <SoundEffects />
      
      {/* Notificaciones orgánicas */}
      <OrganicNotifications />
      
      {/* Prueba social */}
      <SocialProof />
      
      {/* Banner de urgencia */}
      <UrgencyBanner onOpenPurchaseModal={() => openPurchaseModal(25, false)} />
      
      <HeroSection onOpenPurchaseModal={() => openPurchaseModal(25, false)} />
      <QuickSelectSection onOpenPurchaseModal={(tickets) => openPurchaseModal(tickets, true)} />
      <PrizeShowcase />
      
      {/* Sección de selección de tickets mejorada */}
      <div id="tickets-section" className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 py-12 relative overflow-hidden">
        {/* Elementos decorativos minimalistas */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-cyan-500/30 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 shadow-xl border border-purple-500/30">
              🎯 SELECCIONA TUS NÚMEROS
            </div>
            <h2 className="text-3xl lg:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                🎲 Elige Tus Números de la Suerte
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Selecciona manualmente o usa los paquetes de arriba
            </p>
          </div>
          
          {/* Grid completo de tickets */}
          <TicketGrid onOpenPurchaseModal={(tickets) => openPurchaseModal(tickets, false)} />
          
          {/* Resumen de compra - COMPACTO */}
          <div className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 border-2 border-purple-500/50 rounded-2xl p-6 mt-8 text-center shadow-xl backdrop-blur-lg">
            {totalSelected > 0 ? (
              <>
                <h4 className="text-xl font-black bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 bg-clip-text text-transparent mb-3">
                  ✅ BOLETOS SELECCIONADOS
                </h4>
                <p className="text-lg text-slate-200 mb-4">
                  {totalSelected} boleto{totalSelected !== 1 ? 's' : ''} • <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold">{formatPrice(totalPrice)}</span>
                </p>
                <button
                  onClick={() => openPurchaseModal(totalSelected, false)}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white text-xl font-bold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border border-purple-500"
                >
                  💳 PROCEDER AL PAGO
                </button>
              </>
            ) : (
              <>
                <h4 className="text-lg font-bold text-slate-400 mb-2">
                  🎯 Selecciona tus boletos
                </h4>
                <p className="text-slate-500 mb-4">
                  Haz clic en los números o usa los paquetes de arriba
                </p>
                <button
                  onClick={() => openPurchaseModal(25, false)}
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white text-lg font-bold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 border border-purple-500"
                >
                  🎟️ COMPRA RÁPIDA
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Testimoniales - COMPACTOS */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 py-8 relative overflow-hidden">
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm mb-4 shadow-xl">
              👥 TESTIMONIOS VERIFICADOS
            </div>
            <h2 className="text-2xl lg:text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                💬 Lo que dicen nuestros participantes
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                  C
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-white text-sm">Carlos M.</h4>
                  <p className="text-cyan-200 text-xs">Monterrey, N.L.</p>
                </div>
              </div>
              <p className="text-white text-sm mb-3 leading-relaxed">
                "Ya compré mis 10 números, ojalá me toque 🙏 La Silverado está padrísima."
              </p>
              <div className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold">
                ✅ Verificado • Hace 2 horas
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                  A
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-white text-sm">Ana G.</h4>
                  <p className="text-yellow-200 text-xs">CDMX</p>
                </div>
              </div>
              <p className="text-white text-sm mb-3 leading-relaxed">
                "Mi grupo compramos 50 boletos entre todos. Si ganamos la compartimos 😂"
              </p>
              <div className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold">
                ✅ Verificado • Hace 5 horas
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                  R
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-white text-sm">Roberto L.</h4>
                  <p className="text-purple-200 text-xs">Guadalajara, Jal.</p>
                </div>
              </div>
              <p className="text-white text-sm mb-3 leading-relaxed">
                "El año pasado gané una moto. Todo muy transparente y confiable."
              </p>
              <div className="text-xs bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-bold">
                ✅ Verificado • Hace 1 día
              </div>
            </div>
          </div>
          
          {/* Garantías y confianza */}
          <div className="mt-6 bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 rounded-xl p-4 shadow-lg border border-purple-500/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1">📺</div>
                <div className="text-slate-300 text-xs">Sorteo en vivo</div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-1">🔒</div>
                <div className="text-slate-300 text-xs">Pago seguro</div>
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-1">🏆</div>
                <div className="text-slate-300 text-xs">Premio garantizado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Métodos de pago */}
      <div className="bg-gradient-to-br from-slate-100 via-purple-50 to-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-4 py-2 rounded-full font-bold text-sm mb-4 shadow-xl">
              💳 MÉTODOS DE PAGO
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Paga como prefieras
              </span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Binance Pay', icon: '/logos/binance.svg', desc: 'Crypto' },
              { name: 'BanCoppel', icon: '/logos/bancoppel.png', desc: 'Transferencia' },
              { name: 'Banco Azteca', icon: '/logos/bancoazteca.png', desc: 'Transferencia' },
              { name: 'OXXO', icon: '/logos/oxxo.png', desc: 'En tienda' }
            ].map((method) => (
              <div key={method.name} className="bg-white border-2 border-purple-300 rounded-xl p-4 text-center hover:shadow-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group">
                <div className="mb-3 flex items-center justify-center h-8">
                  <Image
                    src={method.icon}
                    alt={method.name}
                    width={32}
                    height={32}
                    className="max-h-8 w-auto group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-bold text-slate-800 mb-1 text-sm">{method.name}</h3>
                <p className="text-xs text-slate-600">{method.desc}</p>
                <div className="mt-2 text-xs bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-medium">✓ Disponible</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Final - COMPACTO Y UNIFICADO */}
      <div className="bg-gradient-to-r from-slate-800 via-purple-900 to-slate-800 text-white py-8 border-t border-purple-700/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl lg:text-3xl font-black mb-3">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              🚨 ¡ÚLTIMAS HORAS PARA PARTICIPAR!
            </span>
          </h2>
          <p className="text-base mb-2 font-bold text-slate-200">
            Miles ya compraron sus boletos. ¡NO TE QUEDES FUERA!
          </p>
          <p className="text-sm mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent font-bold">
              Por solo $10 USD puedes ganar $45,000 USD + Silverado Z71 2024 + PlayStation 5
            </span>
          </p>
          
          <button 
            onClick={() => openPurchaseModal(totalSelected > 0 ? totalSelected : 25, false)}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white text-lg lg:text-xl font-bold px-6 py-3 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300 border border-purple-500"
          >
            {totalSelected > 0 
              ? `🛒 Comprar ${totalSelected} boleto${totalSelected !== 1 ? 's' : ''}`
              : '🎫 Comprar Boletos'
            }
          </button>
          
          {totalSelected > 0 && (
            <p className="text-base mt-3">
              Total: <span className="font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">{formatPrice(totalPrice)}</span>
            </p>
          )}
        </div>
      </div>
      
      {/* Modal de compra comprehensive */}
      <ComprehensivePurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        initialTickets={selectedTicketAmount}
        hasDiscount={hasPromotionalDiscount}
      />
    </div>
  );
}