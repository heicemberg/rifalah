'use client';

/**
 * PÁGINA DE TEST PARA SOLUCIÓN IPv6/NETLIFY
 * Verifica que la nueva configuración resuelva el problema de conectividad
 */

import { useEffect, useState } from 'react';
import { testNetlifySupabaseConnection } from '@/lib/supabase-netlify-fix';
import { verificarConexion } from '@/lib/supabase';

export default function TestNetlifyIPv6() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [environment, setEnvironment] = useState<any>(null);

  useEffect(() => {
    // Detectar entorno
    const env = {
      isNetlify: !!(process.env.NETLIFY === 'true' || process.env.CONTEXT),
      hasWindow: typeof window !== 'undefined',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      timestamp: new Date().toISOString()
    };
    setEnvironment(env);
  }, []);

  const runConnectionTest = async () => {
    setLoading(true);
    try {
      console.log('🧪 Iniciando test completo de conexión...');
      
      // Test con nueva configuración
      const netlifyResult = await testNetlifySupabaseConnection();
      
      // Test con configuración antigua para comparar
      let legacyResult;
      try {
        legacyResult = await verificarConexion();
      } catch (error) {
        legacyResult = { success: false, error: error instanceof Error ? error.message : 'Error legacy connection' };
      }
      
      const result = {
        netlifyOptimized: netlifyResult,
        legacyConnection: { success: legacyResult },
        comparison: {
          improvement: netlifyResult.success && !legacyResult ? 'FIXED' : netlifyResult.success === legacyResult ? 'SAME' : 'REGRESSION',
          recommendation: netlifyResult.success ? 'Usar configuración optimizada para Netlify' : 'Revisar configuración IPv6'
        },
        timestamp: new Date().toISOString()
      };
      
      setTestResult(result);
      console.log('📊 Test completo:', result);
      
    } catch (error) {
      console.error('❌ Error en test:', error);
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🔬 Test Solución IPv6/Netlify
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Información del Entorno</h2>
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <pre className="text-sm text-blue-800 whitespace-pre-wrap">
                {environment ? JSON.stringify(environment, null, 2) : 'Cargando...'}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={runConnectionTest}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '🔄 Probando conexión...' : '🧪 Ejecutar Test de Conexión'}
            </button>
          </div>

          {testResult && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700">Resultados del Test</h2>
              
              {/* Resultado principal */}
              <div className={`border rounded-lg p-4 ${
                testResult.netlifyOptimized?.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <h3 className="font-semibold mb-2">
                  {testResult.netlifyOptimized?.success ? '✅ Conexión Exitosa' : '❌ Conexión Fallida'}
                </h3>
                <p className="text-sm text-gray-700">
                  {testResult.netlifyOptimized?.success 
                    ? 'La nueva configuración IPv4/Netlify funciona correctamente'
                    : `Error: ${testResult.netlifyOptimized?.error || 'Error desconocido'}`
                  }
                </p>
              </div>

              {/* Comparación */}
              {testResult.comparison && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">📊 Análisis de Mejora</h3>
                  <p><strong>Resultado:</strong> {testResult.comparison.improvement}</p>
                  <p><strong>Recomendación:</strong> {testResult.comparison.recommendation}</p>
                </div>
              )}

              {/* Detalles técnicos */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">🔧 Detalles Técnicos</h3>
                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-64">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>

              {/* Explicación de la solución */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-blue-800">💡 Explicación de la Solución</h3>
                <div className="text-sm text-blue-700 space-y-2">
                  <p><strong>Problema:</strong> Netlify no soporta IPv6 nativamente, pero Supabase Direct Connection usa IPv6</p>
                  <p><strong>Solución:</strong> Detección automática de entorno Netlify y configuración optimizada</p>
                  <p><strong>Técnica:</strong> Headers especiales, timeouts extendidos, y fetch optimizado</p>
                  <p><strong>Resultado esperado:</strong> Conexión estable en Netlify sin cambios en desarrollo local</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}