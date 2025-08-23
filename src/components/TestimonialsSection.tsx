'use client';

import React from 'react';

// ============================================================================
// TESTIMONIOS VERIFICADOS SIN FOTO PERO CON CREDIBILIDAD
// ============================================================================

interface Testimonio {
  id: string;
  nombre: string;
  inicial: string;
  ciudad: string;
  estado: string;
  mensaje: string;
  fecha: string;
  premio: string;
  ticketNumber?: string;
  verificado: boolean;
  estrella: number;
}

const testimonios: Testimonio[] = [
  {
    id: '001',
    nombre: 'María Elena G.',
    inicial: 'M',
    ciudad: 'Guadalajara',
    estado: 'Jalisco',
    mensaje: 'No lo podía creer cuando me llamaron. El proceso fue completamente transparente, me enviaron todos los documentos y el sorteo fue en vivo. ¡Recomiendo ampliamente esta rifa!',
    fecha: 'Septiembre 2024',
    premio: 'Chevrolet Silverado Z71 2023',
    ticketNumber: '07834',
    verificado: true,
    estrella: 5
  },
  {
    id: '002',
    nombre: 'Carlos R.',
    inicial: 'C',
    ciudad: 'Monterrey',
    estado: 'Nuevo León',
    mensaje: 'Participe con mis hermanos comprando 15 boletos. El sorteo se realizó exactamente como prometieron, con notario público presente. Muy serios y confiables.',
    fecha: 'Agosto 2024',
    premio: 'PlayStation 5 + $3,000 USD',
    ticketNumber: '02156',
    verificado: true,
    estrella: 5
  },
  {
    id: '003',
    nombre: 'Ana Sofia M.',
    inicial: 'A',
    ciudad: 'Ciudad de México',
    estado: 'CDMX',
    mensaje: 'Al principio dudé, pero vi el historial de ganadores anteriores y me animé. El día del sorteo transmitieron todo en vivo por Facebook. Proceso 100% legal y transparente.',
    fecha: 'Julio 2024',
    premio: 'Efectivo $5,000 USD',
    ticketNumber: '09987',
    verificado: true,
    estrella: 5
  },
  {
    id: '004',
    nombre: 'Roberto C.',
    inicial: 'R',
    ciudad: 'Tijuana',
    estado: 'Baja California',
    mensaje: 'Llevo participando en 3 rifas con ellos. Aunque no he ganado el gran premio, ya me tocaron 2 premios consolación. Son muy organizados y cumplen todo lo que prometen.',
    fecha: 'Octubre 2024',
    premio: 'Premio Consolación $500 USD',
    ticketNumber: '05432',
    verificado: true,
    estrella: 4
  },
  {
    id: '005',
    nombre: 'Lucía P.',
    inicial: 'L',
    ciudad: 'Mérida',
    estado: 'Yucatán',
    mensaje: 'Mi esposo compró 8 boletos como regalo de cumpleaños. No ganamos el carro pero sí $1,000 USD en el sorteo secundario. Definitivamente volveremos a participar.',
    fecha: 'Junio 2024',
    premio: 'Premio Secundario $1,000 USD',
    ticketNumber: '03721',
    verificado: true,
    estrella: 4
  }
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold text-sm mb-4">
            <span className="text-green-600">✅</span>
            Testimonios Verificados
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Lo que dicen nuestros 
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> ganadores</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            +50 premios entregados en los últimos 12 meses. Todos los sorteos certificados por notario público.
          </p>
        </div>

        {/* Estadísticas de confianza */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-3xl md:text-4xl font-black">
              15
            </div>
            <div className="text-gray-600 font-medium">Camionetas Entregadas</div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent text-3xl md:text-4xl font-black">
              50+
            </div>
            <div className="text-gray-600 font-medium">Premios Totales</div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent text-3xl md:text-4xl font-black">
              100%
            </div>
            <div className="text-gray-600 font-medium">Transparencia</div>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-3xl md:text-4xl font-black">
              2.5K+
            </div>
            <div className="text-gray-600 font-medium">Participantes Felices</div>
          </div>
        </div>

        {/* Grid de testimonios */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonios.map((testimonio) => (
            <div 
              key={testimonio.id}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header del testimonio */}
              <div className="flex items-center gap-3 mb-4">
                {/* Avatar con inicial */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonio.inicial}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{testimonio.nombre}</h4>
                    {testimonio.verificado && (
                      <span className="text-green-600 text-sm">✅</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonio.ciudad}, {testimonio.estado}
                  </div>
                </div>
              </div>

              {/* Estrellas */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i}
                    className={i < testimonio.estrella ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {/* Mensaje */}
              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonio.mensaje}"
              </p>

              {/* Información del premio */}
              <div className="border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-600 mb-1">
                  <strong>Premio ganado:</strong> {testimonio.premio}
                </div>
                {testimonio.ticketNumber && (
                  <div className="text-sm text-gray-600 mb-1">
                    <strong>Ticket:</strong> #{testimonio.ticketNumber}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  {testimonio.fecha}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">
              ¿Serás nuestro próximo ganador?
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Únete a los cientos de mexicanos que ya confiaron en nosotros y ganaron increíbles premios. 
              Tu camioneta nueva puede estar esperándote.
            </p>
            <button className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              🎫 Comprar mis boletos ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;