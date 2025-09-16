'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
  priceUsd?: number;
}

interface CryptoPrices {
  USDT: CryptoPrice;
  USDC: CryptoPrice;
  BTC: CryptoPrice;
  ETH: CryptoPrice;
  SOL: CryptoPrice;
  BNB: CryptoPrice;
}

interface ConvertedAmounts {
  USDT: number;
  USDC: number;
  BTC: number;
  ETH: number;
  SOL: number;
  BNB: number;
  total: number;
}

interface CacheData {
  prices: CryptoPrices;
  amounts: ConvertedAmounts;
  timestamp: number;
  mxnAmount: number;
  apiSource: string;
}

interface LoadingStates {
  initial: boolean;
  refresh: boolean;
  retry: boolean;
}

interface ApiConfig {
  name: string;
  priority: number;
  fetcher: () => Promise<CryptoPrices>;
  timeout: number;
  supportsMXN: boolean;
}

interface RetryConfig {
  attempt: number;
  maxAttempts: number;
  baseDelay: number;
  currentApiIndex: number;
}

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const SUPPORTED_CRYPTOS = ['USDT', 'USDC', 'BTC', 'ETH', 'SOL', 'BNB'] as const;
type SupportedCrypto = typeof SUPPORTED_CRYPTOS[number];

// Cache configuration
const CACHE_KEY = 'crypto_prices_multi_api_v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for better freshness
const UPDATE_INTERVAL = 5 * 60 * 1000; // Update every 5 minutes
const STALE_THRESHOLD = 10 * 60 * 1000; // Consider stale after 10 minutes

// Retry configuration
const MAX_RETRY_ATTEMPTS = 2; // Per API
const BASE_RETRY_DELAY = 1000;
const API_TIMEOUT = 8000; // 8 seconds timeout per API

// Decimal precision for each crypto
const DECIMAL_PRECISION: Record<SupportedCrypto, number> = {
  USDT: 6,
  USDC: 6,
  BTC: 8,
  ETH: 6,
  SOL: 4,
  BNB: 4
};

// Static fallback prices (updated regularly)
const FALLBACK_PRICES_USD: Record<SupportedCrypto, number> = {
  USDT: 1.0,
  USDC: 1.0,
  BTC: 67500,
  ETH: 3800,
  SOL: 210,
  BNB: 650
};

// Approximate USD/MXN rate for fallbacks
const FALLBACK_USD_MXN_RATE = 18.5;

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class CryptoPriceService {
  private usdMxnRate: number = FALLBACK_USD_MXN_RATE;
  private lastMxnRateUpdate: number = 0;
  private readonly MXN_RATE_TTL = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.updateUsdMxnRate();
  }

  // Update USD/MXN exchange rate
  private async updateUsdMxnRate(): Promise<void> {
    if (Date.now() - this.lastMxnRateUpdate < this.MXN_RATE_TTL) {
      return; // Rate is still fresh
    }

    // Try multiple free exchange rate APIs
    const exchangeApis = [
      'https://api.fxapi.com/v1/latest?currencies=MXN&base=USD&api_key=fxapi-free',
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://api.fxapi.com/v1/latest?currencies=MXN'
    ];

    for (const apiUrl of exchangeApis) {
      try {
        const response = await this.fetchWithTimeout(apiUrl, {}, 5000);

        if (response.ok) {
          const data = await response.json();

          // Handle different API response formats
          let mxnRate = null;
          if (data.rates?.MXN) {
            mxnRate = data.rates.MXN;
          } else if (data.data?.MXN) {
            mxnRate = data.data.MXN;
          }

          if (mxnRate && typeof mxnRate === 'number' && mxnRate > 15 && mxnRate < 25) {
            this.usdMxnRate = mxnRate;
            this.lastMxnRateUpdate = Date.now();
            console.log(`💱 USD/MXN rate updated: ${this.usdMxnRate}`);
            return; // Success, exit the loop
          }
        }
      } catch (error) {
        console.warn(`⚠️ Exchange rate API failed: ${apiUrl}`, error);
        continue; // Try next API
      }
    }

    console.warn('⚠️ All exchange rate APIs failed, using fallback:', this.usdMxnRate);
  }

  // Fetch with timeout utility
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = API_TIMEOUT): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; RifaApp/1.0)',
          ...options.headers
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Convert USD prices to MXN
  private convertUsdToMxn(usdPrices: Record<SupportedCrypto, { price: number; change24h: number }>): CryptoPrices {
    const result: any = {};

    for (const crypto of SUPPORTED_CRYPTOS) {
      const usdData = usdPrices[crypto];
      result[crypto] = {
        symbol: crypto,
        price: usdData.price * this.usdMxnRate,
        change24h: usdData.change24h,
        priceUsd: usdData.price
      };
    }

    return result as CryptoPrices;
  }

  // API 1: CoinLore API (Primary - Free, reliable, no rate limits)
  async getCoinLorePrices(): Promise<CryptoPrices> {
    console.log('🔄 Fetching from CoinLore API...');

    // CoinLore IDs for our supported cryptos
    const coinIds = {
      'BTC': '90',      // Bitcoin
      'ETH': '80',      // Ethereum
      'BNB': '2710',    // BNB
      'SOL': '48543',   // Solana
      'USDT': '518',    // Tether
      'USDC': '33285'   // USD Coin
    };

    const ids = Object.values(coinIds).join(',');
    const response = await this.fetchWithTimeout(`https://api.coinlore.net/api/ticker/?id=${ids}`);

    if (!response.ok) {
      throw new Error(`CoinLore API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid CoinLore response format');
    }

    // Create ID to symbol mapping
    const idToSymbol: Record<string, SupportedCrypto> = {};
    Object.entries(coinIds).forEach(([symbol, id]) => {
      idToSymbol[id] = symbol as SupportedCrypto;
    });

    const usdPrices: Record<SupportedCrypto, { price: number; change24h: number }> = {
      USDT: { price: 1.0, change24h: 0 },
      USDC: { price: 1.0, change24h: 0 },
      BTC: { price: FALLBACK_PRICES_USD.BTC, change24h: 0 },
      ETH: { price: FALLBACK_PRICES_USD.ETH, change24h: 0 },
      SOL: { price: FALLBACK_PRICES_USD.SOL, change24h: 0 },
      BNB: { price: FALLBACK_PRICES_USD.BNB, change24h: 0 }
    };

    // Extract prices from response
    for (const coin of data) {
      const symbol = idToSymbol[coin.id];
      if (symbol && coin.price_usd) {
        usdPrices[symbol] = {
          price: parseFloat(coin.price_usd),
          change24h: parseFloat(coin.percent_change_24h) || 0
        };
      }
    }

    // Validate we got reasonable prices
    for (const crypto of SUPPORTED_CRYPTOS) {
      if (usdPrices[crypto].price <= 0) {
        throw new Error(`Invalid price for ${crypto} from CoinLore`);
      }
    }

    await this.updateUsdMxnRate();
    const result = this.convertUsdToMxn(usdPrices);

    console.log('✅ CoinLore API fetch successful');
    return result;
  }

  // API 2: CoinCap API (Secondary - Reliable alternative)
  async getCoinCapPrices(): Promise<CryptoPrices> {
    console.log('🔄 Fetching from CoinCap API...');

    const response = await this.fetchWithTimeout('https://api.coincap.io/v2/assets');

    if (!response.ok) {
      throw new Error(`CoinCap API error: ${response.status}`);
    }

    const { data } = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid CoinCap response format');
    }

    // Map CoinCap IDs to our symbols
    const coinCapMap: Record<string, SupportedCrypto> = {
      'tether': 'USDT',
      'usd-coin': 'USDC',
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'solana': 'SOL',
      'binance-coin': 'BNB'
    };

    const usdPrices: Record<SupportedCrypto, { price: number; change24h: number }> = {
      USDT: { price: 1.0, change24h: 0 },
      USDC: { price: 1.0, change24h: 0 },
      BTC: { price: FALLBACK_PRICES_USD.BTC, change24h: 0 },
      ETH: { price: FALLBACK_PRICES_USD.ETH, change24h: 0 },
      SOL: { price: FALLBACK_PRICES_USD.SOL, change24h: 0 },
      BNB: { price: FALLBACK_PRICES_USD.BNB, change24h: 0 }
    };

    // Extract prices from response
    for (const coin of data) {
      const symbol = coinCapMap[coin.id];
      if (symbol && coin.priceUsd) {
        usdPrices[symbol] = {
          price: parseFloat(coin.priceUsd),
          change24h: parseFloat(coin.changePercent24Hr) || 0
        };
      }
    }

    // Validate we got reasonable prices
    for (const crypto of SUPPORTED_CRYPTOS) {
      if (usdPrices[crypto].price <= 0) {
        throw new Error(`Invalid price for ${crypto} from CoinCap`);
      }
    }

    await this.updateUsdMxnRate();
    const result = this.convertUsdToMxn(usdPrices);

    console.log('✅ CoinCap API fetch successful');
    return result;
  }

  // API 3: Binance API (Tertiary - Public API, very reliable)
  async getBinancePrices(): Promise<CryptoPrices> {
    console.log('🔄 Fetching from Binance API...');

    // Get current prices for all symbols at once
    const response = await this.fetchWithTimeout('https://api.binance.com/api/v3/ticker/24hr');

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid Binance response format');
    }

    // Create symbol to data mapping
    const symbolMap = new Map();
    data.forEach((item: any) => {
      symbolMap.set(item.symbol, {
        price: parseFloat(item.lastPrice),
        change24h: parseFloat(item.priceChangePercent)
      });
    });

    // Map to our supported cryptos (using USDT pairs)
    const usdPrices: Record<SupportedCrypto, { price: number; change24h: number }> = {
      USDT: {
        price: 1.0, // USDT is always ~$1
        change24h: 0
      },
      USDC: {
        price: symbolMap.get('USDCUSDT')?.price || 1.0,
        change24h: symbolMap.get('USDCUSDT')?.change24h || 0
      },
      BTC: {
        price: symbolMap.get('BTCUSDT')?.price || FALLBACK_PRICES_USD.BTC,
        change24h: symbolMap.get('BTCUSDT')?.change24h || 0
      },
      ETH: {
        price: symbolMap.get('ETHUSDT')?.price || FALLBACK_PRICES_USD.ETH,
        change24h: symbolMap.get('ETHUSDT')?.change24h || 0
      },
      SOL: {
        price: symbolMap.get('SOLUSDT')?.price || FALLBACK_PRICES_USD.SOL,
        change24h: symbolMap.get('SOLUSDT')?.change24h || 0
      },
      BNB: {
        price: symbolMap.get('BNBUSDT')?.price || FALLBACK_PRICES_USD.BNB,
        change24h: symbolMap.get('BNBUSDT')?.change24h || 0
      }
    };

    // Validate we got reasonable prices
    for (const crypto of SUPPORTED_CRYPTOS) {
      if (usdPrices[crypto].price <= 0) {
        throw new Error(`Invalid price for ${crypto} from Binance`);
      }
    }

    await this.updateUsdMxnRate();
    const result = this.convertUsdToMxn(usdPrices);

    console.log('✅ Binance API fetch successful');
    return result;
  }

  // API 4: CoinGecko Simple API (No API key needed for basic requests)
  async getCoinGeckoPrices(): Promise<CryptoPrices> {
    console.log('🔄 Fetching from CoinGecko API...');

    // CoinGecko IDs for our supported cryptos
    const coinIds = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'SOL': 'solana',
      'USDT': 'tether',
      'USDC': 'usd-coin'
    };

    const ids = Object.values(coinIds).join(',');
    const response = await this.fetchWithTimeout(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    // Create ID to symbol mapping
    const idToSymbol: Record<string, SupportedCrypto> = {};
    Object.entries(coinIds).forEach(([symbol, id]) => {
      idToSymbol[id] = symbol as SupportedCrypto;
    });

    const usdPrices: Record<SupportedCrypto, { price: number; change24h: number }> = {
      USDT: { price: 1.0, change24h: 0 },
      USDC: { price: 1.0, change24h: 0 },
      BTC: { price: FALLBACK_PRICES_USD.BTC, change24h: 0 },
      ETH: { price: FALLBACK_PRICES_USD.ETH, change24h: 0 },
      SOL: { price: FALLBACK_PRICES_USD.SOL, change24h: 0 },
      BNB: { price: FALLBACK_PRICES_USD.BNB, change24h: 0 }
    };

    // Extract prices from response
    Object.entries(data).forEach(([coinId, priceData]: [string, any]) => {
      const symbol = idToSymbol[coinId];
      if (symbol && priceData.usd) {
        usdPrices[symbol] = {
          price: priceData.usd,
          change24h: priceData.usd_24h_change || 0
        };
      }
    });

    // Validate we got reasonable prices
    for (const crypto of SUPPORTED_CRYPTOS) {
      if (usdPrices[crypto].price <= 0) {
        throw new Error(`Invalid price for ${crypto} from CoinGecko`);
      }
    }

    await this.updateUsdMxnRate();
    const result = this.convertUsdToMxn(usdPrices);

    console.log('✅ CoinGecko API fetch successful');
    return result;
  }

  // Get fallback prices when all APIs fail
  getFallbackPrices(): CryptoPrices {
    console.log('⚠️ Using static fallback prices');

    const result: any = {};

    for (const crypto of SUPPORTED_CRYPTOS) {
      result[crypto] = {
        symbol: crypto,
        price: FALLBACK_PRICES_USD[crypto] * this.usdMxnRate,
        change24h: 0,
        priceUsd: FALLBACK_PRICES_USD[crypto]
      };
    }

    return result as CryptoPrices;
  }

  // Main method with full fallback chain - NUNCA FALLA
  async getPricesWithFallback(): Promise<{ prices: CryptoPrices; source: string }> {
    const apis: ApiConfig[] = [
      {
        name: 'CoinGecko',
        priority: 1,
        fetcher: () => this.getCoinGeckoPrices(),
        timeout: API_TIMEOUT,
        supportsMXN: false
      },
      {
        name: 'CoinLore',
        priority: 2,
        fetcher: () => this.getCoinLorePrices(),
        timeout: API_TIMEOUT,
        supportsMXN: false
      },
      {
        name: 'CoinCap',
        priority: 3,
        fetcher: () => this.getCoinCapPrices(),
        timeout: API_TIMEOUT,
        supportsMXN: false
      },
      {
        name: 'Binance',
        priority: 4,
        fetcher: () => this.getBinancePrices(),
        timeout: API_TIMEOUT,
        supportsMXN: false
      }
    ];

    // Try each API in order - LOGGING SILENCIOSO
    for (const api of apis) {
      try {
        console.log(`🔄 Probando ${api.name}...`);
        const prices = await api.fetcher();

        // Validate prices are reasonable
        const isValid = SUPPORTED_CRYPTOS.every(crypto => {
          const price = prices[crypto]?.price;
          return price && price > 0 && isFinite(price);
        });

        if (!isValid) {
          throw new Error(`Precios inválidos de ${api.name}`);
        }

        console.log(`✅ Precios obtenidos de ${api.name}`);
        return { prices, source: api.name };

      } catch (error) {
        // LOGGING SILENCIOSO - No molestamos al usuario
        console.warn(`⚠️ ${api.name} no disponible:`, error instanceof Error ? error.message : error);
        continue; // Try next API
      }
    }

    // FALLBACK GARANTIZADO - Si todas las APIs fallan
    console.log('📊 Usando precios de referencia');
    try {
      return {
        prices: this.getFallbackPrices(),
        source: 'Valores de Referencia'
      };
    } catch (fallbackError) {
      // ÚLTIMO RECURSO - Precios hardcoded que NUNCA fallan
      console.warn('⚠️ Usando precios fijos básicos');
      const emergencyPrices: CryptoPrices = {
        USDT: { symbol: 'USDT', price: 18.5, change24h: 0, priceUsd: 1.0 },
        USDC: { symbol: 'USDC', price: 18.5, change24h: 0, priceUsd: 1.0 },
        BTC: { symbol: 'BTC', price: 1248750, change24h: 0, priceUsd: 67500 },
        ETH: { symbol: 'ETH', price: 70300, change24h: 0, priceUsd: 3800 },
        SOL: { symbol: 'SOL', price: 3885, change24h: 0, priceUsd: 210 },
        BNB: { symbol: 'BNB', price: 12025, change24h: 0, priceUsd: 650 }
      };
      return { prices: emergencyPrices, source: 'Precios Fijos' };
    }
  }
}

// ============================================================================
// CACHE UTILITIES
// ============================================================================

const getCachedData = (mxnAmount: number): CacheData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const now = Date.now();

    // Check TTL and amount match
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

const setCachedData = (prices: CryptoPrices, amounts: ConvertedAmounts, mxnAmount: number, apiSource: string): void => {
  try {
    const cacheData: CacheData = {
      prices,
      amounts,
      timestamp: Date.now(),
      mxnAmount,
      apiSource
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache crypto prices:', error);
  }
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useCryptoPrice = (mxnAmount: number = 250) => {
  // Core states
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [convertedAmounts, setConvertedAmounts] = useState<ConvertedAmounts | null>(null);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    initial: true,
    refresh: false,
    retry: false
  });
  // Error state - NUNCA se muestra al usuario, solo para logging interno
  const [internalError, setInternalError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [apiSource, setApiSource] = useState<string>('Unknown');

  // Service and control refs
  const serviceRef = useRef<CryptoPriceService>(new CryptoPriceService());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryConfigRef = useRef<RetryConfig>({
    attempt: 0,
    maxAttempts: MAX_RETRY_ATTEMPTS,
    baseDelay: BASE_RETRY_DELAY,
    currentApiIndex: 0
  });

  // Derived states
  const loading = loadingStates.initial || loadingStates.refresh;

  // Calculate converted amounts
  const calculateConvertedAmounts = useCallback((prices: CryptoPrices, amount: number): ConvertedAmounts => {
    const result: any = { total: amount };

    for (const crypto of SUPPORTED_CRYPTOS) {
      const price = prices[crypto].price;
      const precision = DECIMAL_PRECISION[crypto];
      result[crypto] = parseFloat((amount / price).toFixed(precision));
    }

    return result as ConvertedAmounts;
  }, []);

  // Delay utility
  const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

  // Precios de emergencia cuando todo falla - NUNCA debe fallar esto
  const getEmergencyPrices = useCallback((): CryptoPrices => {
    const result: any = {};
    const emergencyUsdMxnRate = 18.5; // Tasa fija de emergencia

    for (const crypto of SUPPORTED_CRYPTOS) {
      result[crypto] = {
        symbol: crypto,
        price: FALLBACK_PRICES_USD[crypto] * emergencyUsdMxnRate,
        change24h: 0,
        priceUsd: FALLBACK_PRICES_USD[crypto]
      };
    }

    return result as CryptoPrices;
  }, []);

  // Main fetch function with retry logic - NUNCA muestra errores al usuario
  const fetchPricesWithRetry = useCallback(async (isRefresh = false): Promise<void> => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Reset internal error (solo para logging)
      setInternalError(null);
      if (isRefresh) {
        setLoadingStates(prev => ({ ...prev, refresh: true }));
      }

      // Fetch prices using multi-API service - CON FALLBACK GARANTIZADO
      const { prices, source } = await serviceRef.current.getPricesWithFallback();

      // Calculate amounts
      const amounts = calculateConvertedAmounts(prices, mxnAmount);

      // Update states - SIEMPRE tendremos precios válidos
      setCryptoPrices(prices);
      setConvertedAmounts(amounts);
      setLastUpdate(new Date());
      setApiSource(source);

      // Cache the results
      setCachedData(prices, amounts, mxnAmount, source);

      // Reset retry config on success
      retryConfigRef.current.attempt = 0;

      console.log(`✅ Precios actualizados desde ${source}`);

    } catch (error) {
      // LOGGING INTERNO - NUNCA visible al usuario
      console.warn('⚠️ Error en obtención de precios (usando fallback):', error);
      setInternalError(error instanceof Error ? error.message : 'Error desconocido');

      // SIEMPRE usar precios de fallback para que el usuario nunca vea errores
      try {
        const fallbackPrices = serviceRef.current.getFallbackPrices();
        const fallbackAmounts = calculateConvertedAmounts(fallbackPrices, mxnAmount);

        setCryptoPrices(fallbackPrices);
        setConvertedAmounts(fallbackAmounts);
        setLastUpdate(new Date());
        setApiSource('Valores de Referencia');

        console.log('✅ Usando precios de referencia (fallback)');
      } catch (fallbackError) {
        // Si hasta el fallback falla, usar precios fijos mínimos
        console.error('❌ Error crítico, usando precios fijos:', fallbackError);
        const emergencyPrices = getEmergencyPrices();
        const emergencyAmounts = calculateConvertedAmounts(emergencyPrices, mxnAmount);

        setCryptoPrices(emergencyPrices);
        setConvertedAmounts(emergencyAmounts);
        setLastUpdate(new Date());
        setApiSource('Precios Fijos');
      }

    } finally {
      // SIEMPRE terminar el loading - El usuario nunca ve errores
      setLoadingStates({
        initial: false,
        refresh: false,
        retry: false
      });
    }
  }, [mxnAmount, calculateConvertedAmounts]);

  // Manual refresh function
  const refresh = useCallback(() => {
    retryConfigRef.current.attempt = 0;
    fetchPricesWithRetry(true);
  }, [fetchPricesWithRetry]);

  // Main effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Try to load from cache first
    const cachedData = getCachedData(mxnAmount);
    if (cachedData) {
      setCryptoPrices(cachedData.prices);
      setConvertedAmounts(cachedData.amounts);
      setLastUpdate(new Date(cachedData.timestamp));
      setApiSource(cachedData.apiSource);
      setLoadingStates({ initial: false, refresh: false, retry: false });
      console.log(`✅ Loaded prices from cache (${cachedData.apiSource})`);
    }

    // Fetch fresh data if no cache or cache is stale
    if (!cachedData) {
      fetchPricesWithRetry();
    }

    // Set up refresh interval
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

  // Recalculate amounts when mxnAmount changes
  useEffect(() => {
    if (cryptoPrices && mxnAmount) {
      const newAmounts = calculateConvertedAmounts(cryptoPrices, mxnAmount);
      setConvertedAmounts(newAmounts);
    }
  }, [mxnAmount, cryptoPrices, calculateConvertedAmounts]);

  // Memoized derived states
  const isStale = useMemo(() => {
    if (!lastUpdate) return true;
    return Date.now() - lastUpdate.getTime() > STALE_THRESHOLD;
  }, [lastUpdate]);

  const highlightedCryptos = useMemo(() => {
    if (!cryptoPrices) return null;
    return {
      BTC: cryptoPrices.BTC,
      SOL: cryptoPrices.SOL
    };
  }, [cryptoPrices]);

  // Return comprehensive API - SIN ERRORES VISIBLES AL USUARIO
  return {
    // API principal - SIEMPRE con datos válidos
    cryptoPrices,
    convertedAmounts,
    loading,
    lastUpdate,
    refresh,

    // Enhanced features
    loadingStates,
    isStale,
    highlightedCryptos,
    retryCount: retryConfigRef.current.attempt,
    cacheAge: lastUpdate ? Date.now() - lastUpdate.getTime() : null,
    apiSource,

    // Status helpers - SIN mostrar errores al usuario
    isFromCache: !!getCachedData(mxnAmount),
    isUsingFallback: apiSource.includes('Referencia') || apiSource.includes('Fijos'),
    healthStatus: (isStale ? 'stale' : 'healthy') as 'healthy' | 'stale' // NUNCA 'error'
  };
};

export default useCryptoPrice;