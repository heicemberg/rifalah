// ============================================================================
// DECLARACIONES DE TIPOS GLOBALES PARA TYPESCRIPT
// ============================================================================

declare global {
  interface Window {
    // Raffle system properties
    __raffleSyncListenerSetup?: boolean;
    raffleCounterTest?: {
      testMath: () => boolean;
      forceUpdate: () => Promise<any>;
      getCounters: () => any;
      getListeners: () => number;
      runFullTest: () => boolean;
    };
    
    // Google Analytics & tracking
    gtag?: (command: string, targetId: string, config?: any) => void;
    dataLayer?: any[];
    raffleTracking?: {
      trackPurchase?: (data: any) => void;
      trackPageView?: (page: string) => void;
      trackEvent?: (action: string, data?: any) => void;
    };
    
    // Audio context for web audio API
    webkitAudioContext?: typeof AudioContext;
    
    // Custom events for raffle system
    dispatchEvent(event: CustomEvent<{
      source?: string;
      soldCount?: number;
      timestamp?: string;
    }>): boolean;
  }
  
  // Custom event types for better type safety
  interface RaffleCounterUpdateEvent extends CustomEvent {
    detail: {
      source: string;
      soldCount?: number;
      availableCount?: number;
      reservedCount?: number;
      timestamp?: string;
    };
  }
}

// Make this file a module to avoid global scope pollution
export {};