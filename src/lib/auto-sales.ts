// ============================================================================
// SISTEMA DE VENTAS AUTOMÁTICAS REALISTA PARA RIFA
// ============================================================================

import { TOTAL_TICKETS } from './constants';
import { randomBetween } from './utils';

// ============================================================================
// CONFIGURACIÓN DEL SISTEMA DE VENTAS AUTOMÁTICAS
// ============================================================================

export interface AutoSalesConfig {
  // Porcentajes de venta diaria por período
  phase1DailyRate: number; // Días 1-14: 2-3% diario
  phase2DailyRate: number; // Días 15-28: 4-5% diario
  phase3DailyRate: number; // Días 29+: 1-2% diario
  
  // Límite máximo de venta automática
  maxSalePercentage: number; // 76% máximo
  
  // Horarios pico (más ventas)
  peakHours: number[]; // Viernes 6-10pm
  peakDays: number[]; // Días 15 y 30 (quincena)
  
  // Horarios de baja actividad
  lowActivityHours: number[]; // 2am-6am (casi cero ventas)
}

export const DEFAULT_AUTO_SALES_CONFIG: AutoSalesConfig = {
  phase1DailyRate: 2.5, // Promedio 2.5% diario primeros 14 días
  phase2DailyRate: 4.5, // Promedio 4.5% diario días 15-28
  phase3DailyRate: 1.5, // Promedio 1.5% diario después del día 28
  maxSalePercentage: 76,
  peakHours: [18, 19, 20, 21, 22], // 6pm-10pm
  peakDays: [15, 30], // Quincenas
  lowActivityHours: [2, 3, 4, 5, 6] // 2am-6am
};

// ============================================================================
// CALCULADORA DE VENTAS AUTOMÁTICAS
// ============================================================================

export class AutoSalesCalculator {
  private config: AutoSalesConfig;
  private startDate: Date;
  
  constructor(config: AutoSalesConfig = DEFAULT_AUTO_SALES_CONFIG) {
    this.config = config;
    this.startDate = new Date(); // Fecha de inicio de ventas públicas
  }
  
  /**
   * Calcula cuántos tickets deberían estar vendidos automáticamente en este momento
   */
  getCurrentAutoSoldCount(currentSoldCount: number): number {
    const now = new Date();
    const daysSinceStart = this.getDaysSinceStart(now);
    const currentHour = now.getHours();
    const currentDay = now.getDate();
    
    // Calcular porcentaje esperado según la fase
    let expectedPercentage = this.getExpectedPercentage(daysSinceStart);
    
    // Aplicar modificadores por horarios pico
    expectedPercentage = this.applyTimeModifiers(expectedPercentage, currentHour, currentDay);
    
    // Convertir a número de tickets
    const expectedTickets = Math.floor((expectedPercentage / 100) * TOTAL_TICKETS);
    
    // No exceder el límite máximo
    const maxTickets = Math.floor((this.config.maxSalePercentage / 100) * TOTAL_TICKETS);
    
    return Math.min(expectedTickets, maxTickets);
  }
  
  /**
   * Calcula los días transcurridos desde el inicio de ventas públicas
   */
  private getDaysSinceStart(currentDate: Date): number {
    const diffInMs = currentDate.getTime() - this.startDate.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Calcula el porcentaje esperado de ventas según la fase actual
   */
  private getExpectedPercentage(daysSinceStart: number): number {
    let totalPercentage = 38; // Empezamos con 38% de preventa
    
    // Fase 1: Días 1-14 (2-3% diario)
    if (daysSinceStart <= 14) {
      const phase1Days = Math.min(daysSinceStart, 14);
      const dailyVariation = randomBetween(-0.5, 0.5); // Variación aleatoria
      totalPercentage += (this.config.phase1DailyRate + dailyVariation) * phase1Days;
    } else {
      // Completar fase 1
      totalPercentage += this.config.phase1DailyRate * 14;
      
      // Fase 2: Días 15-28 (4-5% diario)
      if (daysSinceStart <= 28) {
        const phase2Days = daysSinceStart - 14;
        const dailyVariation = randomBetween(-0.5, 0.5);
        totalPercentage += (this.config.phase2DailyRate + dailyVariation) * phase2Days;
      } else {
        // Completar fase 2
        totalPercentage += this.config.phase2DailyRate * 14;
        
        // Fase 3: Días 29+ (1-2% diario)
        const phase3Days = daysSinceStart - 28;
        const dailyVariation = randomBetween(-0.3, 0.3);
        totalPercentage += (this.config.phase3DailyRate + dailyVariation) * phase3Days;
      }
    }
    
    return Math.min(totalPercentage, this.config.maxSalePercentage);
  }
  
  /**
   * Aplica modificadores de tiempo (horarios pico, quincenas, madrugada)
   */
  private applyTimeModifiers(basePercentage: number, hour: number, day: number): number {
    let modifiedPercentage = basePercentage;
    
    // Horarios de baja actividad (madrugada): reducir ventas 90%
    if (this.config.lowActivityHours.includes(hour)) {
      modifiedPercentage *= 0.1;
    }
    // Horarios pico y días de quincena: incrementar ventas
    else if (this.config.peakHours.includes(hour) || this.config.peakDays.includes(day)) {
      modifiedPercentage *= 1.3; // 30% más ventas
    }
    // Viernes en horarios pico: máximo incremento
    else if (new Date().getDay() === 5 && this.config.peakHours.includes(hour)) {
      modifiedPercentage *= 1.5; // 50% más ventas
    }
    
    return Math.min(modifiedPercentage, this.config.maxSalePercentage);
  }
  
  /**
   * Calcula cuántos tickets nuevos deberían venderse automáticamente
   */
  getTicketsToSellNow(currentSoldCount: number): number {
    const expectedCount = this.getCurrentAutoSoldCount(currentSoldCount);
    const ticketsToSell = Math.max(0, expectedCount - currentSoldCount);
    
    // Limitar ventas súbitas a máximo 50 tickets por vez
    return Math.min(ticketsToSell, 50);
  }
  
  /**
   * Verifica si está en horario de baja actividad
   */
  isLowActivityTime(): boolean {
    const currentHour = new Date().getHours();
    return this.config.lowActivityHours.includes(currentHour);
  }
  
  /**
   * Verifica si está en horario pico
   */
  isPeakTime(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDate();
    const isWeekenedEvening = now.getDay() === 5 && this.config.peakHours.includes(currentHour);
    
    return this.config.peakHours.includes(currentHour) || 
           this.config.peakDays.includes(currentDay) || 
           isWeekenedEvening;
  }
  
  /**
   * Obtiene el próximo intervalo de ventas automáticas en milisegundos
   */
  getNextSaleInterval(): number {
    if (this.isLowActivityTime()) {
      return randomBetween(300000, 600000); // 5-10 minutos en madrugada
    } else if (this.isPeakTime()) {
      return randomBetween(30000, 120000); // 30 segundos - 2 minutos en horario pico
    } else {
      return randomBetween(120000, 300000); // 2-5 minutos en horario normal
    }
  }
}

// ============================================================================
// SIMULADOR DE VENTAS AUTOMÁTICAS
// ============================================================================

export class AutoSalesSimulator {
  private calculator: AutoSalesCalculator;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(config?: AutoSalesConfig) {
    this.calculator = new AutoSalesCalculator(config);
  }
  
  /**
   * Inicia la simulación de ventas automáticas
   */
  start(onSale: (ticketsToSell: number) => void): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.scheduleNextSale(onSale);
  }
  
  /**
   * Detiene la simulación
   */
  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Programa la próxima venta automática
   */
  private scheduleNextSale(onSale: (ticketsToSell: number) => void): void {
    if (!this.isRunning) return;
    
    const interval = this.calculator.getNextSaleInterval();
    
    this.intervalId = setTimeout(() => {
      // Simular venta solo si no estamos en el límite máximo
      const currentSoldCount = 3800; // Este valor debería venir del store actual
      const ticketsToSell = this.calculator.getTicketsToSellNow(currentSoldCount);
      
      if (ticketsToSell > 0) {
        onSale(ticketsToSell);
      }
      
      // Programar la siguiente venta
      this.scheduleNextSale(onSale);
    }, interval);
  }
}

// ============================================================================
// ESTADÍSTICAS DE VENTAS
// ============================================================================

export interface SalesStats {
  totalSold: number;
  soldPercentage: number;
  remainingTickets: number;
  currentPhase: 'preventa' | 'fase1' | 'fase2' | 'fase3';
  isAtLimit: boolean;
  last24hSales: number;
  averageTicketsPerPurchase: number;
}

export function generateSalesStats(soldTickets: number[]): SalesStats {
  const totalSold = soldTickets.length;
  const soldPercentage = Math.round((totalSold / TOTAL_TICKETS) * 100);
  const remainingTickets = TOTAL_TICKETS - totalSold;
  
  // Determinar fase actual
  let currentPhase: SalesStats['currentPhase'] = 'preventa';
  if (totalSold > 3800) {
    const publicSales = totalSold - 3800;
    const daysEquivalent = publicSales / (TOTAL_TICKETS * 0.025); // Estimación basada en 2.5% diario
    
    if (daysEquivalent <= 14) currentPhase = 'fase1';
    else if (daysEquivalent <= 28) currentPhase = 'fase2';
    else currentPhase = 'fase3';
  }
  
  // Simular estadísticas de últimas 24 horas
  const last24hSales = randomBetween(847, 1200);
  const averageTicketsPerPurchase = 8.7;
  
  return {
    totalSold,
    soldPercentage,
    remainingTickets,
    currentPhase,
    isAtLimit: soldPercentage >= 76,
    last24hSales,
    averageTicketsPerPurchase
  };
}

// ============================================================================
// EXPORT DE UTILIDADES
// ============================================================================

export default AutoSalesCalculator;