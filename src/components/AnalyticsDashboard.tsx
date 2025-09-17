'use client';

// ============================================================================
// ANALYTICS DASHBOARD - Mexican Truck Raffle Admin Panel (Reorganized)
// Modular business analytics dashboard with organized sections
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  RefreshCw,
  X
} from 'lucide-react';

// Import modular analytics sections
import AnalyticsOverview from './analytics/AnalyticsOverview';
import TrafficSection from './analytics/TrafficSection';
import SalesSection from './analytics/SalesSection';
import BehaviorSection from './analytics/BehaviorSection';
import GeographySection from './analytics/GeographySection';

const AnalyticsDashboard: React.FC = () => {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleSectionToggle = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  const refreshData = () => {
    setLastUpdated(new Date());
    // Simulate data refresh
    console.log('📊 Analytics data refreshed');
  };

  const exportToPDF = () => {
    console.log('📄 Exporting analytics to PDF...');
    // Implementation for PDF export
  };

  const exportToExcel = () => {
    console.log('📊 Exporting analytics to Excel...');
    // Implementation for Excel export
  };

  const getSectionComponent = (sectionId: string) => {
    switch (sectionId) {
      case 'traffic':
        return <TrafficSection key="traffic" />;
      case 'sales':
        return <SalesSection key="sales" />;
      case 'behavior':
        return <BehaviorSection key="behavior" />;
      case 'geography':
        return <GeographySection key="geography" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
      >
        <div className="flex items-center gap-3">
          <div className="text-sm text-blue-200">
            Última actualización: {lastUpdated.toLocaleTimeString('es-MX')}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshData}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 rounded-lg font-medium transition-all duration-200 border border-blue-400/30"
          >
            <RefreshCw size={14} />
            Actualizar
          </motion.button>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 rounded-lg font-medium transition-all duration-200 border border-red-400/30"
          >
            <FileText size={16} />
            PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 rounded-lg font-medium transition-all duration-200 border border-emerald-400/30"
          >
            <Download size={16} />
            Excel
          </motion.button>
        </div>
      </motion.div>

      {/* Analytics Overview */}
      <AnalyticsOverview
        onSectionToggle={handleSectionToggle}
        openSections={openSections}
      />

      {/* Dynamic Sections */}
      <AnimatePresence mode="popLayout">
        {Array.from(openSections).map((sectionId) => (
          <motion.div
            key={sectionId}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSectionToggle(sectionId)}
              className="absolute top-4 right-4 z-10 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-full transition-all duration-200 border border-red-400/30"
            >
              <X size={16} />
            </motion.button>

            {/* Section Content */}
            {getSectionComponent(sectionId)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Quick Stats Summary */}
      {openSections.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="text-center">
            <h4 className="text-lg font-bold text-blue-200 mb-2">
              📊 Resumen Ejecutivo
            </h4>
            <p className="text-blue-300 text-sm">
              Mostrando {openSections.size} sección{openSections.size !== 1 ? 'es' : ''}
              de analytics • Datos actualizados en tiempo real
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {Array.from(openSections).map((sectionId) => {
                const sectionNames = {
                  traffic: '📈 Tráfico',
                  sales: '💰 Ventas',
                  behavior: '👥 Comportamiento',
                  geography: '🗺️ Geografía'
                };
                return (
                  <span
                    key={sectionId}
                    className="px-3 py-1 bg-blue-600/20 text-blue-200 rounded-full text-xs font-medium border border-blue-400/30"
                  >
                    {sectionNames[sectionId as keyof typeof sectionNames]}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;