// ============================================================================
// CONFIGURACIÓN ROBUSTA DE SUPABASE PARA NETLIFY - PRODUCCIÓN
// Soluciona errores de "modo offline" y variables de entorno
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { adminToast, isCurrentUserAdmin } from './toast-utils';

// ============================================================================
// CONFIGURACIÓN DE VARIABLES CON VALIDACIÓN COMPLETA
// ============================================================================

// Función para validar URL de Supabase
function validateSupabaseUrl(url: string | undefined): string {
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL no está definida');
  }
  
  // Remover trailing slash si existe
  const cleanUrl = url.replace(/\/$/, '');
  
  // Validar formato de URL
  if (!cleanUrl.includes('.supabase.co') && !cleanUrl.includes('localhost')) {
    throw new Error(`URL de Supabase inválida: ${cleanUrl}`);
  }
  
  return cleanUrl;
}

// Función para validar clave anónima
function validateAnonKey(key: string | undefined): string {
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no está definida');
  }
  
  // Validar que sea un JWT válido básicamente
  if (!key.startsWith('eyJ')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY no es un JWT válido');
  }
  
  return key;
}

// ============================================================================
// OBTENER Y VALIDAR VARIABLES DE ENTORNO
// ============================================================================

let supabaseUrl: string;
let supabaseAnonKey: string;

try {
  // Variables de entorno (runtime y build time)
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Log para debugging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Supabase Environment Check:', {
      url: envUrl ? `${envUrl.substring(0, 20)}...` : 'NOT SET',
      key: envKey ? `${envKey.substring(0, 10)}...` : 'NOT SET',
      nodeEnv: process.env.NODE_ENV
    });
  }
  
  supabaseUrl = validateSupabaseUrl(envUrl);
  supabaseAnonKey = validateAnonKey(envKey);
  
  console.log('✅ Supabase credentials validated successfully');
} catch (error) {
  console.error('❌ Supabase configuration error:', error);
  
  // En build time, usar valores mock para que no falle el build
  if (typeof window === 'undefined') {
    console.warn('⚠️ Using mock values for build time');
    supabaseUrl = 'https://mock.supabase.co';
    supabaseAnonKey = 'eyJmock';
  } else {
    // En runtime, re-throw el error
    throw error;
  }
}

// ============================================================================
// SINGLETON PATTERN CON RETRY LOGIC
// ============================================================================

let supabaseInstance: SupabaseClient | null = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

// Exponential backoff para evitar Fail2ban
function getRetryDelay(attempt: number): number {
  return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 segundos
}

// Crear cliente con configuración optimizada
function createSupabaseClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Evitar problemas en SSG
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 2 // Limitar eventos para evitar rate limiting
      }
    },
    global: {
      headers: {
        'X-Client-Info': 'rifa-silverado@1.0.0',
        'X-Client-Version': '2.0.0'
      },
      fetch: (url, options = {}) => {
        // Agregar timeout personalizado
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        return fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache'
          }
        }).finally(() => clearTimeout(timeoutId));
      }
    },
    db: {
      schema: 'public'
    }
  });
}

// Función para obtener cliente con retry logic
async function getSupabaseClient(): Promise<SupabaseClient> {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  
  // Si estamos en build time, crear mock client
  if (typeof window === 'undefined' && supabaseUrl === 'https://mock.supabase.co') {
    console.log('⏳ Creating mock client for build time');
    supabaseInstance = {} as SupabaseClient;
    return supabaseInstance;
  }
  
  // Intentar crear cliente real con retry logic
  for (let attempt = 0; attempt < MAX_CONNECTION_ATTEMPTS; attempt++) {
    try {
      console.log(`🔄 Attempting Supabase connection (${attempt + 1}/${MAX_CONNECTION_ATTEMPTS})`);
      adminToast.info(`Conectando a BD (${attempt + 1}/${MAX_CONNECTION_ATTEMPTS})`);
      
      supabaseInstance = createSupabaseClient();
      
      // Test de conexión básico
      if (typeof window !== 'undefined') {
        await testConnection(supabaseInstance);
      }
      
      console.log('✅ Supabase client created successfully');
      adminToast.success('Cliente Supabase creado exitosamente');
      connectionAttempts = 0; // Reset counter on success
      return supabaseInstance;
      
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt + 1} failed:`, error);
      
      connectionAttempts++;
      
      // Si no es el último intento, esperar antes del retry
      if (attempt < MAX_CONNECTION_ATTEMPTS - 1) {
        const delay = getRetryDelay(attempt);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Si todos los intentos fallaron
  console.error('💥 All connection attempts failed. Creating fallback client.');
  supabaseInstance = createSupabaseClient(); // Client básico sin test
  return supabaseInstance;
}

// ============================================================================
// TEST DE CONEXIÓN CON MANEJO DE ERRORES ESPECÍFICOS
// ============================================================================

async function testConnection(client: SupabaseClient): Promise<void> {
  try {
    // Test ligero que no consume muchos recursos
    const { data, error } = await client
      .from('customers')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      // Manejar errores específicos de Supabase
      if (error.message.includes('database is paused')) {
        throw new Error('La base de datos está pausada. Verifica tu plan de Supabase.');
      }
      
      if (error.message.includes('project is paused')) {
        throw new Error('El proyecto Supabase está pausado. Contacta al administrador.');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('Timeout de conexión. Revisa tu red o configuración de Supabase.');
      }
      
      if (error.message.includes('rate limit')) {
        throw new Error('Rate limit alcanzado. Espera unos minutos antes de intentar de nuevo.');
      }
      
      throw new Error(`Error de conexión: ${error.message}`);
    }
    
    console.log('✅ Connection test passed');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    throw error;
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD PARA DEBUGGING
// ============================================================================

export function getConnectionStatus(): {
  hasInstance: boolean;
  attempts: number;
  url: string;
  environment: string;
} {
  return {
    hasInstance: supabaseInstance !== null,
    attempts: connectionAttempts,
    url: supabaseUrl.substring(0, 30) + '...',
    environment: process.env.NODE_ENV || 'unknown'
  };
}

export function resetConnection(): void {
  console.log('🔄 Resetting Supabase connection...');
  supabaseInstance = null;
  connectionAttempts = 0;
}

// ============================================================================
// EXPORTAR CLIENTE Y FUNCIONES
// ============================================================================

// Cliente principal (lazy initialization)
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop, receiver) {
    // Para propiedades especiales, usar el target directamente
    if (prop === 'then' || prop === Symbol.asyncIterator) {
      return undefined;
    }
    
    // Para el resto, obtener cliente real
    return getSupabaseClient().then(client => {
      return Reflect.get(client, prop, receiver);
    });
  }
});

// Cliente síncrono (para casos donde ya sabemos que está inicializado)
export function getSupabaseSync(): SupabaseClient {
  if (!supabaseInstance) {
    throw new Error('Supabase client no está inicializado. Usa await getSupabaseClient()');
  }
  return supabaseInstance;
}

// Cliente async (recomendado)
export { getSupabaseClient };

// ============================================================================
// FUNCIÓN DE INICIALIZACIÓN MANUAL PARA CASOS ESPECIALES
// ============================================================================

export async function initializeSupabase(): Promise<boolean> {
  try {
    await getSupabaseClient();
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    return false;
  }
}

// Validar configuración al importar (solo en browser)
if (typeof window !== 'undefined') {
  initializeSupabase().catch(console.error);
}