'use client';

import React from 'react';
import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
            ← Volver a la rifa
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-gray-600 text-lg">
            Rifa Chevrolet Silverado Z71 2024 - Sorteo Legal
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Última actualización: 23 de agosto de 2025
          </div>
        </div>

        {/* Contenido legal */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* 1. Información General */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              1. Información General del Sorteo
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Organizador:</strong> Rifas Silverado México S.A. de C.V.<br/>
                <strong>RFC:</strong> RSM240801ABC<br/>
                <strong>Domicilio:</strong> Av. Reforma 123, Col. Centro, CDMX, C.P. 06000<br/>
                <strong>Teléfono:</strong> +52 55 1234-5678<br/>
                <strong>Email:</strong> contacto@rifa-silverado.mx
              </p>
              <p>
                <strong>Tipo de Sorteo:</strong> Promocional comercial con fines de entretenimiento<br/>
                <strong>Registro PROFECO:</strong> #RIF-2024-MX-001<br/>
                <strong>Autorización Fiscal:</strong> Vigente según Art. 15-A del CFF
              </p>
            </div>
          </section>

          {/* 2. Del Premio */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              2. Descripción del Premio Principal
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Premio Principal:</strong> Una (1) Chevrolet Silverado Z71 2024, modelo Crew Cab, 
                motor V8 de 5.3L, transmisión automática, color a elección del ganador entre los disponibles 
                en concesionario.
              </p>
              <p>
                <strong>Valor aproximado:</strong> $45,000 USD (Cuarenta y cinco mil dólares americanos)<br/>
                <strong>Premios adicionales:</strong> 1 PlayStation 5 + $3,000 USD en efectivo
              </p>
              <p>
                <strong>Incluye:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Vehículo nuevo sin kilometraje</li>
                <li>Factura original a nombre del ganador</li>
                <li>Tarjeta de circulación tramitada</li>
                <li>Póliza de seguro por 1 año</li>
                <li>Manual del propietario y llaves</li>
                <li>Garantía de agencia autorizada</li>
              </ul>
              <p>
                <strong>No incluye:</strong> Tenencia, verificación, placas personalizadas, 
                accesorios adicionales no originales, gastos de traslado fuera de la CDMX.
              </p>
            </div>
          </section>

          {/* 3. Participación */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              3. Condiciones de Participación
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p><strong>3.1 Elegibilidad</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Personas físicas mayores de 18 años</li>
                <li>Residentes de México con identificación oficial vigente</li>
                <li>Una sola participación por persona física</li>
                <li>Prohibido para empleados del organizador y familiares directos</li>
              </ul>
              
              <p><strong>3.2 Mecánica del Sorteo</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Total de boletos: 10,000 (numerados del 0001 al 10000)</li>
                <li>Precio por boleto: $10 USD (equivalente en MXN al tipo de cambio vigente)</li>
                <li>Descuentos por volumen aplicables según tabla de precios</li>
                <li>Asignación de números al confirmar la compra por el administrador</li>
                <li>Un participante puede adquirir múltiples boletos</li>
              </ul>

              <p><strong>3.3 Métodos de Pago Aceptados</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>OXXO (depósito en efectivo)</li>
                <li>Transferencia bancaria BanCoppel</li>
                <li>Transferencia bancaria Banco Azteca</li>
                <li>Binance Pay (criptomonedas)</li>
                <li>Otros métodos previamente autorizados</li>
              </ul>
            </div>
          </section>

          {/* 4. Del Sorteo */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              4. Realización del Sorteo
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p><strong>4.1 Fecha y Hora</strong></p>
              <p>
                El sorteo se realizará el día <strong>24 de noviembre de 2025 a las 20:00 horas</strong> 
                (hora del centro de México), o cuando se agoten la totalidad de los boletos, 
                lo que ocurra primero.
              </p>
              
              <p><strong>4.2 Lugar y Transmisión</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Lugar físico: Notaría Pública #47, CDMX</li>
                <li>Transmisión en vivo: Facebook e Instagram oficial</li>
                <li>Presencia de Notario Público certificado</li>
                <li>Grabación completa del evento para constancia</li>
              </ul>

              <p><strong>4.3 Metodología</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Sistema aleatorio supervisado por notario</li>
                <li>Boletos físicos en urna sellada</li>
                <li>Extracción pública y transparente</li>
                <li>Acta notarial del resultado</li>
              </ul>
            </div>
          </section>

          {/* 5. Del Ganador */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              5. Determinación y Obligaciones del Ganador
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p><strong>5.1 Notificación</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Contacto inmediato por teléfono y WhatsApp registrados</li>
                <li>Plazo máximo para responder: 7 días naturales</li>
                <li>Confirmación de identidad requerida</li>
                <li>En caso de no responder, se selecciona suplente</li>
              </ul>

              <p><strong>5.2 Documentos Requeridos</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Identificación oficial vigente (INE, pasaporte)</li>
                <li>CURP actualizado</li>
                <li>Comprobante de domicilio (no mayor a 3 meses)</li>
                <li>RFC para efectos fiscales</li>
                <li>Acta de nacimiento certificada</li>
              </ul>

              <p><strong>5.3 Entrega del Premio</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Plazo máximo: 15 días hábiles posterior al sorteo</li>
                <li>Lugar: Agencia Chevrolet autorizada en CDMX</li>
                <li>Gastos de traslado fuera de CDMX a cuenta del ganador</li>
                <li>Firma de recibo y deslinde de responsabilidades</li>
              </ul>
            </div>
          </section>

          {/* 6. Aspectos Fiscales */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              6. Obligaciones Fiscales
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p><strong>6.1 Impuestos</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>ISR aplicable conforme a la LISR vigente</li>
                <li>Retención del 21% sobre el valor del premio</li>
                <li>Constancia de retenciones entregada al ganador</li>
                <li>Ganador responsable de declaración anual</li>
              </ul>

              <p><strong>6.2 Valor Fiscal</strong></p>
              <p>
                El valor del premio para efectos fiscales será el valor comercial 
                del vehículo según factura del concesionario, más accesorios incluidos.
              </p>
            </div>
          </section>

          {/* 7. Cancelación y Devoluciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              7. Cancelación y Devoluciones
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p><strong>7.1 Cancelación del Sorteo</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Si no se venden mínimo 8,000 boletos al 20 de noviembre de 2025</li>
                <li>Por causa de fuerza mayor o caso fortuito</li>
                <li>Por disposición de autoridad competente</li>
              </ul>

              <p><strong>7.2 Devoluciones</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Reembolso del 100% del dinero pagado</li>
                <li>Plazo de devolución: 30 días hábiles</li>
                <li>Método: Mismo utilizado para el pago original</li>
                <li>Sin penalizaciones ni deducciones</li>
              </ul>
            </div>
          </section>

          {/* 8. Limitaciones */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              8. Limitaciones de Responsabilidad
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <ul className="list-disc list-inside space-y-2">
                <li>El organizador no se responsabiliza por problemas técnicos, fallas del sistema o interrupciones del servicio</li>
                <li>No hay responsabilidad por pérdida de datos o transacciones incompletas por causas ajenas</li>
                <li>El premio se entrega "tal como está" según especificaciones del fabricante</li>
                <li>No se otorgan premios en efectivo equivalente al valor del vehículo</li>
                <li>Los gastos posteriores (gasolina, mantenimiento, seguros adicionales) son responsabilidad del ganador</li>
              </ul>
            </div>
          </section>

          {/* 9. Privacidad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              9. Protección de Datos Personales
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                El organizador se compromete a proteger los datos personales conforme a la 
                Ley Federal de Protección de Datos Personales en Posesión de Particulares. 
                Los datos serán utilizados únicamente para:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Administración del sorteo y contacto con participantes</li>
                <li>Cumplimiento de obligaciones fiscales y legales</li>
                <li>Envío de información relacionada con el sorteo</li>
                <li>Fines estadísticos internos</li>
              </ul>
              <p>
                Consulte nuestro <Link href="/privacidad" className="text-blue-600 hover:text-blue-800 underline">
                Aviso de Privacidad completo</Link> para más información.
              </p>
            </div>
          </section>

          {/* 10. Disposiciones Generales */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-blue-500 pb-2">
              10. Disposiciones Generales
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p><strong>10.1 Jurisdicción</strong></p>
              <p>
                Para cualquier controversia derivada de estos términos, las partes se someten 
                expresamente a la jurisdicción de los Tribunales de la Ciudad de México, 
                renunciando a cualquier otro fuero que pudiera corresponderles.
              </p>

              <p><strong>10.2 Modificaciones</strong></p>
              <p>
                El organizador se reserva el derecho de modificar estos términos, notificando 
                los cambios con al menos 15 días de anticipación a través del sitio web oficial.
              </p>

              <p><strong>10.3 Separabilidad</strong></p>
              <p>
                Si alguna disposición de estos términos fuera declarada inválida o inaplicable, 
                las demás disposiciones permanecerán en pleno vigor y efecto.
              </p>

              <p><strong>10.4 Contacto</strong></p>
              <p>
                Para dudas, aclaraciones o quejas relacionadas con el sorteo:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>WhatsApp:</strong> +52 55 1234-5678</p>
                <p><strong>Email:</strong> contacto@rifa-silverado.mx</p>
                <p><strong>Horario:</strong> Lunes a Viernes 9:00 - 18:00 hrs</p>
                <p><strong>PROFECO:</strong> 01 800 468 8722</p>
              </div>
            </div>
          </section>

          {/* Aceptación */}
          <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-3">
              Aceptación de Términos
            </h3>
            <p className="text-blue-800 leading-relaxed">
              Al participar en este sorteo, el usuario acepta expresamente todos los términos 
              y condiciones aquí establecidos, así como las políticas de privacidad de la empresa organizadora. 
              La compra de boletos constituye la aceptación plena de estas condiciones.
            </p>
          </section>

        </div>

        {/* Footer de navegación */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
          >
            🎫 Participar en la Rifa
          </Link>
          <div className="mt-4 text-sm text-gray-500">
            <Link href="/privacidad" className="hover:text-blue-600 mx-2">Aviso de Privacidad</Link> |
            <Link href="/contacto" className="hover:text-blue-600 mx-2">Contacto</Link> |
            <Link href="/" className="hover:text-blue-600 mx-2">Inicio</Link>
          </div>
        </div>

      </div>
    </div>
  );
}