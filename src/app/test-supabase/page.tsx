'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase, verificarConexion, guardarCompra } from '../../lib/supabase';

export default function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [envVars, setEnvVars] = useState<{ url: string; key: string }>({ url: '', key: '' });
  const [testResult, setTestResult] = useState<string>('');
  const [isTestingInsert, setIsTestingInsert] = useState(false);

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    // Verificar variables de entorno
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET'
    });

    // Probar conexión a Supabase solo si tenemos URL válida
    const testConnection = async () => {
      try {
        // Skip if using placeholder URL
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!url || url.includes('placeholder') || url === 'NOT_SET') {
          setConnectionStatus('error');
          setErrorMessage('Supabase URL not configured properly');
          return;
        }
        
        const { data, error } = await supabase.from('customers').select('count').limit(1);
        
        if (error) {
          throw error;
        }
        
        setConnectionStatus('success');
      } catch (error: any) {
        setConnectionStatus('error');
        setErrorMessage(error?.message || 'Error desconocido');
      }
    };

    testConnection();
  }, []);

  const testInsertData = async () => {
    setIsTestingInsert(true);
    setTestResult('Probando inserción de datos...');
    
    try {
      const datosTest = {
        nombre: 'Usuario Test',
        apellidos: 'Apellido Test',
        telefono: '+52 55 1234 5678',
        email: `test${Date.now()}@example.com`, // Email único
        estado: 'CDMX',
        ciudad: 'Ciudad de México',
        cantidad_boletos: 1,
        numeros_boletos: [1001],
        precio_unitario: 10.00,
        precio_total: 10.00,
        metodo_pago: 'Binance Pay'
      };

      const resultado = await guardarCompra(datosTest);
      setTestResult(`✅ ¡Inserción exitosa!\nCustomer ID: ${resultado.customer?.id}\nPurchase ID: ${resultado.purchase?.id}\nEmail: ${resultado.customer?.email}`);
    } catch (error: any) {
      setTestResult(`❌ Error al insertar datos:\n${error.message}`);
      console.error('Error completo:', error);
    }
    
    setIsTestingInsert(false);
  };

  const testConnectionDetailed = async () => {
    setTestResult('Probando conexión detallada...');
    
    try {
      const conexionOk = await verificarConexion();
      setTestResult(`✅ Conexión detallada: ${conexionOk ? 'EXITOSA' : 'FALLIDA'}`);
    } catch (error: any) {
      setTestResult(`❌ Error de conexión detallada:\n${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Diagnóstico de Supabase</h1>
        
        {/* Variables de entorno */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-bold mb-4">📋 Variables de Entorno</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>SUPABASE_URL:</span>
              <span className={envVars.url === 'NOT_SET' ? 'text-red-600' : 'text-green-600'}>
                {envVars.url === 'NOT_SET' ? '❌ No configurada' : '✅ Configurada'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>SUPABASE_ANON_KEY:</span>
              <span className={envVars.key === 'NOT_SET' ? 'text-red-600' : 'text-green-600'}>
                {envVars.key === 'NOT_SET' ? '❌ No configurada' : '✅ Configurada'}
              </span>
            </div>
            {envVars.url !== 'NOT_SET' && (
              <div className="mt-2 text-xs text-gray-600">
                URL: {envVars.url}
              </div>
            )}
          </div>
        </div>

        {/* Estado de conexión */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-bold mb-4">🔗 Estado de Conexión</h2>
          
          {connectionStatus === 'loading' && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              Probando conexión...
            </div>
          )}
          
          {connectionStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-xl">✅</span>
              Conexión exitosa a Supabase
            </div>
          )}
          
          {connectionStatus === 'error' && (
            <div className="text-red-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">❌</span>
                Error de conexión
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <strong>Error:</strong> {errorMessage}
              </div>
            </div>
          )}
        </div>

        {/* Botones de prueba */}
        {connectionStatus === 'success' && (
          <div className="bg-white rounded-lg p-6 mb-6 shadow">
            <h2 className="text-xl font-bold mb-4">🧪 Pruebas Adicionales</h2>
            <div className="space-y-3">
              <button
                onClick={testConnectionDetailed}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                🔍 Probar Conexión Detallada
              </button>
              <button
                onClick={testInsertData}
                disabled={isTestingInsert}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {isTestingInsert ? '⏳ Insertando...' : '📝 Probar Inserción de Datos'}
              </button>
            </div>
            
            {testResult && (
              <div className="mt-4 bg-gray-100 border rounded p-3">
                <h3 className="font-bold mb-2">Resultado:</h3>
                <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
              </div>
            )}
          </div>
        )}

        {/* Instrucciones de solución */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-800">💡 Soluciones</h2>
          
          {envVars.url === 'NOT_SET' || envVars.key === 'NOT_SET' ? (
            <div className="text-blue-700">
              <p className="mb-2">❌ Faltan variables de entorno:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Verifica que existe el archivo <code>.env.local</code></li>
                <li>Reinicia el servidor con <code>npm run dev</code></li>
                <li>Verifica las credenciales en Supabase</li>
              </ol>
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="text-blue-700">
              <p className="mb-2">🔧 Para resolver el error de conexión:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Ve a tu panel de Supabase</li>
                <li>Ejecuta el script SQL del esquema normalizado</li>
                <li>Verifica que las tablas <code>customers</code>, <code>purchases</code> y <code>tickets</code> existen</li>
                <li>Revisa las políticas RLS están configuradas</li>
              </ol>
            </div>
          ) : (
            <div className="text-green-700">
              <p>🎉 ¡Todo está funcionando correctamente!</p>
              <p className="text-sm mt-2">
                Puedes volver a la <Link href="/" className="underline">página principal</Link> 
                o ir al <Link href="/admin" className="underline">panel de admin</Link>.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}