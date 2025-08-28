'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRaffleStore } from '@/stores/raffle-store'
import { useRealTimeTickets } from '@/hooks/useRealTimeTickets'
import { useSupabaseSync } from '@/hooks/useSupabaseSync'
import { 
  ArrowRight, 
  Gift, 
  Shield, 
  CheckCircle, 
  Clock,
  Star,
  TrendingUp,
  Users,
  MapPin,
  Trophy,
  Zap,
  Heart,
  Target
} from 'lucide-react'
import ComprehensivePurchaseModal from '@/components/ComprehensivePurchaseModal'
import TicketGrid from '@/components/TicketGrid'
import OrganicNotifications from '@/components/OrganicNotifications'

export default function NewRaffePage() {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  
  const { 
    stats, 
    formatMexicanNumber, 
    formatPriceMXN,
    PRECIO_POR_BOLETO_MXN
  } = useRealTimeTickets()

  // Hook de sincronización con Supabase
  useSupabaseSync()
  
  // Acceder al store para obtener los tickets seleccionados
  const { selectedTickets } = useRaffleStore()

  const soldCount = stats.soldTickets
  const availableCount = stats.availableTickets
  const soldPercentage = Math.round((soldCount / stats.totalTickets) * 100)

  return (
    <main className="bg-black text-white font-sans">
      {/* HEADER MINIMALISTA */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logos/Rifasilverado.png"
                alt="Rifa Silverado"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="font-black text-xl">RIFA SILVERADO</span>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowPurchaseModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-6 py-2 rounded-lg font-bold text-sm hover:scale-105 transition-transform"
              >
                COMPRAR AHORA
              </button>
              
              {/* Indicador de tickets seleccionados */}
              {selectedTickets.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-pulse">
                  {selectedTickets.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION - ELEGANTE CON IMAGEN DE FONDO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Imagen de Fondo con Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/premios/premio-rifa.png"
            alt="Chevrolet Silverado Z71 2024"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/85"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10 mt-16">
          <div className="max-w-4xl mx-auto text-center text-white">
            
            {/* Badge de Verificación */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 px-6 py-3 rounded-full border border-yellow-500/30 font-bold text-sm mb-8 backdrop-blur-sm">
              <Shield className="w-5 h-5" />
              <span>RIFA VERIFICADA • 100% LEGAL</span>
              <Shield className="w-5 h-5" />
            </div>

            {/* Título Principal Impactante */}
            <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
              <span className="block text-white mb-2">GANA TU</span>
              <span className="block bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
                SILVERADO Z71 2024
              </span>
            </h1>

            {/* Subtítulo Profesional */}
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Camioneta Nueva + PlayStation 5 + $54,000 MXN en efectivo
            </p>

            {/* Precio Destacado */}
            <div className="bg-gradient-to-r from-red-600/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-6 border border-red-500/30 mb-8 max-w-md mx-auto">
              <div className="text-sm text-gray-300 mb-2">PRECIO POR BOLETO</div>
              <div className="text-4xl font-black text-yellow-400">{formatPriceMXN(PRECIO_POR_BOLETO_MXN)}</div>
              <div className="text-sm text-gray-400">Valor total del premio: $876,000 MXN</div>
            </div>

            {/* Contador de Boletos Elegante */}
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-black text-red-400">{formatMexicanNumber(soldCount)}</div>
                <div className="text-sm text-gray-300">Boletos Vendidos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-black text-green-400">{formatMexicanNumber(availableCount)}</div>
                <div className="text-sm text-gray-300">Disponibles</div>
              </div>
            </div>

            {/* CTA Principal Prominente */}
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="inline-flex items-center gap-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-700 text-white px-12 py-6 rounded-2xl font-black text-xl shadow-2xl shadow-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 border-2 border-red-400/50 mb-8"
            >
              <Gift className="w-8 h-8" />
              <div>
                <div>COMPRAR BOLETOS</div>
                <div className="text-sm opacity-90 font-normal">Desde {formatPriceMXN(PRECIO_POR_BOLETO_MXN)}</div>
              </div>
              <ArrowRight className="w-6 h-6" />
            </button>

            {/* Información de Confianza */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Sorteo ante Notario Público</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Transmisión en vivo</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span>Proceso transparente</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BARRA DE ESTADÍSTICAS EN VIVO */}
      <section className="py-8 bg-gradient-to-r from-gray-900 to-black border-y border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400 uppercase font-semibold">Vendidos</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-green-400">{formatMexicanNumber(soldCount)}</div>
              <div className="text-xs text-gray-500">de {formatMexicanNumber(stats.totalTickets)}</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400 uppercase font-semibold">Participantes</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-blue-400">{formatMexicanNumber(Math.floor(soldCount * 0.8))}</div>
              <div className="text-xs text-gray-500">personas</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400 uppercase font-semibold">Ciudades</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-yellow-400">32</div>
              <div className="text-xs text-gray-500">estados MX</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-sm text-gray-400 uppercase font-semibold">Progreso</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-red-400">{soldPercentage}%</div>
              <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${soldPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAPA DE BOLETOS - SECCIÓN PRINCIPAL */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <TicketGrid onOpenPurchaseModal={() => setShowPurchaseModal(true)} />
        </div>
      </section>

      {/* SECCIÓN "ELIGE TUS NÚMEROS" - AHORA DEBAJO DEL GRID */}
      <section className="py-16 bg-gradient-to-b from-gray-900 via-slate-900 to-black relative overflow-hidden">
        {/* Efectos de fondo decorativos */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-white mb-4">
              ELIGE TUS <span className="text-yellow-400">NÚMEROS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Selecciona los números que más te gusten del grid superior. Puedes elegir desde 1 hasta 100 boletos en una sola compra.
            </p>
            
            {/* Instrucciones de uso */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">1. Selecciona</h3>
                <p className="text-gray-300 text-sm">
                  Haz clic en los números que quieras del grid superior. Los números seleccionados se marcan en verde.
                </p>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/30">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">2. Usa Filtros</h3>
                <p className="text-gray-300 text-sm">
                  Utiliza los filtros para ver solo números disponibles, ocultar ocupados o revisar tus selecciones.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">3. Compra Fácil</h3>
                <p className="text-gray-300 text-sm">
                  Cuando tengas tus números, haz clic en &quot;Comprar Ahora&quot; que aparece en la parte inferior derecha.
                </p>
              </div>
            </div>

            {/* CTA para volver al grid */}
            <div className="mt-12">
              <div className="relative inline-block">
                {/* Efecto de pulso animado */}
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-3xl opacity-40 animate-pulse blur-sm"></div>
                <button
                  onClick={() => {
                    document.querySelector('[data-grid="ticket-grid"]')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'center'
                    });
                  }}
                  className="relative inline-flex items-center gap-3 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-yellow-500/30 transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/50 border-2 border-yellow-400/50"
                >
                  <Star className="w-6 h-6 animate-spin-slow" />
                  <span>Volver al Grid de Números</span>
                  <ArrowRight className="w-5 h-5 animate-bounce-gentle" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE PREMIOS - REUBICADA Y MEJORADA */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              <span className="text-yellow-400">UN SOLO GANADOR</span> • <span className="text-red-400">TRES PREMIOS</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              El afortunado ganador se llevará absolutamente todo. No dividimos premios, no hay segundo lugar. 
              <span className="text-yellow-400 font-bold"> ¡Todo es para una sola persona!</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Premio Principal - Silverado */}
            <div className="lg:col-span-2 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-sm rounded-3xl p-8 border border-yellow-500/30 hover:scale-105 transition-all duration-500 group">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/30 font-bold text-sm mb-6">
                  <Trophy className="w-4 h-4" />
                  <span>PREMIO PRINCIPAL</span>
                </div>
                
                <div className="relative mb-6">
                  <Image
                    src="/premios/premio-rifa.png"
                    alt="Silverado Z71 2024"
                    width={600}
                    height={300}
                    className="w-full rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-xl font-bold text-sm">
                    NUEVA 0KM
                  </div>
                </div>

                <h3 className="text-3xl font-black text-white mb-4">Chevrolet Silverado Z71 2024</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Motor V8 Potente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Tracción 4x4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Papeles Incluidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Seguro 1 Año</span>
                  </div>
                </div>
                <div className="text-2xl font-black text-yellow-400">Valor: $750,000 MXN</div>
              </div>
            </div>

            <div className="space-y-6">
              {/* PlayStation 5 */}
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30 hover:scale-105 transition-all duration-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎮</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">PlayStation 5</h3>
                  <p className="text-sm text-gray-400 mb-4">Consola nueva en caja</p>
                  <div className="text-lg font-black text-blue-400">Valor: $12,000 MXN</div>
                </div>
              </div>

              {/* Dinero en Efectivo */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 hover:scale-105 transition-all duration-500">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💵</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">$3,000 USD</h3>
                  <p className="text-sm text-gray-400 mb-4">En pesos mexicanos</p>
                  <div className="text-lg font-black text-green-400">Valor: $54,000 MXN</div>
                </div>
              </div>
            </div>
          </div>

          {/* Valor Total */}
          <div className="text-center mt-12">
            <div className="inline-block bg-gradient-to-r from-red-600/20 to-red-500/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
              <div className="text-sm text-gray-300 mb-2">VALOR TOTAL DE TODOS LOS PREMIOS</div>
              <div className="text-5xl font-black bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                $876,000 MXN
              </div>
              <div className="text-sm text-gray-400 mt-2">Para un solo ganador • Sin división de premios</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESO DE COMPRA EN 3 PASOS */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              PROCESO DE <span className="text-yellow-400">COMPRA</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Un proceso simple y seguro en solo 3 pasos. Tu dinero está protegido hasta el momento del sorteo.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Paso 1 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-sm rounded-3xl p-8 border border-yellow-500/30 hover:scale-105 transition-all duration-500 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-black text-black">1</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">SELECCIONA</h3>
                  <p className="text-gray-300 mb-6">
                    Elige tus números de la suerte desde 1 hasta 10,000. Puedes comprar desde 1 boleto.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
                    <Target className="w-4 h-4" />
                    <span>Selección instantánea</span>
                  </div>
                </div>
                {/* Línea conectora */}
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-yellow-500 to-gray-600"></div>
              </div>

              {/* Paso 2 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30 hover:scale-105 transition-all duration-500 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-black text-white">2</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">PAGA SEGURO</h3>
                  <p className="text-gray-300 mb-6">
                    Realiza tu pago con BanCoppel, Banco Azteca, OXXO o transferencia bancaria.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
                    <Shield className="w-4 h-4" />
                    <span>100% Seguro</span>
                  </div>
                </div>
                {/* Línea conectora */}
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-gray-600"></div>
              </div>

              {/* Paso 3 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30 hover:scale-105 transition-all duration-500 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl font-black text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">¡PARTICIPA!</h3>
                  <p className="text-gray-300 mb-6">
                    Recibe confirmación por WhatsApp y participa en el sorteo oficial.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirmación instantánea</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Final del Proceso */}
            <div className="text-center mt-12">
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-16 py-6 rounded-2xl font-black text-2xl shadow-2xl shadow-yellow-500/30 transition-all duration-300 hover:scale-105 hover:shadow-yellow-500/50 border-2 border-yellow-400/50"
              >
                <Zap className="w-8 h-8" />
                <span>COMENZAR AHORA</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CONFIANZA MEXICANA */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              <span className="text-green-400">TRANSPARENCIA</span> TOTAL
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Cumplimos con todas las regulaciones mexicanas para rifas y sorteos
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Certificaciones Principales */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              {/* Notario Público */}
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-4">Sorteo ante Notario Público</h3>
                    <p className="text-gray-300 mb-4">
                      El sorteo se realizará en presencia de un Notario Público certificado en México, 
                      garantizando la legalidad y transparencia del proceso.
                    </p>
                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      <span>Certificado Legal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transmisión en Vivo */}
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 backdrop-blur-sm rounded-3xl p-8 border border-red-500/30">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📺</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-4">Transmisión en Vivo</h3>
                    <p className="text-gray-300 mb-4">
                      Todo el proceso del sorteo será transmitido en vivo por Facebook e Instagram 
                      para que todos los participantes puedan ver el momento exacto.
                    </p>
                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                      <CheckCircle className="w-5 h-5" />
                      <span>100% Transparente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de Pago Mexicanos */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30 mb-12">
              <h3 className="text-3xl font-black text-white mb-8 text-center">
                Métodos de Pago <span className="text-blue-400">Mexicanos</span>
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="w-32 h-24 flex items-center justify-center mx-auto mb-4">
                    <Image
                      src="/logos/bancoppel.png"
                      alt="BanCoppel"
                      width={200}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-gray-800 font-bold text-sm">BanCoppel</div>
                  <div className="text-gray-600 text-xs">Transferencia</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="w-32 h-24 flex items-center justify-center mx-auto mb-4">
                    <Image
                      src="/logos/bancoazteca.png"
                      alt="Banco Azteca"
                      width={200}
                      height={140}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-gray-800 font-bold text-sm">Banco Azteca</div>
                  <div className="text-gray-600 text-xs">Depósito</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="w-32 h-24 flex items-center justify-center mx-auto mb-4">
                    <Image
                      src="/logos/oxxo.png"
                      alt="OXXO"
                      width={100}
                      height={60}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-gray-800 font-bold text-sm">OXXO</div>
                  <div className="text-gray-600 text-xs">Efectivo</div>
                </div>
                
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <div className="w-32 h-24 flex items-center justify-center mx-auto mb-4">
                    <Image
                      src="/logos/binance.svg"
                      alt="Binance"
                      width={300}
                      height={260}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-gray-800 font-bold text-sm">Binance Pay</div>
                  <div className="text-gray-600 text-xs">Crypto</div>
                </div>
              </div>
            </div>

            {/* Estadísticas de Confianza */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-yellow-400 mb-2">100%</div>
                <div className="text-white font-semibold mb-1">Legal</div>
                <div className="text-xs text-gray-500">Regulación mexicana</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-black text-green-400 mb-2">24/7</div>
                <div className="text-white font-semibold mb-1">Soporte</div>
                <div className="text-xs text-gray-500">WhatsApp disponible</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-black text-blue-400 mb-2">+5K</div>
                <div className="text-white font-semibold mb-1">Participantes</div>
                <div className="text-xs text-gray-500">En rifas anteriores</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-black text-red-400 mb-2">0</div>
                <div className="text-white font-semibold mb-1">Quejas</div>
                <div className="text-xs text-gray-500">Historial limpio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CON INFORMACIÓN LEGAL */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Logo y Descripción */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logos/Rifasilverado.png"
                  alt="Rifa Silverado"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-black text-xl text-white">RIFA SILVERADO</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Rifa legal y transparente de Chevrolet Silverado Z71 2024. 
                Sorteo ante Notario Público con transmisión en vivo.
              </p>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>Certificado Legal en México</span>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="font-black text-white text-lg mb-4">Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <span>📱</span>
                  <span>WhatsApp: +52 55 1234 5678</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <span>📧</span>
                  <span>info@rifasilverado.mx</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <span>📍</span>
                  <span>Ciudad de México, México</span>
                </div>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-black text-white text-lg mb-4">Información Legal</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <div>• Registro ante Hacienda</div>
                <div>• Cumplimiento CNBV</div>
                <div>• Notario Público certificado</div>
                <div>• Transmisión verificable</div>
                <div>• Política de privacidad</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 Rifa Silverado. Todos los derechos reservados.
              </p>
              <p className="text-gray-500 text-sm">
                Sorteo programado para cuando se completen todos los boletos.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modales */}
      <ComprehensivePurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
      
      {/* Live Activities */}
      <OrganicNotifications />
    </main>
  )
}