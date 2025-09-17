'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Eye,
  Clock,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface TrafficData {
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number;
  bounceRate: number;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

const TrafficSection: React.FC = () => {
  // Mock data - in production this would come from props or API
  const trafficData: TrafficData = {
    pageViews: 24847,
    uniqueVisitors: 18562,
    sessionDuration: 4.2,
    bounceRate: 32.8,
    deviceBreakdown: {
      mobile: 68.3,
      desktop: 28.1,
      tablet: 3.6
    }
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon,
    suffix = '',
    color = 'blue'
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    suffix?: string;
    color?: string;
  }) => {
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
            {typeof value === 'number' ? value.toLocaleString('es-MX') : value}{suffix}
          </p>
        </div>
      </motion.div>
    );
  };

  const DeviceCard = ({
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center"
    >
      <div className={`${color} text-white p-3 rounded-xl mb-3 mx-auto w-fit`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{percentage.toFixed(1)}%</p>
      <p className="text-sm text-slate-600">{name}</p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-xl border border-blue-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl">
          <Users className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">📈 Tráfico y Visitantes</h3>
          <p className="text-slate-600">Análisis de visitantes y comportamiento en tiempo real</p>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Visitantes Únicos"
          value={trafficData.uniqueVisitors}
          change={12.3}
          icon={<Users size={20} />}
          color="blue"
        />
        <MetricCard
          title="Vistas de Página"
          value={trafficData.pageViews}
          change={8.7}
          icon={<Eye size={20} />}
          color="emerald"
        />
        <MetricCard
          title="Duración Promedio"
          value={trafficData.sessionDuration}
          change={5.2}
          icon={<Clock size={20} />}
          suffix=" min"
          color="orange"
        />
        <MetricCard
          title="Tasa de Rebote"
          value={trafficData.bounceRate}
          change={-2.1}
          icon={<TrendingDown size={20} />}
          suffix="%"
          color="purple"
        />
      </div>

      {/* Dispositivos */}
      <div>
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Monitor size={20} />
          Distribución por Dispositivos
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <DeviceCard
            name="Móvil"
            percentage={trafficData.deviceBreakdown.mobile}
            icon={<Smartphone size={24} />}
            color="bg-blue-500"
          />
          <DeviceCard
            name="Escritorio"
            percentage={trafficData.deviceBreakdown.desktop}
            icon={<Monitor size={24} />}
            color="bg-emerald-500"
          />
          <DeviceCard
            name="Tablet"
            percentage={trafficData.deviceBreakdown.tablet}
            icon={<Tablet size={24} />}
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-100 rounded-xl border border-blue-200">
        <h5 className="font-bold text-blue-900 mb-2">💡 Insights Clave:</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 68% de visitantes usan móvil - sitio optimizado correctamente</li>
          <li>• Duración de sesión de 4.2 min indica buen engagement</li>
          <li>• Tasa de rebote del 32.8% es excelente para una rifa</li>
          <li>• Crecimiento del 12.3% en visitantes únicos</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default TrafficSection;