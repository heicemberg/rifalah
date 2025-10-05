// ============================================================================
// LAYOUT PRINCIPAL PARA RIFA DE CAMIONETA EN MÉXICO
// ============================================================================

import { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

// Importar estilos globales
import './globals.css';

// Importar providers optimizados
import { AppProviders } from '../providers/AppProviders';
import ClientScripts from '../components/ClientScripts';
import CounterDebugger from '../components/CounterDebugger';
import SyncMonitor from '../components/debug/SyncMonitor';
import SyncTester from '../components/debug/SyncTester';

// Importar test suite en desarrollo
if (process.env.NODE_ENV === 'development') {
  import('../lib/counter-test');
}

// ============================================================================
// CONFIGURACIÓN DE FUENTE
// ============================================================================

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

// ============================================================================
// VIEWPORT CONFIGURACIÓN
// ============================================================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e40af' },
    { media: '(prefers-color-scheme: dark)', color: '#3b82f6' }
  ],
  colorScheme: 'light dark',
};

// ============================================================================
// METADATA SEO COMPLETO
// ============================================================================

export const metadata: Metadata = {
  // Información básica
  title: {
    default: 'Gana con la Cantrina - Audi A4 2024 + PS5 + $85,000 MXN',
    template: '%s | Gana con la Cantrina'
  },
  description: 'Gana con la Cantrina: Audi A4 2024 + PlayStation 5 + $85,000 MXN en efectivo. Boletos desde $250 MXN. Sorteo legal y transparente el 31 de Diciembre 2024. ¡Participa ya!',
  
  // Keywords específicas para México
  keywords: [
    'rifa audi',
    'Audi A4 2024',
    'rifa México',
    'sorteo legal',
    'rifa La H',
    'PlayStation 5',
    'boletos rifa',
    'audi nuevo',
    'rifa transparente',
    'sorteo diciembre',
    'rifa ps5',
    'rifa online'
  ],
  
  // Información del autor/organizador
  authors: [
    {
      name: 'Gana con la Cantrina',
      url: 'https://ganacanlacantrina.com'
    }
  ],
  
  // Configuración de robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Configuración de idioma
  alternates: {
    canonical: 'https://ganacanlacantrina.com',
    languages: {
      'es-MX': 'https://ganacanlacantrina.com',
      'es': 'https://ganacanlacantrina.com/es'
    }
  },
  
  // OpenGraph para redes sociales
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://ganacanlacantrina.com',
    title: 'Gana con la Cantrina - Audi A4 2024 + PS5 + $85,000 MXN',
    description: 'Gana con la Cantrina. Audi A4 2024 + PlayStation 5 + $85,000 MXN en efectivo. Boletos desde $250 MXN. Sorteo 31 Dic 2024.',
    siteName: 'Gana con la Cantrina',
    images: [
      {
        url: 'https://ganacanlacantrina.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gana con la Cantrina - Audi A4 2024 + PS5 + $85,000 MXN',
        type: 'image/jpeg'
      },
      {
        url: 'https://ganacanlacantrina.com/og-image-square.jpg',
        width: 1080,
        height: 1080,
        alt: 'Gana con la Cantrina - Premio Completo',
        type: 'image/jpeg'
      }
    ],
  },
  
  // Twitter Cards
  twitter: {
    card: 'summary_large_image',
    site: '@LaCantrina',
    creator: '@LaCantrina',
    title: 'Gana con la Cantrina - Audi A4 2024 + PS5 + $85,000 MXN',
    description: 'Gana con la Cantrina. Audi A4 2024 + PlayStation 5 + $85,000 MXN en efectivo. Boletos desde $250 MXN.',
    images: {
      url: 'https://ganacanlacantrina.com/twitter-image.jpg',
      alt: 'Gana con la Cantrina - Audi A4 2024 + PS5 + $85,000 MXN',
      width: 1200,
      height: 600,
      type: 'image/jpeg'
    }
  },
  
  // Iconos y favicons
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-touch-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-180x180.png', sizes: '180x180' }
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#1e40af'
      }
    ]
  },
  
  // Manifest para PWA
  manifest: '/site.webmanifest',
  
  // Configuración adicional
  category: 'Entertainment',
  classification: 'Raffle, Lottery, Automotive',
  
  // Información de contacto
  other: {
    'contact:phone_number': '+523343461630',
    'contact:email': 'info@ganacanlacantrina.com',
    'contact:country_name': 'México',
    'contact:region': 'CDMX'
  }
};

// ============================================================================
// STRUCTURED DATA JSON-LD
// ============================================================================

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organización
    {
      '@type': 'Organization',
      '@id': 'https://ganacanlacantrina.com/#organization',
      name: 'Gana con la Cantrina',
      url: 'https://ganacanlacantrina.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ganacanlacantrina.com/logo.svg',
        width: 300,
        height: 100
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+523343461630',
        contactType: 'customer service',
        areaServed: 'MX',
        availableLanguage: 'Spanish'
      },
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MX',
        addressRegion: 'CDMX',
        addressLocality: 'Ciudad de México'
      },
      sameAs: [
        'https://facebook.com/LaCantrina',
        'https://twitter.com/LaCantrina',
        'https://instagram.com/lacantrina'
      ]
    },
    
    // Evento del Sorteo
    {
      '@type': 'Event',
      '@id': 'https://ganacanlacantrina.com/#event',
      name: 'Sorteo Gana con la Cantrina - Audi A4 2024 + PS5 + $85,000 MXN',
      description: 'Sorteo legal y transparente de un Audi A4 2024 + PlayStation 5 + $85,000 MXN en efectivo. Transmisión en vivo del evento.',
      startDate: '2025-11-24T20:00:00-06:00',
      endDate: '2025-11-24T21:00:00-06:00',
      eventStatus: 'EventScheduled',
      eventAttendanceMode: 'OnlineEventAttendanceMode',
      location: {
        '@type': 'VirtualLocation',
        url: 'https://ganacanlacantrina.com/sorteo-en-vivo'
      },
      organizer: {
        '@id': 'https://ganacanlacantrina.com/#organization'
      },
      offers: {
        '@type': 'Offer',
        price: '50',
        priceCurrency: 'MXN',
        availability: 'InStock',
        validFrom: '2024-01-01T00:00:00-06:00',
        validThrough: '2024-12-30T23:59:59-06:00',
        url: 'https://ganacanlacantrina.com'
      },
      image: 'https://ganacanlacantrina.com/sorteo-image.jpg'
    },
    
    // Producto Premio
    {
      '@type': 'Product',
      '@id': 'https://ganacanlacantrina.com/#prize',
      name: 'Audi A4 2024 + PlayStation 5 + $85,000 MXN en Efectivo',
      description: 'Automóvil Audi A4 2024 completamente nuevo, 0 kilómetros, con todos los papeles incluidos + PlayStation 5 nueva + $85,000 pesos mexicanos en efectivo.',
      brand: {
        '@type': 'Brand',
        name: 'Audi'
      },
      model: 'A4',
      vehicleModelDate: '2024',
      category: 'Automobile',
      offers: {
        '@type': 'Offer',
        price: '1200000',
        priceCurrency: 'MXN',
        itemCondition: 'NewCondition',
        availability: 'InStock'
      },
      image: 'https://ganacanlacantrina.com/premios/premiorifa.jpg'
    },
    
    // FAQ Schema
    {
      '@type': 'FAQPage',
      '@id': 'https://ganacanlacantrina.com/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Cuánto cuesta un boleto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Cada boleto cuesta $250 MXN. Tenemos descuentos por volumen: 5 boletos por $1,125 (10% OFF), 10 boletos por $2,000 (20% OFF), etc.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cuándo es el sorteo?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'El sorteo se realizará el 24 de Noviembre de 2025 a las 8:00 PM (hora de México) con transmisión en vivo.'
          }
        },
        {
          '@type': 'Question',
          name: '¿La rifa es legal?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, nuestra rifa está completamente autorizada y cumple con todas las regulaciones mexicanas. El sorteo será transparente y transmitido en vivo.'
          }
        }
      ]
    }
  ]
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="es-MX" 
      className={`${inter.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
        
        {/* Security Headers via Meta Tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* DNS Prefetch para mejores performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Verificación de propiedades */}
        <meta name="google-site-verification" content="your-google-verification-code" />
        <meta name="facebook-domain-verification" content="your-facebook-verification-code" />
      </head>
      
      <body 
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <script dangerouslySetInnerHTML={{
          __html: `console.log('CSS Loading Check:', {
            globalsCss: !!document.querySelector('link[href*="globals.css"], style[data-href*="globals.css"]'),
            tailwindCss: !!document.querySelector('link[href*="tailwind.css"], style[data-href*="tailwind.css"]'),
            timestamp: new Date().toISOString()
          });`
        }} />
        {/* No-JS Fallback Message */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            zIndex: 10000,
            textAlign: 'center',
            padding: '20px'
          }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              JavaScript Requerido
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.5', maxWidth: '500px' }}>
              Para participar en Gana con la Cantrina (Audi A4 2024 + PS5 + $85,000 MXN),
              necesitas activar JavaScript en tu navegador. Esto nos permite
              ofrecerte la mejor experiencia y garantizar la seguridad de tu compra.
            </p>
            <p style={{ fontSize: '14px', marginTop: '16px', opacity: 0.8 }}>
              Si necesitas ayuda, contacta con nosotros: +523343461630
            </p>
          </div>
        </noscript>

        {/* Contenido principal */}
        <AppProviders>
          <div id="app-root">
            {children}
          </div>
          
          {/* Debug Monitor - Solo en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <SyncMonitor />
              <SyncTester />
            </>
          )}
        </AppProviders>
        
        {/* React Hot Toast - Ultra discreto y sutil */}
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={4}
          containerClassName="z-[9999]"
          containerStyle={{
            bottom: 16,
            right: 16
          }}
          toastOptions={{
            // Configuración ultra discreta y pequeña
            duration: 2000,
            style: {
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'rgba(255, 255, 255, 0.85)',
              border: 'none',
              borderRadius: '20px',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: '400',
              padding: '4px 8px',
              maxWidth: '120px',
              minHeight: '24px',
              opacity: '0.8',
              transform: 'scale(0.85)'
            },
            
            // Configuración por tipo - Muy discretos
            success: {
              duration: 1500,
              iconTheme: {
                primary: '#10b981',
                secondary: 'rgba(255, 255, 255, 0.8)',
              },
              style: {
                background: 'rgba(16, 185, 129, 0.7)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '10px',
                padding: '3px 6px'
              }
            },
            
            error: {
              duration: 2000,
              iconTheme: {
                primary: '#ef4444',
                secondary: 'rgba(255, 255, 255, 0.8)',
              },
              style: {
                background: 'rgba(239, 68, 68, 0.7)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '10px',
                padding: '3px 6px'
              }
            },
            
            loading: {
              duration: Infinity,
              iconTheme: {
                primary: '#3b82f6',
                secondary: 'rgba(255, 255, 255, 0.8)',
              },
              style: {
                background: 'rgba(59, 130, 246, 0.7)',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '10px',
                padding: '3px 6px'
              }
            },
          }}
        />

        {/* Client-side scripts moved to ClientScripts component */}

        {/* Client-side Analytics */}
        <ClientScripts />

        {/* Counter Debugger - Only in development */}
        {process.env.NODE_ENV === 'development' && (
          <CounterDebugger show={true} />
        )}

        {/* Preload de recursos críticos */}
        <link rel="preload" href="/premios/premiorifa.jpg" as="image" />
        <link rel="preload" href="/premios/QR.jpg" as="image" />
        {/* Logos de bancos ahora son componentes SVG inline - no necesitan preload */}
      </body>
    </html>
  );
}

// ============================================================================
// METADATA ESTÁTICO CONFIGURADO ARRIBA
// ============================================================================