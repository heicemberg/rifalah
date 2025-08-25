'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTickets } from '../stores/raffle-store';
import { useRealTimeTickets, useTicketStats } from '../hooks/useRealTimeTickets';
import ComprehensivePurchaseModal from '../components/ComprehensivePurchaseModal';
import OrganicNotifications from '../components/OrganicNotifications';
import TicketGrid from '../components/TicketGrid';
import { Truck, Calendar, Users, Trophy, Shield, Zap, ArrowRight, Play } from 'lucide-react';

// ============================================================================
// PÁGINA PRINCIPAL REDISEÑADA - RIFA SILVERADO Z71 2024 🇲🇽
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Organic Notifications */}
      <OrganicNotifications />

      {/* BARRA DE URGENCIA PREMIUM */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white py-3 px-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3 text-sm font-bold animate-pulse">
            <Zap className="w-4 h-4 text-yellow-300" />
            <span className="uppercase tracking-wider">🔥 {urgencyMessage} - Solo quedan {stats.availableCount} boletos 🔥</span>
            <Zap className="w-4 h-4 text-yellow-300" />
          </div>
        </div>
      </div>

      {/* HERO SECTION PREMIUM */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
            
            {/* Contenido Principal */}
            <div className="text-center lg:text-left space-y-8">
              {/* Badge Premium */}
              <div className="inline-flex items-center gap-2 bg-emerald-600/20 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/30">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">Rifa Oficial Autorizada</span>
              </div>

              {/* Título Principal */}
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                <span className="text-emerald-400">GANA</span> una
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                  Silverado Z71
                </span>
                <br />
                <span className="text-white">2024</span>
              </h1>

              {/* Subtítulo Premium */}
              <p className="text-xl lg:text-2xl text-slate-300 max-w-xl leading-relaxed">
                <strong className="text-white">Camioneta completamente nueva</strong> valorada en 
                <span className="text-yellow-400 font-bold"> $890,000 MXN</span>. 
                Sorteo 100% transparente y legal.
              </p>

              {/* Estadísticas Impactantes */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-yellow-400">{formatMexicanNumber(stats.soldCount)}</div>
                  <div className="text-sm text-slate-400">Boletos Vendidos</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-emerald-400">{stats.soldPercentage}%</div>
                  <div className="text-sm text-slate-400">Completado</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 col-span-2 lg:col-span-1">
                  <div className="text-2xl font-bold text-red-400">{formatMexicanNumber(stats.availableCount)}</div>
                  <div className="text-sm text-slate-400">Disponibles</div>
                </div>
              </div>

              {/* CTAs Principales */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => openPurchaseModal(1, false)}
                  className="group bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/25 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/40"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Truck className="w-6 h-6" />
                    Comprar Boletos Ahora
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                
                <button 
                  className="group bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 px-8 py-4 rounded-2xl font-semibold text-lg backdrop-blur-sm transition-all duration-300"
                  onClick={() => {
                    const videoSection = document.getElementById('video-section');
                    videoSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="flex items-center justify-center gap-3">
                    <Play className="w-5 h-5" />
                    Ver Video del Premio
                  </span>
                </button>
              </div>

              {/* Precio Destacado */}
              <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 rounded-2xl p-6 border border-yellow-500/30">
                <div className="text-center">
                  <div className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">Precio por Boleto</div>
                  <div className="text-4xl font-black text-white mt-2">
                    ${PRECIO_POR_BOLETO_MXN} <span className="text-xl text-slate-400">MXN</span>
                  </div>
                  <div className="text-slate-300 text-sm mt-1">+ Descuentos por cantidad</div>
                </div>
              </div>
            </div>

            {/* Imagen del Premio */}
            <div className="relative">
              <div className="relative z-10 transform hover:scale-105 transition-transform duration-700">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-yellow-500 blur-3xl opacity-20 scale-110"></div>
                
                {/* Imagen Principal */}
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <Image
                    src="/premios/premio-rifa.png"
                    alt="Chevrolet Silverado Z71 2024 - Premio Principal"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-2xl shadow-2xl"
                    priority
                  />
                  
                  {/* Badge del Precio */}
                  <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 px-6 py-3 rounded-2xl font-black text-lg shadow-2xl rotate-3">
                    Valor: $890,000 MXN
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

      {/* CONTADOR REGRESIVO PREMIUM */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Sorteo en Vivo</h2>
            <p className="text-xl text-slate-300">24 de Noviembre 2025 • 8:00 PM (México)</p>
          </div>
          
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-4 lg:gap-8">
              {[
                { value: timeLeft.days, label: 'Días' },
                { value: timeLeft.hours, label: 'Horas' },
                { value: timeLeft.minutes, label: 'Minutos' },
                { value: timeLeft.seconds, label: 'Segundos' }
              ].map((item, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                  <div className="text-4xl lg:text-6xl font-black text-yellow-400 mb-2">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm lg:text-base text-slate-300 uppercase tracking-wider">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CARACTERÍSTICAS PREMIUM */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              ¿Por qué elegir nuestra rifa?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Somos la rifa más confiable de México con miles de ganadores satisfechos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "100% Legal y Transparente",
                description: "Registrados ante las autoridades mexicanas. Sorteo público con notario.",
                color: "text-emerald-600"
              },
              {
                icon: Trophy,
                title: "Premio Garantizado",
                description: "Camioneta nueva 0km con todos los papeles incluidos y seguro.",
                color: "text-yellow-600"
              },
              {
                icon: Users,
                title: "Miles de Participantes",
                description: "Más de 50,000 personas han participado en nuestras rifas anteriores.",
                color: "text-blue-600"
              },
              {
                icon: Calendar,
                title: "Fecha Fija de Sorteo",
                description: "24 de Noviembre 2025 en vivo por YouTube y Facebook.",
                color: "text-red-600"
              },
              {
                icon: Truck,
                title: "Entrega Inmediata",
                description: "El ganador recibe su premio máximo 48 horas después del sorteo.",
                color: "text-purple-600"
              },
              {
                icon: Zap,
                title: "Pago Instantáneo",
                description: "Múltiples métodos de pago: OXXO, bancos mexicanos, transferencias.",
                color: "text-orange-600"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-slate-50 hover:bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-xl">
                <div className={`${feature.color} mb-4`}>
                  <feature.icon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN DE SELECCIÓN DE TICKETS MEJORADA */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-800 mb-6">
              Elige tus Números de la Suerte
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
              Selecciona tus boletos favoritos o deja que el sistema elija por ti
            </p>

            {/* Selección Rápida Premium */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {[1, 5, 10, 25, 50].map(count => (
                <button
                  key={count}
                  onClick={() => openPurchaseModal(count, count >= 10)}
                  className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    count >= 10 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40' 
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  } hover:scale-105`}
                >
                  {count >= 10 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      ¡AHORRO!
                    </div>
                  )}
                  <span className="flex items-center gap-2">
                    {count} {count === 1 ? 'Boleto' : 'Boletos'}
                    <span className="text-sm opacity-75">
                      {formatPriceMXN(calculatePrice(count))}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Tickets */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <TicketGrid />
          </div>

          {/* Información de Selección */}
          {totalSelected > 0 && (
            <div className="mt-8 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-2xl font-bold">
                    {totalSelected} {totalSelected === 1 ? 'boleto seleccionado' : 'boletos seleccionados'}
                  </div>
                  <div className="text-emerald-100">
                    Total a pagar: <span className="font-bold text-xl">{formatPriceMXN(totalPrice)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
                >
                  Proceder al Pago →
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
        initialTicketAmount={selectedTicketAmount}
        hasPromotionalDiscount={hasPromotionalDiscount}
      />
    </div>
  );
}