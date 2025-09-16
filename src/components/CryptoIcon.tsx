'use client';

import React from 'react';

interface CryptoIconProps {
  symbol: 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL' | 'BNB';
  size?: number;
  className?: string;
}

const CRYPTO_COLORS = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  USDT: '#26A17B',
  USDC: '#2775CA',
  SOL: '#9945FF',
  BNB: '#F3BA2F'
};

const CryptoIcon: React.FC<CryptoIconProps> = ({
  symbol,
  size = 24,
  className = ""
}) => {
  const color = CRYPTO_COLORS[symbol];

  const iconPaths = {
    BTC: (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill={color}/>
        <path
          d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.181-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.874 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
          fill="white"
        />
      </svg>
    ),
    ETH: (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill={color}/>
        <path
          d="M16.498 4l-.498.681v11.625l.498.292 7.252-4.285L16.498 4z"
          fill="white"
          opacity="0.602"
        />
        <path
          d="M16.498 4L9.246 12.313l7.252 4.285V4z"
          fill="white"
        />
        <path
          d="M16.498 17.972l-.498.29v5.538l.498.729 7.26-10.242-7.26 3.685z"
          fill="white"
          opacity="0.602"
        />
        <path
          d="M16.498 24.529v-6.557L9.246 14.287l7.252 10.242z"
          fill="white"
        />
        <path
          d="M16.498 16.598l7.252-4.285-7.252-3.292v7.577z"
          fill="white"
          opacity="0.2"
        />
        <path
          d="M9.246 12.313l7.252 4.285V9.021l-7.252 3.292z"
          fill="white"
          opacity="0.602"
        />
      </svg>
    ),
    USDT: (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill={color}/>
        <path
          d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"
          fill="white"
        />
      </svg>
    ),
    USDC: (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill={color}/>
        <path
          d="M16 25.5c5.247 0 9.5-4.253 9.5-9.5s-4.253-9.5-9.5-9.5-9.5 4.253-9.5 9.5 4.253 9.5 9.5 9.5z"
          fill="white"
        />
        <path
          d="M16 23c4.142 0 7.5-3.358 7.5-7.5S20.142 8 16 8s-7.5 3.358-7.5 7.5S11.858 23 16 23z"
          fill={color}
        />
        <path
          d="M17.875 13.5h-2.156v-1.25h2.156c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25h-2.156v2.5h2.156c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25h-2.156v1.25h-1.25v-1.25h-.625c-.69 0-1.25-.56-1.25-1.25v-3.75c0-.69.56-1.25 1.25-1.25h.625v-1.25h1.25z"
          fill="white"
        />
      </svg>
    ),
    SOL: (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <defs>
          <linearGradient id="solana-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9945FF"/>
            <stop offset="100%" stopColor="#14F195"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#solana-gradient)"/>
        <path
          d="M7.5 20.5c.3-.3.8-.3 1.1 0l3.2 3.2c.2.2.4.3.7.3h11c.6 0 .9-.7.5-1.1l-3.2-3.2c-.2-.2-.4-.3-.7-.3H8.6c-.6 0-.9.7-.5 1.1zM24.5 11.5c-.3.3-.8.3-1.1 0l-3.2-3.2c-.2-.2-.4-.3-.7-.3H8.5c-.6 0-.9.7-.5 1.1l3.2 3.2c.2.2.4.3.7.3h11.5c.6 0 .9-.7.5-1.1zM24.5 16.5c-.3.3-.8.3-1.1 0l-3.2-3.2c-.2-.2-.4-.3-.7-.3H8.5c-.6 0-.9.7-.5 1.1l3.2 3.2c.2.2.4.3.7.3h11.5c.6 0 .9-.7.5-1.1z"
          fill="white"
        />
      </svg>
    ),
    BNB: (
      <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
        <circle cx="16" cy="16" r="16" fill={color}/>
        <path
          d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.26L16 26l-6.144-6.144 2.26-2.26zm9.764-5.856L24.14 16l-2.26 2.26L19.48 16l2.4-2.26z"
          fill="white"
        />
        <path
          d="M16 14.52l-2.26-2.26L16 9.52l2.26 2.26L16 14.52z"
          fill="white"
        />
      </svg>
    )
  };

  return iconPaths[symbol] || null;
};

export default CryptoIcon;