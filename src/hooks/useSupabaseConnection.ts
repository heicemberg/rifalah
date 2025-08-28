import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseClient, getConnectionStatus } from '@/lib/supabase';
import { adminToast } from '@/lib/toast-utils';

interface ConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastCheck: Date | null;
  attempts: number;
  nextRetryIn: number;
}

const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 2000; // 2 seconds
const MAX_RETRY_DELAY = 60000; // 1 minute

// Exponential backoff con jitter para evitar thundering herd
function getRetryDelay(attempt: number): number {
  const baseDelay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt), MAX_RETRY_DELAY);
  const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
  return Math.floor(baseDelay + jitter);
}

export function useSupabaseConnection() {
  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isLoading: true,
    error: null,
    lastCheck: null,
    attempts: 0,
    nextRetryIn: 0
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Connection test with timeout and abort capability
  const testConnection = useCallback(async (signal?: AbortSignal): Promise<boolean> => {
    try {
      const supabase = await getSupabaseClient();
      
      // Test de conexión ligero con timeout
      const { data, error } = await Promise.race([
        supabase.from('customers').select('count', { count: 'exact', head: true }).limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 10000)
        )
      ]) as any;

      if (signal?.aborted) {
        throw new Error('Connection test aborted');
      }

      if (error) {
        // Manejar errores específicos de Supabase
        if (error.message.includes('database is paused')) {
          throw new Error('Base de datos pausada - Revisa tu plan de Supabase');
        }
        if (error.message.includes('project is paused')) {
          throw new Error('Proyecto Supabase pausado - Contacta al administrador');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('Rate limit alcanzado - Espera unos minutos');
        }
        if (error.message.includes('timeout')) {
          throw new Error('Timeout de conexión - Revisa tu red');
        }
        throw new Error(`Error de Supabase: ${error.message}`);
      }

      return true;
    } catch (error) {
      if (signal?.aborted) {
        return false;
      }
      throw error;
    }
  }, []);

  // Main connection function with retry logic
  const attemptConnection = useCallback(async (attemptNumber = 0): Promise<void> => {
    // Abort previous attempt
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      attempts: attemptNumber,
      nextRetryIn: 0
    }));

    try {
      console.log(`🔄 Testing Supabase connection (attempt ${attemptNumber + 1}/${MAX_RETRY_ATTEMPTS})`);
      adminToast.info(`Probando conexión (intento ${attemptNumber + 1}/${MAX_RETRY_ATTEMPTS})`);
      
      const connected = await testConnection(signal);
      
      if (signal.aborted) return;

      setState({
        isConnected: true,
        isLoading: false,
        error: null,
        lastCheck: new Date(),
        attempts: attemptNumber + 1,
        nextRetryIn: 0
      });

      console.log('✅ Supabase connection successful');
      adminToast.success('Conexión Supabase exitosa');
      
    } catch (error) {
      if (signal.aborted) return;

      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.error(`❌ Connection attempt ${attemptNumber + 1} failed:`, errorMessage);
      adminToast.error(`Intento ${attemptNumber + 1} falló: ${errorMessage}`);

      // Si hemos llegado al máximo de intentos
      if (attemptNumber >= MAX_RETRY_ATTEMPTS - 1) {
        setState({
          isConnected: false,
          isLoading: false,
          error: `Conexión falló después de ${MAX_RETRY_ATTEMPTS} intentos: ${errorMessage}`,
          lastCheck: new Date(),
          attempts: attemptNumber + 1,
          nextRetryIn: 0
        });
        return;
      }

      // Calcular delay para el siguiente intento
      const retryDelay = getRetryDelay(attemptNumber);
      
      setState({
        isConnected: false,
        isLoading: false,
        error: errorMessage,
        lastCheck: new Date(),
        attempts: attemptNumber + 1,
        nextRetryIn: Math.ceil(retryDelay / 1000)
      });

      // Countdown para el próximo intento
      let countdown = Math.ceil(retryDelay / 1000);
      countdownIntervalRef.current = setInterval(() => {
        countdown--;
        setState(prev => ({ ...prev, nextRetryIn: countdown }));
        
        if (countdown <= 0) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
        }
      }, 1000);

      // Programar siguiente intento
      console.log(`⏳ Retrying in ${retryDelay}ms...`);
      retryTimeoutRef.current = setTimeout(() => {
        attemptConnection(attemptNumber + 1);
      }, retryDelay);
    }
  }, [testConnection]);

  // Manual retry function
  const retry = useCallback(() => {
    cleanup();
    attemptConnection(0);
  }, [attemptConnection, cleanup]);

  // Initialize connection test
  useEffect(() => {
    // Solo en el cliente
    if (typeof window === 'undefined') return;

    attemptConnection(0);

    return cleanup;
  }, [attemptConnection, cleanup]);

  // Health check para conexiones activas
  useEffect(() => {
    if (!state.isConnected) return;

    const healthCheckInterval = setInterval(async () => {
      try {
        const connected = await testConnection();
        if (!connected) {
          console.warn('⚠️ Health check failed, reconnecting...');
          retry();
        }
      } catch (error) {
        console.warn('⚠️ Health check error, reconnecting...', error);
        retry();
      }
    }, 30000); // Health check cada 30 segundos

    return () => clearInterval(healthCheckInterval);
  }, [state.isConnected, retry, testConnection]);

  // Debug info
  const debugInfo = useCallback(() => {
    const status = getConnectionStatus();
    console.log('🔍 Connection Debug Info:', {
      ...status,
      currentState: state,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR'
    });
  }, [state]);

  return { 
    ...state, 
    retry,
    debugInfo,
    isRetrying: state.nextRetryIn > 0
  };
}