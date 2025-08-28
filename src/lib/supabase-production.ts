// ============================================================================
// CLIENTE SUPABASE OPTIMIZADO PARA NETLIFY PRODUCTION - SSG
// Configuración simplificada y robusta para static site generation
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// CONFIGURACIÓN DIRECTA SIN PROXY - OPTIMIZADO PARA SSG
// ============================================================================

// Obtener variables directamente del environment o usar fallbacks
const getSupabaseUrl = (): string => {
  // En build time, usar el valor hardcoded 
  const buildTimeUrl = 'https://ugmfmnwbynppdzkhvrih.supabase.co';
  
  // En runtime, intentar process.env primero, luego window, luego fallback
  if (typeof window !== 'undefined') {
    // Runtime en browser - buscar en window o process.env
    return process.env.NEXT_PUBLIC_SUPABASE_URL || 
           (window as any).__SUPABASE_URL__ || 
           buildTimeUrl;
  } else {
    // Build time o server side
    return process.env.NEXT_PUBLIC_SUPABASE_URL || buildTimeUrl;
  }
};

const getSupabaseKey = (): string => {
  // En build time, usar el valor hardcoded
  const buildTimeKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWZtbndieW5wcGR6a2h2cmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE4NzAsImV4cCI6MjA3MTQ1Nzg3MH0.MTNKqQCzmRETjULZ2PRx8mTK3hpR90tn6Pz36h1nMR4';
  
  // En runtime, intentar process.env primero, luego window, luego fallback  
  if (typeof window !== 'undefined') {
    // Runtime en browser
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
           (window as any).__SUPABASE_KEY__ || 
           buildTimeKey;
  } else {
    // Build time o server side
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || buildTimeKey;
  }
};

// ============================================================================
// CREAR CLIENTE OPTIMIZADO PARA PRODUCCIÓN
// ============================================================================

let supabaseClient: SupabaseClient | null = null;

const createSupabaseClientProduction = (): SupabaseClient => {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  console.log('🔧 Creating Supabase client for production:', {
    url: url.substring(0, 30) + '...',
    key: key.substring(0, 15) + '...',
    environment: process.env.NODE_ENV,
    hasWindow: typeof window !== 'undefined'
  });

  supabaseClient = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: typeof window !== 'undefined', // Solo en browser
      detectSessionInUrl: false, // Evitar problemas en SSG
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'rifa-silverado@1.0.0',
        'User-Agent': 'RifaApp/1.0'
      },
      // Fetch optimizado para producción
      fetch: typeof window !== 'undefined' ? (url, options = {}) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        return fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      } : undefined
    }
  });

  return supabaseClient;
};

// ============================================================================
// VERIFICACIÓN DE CONEXIÓN SIMPLIFICADA
// ============================================================================

export async function testSupabaseConnection(): Promise<{ 
  success: boolean; 
  error?: string; 
  details?: any; 
}> {
  try {
    const client = createSupabaseClientProduction();
    
    // Test básico de conexión
    const { data, error } = await client
      .from('customers')
      .select('count', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      
      // Manejar errores específicos
      let errorMessage = error.message;
      
      if (error.message.includes('database is paused')) {
        errorMessage = 'Base de datos pausada. Verifica tu plan de Supabase.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Timeout de conexión. Revisa la red.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit alcanzado. Espera unos minutos.';
      } else if (error.message.includes('unauthorized') || error.message.includes('Invalid API key')) {
        errorMessage = 'Credenciales inválidas. Revisa SUPABASE_URL y SUPABASE_ANON_KEY.';
      }
      
      return {
        success: false,
        error: errorMessage,
        details: {
          originalError: error.message,
          code: error.code,
          hint: error.hint
        }
      };
    }

    console.log('✅ Supabase connection test passed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Critical connection error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return {
      success: false,
      error: `Error crítico: ${errorMessage}`,
      details: { error }
    };
  }
}

// ============================================================================
// INYECTAR VARIABLES EN WINDOW PARA RUNTIME ACCESS
// ============================================================================

if (typeof window !== 'undefined') {
  // Inyectar variables en window para acceso en runtime
  (window as any).__SUPABASE_URL__ = getSupabaseUrl();
  (window as any).__SUPABASE_KEY__ = getSupabaseKey();
  
  console.log('🌐 Supabase variables injected into window object');
}

// ============================================================================
// EXPORTAR CLIENTE Y FUNCIONES
// ============================================================================

// Cliente principal - sin Proxy, directo
export const supabase = createSupabaseClientProduction();

// Función para obtener cliente (compatibilidad)
export const getSupabaseClient = () => supabase;

// Función de inicialización
export const initializeSupabase = async (): Promise<boolean> => {
  const result = await testSupabaseConnection();
  return result.success;
};

// Estado de conexión
export const getConnectionStatus = () => ({
  hasInstance: supabaseClient !== null,
  url: getSupabaseUrl().substring(0, 30) + '...',
  environment: process.env.NODE_ENV || 'unknown',
  ready: true
});

// Reset (para debugging)
export const resetConnection = () => {
  console.log('🔄 Resetting Supabase connection...');
  supabaseClient = null;
};

export default supabase;