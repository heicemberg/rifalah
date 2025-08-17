// ============================================================================
// SHOWCASE DEL PREMIO PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { formatPrice, cn } from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  color: string;
}

// ============================================================================
// DATOS DE FEATURES
// ============================================================================

const PRIZE_FEATURES: FeatureItem[] = [
  {
    icon: '🆕',
    title: '0 KM',
    description: 'Vehículo completamente nuevo, directo de agencia',
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: '📋',
    title: 'Papeles Incluidos',
    description: 'Factura, placas, tenencia y seguro por 1 año',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: '⚖️',
    title: '100% Legal',
    description: 'Rifa autorizada con todas las garantías legales',
    color: 'from-purple-500 to-violet-600'
  },
  {
    icon: '📺',
    title: 'Transmisión en Vivo',
    description: 'Sorteo transparente transmitido en vivo',
    color: 'from-red-500 to-pink-600'
  }
];

// ============================================================================
// COMPONENTE DE MODAL FULLSCREEN
// ============================================================================

const ImageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}> = ({ isOpen, onClose, imageUrl, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 text-white hover:text-gray-300 transition-colors"
        aria-label="Cerrar imagen"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Imagen */}
      <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
          priority
        />
      </div>

      {/* Overlay clickeable para cerrar */}
      <div
        className="absolute inset-0 z-10"
        onClick={onClose}
        aria-hidden="true"
      />
    </div>
  );
};

// ============================================================================
// COMPONENTE DE FEATURE CARD
// ============================================================================

const FeatureCard: React.FC<{ feature: FeatureItem }> = ({ feature }) => {
  return (
    <div className="group relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Gradiente de fondo animado */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300',
        feature.color
      )} />
      
      <div className="relative p-6 text-center">
        {/* Icono */}
        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          {feature.icon}
        </div>
        
        {/* Título */}
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {feature.title}
        </h3>
        
        {/* Descripción */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Borde animado */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left',
        feature.color
      )} />
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PrizeShowcase: React.FC = () => {
  const { adminConfig } = useRaffleStore();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const scrollToTickets = useCallback(() => {
    const ticketsSection = document.getElementById('tickets-section');
    if (ticketsSection) {
      ticketsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  const openImageModal = useCallback(() => {
    setIsImageModalOpen(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setIsImageModalOpen(false);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden">
        {/* Background con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse" />
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-300" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse delay-700" />

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Columna izquierda - Información */}
            <div className="space-y-8">
              {/* Badge "PREMIO ÚNICO" */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                <span className="animate-pulse">⭐</span>
                PREMIO ÚNICO
                <span className="animate-pulse">⭐</span>
              </div>

              {/* Título */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                  {adminConfig.prizeTitle}
                </h1>
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600">
                    {formatPrice(adminConfig.prizeValue)}
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Valor comercial
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  ¡Gana esta increíble <strong>Chevrolet Silverado Z71 2024</strong> completamente nueva! 
                  Una pick-up de lujo con la mejor tecnología y rendimiento del mercado.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Motor V8 6.2L</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Tracción 4x4</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Cabina Crew Cab</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Paquete Z71</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="space-y-4">
                <button
                  onClick={scrollToTickets}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
                  
                  <span className="text-2xl">🎫</span>
                  <span>¡Comprar Boletos Ahora!</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Boletos disponibles - Sorteo el 31 de Diciembre
                </p>
              </div>
            </div>

            {/* Columna derecha - Imagen */}
            <div className="relative group">
              {/* Container de imagen */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-white p-4">
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={adminConfig.prizeImage}
                    alt={adminConfig.prizeTitle}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                    priority
                    onClick={openImageModal}
                  />
                  
                  {/* Overlay para zoom */}
                  <div
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 cursor-pointer flex items-center justify-center"
                    onClick={openImageModal}
                  >
                    <div className="bg-white bg-opacity-90 text-gray-800 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        <span className="text-sm font-medium">Ver imagen completa</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge flotante */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-12 animate-pulse">
                ¡NUEVO!
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Features */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Título de sección */}
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              ¿Por qué esta rifa es diferente?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Garantías que nos respaldan y hacen de esta la rifa más confiable del mercado
            </p>
          </div>

          {/* Grid de features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRIZE_FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 200}ms`,
                  animationFillMode: 'backwards'
                }}
              >
                <FeatureCard feature={feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de imagen */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        imageUrl={adminConfig.prizeImage}
        title={adminConfig.prizeTitle}
      />

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </>
  );
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

PrizeShowcase.displayName = 'PrizeShowcase';

export default PrizeShowcase;