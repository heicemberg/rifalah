// ============================================================================
// SISTEMA ANTI-FRAUDE PARA RIFA SILVERADO Z71 2024
// ============================================================================

import { CompraCompleta } from './supabase';

// Tipos para validación
interface FraudCheck {
  isValid: boolean;
  riskScore: number; // 0-100, donde 100 es máximo riesgo
  warnings: string[];
  blockers: string[];
  metadata: {
    ipRisk: number;
    emailRisk: number;
    phoneRisk: number;
    behaviorRisk: number;
    paymentRisk: number;
  };
}

interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  localStorageEnabled: boolean;
  sessionStorageEnabled: boolean;
}

// ============================================================================
// VALIDACIONES DE DATOS
// ============================================================================

export const validateMexicanPhone = (phone: string): boolean => {
  // Formato mexicano: +52 seguido de 10 dígitos
  const phoneRegex = /^\+52\s?[1-9]\d{9}$/;
  const cleanPhone = phone.replace(/\s/g, '');
  return phoneRegex.test(cleanPhone);
};

export const validateMexicanEmail = (email: string): boolean => {
  // Validación básica de email más verificación de dominios sospechosos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Lista de dominios temporales conocidos (actualizar periódicamente)
  const suspiciousDomains = [
    'temp-mail.org', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'yopmail.com', 'tempail.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return !suspiciousDomains.includes(domain);
};

export const validateMexicanName = (name: string): boolean => {
  // Validar que contenga solo letras, espacios, acentos y guiones
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$/;
  if (!nameRegex.test(name)) return false;
  
  // Verificar longitud razonable
  if (name.trim().length < 2 || name.trim().length > 50) return false;
  
  // Verificar que no sean caracteres repetidos sospechosos
  if (/(.)\1{4,}/.test(name)) return false;
  
  return true;
};

// ============================================================================
// ANÁLISIS DE COMPORTAMIENTO
// ============================================================================

export class FraudDetectionEngine {
  private static instance: FraudDetectionEngine;
  private purchaseAttempts: Map<string, number> = new Map();
  private ipAttempts: Map<string, number> = new Map();
  private emailAttempts: Map<string, number> = new Map();
  
  static getInstance(): FraudDetectionEngine {
    if (!FraudDetectionEngine.instance) {
      FraudDetectionEngine.instance = new FraudDetectionEngine();
    }
    return FraudDetectionEngine.instance;
  }

  // Análisis integral de fraude
  async analyzePurchase(purchaseData: CompraCompleta, deviceInfo?: DeviceFingerprint): Promise<FraudCheck> {
    const warnings: string[] = [];
    const blockers: string[] = [];
    let riskScore = 0;

    // 1. Validación de datos básicos
    const dataValidation = this.validateBasicData(purchaseData);
    riskScore += dataValidation.risk;
    warnings.push(...dataValidation.warnings);
    blockers.push(...dataValidation.blockers);

    // 2. Análisis de IP y geolocalización
    const ipAnalysis = await this.analyzeIP(purchaseData.ip_address);
    riskScore += ipAnalysis.risk;
    warnings.push(...ipAnalysis.warnings);

    // 3. Análisis de email
    const emailAnalysis = this.analyzeEmail(purchaseData.email);
    riskScore += emailAnalysis.risk;
    warnings.push(...emailAnalysis.warnings);

    // 4. Análisis de teléfono
    const phoneAnalysis = this.analyzePhone(purchaseData.telefono);
    riskScore += phoneAnalysis.risk;
    warnings.push(...phoneAnalysis.warnings);

    // 5. Análisis de comportamiento
    const behaviorAnalysis = this.analyzeBehavior(purchaseData, deviceInfo);
    riskScore += behaviorAnalysis.risk;
    warnings.push(...behaviorAnalysis.warnings);

    // 6. Análisis de método de pago
    const paymentAnalysis = this.analyzePayment(purchaseData.metodo_pago, purchaseData.precio_total);
    riskScore += paymentAnalysis.risk;
    warnings.push(...paymentAnalysis.warnings);

    // Determinar si es válido (riesgo < 70)
    const isValid = riskScore < 70 && blockers.length === 0;

    return {
      isValid,
      riskScore: Math.min(riskScore, 100),
      warnings: warnings.filter(Boolean),
      blockers: blockers.filter(Boolean),
      metadata: {
        ipRisk: ipAnalysis.risk,
        emailRisk: emailAnalysis.risk,
        phoneRisk: phoneAnalysis.risk,
        behaviorRisk: behaviorAnalysis.risk,
        paymentRisk: paymentAnalysis.risk
      }
    };
  }

  // Validación de datos básicos
  private validateBasicData(data: CompraCompleta) {
    const warnings: string[] = [];
    const blockers: string[] = [];
    let risk = 0;

    // Validar nombre
    if (!validateMexicanName(data.nombre)) {
      blockers.push('Nombre contiene caracteres no válidos');
      risk += 50;
    }

    if (!validateMexicanName(data.apellidos)) {
      blockers.push('Apellidos contienen caracteres no válidos');
      risk += 50;
    }

    // Validar email
    if (!validateMexicanEmail(data.email)) {
      blockers.push('Email no válido o de dominio sospechoso');
      risk += 40;
    }

    // Validar teléfono
    if (!validateMexicanPhone(data.telefono)) {
      blockers.push('Número telefónico no válido para México');
      risk += 30;
    }

    // Validar ciudad y estado (lista básica)
    const mexicanStates = [
      'AGUASCALIENTES', 'BAJA CALIFORNIA', 'BAJA CALIFORNIA SUR', 'CAMPECHE', 
      'CHIAPAS', 'CHIHUAHUA', 'CDMX', 'COAHUILA', 'COLIMA', 'DURANGO', 
      'GUANAJUATO', 'GUERRERO', 'HIDALGO', 'JALISCO', 'MÉXICO', 'MICHOACÁN',
      'MORELOS', 'NAYARIT', 'NUEVO LEÓN', 'OAXACA', 'PUEBLA', 'QUERÉTARO',
      'QUINTANA ROO', 'SAN LUIS POTOSÍ', 'SINALOA', 'SONORA', 'TABASCO',
      'TAMAULIPAS', 'TLAXCALA', 'VERACRUZ', 'YUCATÁN', 'ZACATECAS'
    ];

    if (!mexicanStates.includes(data.estado.toUpperCase())) {
      warnings.push('Estado no reconocido en México');
      risk += 15;
    }

    // Validar cantidad de boletos (límites razonables)
    if (data.cantidad_boletos > 100) {
      warnings.push('Cantidad de boletos muy alta - requiere revisión manual');
      risk += 25;
    }

    if (data.cantidad_boletos > 500) {
      blockers.push('Cantidad de boletos excede límite máximo permitido');
      risk += 60;
    }

    return { warnings, blockers, risk };
  }

  // Análisis de IP
  private async analyzeIP(ipAddress?: string) {
    const warnings: string[] = [];
    let risk = 0;

    if (!ipAddress) {
      warnings.push('No se pudo determinar la dirección IP');
      risk += 20;
      return { warnings, risk };
    }

    // Verificar intentos frecuentes desde la misma IP
    const currentAttempts = this.ipAttempts.get(ipAddress) || 0;
    this.ipAttempts.set(ipAddress, currentAttempts + 1);

    if (currentAttempts > 5) {
      warnings.push('Múltiples intentos desde la misma IP');
      risk += 30;
    }

    if (currentAttempts > 10) {
      warnings.push('Demasiados intentos desde esta IP - posible bot');
      risk += 50;
    }

    // Verificar si es IP privada/local (no debería ocurrir en producción)
    if (this.isPrivateIP(ipAddress)) {
      warnings.push('IP privada detectada');
      risk += 25;
    }

    return { warnings, risk };
  }

  // Análisis de email
  private analyzeEmail(email: string) {
    const warnings: string[] = [];
    let risk = 0;

    // Verificar intentos con el mismo email
    const currentAttempts = this.emailAttempts.get(email) || 0;
    this.emailAttempts.set(email, currentAttempts + 1);

    if (currentAttempts > 3) {
      warnings.push('Múltiples intentos con el mismo email');
      risk += 25;
    }

    // Verificar patrones sospechosos
    if (email.includes('+')) {
      warnings.push('Email con alias detectado');
      risk += 10;
    }

    // Verificar dominios gratuitos comunes
    const freeDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (freeDomains.includes(domain)) {
      // No es riesgo per se, pero lo notamos
      warnings.push('Dominio de email gratuito');
      risk += 5;
    }

    return { warnings, risk };
  }

  // Análisis de teléfono
  private analyzePhone(phone: string) {
    const warnings: string[] = [];
    let risk = 0;

    // Verificar patrones de números secuenciales
    const cleanPhone = phone.replace(/\D/g, '');
    if (this.hasSequentialDigits(cleanPhone)) {
      warnings.push('Número telefónico con patrón secuencial sospechoso');
      risk += 20;
    }

    // Verificar números repetidos
    if (this.hasRepeatedDigits(cleanPhone)) {
      warnings.push('Número telefónico con dígitos repetidos sospechosos');
      risk += 15;
    }

    return { warnings, risk };
  }

  // Análisis de comportamiento
  private analyzeBehavior(data: CompraCompleta, deviceInfo?: DeviceFingerprint) {
    const warnings: string[] = [];
    let risk = 0;

    // Verificar información del dispositivo
    if (deviceInfo) {
      // Verificar user agent sospechoso
      if (!deviceInfo.userAgent || deviceInfo.userAgent.length < 20) {
        warnings.push('User-Agent sospechoso o faltante');
        risk += 20;
      }

      // Verificar si las cookies están deshabilitadas (bot behavior)
      if (!deviceInfo.cookieEnabled) {
        warnings.push('Cookies deshabilitadas - posible automatización');
        risk += 15;
      }
    }

    // Analizar tiempo de llenado implícito (basado en timestamp vs complejidad)
    const dataComplexity = this.calculateFormComplexity(data);
    // En una implementación real, compararías con el tiempo real de llenado
    
    return { warnings, risk };
  }

  // Análisis de método de pago
  private analyzePayment(paymentMethod: string, amount: number) {
    const warnings: string[] = [];
    let risk = 0;

    const validMethods = ['OXXO', 'BanCoppel', 'Banco Azteca', 'Binance Pay'];
    
    if (!validMethods.includes(paymentMethod)) {
      warnings.push('Método de pago no reconocido');
      risk += 30;
    }

    // Verificar montos sospechosos
    if (amount > 5000) { // Más de $5000 USD
      warnings.push('Monto muy alto - requiere verificación manual');
      risk += 20;
    }

    if (amount % 10 !== 0) {
      warnings.push('Monto no es múltiplo exacto del precio por boleto');
      risk += 10;
    }

    return { warnings, risk };
  }

  // Utilities
  private isPrivateIP(ip: string): boolean {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^127\./,
      /^localhost$/
    ];
    return privateRanges.some(range => range.test(ip));
  }

  private hasSequentialDigits(phone: string): boolean {
    for (let i = 0; i < phone.length - 3; i++) {
      const sequence = phone.substr(i, 4);
      if (this.isSequential(sequence)) return true;
    }
    return false;
  }

  private isSequential(str: string): boolean {
    for (let i = 1; i < str.length; i++) {
      if (parseInt(str[i]) !== parseInt(str[i-1]) + 1) return false;
    }
    return true;
  }

  private hasRepeatedDigits(phone: string): boolean {
    return /(\d)\1{3,}/.test(phone);
  }

  private calculateFormComplexity(data: CompraCompleta): number {
    // Calculamos complejidad basada en cantidad de campos llenados
    let complexity = 0;
    complexity += data.nombre.length;
    complexity += data.apellidos.length;
    complexity += data.email.length;
    complexity += data.ciudad.length;
    complexity += (data.info_adicional?.length || 0);
    return complexity;
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD PARA COMPONENTES
// ============================================================================

// Hook para generar device fingerprint
export const generateDeviceFingerprint = (): DeviceFingerprint => {
  if (typeof window === 'undefined') {
    return {
      userAgent: '',
      screenResolution: '',
      timezone: '',
      language: '',
      platform: '',
      cookieEnabled: false,
      localStorageEnabled: false,
      sessionStorageEnabled: false
    };
  }

  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    localStorageEnabled: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })(),
    sessionStorageEnabled: (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    })()
  };
};

// Función para obtener IP del cliente (en producción usar servicio externo)
export const getClientIP = async (): Promise<string | null> => {
  try {
    // En producción, usar un servicio como ipify.org o similar
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return null;
  }
};

// Rate limiting simple
export const checkRateLimit = (identifier: string, maxAttempts: number = 10, windowMs: number = 300000): boolean => {
  if (typeof window === 'undefined') return true;
  
  const key = `rate_limit_${identifier}`;
  const now = Date.now();
  const attempts = JSON.parse(localStorage.getItem(key) || '[]');
  
  // Filtrar intentos dentro de la ventana de tiempo
  const recentAttempts = attempts.filter((timestamp: number) => now - timestamp < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false;
  }
  
  recentAttempts.push(now);
  localStorage.setItem(key, JSON.stringify(recentAttempts));
  return true;
};