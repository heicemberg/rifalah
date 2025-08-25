'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTickets } from '../stores/raffle-store';
import { useRealTimeTickets, useTicketStats } from '../hooks/useRealTimeTickets';
import ComprehensivePurchaseModal from '../components/ComprehensivePurchaseModal';
import OrganicNotifications from '../components/OrganicNotifications';
import TicketGrid from '../components/TicketGrid';
import { 
  Truck, Calendar, Users, Trophy, Shield, Zap, ArrowRight, Play,
  Clock, TrendingUp, AlertTriangle, Gift, CheckCircle, Star,
  Target, Flame, Timer, Eye
} from 'lucide-react';

// ============================================================================
// PÁGINA OPTIMIZADA PARA VENTAS - RIFA SILVERADO Z71 2024 🇲🇽
// ============================================================================

export default function RifaSilveradoPage() {
  const { selectedTickets } = useTickets();
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedTicketAmount, setSelectedTicketAmount] = useState(1);
  const [hasPromotionalDiscount, setHasPromotionalDiscount] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [viewCount, setViewCount] = useState(2847);

  // Hook centralizado para tickets en tiempo real
  const { 
    stats, 
    formatMexicanNumber, 
    formatPriceMXN,
    calculatePrice,
    getUrgencyMessage,
    getUrgencyColor,
    PRECIO_POR_BOLETO_MXN,
    PREMIO_TOTAL_MXN 
  } = useRealTimeTickets();

  const {
    urgencyMessage,
    urgencyColor,
    soldCount,
    availableCount,
    soldPercentage,
    isCritical,
    isNearlyFull
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

  // Simular viewers en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setViewCount(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openPurchaseModal = (tickets = 1, hasDiscount = false) => {
    setSelectedTicketAmount(tickets);
    setHasPromotionalDiscount(hasDiscount);
    setIsPurchaseModalOpen(true);
  };

  const totalSelected = selectedTickets.length;
  const totalPrice = calculatePrice(totalSelected);

  // Calcular descuentos dinámicos
  const getDiscountInfo = (count: number) => {
    if (count >= 50) return { percent: 25, savings: Math.round(count * PRECIO_POR_BOLETO_MXN * 0.25) };
    if (count >= 20) return { percent: 20, savings: Math.round(count * PRECIO_POR_BOLETO_MXN * 0.2) };
    if (count >= 10) return { percent: 15, savings: Math.round(count * PRECIO_POR_BOLETO_MXN * 0.15) };
    if (count >= 5) return { percent: 10, savings: Math.round(count * PRECIO_POR_BOLETO_MXN * 0.1) };
    return { percent: 0, savings: 0 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      {/* Organic Notifications */}
      <OrganicNotifications />

      {/* BARRA DE URGENCIA DINÁMICA CON DATOS REALES */}
      <div className={`bg-gradient-to-r ${urgencyColor} text-white py-4 px-4 shadow-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
              <span className="uppercase tracking-wider">{urgencyMessage}</span>
              <Flame className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs opacity-90">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatMexicanNumber(viewCount)} viendo ahora</span>
              {soldPercentage > 70 && (
                <span className="ml-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                  ¡CALIENTE!
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>{formatMexicanNumber(soldCount)} vendidos</span>
            </div>
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              <span>¡Solo {availableCount} disponibles!</span>
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION CON IMAGEN PREMIUM DEL PREMIO */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-emerald-900/90"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="w-full h-full opacity-10">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_#059669_0%,_transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_#f59e0b_0%,_transparent_50%)]"></div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 lg:py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-screen">
            
            {/* COPYWRITING ENFOCADO EN VENTAS */}
            <div className="text-center lg:text-left space-y-8 order-2 lg:order-1">
              
              {/* Badges de Credibilidad */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="bg-green-600/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 text-xs font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>100% LEGAL</span>
                </div>
                <div className="bg-yellow-600/20 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>PREMIO GARANTIZADO</span>
                </div>
                <div className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full border border-red-500/30 text-xs font-semibold flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  <span>{soldPercentage}% VENDIDO</span>
                </div>
              </div>

              {/* Headline Principal - ENFOCADO EN BENEFICIOS */}
              <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight">
                <span className="text-emerald-400">¡CAMBIA TU VIDA!</span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Silverado Z71 2024
                </span>
                <br />
                <span className="text-white">puede ser TUYA</span>
              </h1>

              {/* Subtítulo con Propuesta de Valor - ACTUALIZADO CON TODOS LOS PREMIOS */}
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-lg lg:text-xl text-white font-semibold mb-4">
                  🚚 <span className="text-yellow-400">Silverado Z71 2024</span> + 🎮 <span className="text-blue-400">PlayStation 5</span> + 💵 <span className="text-green-400">$3,000 USD</span>
                </p>
                <p className="text-sm lg:text-base text-slate-300 leading-relaxed">
                  <strong>Camioneta 0KM</strong> + <strong>PS5 Nueva</strong> + <strong>$54,000 MXN en efectivo</strong>
                </p>
                <p className="text-lg text-slate-200 mt-3">
                  <strong>Valor total: ~$876,000 MXN</strong> • Tu inversión: solo <span className="text-yellow-400 font-bold">{formatPriceMXN(PRECIO_POR_BOLETO_MXN)} por boleto</span>
                </p>
              </div>

              {/* Estadísticas de FOMO en Tiempo Real */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`bg-gradient-to-br ${isCritical ? 'from-red-600/30' : isNearlyFull ? 'from-orange-600/30' : 'from-green-600/30'} to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-red-400' : isNearlyFull ? 'text-orange-400' : 'text-green-400'}`} />
                    <span className="text-xs font-semibold text-slate-300 uppercase">Disponibles</span>
                  </div>
                  <div className={`text-3xl font-black ${isCritical ? 'text-red-400' : isNearlyFull ? 'text-orange-400' : 'text-green-400'} mb-1`}>
                    {formatMexicanNumber(availableCount)}
                  </div>
                  <div className="text-xs text-slate-400">de {formatMexicanNumber(stats.totalTickets)} boletos</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-600/30 to-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs font-semibold text-slate-300 uppercase">Ya Participan</span>
                  </div>
                  <div className="text-3xl font-black text-yellow-400 mb-1">
                    {formatMexicanNumber(soldCount)}
                  </div>
                  <div className="text-xs text-slate-400">personas confiaron en nosotros</div>
                </div>
              </div>

              {/* 6 Cards de Promociones en 2 filas de 3 - DENTRO DE LA COLUMNA IZQUIERDA */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <p className="text-sm text-slate-400 mb-4">⚡ OFERTAS POR CANTIDAD (Ahorras más comprando más)</p>
                </div>
                
                {/* Primera fila - 3 cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 1, label: '1 Boleto', emoji: '🎫', highlight: false },
                    { count: 5, label: '5 Boletos', emoji: '🎯', highlight: false },
                    { count: 10, label: '10 Boletos', emoji: '⚡', highlight: true }
                  ].map((option) => {
                    const discount = getDiscountInfo(option.count);
                    const price = calculatePrice(option.count);
                    
                    return (
                      <button
                        key={option.count}
                        onClick={() => openPurchaseModal(option.count, discount.percent > 0)}
                        className={`group relative px-3 py-4 rounded-xl font-bold transition-all duration-300 text-xs ${
                          option.highlight
                            ? 'bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-500 text-slate-900 shadow-xl shadow-yellow-500/25 hover:shadow-yellow-500/40 border-2 border-yellow-300/50'
                            : 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 border-2 border-emerald-400/30'
                        } hover:scale-105 backdrop-blur-sm`}
                      >
                        {discount.percent > 0 && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-black">
                            -{discount.percent}%
                          </div>
                        )}
                        <div className="text-xl mb-2">{option.emoji}</div>
                        <div className="text-xs opacity-90 mb-1">{option.label}</div>
                        <div className="font-black text-sm">
                          {formatPriceMXN(price)}
                        </div>
                        {discount.savings > 0 && (
                          <div className="text-xs opacity-80 mt-1">
                            Ahorras: ${Math.round(discount.savings / 1000)}K
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Segunda fila - 3 cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 20, label: '20 Boletos', emoji: '🔥', highlight: true },
                    { count: 50, label: '50 Boletos', emoji: '💎', highlight: true },
                    { count: 100, label: '100 Boletos', emoji: '👑', highlight: true }
                  ].map((option) => {
                    const discount = getDiscountInfo(option.count);
                    const price = calculatePrice(option.count);
                    
                    return (
                      <button
                        key={option.count}
                        onClick={() => openPurchaseModal(option.count, discount.percent > 0)}
                        className="group relative px-3 py-4 rounded-xl font-bold transition-all duration-300 text-xs bg-gradient-to-br from-red-600 via-red-500 to-red-600 text-white shadow-xl shadow-red-500/25 hover:shadow-red-500/40 border-2 border-red-400/50 hover:scale-105 backdrop-blur-sm"
                      >
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full animate-pulse font-black">
                          -{discount.percent}%
                        </div>
                        <div className="text-xl mb-2">{option.emoji}</div>
                        <div className="text-xs opacity-90 mb-1">{option.label}</div>
                        <div className="font-black text-sm">
                          {formatPriceMXN(price)}
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          Ahorras: ${Math.round(discount.savings / 1000)}K
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advertencia de Escasez */}
              {(isNearlyFull || isCritical) && (
                <div className={`p-4 rounded-xl border-2 ${
                  isCritical 
                    ? 'bg-red-600/20 border-red-500 text-red-300' 
                    : 'bg-orange-600/20 border-orange-500 text-orange-300'
                } animate-pulse`}>
                  <div className="flex items-center justify-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    {isCritical 
                      ? `¡ÚLTIMOS ${formatMexicanNumber(availableCount)} BOLETOS! Se agota MUY PRONTO`
                      : `¡ATENCIÓN! Solo quedan ${formatMexicanNumber(availableCount)} boletos disponibles`
                    }
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
              )}

              {/* CTA Principal Gigante */}
              <button
                onClick={() => openPurchaseModal(1, false)}
                className={`w-full group bg-gradient-to-r ${
                  isCritical 
                    ? 'from-red-700 via-red-600 to-red-700 animate-pulse' 
                    : 'from-red-600 via-red-500 to-red-600'
                } hover:from-red-500 hover:to-red-600 text-white px-8 py-6 rounded-2xl font-black text-xl shadow-2xl shadow-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 border-2 border-red-400/50`}
              >
                <span className="flex items-center justify-center gap-4">
                  <Gift className="w-8 h-8" />
                  <div className="text-left">
                    <div>{isCritical ? '¡ÚLTIMAS OPORTUNIDADES!' : '¡QUIERO PARTICIPAR AHORA!'}</div>
                    <div className="text-sm opacity-90">Solo {formatPriceMXN(PRECIO_POR_BOLETO_MXN)} - Puede cambiar tu vida</div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>

              {/* Garantías y Trust Signals */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xs text-slate-300 font-semibold">Sorteo Legal</div>
                  <div className="text-xs text-slate-500">Con notario</div>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xs text-slate-300 font-semibold">Premio Real</div>
                  <div className="text-xs text-slate-500">Verificable</div>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xs text-slate-300 font-semibold">Entrega 48h</div>
                  <div className="text-xs text-slate-500">Después sorteo</div>
                </div>
              </div>
            </div>

            {/* IMAGEN PREMIUM DEL PREMIO CON TRANSPARENCIA - BAJADA 200PX */}
            <div className="relative order-1 lg:order-2 flex items-start justify-center lg:-mt-[600px]">
              <div className="relative z-10 group">
                {/* Efectos de Glow Premium */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 blur-3xl opacity-30 scale-110 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-emerald-400 blur-2xl opacity-20 scale-105 group-hover:scale-110 transition-transform duration-700"></div>
                
                {/* Container de la Imagen con Transparencia Negra - TAMAÑO EQUILIBRADO */}
                <div className="relative bg-gradient-to-br from-black/40 via-black/20 to-black/40 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl transform scale-100 lg:scale-110">
                  
                      {/* Badge de Valor Flotante */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black px-6 py-3 rounded-2xl font-black text-base lg:text-lg shadow-2xl rotate-2 animate-bounce">
                      💰 Valor: ~$876,000 MXN
                    </div>
                  </div>

                  {/* Badge de Estado */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      DISPONIBLE
                    </div>
                  </div>
                  
                  {/* Imagen Principal del Premio - MÁS GRANDE */}
                  <div className="relative group-hover:scale-105 transition-transform duration-700">
                    <Image
                      src="/premios/premio-rifa.png"
                      alt="Chevrolet Silverado Z71 2024 - Tu próximo auto"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                      priority
                    />
                    
                    {/* Overlay de Transparencia con Información */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl">
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">Chevrolet Silverado Z71 2024</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>✅ Motor V8</div>
                          <div>✅ 4x4 Automática</div>
                          <div>✅ Aire Acondicionado</div>
                          <div>✅ Papeles Incluidos</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indicadores de Características */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                      <div className="text-2xl mb-1">🚛</div>
                      <div className="text-xs text-white font-semibold">Pickup</div>
                      <div className="text-xs text-slate-300">Premium</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-xs text-white font-semibold">Motor</div>
                      <div className="text-xs text-slate-300">V8 Potente</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-xs text-white font-semibold">Nueva</div>
                      <div className="text-xs text-slate-300">0 KM</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Cards de Promociones en 2 filas de 3 - DENTRO DE LA COLUMNA IZQUIERDA */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <p className="text-sm text-slate-400 mb-4">⚡ OFERTAS POR CANTIDAD (Ahorras más comprando más)</p>
                </div>
                
                {/* Primera fila - 3 cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 1, label: '1 Boleto', emoji: '🎫', highlight: false },
                    { count: 5, label: '5 Boletos', emoji: '🎯', highlight: false },
                    { count: 10, label: '10 Boletos', emoji: '⚡', highlight: true }
                  ].map((option) => {
                    const discount = getDiscountInfo(option.count);
                    const price = calculatePrice(option.count);
                    
                    return (
                      <button
                        key={option.count}
                        onClick={() => openPurchaseModal(option.count, discount.percent > 0)}
                        className={`group relative px-3 py-4 rounded-xl font-bold transition-all duration-300 text-xs ${
                          option.highlight
                            ? 'bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-500 text-slate-900 shadow-xl shadow-yellow-500/25 hover:shadow-yellow-500/40 border-2 border-yellow-300/50'
                            : 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 border-2 border-emerald-400/30'
                        } hover:scale-105 backdrop-blur-sm`}
                      >
                        {discount.percent > 0 && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse font-black">
                            -{discount.percent}%
                          </div>
                        )}
                        <div className="text-xl mb-2">{option.emoji}</div>
                        <div className="text-xs opacity-90 mb-1">{option.label}</div>
                        <div className="font-black text-sm">
                          {formatPriceMXN(price)}
                        </div>
                        {discount.savings > 0 && (
                          <div className="text-xs opacity-80 mt-1">
                            Ahorras: ${Math.round(discount.savings / 1000)}K
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Segunda fila - 3 cards */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 20, label: '20 Boletos', emoji: '🔥', highlight: true },
                    { count: 50, label: '50 Boletos', emoji: '💎', highlight: true },
                    { count: 100, label: '100 Boletos', emoji: '👑', highlight: true }
                  ].map((option) => {
                    const discount = getDiscountInfo(option.count);
                    const price = calculatePrice(option.count);
                    
                    return (
                      <button
                        key={option.count}
                        onClick={() => openPurchaseModal(option.count, discount.percent > 0)}
                        className="group relative px-3 py-4 rounded-xl font-bold transition-all duration-300 text-xs bg-gradient-to-br from-red-600 via-red-500 to-red-600 text-white shadow-xl shadow-red-500/25 hover:shadow-red-500/40 border-2 border-red-400/50 hover:scale-105 backdrop-blur-sm"
                      >
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full animate-pulse font-black">
                          -{discount.percent}%
                        </div>
                        <div className="text-xl mb-2">{option.emoji}</div>
                        <div className="text-xs opacity-90 mb-1">{option.label}</div>
                        <div className="font-black text-sm">
                          {formatPriceMXN(price)}
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          Ahorras: ${Math.round(discount.savings / 1000)}K
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Advertencia de Escasez */}
              {(isNearlyFull || isCritical) && (
                <div className={`p-4 rounded-xl border-2 ${
                  isCritical 
                    ? 'bg-red-600/20 border-red-500 text-red-300' 
                    : 'bg-orange-600/20 border-orange-500 text-orange-300'
                } animate-pulse`}>
                  <div className="flex items-center justify-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5" />
                    {isCritical 
                      ? `¡ÚLTIMOS ${formatMexicanNumber(availableCount)} BOLETOS! Se agota MUY PRONTO`
                      : `¡ATENCIÓN! Solo quedan ${formatMexicanNumber(availableCount)} boletos disponibles`
                    }
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
              )}

              {/* CTA Principal Gigante */}
              <button
                onClick={() => openPurchaseModal(1, false)}
                className={`w-full group bg-gradient-to-r ${
                  isCritical 
                    ? 'from-red-700 via-red-600 to-red-700 animate-pulse' 
                    : 'from-red-600 via-red-500 to-red-600'
                } hover:from-red-500 hover:to-red-600 text-white px-8 py-6 rounded-2xl font-black text-xl shadow-2xl shadow-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 border-2 border-red-400/50`}
              >
                <span className="flex items-center justify-center gap-4">
                  <Gift className="w-8 h-8" />
                  <div className="text-left">
                    <div>{isCritical ? '¡ÚLTIMAS OPORTUNIDADES!' : '¡QUIERO PARTICIPAR AHORA!'}</div>
                    <div className="text-sm opacity-90">Solo {formatPriceMXN(PRECIO_POR_BOLETO_MXN)} - Puede cambiar tu vida</div>
                  </div>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>

              {/* Garantías y Trust Signals */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-xs text-slate-300 font-semibold">Sorteo Legal</div>
                  <div className="text-xs text-slate-500">Con notario</div>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-xs text-slate-300 font-semibold">Premio Real</div>
                  <div className="text-xs text-slate-500">Verificable</div>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-xs text-slate-300 font-semibold">Entrega 48h</div>
                  <div className="text-xs text-slate-500">Después sorteo</div>
                </div>
              </div>
            </div>

            {/* IMAGEN PREMIUM DEL PREMIO CON TRANSPARENCIA - BAJADA 200PX */}
            <div className="relative order-1 lg:order-2 flex items-start justify-center lg:-mt-[600px]">
              <div className="relative z-10 group">
                {/* Efectos de Glow Premium */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 blur-3xl opacity-30 scale-110 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-emerald-400 blur-2xl opacity-20 scale-105 group-hover:scale-110 transition-transform duration-700"></div>
                
                {/* Container de la Imagen con Transparencia Negra - TAMAÑO EQUILIBRADO */}
                <div className="relative bg-gradient-to-br from-black/40 via-black/20 to-black/40 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-white/10 shadow-2xl transform scale-100 lg:scale-110">
                  
                  {/* Badge de Valor Flotante */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black px-6 py-3 rounded-2xl font-black text-base lg:text-lg shadow-2xl rotate-2 animate-bounce">
                      💰 Valor: ~$876,000 MXN
                    </div>
                  </div>

                  {/* Badge de Estado */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      DISPONIBLE
                    </div>
                  </div>
                  
                  {/* Imagen Principal del Premio - MÁS GRANDE */}
                  <div className="relative group-hover:scale-105 transition-transform duration-700">
                    <Image
                      src="/premios/premio-rifa.png"
                      alt="Chevrolet Silverado Z71 2024 - Tu próximo auto"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-2xl shadow-2xl"
                      priority
                    />
                    
                    {/* Overlay de Transparencia con Información */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl">
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">Chevrolet Silverado Z71 2024</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>✅ Motor V8</div>
                          <div>✅ 4x4 Automática</div>
                          <div>✅ Aire Acondicionado</div>
                          <div>✅ Papeles Incluidos</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indicadores de Características */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                      <div className="text-2xl mb-1">🚛</div>
                      <div className="text-xs text-white font-semibold">Pickup</div>
                      <div className="text-xs text-slate-300">Premium</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-xs text-white font-semibold">Motor</div>
                      <div className="text-xs text-slate-300">V8 Potente</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-xs text-white font-semibold">Nueva</div>
                      <div className="text-xs text-slate-300">0 KM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE UN SOLO PREMIO - MOVIDA DESPUÉS DEL HERO */}
      <section className="py-16 bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(251,191,36,0.1)_0%,_transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-6 py-3 rounded-full border border-green-500/30 font-bold text-lg mb-6">
              <Trophy className="w-6 h-6" />
              <span>UN SOLO GANADOR</span>
              <Trophy className="w-6 h-6" />
            </div>
            <h2 className="text-3xl lg:text-5xl font-black text-white mb-4">
              ¡No hay<span className="text-yellow-400"> segundos lugares</span>!
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Este <strong>Chevrolet Silverado Z71 2024</strong> será para <span className="text-emerald-400 font-bold">UNA SOLA PERSONA</span>. 
              No dividimos el premio, no hay múltiples ganadores. <span className="text-yellow-400 font-bold">TODO para el afortunado</span>.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Camioneta Completa</h3>
              <p className="text-slate-300">Pickup Silverado Z71 2024 nueva, con todos los papeles legales incluidos</p>
            </div>
            
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Seguro Incluido</h3>
              <p className="text-slate-300">Seguro de auto pagado por 1 año completo, sin gastos adicionales para ti</p>
            </div>
            
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Entrega Inmediata</h3>
              <p className="text-slate-300">En 48 horas después del sorteo, la camioneta estará en tus manos</p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-8 border border-yellow-500/30 max-w-2xl mx-auto">
              <div className="text-4xl lg:text-5xl font-black text-yellow-400 mb-4">
                {formatPriceMXN(PREMIO_TOTAL_MXN)}
              </div>
              <p className="text-lg text-yellow-200 font-semibold">
                Valor total del premio • Tu inversión: solo {formatPriceMXN(PRECIO_POR_BOLETO_MXN)} por boleto
              </p>
              <div className="mt-4 text-sm text-yellow-300">
                💡 <strong>Probabilidad real:</strong> 1 entre {formatMexicanNumber(stats.totalTickets)} vs 1 entre 175 millones de la lotería nacional
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTADOR REGRESIVO CON URGENCIA */}
      <section className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              ⏰ ¡EL SORTEO SE ACERCA!
            </h2>
            <p className="text-xl text-red-100 font-semibold">
              24 de Noviembre 2025 • 8:00 PM (México) • Transmisión EN VIVO
            </p>
            <p className="text-red-200 mt-2">
              🔴 Después de esta fecha NO podrás participar
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-4 gap-4 lg:gap-8">
              {[
                { value: timeLeft.days, label: 'Días' },
                { value: timeLeft.hours, label: 'Horas' },
                { value: timeLeft.minutes, label: 'Minutos' },
                { value: timeLeft.seconds, label: 'Segundos' }
              ].map((item, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center border-2 border-white/30 shadow-2xl">
                  <div className="text-4xl lg:text-6xl font-black text-white mb-2 tabular-nums">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm lg:text-base text-red-100 uppercase tracking-wider font-bold">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => openPurchaseModal(5, true)}
              className="bg-white text-red-600 px-12 py-6 rounded-2xl font-black text-xl shadow-2xl hover:bg-red-50 transition-colors animate-pulse"
            >
              🎯 ¡ASEGURAR MI PARTICIPACIÓN AHORA!
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE SELECCIÓN DE TICKETS CON FOMO */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              🎲 Elige tus Números de la Suerte
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              Solo quedan <span className="text-red-400 font-bold">{formatMexicanNumber(availableCount)} boletos</span> de {formatMexicanNumber(stats.totalTickets)}
            </p>

            {/* Progress Bar de Tickets Vendidos */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="bg-slate-700/50 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isCritical 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : isNearlyFull 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-slate-400">
                <span>0</span>
                <span className="text-white font-bold">{soldPercentage}% vendido</span>
                <span>{formatMexicanNumber(stats.totalTickets)}</span>
              </div>
            </div>
          </div>

          {/* Grid de Tickets */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
            <TicketGrid />
          </div>

          {/* Información de Selección */}
          {totalSelected > 0 && (
            <div className="mt-8 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <div className="text-3xl font-black mb-2">
                    🎫 {totalSelected} {totalSelected === 1 ? 'boleto seleccionado' : 'boletos seleccionados'}
                  </div>
                  <div className="text-emerald-100 text-lg">
                    Total a pagar: <span className="font-black text-2xl">{formatPriceMXN(totalPrice)}</span>
                  </div>
                  {getDiscountInfo(totalSelected).percent > 0 && (
                    <div className="text-emerald-200 text-sm mt-1">
                      💰 Ahorras: {formatPriceMXN(getDiscountInfo(totalSelected).savings)} ({getDiscountInfo(totalSelected).percent}% descuento)
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="bg-white text-emerald-600 px-12 py-6 rounded-2xl font-black text-xl hover:bg-emerald-50 transition-colors shadow-2xl group"
                >
                  <span className="flex items-center gap-3">
                    💳 Proceder al Pago
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE COMPRA */}
      <ComprehensivePurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        initialTickets={selectedTicketAmount}
        hasDiscount={hasPromotionalDiscount}
      />
    </div>
  );
}