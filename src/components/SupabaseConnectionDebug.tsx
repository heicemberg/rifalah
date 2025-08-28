'use client';

// ============================================================================
// COMPONENTE DE DEBUG PARA CONEXIÓN SUPABASE
// Muestra información útil para diagnosticar problemas de conexión
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { getConnectionStatus } from '@/lib/supabase';

interface DebugInfo {
  environment: string;
  hasSupabaseUrl: boolean;
  hasSupabaseKey: boolean;
  supabaseUrlPreview: string;
  supabaseKeyPreview: string;
  userAgent: string;
  timestamp: string;
  buildTime: boolean;
}

export function SupabaseConnectionDebug({ minimal = false }: { minimal?: boolean }) {
  const connection = useSupabaseConnection();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDetails, setShowDetails] = useState(!minimal);

  useEffect(() => {
    // Solo en el cliente
    if (typeof window === 'undefined') return;

    const info: DebugInfo = {
      environment: process.env.NODE_ENV || 'unknown',
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET',
      supabaseKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 15) + '...' || 'NOT SET',
      userAgent: window.navigator.userAgent,
      timestamp: new Date().toISOString(),
      buildTime: false
    };

    setDebugInfo(info);
  }, []);

  if (!debugInfo) {
    return <div className="text-sm text-gray-500">Loading debug info...</div>;
  }

  // Versión minimal para mostrar solo el estado
  if (minimal) {
    return (
      <div className="inline-flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${
          connection.isConnected ? 'bg-green-500' : 
          connection.isLoading ? 'bg-yellow-500 animate-pulse' : 
          'bg-red-500'
        }`} />
        <span className={`${
          connection.isConnected ? 'text-green-700' : 
          connection.isLoading ? 'text-yellow-700' : 
          'text-red-700'
        }`}>
          {connection.isConnected ? 'Online' : 
           connection.isLoading ? 'Connecting...' : 
           'Offline'}
        </span>
        {connection.isRetrying && (
          <span className="text-xs text-blue-600">
            (retry in {connection.nextRetryIn}s)
          </span>
        )}
      </div>
    );
  }

  // Versión completa para debugging
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm font-mono">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">🔍 Supabase Connection Debug</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-xs"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Estado de conexión */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="text-gray-600">Status:</span>
          <div className={`inline-flex items-center gap-2 ml-2 ${
            connection.isConnected ? 'text-green-700' : 
            connection.isLoading ? 'text-yellow-700' : 
            'text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              connection.isConnected ? 'bg-green-500' : 
              connection.isLoading ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`} />
            {connection.isConnected ? 'Connected' : 
             connection.isLoading ? 'Connecting...' : 
             'Disconnected'}
          </div>
        </div>
        
        <div>
          <span className="text-gray-600">Attempts:</span>
          <span className="ml-2 text-blue-700">
            {connection.attempts}/{5}
          </span>
        </div>
      </div>

      {/* Error message */}
      {connection.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {connection.error}
        </div>
      )}

      {/* Retry info */}
      {connection.isRetrying && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
          <strong>Retrying in:</strong> {connection.nextRetryIn} seconds
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={connection.retry}
          disabled={connection.isLoading}
          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
        >
          Retry Connection
        </button>
        <button
          onClick={connection.debugInfo}
          className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
        >
          Log Debug Info
        </button>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <div>
            <span className="text-gray-600">Environment:</span>
            <span className="ml-2 text-purple-700">{debugInfo.environment}</span>
          </div>
          
          <div>
            <span className="text-gray-600">Supabase URL:</span>
            <span className={`ml-2 ${debugInfo.hasSupabaseUrl ? 'text-green-700' : 'text-red-700'}`}>
              {debugInfo.supabaseUrlPreview}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600">Anon Key:</span>
            <span className={`ml-2 ${debugInfo.hasSupabaseKey ? 'text-green-700' : 'text-red-700'}`}>
              {debugInfo.supabaseKeyPreview}
            </span>
          </div>
          
          {connection.lastCheck && (
            <div>
              <span className="text-gray-600">Last Check:</span>
              <span className="ml-2 text-blue-700">
                {connection.lastCheck.toLocaleTimeString()}
              </span>
            </div>
          )}
          
          <div>
            <span className="text-gray-600">User Agent:</span>
            <div className="ml-2 text-xs text-gray-500 break-all">
              {debugInfo.userAgent.substring(0, 100)}...
            </div>
          </div>

          <div className="text-xs text-gray-500 pt-2 border-t">
            Debug timestamp: {debugInfo.timestamp}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook para usar información de debug en otros componentes
export function useSupabaseDebug() {
  const connection = useSupabaseConnection();
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInfo({
        connection,
        status: getConnectionStatus(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          timestamp: new Date().toISOString()
        }
      });
    }
  }, [connection]);

  return info;
}