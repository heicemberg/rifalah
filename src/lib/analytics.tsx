// ============================================================================
// SISTEMA DE ANALYTICS PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { useRaffleStore } from '../stores/raffle-store';
import type { PaymentMethodType } from './types';

// Declaración de tipo para gtag (Google Analytics)
declare global {
  function gtag(
    command: 'event',
    eventName: string,
    parameters?: Record<string, unknown>
  ): void;
}

// ============================================================================
// TIPOS
// ============================================================================

export type EventType = 
  | 'page_view'
  | 'ticket_select'
  | 'ticket_deselect'
  | 'quick_select'
  | 'purchase_start'
  | 'purchase_complete'
  | 'payment_method_select'
  | 'form_error'
  | 'form_complete'
  | 'sound_toggle'
  | 'realtime_activity'
  | 'admin_action'
  | 'error_occurred'
  | 'performance_metric';

export interface BaseEvent {
  type: EventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  page: string;
  userAgent: string;
  viewport: { width: number; height: number };
  properties?: Record<string, unknown>;
}

export interface TicketEvent extends BaseEvent {
  type: 'ticket_select' | 'ticket_deselect';
  properties: {
    ticketNumber: number;
    selectionMethod: 'manual' | 'quick_select';
    totalSelected: number;
    selectionTime: number;
  };
}

export interface PurchaseEvent extends BaseEvent {
  type: 'purchase_start' | 'purchase_complete';
  properties: {
    ticketCount: number;
    totalAmount: number;
    paymentMethod: PaymentMethodType;
    step?: string;
    completionTime?: number;
  };
}

export interface PerformanceEvent extends BaseEvent {
  type: 'performance_metric';
  properties: {
    metric: 'page_load' | 'component_render' | 'api_response';
    duration: number;
    component?: string;
    endpoint?: string;
  };
}

export type AnalyticsEvent = BaseEvent | TicketEvent | PurchaseEvent | PerformanceEvent;

export interface ConversionFunnel {
  page_views: number;
  ticket_selections: number;
  purchase_starts: number;
  purchase_completes: number;
  conversion_rate: number;
}

export interface UserSession {
  id: string;
  startTime: number;
  endTime?: number;
  events: AnalyticsEvent[];
  pageViews: string[];
  ticketsSelected: number[];
  purchaseAttempts: number;
  completedPurchases: number;
  deviceInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    platform: string;
    language: string;
  };
}

export interface AnalyticsConfig {
  enabled: boolean;
  consentGiven: boolean;
  trackingId?: string;
  batchSize: number;
  flushInterval: number;
  debug: boolean;
  privacyMode: boolean;
}

// ============================================================================
// CLASE ANALYTICS MANAGER
// ============================================================================

class AnalyticsManager {
  private static instance: AnalyticsManager | null = null;
  private config: AnalyticsConfig;
  private sessionId: string;
  private session: UserSession;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  private constructor() {
    this.config = this.loadConfig();
    this.sessionId = this.generateSessionId();
    this.session = this.initializeSession();
    
    if (this.config.enabled) {
      this.setupBatchSending();
      this.setupPerformanceTracking();
      this.setupErrorTracking();
    }
  }

  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  // ========================================================================
  // CONFIGURACIÓN Y INICIALIZACIÓN
  // ========================================================================

  private loadConfig(): AnalyticsConfig {
    try {
      const stored = localStorage.getItem('analytics-config');
      const defaultConfig: AnalyticsConfig = {
        enabled: true,
        consentGiven: false,
        batchSize: 10,
        flushInterval: 30000, // 30 segundos
        debug: process.env.NODE_ENV === 'development',
        privacyMode: false
      };

      return stored ? { ...defaultConfig, ...JSON.parse(stored) } : defaultConfig;
    } catch {
      return {
        enabled: true,
        consentGiven: false,
        batchSize: 10,
        flushInterval: 30000,
        debug: false,
        privacyMode: false
      };
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('analytics-config', JSON.stringify(this.config));
    } catch (error) {
      this.logDebug('Error saving config:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession(): UserSession {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      platform: navigator.platform,
      language: navigator.language
    };

    return {
      id: this.sessionId,
      startTime: Date.now(),
      events: [],
      pageViews: [],
      ticketsSelected: [],
      purchaseAttempts: 0,
      completedPurchases: 0,
      deviceInfo
    };
  }

  // ========================================================================
  // TRACKING DE EVENTOS
  // ========================================================================

  public track(type: EventType, properties?: Record<string, any>): void {
    if (!this.config.enabled || !this.config.consentGiven) {
      return;
    }

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      properties: this.sanitizeProperties(properties)
    };

    this.addEventToQueue(event);
    this.updateSession();
    this.logDebug('Event tracked:', event);
  }

  public trackTicketSelect(ticketNumber: number, method: 'manual' | 'quick_select', totalSelected: number): void {
    const selectionTime = performance.now();
    
    this.track('ticket_select', {
      ticketNumber,
      selectionMethod: method,
      totalSelected,
      selectionTime
    });

    // Actualizar sesión
    if (!this.session.ticketsSelected.includes(ticketNumber)) {
      this.session.ticketsSelected.push(ticketNumber);
    }
  }

  public trackTicketDeselect(ticketNumber: number, totalSelected: number): void {
    this.track('ticket_deselect', {
      ticketNumber,
      totalSelected
    });

    // Actualizar sesión
    this.session.ticketsSelected = this.session.ticketsSelected.filter(
      ticket => ticket !== ticketNumber
    );
  }

  public trackPurchaseStart(ticketCount: number, totalAmount: number, paymentMethod: PaymentMethodType): void {
    this.track('purchase_start', {
      ticketCount,
      totalAmount,
      paymentMethod,
      step: 'form'
    });

    this.session.purchaseAttempts++;
  }

  public trackPurchaseComplete(ticketCount: number, totalAmount: number, paymentMethod: PaymentMethodType, completionTime: number): void {
    this.track('purchase_complete', {
      ticketCount,
      totalAmount,
      paymentMethod,
      completionTime
    });

    this.session.completedPurchases++;
  }

  public trackPageView(page: string): void {
    this.track('page_view', {
      page,
      referrer: document.referrer,
      timestamp: Date.now()
    });

    if (!this.session.pageViews.includes(page)) {
      this.session.pageViews.push(page);
    }
  }

  public trackPerformance(metric: string, duration: number, details?: Record<string, any>): void {
    this.track('performance_metric', {
      metric,
      duration,
      ...details
    });
  }

  public trackError(error: Error, context?: string): void {
    this.track('error_occurred', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href
    });
  }

  // ========================================================================
  // GESTIÓN DE PRIVACIDAD Y CONSENTIMIENTO
  // ========================================================================

  public setConsent(granted: boolean): void {
    this.config.consentGiven = granted;
    this.saveConfig();

    if (granted) {
      this.logDebug('Analytics consent granted');
    } else {
      this.clearStoredData();
      this.logDebug('Analytics consent denied - data cleared');
    }
  }

  public getConsentStatus(): boolean {
    return this.config.consentGiven;
  }

  public enablePrivacyMode(): void {
    this.config.privacyMode = true;
    this.saveConfig();
  }

  public disablePrivacyMode(): void {
    this.config.privacyMode = false;
    this.saveConfig();
  }

  // ========================================================================
  // MÉTRICAS Y ANÁLISIS
  // ========================================================================

  public getConversionFunnel(): ConversionFunnel {
    const events = this.getStoredEvents();
    
    const pageViews = events.filter(e => e.type === 'page_view').length;
    const ticketSelections = events.filter(e => e.type === 'ticket_select').length;
    const purchaseStarts = events.filter(e => e.type === 'purchase_start').length;
    const purchaseCompletes = events.filter(e => e.type === 'purchase_complete').length;

    return {
      page_views: pageViews,
      ticket_selections: ticketSelections,
      purchase_starts: purchaseStarts,
      purchase_completes: purchaseCompletes,
      conversion_rate: pageViews > 0 ? (purchaseCompletes / pageViews) * 100 : 0
    };
  }

  public getTicketSelectionPatterns(): Record<string, any> {
    const events = this.getStoredEvents();
    const selectionEvents = events.filter(e => e.type === 'ticket_select') as TicketEvent[];

    const patterns = {
      totalSelections: selectionEvents.length,
      manualSelections: selectionEvents.filter(e => e.properties.selectionMethod === 'manual').length,
      quickSelections: selectionEvents.filter(e => e.properties.selectionMethod === 'quick_select').length,
      averageSelectionTime: 0,
      popularTicketRanges: this.calculatePopularRanges(selectionEvents)
    };

    const selectionTimes = selectionEvents
      .map(e => e.properties.selectionTime)
      .filter(time => time > 0);

    if (selectionTimes.length > 0) {
      patterns.averageSelectionTime = selectionTimes.reduce((a, b) => a + b, 0) / selectionTimes.length;
    }

    return patterns;
  }

  public getPaymentMethodUsage(): Record<PaymentMethodType, number> {
    const events = this.getStoredEvents();
    const purchaseEvents = events.filter(e => e.type === 'purchase_start') as PurchaseEvent[];

    const usage: Record<PaymentMethodType, number> = {
      binance: 0,
      bancoppel: 0,
      bancoazteca: 0,
      oxxo: 0
    };

    purchaseEvents.forEach(event => {
      if (event.properties.paymentMethod in usage) {
        usage[event.properties.paymentMethod]++;
      }
    });

    return usage;
  }

  public getSessionMetrics(): Record<string, any> {
    return {
      sessionDuration: Date.now() - this.session.startTime,
      pageViews: this.session.pageViews.length,
      eventsCount: this.session.events.length,
      ticketsSelected: this.session.ticketsSelected.length,
      purchaseAttempts: this.session.purchaseAttempts,
      completedPurchases: this.session.completedPurchases,
      deviceInfo: this.session.deviceInfo
    };
  }

  // ========================================================================
  // ALMACENAMIENTO Y BATCH SENDING
  // ========================================================================

  private addEventToQueue(event: AnalyticsEvent): void {
    this.eventQueue.push(event);
    this.session.events.push(event);

    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  private setupBatchSending(): void {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, this.config.flushInterval);
  }

  private flushEvents(): void {
    if (this.eventQueue.length === 0) return;

    try {
      // Guardar en localStorage para persistencia offline
      const storedEvents = this.getStoredEvents();
      const allEvents = [...storedEvents, ...this.eventQueue];
      localStorage.setItem('analytics-events', JSON.stringify(allEvents));

      // Simular envío a servidor (en producción sería una API call)
      this.sendToServer(this.eventQueue);

      this.logDebug('Flushed events:', this.eventQueue.length);
      this.eventQueue = [];
    } catch (error) {
      this.logDebug('Error flushing events:', error);
    }
  }

  private sendToServer(events: AnalyticsEvent[]): void {
    // En producción, aquí enviarías a tu endpoint de analytics
    if (this.config.debug) {
      console.group('📊 Analytics Events Sent');
      events.forEach(event => {
        console.log(`${event.type}:`, event);
      });
      console.groupEnd();
    }

    // Simular call a analytics provider (Google Analytics, Mixpanel, etc.)
    if (typeof gtag !== 'undefined') {
      events.forEach(event => {
        gtag('event', event.type, {
          event_category: 'raffle',
          event_label: event.page,
          custom_map: event.properties
        });
      });
    }
  }

  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('analytics-events');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private clearStoredData(): void {
    try {
      localStorage.removeItem('analytics-events');
      localStorage.removeItem('analytics-session');
      this.eventQueue = [];
      this.session.events = [];
    } catch (error) {
      this.logDebug('Error clearing stored data:', error);
    }
  }

  // ========================================================================
  // PERFORMANCE TRACKING
  // ========================================================================

  private setupPerformanceTracking(): void {
    // Navigation Timing
    if ('performance' in window && 'navigation' in performance) {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance('page_load', navigation.loadEventEnd - navigation.loadEventStart, {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstContentfulPaint: navigation.responseEnd - navigation.responseStart
          });
        }
      }, 1000);
    }

    // Performance Observer para Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'measure') {
              this.trackPerformance('component_render', entry.duration, {
                component: entry.name
              });
            }
          });
        });

        this.performanceObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        this.logDebug('Performance Observer not supported:', error);
      }
    }
  }

  private setupErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), 'global_error');
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'unhandled_promise');
    });
  }

  // ========================================================================
  // UTILIDADES PRIVADAS
  // ========================================================================

  private sanitizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;

    const sanitized: Record<string, any> = {};

    Object.keys(properties).forEach(key => {
      const value = properties[key];
      
      // Remover información sensible en modo privacidad
      if (this.config.privacyMode && this.isSensitiveField(key)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  private isSensitiveField(field: string): boolean {
    const sensitiveFields = ['email', 'phone', 'whatsapp', 'name', 'address'];
    return sensitiveFields.some(sensitive => field.toLowerCase().includes(sensitive));
  }

  private calculatePopularRanges(events: TicketEvent[]): Record<string, number> {
    const ranges: Record<string, number> = {
      '1-1000': 0,
      '1001-2000': 0,
      '2001-3000': 0,
      '3001-4000': 0,
      '4001-5000': 0,
      '5001-6000': 0,
      '6001-7000': 0,
      '7001-8000': 0,
      '8001-9000': 0,
      '9001-10000': 0
    };

    events.forEach(event => {
      const ticketNumber = event.properties.ticketNumber;
      const rangeKey = this.getTicketRange(ticketNumber);
      if (rangeKey in ranges) {
        ranges[rangeKey]++;
      }
    });

    return ranges;
  }

  private getTicketRange(ticketNumber: number): string {
    if (ticketNumber <= 1000) return '1-1000';
    if (ticketNumber <= 2000) return '1001-2000';
    if (ticketNumber <= 3000) return '2001-3000';
    if (ticketNumber <= 4000) return '3001-4000';
    if (ticketNumber <= 5000) return '4001-5000';
    if (ticketNumber <= 6000) return '5001-6000';
    if (ticketNumber <= 7000) return '6001-7000';
    if (ticketNumber <= 8000) return '7001-8000';
    if (ticketNumber <= 9000) return '8001-9000';
    return '9001-10000';
  }

  private updateSession(): void {
    // Actualizar información de sesión si es necesario
    this.session.endTime = Date.now();
  }

  private logDebug(message: string, ...args: unknown[]): void {
    if (this.config.debug) {
      console.log(`[Analytics] ${message}`, ...args);
    }
  }

  // ========================================================================
  // MÉTODOS PÚBLICOS DE CONTROL
  // ========================================================================

  public enable(): void {
    this.config.enabled = true;
    this.saveConfig();
  }

  public disable(): void {
    this.config.enabled = false;
    this.clearStoredData();
    this.saveConfig();
  }

  public exportData(): string {
    const data = {
      config: this.config,
      session: this.session,
      events: this.getStoredEvents(),
      metrics: {
        conversionFunnel: this.getConversionFunnel(),
        ticketPatterns: this.getTicketSelectionPatterns(),
        paymentUsage: this.getPaymentMethodUsage(),
        sessionMetrics: this.getSessionMetrics()
      }
    };

    return JSON.stringify(data, null, 2);
  }

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    this.flushEvents();
  }
}

// ============================================================================
// HOOK PARA COMPONENTES
// ============================================================================

export const useAnalytics = () => {
  const analytics = AnalyticsManager.getInstance();
  const store = useRaffleStore();
  
  // Refs para tracking de cambios
  const prevSelectedRef = useRef<number[]>([]);
  const prevSoldRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(Date.now());

  // Auto-tracking de cambios en el store
  useEffect(() => {
    const { selectedTickets } = store;

    // Track ticket selections/deselections
    const prevSelected = prevSelectedRef.current;
    const currentSelected = selectedTickets;

    // Nuevos tickets seleccionados
    const newlySelected = currentSelected.filter(ticket => !prevSelected.includes(ticket));
    newlySelected.forEach(ticket => {
      analytics.trackTicketSelect(ticket, 'manual', currentSelected.length);
    });

    // Tickets deseleccionados
    const deselected = prevSelected.filter(ticket => !currentSelected.includes(ticket));
    deselected.forEach(ticket => {
      analytics.trackTicketDeselect(ticket, currentSelected.length);
    });

    prevSelectedRef.current = [...selectedTickets];
  }, [store, analytics]);

  // Track purchases completadas
  useEffect(() => {
    const { soldTickets } = store;
    const prevSold = prevSoldRef.current;

    if (soldTickets.length > prevSold.length) {
      // Nueva compra completada
      const newTickets = soldTickets.length - prevSold.length;
      const completionTime = Date.now() - startTimeRef.current;
      
      analytics.trackPurchaseComplete(
        newTickets,
        newTickets * 50,
        'bancoppel', // Default, en una implementación real obtenerías esto del contexto
        completionTime
      );
    }

    prevSoldRef.current = [...soldTickets];
  }, [store, analytics]);

  // Track page views automáticamente
  useEffect(() => {
    analytics.trackPageView(window.location.pathname);
  }, [analytics]);

  // API del hook
  return {
    // Tracking methods
    track: analytics.track.bind(analytics),
    trackTicketSelect: analytics.trackTicketSelect.bind(analytics),
    trackPurchaseStart: analytics.trackPurchaseStart.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),

    // Privacy methods
    setConsent: analytics.setConsent.bind(analytics),
    getConsentStatus: analytics.getConsentStatus.bind(analytics),
    enablePrivacyMode: analytics.enablePrivacyMode.bind(analytics),
    disablePrivacyMode: analytics.disablePrivacyMode.bind(analytics),

    // Analytics methods
    getConversionFunnel: analytics.getConversionFunnel.bind(analytics),
    getTicketPatterns: analytics.getTicketSelectionPatterns.bind(analytics),
    getPaymentUsage: analytics.getPaymentMethodUsage.bind(analytics),
    getSessionMetrics: analytics.getSessionMetrics.bind(analytics),

    // Control methods
    enable: analytics.enable.bind(analytics),
    disable: analytics.disable.bind(analytics),
    exportData: analytics.exportData.bind(analytics)
  };
};

// ============================================================================
// COMPONENTE DE CONSENT BANNER
// ============================================================================

export const ConsentBanner: React.FC = () => {
  const { setConsent, getConsentStatus } = useAnalytics();
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    // Mostrar banner si no hay consentimiento
    const hasConsent = getConsentStatus();
    setShowBanner(!hasConsent);
  }, [getConsentStatus]);

  const handleAccept = () => {
    setConsent(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    setConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">🍪 Uso de Cookies y Analytics</h3>
          <p className="text-sm text-gray-300">
            Utilizamos cookies y analytics para mejorar tu experiencia y entender cómo usas nuestro sitio.
            Todos los datos son anónimos y seguros.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default AnalyticsManager;