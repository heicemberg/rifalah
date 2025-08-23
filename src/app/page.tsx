'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTickets } from '../stores/raffle-store';
import { useRealTimeTickets, useTicketStats } from '../hooks/useRealTimeTickets';
import ComprehensivePurchaseModal from '../components/ComprehensivePurchaseModal';
import OrganicNotifications from '../components/OrganicNotifications';
import TicketGrid from '../components/TicketGrid';
import SoundEffects from '../components/SoundEffects';

// ============================================================================
// PÁGINA PRINCIPAL UNIFICADA - RIFA SILVERADO Z71 2024 🇲🇽
// ============================================================================

export default function RifaSilveradoPage() {
  const { selectedTickets } = useTickets();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedTicketAmount, setSelectedTicketAmount] = useState(1);
  const [hasPromotionalDiscount, setHasPromotionalDiscount] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Hook centralizado para tickets en tiempo real
  const { 
    stats, 
    formatMexicanNumber, 
    formatPriceMXN,
    calculatePrice,
    PRECIO_POR_BOLETO_MXN,
    PREMIO_TOTAL_MXN 
  } = useRealTimeTickets();

  const {
    urgencyMessage,
    urgencyColor
  } = useTicketStats();

  // Contador regresivo hasta 24 Nov 2025
  useEffect(() => {
    const SORTEO_DATE = new Date('2025-11-24T20:00:00-06:00').getTime();
    
    const updateCountdown = () => {
      const now = Date.now();
      const difference = SORTEO_DATE - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const openPurchaseModal = (tickets = 1, hasDiscount = false) => {
    setSelectedTicketAmount(tickets);
    setHasPromotionalDiscount(hasDiscount);
    setIsPurchaseModalOpen(true);
  };

  const totalSelected = selectedTickets.length;
  const totalPrice = calculatePrice(totalSelected);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50">
      {/* Sounds Effects */}
      <SoundEffects />
      
      {/* Organic Notifications */}
      <OrganicNotifications />

      {/* Barra de Urgencia con datos REALES */}
      <div className={`bg-gradient-to-r ${urgencyColor} text-white py-2 px-4 text-center animate-pulse`}>
        <div className="flex items-center justify-center gap-2 text-sm font-bold">
          <span>🔥</span>
          <span className="uppercase tracking-wide">{urgencyMessage}</span>
          <span>🔥</span>
        </div>
      </div>

      {/* HERO SECTION PROFESIONAL - ESTRUCTURA SEPARADA */}
      
      {/* FULLSCREEN IMAGE SECTION */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Main Silverado Image - Full Screen */}
        <div className="absolute inset-0">
          <Image
            src="/premios/premio-rifa.png"
            alt="Chevrolet Silverado Z71 2024 - Premio Principal"
            fill
            className="object-cover object-center scale-110 hover:scale-100 transition-transform duration-1000"
            priority
            quality={100}
          />
          {/* Professional Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        </div>

        {/* Text Content Over Image */}
        <div className="relative z-20 h-full flex flex-col justify-center items-center px-4">
          
          {/* Mexican Badge */}
          <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
            <div className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-green-500 via-white to-red-500 px-8 py-4 text-sm font-black text-gray-900 shadow-2xl hover:shadow-white/30 transition-all duration-500 hover:scale-105">
              <span className="text-2xl animate-bounce">🇲🇽</span>
              <span className="tracking-wide">RIFA 100% MEXICANA</span>
              <span className="text-2xl animate-bounce delay-200">🇲🇽</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none text-white">
              <div className="mb-4 hover:scale-105 transition-transform duration-500">
                <span className="block bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent drop-shadow-2xl">
                  ¡GÁNATE LA
                </span>
              </div>
              <div className="mb-4 hover:scale-105 transition-transform duration-500 delay-75">
                <span className="block text-white drop-shadow-2xl">
                  SILVERADO
                </span>
              </div>
              <div className="hover:scale-105 transition-transform duration-500 delay-150">
                <span className="block bg-gradient-to-r from-yellow-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
                  Z71 2024!
                </span>
              </div>
            </h1>
          </div>

          {/* Prize Value Highlight */}
          <div className="text-center animate-in fade-in slide-in-from-bottom duration-1000 delay-400">
            <div className="inline-block bg-black/60 backdrop-blur-xl rounded-3xl px-12 py-8 border border-white/20">
              <div className="text-sm font-bold text-green-400 mb-2 uppercase tracking-wide">Premio Total</div>
              <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 bg-clip-text text-transparent mb-2">
                {formatPriceMXN(PREMIO_TOTAL_MXN)}
              </div>
              <div className="text-white/80 text-lg">Silverado + PS5 + Efectivo</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse" />
            </div>
            <div className="text-white/60 text-xs mt-2 text-center">Desliza</div>
          </div>
        </div>
      </section>

      {/* INFORMATION SECTION */}
      <section className="bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Enhanced Countdown Timer */}
          <div className="mb-20 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-6 drop-shadow-2xl">
                ⏰ TIEMPO RESTANTE
              </h2>
              <p className="text-xl md:text-2xl text-white/80 font-semibold">Para el sorteo oficial con notario público</p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12">
                <div className="group text-center">
                  <div className="relative rounded-3xl bg-gradient-to-br from-yellow-900/40 via-orange-800/30 to-red-900/40 backdrop-blur-xl border border-yellow-500/30 p-6 md:p-8 mb-4 hover:border-yellow-400/70 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/30">
                    <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{timeLeft.days.toString().padStart(2, '0')}</div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400/20 via-orange-400/10 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white/70 group-hover:text-yellow-400 transition-colors duration-300 uppercase tracking-wider">DÍAS</div>
                </div>
                <div className="group text-center">
                  <div className="relative rounded-3xl bg-gradient-to-br from-yellow-900/40 via-orange-800/30 to-red-900/40 backdrop-blur-xl border border-yellow-500/30 p-6 md:p-8 mb-4 hover:border-yellow-400/70 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/30">
                    <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{timeLeft.hours.toString().padStart(2, '0')}</div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400/20 via-orange-400/10 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white/70 group-hover:text-yellow-400 transition-colors duration-300 uppercase tracking-wider">HORAS</div>
                </div>
                <div className="group text-center">
                  <div className="relative rounded-3xl bg-gradient-to-br from-yellow-900/40 via-orange-800/30 to-red-900/40 backdrop-blur-xl border border-yellow-500/30 p-6 md:p-8 mb-4 hover:border-yellow-400/70 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/30">
                    <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400/20 via-orange-400/10 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white/70 group-hover:text-yellow-400 transition-colors duration-300 uppercase tracking-wider">MINUTOS</div>
                </div>
                <div className="group text-center">
                  <div className="relative rounded-3xl bg-gradient-to-br from-yellow-900/40 via-orange-800/30 to-red-900/40 backdrop-blur-xl border border-yellow-500/30 p-6 md:p-8 mb-4 hover:border-yellow-400/70 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/30">
                    <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 animate-pulse">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400/20 via-orange-400/10 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
                  </div>
                  <div className="text-lg md:text-xl font-bold text-white/70 group-hover:text-yellow-400 transition-colors duration-300 uppercase tracking-wider">SEGUNDOS</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="group relative inline-flex items-center gap-4 bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-red-500/20 backdrop-blur-xl rounded-3xl px-8 md:px-12 py-6 border border-yellow-400/30 hover:border-yellow-400/70 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30">
                  <span className="text-3xl md:text-4xl group-hover:animate-bounce">📅</span>
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-black text-yellow-300 group-hover:text-yellow-200 transition-colors duration-300">24 de Noviembre 2025</div>
                    <div className="text-sm md:text-base text-white/70 font-semibold">8:00 PM (Hora de México)</div>
                  </div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-400/10 via-orange-400/5 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Main CTA Button */}
          <div className="flex justify-center mb-20 animate-in fade-in slide-in-from-bottom duration-1000 delay-400">
            <button 
              onClick={() => openPurchaseModal(1, false)}
              className="group relative overflow-hidden px-8 md:px-16 py-6 md:py-8 bg-gradient-to-br from-green-500/90 via-green-600/90 to-emerald-600/90 hover:from-green-500 hover:via-green-600 hover:to-emerald-600 text-white font-black text-lg md:text-xl rounded-3xl shadow-2xl hover:shadow-green-500/50 backdrop-blur-xl border border-white/20 hover:border-green-400/50 transition-all duration-700 hover:scale-105 hover:shadow-2xl max-w-sm md:max-w-md w-full mx-4"
            >
              <div className="relative z-10 flex flex-col items-center justify-center gap-3">
                <span className="text-4xl group-hover:animate-bounce transition-transform duration-300">🎫</span>
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-black mb-1">COMPRAR BOLETOS</div>
                  <div className="text-sm md:text-base text-white/80 font-semibold">{formatPriceMXN(PRECIO_POR_BOLETO_MXN)} por boleto</div>
                  <div className="text-xs md:text-sm text-green-200 mt-1">¡Empieza con solo 1 boleto!</div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-400/20 via-transparent to-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </button>
          </div>
        </div>
      </section>

      {/* PACKAGES SECTION - 6 CARDS DE DESCUENTOS */}
      <section className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-white mb-6">
              🎁 Paquetes con Descuento
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Compra más boletos y ahorra más. Cada paquete incluye descuentos automáticos y mejores probabilidades de ganar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Paquete 1 - Básico */}
            <div className="group relative rounded-3xl bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-xl border border-blue-500/30 p-8 hover:border-blue-400/50 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="text-center relative z-10">
                <div className="text-4xl mb-4">🎟️</div>
                <h3 className="text-2xl font-black text-white mb-2">Básico</h3>
                <div className="text-4xl font-black text-blue-400 mb-2">5 Boletos</div>
                <div className="text-lg text-gray-300 mb-4">
                  <span className="line-through opacity-60">{formatPriceMXN(5 * PRECIO_POR_BOLETO_MXN)}</span>
                </div>
                <div className="text-3xl font-black text-white mb-4">{formatPriceMXN(calculatePrice(5))}</div>
                <div className="bg-blue-500/20 rounded-full px-4 py-2 text-blue-300 text-sm font-bold mb-6">
                  Ahorra {formatPriceMXN((5 * PRECIO_POR_BOLETO_MXN) - calculatePrice(5))}
                </div>
                <button 
                  onClick={() => openPurchaseModal(5, true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  Seleccionar Paquete
                </button>
              </div>
            </div>

            {/* Paquete 2 - Popular */}
            <div className="group relative rounded-3xl bg-gradient-to-br from-green-900/40 via-green-800/30 to-green-900/40 backdrop-blur-xl border-2 border-green-400/50 p-8 hover:border-green-300/70 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-black px-6 py-2 rounded-full shadow-lg">
                  ⭐ MÁS POPULAR
                </div>
              </div>
              <div className="text-center relative z-10">
                <div className="text-4xl mb-4">🔥</div>
                <h3 className="text-2xl font-black text-white mb-2">Popular</h3>
                <div className="text-4xl font-black text-green-400 mb-2">10 Boletos</div>
                <div className="text-lg text-gray-300 mb-4">
                  <span className="line-through opacity-60">{formatPriceMXN(10 * PRECIO_POR_BOLETO_MXN)}</span>
                </div>
                <div className="text-3xl font-black text-white mb-4">{formatPriceMXN(calculatePrice(10))}</div>
                <div className="bg-green-500/20 rounded-full px-4 py-2 text-green-300 text-sm font-bold mb-6">
                  Ahorra {formatPriceMXN((10 * PRECIO_POR_BOLETO_MXN) - calculatePrice(10))}
                </div>
                <button 
                  onClick={() => openPurchaseModal(10, true)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Seleccionar Paquete
                </button>
              </div>
            </div>

            {/* Paquete 3 - Premium */}
            <div className="group relative rounded-3xl bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 backdrop-blur-xl border border-purple-500/30 p-8 hover:border-purple-400/50 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="text-center relative z-10">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-2xl font-black text-white mb-2">Premium</h3>
                <div className="text-4xl font-black text-purple-400 mb-2">15 Boletos</div>
                <div className="text-lg text-gray-300 mb-4">
                  <span className="line-through opacity-60">{formatPriceMXN(15 * PRECIO_POR_BOLETO_MXN)}</span>
                </div>
                <div className="text-3xl font-black text-white mb-4">{formatPriceMXN(calculatePrice(15))}</div>
                <div className="bg-purple-500/20 rounded-full px-4 py-2 text-purple-300 text-sm font-bold mb-6">
                  Ahorra {formatPriceMXN((15 * PRECIO_POR_BOLETO_MXN) - calculatePrice(15))}
                </div>
                <button 
                  onClick={() => openPurchaseModal(15, true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  Seleccionar Paquete
                </button>
              </div>
            </div>

            {/* Paquete 4 - VIP */}
            <div className="group relative rounded-3xl bg-gradient-to-br from-yellow-900/30 via-yellow-800/20 to-orange-900/30 backdrop-blur-xl border border-yellow-500/30 p-8 hover:border-yellow-400/50 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
              <div className="text-center relative z-10">
                <div className="text-4xl mb-4">👑</div>
                <h3 className="text-2xl font-black text-white mb-2">VIP</h3>
                <div className="text-4xl font-black text-yellow-400 mb-2">25 Boletos</div>
                <div className="text-lg text-gray-300 mb-4">
                  <span className="line-through opacity-60">{formatPriceMXN(25 * PRECIO_POR_BOLETO_MXN)}</span>
                </div>
                <div className="text-3xl font-black text-white mb-4">{formatPriceMXN(calculatePrice(25))}</div>
                <div className="bg-yellow-500/20 rounded-full px-4 py-2 text-yellow-300 text-sm font-bold mb-6">
                  Ahorra {formatPriceMXN((25 * PRECIO_POR_BOLETO_MXN) - calculatePrice(25))}
                </div>
                <button 
                  onClick={() => openPurchaseModal(25, true)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  Seleccionar Paquete
                </button>
              </div>
            </div>

            {/* Paquete 5 - Elite */}
            <div className="group relative rounded-3xl bg-gradient-to-br from-red-900/30 via-red-800/20 to-pink-900/30 backdrop-blur-xl border border-red-500/30 p-8 hover:border-red-400/50 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
              <div className="text-center relative z-10">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-black text-white mb-2">Elite</h3>
                <div className="text-4xl font-black text-red-400 mb-2">50 Boletos</div>
                <div className="text-lg text-gray-300 mb-4">
                  <span className="line-through opacity-60">{formatPriceMXN(50 * PRECIO_POR_BOLETO_MXN)}</span>
                </div>
                <div className="text-3xl font-black text-white mb-4">{formatPriceMXN(calculatePrice(50))}</div>
                <div className="bg-red-500/20 rounded-full px-4 py-2 text-red-300 text-sm font-bold mb-6">
                  Ahorra {formatPriceMXN((50 * PRECIO_POR_BOLETO_MXN) - calculatePrice(50))}
                </div>
                <button 
                  onClick={() => openPurchaseModal(50, true)}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-105"
                >
                  Seleccionar Paquete
                </button>
              </div>
            </div>

            {/* Paquete 6 - Mega */}
            <div className="group relative rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-800/30 to-pink-900/40 backdrop-blur-xl border-2 border-gradient-to-r from-indigo-400 to-pink-400 p-8 hover:scale-105 transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/30">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-black px-6 py-2 rounded-full shadow-lg animate-pulse">
                  💥 MEGA DEAL
                </div>
              </div>
              <div className="text-center relative z-10">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-2xl font-black text-white mb-2">Mega</h3>
                <div className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">100 Boletos</div>
                <div className="text-lg text-gray-300 mb-4">
                  <span className="line-through opacity-60">{formatPriceMXN(100 * PRECIO_POR_BOLETO_MXN)}</span>
                </div>
                <div className="text-3xl font-black text-white mb-4">{formatPriceMXN(calculatePrice(100))}</div>
                <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-full px-4 py-2 text-purple-300 text-sm font-bold mb-6">
                  Ahorra {formatPriceMXN((100 * PRECIO_POR_BOLETO_MXN) - calculatePrice(100))}
                </div>
                <button 
                  onClick={() => openPurchaseModal(100, true)}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  Seleccionar Paquete
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section - Modernized */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="group relative rounded-3xl bg-gradient-to-br from-indigo-900/40 via-purple-800/30 to-blue-900/40 backdrop-blur-xl border border-indigo-500/30 p-8 md:p-12 hover:border-indigo-400/70 transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30">
              <div className="text-center relative z-10">
                <div className="text-2xl md:text-3xl font-black text-white mb-8 flex items-center justify-center gap-4">
                  <span className="text-4xl md:text-5xl group-hover:animate-bounce">📊</span>
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">ESTADO ACTUAL DE LA RIFA</span>
                </div>
                {/* Stats Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div className="group/stat relative rounded-2xl bg-gradient-to-br from-red-900/40 via-red-800/30 to-pink-900/40 backdrop-blur-sm border border-red-500/30 p-6 hover:border-red-400/70 transition-all duration-500 hover:scale-105">
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-red-400 to-pink-400 bg-clip-text text-transparent mb-3 group-hover/stat:scale-110 transition-transform duration-300">{formatMexicanNumber(stats.soldTickets)}</div>
                      <div className="text-lg md:text-xl text-white/80 font-bold uppercase tracking-wider">VENDIDOS</div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-400/10 to-pink-400/10 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />
                  </div>
                  
                  <div className="group/stat relative rounded-2xl bg-gradient-to-br from-green-900/40 via-green-800/30 to-emerald-900/40 backdrop-blur-sm border border-green-500/30 p-6 hover:border-green-400/70 transition-all duration-500 hover:scale-105">
                    <div className="text-center">
                      <div className="text-4xl md:text-6xl font-black bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent mb-3 group-hover/stat:scale-110 transition-transform duration-300">{formatMexicanNumber(stats.availableTickets)}</div>
                      <div className="text-lg md:text-xl text-white/80 font-bold uppercase tracking-wider">DISPONIBLES</div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="relative mb-8">
                  <div className="w-full bg-white/10 rounded-full h-8 overflow-hidden backdrop-blur-sm border border-white/20">
                    <div 
                      className="bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 h-8 rounded-full transition-all duration-1000 relative overflow-hidden"
                      style={{ width: `${stats.soldPercentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 animate-pulse delay-500"></div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-black px-3 py-1 rounded-full animate-pulse">
                      {stats.soldPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                {/* Status Message */}
                <div className="relative inline-block">
                  <div className="text-xl md:text-2xl font-black text-white mb-4">{stats.soldPercentage.toFixed(1)}% VENDIDO</div>
                  <div className="text-base md:text-lg font-semibold">
                    {stats.soldPercentage < 25 ? 
                      <span className="text-green-400">¡Quedan muchos boletos disponibles!</span> :
                     stats.soldPercentage < 50 ? 
                      <span className="text-yellow-400">¡La rifa está tomando impulso!</span> :
                     stats.soldPercentage < 75 ? 
                      <span className="text-orange-400">⚠️ ¡Se están agotando los boletos!</span> :
                      <span className="text-red-400 animate-pulse">🚨 ¡ÚLTIMOS BOLETOS DISPONIBLES!</span>}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Background Effects */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE SELECCIÓN DE BOLETOS - ULTRA MODERNA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-indigo-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),transparent)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="group relative inline-flex items-center rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-indigo-400/30 px-6 py-3 text-sm font-bold text-white mb-8 hover:border-indigo-400/60 transition-all duration-500 hover:scale-105">
              <span className="text-2xl mr-3 group-hover:animate-bounce">🎯</span>
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-black uppercase tracking-wide">Selección de Boletos</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
              <span className="block bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-2xl">Elige tus números</span>
              <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">de la suerte</span>
            </h2>
            <p className="mx-auto mt-8 max-w-4xl text-lg md:text-xl text-white/70 font-semibold leading-relaxed">
              Selecciona tus boletos favoritos del <span className="text-indigo-400 font-bold">0001</span> al <span className="text-purple-400 font-bold">10,000</span>. Los números se asignan automáticamente al confirmar tu compra.
            </p>
          </div>

          {/* Ticket Grid */}
          <TicketGrid />

          {/* Selection Summary - Modern Fixed Position */}
          {totalSelected > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
              <div className="group relative bg-gradient-to-br from-indigo-900/95 via-purple-800/95 to-blue-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-indigo-400/30 p-6 mx-4 max-w-sm w-full hover:border-indigo-400/60 transition-all duration-500 hover:scale-105 hover:shadow-indigo-500/20">
                {/* Background Effects */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400/10 via-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                
                <div className="text-center relative z-10">
                  <div className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">
                    {totalSelected} boleto{totalSelected !== 1 ? 's' : ''} seleccionado{totalSelected !== 1 ? 's' : ''}
                  </div>
                  <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-6">
                    {formatPriceMXN(totalPrice)}
                  </div>
                  <button
                    onClick={() => openPurchaseModal(totalSelected)}
                    className="w-full bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 hover:from-green-600 hover:via-green-700 hover:to-emerald-700 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-green-500/40 hover:scale-105 relative overflow-hidden"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <span className="text-xl">🛒</span>
                      <span>Proceder al Pago</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIOS - ULTRA MODERNO */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(34,197,94,0.1),transparent)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="group relative inline-flex items-center rounded-full bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 backdrop-blur-xl border border-green-400/30 px-6 py-3 text-sm font-bold text-white mb-8 hover:border-green-400/60 transition-all duration-500 hover:scale-105">
              <span className="text-2xl mr-3 group-hover:animate-bounce">🇲🇽</span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-black uppercase tracking-wide">Testimonios de Mexicanos Ganadores</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              <span className="block bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent drop-shadow-2xl">Lo que dicen nuestros</span>
            </h2>
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-red-600 bg-clip-text text-transparent sm:text-5xl mt-2">
              paisanos ganadores
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">8</div>
              <div className="text-sm text-gray-600">Silverados entregadas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Premios totales</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Transparencia</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2.5K+</div>
              <div className="text-sm text-gray-600">Mexicanos felices</div>
            </div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                name: "María Elena G.",
                location: "Guadalajara, Jalisco",
                message: "¡No lo podía creer cuando me hablaron! El sorteo fue súper transparente, con notario y todo. Mi Silverado ya está en casa. ¡Gracias por cumplir!",
                ticket: "07834",
                verified: true
              },
              {
                name: "Carlos R.",
                location: "Monterrey, Nuevo León", 
                message: "Participé con mis carnales comprando 15 boletos entre todos. Todo muy derecho y confiable. El sorteo se hizo exactamente como prometieron.",
                ticket: "02156",
                verified: true
              },
              {
                name: "Ana Sofia M.",
                location: "CDMX",
                message: "Al principio desconfiaba, pero vi que tenían historial de ganadores reales y me animé. El día del sorteo lo transmitieron en vivo por Facebook. ¡Súper profesional!",
                ticket: "09987", 
                verified: true
              }
            ].map((testimonio, index) => (
              <div key={index} className="relative rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-red-500 text-white font-bold">
                      {testimonio.name.charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">{testimonio.name}</h4>
                        <p className="text-sm text-gray-600">{testimonio.location}</p>
                      </div>
                      {testimonio.verified && <span className="text-green-500">✅</span>}
                    </div>
                    <blockquote className="mt-4 text-gray-700 italic">
                      &ldquo;{testimonio.message}&rdquo;
                    </blockquote>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Boleto ganador:</span> #{testimonio.ticket}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSPARENCIA - DISEÑO MODERNO */}
      <section className="py-24 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-400 mb-6">
              <span className="mr-2">🛡️</span>
              100% Legal y Transparente
            </div>
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              ¿Por qué confiar en nosotros?
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "🏛️",
                title: "Notario Público",
                desc: "Sorteo certificado por notario registrado ante el gobierno mexicano"
              },
              {
                icon: "📺", 
                title: "Transmisión en Vivo",
                desc: "Todo el sorteo se transmite en vivo por Facebook e Instagram"
              },
              {
                icon: "⚖️",
                title: "Registro PROFECO", 
                desc: "Registrados oficialmente ante PROFECO #RIF-2024-MX-001"
              },
              {
                icon: "🚚",
                title: "Entrega Garantizada",
                desc: "Premio entregado máximo 15 días con todos los documentos legales"
              },
              {
                icon: "💰",
                title: "Garantía de Devolución",
                desc: "Si no se completan los boletos, devolvemos 100% tu dinero"
              },
              {
                icon: "📞",
                title: "Soporte Mexicano",
                desc: "Atención 24/7 por WhatsApp con mexicanos como tú"
              }
            ].map((item, index) => (
              <div key={index} className="relative rounded-2xl bg-white/5 backdrop-blur-sm p-8 text-center ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MÉTODOS DE PAGO - DISEÑO MODERNO */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 mb-6">
              <span className="mr-2">💳</span>
              Métodos de Pago
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Paga como prefieras
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              Métodos de pago 100% mexicanos y seguros
            </p>
          </div>

          {/* Payment Methods Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'OXXO', desc: 'Pago en tienda', logo: '/logos/oxxo.png' },
              { name: 'BanCoppel', desc: 'Transferencia', logo: '/logos/bancoppel.png' },
              { name: 'Banco Azteca', desc: 'Transferencia', logo: '/logos/bancoazteca.png' },
              { name: 'Binance Pay', desc: 'Criptomonedas', logo: '/logos/binance.svg' }
            ].map((method, index) => (
              <div key={index} className="relative group">
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:ring-indigo-500 transition-all duration-300">
                  <div className="h-16 flex items-center justify-center mb-6">
                    <Image
                      src={method.logo}
                      alt={`Logo ${method.name}`}
                      width={80}
                      height={40}
                      className="max-h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{method.desc}</p>
                  <div className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    <span className="mr-1">✓</span>
                    Disponible
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER MODERNO */}
      <footer className="bg-gradient-to-br from-gray-900 to-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🇲🇽</span>
                <h3 className="text-xl font-bold text-white">Rifa Silverado México</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Sorteo 100% mexicano, legal y transparente de una Chevrolet Silverado Z71 2024.
                Certificado por notario público y transmitido en vivo.
              </p>
              <div className="inline-flex items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                <span className="mr-1">🛡️</span>
                100% Legal y Seguro
              </div>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">📋 Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/terminos" className="text-gray-300 hover:text-white transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="text-gray-300 hover:text-white transition-colors">
                    Aviso de Privacidad
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">PROFECO: #RIF-2024-MX-001</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">📞 Contacto</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2">📱</span>
                  WhatsApp: +52 55 1234-5678
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✉️</span>
                  contacto@rifa-silverado.mx
                </li>
                <li className="flex items-center">
                  <span className="mr-2">🕐</span>
                  Lun-Vie: 9:00 - 18:00 hrs
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="mt-12 border-t border-gray-800 pt-8">
            <div className="text-center text-sm text-gray-400">
              <p>&copy; 2024 Rifas Silverado México S.A. de C.V. Todos los derechos reservados.</p>
              <div className="mt-2 flex items-center justify-center space-x-4">
                <span className="inline-flex items-center">
                  <span className="mr-1">🗓️</span>
                  Sorteo: 24 de Noviembre 2025
                </span>
                <span className="inline-flex items-center">
                  <span className="mr-1">🏛️</span>
                  Notario Público Certificado
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de compra */}
      <ComprehensivePurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        initialTickets={selectedTicketAmount}
        hasDiscount={hasPromotionalDiscount}
      />
    </div>
  );
}