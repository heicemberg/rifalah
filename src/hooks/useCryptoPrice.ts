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
      
      // Obtener precios de criptomonedas directamente en MXN (pesos mexicanos)
      const cryptoResponse = await fetch(
        `${COINGECKO_API}?ids=tether,usd-coin,bitcoin,ethereum,solana&vs_currencies=mxn,usd&include_24hr_change=true`,
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
      
      console.log('🚀 Crypto data received:', cryptoData);
      
      // Mapear los datos con precios en MXN
      const prices: CryptoPrices = {
        USDT: {
          symbol: 'USDT',
          price: cryptoData.tether.mxn, // Precio en pesos mexicanos
          change24h: cryptoData.tether.usd_24h_change || 0
        },
        USDC: {
          symbol: 'USDC',
          price: cryptoData['usd-coin'].mxn, // Precio en pesos mexicanos
          change24h: cryptoData['usd-coin'].usd_24h_change || 0
        },
        BTC: {
          symbol: 'BTC',
          price: cryptoData.bitcoin.mxn, // Precio en pesos mexicanos
          change24h: cryptoData.bitcoin.usd_24h_change || 0
        },
        ETH: {
          symbol: 'ETH',
          price: cryptoData.ethereum.mxn, // Precio en pesos mexicanos
          change24h: cryptoData.ethereum.usd_24h_change || 0
        },
        SOL: {
          symbol: 'SOL',
          price: cryptoData.solana.mxn, // Precio en pesos mexicanos
          change24h: cryptoData.solana.usd_24h_change || 0
        }
      };

      // Calcular montos convertidos (ahora directo de MXN a crypto)
      const amounts: ConvertedAmounts = {
        USDT: parseFloat((mxnAmount / prices.USDT.price).toFixed(6)),
        USDC: parseFloat((mxnAmount / prices.USDC.price).toFixed(6)),
        BTC: parseFloat((mxnAmount / prices.BTC.price).toFixed(8)),
        ETH: parseFloat((mxnAmount / prices.ETH.price).toFixed(6)),
        SOL: parseFloat((mxnAmount / prices.SOL.price).toFixed(4))
      };
      
      console.log('💰 Converted amounts:', amounts);
      console.log('💵 MXN amount:', mxnAmount);
      console.log('📊 Prices in MXN:', prices);

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