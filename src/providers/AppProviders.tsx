// ============================================================================
// PROVIDERS PRINCIPALES DE LA APLICACIÓN
// ============================================================================

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ErrorBoundary, ContextErrorBoundary } from '../components/ErrorBoundary';
import { SoundProvider } from '../components/SoundEffects';
import { useRaffleStore } from '../stores/raffle-store';

// ============================================================================
// TIPOS
// ============================================================================

interface AppContextType {
  isHydrated: boolean;
  isClient: boolean;
}

interface AppProvidersProps {
  children: React.ReactNode;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AppContext = createContext<AppContextType>({
  isHydrated: false,
  isClient: false
});

// ============================================================================
// HOOK PARA USAR EL CONTEXTO DE APP
// ============================================================================

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    // Fallback seguro
    return {
      isHydrated: true,
      isClient: typeof window !== 'undefined'
    };
  }
  return context;
};

// ============================================================================
// PROVIDER DE HIDRATACIÓN
// ============================================================================

const HydrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsHydrated(true);
  }, []);

  const contextValue: AppContextType = {
    isHydrated,
    isClient
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ============================================================================
// PROVIDER DE INICIALIZACIÓN DEL STORE
// ============================================================================

const StoreInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializeTickets = useRaffleStore(state => state.initializeTickets);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      initializeTickets();
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing store:', error);
      // Aún así marcar como inicializado para no bloquear la app
      setIsInitialized(true);
    }
  }, [initializeTickets]);

  // Mostrar loading mientras se inicializa
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// ============================================================================
// PROVIDER PRINCIPAL COMBINADO
// ============================================================================

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <HydrationProvider>
        <ContextErrorBoundary contextName="Store">
          <StoreInitializer>
            <ContextErrorBoundary contextName="Audio">
              <SoundProvider>
                {children}
              </SoundProvider>
            </ContextErrorBoundary>
          </StoreInitializer>
        </ContextErrorBoundary>
      </HydrationProvider>
    </ErrorBoundary>
  );
};

// ============================================================================
// HOC PARA ASEGURAR HIDRATACIÓN
// ============================================================================

export function withHydration<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const { isHydrated, isClient } = useApp();

    // En el servidor o antes de hidratación, mostrar placeholder
    if (!isClient || !isHydrated) {
      return (
        <div className="min-h-screen bg-gray-50 animate-pulse">
          <div className="h-16 bg-gray-200 mb-4"></div>
          <div className="container mx-auto px-4 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withHydration(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// ============================================================================
// EXPORT
// ============================================================================

export default AppProviders;