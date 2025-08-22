// ============================================================================
// SHOWCASE DEL PREMIO PRINCIPAL - DISEÑO PROFESIONAL PARA CONVERSIÓN
// ============================================================================

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

interface PrizeFeature {
  icon: string;
  title: string;
  description: string;
  highlight?: boolean;
}

// ============================================================================
// DATOS DEL PREMIO
// ============================================================================

const prizeFeatures: PrizeFeature[] = [
  {
    icon: '🚚',
    title: 'Chevrolet Silverado Z71 2024',
    description: 'Camioneta completamente nueva, 0 kilómetros',
    highlight: true
  },
  {
    icon: '⚡',
    title: 'PlayStation 5 Console',
    description: 'Consola de última generación incluida',
    highlight: false
  },
  {
    icon: '🛡️',
    title: '$3,000 USD en Efectivo',
    description: 'Dinero extra para tus gastos',
    highlight: false
  },
  {
    icon: '⭐',
    title: 'Papeles Incluidos',
    description: 'Factura, seguros y trámites legales',
    highlight: false
  },
  {
    icon: '🕒',
    title: 'Entrega Inmediata',
    description: 'Recibe tu premio en menos de 24 horas',
    highlight: false
  },
  {
    icon: '🏆',
    title: 'Sorteo Transparente',
    description: 'Transmisión en vivo con notario público',
    highlight: false
  }
];

const specifications = {
  engine: '5.3L EcoTec3 V8',
  power: '355 HP',
  torque: '383 lb-ft',
  transmission: '10-Speed Automatic',
  drivetrain: '4WD Z71',
  capacity: '5 pasajeros',
  bed: '6.5 ft bed',
  warranty: '3 años/60,000 km'
};


// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const PrizeShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'guarantee'>('overview');

  const formatSpecValue = (key: string, value: string) => {
    const labels: Record<string, string> = {
      engine: 'Motor',
      power: 'Potencia',
      torque: 'Torque',
      transmission: 'Transmisión',
      drivetrain: 'Tracción',
      capacity: 'Capacidad',
      bed: 'Caja',
      warranty: 'Garantía'
    };
    
    return { label: labels[key] || key, value };
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 py-12 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-yellow-500/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Header principal más compacto */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-6 py-2 rounded-full text-sm font-black mb-4 shadow-xl animate-pulse">
            🏆 PREMIO PRINCIPAL • VALOR $45,000 USD
          </div>
          
          <h2 className="text-3xl lg:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
              3 Premios en 1
            </span>
            <br />
            <span className="text-2xl lg:text-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
              Un Solo Ganador se Lleva TODO
            </span>
          </h2>
          
          <p className="text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            La rifa más grande de México. No hay segundo lugar, no hay consolación.
            <br />
            <span className="font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent text-lg">El ganador se lleva absolutamente todo.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Imagen única principal más compacta */}
          <div className="space-y-6">
            {/* Imagen principal con efectos mejorados */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl group transform hover:scale-[1.02] transition-all duration-500">
              <Image
                src="/premios/premio-rifa.png"
                alt="Chevrolet Silverado Z71 2024 - Premio Principal"
                fill
                className="object-cover transition-all duration-1000 group-hover:scale-110"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Overlay premium */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-70 transition-all duration-700">
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="bg-black/50 backdrop-blur-2xl border border-white/40 rounded-2xl px-4 py-3 shadow-2xl">
                    <h3 className="text-lg font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Chevrolet Silverado Z71 2024</h3>
                    <p className="text-sm mb-3 text-slate-200">Camioneta 0 km + PlayStation 5 + $3,000 USD en efectivo</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                        ✓ INCLUYE TODO
                      </div>
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-black shadow-lg">
                        $45,000 USD
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Badge flotante más pequeño */}
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-3 py-1 rounded-full font-black text-xs shadow-2xl animate-pulse border border-white/30">
                    🏆 PREMIO PRINCIPAL
                  </div>
                </div>
              </div>
              
              {/* Efectos de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1500"></div>
            </div>

            {/* Características destacadas más compactas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 border border-cyan-400/30 rounded-2xl p-4 text-center shadow-xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <div className="text-2xl mb-2">🚚</div>
                <div className="font-black text-white text-sm">Camioneta Nueva</div>
                <div className="text-cyan-100 text-xs mt-1">0 kilómetros</div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 border border-purple-400/30 rounded-2xl p-4 text-center shadow-xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <div className="text-2xl mb-2">🎮</div>
                <div className="font-black text-white text-sm">PlayStation 5</div>
                <div className="text-purple-100 text-xs mt-1">Consola incluida</div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 border border-green-400/30 rounded-2xl p-4 text-center shadow-xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <div className="text-2xl mb-2">💵</div>
                <div className="font-black text-white text-sm">$3,000 USD</div>
                <div className="text-green-100 text-xs mt-1">En efectivo</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-600 to-orange-600 border border-yellow-400/30 rounded-2xl p-4 text-center shadow-xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
                <div className="text-2xl mb-2">📄</div>
                <div className="font-black text-white text-sm">Todo Legal</div>
                <div className="text-yellow-100 text-xs mt-1">Papeles incluidos</div>
              </div>
            </div>
          </div>

          {/* Información del premio más compacta */}
          <div className="space-y-6">
            {/* Navegación por tabs más compacta */}
            <div className="flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-1 shadow-xl">
              {[
                { id: 'overview', label: '🎯 Resumen', active: activeTab === 'overview' },
                { id: 'specs', label: '⚙️ Especificaciones', active: activeTab === 'specs' },
                { id: 'guarantee', label: '🛡️ Garantías', active: activeTab === 'guarantee' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg font-bold transition-all duration-300 text-center text-sm',
                    tab.active 
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-xl transform scale-105' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido de tabs más compacto */}
            <div className="min-h-[300px] bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prizeFeatures.map((feature, index) => (
                      <div
                        key={feature.title}
                        className={cn(
                          'backdrop-blur-xl rounded-2xl p-6 shadow-2xl border transition-all duration-300 hover:shadow-3xl hover:scale-105',
                          feature.highlight 
                            ? 'border-yellow-400/50 bg-gradient-to-br from-yellow-500/20 to-orange-500/20' 
                            : 'border-white/30 bg-white/10 hover:bg-white/20'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            'w-12 h-12 rounded-lg flex items-center justify-center',
                            feature.highlight 
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                              : 'bg-blue-100 text-blue-600'
                          )}>
                            <span className="text-2xl">{feature.icon}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-black text-white mb-2 text-lg">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-blue-100 leading-relaxed">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Valor total destacado más compacto */}
                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-2xl p-6 text-center shadow-xl border border-white/20 backdrop-blur-xl">
                    <h3 className="text-xl font-black mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Valor Total del Premio</h3>
                    <div className="text-4xl lg:text-5xl font-black mb-4 drop-shadow-2xl">
                      $45,000
                      <span className="text-2xl font-bold"> USD</span>
                    </div>
                    <p className="text-sm mb-4 text-emerald-100 max-w-xl mx-auto leading-relaxed">
                      Incluye todos los trámites, impuestos, seguros y gastos de entrega completa
                    </p>
                    
                    {/* Información destacada del premio */}
                    <div className="mt-4 pt-4 border-t border-white/30">
                      <div className="text-center">
                        <div className="text-base font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
                          ✨ Entrega inmediata después del sorteo ✨
                        </div>
                        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2">
                          <span className="text-sm font-bold">31 de Diciembre 2024 • 8:00 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-8">
                  <div className="text-center mb-12">
                    <h3 className="text-4xl font-black text-white mb-6">
                      🚚 Especificaciones Técnicas
                    </h3>
                    <p className="text-xl text-blue-100">Conoce todos los detalles de tu futura Silverado Z71</p>
                  </div>
                  
                  {/* Grid mejorado de especificaciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(specifications).map(([key, value]) => {
                      const spec = formatSpecValue(key, value);
                      return (
                        <div
                          key={key}
                          className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-blue-200 font-bold text-xl">
                              {spec.label}
                            </span>
                            <span className="text-yellow-400 font-black text-2xl">
                              {spec.value}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Paquete Z71 destacado */}
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-6">
                      <h4 className="text-2xl font-black mb-2">
                        🏆 PAQUETE Z71 OFF-ROAD INCLUIDO
                      </h4>
                      <p className="text-blue-100">Equipamiento premium para cualquier terreno</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <h5 className="font-bold text-yellow-300 mb-3">⚒️ Suspensión & Control</h5>
                        <ul className="space-y-2 text-sm">
                          <li>• Suspensión Rancho twin-tube shocks</li>
                          <li>• Hill Descent Control</li>
                          <li>• Control de tracción avanzado</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                        <h5 className="font-bold text-green-300 mb-3">🛹 Llantas & Protección</h5>
                        <ul className="space-y-2 text-sm">
                          <li>• Llantas todo terreno Goodyear</li>
                          <li>• Protecciones de motor y transferencia</li>
                          <li>• Ganchos de recuperación delanteros</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'guarantee' && (
                <div className="space-y-8">
                  <h3 className="text-4xl font-black text-white mb-8 text-center">
                    🛡️ Garantías y Seguridades
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Sorteo Transparente',
                        description: 'Transmisión en vivo con notario público certificado',
                        icon: '📺'
                      },
                      {
                        title: 'Entrega Garantizada',
                        description: 'Premio entregado en máximo 24 horas después del sorteo',
                        icon: '🚚'
                      },
                      {
                        title: 'Documentos Legales',
                        description: 'Factura original, seguros y todos los trámites incluidos',
                        icon: '📋'
                      },
                      {
                        title: 'Garantía de Fábrica',
                        description: 'Garantía completa de Chevrolet por 3 años o 60,000 km',
                        icon: '🛡️'
                      },
                      {
                        title: 'Soporte Completo',
                        description: 'Asesoría completa para todos los trámites post-entrega',
                        icon: '🤝'
                      }
                    ].map((guarantee, index) => (
                      <div
                        key={index}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 hover:bg-white/20 hover:scale-105 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{guarantee.icon}</div>
                          <div>
                            <h4 className="font-black text-white mb-3 text-xl">
                              {guarantee.title}
                            </h4>
                            <p className="text-blue-100 leading-relaxed">
                              {guarantee.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h4 className="text-3xl font-black mb-4 text-center">
                      ✅ 100% Garantizado
                    </h4>
                    <p className="text-xl leading-relaxed text-center">
                      Tu tranquilidad es nuestra prioridad. Todos nuestros sorteos están 
                      respaldados por notario público y transmitidos en vivo para máxima transparencia.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeShowcase;