'use client';

import { useState, useEffect } from 'react';

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

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price';
const MXN_TO_USD_API = 'https://api.exchangerate-api.com/v4/latest/MXN';

export const useCryptoPrice = (mxnAmount: number = 250) => {
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrices | null>(null);
  const [convertedAmounts, setConvertedAmounts] = useState<ConvertedAmounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener tasa de cambio MXN a USD
      const mxnResponse = await fetch(MXN_TO_USD_API);
      const mxnData = await mxnResponse.json();
      const usdAmount = mxnAmount * mxnData.rates.USD;

      // Obtener precios de criptomonedas
      const cryptoResponse = await fetch(
        `${COINGECKO_API}?ids=tether,usd-coin,bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            'Accept': 'application/json',
          }
        }
      );
      
      if (!cryptoResponse.ok) {
        throw new Error('Failed to fetch crypto prices');
      }
      
      const cryptoData = await cryptoResponse.json();
      
      // Mapear los datos
      const prices: CryptoPrices = {
        USDT: {
          symbol: 'USDT',
          price: cryptoData.tether.usd,
          change24h: cryptoData.tether.usd_24h_change
        },
        USDC: {
          symbol: 'USDC',
          price: cryptoData['usd-coin'].usd,
          change24h: cryptoData['usd-coin'].usd_24h_change
        },
        BTC: {
          symbol: 'BTC',
          price: cryptoData.bitcoin.usd,
          change24h: cryptoData.bitcoin.usd_24h_change
        },
        ETH: {
          symbol: 'ETH',
          price: cryptoData.ethereum.usd,
          change24h: cryptoData.ethereum.usd_24h_change
        },
        SOL: {
          symbol: 'SOL',
          price: cryptoData.solana.usd,
          change24h: cryptoData.solana.usd_24h_change
        }
      };

      // Calcular montos convertidos
      const amounts: ConvertedAmounts = {
        USDT: parseFloat((usdAmount / prices.USDT.price).toFixed(6)),
        USDC: parseFloat((usdAmount / prices.USDC.price).toFixed(6)),
        BTC: parseFloat((usdAmount / prices.BTC.price).toFixed(8)),
        ETH: parseFloat((usdAmount / prices.ETH.price).toFixed(6)),
        SOL: parseFloat((usdAmount / prices.SOL.price).toFixed(4))
      };

      setCryptoPrices(prices);
      setConvertedAmounts(amounts);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error fetching crypto prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Actualizar precios cada 30 segundos
    const interval = setInterval(fetchPrices, 30000);
    
    return () => clearInterval(interval);
  }, [mxnAmount]);

  const refresh = () => {
    fetchPrices();
  };

  return {
    cryptoPrices,
    convertedAmounts,
    loading,
    error,
    lastUpdate,
    refresh
  };
};

export default useCryptoPrice;