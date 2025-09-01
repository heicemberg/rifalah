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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
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
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: amount,
        currency: 'USD',
        items: [{
          item_id: 'raffle_ticket',
          item_name: 'Boleto Rifa Silverado Z71',
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
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Rifa Silverado Z71 2024',
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