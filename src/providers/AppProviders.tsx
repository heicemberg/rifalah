// ============================================================================
// PROVIDERS PRINCIPALES DE LA APLICACIÓN - SIMPLIFIED FOR STATIC EXPORT
// ============================================================================

'use client';

import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

// ============================================================================
// TIPOS
// ============================================================================

interface AppProvidersProps {
  children: React.ReactNode;
}

// ============================================================================
// PROVIDER PRINCIPAL SIMPLIFICADO
// ============================================================================

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

// ============================================================================
// EXPORT
// ============================================================================

export default AppProviders;