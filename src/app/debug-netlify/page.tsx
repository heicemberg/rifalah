'use client';

/**
 * PÁGINA DE DEBUG PARA NETLIFY
 * 
 * Esta página muestra información de debugging en tiempo real
 * para identificar problemas de conexión Supabase en Netlify
 */

import { useEffect, useState } from 'react';
import { getConnectionStatus, initializeSupabase } from '@/lib/supabase-client';

interface DebugInfo {
  environment: {
    hasSupabaseUrl: boolean;
    hasSupabaseKey: boolean;
    supabaseUrlPreview: string;
    supabaseKeyPreview: string;
    nodeEnv: string;
    userAgent: string;
    location: string;
  };
  connection: {
    hasInstance: boolean;
    attempts: number;
    url: string;
    environment: string;
  };
  errors: string[];
  logs: string[];
}

export default function NetlifyDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [connectionTest, setConnectionTest] = useState<string>('⏳ Preparando...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recopilar información de debugging
    const gatherDebugInfo = async () => {
      const errors: string[] = [];
      const logs: string[] = [];

      try {
        logs.push('🔄 Iniciando diagnóstico...');
        
        // Información del entorno
        const envInfo = {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...' || 'NOT SET',
          supabaseKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 15) + '...' || 'NOT SET',
          nodeEnv: process.env.NODE_ENV || 'unknown',
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server-side',
          location: typeof window !== 'undefined' ? window.location.href : 'Server-side'
        };

        logs.push('✅ Información del entorno recopilada');

        // Estado de conexión
        let connectionInfo;
        try {
          connectionInfo = getConnectionStatus();
          logs.push('✅ Estado de conexión obtenido');
        } catch (error) {
          connectionInfo = {
            hasInstance: false,
            attempts: 0,
            url: 'Error getting status',
            environment: 'unknown'
          };
          errors.push(`Error obteniendo estado: ${error}`);
        }

        setDebugInfo({
          environment: envInfo,
          connection: connectionInfo,
          errors,
          logs
        });

        // Test de conexión
        logs.push('🔄 Iniciando test de conexión...');
        setConnectionTest('🔄 Probando conexión a Supabase...');
        
        try {
          const initResult = await initializeSupabase();
          if (initResult) {
            logs.push('✅ Inicialización exitosa');
            setConnectionTest('✅ Conexión exitosa a Supabase');
          } else {
            logs.push('❌ Inicialización falló');
            setConnectionTest('❌ Error al inicializar Supabase');
            errors.push('Inicialización de Supabase falló');
          }
        } catch (error) {
          logs.push(`❌ Error de conexión: ${error}`);
          setConnectionTest(`❌ Error de conexión: ${error}`);
          errors.push(`Error de conexión: ${error}`);
        }

        // Actualizar con logs finales
        setDebugInfo(prev => prev ? {
          ...prev,
          errors,
          logs
        } : null);

      } catch (error) {
        console.error('Error en diagnóstico:', error);
        setConnectionTest(`❌ Error general: ${error}`);
        errors.push(`Error general: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    gatherDebugInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500 mx-auto"></div>
            <h1 className="text-3xl font-bold mt-8">Ejecutando Diagnóstico...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center border-b border-gray-700 pb-8">
          <h1 className="text-4xl font-bold text-yellow-500 mb-4">
            🔍 Debug Netlify - Rifa Silverado Z71
          </h1>
          <p className="text-gray-300">
            Diagnóstico de conexión Supabase en Netlify
          </p>
        </div>

        {/* Test de Conexión */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">
            🔗 Test de Conexión
          </h2>
          <div className="text-xl p-4 rounded bg-gray-700">
            {connectionTest}
          </div>
        </div>

        {/* Información del Entorno */}
        {debugInfo && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              🌍 Variables de Entorno
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">NODE_ENV:</span>
                  <span className="ml-2 text-yellow-400">{debugInfo.environment.nodeEnv}</span>
                </div>
                <div>
                  <span className="font-semibold">User Agent:</span>
                  <span className="ml-2 text-gray-300 text-sm">
                    {debugInfo.environment.userAgent.substring(0, 60)}...
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-600 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">SUPABASE_URL:</span>
                    {debugInfo.environment.hasSupabaseUrl ? (
                      <span className="text-green-400">✅ Configurada</span>
                    ) : (
                      <span className="text-red-400">❌ NO configurada</span>
                    )}
                    <span className="ml-4 text-gray-300 font-mono text-sm">
                      {debugInfo.environment.supabaseUrlPreview}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">SUPABASE_KEY:</span>
                    {debugInfo.environment.hasSupabaseKey ? (
                      <span className="text-green-400">✅ Configurada</span>
                    ) : (
                      <span className="text-red-400">❌ NO configurada</span>
                    )}
                    <span className="ml-4 text-gray-300 font-mono text-sm">
                      {debugInfo.environment.supabaseKeyPreview}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estado de Conexión */}
        {debugInfo && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">
              ⚡ Estado de Conexión Supabase
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold">Cliente Inicializado:</span>
                <span className={`ml-2 ${debugInfo.connection.hasInstance ? 'text-green-400' : 'text-red-400'}`}>
                  {debugInfo.connection.hasInstance ? '✅ Sí' : '❌ No'}
                </span>
              </div>
              <div>
                <span className="font-semibold">Intentos de Conexión:</span>
                <span className="ml-2 text-yellow-400">{debugInfo.connection.attempts}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">URL:</span>
                <span className="ml-2 text-gray-300 font-mono text-sm">{debugInfo.connection.url}</span>
              </div>
            </div>
          </div>
        )}

        {/* Errores */}
        {debugInfo && debugInfo.errors.length > 0 && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-400 mb-4">
              ❌ Errores Detectados
            </h2>
            <div className="space-y-2">
              {debugInfo.errors.map((error, index) => (
                <div key={index} className="bg-red-800/50 p-3 rounded font-mono text-sm">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs */}
        {debugInfo && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              📋 Logs de Diagnóstico
            </h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {debugInfo.logs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-gray-300 p-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manual de Solución */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">
            🔧 Manual de Solución
          </h2>
          <div className="prose prose-invert text-sm space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">1. Variables de Entorno en Netlify</h3>
              <p>Ve a: <code className="bg-gray-700 px-2 py-1 rounded">Site Settings → Environment Variables</code></p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>NEXT_PUBLIC_SUPABASE_URL = https://ugmfmnwbynppdzkhvrih.supabase.co</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY = (tu clave completa)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">2. Redeploy</h3>
              <p>Después de configurar las variables, haz un <strong>nuevo deploy</strong> (no republish)</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">3. Verificar Logs</h3>
              <p>Revisa los logs de deploy y function logs en Netlify Dashboard</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm border-t border-gray-700 pt-8">
          <p>Generado: {new Date().toLocaleString()}</p>
          <p>Rifa Silverado Z71 2024 - Debug v1.0</p>
        </div>

      </div>
    </div>
  );
}