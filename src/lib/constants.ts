// ============================================================================
// CONSTANTES PARA SISTEMA DE RIFA DE CAMIONETA EN MÉXICO
// ============================================================================

import type {
  QuickSelectOption,
  PaymentMethod,
  PaymentMethodType,
  AdminConfig,
  ThemeColors
} from './types';

// ============================================================================
// CONFIGURACIÓN GENERAL DE LA RIFA
// ============================================================================

/** Total de tickets disponibles */
export const TOTAL_TICKETS = 10000;

/** Precio por ticket en pesos mexicanos */
export const TICKET_PRICE = 50;

/** Tiempo de reserva en minutos */
export const RESERVATION_TIME = 30;

/** Tiempo de reserva en milisegundos */
export const RESERVATION_TIME_MS = RESERVATION_TIME * 60 * 1000;

// ============================================================================
// OPCIONES DE SELECCIÓN RÁPIDA
// ============================================================================

export const QUICK_SELECT_OPTIONS: QuickSelectOption[] = [
  {
    tickets: 1,
    price: 50,
    discount: 0,
    popular: false
  },
  {
    tickets: 5,
    price: 225,
    discount: 10,
    popular: false
  },
  {
    tickets: 10,
    price: 400,
    discount: 20,
    popular: true
  },
  {
    tickets: 25,
    price: 750,
    discount: 25,
    popular: false
  },
  {
    tickets: 50,
    price: 1400,
    discount: 30,
    popular: false
  }
];

// ============================================================================
// MÉTODOS DE PAGO DISPONIBLES EN MÉXICO
// ============================================================================

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'binance' as PaymentMethodType,
    name: 'Binance Pay',
    icon: '/logos/binance.svg',
    account: 'binance@rifa.mx',
    enabled: true
  },
  {
    id: 'bancoppel' as PaymentMethodType,
    name: 'BanCoppel',
    icon: '/logos/bancoppel.png',
    account: '4169 1234 5678 9012',
    enabled: true
  },
  {
    id: 'bancoazteca' as PaymentMethodType,
    name: 'Banco Azteca',
    icon: '/logos/bancoazteca.png',
    account: '5204 1234 5678 9012',
    enabled: true
  },
  {
    id: 'oxxo' as PaymentMethodType,
    name: 'OXXO',
    icon: '/logos/oxxo.png',
    account: 'Referencia: RIF-2024-001',
    enabled: true
  }
];

// ============================================================================
// NOMBRES MEXICANOS PARA ACTIVIDAD EN TIEMPO REAL
// ============================================================================

export const MEXICAN_NAMES: string[] = [
  'Juan M.',
  'María G.',
  'Carlos R.',
  'Ana L.',
  'Miguel H.',
  'Carmen S.',
  'José A.',
  'Lucía F.',
  'Roberto C.',
  'Patricia V.',
  'Francisco J.',
  'Rosa M.',
  'Antonio L.',
  'Isabel D.',
  'Manuel P.',
  'Teresa R.',
  'Daniel G.',
  'Mónica H.',
  'Rafael S.',
  'Sandra T.',
  'Eduardo M.',
  'Alejandra C.',
  'Sergio L.',
  'Gabriela R.',
  'Fernando V.',
  'Verónica P.',
  'Arturo N.',
  'Claudia B.',
  'Raúl G.',
  'Adriana F.',
  'Jorge M.',
  'Silvia H.',
  'Héctor R.',
  'Diana L.',
  'Enrique S.',
  'Mariana T.',
  'Ricardo P.',
  'Leticia V.',
  'Javier C.',
  'Norma D.',
  'Oscar F.',
  'Rocío M.',
  'Gerardo H.',
  'Esperanza R.',
  'Armando L.',
  'Guadalupe S.',
  'Alfredo T.',
  'Beatriz P.',
  'Ignacio V.',
  'Yolanda C.'
];

// ============================================================================
// CIUDADES MEXICANAS PRINCIPALES
// ============================================================================

export const MEXICAN_CITIES: string[] = [
  'Ciudad de México',
  'Guadalajara, Jalisco',
  'Monterrey, Nuevo León',
  'Puebla, Puebla',
  'Tijuana, Baja California',
  'León, Guanajuato',
  'Juárez, Chihuahua',
  'Torreón, Coahuila',
  'Querétaro, Querétaro',
  'San Luis Potosí, San Luis Potosí',
  'Mérida, Yucatán',
  'Mexicali, Baja California',
  'Aguascalientes, Aguascalientes',
  'Cuernavaca, Morelos',
  'Saltillo, Coahuila',
  'Xalapa, Veracruz',
  'Tampico, Tamaulipas',
  'Morelia, Michoacán',
  'Reynosa, Tamaulipas',
  'Tlalnepantla, Estado de México',
  'Chimalhuacán, Estado de México',
  'Naucalpan, Estado de México',
  'Cancún, Quintana Roo',
  'Veracruz, Veracruz',
  'Pachuca, Hidalgo',
  'Oaxaca, Oaxaca',
  'Acapulco, Guerrero',
  'Chihuahua, Chihuahua',
  'Hermosillo, Sonora',
  'Culiacán, Sinaloa',
  'Mazatlán, Sinaloa',
  'Durango, Durango',
  'Campeche, Campeche',
  'La Paz, Baja California Sur',
  'Tuxtla Gutiérrez, Chiapas',
  'Villahermosa, Tabasco',
  'Tepic, Nayarit',
  'Colima, Colima',
  'Zacatecas, Zacatecas',
  'Tlaxcala, Tlaxcala'
];

// ============================================================================
// COLORES PREDETERMINADOS DEL TEMA
// ============================================================================

export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: '#1e40af',      // Azul principal
  secondary: '#dc2626',    // Rojo secundario
  accent: '#f59e0b',       // Amarillo de acento
  background: '#ffffff',   // Fondo blanco
  text: '#1f2937',         // Texto gris oscuro
  success: '#10b981',      // Verde éxito
  error: '#ef4444',        // Rojo error
  warning: '#f59e0b'       // Amarillo advertencia
};

// ============================================================================
// CONFIGURACIÓN PREDETERMINADA DEL ADMINISTRADOR
// ============================================================================

export const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  prizeTitle: 'Chevrolet Silverado Z71 2024',
  prizeImage: '/premios/premio-rifa.png',
  prizeValue: 890000,
  sorteoDate: new Date('2024-12-31T20:00:00-06:00'), // 31 Dec 2024 8PM CST
  colors: DEFAULT_THEME_COLORS,
  paymentMethods: PAYMENT_METHODS
};

// ============================================================================
// CONFIGURACIONES DE TIEMPO Y INTERVALOS
// ============================================================================

/** Intervalo para actualizar la actividad en tiempo real (ms) */
export const LIVE_ACTIVITY_INTERVAL = 5000;

/** Intervalo para verificar reservas expiradas (ms) */
export const RESERVATION_CHECK_INTERVAL = 60000;

/** Intervalo para generar actividad falsa de compras (ms) */
export const FAKE_ACTIVITY_INTERVAL = 15000;

// ============================================================================
// LÍMITES Y VALIDACIONES
// ============================================================================

/** Máximo de tickets por compra */
export const MAX_TICKETS_PER_PURCHASE = 100;

/** Mínimo de tickets por compra */
export const MIN_TICKETS_PER_PURCHASE = 1;

/** Máximo de caracteres para nombre */
export const MAX_NAME_LENGTH = 100;

/** Máximo de caracteres para email */
export const MAX_EMAIL_LENGTH = 254;

/** Patrón para validar email */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Patrón para validar WhatsApp mexicano (formato: +52 seguido de 10 dígitos) */
export const MEXICAN_WHATSAPP_REGEX = /^\+52\d{10}$/;

// ============================================================================
// MENSAJES Y TEXTOS PREDETERMINADOS
// ============================================================================

export const MESSAGES = {
  // Mensajes de éxito
  SUCCESS: {
    TICKETS_RESERVED: '¡Tickets reservados exitosamente!',
    PAYMENT_VERIFIED: '¡Pago verificado! Tus tickets han sido confirmados.',
    PROFILE_UPDATED: 'Perfil actualizado correctamente.'
  },
  
  // Mensajes de error
  ERROR: {
    TICKETS_NOT_AVAILABLE: 'Algunos tickets ya no están disponibles.',
    INVALID_EMAIL: 'Por favor ingresa un email válido.',
    INVALID_WHATSAPP: 'Por favor ingresa un número de WhatsApp válido (+52XXXXXXXXXX).',
    RESERVATION_EXPIRED: 'Tu reserva ha expirado. Por favor selecciona nuevos tickets.',
    PAYMENT_FAILED: 'No se pudo procesar el pago. Intenta nuevamente.',
    MAX_TICKETS_EXCEEDED: `No puedes comprar más de ${MAX_TICKETS_PER_PURCHASE} tickets.`
  },
  
  // Mensajes de advertencia
  WARNING: {
    RESERVATION_EXPIRING: 'Tu reserva expirará pronto. Completa tu compra.',
    FEW_TICKETS_LEFT: 'Quedan pocos tickets disponibles.'
  },
  
  // Mensajes informativos
  INFO: {
    TICKETS_SELECTED: 'tickets seleccionados',
    TOTAL_TO_PAY: 'Total a pagar',
    DISCOUNT_APPLIED: 'Descuento aplicado',
    SORTEO_DATE: 'Fecha del sorteo'
  }
};

// ============================================================================
// CONFIGURACIONES DE FORMATO
// ============================================================================

/** Configuración para formatear moneda mexicana */
export const CURRENCY_FORMAT = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

/** Configuración para formatear fechas en México */
export const DATE_FORMAT = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Mexico_City'
});

/** Configuración para formatear números */
export const NUMBER_FORMAT = new Intl.NumberFormat('es-MX');

// ============================================================================
// EXPORTS PARA FÁCIL IMPORTACIÓN
// ============================================================================

export {
  // Re-exportar tipos del archivo types.ts para conveniencia
  type QuickSelectOption,
  type PaymentMethod,
  type PaymentMethodType,
  type AdminConfig,
  type ThemeColors
} from './types';

// ============================================================================
// FUNCIONES HELPER PARA CONSTANTES
// ============================================================================

/**
 * Obtiene una opción de selección rápida por cantidad de tickets
 */
export const getQuickSelectOption = (ticketCount: number): QuickSelectOption | undefined => {
  return QUICK_SELECT_OPTIONS.find(option => option.tickets === ticketCount);
};

/**
 * Obtiene un método de pago por ID
 */
export const getPaymentMethod = (id: PaymentMethodType): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find(method => method.id === id);
};

/**
 * Obtiene métodos de pago habilitados
 */
export const getEnabledPaymentMethods = (): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => method.enabled);
};

/**
 * Calcula el precio total con descuento
 */
export const calculateTotalPrice = (tickets: number): number => {
  const option = getQuickSelectOption(tickets);
  if (option) {
    return option.price;
  }
  
  // Si no hay opción predefinida, calcular precio base
  return tickets * TICKET_PRICE;
};

/**
 * Formatea precio en pesos mexicanos
 */
export const formatPrice = (amount: number): string => {
  return CURRENCY_FORMAT.format(amount);
};

/**
 * Formatea fecha en formato mexicano
 */
export const formatDate = (date: Date): string => {
  return DATE_FORMAT.format(date);
};

/**
 * Obtiene un nombre mexicano aleatorio
 */
export const getRandomMexicanName = (): string => {
  return MEXICAN_NAMES[Math.floor(Math.random() * MEXICAN_NAMES.length)];
};

/**
 * Obtiene una ciudad mexicana aleatoria
 */
export const getRandomMexicanCity = (): string => {
  return MEXICAN_CITIES[Math.floor(Math.random() * MEXICAN_CITIES.length)];
};