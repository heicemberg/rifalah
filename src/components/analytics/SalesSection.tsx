'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Target,
  CreditCard,
  Building2,
  Zap,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface SalesData {
  revenue: number;
  conversionRate: number;
  averageOrderValue: number;
  totalPurchases: number;
  paymentMethods: {
    bancoppel: number;
    bancoazteca: number;
    oxxo: number;
    binance: number;
  };
  conversionFunnel: {
    visitors: number;
    ticketSelectors: number;
    purchaseAttempts: number;
    completedPurchases: number;
  };
}

const SalesSection: React.FC = () => {
  // Mock data - in production this would come from props or API
  const salesData: SalesData = {
    revenue: 127500,
    conversionRate: 4.2,
    averageOrderValue: 1875,
    totalPurchases: 68,
    paymentMethods: {
      bancoppel: 35.4,
      bancoazteca: 28.9,
      oxxo: 22.1,
      binance: 13.6
    },
    conversionFunnel: {
      visitors: 18562,
      ticketSelectors: 3247,
      purchaseAttempts: 892,
      completedPurchases: 68
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon,
    format = 'number',
    color = 'green'
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ReactNode;
    format?: 'number' | 'currency' | 'percentage';
    color?: string;
  }) => {
    const formatValue = () => {
      switch (format) {
        case 'currency':
          return formatCurrency(value);
        case 'percentage':
          return `${value.toFixed(1)}%`;
        default:
          return value.toLocaleString('es-MX');
      }
    };

    const isPositive = change && change >= 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-4 shadow-lg border border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 bg-${color}-100 rounded-lg`}>
            <div className={`text-${color}-600`}>
              {icon}
            </div>
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900">
            {formatValue()}
          </p>
        </div>
      </motion.div>
    );
  };

  const PaymentMethodCard = ({
    name,
    percentage,
    icon,
    color
  }: {
    name: string;
    percentage: number;
    icon: React.ReactNode;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200"
    >
      <div className="flex items-center gap-3">
        <div className={`${color} text-white p-2 rounded-lg`}>
          {icon}
        </div>
        <span className="font-medium text-slate-700">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-200 rounded-full h-2 w-24 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`h-full ${color} rounded-full`}
          />
        </div>
        <span className="text-lg font-bold text-slate-800 w-16 text-right">
          {percentage.toFixed(1)}%
        </span>
      </div>
    </motion.div>
  );

  const FunnelStep = ({
    title,
    value,
    percentage,
    index
  }: {
    title: string;
    value: number;
    percentage: number;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      <div
        className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg p-4 text-white relative overflow-hidden"
        style={{ width: `${Math.max(percentage, 20)}%` }}
      >
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm">{title}</span>
          <span className="text-lg font-bold">{value.toLocaleString()}</span>
        </div>
        <div className="text-xs opacity-90 mt-1">{percentage.toFixed(1)}% de visitantes</div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 shadow-xl border border-emerald-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-600 rounded-xl">
          <DollarSign className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">💰 Ventas y Conversión</h3>
          <p className="text-slate-600">Análisis de ingresos y embudo de conversión</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Ingresos Total"
          value={salesData.revenue}
          change={15.4}
          icon={<DollarSign size={20} />}
          format="currency"
          color="emerald"
        />
        <MetricCard
          title="Tasa de Conversión"
          value={salesData.conversionRate}
          change={8.2}
          icon={<Target size={20} />}
          format="percentage"
          color="blue"
        />
        <MetricCard
          title="Valor Promedio"
          value={salesData.averageOrderValue}
          change={5.7}
          icon={<ShoppingCart size={20} />}
          format="currency"
          color="orange"
        />
        <MetricCard
          title="Compras Total"
          value={salesData.totalPurchases}
          change={22.1}
          icon={<TrendingUp size={20} />}
          color="purple"
        />
      </div>

      {/* Embudo de Conversión */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target size={20} />
          Embudo de Conversión
        </h4>
        <div className="bg-white rounded-xl p-6 border border-emerald-200 space-y-3">
          <FunnelStep
            title="Visitantes"
            value={salesData.conversionFunnel.visitors}
            percentage={100}
            index={0}
          />
          <FunnelStep
            title="Seleccionaron Tickets"
            value={salesData.conversionFunnel.ticketSelectors}
            percentage={(salesData.conversionFunnel.ticketSelectors / salesData.conversionFunnel.visitors) * 100}
            index={1}
          />
          <FunnelStep
            title="Intentos de Compra"
            value={salesData.conversionFunnel.purchaseAttempts}
            percentage={(salesData.conversionFunnel.purchaseAttempts / salesData.conversionFunnel.visitors) * 100}
            index={2}
          />
          <FunnelStep
            title="Compras Completadas"
            value={salesData.conversionFunnel.completedPurchases}
            percentage={(salesData.conversionFunnel.completedPurchases / salesData.conversionFunnel.visitors) * 100}
            index={3}
          />
        </div>
      </div>

      {/* Métodos de Pago */}
      <div>
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CreditCard size={20} />
          Métodos de Pago Preferidos
        </h4>
        <div className="space-y-3">
          <PaymentMethodCard
            name="BanCoppel"
            percentage={salesData.paymentMethods.bancoppel}
            icon={<Building2 size={16} />}
            color="bg-blue-500"
          />
          <PaymentMethodCard
            name="Banco Azteca"
            percentage={salesData.paymentMethods.bancoazteca}
            icon={<Building2 size={16} />}
            color="bg-emerald-500"
          />
          <PaymentMethodCard
            name="OXXO"
            percentage={salesData.paymentMethods.oxxo}
            icon={<CreditCard size={16} />}
            color="bg-orange-500"
          />
          <PaymentMethodCard
            name="Binance Pay"
            percentage={salesData.paymentMethods.binance}
            icon={<Zap size={16} />}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-emerald-100 rounded-xl border border-emerald-200">
        <h5 className="font-bold text-emerald-900 mb-2">💡 Insights de Ventas:</h5>
        <ul className="text-sm text-emerald-800 space-y-1">
          <li>• Tasa de conversión del 4.2% está por encima del promedio</li>
          <li>• BanCoppel es el método preferido (35.4%)</li>
          <li>• Valor promedio de {formatCurrency(salesData.averageOrderValue)} por compra</li>
          <li>• {formatCurrency(salesData.revenue)} en ingresos totales</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default SalesSection;