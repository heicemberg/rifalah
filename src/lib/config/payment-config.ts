// ============================================================================
// CONFIGURACIÓN DE MÉTODOS DE PAGO - RIFA SILVERADO 2024
// ============================================================================

import type { PaymentMethod, PaymentMethodType } from '../types';

// ============================================================================
// TIPOS DE CONFIGURACIÓN
// ============================================================================

interface PaymentConfig {
  development: PaymentMethod[];
  production: PaymentMethod[];
}

interface CryptoConfig {
  development: {
    binanceEmail: string;
    walletAddresses: Record<string, string>;
  };
  production: {
    binanceEmail: string;
    walletAddresses: Record<string, string>;
  };
}

// ============================================================================
// CONFIGURACIÓN DE MÉTODOS DE PAGO POR AMBIENTE
// ============================================================================

const PAYMENT_CONFIG: PaymentConfig = {
  // ✅ DESARROLLO - Datos de prueba
  development: [
    {
      id: 'binance' as PaymentMethodType,
      name: 'Binance Pay',
      icon: '/logos/binance.svg',
      account: process.env.NEXT_PUBLIC_BINANCE_EMAIL_DEV || 'rifadesilverado2024@gmail.com',
      accountDetails: `Email Binance Pay: ${process.env.NEXT_PUBLIC_BINANCE_EMAIL_DEV || 'rifadesilverado2024@gmail.com'}`,
      enabled: true
    },
    {
      id: 'bancoppel' as PaymentMethodType,
      name: 'BanCoppel',
      icon: '/logos/bancoppel.png',
      account: process.env.NEXT_PUBLIC_BANCOPPEL_CARD_DEV || '4169 1598 7643 2108',
      accountDetails: `Tarjeta: ${process.env.NEXT_PUBLIC_BANCOPPEL_CARD_DEV || '4169 1598 7643 2108'}\nTitular: ${process.env.NEXT_PUBLIC_BANCOPPEL_OWNER_DEV || 'RIFA SILVERADO 2024'}\nCLABE: ${process.env.NEXT_PUBLIC_BANCOPPEL_CLABE_DEV || '137180000123456789'}`,
      enabled: true
    },
    {
      id: 'bancoazteca' as PaymentMethodType,
      name: 'Banco Azteca',
      icon: '/logos/bancoazteca.png',
      account: process.env.NEXT_PUBLIC_AZTECA_CARD_DEV || '5204 8765 4321 0987',
      accountDetails: `Tarjeta: ${process.env.NEXT_PUBLIC_AZTECA_CARD_DEV || '5204 8765 4321 0987'}\nTitular: ${process.env.NEXT_PUBLIC_AZTECA_OWNER_DEV || 'RIFA SILVERADO 2024'}\nCLABE: ${process.env.NEXT_PUBLIC_AZTECA_CLABE_DEV || '127180000987654321'}`,
      enabled: true
    },
    {
      id: 'oxxo' as PaymentMethodType,
      name: 'OXXO',
      icon: '/logos/oxxo.png',
      account: process.env.NEXT_PUBLIC_OXXO_REF_DEV || 'RIF-SIL-2024-001',
      accountDetails: `Referencia OXXO: ${process.env.NEXT_PUBLIC_OXXO_REF_DEV || 'RIF-SIL-2024-001'}\nMonto exacto del pago\nConserva tu comprobante`,
      enabled: true
    }
  ],

  // 🚀 PRODUCCIÓN - Datos reales (desde variables de entorno)
  production: [
    {
      id: 'binance' as PaymentMethodType,
      name: 'Binance Pay',
      icon: '/logos/binance.svg',
      account: process.env.NEXT_PUBLIC_BINANCE_EMAIL_PROD || '',
      accountDetails: `Email Binance Pay: ${process.env.NEXT_PUBLIC_BINANCE_EMAIL_PROD || ''}`,
      enabled: !!process.env.NEXT_PUBLIC_BINANCE_EMAIL_PROD
    },
    {
      id: 'bancoppel' as PaymentMethodType,
      name: 'BanCoppel',
      icon: '/logos/bancoppel.png',
      account: process.env.NEXT_PUBLIC_BANCOPPEL_CARD_PROD || '',
      accountDetails: `Tarjeta: ${process.env.NEXT_PUBLIC_BANCOPPEL_CARD_PROD || ''}\nTitular: ${process.env.NEXT_PUBLIC_BANCOPPEL_OWNER_PROD || ''}\nCLABE: ${process.env.NEXT_PUBLIC_BANCOPPEL_CLABE_PROD || ''}`,
      enabled: !!process.env.NEXT_PUBLIC_BANCOPPEL_CARD_PROD
    },
    {
      id: 'bancoazteca' as PaymentMethodType,
      name: 'Banco Azteca',
      icon: '/logos/bancoazteca.png',
      account: process.env.NEXT_PUBLIC_AZTECA_CARD_PROD || '',
      accountDetails: `Tarjeta: ${process.env.NEXT_PUBLIC_AZTECA_CARD_PROD || ''}\nTitular: ${process.env.NEXT_PUBLIC_AZTECA_OWNER_PROD || ''}\nCLABE: ${process.env.NEXT_PUBLIC_AZTECA_CLABE_PROD || ''}`,
      enabled: !!process.env.NEXT_PUBLIC_AZTECA_CARD_PROD
    },
    {
      id: 'oxxo' as PaymentMethodType,
      name: 'OXXO',
      icon: '/logos/oxxo.png',
      account: process.env.NEXT_PUBLIC_OXXO_REF_PROD || '',
      accountDetails: `Referencia OXXO: ${process.env.NEXT_PUBLIC_OXXO_REF_PROD || ''}\nMonto exacto del pago\nConserva tu comprobante`,
      enabled: !!process.env.NEXT_PUBLIC_OXXO_REF_PROD
    }
  ]
};

// ============================================================================
// CONFIGURACIÓN DE CRYPTO POR AMBIENTE
// ============================================================================

const CRYPTO_CONFIG: CryptoConfig = {
  development: {
    binanceEmail: 'rifadesilverado2024@gmail.com',
    walletAddresses: {
      BTC: process.env.NEXT_PUBLIC_BTC_WALLET_DEV || '',
      ETH: process.env.NEXT_PUBLIC_ETH_WALLET_DEV || '',
      USDT: process.env.NEXT_PUBLIC_USDT_WALLET_DEV || '',
      USDC: process.env.NEXT_PUBLIC_USDC_WALLET_DEV || '',
      SOL: process.env.NEXT_PUBLIC_SOL_WALLET_DEV || ''
    }
  },
  production: {
    binanceEmail: process.env.NEXT_PUBLIC_BINANCE_EMAIL_PROD || '',
    walletAddresses: {
      BTC: process.env.NEXT_PUBLIC_BTC_WALLET_PROD || '',
      ETH: process.env.NEXT_PUBLIC_ETH_WALLET_PROD || '',
      USDT: process.env.NEXT_PUBLIC_USDT_WALLET_PROD || '',
      USDC: process.env.NEXT_PUBLIC_USDC_WALLET_PROD || '',
      SOL: process.env.NEXT_PUBLIC_SOL_WALLET_PROD || ''
    }
  }
};

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Obtiene el ambiente actual
 */
export const getCurrentEnvironment = (): 'development' | 'production' => {
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

/**
 * Obtiene los métodos de pago según el ambiente
 */
export const getPaymentMethods = (): PaymentMethod[] => {
  const env = getCurrentEnvironment();
  const methods = PAYMENT_CONFIG[env];

  // Filtrar solo métodos habilitados
  return methods.filter(method => method.enabled);
};

/**
 * Obtiene configuración de crypto según el ambiente
 */
export const getCryptoConfig = () => {
  const env = getCurrentEnvironment();
  return CRYPTO_CONFIG[env];
};

/**
 * Valida que todas las configuraciones necesarias estén presentes
 */
export const validatePaymentConfig = (): { valid: boolean; missing: string[] } => {
  const env = getCurrentEnvironment();
  const missing: string[] = [];

  if (env === 'production') {
    // Validar variables de entorno de producción
    const requiredVars = [
      'NEXT_PUBLIC_BINANCE_EMAIL_PROD',
      'NEXT_PUBLIC_BANCOPPEL_CARD_PROD',
      'NEXT_PUBLIC_BANCOPPEL_OWNER_PROD',
      'NEXT_PUBLIC_BANCOPPEL_CLABE_PROD',
      'NEXT_PUBLIC_AZTECA_CARD_PROD',
      'NEXT_PUBLIC_AZTECA_OWNER_PROD',
      'NEXT_PUBLIC_AZTECA_CLABE_PROD',
      'NEXT_PUBLIC_OXXO_REF_PROD'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing
  };
};

/**
 * Hook para obtener métodos de pago de forma reactiva
 */
export const usePaymentMethods = () => {
  const methods = getPaymentMethods();
  const cryptoConfig = getCryptoConfig();
  const validation = validatePaymentConfig();

  return {
    paymentMethods: methods,
    cryptoConfig,
    validation,
    environment: getCurrentEnvironment()
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export { PAYMENT_CONFIG, CRYPTO_CONFIG };
export type { PaymentConfig, CryptoConfig };