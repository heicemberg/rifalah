'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Tipos mejorados con validación más estricta
interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  priceUsd?: number; // Para fallbacks
}

interface CryptoPrices {
  USDT: CryptoPrice;
  USDC: CryptoPrice;
  BTC: CryptoPrice;
  ETH: CryptoPrice;
  SOL: CryptoPrice;
}

interface ConvertedAmounts {
  USDT: number;
  USDC: number;
  BTC: number;
  ETH: number;
  SOL: number;
}

interface CacheData {
  prices: CryptoPrices;
  amounts: ConvertedAmounts;
  timestamp: number;
  mxnAmount: number;
}

interface LoadingStates {
  initial: boolean;
  refresh: boolean;
  retry: boolean;
}

interface RetryConfig {
  attempt: number;
  maxAttempts: number;
  baseDelay: number;
}

// Constantes
const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_KEY = 'crypto_prices_cache_v2';
const CACHE_TTL = 60 * 60 * 1000; // 1 hora en milliseconds
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hora
const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY = 1000; // 1 segundo
const TIMEOUT_MS = 10000; // 10 segundos

// Mapeo de IDs de CoinGecko
const CRYPTO_IDS = {
  USDT: 'tether',
  USDC: 'usd-coin',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana'
} as const;

// Precisión decimal por crypto
const DECIMAL_PRECISION = {
  USDT: 6,
  USDC: 6,
  BTC: 8,
  ETH: 6,
  SOL: 4
} as const;

// Precios de fallback (aproximados, se actualizan automáticamente)
const FALLBACK_PRICES_USD: Record<keyof CryptoPrices, number> = {
  USDT: 1.0,
  USDC: 1.0,
  BTC: 45000,
  ETH: 2500,
  SOL: 100
};

// Utilidades de cache
const getCachedData = (mxnAmount: number): CacheData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CacheData = JSON.parse(cached);
    const now = Date.now();
    
    // Verificar TTL y si el monto MXN coincide
    if (now - data.timestamp > CACHE_TTL || data.mxnAmount !== mxnAmount) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
};

const setCachedData = (prices: CryptoPrices, amounts: ConvertedAmounts, mxnAmount: number): void => {
  try {
    const cacheData: CacheData = {
      prices,
      amounts,
      timestamp: Date.now(),
      mxnAmount
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache crypto prices:', error);
  }
};

// Validación de datos de API
const validateApiResponse = (data: any): boolean => {
  try {
    const requiredCoins = Object.values(CRYPTO_IDS);
    
    for (const coinId of requiredCoins) {
      const coinData = data[coinId];
      if (!coinData || 
          typeof coinData.mxn !== 'number' || 
          coinData.mxn <= 0 ||
          !isFinite(coinData.mxn)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

// Fetch con timeout
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs: number = TIMEOUT_MS): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Delay para retry
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const useCryptoPrice = (mxnAmount: number = 250) => {
  // States principales
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [convertedAmounts, setConvertedAmounts] = useState<ConvertedAmounts | null>(null);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    refresh: false,
    retry: false
  });
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Refs para control
  const retryConfigRef = useRef<RetryConfig>({
    attempt: 0,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    baseDelay: BASE_RETRY_DELAY
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Estados derivados para compatibilidad
  const loading = loadingStates.initial || loadingStates.refresh;

  // Función para obtener USD/MXN rate como fallback
  const getUsdMxnRate = useCallback(async (): Promise<number> => {
    try {
      const response = await fetchWithTimeout(
        'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=mxn',
        { headers: { 'Accept': 'application/json' } },
        5000
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.usd?.mxn || 20; // Fallback aproximado
      }
    } catch {
      // Fallback silencioso
    }
    return 20; // Rate aproximado USD/MXN
  }, []);

  // Calcular montos convertidos
  const calculateConvertedAmounts = useCallback((prices: CryptoPrices, amount: number): ConvertedAmounts => {
    return {
      USDT: parseFloat((amount / prices.USDT.price).toFixed(DECIMAL_PRECISION.USDT)),
      USDC: parseFloat((amount / prices.USDC.price).toFixed(DECIMAL_PRECISION.USDC)),
      BTC: parseFloat((amount / prices.BTC.price).toFixed(DECIMAL_PRECISION.BTC)),
      ETH: parseFloat((amount / prices.ETH.price).toFixed(DECIMAL_PRECISION.ETH)),
      SOL: parseFloat((amount / prices.SOL.price).toFixed(DECIMAL_PRECISION.SOL))
    };
  }, []);

  // Función principal de fetch con retry automático
  const fetchPricesWithRetry = useCallback(async (isRefresh = false): Promise<void> => {
    const retryConfig = retryConfigRef.current;
    
    try {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setError(null);
      if (isRefresh) {
        setLoadingStates(prev => ({ ...prev, refresh: true }));
      }

      const response = await fetchWithTimeout(
        `${COINGECKO_API}?ids=${Object.values(CRYPTO_IDS).join(',')}&vs_currencies=mxn,usd&include_24hr_change=true`,
        {
          headers: { 'Accept': 'application/json' },
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const apiData = await response.json();

      // Validar datos recibidos
      if (!validateApiResponse(apiData)) {
        throw new Error('Invalid API response data');
      }

      // Mapear datos validados
      const prices: CryptoPrices = {
        USDT: {
          symbol: 'USDT',
          price: apiData[CRYPTO_IDS.USDT].mxn,
          change24h: apiData[CRYPTO_IDS.USDT].usd_24h_change || 0,
          priceUsd: apiData[CRYPTO_IDS.USDT].usd
        },
        USDC: {
          symbol: 'USDC',
          price: apiData[CRYPTO_IDS.USDC].mxn,
          change24h: apiData[CRYPTO_IDS.USDC].usd_24h_change || 0,
          priceUsd: apiData[CRYPTO_IDS.USDC].usd
        },
        BTC: {
          symbol: 'BTC',
          price: apiData[CRYPTO_IDS.BTC].mxn,
          change24h: apiData[CRYPTO_IDS.BTC].usd_24h_change || 0,
          priceUsd: apiData[CRYPTO_IDS.BTC].usd
        },
        ETH: {
          symbol: 'ETH',
          price: apiData[CRYPTO_IDS.ETH].mxn,
          change24h: apiData[CRYPTO_IDS.ETH].usd_24h_change || 0,
          priceUsd: apiData[CRYPTO_IDS.ETH].usd
        },
        SOL: {
          symbol: 'SOL',
          price: apiData[CRYPTO_IDS.SOL].mxn,
          change24h: apiData[CRYPTO_IDS.SOL].usd_24h_change || 0,
          priceUsd: apiData[CRYPTO_IDS.SOL].usd
        }
      };

      const amounts = calculateConvertedAmounts(prices, mxnAmount);
      
      // Actualizar estados
      setCryptoPrices(prices);
      setConvertedAmounts(amounts);
      setLastUpdate(new Date());
      
      // Guardar en cache
      setCachedData(prices, amounts, mxnAmount);
      
      // Reset retry config en caso de éxito
      retryConfig.attempt = 0;
      
      console.log('✅ Crypto prices updated successfully');

    } catch (error) {
      console.error('❌ Error fetching crypto prices:', error);
      
      // Manejar retry automático
      if (retryConfig.attempt < retryConfig.maxAttempts && 
          !(error instanceof DOMException && error.name === 'AbortError')) {
        
        retryConfig.attempt++;
        const retryDelay = retryConfig.baseDelay * Math.pow(2, retryConfig.attempt - 1);
        
        setLoadingStates(prev => ({ ...prev, retry: true }));
        setError(`Reintentando... (${retryConfig.attempt}/${retryConfig.maxAttempts})`);
        
        await delay(retryDelay);
        
        if (abortControllerRef.current?.signal.aborted) return;
        
        return fetchPricesWithRetry(isRefresh);
      }
      
      // Si agotamos los reintentos o hay error crítico
      if (retryConfig.attempt >= retryConfig.maxAttempts) {
        // Intentar usar fallback con USD/MXN rate
        try {
          const usdMxnRate = await getUsdMxnRate();
          const fallbackPrices: CryptoPrices = Object.entries(FALLBACK_PRICES_USD).reduce((acc, [symbol, usdPrice]) => {
            acc[symbol as keyof CryptoPrices] = {
              symbol,
              price: usdPrice * usdMxnRate,
              change24h: 0,
              priceUsd: usdPrice
            };
            return acc;
          }, {} as CryptoPrices);
          
          const fallbackAmounts = calculateConvertedAmounts(fallbackPrices, mxnAmount);
          
          setCryptoPrices(fallbackPrices);
          setConvertedAmounts(fallbackAmounts);
          setLastUpdate(new Date());
          setError('Usando precios aproximados (sin conexión a API)');
          
          console.warn('⚠️ Using fallback prices due to API failure');
          
        } catch (fallbackError) {
          setError('No se pueden obtener precios de criptomonedas. Inténtalo más tarde.');
          console.error('❌ Fallback also failed:', fallbackError);
        }
      } else {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      }
    } finally {
      setLoadingStates(prev => ({
        initial: false,
        refresh: false,
        retry: false
      }));
    }
  }, [mxnAmount, calculateConvertedAmounts, getUsdMxnRate]);

  // Función de refresh manual
  const refresh = useCallback(() => {
    retryConfigRef.current.attempt = 0; // Reset retry counter
    fetchPricesWithRetry(true);
  }, [fetchPricesWithRetry]);

  // Effect principal
  useEffect(() => {
    // Limpiar interval anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Intentar cargar desde cache primero
    const cachedData = getCachedData(mxnAmount);
    if (cachedData) {
      setCryptoPrices(cachedData.prices);
      setConvertedAmounts(cachedData.amounts);
      setLastUpdate(new Date(cachedData.timestamp));
      setLoadingStates({ initial: false, refresh: false, retry: false });
      console.log('✅ Loaded prices from cache');
    }

    // Fetch inicial (o actualización si cache está expirado)
    if (!cachedData) {
      fetchPricesWithRetry();
    }

    // Configurar interval de actualización (1 hora)
    intervalRef.current = setInterval(() => {
      fetchPricesWithRetry(true);
    }, UPDATE_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [mxnAmount, fetchPricesWithRetry]);

  // Efecto para recalcular amounts cuando cambia mxnAmount
  useEffect(() => {
    if (cryptoPrices && mxnAmount) {
      const newAmounts = calculateConvertedAmounts(cryptoPrices, mxnAmount);
      setConvertedAmounts(newAmounts);
    }
  }, [mxnAmount, cryptoPrices, calculateConvertedAmounts]);

  // Estados derivados memoizados
  const isStale = useMemo(() => {
    if (!lastUpdate) return true;
    return Date.now() - lastUpdate.getTime() > CACHE_TTL;
  }, [lastUpdate]);

  const highlightedCryptos = useMemo(() => {
    if (!cryptoPrices) return null;
    return {
      BTC: cryptoPrices.BTC,
      SOL: cryptoPrices.SOL
    };
  }, [cryptoPrices]);

  // Retornar API compatible + nuevas características
  return {
    // API original (compatibilidad)
    cryptoPrices,
    convertedAmounts,
    loading,
    error,
    lastUpdate,
    refresh,
    
    // Nuevas características
    loadingStates,
    isStale,
    highlightedCryptos,
    retryCount: retryConfigRef.current.attempt,
    cacheAge: lastUpdate ? Date.now() - lastUpdate.getTime() : null
  };
};

export default useCryptoPrice;