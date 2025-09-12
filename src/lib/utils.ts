// ============================================================================
// UTILIDADES PARA SISTEMA DE RIFA DE CAMIONETA EN MÉXICO
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Importar SOLO constantes y datos (NO funciones)
import {
  QUICK_SELECT_OPTIONS,
  MAIN_CARD_OPTIONS,
  MEXICAN_NAMES,
  MEXICAN_CITIES,
  TICKET_PRICE,
  EMAIL_REGEX,
  MEXICAN_WHATSAPP_REGEX,
  CURRENCY_FORMAT_CONFIG,
  DATE_FORMAT_CONFIG
} from './constants';

// ============================================================================
// UTILIDADES DE STYLING
// ============================================================================

/**
 * Combina clases de Tailwind CSS de manera inteligente
 * Utiliza clsx para condicionales y tailwind-merge para resolver conflictos
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// FORMATEO DE NÚMEROS Y PRECIOS
// ============================================================================

/**
 * Formatea un número como ticket con formato "0001"
 * @param num - Número del ticket
 * @returns String formateado con ceros a la izquierda
 */
export function formatTicketNumber(num: number): string {
  return num.toString().padStart(4, '0');
}

/**
 * Formatea un monto como precio en formato estadounidense
 * @param amount - Cantidad a formatear
 * @param currency - Moneda (por defecto USD)
 * @returns String formateado como moneda estadounidense
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      ...CURRENCY_FORMAT_CONFIG,
      currency: currency
    });
    return formatter.format(amount);
  } catch {
    // Fallback en caso de error
    return `$${amount.toLocaleString('en-US')}`;
  }
}

/**
 * Calcula el precio total basado en cantidad de tickets y descuentos
 * Usa las opciones de QUICK_SELECT_OPTIONS para aplicar descuentos
 * @param tickets - Cantidad de tickets
 * @returns Precio total con descuento aplicado
 */
export function calculatePrice(tickets: number): number {
  if (tickets <= 0) return 0;
  
  // Buscar si hay una opción de descuento para esta cantidad exacta
  const quickOption = QUICK_SELECT_OPTIONS.find(option => option.tickets === tickets);
  
  if (quickOption) {
    return quickOption.price;
  }
  
  // Si no hay opción exacta, buscar la mejor opción aplicable
  // Ordenar opciones por cantidad de tickets descendente
  const sortedOptions = [...QUICK_SELECT_OPTIONS].sort((a, b) => b.tickets - a.tickets);
  
  let totalPrice = 0;
  let remainingTickets = tickets;
  
  // Aplicar descuentos de manera greedy (mayor descuento primero)
  for (const option of sortedOptions) {
    if (remainingTickets >= option.tickets) {
      const setsToApply = Math.floor(remainingTickets / option.tickets);
      totalPrice += setsToApply * option.price;
      remainingTickets -= setsToApply * option.tickets;
    }
  }
  
  // Tickets restantes al precio base
  if (remainingTickets > 0) {
    totalPrice += remainingTickets * TICKET_PRICE;
  }
  
  return totalPrice;
}

/**
 * Calcula el descuento aplicado en porcentaje
 * @param tickets - Cantidad de tickets
 * @returns Porcentaje de descuento aplicado
 */
export function calculateDiscountPercentage(tickets: number): number {
  if (tickets <= 0) return 0;
  
  const originalPrice = tickets * TICKET_PRICE;
  const discountedPrice = calculatePrice(tickets);
  
  if (originalPrice === 0) return 0;
  
  const discountAmount = originalPrice - discountedPrice;
  return Math.round((discountAmount / originalPrice) * 100);
}

// ============================================================================
// GENERADORES ALEATORIOS
// ============================================================================

/**
 * Genera un nombre mexicano aleatorio del array MEXICAN_NAMES
 * @returns Nombre aleatorio en formato "Nombre A."
 */
export function generateRandomName(): string {
  if (MEXICAN_NAMES.length === 0) return 'Usuario A.';
  const randomIndex = Math.floor(Math.random() * MEXICAN_NAMES.length);
  return MEXICAN_NAMES[randomIndex];
}

/**
 * Obtiene una ciudad mexicana aleatoria del array MEXICAN_CITIES
 * @returns Ciudad aleatoria
 */
export function getRandomCity(): string {
  if (MEXICAN_CITIES.length === 0) return 'Ciudad de México';
  const randomIndex = Math.floor(Math.random() * MEXICAN_CITIES.length);
  return MEXICAN_CITIES[randomIndex];
}

/**
 * Genera un ID único usando crypto.randomUUID si está disponible
 * @returns UUID string
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback para ambientes que no soportan crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Genera un número aleatorio entre min y max (inclusive)
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Número aleatorio
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Valida si un email tiene formato correcto
 * @param email - Email a validar
 * @returns true si es válido
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Valida si un número de WhatsApp es válido para México
 * Formato esperado: +52XXXXXXXXXX (52 seguido de 10 dígitos)
 * @param phone - Número de teléfono a validar
 * @returns true si es válido
 */
export function validateWhatsApp(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Limpiar el número (remover espacios, guiones, etc.)
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Verificar formato mexicano
  return MEXICAN_WHATSAPP_REGEX.test(cleanPhone);
}

/**
 * Formatea un número de WhatsApp para display
 * @param phone - Número de WhatsApp
 * @returns Número formateado para mostrar
 */
export function formatWhatsApp(phone: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
  
  if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
    // Formato: +52 XXX XXX XXXX
    return `+52 ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8)}`;
  }
  
  return phone; // Retornar original si no coincide con el formato esperado
}

// ============================================================================
// UTILIDADES DE TIEMPO
// ============================================================================

/**
 * Formatea una fecha como tiempo relativo (ej: "hace 5 minutos")
 * @param date - Fecha a formatear
 * @returns String con tiempo relativo
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'hace menos de 1 minuto';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
}

/**
 * Formatea una fecha en formato mexicano legible
 * @param date - Fecha a formatear
 * @returns String con fecha formateada
 */
export function formatDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('es-MX', DATE_FORMAT_CONFIG).format(date);
  } catch {
    // Fallback básico
    return date.toLocaleDateString('es-MX');
  }
}

/**
 * Formatea solo la fecha (sin hora) en formato mexicano
 * @param date - Fecha a formatear
 * @returns String con fecha formateada
 */
export function formatDateOnly(date: Date): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/Mexico_City'
    }).format(date);
  } catch {
    return date.toLocaleDateString('es-MX');
  }
}

/**
 * Formatea solo la hora en formato mexicano
 * @param date - Fecha a formatear
 * @returns String con hora formateada
 */
export function formatTimeOnly(date: Date): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mexico_City'
    }).format(date);
  } catch {
    return date.toLocaleTimeString('es-MX');
  }
}

/**
 * Pausa la ejecución por un tiempo determinado
 * @param ms - Milisegundos a esperar
 * @returns Promise que se resuelve después del tiempo especificado
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// UTILIDADES DE ARRAYS Y OBJETOS
// ============================================================================

/**
 * Mezcla un array de manera aleatoria (Fisher-Yates shuffle)
 * @param array - Array a mezclar
 * @returns Nuevo array mezclado
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Selecciona elementos aleatorios de un array
 * @param array - Array de origen
 * @param count - Cantidad de elementos a seleccionar
 * @returns Array con elementos seleccionados aleatoriamente
 */
export function sampleArray<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Agrupa elementos de un array por una clave
 * @param array - Array a agrupar
 * @param keyFn - Función que extrae la clave de agrupación
 * @returns Objeto con elementos agrupados
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// ============================================================================
// UTILIDADES DE STRING
// ============================================================================

/**
 * Capitaliza la primera letra de una string
 * @param str - String a capitalizar
 * @returns String con primera letra en mayúscula
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca un texto a una longitud específica
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @param suffix - Sufijo a agregar (por defecto "...")
 * @returns Texto truncado
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Convierte un string a slug (URL-friendly)
 * @param str - String a convertir
 * @returns Slug generado
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// UTILIDADES DE NÚMEROS
// ============================================================================

/**
 * Formatea un número con separadores de miles
 * @param num - Número a formatear
 * @returns String con número formateado
 */
export function formatNumber(num: number): string {
  try {
    return new Intl.NumberFormat('es-MX').format(num);
  } catch {
    return num.toString();
  }
}

/**
 * Calcula el porcentaje entre dos números
 * @param part - Parte del total
 * @param total - Total
 * @returns Porcentaje calculado
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Clampea un valor entre un mínimo y máximo
 * @param value - Valor a clampear
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Valor clampeado
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}