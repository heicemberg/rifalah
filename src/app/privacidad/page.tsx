'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
            ← Volver a la rifa
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Aviso de Privacidad
          </h1>
          <p className="text-gray-600 text-lg">
            Protección de Datos Personales - Rifa Silverado Z71 2024
          </p>
          <div className="text-sm text-gray-500 mt-2">
            Última actualización: 23 de agosto de 2025
          </div>
        </div>

        {/* Contenido del aviso */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          
          {/* Responsable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              1. Responsable del Tratamiento de Datos
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                <strong>Denominación:</strong> Rifas Silverado México S.A. de C.V.<br/>
                <strong>RFC:</strong> RSM240801ABC<br/>
                <strong>Domicilio:</strong> Av. Reforma 123, Col. Centro, Ciudad de México, C.P. 06000<br/>
                <strong>Teléfono:</strong> +52 55 1234-5678<br/>
                <strong>Email de contacto:</strong> privacidad@rifa-silverado.mx<br/>
                <strong>Departamento de Datos Personales:</strong> Lic. María Fernández González
              </p>
              <p>
                Rifas Silverado México S.A. de C.V. (en adelante &quot;Rifas Silverado&quot;, &quot;nosotros&quot; o &quot;la empresa&quot;) 
                es responsable del uso y protección de sus datos personales, en términos de la 
                Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
              </p>
            </div>
          </section>

          {/* Datos que recopilamos */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              2. Datos Personales que Recopilamos
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              
              <p><strong>2.1 Datos de Identificación</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Nombre completo</li>
                <li>Apellidos paterno y materno</li>
                <li>Fecha de nacimiento</li>
                <li>Nacionalidad</li>
                <li>CURP (Clave Única de Registro de Población)</li>
                <li>RFC (Registro Federal de Contribuyentes)</li>
              </ul>

              <p><strong>2.2 Datos de Contacto</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Dirección postal completa</li>
                <li>Ciudad y estado de residencia</li>
                <li>Código postal</li>
                <li>Número telefónico fijo</li>
                <li>Número de teléfono celular</li>
                <li>Dirección de correo electrónico</li>
              </ul>

              <p><strong>2.3 Datos Patrimoniales y Financieros</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Información de métodos de pago utilizados</li>
                <li>Datos de transferencias bancarias (solo números de referencia)</li>
                <li>Comprobantes de pago subidos voluntariamente</li>
                <li>Historial de transacciones del sorteo</li>
              </ul>

              <p><strong>2.4 Datos Técnicos</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Dirección IP</li>
                <li>Tipo de navegador web</li>
                <li>Sistema operativo</li>
                <li>Cookies y tecnologías similares</li>
                <li>Fecha y hora de acceso</li>
                <li>Páginas visitadas en nuestro sitio</li>
              </ul>

              <p><strong>2.5 Datos Sensibles (Solo si son proporcionados voluntariamente)</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Información de salud relacionada con la entrega del premio</li>
                <li>Datos relacionados con limitaciones físicas para la entrega</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <p className="text-yellow-800">
                  <strong>Importante:</strong> Los datos sensibles solo se recopilan con su consentimiento 
                  expreso cuando sea estrictamente necesario para la entrega del premio.
                </p>
              </div>
            </div>
          </section>

          {/* Finalidades */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              3. Finalidades del Tratamiento
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              
              <p><strong>3.1 Finalidades Primarias (Necesarias para la relación)</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Administrar su participación en el sorteo</li>
                <li>Procesar pagos y validar transacciones</li>
                <li>Asignar números de boletos comprados</li>
                <li>Contactarle en caso de resultar ganador</li>
                <li>Verificar su identidad para entrega de premios</li>
                <li>Cumplir con obligaciones fiscales (emisión de comprobantes)</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Brindar soporte y atención al cliente</li>
                <li>Enviar comunicaciones relacionadas con el sorteo</li>
              </ul>

              <p><strong>3.2 Finalidades Secundarias (Requieren su consentimiento)</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Envío de información sobre futuros sorteos y promociones</li>
                <li>Invitaciones a eventos especiales</li>
                <li>Encuestas de satisfacción</li>
                <li>Análisis estadístico y estudios de mercado</li>
                <li>Mejora de nuestros servicios y sitio web</li>
                <li>Marketing directo y publicidad personalizada</li>
              </ul>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-800">
                  <strong>Su consentimiento:</strong> Puede otorgar o negar su consentimiento para las 
                  finalidades secundarias. Su negativa no impedirá su participación en el sorteo.
                </p>
              </div>
            </div>
          </section>

          {/* Consentimiento */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              4. Consentimiento para el Tratamiento
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Su consentimiento para el tratamiento de datos personales se entiende otorgado:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Al completar el formulario de participación</li>
                <li>Al proporcionar sus datos para la compra de boletos</li>
                <li>Al aceptar los términos y condiciones del sorteo</li>
                <li>Al continuar navegando en nuestro sitio web después de leer este aviso</li>
              </ul>
              
              <p><strong>Consentimiento para finalidades secundarias:</strong></p>
              <p>
                Durante el proceso de registro, se le preguntará específicamente si desea recibir 
                información promocional. Puede cambiar sus preferencias en cualquier momento.
              </p>
            </div>
          </section>

          {/* Transferencias */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              5. Transferencias de Datos
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Sus datos personales pueden ser compartidos con terceros únicamente en los siguientes casos:
              </p>
              
              <p><strong>5.1 Transferencias que Requieren su Consentimiento</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan con pagos, envíos y tecnología</li>
                <li><strong>Socios comerciales:</strong> Para futuros sorteos colaborativos</li>
                <li><strong>Empresas de marketing:</strong> Para campañas publicitarias (solo con su autorización)</li>
              </ul>

              <p><strong>5.2 Transferencias que NO Requieren su Consentimiento</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Autoridades fiscales:</strong> SAT, para cumplimiento de obligaciones tributarias</li>
                <li><strong>Autoridades regulatorias:</strong> PROFECO, en caso de investigaciones</li>
                <li><strong>Autoridades judiciales:</strong> Por orden judicial o ministerial</li>
                <li><strong>Notarios públicos:</strong> Para certificación del sorteo</li>
                <li><strong>Instituciones financieras:</strong> Para verificación de pagos</li>
                <li><strong>Concesionarios automotrices:</strong> Para entrega del premio</li>
              </ul>

              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="text-red-800">
                  <strong>Importante:</strong> Nunca vendemos, alquilamos o comercializamos sus datos 
                  personales a terceros con fines comerciales sin su consentimiento expreso.
                </p>
              </div>
            </div>
          </section>

          {/* Derechos ARCO */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              6. Sus Derechos (ARCO)
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Usted tiene derecho a ejercer los siguientes derechos respecto a sus datos personales:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-600 mb-2">🔍 ACCESO</h4>
                  <p className="text-sm">Conocer qué datos suyos tenemos y para qué los utilizamos</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-orange-600 mb-2">✏️ RECTIFICACIÓN</h4>
                  <p className="text-sm">Solicitar que corrijamos información incorrecta o incompleta</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-red-600 mb-2">❌ CANCELACIÓN</h4>
                  <p className="text-sm">Pedir que dejemos de usar sus datos cuando ya no sean necesarios</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-purple-600 mb-2">🚫 OPOSICIÓN</h4>
                  <p className="text-sm">Oponerse al uso de sus datos para finalidades específicas</p>
                </div>
              </div>

              <p><strong>¿Cómo ejercer sus derechos?</strong></p>
              <p>Envíe su solicitud a:</p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p><strong>Email:</strong> privacidad@rifa-silverado.mx</p>
                <p><strong>Asunto:</strong> &quot;Solicitud de Derechos ARCO&quot;</p>
                <p><strong>Teléfono:</strong> +52 55 1234-5678 (Ext. 105)</p>
                <p><strong>Horario de atención:</strong> Lunes a Viernes 9:00 - 17:00 hrs</p>
              </div>

              <p><strong>Información que debe incluir en su solicitud:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>Nombre completo y firma</li>
                <li>Copia de identificación oficial</li>
                <li>Descripción clara de su solicitud</li>
                <li>Domicilio para recibir respuesta</li>
                <li>Cualquier documento que facilite la localización de sus datos</li>
              </ul>

              <p><strong>Tiempo de respuesta:</strong> 20 días hábiles máximo</p>
            </div>
          </section>

          {/* Seguridad */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              7. Medidas de Seguridad
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger 
                sus datos personales:
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h4 className="font-bold mb-2">Cifrado SSL</h4>
                  <p className="text-sm text-gray-600">Todas las transmisiones están encriptadas</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h4 className="font-bold mb-2">Acceso Limitado</h4>
                  <p className="text-sm text-gray-600">Solo personal autorizado puede acceder</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💾</span>
                  </div>
                  <h4 className="font-bold mb-2">Respaldos Seguros</h4>
                  <p className="text-sm text-gray-600">Copias de seguridad cifradas</p>
                </div>
              </div>

              <ul className="list-disc list-inside space-y-2">
                <li>Servidores protegidos con firewalls avanzados</li>
                <li>Monitoreo continuo de actividades sospechosas</li>
                <li>Capacitación constante a nuestro personal</li>
                <li>Políticas estrictas de manejo de información</li>
                <li>Auditorías de seguridad periódicas</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              8. Uso de Cookies y Tecnologías Similares
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio:
              </p>

              <p><strong>Tipos de cookies que utilizamos:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Esenciales:</strong> Necesarias para el funcionamiento del sitio</li>
                <li><strong>Funcionales:</strong> Recordar sus preferencias y configuraciones</li>
                <li><strong>Analíticas:</strong> Google Analytics para entender el uso del sitio</li>
                <li><strong>Publicitarias:</strong> Solo con su consentimiento</li>
              </ul>

              <p><strong>Control de cookies:</strong></p>
              <p>
                Puede configurar su navegador para rechazar cookies, pero esto podría afectar 
                la funcionalidad del sitio. Para más información sobre cómo gestionar cookies, 
                consulte la ayuda de su navegador.
              </p>
            </div>
          </section>

          {/* Cambios */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              9. Modificaciones al Aviso de Privacidad
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Nos reservamos el derecho de actualizar este aviso de privacidad cuando sea necesario. 
                Las modificaciones se publicarán en esta página con al menos 10 días de anticipación.
              </p>
              <p>
                Le notificaremos sobre cambios importantes por correo electrónico o mediante 
                aviso prominente en nuestro sitio web.
              </p>
              <p><strong>Fecha de última actualización:</strong> 23 de agosto de 2025</p>
            </div>
          </section>

          {/* Contacto */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-green-500 pb-2">
              10. Contacto y Quejas
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Para cualquier duda, aclaración o queja sobre el tratamiento de sus datos personales:
              </p>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-blue-900 mb-4">📞 Departamento de Datos Personales</h4>
                <div className="grid md:grid-cols-2 gap-4 text-blue-800">
                  <div>
                    <p><strong>Responsable:</strong> Lic. María Fernández González</p>
                    <p><strong>Email:</strong> privacidad@rifa-silverado.mx</p>
                    <p><strong>Teléfono:</strong> +52 55 1234-5678 (Ext. 105)</p>
                  </div>
                  <div>
                    <p><strong>Horario:</strong> Lunes a Viernes</p>
                    <p><strong>Horario:</strong> 9:00 - 17:00 hrs</p>
                    <p><strong>Tiempo de respuesta:</strong> 3 días hábiles</p>
                  </div>
                </div>
              </div>

              <p><strong>Instituto Nacional de Transparencia (INAI)</strong></p>
              <p>
                Si no está satisfecho con nuestra respuesta, puede presentar una queja ante el INAI:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Sitio web:</strong> www.inai.org.mx</li>
                <li><strong>Teléfono:</strong> 01 800 835 4324</li>
                <li><strong>Email:</strong> arcodatos@inai.org.mx</li>
              </ul>
            </div>
          </section>

          {/* Aceptación */}
          <section className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
            <h3 className="text-xl font-bold text-green-900 mb-3">
              ✅ Consentimiento y Aceptación
            </h3>
            <p className="text-green-800 leading-relaxed">
              Al proporcionar sus datos personales y participar en nuestro sorteo, usted confirma 
              que ha leído, entendido y aceptado los términos de este Aviso de Privacidad. 
              Su participación constituye el consentimiento para el tratamiento de sus datos 
              conforme a lo establecido en este documento.
            </p>
          </section>

        </div>

        {/* Footer navegación */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors"
          >
            🎫 Participar en la Rifa
          </Link>
          <div className="mt-4 text-sm text-gray-500">
            <Link href="/terminos" className="hover:text-green-600 mx-2">Términos y Condiciones</Link> |
            <Link href="/contacto" className="hover:text-green-600 mx-2">Contacto</Link> |
            <Link href="/" className="hover:text-green-600 mx-2">Inicio</Link>
          </div>
        </div>

      </div>
    </div>
  );
}