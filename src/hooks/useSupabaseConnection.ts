import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastCheck: Date | null;
}

export function useSupabaseConnection() {
  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isLoading: true,
    error: null,
    lastCheck: null
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    async function testConnection() {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Test básico de conexión
        const { data, error } = await supabase
          .from('customers')
          .select('count', { count: 'exact', head: true });

        if (error) {
          throw new Error(`Supabase connection failed: ${error.message}`);
        }

        setState({
          isConnected: true,
          isLoading: false,
          error: null,
          lastCheck: new Date()
        });

        console.log('✅ Supabase connection successful');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
        setState({
          isConnected: false,
          isLoading: false,
          error: errorMessage,
          lastCheck: new Date()
        });

        console.error('❌ Supabase connection failed:', errorMessage);
        
        // Reintentar en 5 segundos
        timeoutId = setTimeout(testConnection, 5000);
      }
    }

    // Solo probar conexión en el cliente
    if (typeof window !== 'undefined') {
      testConnection();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const retry = () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('count', { count: 'exact', head: true });

        if (error) throw error;

        setState({
          isConnected: true,
          isLoading: false,
          error: null,
          lastCheck: new Date()
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Connection retry failed'
        }));
      }
    }, 1000);
  };

  return { ...state, retry };
}