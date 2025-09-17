'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';

interface GeographyData {
  states: {
    [state: string]: {
      percentage: number;
      visitors: number;
      growth: number;
    };
  };
  totalVisitors: number;
  topStates: Array<{
    name: string;
    percentage: number;
    visitors: number;
    growth: number;
  }>;
}

const GeographySection: React.FC = () => {
  // Mock data - in production this would come from props or API
  const geographyData: GeographyData = {
    totalVisitors: 18562,
    states: {
      'Ciudad de México': { percentage: 22.4, visitors: 4158, growth: 15.2 },
      'Jalisco': { percentage: 15.8, visitors: 2933, growth: 12.8 },
      'Nuevo León': { percentage: 12.3, visitors: 2283, growth: 8.7 },
      'Estado de México': { percentage: 10.7, visitors: 1986, growth: 18.3 },
      'Veracruz': { percentage: 8.9, visitors: 1652, growth: 6.2 },
      'Puebla': { percentage: 6.2, visitors: 1151, growth: 22.1 },
      'Guanajuato': { percentage: 5.1, visitors: 947, growth: 9.4 },
      'Michoacán': { percentage: 4.3, visitors: 798, growth: 14.7 },
      'Chihuahua': { percentage: 3.8, visitors: 705, growth: 11.3 },
      'Otros Estados': { percentage: 10.5, visitors: 1949, growth: 7.8 },
    },
    topStates: [
      { name: 'Ciudad de México', percentage: 22.4, visitors: 4158, growth: 15.2 },
      { name: 'Jalisco', percentage: 15.8, visitors: 2933, growth: 12.8 },
      { name: 'Nuevo León', percentage: 12.3, visitors: 2283, growth: 8.7 },
      { name: 'Estado de México', percentage: 10.7, visitors: 1986, growth: 18.3 },
      { name: 'Veracruz', percentage: 8.9, visitors: 1652, growth: 6.2 },
    ]
  };

  const StateCard = ({
    name,
    percentage,
    visitors,
    growth,
    index,
    maxPercentage
  }: {
    name: string;
    percentage: number;
    visitors: number;
    growth: number;
    index: number;
    maxPercentage: number;
  }) => {
    const isPositiveGrowth = growth >= 0;
    const barWidth = (percentage / maxPercentage) * 100;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-xl p-4 shadow-lg border border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="text-purple-600" size={16} />
            </div>
            <div>
              <h5 className="font-semibold text-slate-800">{name}</h5>
              <p className="text-sm text-slate-600">
                {visitors.toLocaleString()} visitantes
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              {percentage.toFixed(1)}%
            </div>
            <div className={`text-sm font-medium flex items-center gap-1 ${
              isPositiveGrowth ? 'text-emerald-600' : 'text-red-600'
            }`}>
              <TrendingUp size={12} />
              {growth.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="w-full bg-slate-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
            />
          </div>
          <div className="text-xs text-slate-500">
            {((visitors / geographyData.totalVisitors) * 100).toFixed(1)}% del total de visitantes
          </div>
        </div>
      </motion.div>
    );
  };

  const TopStateCard = ({
    name,
    percentage,
    visitors,
    growth,
    rank
  }: {
    name: string;
    percentage: number;
    visitors: number;
    growth: number;
    rank: number;
  }) => {
    const medals = ['🥇', '🥈', '🥉'];
    const colors = ['text-yellow-600', 'text-gray-500', 'text-orange-600'];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: rank * 0.1 }}
        className="bg-white rounded-xl p-4 shadow-lg border border-slate-200"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">
            {rank < 3 ? medals[rank] : `${rank + 1}°`}
          </div>
          <div className="flex-1">
            <h5 className={`font-bold text-lg ${rank < 3 ? colors[rank] : 'text-slate-800'}`}>
              {name}
            </h5>
            <p className="text-sm text-slate-600">
              #{rank + 1} en visitantes
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Participación:</span>
            <span className="font-bold text-slate-900">{percentage.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Visitantes:</span>
            <span className="font-bold text-slate-900">{visitors.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Crecimiento:</span>
            <span className={`font-bold ${growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              +{growth.toFixed(1)}%
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  const maxPercentage = Math.max(...Object.values(geographyData.states).map(state => state.percentage));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-xl border border-purple-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-600 rounded-xl">
          <MapPin className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">🗺️ Distribución Geográfica</h3>
          <p className="text-slate-600">Análisis de visitantes por estados mexicanos</p>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center"
        >
          <div className="p-2 bg-purple-100 rounded-lg mb-3 mx-auto w-fit">
            <Users className="text-purple-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {geographyData.totalVisitors.toLocaleString()}
          </div>
          <div className="text-sm text-slate-600">Total Visitantes</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center"
        >
          <div className="p-2 bg-emerald-100 rounded-lg mb-3 mx-auto w-fit">
            <BarChart3 className="text-emerald-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {Object.keys(geographyData.states).length - 1}
          </div>
          <div className="text-sm text-slate-600">Estados Activos</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center"
        >
          <div className="p-2 bg-orange-100 rounded-lg mb-3 mx-auto w-fit">
            <TrendingUp className="text-orange-600" size={20} />
          </div>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            +12.4%
          </div>
          <div className="text-sm text-slate-600">Crecimiento Promedio</div>
        </motion.div>
      </div>

      {/* Top 5 Estados */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Top 5 Estados con Más Visitantes
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {geographyData.topStates.map((state, index) => (
            <TopStateCard
              key={state.name}
              name={state.name}
              percentage={state.percentage}
              visitors={state.visitors}
              growth={state.growth}
              rank={index}
            />
          ))}
        </div>
      </div>

      {/* Todos los Estados */}
      <div>
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Distribución Completa por Estados
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(geographyData.states).map(([name, data], index) => (
            <StateCard
              key={name}
              name={name}
              percentage={data.percentage}
              visitors={data.visitors}
              growth={data.growth}
              index={index}
              maxPercentage={maxPercentage}
            />
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-purple-100 rounded-xl border border-purple-200">
        <h5 className="font-bold text-purple-900 mb-2">💡 Insights Geográficos:</h5>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Ciudad de México lidera con 22.4% de visitantes</li>
          <li>• Estado de México muestra el mayor crecimiento (+18.3%)</li>
          <li>• Top 3 estados concentran el 50.5% del tráfico</li>
          <li>• Buena distribución nacional con presencia en {Object.keys(geographyData.states).length - 1} estados</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default GeographySection;