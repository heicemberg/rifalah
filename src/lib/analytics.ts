// ============================================================================
// GOOGLE ANALYTICS 4 CONFIGURACIÓN
// ============================================================================

// Global types are now declared in src/types/global.d.ts

// Configuración de Google Analytics 4
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

// Inicializar Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag && GA_TRACKING_ID && GA_TRACKING_ID !== 'G-XXXXXXXXXX') {
    window.gtag('config', GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Enviar página vista
export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    window.gtag?.('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Eventos personalizados
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined') {
    window.gtag?.('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// ============================================================================
// EVENTOS ESPECÍFICOS DE LA RIFA
// ============================================================================

export const raffleEvents = {
  // Ticket selection
  ticketSelected: (ticketNumber: number, totalSelected: number) => {
    event({
      action: 'ticket_selected',
      category: 'rifa_engagement',
      label: `ticket_${ticketNumber}`,
      value: totalSelected
    });
  },

  // Purchase funnel
  startPurchase: (ticketCount: number, totalAmount: number) => {
    event({
      action: 'begin_checkout',
      category: 'rifa_purchase',
      label: `${ticketCount}_tickets`,
      value: totalAmount
    });
  },

  // Payment method selection
  paymentMethodSelected: (method: string, amount: number) => {
    event({
      action: 'payment_method_selected',
      category: 'rifa_purchase',
      label: method,
      value: amount
    });
  },

  // Purchase completion
  purchaseCompleted: (orderId: string, ticketCount: number, amount: number) => {
    // Standard ecommerce event
    event({
      action: 'purchase',
      category: 'rifa_conversion',
      label: orderId,
      value: amount
    });

    // Custom rifa event
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'purchase', {
        transaction_id: orderId,
        value: amount,
        currency: 'USD',
        items: [{
          item_id: 'raffle_ticket',
          item_name: 'Boleto Gana con la Cantrina - Audi A4 2024',
          category: 'raffle',
          quantity: ticketCount,
          price: amount / ticketCount
        }]
      });
    }
  },

  // Engagement events
  videoWatched: (videoName: string, progress: number) => {
    event({
      action: 'video_progress',
      category: 'rifa_engagement',
      label: `${videoName}_${progress}%`,
      value: progress
    });
  },

  // Social sharing
  socialShare: (platform: string, content: string) => {
    event({
      action: 'share',
      category: 'rifa_social',
      label: `${platform}_${content}`,
    });
  },

  // CTA clicks
  ctaClicked: (ctaName: string, location: string) => {
    event({
      action: 'cta_click',
      category: 'rifa_engagement',
      label: `${ctaName}_${location}`,
    });
  },

  // Form interactions
  formStarted: (formName: string) => {
    event({
      action: 'form_start',
      category: 'rifa_forms',
      label: formName,
    });
  },

  formCompleted: (formName: string, completionTime?: number) => {
    event({
      action: 'form_submit',
      category: 'rifa_forms',
      label: formName,
      value: completionTime
    });
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string) => {
    event({
      action: 'exception',
      category: 'rifa_errors',
      label: `${errorType}: ${errorMessage}`,
    });
  },

  // User engagement depth
  scrollDepth: (percentage: number) => {
    event({
      action: 'scroll',
      category: 'rifa_engagement',
      label: `${percentage}%`,
      value: percentage
    });
  },

  // Time on site milestones
  timeOnSite: (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if ([1, 3, 5, 10].includes(minutes)) {
      event({
        action: 'time_on_site',
        category: 'rifa_engagement',
        label: `${minutes}_minutes`,
        value: seconds
      });
    }
  }
};

// ============================================================================
// UTILIDADES DE CONVERSIÓN
// ============================================================================

export const trackConversion = {
  // Landing page optimization
  landingPageView: (source?: string, medium?: string, campaign?: string) => {
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'page_view', {
        page_title: 'Gana con la Cantrina - Audi A4 2024',
        page_location: window.location.href,
        source,
        medium,
        campaign
      });
    }
  },

  // A/B test tracking
  abTestView: (testName: string, variant: string) => {
    event({
      action: 'ab_test_view',
      category: 'rifa_optimization',
      label: `${testName}_${variant}`,
    });
  },

  // Conversion funnel
  funnelStep: (step: string, stepNumber: number) => {
    event({
      action: 'funnel_step',
      category: 'rifa_conversion',
      label: step,
      value: stepNumber
    });
  }
};

// Auto-track scroll depth
let scrollTrackingActive = false;

export const startScrollTracking = () => {
  if (scrollTrackingActive || typeof window === 'undefined') return;
  scrollTrackingActive = true;

  let maxScroll = 0;
  const trackingPoints = [25, 50, 75, 90];
  const tracked: number[] = [];

  const trackScroll = () => {
    const scrolled = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    maxScroll = Math.max(maxScroll, scrolled);

    trackingPoints.forEach(point => {
      if (maxScroll >= point && !tracked.includes(point)) {
        tracked.push(point);
        raffleEvents.scrollDepth(point);
      }
    });
  };

  window.addEventListener('scroll', trackScroll, { passive: true });
};

// Auto-track time on site
let timeTrackingActive = false;

export const startTimeTracking = () => {
  if (timeTrackingActive || typeof window === 'undefined') return;
  timeTrackingActive = true;

  const startTime = Date.now();

  const trackTime = () => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    raffleEvents.timeOnSite(seconds);
  };

  // Track every minute for the first 10 minutes
  const interval = setInterval(trackTime, 60000);

  // Stop tracking after 30 minutes
  setTimeout(() => {
    clearInterval(interval);
    timeTrackingActive = false;
  }, 30 * 60 * 1000);
};

// ============================================================================
// COMPREHENSIVE ANALYTICS SYSTEM - For Admin Dashboard
// ============================================================================

// Types for comprehensive analytics data
export interface AnalyticsEvent {
  id?: string;
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id: string;
  timestamp: string;
  user_agent?: string;
  referrer?: string;
  page_url: string;
  device_type: 'mobile' | 'desktop' | 'tablet';
}

// Analytics Class for comprehensive tracking
class ComprehensiveAnalyticsTracker {
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop';

    const userAgent = navigator.userAgent.toLowerCase();

    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }

    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }

    return 'desktop';
  }

  private async saveEvent(analyticsEvent: AnalyticsEvent): Promise<void> {
    try {
      // Save to localStorage for development/demo
      const events = this.getStoredEvents();
      events.push(analyticsEvent);
      localStorage.setItem('raffle_analytics', JSON.stringify(events.slice(-1000))); // Keep last 1000 events
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  private getStoredEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem('raffle_analytics');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Public tracking methods
  async trackPageView(page: string): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event_type: 'page_view',
      event_data: { page },
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof window !== 'undefined' ? document.referrer : '',
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_type: this.getDeviceType(),
    };

    await this.saveEvent(analyticsEvent);

    // Also track with Google Analytics
    pageview(page);
  }

  async trackTicketSelection(tickets: number[], method: 'quick' | 'manual'): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event_type: 'ticket_selection',
      event_data: {
        ticketCount: tickets.length,
        selectionMethod: method,
        ticketNumbers: tickets.slice(0, 10), // Store first 10 for analysis
      },
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_type: this.getDeviceType(),
    };

    await this.saveEvent(analyticsEvent);

    // Also track with Google Analytics
    raffleEvents.ticketSelected(tickets[0] || 0, tickets.length);
  }

  async trackPaymentMethodSelected(method: string): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event_type: 'payment_method_selected',
      event_data: { paymentMethod: method },
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_type: this.getDeviceType(),
    };

    await this.saveEvent(analyticsEvent);

    // Also track with Google Analytics
    raffleEvents.paymentMethodSelected(method, 0);
  }

  async trackPurchaseAttempt(ticketCount: number, paymentMethod: string, totalAmount: number): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event_type: 'purchase_attempt',
      event_data: {
        ticketCount,
        paymentMethod,
        totalAmount,
      },
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_type: this.getDeviceType(),
    };

    await this.saveEvent(analyticsEvent);

    // Also track with Google Analytics
    raffleEvents.startPurchase(ticketCount, totalAmount);
  }

  async trackPurchaseCompleted(ticketCount: number, paymentMethod: string, totalAmount: number): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event_type: 'purchase_completed',
      event_data: {
        ticketCount,
        paymentMethod,
        totalAmount,
      },
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_type: this.getDeviceType(),
    };

    await this.saveEvent(analyticsEvent);

    // Also track with Google Analytics
    raffleEvents.purchaseCompleted(`order_${Date.now()}`, ticketCount, totalAmount);
  }

  async trackModalInteraction(action: 'opened' | 'closed' | 'step_advanced' | 'abandoned', step?: number): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event_type: 'modal_interaction',
      event_data: {
        action,
        step,
        timeInModal: Date.now() - this.startTime,
      },
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_type: this.getDeviceType(),
    };

    await this.saveEvent(analyticsEvent);

    // Also track with Google Analytics
    event({
      action: `modal_${action}`,
      category: 'user_interaction',
      label: step ? `step_${step}` : action,
    });
  }

  async trackCryptoInteraction(action: string, currency?: string): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      event_type: 'crypto_interaction',
      event_data: {
        action,
        currency,
      },
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      device_type: this.getDeviceType(),
    };

    await this.saveEvent(analyticsEvent);

    // Also track with Google Analytics
    event({
      action: 'crypto_interaction',
      category: 'payment',
      label: `${action}_${currency || 'unknown'}`,
    });
  }
}

// Global comprehensive analytics instance
export const analytics = new ComprehensiveAnalyticsTracker();