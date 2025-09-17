'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Zap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AnalyticsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isOpen: boolean;
}

interface AnalyticsOverviewProps {
  onSectionToggle: (sectionId: string) => void;
  openSections: Set<string>;
}

const AnalyticsOverview: React.FC<AnalyticsOverviewProps> = ({
  onSectionToggle,
  openSections
}) => {
  const sections: AnalyticsSection[] = [
    {
      id: 'traffic',
      title: '📈 Tráfico y Visitantes',
      description: 'Análisis de visitantes, sesiones y comportamiento',
      icon: <Users size={24} />,
      color: 'blue',
      isOpen: openSections.has('traffic')
    },
    {
      id: 'sales',
      title: '💰 Ventas y Conversión',
      description: 'Embudo de ventas, ingresos y métricas de conversión',
      icon: <DollarSign size={24} />,
      color: 'green',
      isOpen: openSections.has('sales')
    },
    {
      id: 'behavior',
      title: '👥 Comportamiento de Usuario',
      description: 'Interacciones, tiempo en secciones y preferencias',
      icon: <Target size={24} />,
      color: 'orange',
      isOpen: openSections.has('behavior')
    },
    {
      id: 'geography',
      title: '🗺️ Distribución Geográfica',
      description: 'Visitantes por estados mexicanos',
      icon: <BarChart3 size={24} />,
      color: 'purple',
      isOpen: openSections.has('geography')
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 border-blue-200 bg-blue-50',
      green: 'from-emerald-500 to-emerald-600 border-emerald-200 bg-emerald-50',
      orange: 'from-orange-500 to-orange-600 border-orange-200 bg-orange-50',
      purple: 'from-purple-500 to-purple-600 border-purple-200 bg-purple-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <BarChart3 className="text-blue-400" size={28} />
          📊 Analytics Dashboard
        </h2>
        <p className="text-blue-200">
          Selecciona las secciones que quieres ver
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-2xl border-2 ${getColorClasses(section.color)} p-4 shadow-lg backdrop-blur-sm cursor-pointer hover:scale-105 transition-all duration-200`}
            onClick={() => onSectionToggle(section.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 bg-gradient-to-br ${getColorClasses(section.color).split(' ')[0]} rounded-xl shadow-lg`}>
                  <div className="text-white">
                    {section.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {section.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  section.isOpen
                    ? 'bg-green-100 text-green-800'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {section.isOpen ? 'Abierto' : 'Cerrado'}
                </span>
                {section.isOpen ? (
                  <ChevronUp className="text-slate-600" size={20} />
                ) : (
                  <ChevronDown className="text-slate-600" size={20} />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {openSections.size === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <Zap className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-200 text-lg">
            Haz clic en las secciones de arriba para ver las analíticas
          </p>
          <p className="text-blue-300 text-sm mt-2">
            Puedes abrir múltiples secciones al mismo tiempo
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsOverview;