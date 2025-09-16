'use client';

// ============================================================================
// ANALYTICS DASHBOARD - Mexican Truck Raffle Admin Panel
// Comprehensive business analytics and insights dashboard
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  DollarSign,
  ShoppingCart,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Download,
  FileText,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Building2,
  CreditCard,
  Zap
} from 'lucide-react';
import { formatPrice } from '../lib/utils';

// Analytics Data Interfaces
interface AnalyticsMetrics {
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    sessionDuration: number;
    bounceRate: number;
    previousPageViews: number;
    previousVisitors: number;
  };
  sales: {
    revenue: number;
    conversionRate: number;
    averageOrderValue: number;
    totalPurchases: number;
    previousRevenue: number;
    previousConversions: number;
  };
  engagement: {
    modalOpens: number;
    completionRate: number;
    timeOnSite: number;
    returnVisitors: number;
  };
  geographic: {
    [state: string]: number;
  };
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  paymentMethods: {
    bancoppel: number;
    bancoazteca: number;
    oxxo: number;
    binance: number;
  };
  timeData: Array<{
    hour: number;
    visitors: number;
    sales: number;
  }>;
}

// Mock data generator for demonstration
const generateMockAnalytics = (): AnalyticsMetrics => {
  const baseVisitors = Math.floor(Math.random() * 5000) + 15000;
  const conversionRate = 0.042 + (Math.random() * 0.01);

  return {
    traffic: {
      pageViews: baseVisitors * 1.4,
      uniqueVisitors: baseVisitors,
      sessionDuration: 4.2 + (Math.random() * 2),
      bounceRate: 32.8 + (Math.random() * 10),
      previousPageViews: baseVisitors * 1.35,
      previousVisitors: baseVisitors * 0.92,
    },
    sales: {
      revenue: Math.floor(baseVisitors * conversionRate * 1875),
      conversionRate: conversionRate * 100,
      averageOrderValue: 1875 + (Math.random() * 500),
      totalPurchases: Math.floor(baseVisitors * conversionRate),
      previousRevenue: Math.floor(baseVisitors * 0.92 * conversionRate * 1750),
      previousConversions: Math.floor(baseVisitors * 0.92 * conversionRate * 0.95),
    },
    engagement: {
      modalOpens: Math.floor(baseVisitors * 0.18),
      completionRate: 16.2 + (Math.random() * 5),
      timeOnSite: 6.8 + (Math.random() * 3),
      returnVisitors: Math.floor(baseVisitors * 0.23),
    },
    geographic: {
      'Ciudad de México': 22.4,
      'Jalisco': 15.8,
      'Nuevo León': 12.3,
      'Estado de México': 10.7,
      'Veracruz': 8.9,
      'Puebla': 6.2,
      'Guanajuato': 5.1,
      'Otros': 18.6,
    },
    devices: {
      mobile: 68.3 + (Math.random() * 5),
      desktop: 28.1 + (Math.random() * 3),
      tablet: 3.6 + (Math.random() * 1),
    },
    paymentMethods: {
      bancoppel: 35.4 + (Math.random() * 5),
      bancoazteca: 28.9 + (Math.random() * 5),
      oxxo: 22.1 + (Math.random() * 5),
      binance: 13.6 + (Math.random() * 3),
    },
    timeData: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      visitors: Math.floor(Math.random() * 1200) + 200,
      sales: Math.floor(Math.random() * 50) + 5,
    })),
  };
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon: React.ReactNode;
  colorScheme: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  subtitle?: string;
  format?: 'currency' | 'percentage' | 'number';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  icon,
  colorScheme,
  subtitle,
  format = 'number'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 border-blue-200 bg-blue-50',
    green: 'from-emerald-500 to-emerald-600 border-emerald-200 bg-emerald-50',
    orange: 'from-orange-500 to-orange-600 border-orange-200 bg-orange-50',
    purple: 'from-purple-500 to-purple-600 border-purple-200 bg-purple-50',
    red: 'from-red-500 to-red-600 border-red-200 bg-red-50',
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return formatPrice(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('es-MX');
    }
  };

  const getChangeIndicator = () => {
    if (!previousValue || typeof value === 'string') return null;

    const numValue = typeof value === 'string' ? 0 : value;
    const change = ((numValue - previousValue) / previousValue) * 100;
    const isPositive = change >= 0;

    return (
      <div className={`flex items-center gap-1 text-sm font-medium ${
        isPositive ? 'text-emerald-600' : 'text-red-600'
      }`}>
        {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
        <span>{Math.abs(change).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border-2 ${colorClasses[colorScheme]} p-6 shadow-lg backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mb-1">
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
          {getChangeIndicator()}
        </div>
        <div className={`p-3 bg-gradient-to-br ${colorClasses[colorScheme].split(' ')[0]} rounded-xl shadow-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Geographic Distribution Component
const GeographicDistribution: React.FC<{ data: { [state: string]: number } }> = ({ data }) => {
  const maxValue = Math.max(...Object.values(data));

  return (
    <div className="space-y-3">
      {Object.entries(data).map(([state, percentage], index) => (
        <motion.div
          key={state}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1">
            <MapPin size={16} className="text-slate-500" />
            <span className="font-medium text-slate-700">{state}</span>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(percentage / maxValue) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              />
            </div>
            <span className="text-sm font-semibold text-slate-600 w-12 text-right">
              {percentage.toFixed(1)}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Device Breakdown Chart
const DeviceBreakdown: React.FC<{ data: { mobile: number; desktop: number; tablet: number } }> = ({ data }) => {
  const devices = [
    { name: 'Móvil', value: data.mobile, icon: <Smartphone size={20} />, color: 'bg-blue-500' },
    { name: 'Escritorio', value: data.desktop, icon: <Monitor size={20} />, color: 'bg-emerald-500' },
    { name: 'Tablet', value: data.tablet, icon: <Tablet size={20} />, color: 'bg-orange-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {devices.map((device, index) => (
        <motion.div
          key={device.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className={`${device.color} text-white p-4 rounded-xl mb-3 mx-auto w-fit`}>
            {device.icon}
          </div>
          <p className="text-2xl font-bold text-slate-800">{device.value.toFixed(1)}%</p>
          <p className="text-sm text-slate-600">{device.name}</p>
        </motion.div>
      ))}
    </div>
  );
};

// Payment Methods Chart
const PaymentMethodsChart: React.FC<{ data: { [key: string]: number } }> = ({ data }) => {
  const methods = [
    { key: 'bancoppel', name: 'BanCoppel', icon: <Building2 size={16} />, color: 'bg-blue-500' },
    { key: 'bancoazteca', name: 'Banco Azteca', icon: <Building2 size={16} />, color: 'bg-emerald-500' },
    { key: 'oxxo', name: 'OXXO', icon: <CreditCard size={16} />, color: 'bg-orange-500' },
    { key: 'binance', name: 'Binance Pay', icon: <Zap size={16} />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-4">
      {methods.map((method, index) => (
        <motion.div
          key={method.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-slate-200"
        >
          <div className="flex items-center gap-3">
            <div className={`${method.color} text-white p-2 rounded-lg`}>
              {method.icon}
            </div>
            <span className="font-medium text-slate-700">{method.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-200 rounded-full h-2 w-24 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data[method.key]}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
                className={`h-full ${method.color} rounded-full`}
              />
            </div>
            <span className="text-lg font-bold text-slate-800 w-16 text-right">
              {data[method.key].toFixed(1)}%
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Hourly Traffic Chart
const HourlyTrafficChart: React.FC<{ data: Array<{ hour: number; visitors: number; sales: number }> }> = ({ data }) => {
  const maxVisitors = Math.max(...data.map(d => d.visitors));
  const maxSales = Math.max(...data.map(d => d.sales));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-slate-600">Visitantes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-slate-600">Ventas</span>
        </div>
      </div>

      <div className="grid grid-cols-24 gap-1 h-32">
        {data.map((hour, index) => (
          <motion.div
            key={hour.hour}
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ delay: index * 0.02 }}
            className="relative flex flex-col justify-end"
          >
            <div className="space-y-1">
              <div
                className="bg-blue-500 rounded-sm"
                style={{ height: `${(hour.visitors / maxVisitors) * 80}px` }}
                title={`${hour.hour}:00 - ${hour.visitors} visitantes`}
              />
              <div
                className="bg-emerald-500 rounded-sm"
                style={{ height: `${(hour.sales / maxSales) * 40}px` }}
                title={`${hour.hour}:00 - ${hour.sales} ventas`}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1 text-center">
              {hour.hour}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Generate or fetch analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const data = generateMockAnalytics();
      setAnalyticsData(data);
      setLastUpdated(new Date());
      setIsLoading(false);
    };

    loadAnalytics();

    // Auto-refresh every 5 minutes
    const interval = setInterval(loadAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const data = generateMockAnalytics();
    setAnalyticsData(data);
    setLastUpdated(new Date());
  };

  if (isLoading || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw className="animate-spin" size={20} />
          <span className="font-medium">Cargando analíticas...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            📊 Analytics Dashboard
          </h2>
          <p className="text-slate-600 mt-1">
            Análisis completo del comportamiento y ventas de la rifa
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500">
            Última actualización: {lastUpdated.toLocaleTimeString('es-MX')}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <RefreshCw size={16} />
            Actualizar
          </motion.button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Visitantes Únicos"
          value={analyticsData.traffic.uniqueVisitors}
          previousValue={analyticsData.traffic.previousVisitors}
          icon={<Users size={24} />}
          colorScheme="blue"
          subtitle="Últimas 24 horas"
        />
        <MetricCard
          title="Ingresos Total"
          value={analyticsData.sales.revenue}
          previousValue={analyticsData.sales.previousRevenue}
          icon={<DollarSign size={24} />}
          colorScheme="green"
          format="currency"
          subtitle="Últimas 24 horas"
        />
        <MetricCard
          title="Tasa de Conversión"
          value={analyticsData.sales.conversionRate}
          previousValue={analyticsData.sales.previousConversions}
          icon={<Target size={24} />}
          colorScheme="orange"
          format="percentage"
          subtitle="Visitantes a compradores"
        />
        <MetricCard
          title="Valor Promedio"
          value={analyticsData.sales.averageOrderValue}
          icon={<ShoppingCart size={24} />}
          colorScheme="purple"
          format="currency"
          subtitle="Por transacción"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Traffic by Hour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-2xl p-6 shadow-lg border border-blue-200/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <Clock className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Tráfico por Hora</h3>
              <p className="text-slate-600 text-sm">Visitantes y ventas en tiempo real</p>
            </div>
          </div>
          <HourlyTrafficChart data={analyticsData.timeData} />
        </motion.div>

        {/* Geographic Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/20 rounded-2xl p-6 shadow-lg border border-emerald-200/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-600/20 rounded-xl">
              <MapPin className="text-emerald-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Distribución Geográfica</h3>
              <p className="text-slate-600 text-sm">Visitantes por estado mexicano</p>
            </div>
          </div>
          <GeographicDistribution data={analyticsData.geographic} />
        </motion.div>

        {/* Device Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 rounded-2xl p-6 shadow-lg border border-orange-200/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-600/20 rounded-xl">
              <Monitor className="text-orange-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Dispositivos</h3>
              <p className="text-slate-600 text-sm">Distribución por tipo de dispositivo</p>
            </div>
          </div>
          <DeviceBreakdown data={analyticsData.devices} />
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 rounded-2xl p-6 shadow-lg border border-purple-200/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <CreditCard className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Métodos de Pago</h3>
              <p className="text-slate-600 text-sm">Preferencias de los usuarios</p>
            </div>
          </div>
          <PaymentMethodsChart data={analyticsData.paymentMethods} />
        </motion.div>
      </div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="text-blue-600" size={24} />
          <div>
            <p className="font-semibold text-slate-800">Exportar Reportes</p>
            <p className="text-sm text-slate-600">Descarga datos para análisis externo</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download size={16} />
            Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <FileText size={16} />
            PDF
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsDashboard;