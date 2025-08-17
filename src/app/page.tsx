// ============================================================================
// PÁGINA PRINCIPAL DE LA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Importar componentes de prompts 5-12
import PrizeShowcase from '../components/PrizeShowcase';
import UrgencyCounters from '../components/UrgencyCounters';
import StatsBar from '../components/StatsBar';
import QuickSelect from '../components/QuickSelect';
import TicketGrid from '../components/TicketGrid';
import LiveNotifications from '../components/LiveNotifications';
import PaymentModal from '../components/PaymentModal';

// Importar hooks y utilidades
import { useRaffleStore } from '../stores/raffle-store';
import { useRealtime } from '../lib/realtime';
import { useSounds } from '../components/SoundEffects';
import { formatPrice, cn } from '../lib/utils';

// Lazy load para componentes pesados
const RealtimeDebugPanel = dynamic(
  () => import('../lib/realtime').then(mod => ({ default: mod.RealtimeDebugPanel })),
  { ssr: false }
);

// ============================================================================
// COMPONENTE FAQ
// ============================================================================

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cuánto cuesta un boleto?",
      answer: "Cada boleto individual cuesta $50 MXN. Sin embargo, ofrecemos descuentos por volumen: 5 boletos por $225 (10% OFF), 10 boletos por $400 (20% OFF), 25 boletos por $750 (25% OFF), y 50 boletos por $1,400 (30% OFF)."
    },
    {
      question: "¿Cuándo es el sorteo?",
      answer: "El sorteo se realizará el 31 de Diciembre de 2024 a las 8:00 PM (hora de México, CST). Será transmitido completamente en vivo para garantizar total transparencia."
    },
    {
      question: "¿La rifa es legal y confiable?",
      answer: "Absolutamente sí. Nuestra rifa está completamente autorizada y cumple con todas las regulaciones mexicanas. Contamos con todos los permisos necesarios y el sorteo será supervisado por autoridades competentes."
    },
    {
      question: "¿Qué incluye el premio?",
      answer: "El ganador recibirá una Chevrolet Silverado Z71 2024 completamente nueva (0 KM) con todos los papeles incluidos: factura, placas, tenencia al día y seguro por 1 año completo."
    },
    {
      question: "¿Cómo puedo pagar mis boletos?",
      answer: "Aceptamos múltiples métodos de pago: transferencias bancarias (BanCoppel, Banco Azteca), depósitos en OXXO, y Binance Pay para pagos con criptomonedas."
    },
    {
      question: "¿Puedo participar desde cualquier parte de México?",
      answer: "¡Por supuesto! Pueden participar personas de toda la República Mexicana. El premio puede ser entregado en cualquier estado del país."
    },
    {
      question: "¿Qué pasa si no se venden todos los boletos?",
      answer: "El sorteo se realizará independientemente del número de boletos vendidos. Mientras más boletos queden disponibles, mayores serán tus probabilidades de ganar."
    },
    {
      question: "¿Cómo sabré si gané?",
      answer: "Te contactaremos inmediatamente por WhatsApp y correo electrónico. También publicaremos el resultado en nuestras redes sociales y en esta página web."
    }
  ];

  const toggleFAQ = useCallback((index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  }, [openIndex]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Resolvemos todas tus dudas sobre la rifa más emocionante del año
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-800">
                  {faq.question}
                </span>
                <svg
                  className={cn(
                    'w-5 h-5 text-gray-500 transition-transform duration-300',
                    { 'rotate-180': openIndex === index }
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 animate-fade-in-up">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// COMPONENTE TRUST SECTION
// ============================================================================

const TrustSection: React.FC = () => {
  const trustItems = [
    {
      icon: '🏛️',
      title: 'Totalmente Legal',
      description: 'Rifa autorizada y regulada por las autoridades mexicanas'
    },
    {
      icon: '📺',
      title: 'Transmisión en Vivo',
      description: 'Sorteo completamente transparente y público'
    },
    {
      icon: '🔒',
      title: 'Pagos Seguros',
      description: 'Múltiples métodos de pago confiables y verificados'
    },
    {
      icon: '✅',
      title: 'Garantía Total',
      description: 'Premio garantizado con todos los papeles incluidos'
    },
    {
      icon: '📱',
      title: 'Soporte 24/7',
      description: 'Atención al cliente disponible en todo momento'
    },
    {
      icon: '🎯',
      title: 'Sin Letra Chica',
      description: 'Términos y condiciones claros y transparentes'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            ¿Por qué confiar en nosotros?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Somos la plataforma de rifas más confiable de México
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4 text-center">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                {item.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// COMPONENTE CTA FLOTANTE
// ============================================================================

const FloatingCTA: React.FC<{
  selectedCount: number;
  totalPrice: number;
  onOpenPayment: () => void;
}> = ({ selectedCount, totalPrice, onOpenPayment }) => {
  const { playSound } = useSounds();

  const handleClick = useCallback(() => {
    playSound('click');
    onOpenPayment();
  }, [playSound, onOpenPayment]);

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 animate-bounce-in">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-6 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <button
          onClick={handleClick}
          className="flex items-center gap-4"
        >
          <div className="text-center">
            <div className="text-sm opacity-90">
              {selectedCount} boleto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </div>
            <div className="text-lg font-bold">
              {formatPrice(totalPrice)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">Proceder al Pago</span>
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HomePage() {
  // Estado del store
  const {
    selectedTickets,
    totalSelected,
    totalPrice,
    availableTickets,
    soldPercentage,
    initializeTickets
  } = useRaffleStore();

  // Hooks de funcionalidad
  const { start: startRealtime, getState } = useRealtime();
  const { playSound } = useSounds();

  // Estado local
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicialización
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Inicializar tickets
        initializeTickets();
        
        // Inicializar realtime simulator
        startRealtime();
        
        // Pequeña pausa para mejor UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoading(false);
        
        // Sonido de bienvenida
        setTimeout(() => {
          playSound('notification');
        }, 500);
        
      } catch (error) {
        console.error('Error inicializando aplicación:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [initializeTickets, startRealtime, playSound]);

  // Handlers
  const openPaymentModal = useCallback(() => {
    if (totalSelected > 0) {
      setIsPaymentModalOpen(true);
      playSound('click');
    }
  }, [totalSelected, playSound]);

  const closePaymentModal = useCallback(() => {
    setIsPaymentModalOpen(false);
    playSound('click');
  }, [playSound]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      playSound('click');
    }
  }, [playSound]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando rifa...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section - Prize Showcase */}
      <section id="hero-section">
        <PrizeShowcase />
      </section>

      {/* Stats y Urgency Section */}
      <section id="stats-section" className="py-12 bg-white">
        <div className="container mx-auto px-4 space-y-8">
          <UrgencyCounters />
          <StatsBar />
        </div>
      </section>

      {/* Quick Select Section */}
      <section id="quick-select-section" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              🎯 Elige tus Boletos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Selecciona la cantidad de boletos que quieres comprar y aprovecha nuestros descuentos
            </p>
          </div>
          <QuickSelect />
        </div>
      </section>

      {/* Ticket Grid Section */}
      <section id="tickets-section" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              🎫 Selecciona tus Números de la Suerte
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Haz clic en los boletos para seleccionarlos. Quedan {availableTickets.length.toLocaleString()} boletos disponibles
            </p>
            
            {/* Progress indicator */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progreso de ventas</span>
                <span>{soldPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={cn(
                    'h-3 rounded-full transition-all duration-1000',
                    {
                      'bg-gradient-to-r from-green-500 to-blue-500': soldPercentage < 75,
                      'bg-gradient-to-r from-orange-500 to-red-500': soldPercentage >= 75,
                      'animate-pulse-soft': soldPercentage >= 90
                    }
                  )}
                  style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
          
          <TicketGrid />
          
          {/* Resumen de selección */}
          {totalSelected > 0 && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-purple-800 mb-2">
                  📋 Resumen de tu Selección
                </h3>
                <div className="space-y-2 text-purple-700">
                  <div>Boletos seleccionados: <strong>{totalSelected}</strong></div>
                  <div>Total a pagar: <strong>{formatPrice(totalPrice)}</strong></div>
                  {totalSelected > 1 && (
                    <div className="text-sm">
                      Precio por boleto: {formatPrice(Math.round(totalPrice / totalSelected))}
                    </div>
                  )}
                </div>
                <button
                  onClick={openPaymentModal}
                  className="mt-4 w-full btn-primary"
                >
                  🚀 Proceder al Pago
                </button>
              </div>
            </div>
          )}
          
          {/* Empty state */}
          {totalSelected === 0 && (
            <div className="mt-8 text-center text-gray-500">
              <p className="mb-4">👆 Selecciona tus boletos de arriba o usa la selección rápida</p>
              <button
                onClick={() => scrollToSection('quick-select-section')}
                className="btn-secondary"
              >
                ⚡ Ir a Selección Rápida
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <TrustSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            🏆 ¡No te quedes sin tu oportunidad!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Quedan {availableTickets.length.toLocaleString()} boletos disponibles
          </p>
          <button
            onClick={() => scrollToSection('tickets-section')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors hover:scale-105 transform duration-200"
          >
            🎫 Comprar Boletos Ahora
          </button>
        </div>
      </section>

      {/* Componentes flotantes */}
      <LiveNotifications />
      
      <FloatingCTA
        selectedCount={totalSelected}
        totalPrice={totalPrice}
        onOpenPayment={openPaymentModal}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
      />

      {/* Debug Panel (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && <RealtimeDebugPanel />}
    </main>
  );
}