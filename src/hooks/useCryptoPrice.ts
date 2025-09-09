'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
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
  cryptoPrices: CryptoPrices;
  convertedAmounts: ConvertedAmounts;
  timestamp: number;
  mxnToUsdRate: number;
}

// API endpoints with fallbacks
const CRYPTO_APIS = [
  'https://api.coingecko.com/api/v3/simple/price',
  'https://api.coinbase.com/v2/exchange-rates' // fallback if needed
];

const EXCHANGE_RATE_APIS = [
  'https://api.exchangerate-api.com/v4/latest/MXN',
  'https://api.fixer.io/latest?base=MXN', // fallback if needed
];

// Cache configuration
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes
const CACHE_KEY = 'crypto_price_cache';

// Fallback/default prices (approximate values)
const FALLBACK_CRYPTO_PRICES: CryptoPrices = {
  USDT: { symbol: 'USDT', price: 1.0, change24h: 0 },
  USDC: { symbol: 'USDC', price: 1.0, change24h: 0 },
  BTC: { symbol: 'BTC', price: 110000, change24h: 0 },
  ETH: { symbol: 'ETH', price: 4300, change24h: 0 },
  SOL: { symbol: 'SOL', price: 215, change24h: 0 }
};

const FALLBACK_MXN_TO_USD = 0.0536; // Approximate rate

export const useCryptoPrice = (mxnAmount: number = 250) => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [convertedAmounts, setConvertedAmounts] = useState<ConvertedAmounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Network status detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache management
  const saveToCache = useCallback((data: CacheData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      // Silently fail if localStorage is not available
      console.warn('Failed to save crypto price cache:', err);
    }
  }, []);

  const loadFromCache = useCallback((): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CacheData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp <= CACHE_DURATION) {
        return data;
      }
    } catch (err) {
      console.warn('Failed to load crypto price cache:', err);
    }
    return null;
  }, []);

  // Robust fetch with timeout and retry
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  // Get MXN to USD rate with fallback
  const fetchExchangeRate = async (): Promise<number> => {
    for (const apiUrl of EXCHANGE_RATE_APIS) {
      try {
        const data = await fetchWithTimeout(apiUrl, {}, 8000);
        
        if (data.rates && typeof data.rates.USD === 'number') {
          return data.rates.USD;
        }
      } catch (err) {
        console.warn(`Exchange rate API failed: ${apiUrl}`, err);
        continue;
      }
    }
    
    // Use fallback rate
    console.warn('All exchange rate APIs failed, using fallback rate');
    return FALLBACK_MXN_TO_USD;
  };

  // Get crypto prices with fallback
  const fetchCryptoPrices = async (): Promise<CryptoPrices> => {
    try {
      const data = await fetchWithTimeout(
        `${CRYPTO_APIS[0]}?ids=tether,usd-coin,bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true`,
        {},
        8000
      );
      
      // Validate data structure
      const requiredKeys = ['tether', 'usd-coin', 'bitcoin', 'ethereum', 'solana'];
      const hasAllKeys = requiredKeys.every(key => 
        data[key] && 
        typeof data[key].usd === 'number' && 
        typeof data[key].usd_24h_change === 'number'
      );
      
      if (!hasAllKeys) {
        throw new Error('Invalid API response structure');
      }
      
      return {
        USDT: {
          symbol: 'USDT',
          price: data.tether.usd,
          change24h: data.tether.usd_24h_change
        },
        USDC: {
          symbol: 'USDC',
          price: data['usd-coin'].usd,
          change24h: data['usd-coin'].usd_24h_change
        },
        BTC: {
          symbol: 'BTC',
          price: data.bitcoin.usd,
          change24h: data.bitcoin.usd_24h_change
        },
        ETH: {
          symbol: 'ETH',
          price: data.ethereum.usd,
          change24h: data.ethereum.usd_24h_change
        },
        SOL: {
          symbol: 'SOL',
          price: data.solana.usd,
          change24h: data.solana.usd_24h_change
        }
      };
    } catch (err) {
      console.warn('CoinGecko API failed, using fallback prices:', err);
      return FALLBACK_CRYPTO_PRICES;
    }
  };

  // Calculate converted amounts
  const calculateConvertedAmounts = (usdAmount: number, prices: CryptoPrices): ConvertedAmounts => {
    return {
      USDT: parseFloat((usdAmount / prices.USDT.price).toFixed(6)),
      USDC: parseFloat((usdAmount / prices.USDC.price).toFixed(6)),
      BTC: parseFloat((usdAmount / prices.BTC.price).toFixed(8)),
      ETH: parseFloat((usdAmount / prices.ETH.price).toFixed(6)),
      SOL: parseFloat((usdAmount / prices.SOL.price).toFixed(4))
    };
  };

  // Main fetch function with comprehensive error handling
  const fetchPrices = useCallback(async (forceRefresh = false) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = loadFromCache();
      if (cached) {
        // Recalculate amounts for new mxnAmount
        const usdAmount = mxnAmount * cached.mxnToUsdRate;
        const amounts = calculateConvertedAmounts(usdAmount, cached.cryptoPrices);
        
        setCryptoPrices(cached.cryptoPrices);
        setConvertedAmounts(amounts);
        setLastUpdate(new Date(cached.timestamp));
        setLoading(false);
        setError(null);
        setRetryCount(0);
        return;
      }
    }

    // If offline, use cache or fallback
    if (!isOnline) {
      const cached = loadFromCache();
      if (cached) {
        const usdAmount = mxnAmount * cached.mxnToUsdRate;
        const amounts = calculateConvertedAmounts(usdAmount, cached.cryptoPrices);
        
        setCryptoPrices(cached.cryptoPrices);
        setConvertedAmounts(amounts);
        setLastUpdate(new Date(cached.timestamp));
        setError('Offline - using cached prices');
      } else {
        // Use fallback values
        const usdAmount = mxnAmount * FALLBACK_MXN_TO_USD;
        const amounts = calculateConvertedAmounts(usdAmount, FALLBACK_CRYPTO_PRICES);
        
        setCryptoPrices(FALLBACK_CRYPTO_PRICES);
        setConvertedAmounts(amounts);
        setLastUpdate(new Date());
        setError('Offline - using approximate prices');
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      abortControllerRef.current = new AbortController();
      
      // Fetch both exchange rate and crypto prices in parallel
      const [mxnToUsdRate, cryptoPricesData] = await Promise.all([
        fetchExchangeRate(),
        fetchCryptoPrices()
      ]);
      
      const usdAmount = mxnAmount * mxnToUsdRate;
      const amounts = calculateConvertedAmounts(usdAmount, cryptoPricesData);
      
      // Update state
      setCryptoPrices(cryptoPricesData);
      setConvertedAmounts(amounts);
      setLastUpdate(new Date());
      setRetryCount(0);
      
      // Save to cache
      const cacheData: CacheData = {
        cryptoPrices: cryptoPricesData,
        convertedAmounts: amounts,
        timestamp: Date.now(),
        mxnToUsdRate
      };
      saveToCache(cacheData);
      
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      
      // Try to use cached data on error
      const cached = loadFromCache();
      if (cached) {
        const usdAmount = mxnAmount * cached.mxnToUsdRate;
        const amounts = calculateConvertedAmounts(usdAmount, cached.cryptoPrices);
        
        setCryptoPrices(cached.cryptoPrices);
        setConvertedAmounts(amounts);
        setLastUpdate(new Date(cached.timestamp));
        setError('API error - using cached prices');
      } else {
        // Use fallback values
        const usdAmount = mxnAmount * FALLBACK_MXN_TO_USD;
        const amounts = calculateConvertedAmounts(usdAmount, FALLBACK_CRYPTO_PRICES);
        
        setCryptoPrices(FALLBACK_CRYPTO_PRICES);
        setConvertedAmounts(amounts);
        setLastUpdate(new Date());
        setError('API error - using approximate prices');
      }
      
      // Implement exponential backoff retry
      const currentRetryCount = retryCount + 1;
      setRetryCount(currentRetryCount);
      
      if (currentRetryCount <= 3) {
        const retryDelay = Math.min(1000 * Math.pow(2, currentRetryCount - 1), 10000);
        retryTimeoutRef.current = setTimeout(() => {
          fetchPrices(true);
        }, retryDelay);
      }
      
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [mxnAmount, retryCount, isOnline, loadFromCache, saveToCache]);

  // Initialize and set up intervals
  useEffect(() => {
    fetchPrices();
    
    // Update prices every 60 seconds (increased from 30s to reduce API calls)
    const interval = setInterval(() => fetchPrices(), 60000);
    
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchPrices]);

  // Refresh function for manual updates
  const refresh = useCallback(() => {
    fetchPrices(true);
  }, [fetchPrices]);

  return {
    cryptoPrices,
    convertedAmounts,
    loading,
    error,
    lastUpdate,
    refresh,
    isOnline,
    retryCount
  };
};

export default useCryptoPrice;