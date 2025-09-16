'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface CryptoPrice {
  symbol: string;
  price: number;
  priceUsd: number;
  change24h: number;
  lastUpdate: number;
}

interface ConvertedAmount {
  amount: number;
  symbol: string;
  precision: number;
  formatted: string;
}

interface ConversionResult {
  USDT: ConvertedAmount;
  USDC: ConvertedAmount;
  BTC: ConvertedAmount;
  ETH: ConvertedAmount;
  SOL: ConvertedAmount;
  BNB: ConvertedAmount;
}

interface CryptoConversionState {
  prices: Record<string, CryptoPrice> | null;
  conversions: ConversionResult | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  isStale: boolean;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CRYPTO_SYMBOLS = ['USDT', 'USDC', 'BTC', 'ETH', 'SOL', 'BNB'] as const;
const COINGECKO_IDS = {
  USDT: 'tether',
  USDC: 'usd-coin',
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin'
} as const;

const DECIMAL_PRECISION = {
  USDT: 2,
  USDC: 2,
  BTC: 8,
  ETH: 6,
  SOL: 4,
  BNB: 4
} as const;

const CACHE_KEY = 'crypto_conversion_cache_v3';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const STALE_THRESHOLD = 10 * 60 * 1000; // 10 minutos
const API_TIMEOUT = 8000; // 8 segundos
const RETRY_ATTEMPTS = 2;
const RETRY_DELAY = 1500;

// Precios de fallback actualizados (enero 2025)
const FALLBACK_PRICES_USD = {
  USDT: 1.0,
  USDC: 1.0,
  BTC: 95000,
  ETH: 3200,
  SOL: 180,
  BNB: 650
} as const;

// ============================================================================
// UTILIDADES DE CACHE
// ============================================================================

interface CacheData {
  prices: Record<string, CryptoPrice>;
  conversions: ConversionResult;
  timestamp: number;
  mxnAmount: number;
}

const getCachedData = (mxnAmount: number): CacheData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

    // Verificar si está dentro del TTL y el monto coincide
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

const setCachedData = (prices: Record<string, CryptoPrice>, conversions: ConversionResult, mxnAmount: number): void => {
  try {
    const cacheData: CacheData = {
      prices,
      conversions,
      timestamp: Date.now(),
      mxnAmount
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache crypto data:', error);
  }
};

// ============================================================================
// UTILIDADES DE API
// ============================================================================

const fetchWithTimeout = async (url: string, timeout: number = API_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// LÓGICA DE CONVERSIÓN
// ============================================================================

const calculateConversion = (
  mxnAmount: number,
  prices: Record<string, CryptoPrice>
): ConversionResult => {
  const result = {} as ConversionResult;

  for (const symbol of CRYPTO_SYMBOLS) {
    const price = prices[symbol];
    if (!price) continue;

    const amount = mxnAmount / price.price;
    const precision = DECIMAL_PRECISION[symbol];
    const roundedAmount = parseFloat(amount.toFixed(precision));

    result[symbol] = {
      amount: roundedAmount,
      symbol,
      precision,
      formatted: `${roundedAmount.toFixed(precision)} ${symbol}`
    };
  }

  return result;
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useCryptoConversion = (mxnAmount: number = 250, enabled: boolean = true) => {
  const [state, setState] = useState<CryptoConversionState>({
    prices: null,
    conversions: null,
    loading: false,
    error: null,
    lastUpdate: null,
    isStale: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // ============================================================================
  // FETCH LOGIC
  // ============================================================================

  const fetchPrices = useCallback(async (isRetry = false): Promise<void> => {
    if (!enabled) return;

    try {
      // Cancelar request anterior
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      if (!isRetry) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const coinIds = Object.values(COINGECKO_IDS).join(',');
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=mxn,usd&include_24hr_change=true&precision=8`;

      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const apiData = await response.json();

      // Validar y mapear datos
      const prices: Record<string, CryptoPrice> = {};
      let hasValidData = true;

      for (const [symbol, coinId] of Object.entries(COINGECKO_IDS)) {
        const coinData = apiData[coinId];

        if (!coinData?.mxn || !coinData?.usd || typeof coinData.mxn !== 'number') {
          hasValidData = false;
          break;
        }

        prices[symbol] = {
          symbol,
          price: coinData.mxn,
          priceUsd: coinData.usd,
          change24h: coinData.usd_24h_change || 0,
          lastUpdate: Date.now()
        };
      }

      if (!hasValidData) {
        throw new Error('Invalid API response data');
      }

      // Calcular conversiones
      const conversions = calculateConversion(mxnAmount, prices);
      const now = new Date();

      // Actualizar estado
      setState({
        prices,
        conversions,
        loading: false,
        error: null,
        lastUpdate: now,
        isStale: false
      });

      // Guardar en cache
      setCachedData(prices, conversions, mxnAmount);

      // Reset retry counter
      retryCountRef.current = 0;

      console.log('✅ Crypto prices fetched successfully');

    } catch (error) {
      console.error('❌ Error fetching crypto prices:', error);

      // Retry logic
      if (!isRetry && retryCountRef.current < RETRY_ATTEMPTS) {
        retryCountRef.current++;
        console.log(`🔄 Retrying... (${retryCountRef.current}/${RETRY_ATTEMPTS})`);

        await delay(RETRY_DELAY);

        if (!abortControllerRef.current?.signal.aborted) {
          return fetchPrices(true);
        }
      }

      // Fallback to approximate prices
      if (retryCountRef.current >= RETRY_ATTEMPTS) {
        try {
          // Obtener USD/MXN rate aproximado
          const usdMxnRate = 20; // Valor aproximado, se puede mejorar con otra API

          const fallbackPrices: Record<string, CryptoPrice> = {};

          for (const [symbol, usdPrice] of Object.entries(FALLBACK_PRICES_USD)) {
            fallbackPrices[symbol] = {
              symbol,
              price: usdPrice * usdMxnRate,
              priceUsd: usdPrice,
              change24h: 0,
              lastUpdate: Date.now()
            };
          }

          const fallbackConversions = calculateConversion(mxnAmount, fallbackPrices);

          setState({
            prices: fallbackPrices,
            conversions: fallbackConversions,
            loading: false,
            error: 'Usando precios aproximados (sin conexión)',
            lastUpdate: new Date(),
            isStale: true
          });

          console.warn('⚠️ Using fallback prices');

        } catch (fallbackError) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'No se pueden obtener precios de criptomonedas',
            isStale: true
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido'
        }));
      }
    }
  }, [mxnAmount, enabled]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Cargar datos iniciales
  useEffect(() => {
    if (!enabled) return;

    // Intentar cargar desde cache
    const cachedData = getCachedData(mxnAmount);
    if (cachedData) {
      const now = Date.now();
      const isStale = now - cachedData.timestamp > STALE_THRESHOLD;

      setState({
        prices: cachedData.prices,
        conversions: cachedData.conversions,
        loading: false,
        error: null,
        lastUpdate: new Date(cachedData.timestamp),
        isStale
      });

      console.log('✅ Loaded crypto prices from cache');

      // Si está stale, refrescar en background
      if (isStale) {
        fetchPrices();
      }
    } else {
      // No hay cache, fetch inicial
      fetchPrices();
    }

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [mxnAmount, enabled, fetchPrices]);

  // Recalcular conversiones cuando cambia el monto
  useEffect(() => {
    if (state.prices && mxnAmount) {
      const newConversions = calculateConversion(mxnAmount, state.prices);
      setState(prev => ({ ...prev, conversions: newConversions }));
    }
  }, [mxnAmount, state.prices]);

  // ============================================================================
  // MEMOIZED RESULTS
  // ============================================================================

  const refresh = useCallback(() => {
    retryCountRef.current = 0;
    fetchPrices();
  }, [fetchPrices]);

  const stablecoins = useMemo(() => {
    if (!state.conversions) return null;
    return {
      USDT: state.conversions.USDT,
      USDC: state.conversions.USDC
    };
  }, [state.conversions]);

  const mainCryptos = useMemo(() => {
    if (!state.conversions) return null;
    return {
      BTC: state.conversions.BTC,
      ETH: state.conversions.ETH,
      SOL: state.conversions.SOL,
      BNB: state.conversions.BNB
    };
  }, [state.conversions]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Datos principales
    prices: state.prices,
    conversions: state.conversions,
    stablecoins,
    mainCryptos,

    // Estados
    loading: state.loading,
    error: state.error,
    lastUpdate: state.lastUpdate,
    isStale: state.isStale,

    // Acciones
    refresh,

    // Metadatos
    retryCount: retryCountRef.current,
    cacheAge: state.lastUpdate ? Date.now() - state.lastUpdate.getTime() : null
  };
};