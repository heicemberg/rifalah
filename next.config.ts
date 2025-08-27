import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para despliegue estático
  output: 'export',
  trailingSlash: true,
  distDir: 'dist',
  
  // Configuración de imágenes para modo estático
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Deshabilitar telemetría y trace para evitar problemas
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-hot-toast',
      'zustand'
    ],
  },
  
  
  // Configuración de Webpack para better tree shaking
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        child_process: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Configuración TypeScript
  typescript: {
    // Permitir builds con errores de TypeScript en producción (solo warnings)
    ignoreBuildErrors: false,
  },
  
  // Configuración ESLint
  eslint: {
    // Permitir builds con warnings de ESLint
    ignoreDuringBuilds: false,
  },
  
  // Configuración para archivos estáticos
  assetPrefix: '',
  basePath: '',
  
  // SWC minification is enabled by default in Next.js 15
  
  // Configuración de compresión
  compress: true,
  
  // Configuración para páginas de error personalizadas
  generateEtags: false,
};

export default nextConfig;
