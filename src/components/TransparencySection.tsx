'use client';

import React, { useState } from 'react';

// ============================================================================
// SECCIÓN DE TRANSPARENCIA Y GARANTÍAS
// ============================================================================

interface GarantiaItem {
  id: string;
  icono: string;
  titulo: string;
  descripcion: string;
  detalles?: string;
}

interface ProcesoItem {
  numero: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

const garantias: GarantiaItem[] = [
  {
    id: 'notario',
    icono: '🏛️',
    titulo: 'Certificado por Notario',
    descripcion: 'Todos nuestros sorteos son supervisados y certificados por Notario Público registrado.',
    detalles: 'Lic. María Fernanda Reyes - Notaría Pública #47, CDMX. Registro: NOT-47-CDMX-2024'
  },
  {
    id: 'transmision',
    icono: '📺',
    titulo: 'Transmisión en Vivo',
    descripcion: 'El sorteo se transmite en vivo por Facebook e Instagram para máxima transparencia.',
    detalles: 'Fecha: 24 de Noviembre 2025, 8:00 PM hora México. Links de transmisión enviados por WhatsApp.'
  },
  {
    id: 'legal',
    icono: '⚖️',
    titulo: '100% Legal',
    descripcion: 'Cumplimos con todas las regulaciones mexicanas para sorteos y promociones comerciales.',
    detalles: 'Registro ante PROFECO: #RIF-2024-MX-001. Licencia comercial vigente 2024-2025.'
  },
  {
    id: 'entrega',
    icono: '🚚',
    titulo: 'Entrega Garantizada',
    descripcion: 'El premio se entrega máximo 15 días después del sorteo, con todos los documentos legales.',
    detalles: 'Incluye factura, tarjeta de circulación, póliza de seguro y transferencia notarial.'
  },
  {
    id: 'devolucion',
    icono: '💰',
    titulo: 'Garantía de Devolución',
    descripcion: 'Si no se completa el mínimo de boletos, devolvemos 100% del dinero.',
    detalles: 'Mínimo: 8,000 boletos vendidos. Si no se alcanza, reembolso automático en 7 días hábiles.'
  },
  {
    id: 'soporte',
    icono: '📞',
    titulo: 'Soporte 24/7',
    descripcion: 'Atención personalizada antes, durante y después del sorteo por WhatsApp y teléfono.',
    detalles: 'WhatsApp: +52 55 1234-5678. Teléfono: 800-RIFA-24 (800-743-224)'
  }
];

const procesoSorteo: ProcesoItem[] = [
  {
    numero: 1,
    titulo: 'Compra Segura',
    descripcion: 'Selecciona tus boletos favoritos y paga mediante OXXO, transferencia o Binance Pay.',
    icono: '🛒'
  },
  {
    numero: 2,
    titulo: 'Confirmación',
    descripcion: 'Recibe tu confirmación por WhatsApp con los números de tus boletos asignados.',
    icono: '✅'
  },
  {
    numero: 3,
    titulo: 'Sorteo Público',
    descripcion: 'El 24 de noviembre, sorteo en vivo con notario público presente y transmisión online.',
    icono: '🎲'
  },
  {
    numero: 4,
    titulo: 'Verificación',
    descripcion: 'El ganador es contactado inmediatamente y se verifica su identidad oficialmente.',
    icono: '🔍'
  },
  {
    numero: 5,
    titulo: 'Entrega Legal',
    descripcion: 'Entrega del premio con todos los documentos legales en un máximo de 15 días.',
    icono: '🏆'
  }
];

const TransparencySection: React.FC = () => {
  const [activeGarantia, setActiveGarantia] = useState<string | null>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full font-semibold text-sm mb-6 border border-green-500/30">
            <span className="text-green-400">🛡️</span>
            Transparencia Total
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            ¿Por qué puedes 
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"> confiar en nosotros?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Llevamos más de 3 años organizando sorteos certificados. Cada paso está regulado, 
            documentado y supervisado por autoridades competentes.
          </p>
        </div>

        {/* Garantías Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {garantias.map((garantia) => (
            <div 
              key={garantia.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300 cursor-pointer"
              onClick={() => setActiveGarantia(activeGarantia === garantia.id ? null : garantia.id)}
            >
              <div className="text-4xl mb-4">{garantia.icono}</div>
              <h3 className="text-xl font-bold text-white mb-3">{garantia.titulo}</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">{garantia.descripcion}</p>
              
              {activeGarantia === garantia.id && garantia.detalles && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mt-4">
                  <p className="text-green-200 text-sm">{garantia.detalles}</p>
                </div>
              )}
              
              <div className="text-green-400 text-sm font-medium">
                {activeGarantia === garantia.id ? '▲ Ocultar detalles' : '▼ Ver detalles'}
              </div>
            </div>
          ))}
        </div>

        {/* Proceso del sorteo */}
        <div className="mb-16">
          <h3 className="text-3xl font-black text-center text-white mb-12">
            Proceso del Sorteo 
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Paso a Paso</span>
          </h3>
          
          <div className="grid md:grid-cols-5 gap-6">
            {procesoSorteo.map((paso, index) => (
              <div key={paso.numero} className="relative">
                {/* Línea conectora */}
                {index < procesoSorteo.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform translate-x-0"></div>
                )}
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {paso.numero}
                  </div>
                  <div className="text-3xl mb-3">{paso.icono}</div>
                  <h4 className="text-lg font-bold text-white mb-3">{paso.titulo}</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificaciones y logos */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h4 className="text-2xl font-bold text-center text-white mb-8">Avalados Por:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-white">⚖️</div>
              </div>
              <div className="text-sm text-gray-300">PROFECO</div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-white">🏛️</div>
              </div>
              <div className="text-sm text-gray-300">Notaría Pública</div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-white">🏦</div>
              </div>
              <div className="text-sm text-gray-300">CONDUSEF</div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 rounded-lg p-4 mb-2">
                <div className="text-2xl font-bold text-white">🔒</div>
              </div>
              <div className="text-sm text-gray-300">SSL Certificado</div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 border border-green-400/30">
            <h3 className="text-2xl font-bold text-white mb-4">
              🛡️ Compra con Confianza Total
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Más de 15 camionetas entregadas, +2,500 participantes satisfechos y 0 quejas registradas. 
              Tu tranquilidad es nuestra prioridad.
            </p>
            <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
              🎫 Participar Ahora Mismo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencySection;