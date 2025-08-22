// ============================================================================
// ERROR BOUNDARY PARA MANEJO ROBUSTO DE ERRORES
// ============================================================================

'use client';

import React, { Component, ReactNode } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Llamar callback de error si se proporciona
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Renderizar fallback personalizado o por defecto
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-4">
              Ha ocurrido un error inesperado. Por favor, recarga la página para continuar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// CONTEXT ERROR BOUNDARY ESPECÍFICO
// ============================================================================

interface ContextErrorBoundaryProps {
  children: ReactNode;
  contextName: string;
  fallbackComponent?: ReactNode;
}

export const ContextErrorBoundary: React.FC<ContextErrorBoundaryProps> = ({
  children,
  contextName,
  fallbackComponent
}) => {
  const handleError = (error: Error) => {
    // Log específico para errores de contexto
    console.warn(`Context error in ${contextName}:`, error.message);
  };

  const fallback = fallbackComponent || (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-yellow-800 text-sm">
        <strong>Aviso:</strong> La funcionalidad de {contextName} no está disponible en este momento. 
        La aplicación continuará funcionando con funcionalidad limitada.
      </p>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

// ============================================================================
// HOC PARA PROTEGER COMPONENTES
// ============================================================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorBoundary;