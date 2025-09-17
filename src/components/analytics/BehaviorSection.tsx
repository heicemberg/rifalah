'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Clock,
  MousePointer,
  Activity,
  Zap,
  Hand,
  Timer
} from 'lucide-react';

interface BehaviorData {
  popularTicketQuantities: Array<{
    quantity: number;
    count: number;
    percentage: number;
  }>;
  timeOnSections: {
    ticketSelection: number;
    paymentMethod: number;
    customerData: number;
    paymentProof: number;
  };
  modalInteractions: {
    opened: number;
    completed: number;
    abandoned: number;
  };
  featureUsage: {
    quickSelect: number;
    manualSelect: number;
    cryptoPayments: number;
  };
}

const BehaviorSection: React.FC = () => {
  // Mock data - in production this would come from props or API
  const behaviorData: BehaviorData = {
    popularTicketQuantities: [
      { quantity: 5, count: 1247, percentage: 42.3 },
      { quantity: 10, count: 845, percentage: 28.7 },
      { quantity: 25, count: 536, percentage: 18.2 },
      { quantity: 50, count: 230, percentage: 7.8 },
      { quantity: 100, count: 88, percentage: 3.0 },
    ],
    timeOnSections: {
      ticketSelection: 2.4,
      paymentMethod: 1.8,
      customerData: 1.2,
      paymentProof: 0.9,
    },
    modalInteractions: {
      opened: 2847,
      completed: 456,
      abandoned: 2391,
    },
    featureUsage: {
      quickSelect: 68.2,
      manualSelect: 31.8,
      cryptoPayments: 13.6,
    },
  };

  const QuantityCard = ({
    quantity,
    count,
    percentage,
    index
  }: {
    quantity: number;
    count: number;
    percentage: number;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-slate-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-3xl font-bold text-orange-600">
          {quantity}
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">tickets</div>
          <div className="text-lg font-bold text-slate-800">
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="w-full bg-slate-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
          />
        </div>
        <div className="text-sm text-slate-600">
          {count.toLocaleString()} personas
        </div>
      </div>
    </motion.div>
  );

  const TimeCard = ({
    section,
    time,
    icon,
    color,
    index
  }: {
    section: string;
    time: number;
    icon: React.ReactNode;
    color: string;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-slate-200"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${color} rounded-lg`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className="flex-1">
          <h5 className="font-medium text-slate-700">{section}</h5>
          <div className="text-2xl font-bold text-slate-900">
            {time.toFixed(1)} min
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(time / 3) * 100}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
          className={`${color} h-2 rounded-full`}
        />
      </div>
    </motion.div>
  );

  const FeatureCard = ({
    name,
    percentage,
    icon,
    color,
    index
  }: {
    name: string;
    percentage: number;
    icon: React.ReactNode;
    color: string;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center"
    >
      <div className={`${color} text-white p-3 rounded-xl mb-3 mx-auto w-fit`}>
        {icon}
      </div>
      <h5 className="font-medium text-slate-700 mb-2">{name}</h5>
      <div className="text-2xl font-bold text-slate-900 mb-2">
        {percentage.toFixed(1)}%
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.8 }}
          className={`${color} h-2 rounded-full`}
        />
      </div>
    </motion.div>
  );

  const completionRate = (behaviorData.modalInteractions.completed / behaviorData.modalInteractions.opened) * 100;
  const abandonmentRate = (behaviorData.modalInteractions.abandoned / behaviorData.modalInteractions.opened) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 shadow-xl border border-orange-200"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-600 rounded-xl">
          <Target className="text-white" size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">👥 Comportamiento de Usuario</h3>
          <p className="text-slate-600">Análisis de interacciones y preferencias de los usuarios</p>
        </div>
      </div>

      {/* Cantidades Populares */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity size={20} />
          Cantidades de Tickets Más Populares
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {behaviorData.popularTicketQuantities.map((item, index) => (
            <QuantityCard
              key={item.quantity}
              quantity={item.quantity}
              count={item.count}
              percentage={item.percentage}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Tiempo en Secciones */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Clock size={20} />
          Tiempo Promedio por Sección
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TimeCard
            section="Selección de Tickets"
            time={behaviorData.timeOnSections.ticketSelection}
            icon={<MousePointer size={16} />}
            color="bg-blue-500"
            index={0}
          />
          <TimeCard
            section="Método de Pago"
            time={behaviorData.timeOnSections.paymentMethod}
            icon={<Target size={16} />}
            color="bg-emerald-500"
            index={1}
          />
          <TimeCard
            section="Datos Cliente"
            time={behaviorData.timeOnSections.customerData}
            icon={<Activity size={16} />}
            color="bg-orange-500"
            index={2}
          />
          <TimeCard
            section="Comprobante Pago"
            time={behaviorData.timeOnSections.paymentProof}
            icon={<Timer size={16} />}
            color="bg-purple-500"
            index={3}
          />
        </div>
      </div>

      {/* Interacciones Modal */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MousePointer size={20} />
          Interacciones del Modal de Compra
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {behaviorData.modalInteractions.opened.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 mb-2">Modales Abiertos</div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-full" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {behaviorData.modalInteractions.completed.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 mb-2">
              Completados ({completionRate.toFixed(1)}%)
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-emerald-500 h-2 rounded-full"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {behaviorData.modalInteractions.abandoned.toLocaleString()}
            </div>
            <div className="text-sm text-slate-600 mb-2">
              Abandonados ({abandonmentRate.toFixed(1)}%)
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${abandonmentRate}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="bg-red-500 h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Uso de Features */}
      <div>
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap size={20} />
          Uso de Funcionalidades
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            name="Selección Rápida"
            percentage={behaviorData.featureUsage.quickSelect}
            icon={<Zap size={24} />}
            color="bg-blue-500"
            index={0}
          />
          <FeatureCard
            name="Selección Manual"
            percentage={behaviorData.featureUsage.manualSelect}
            icon={<Hand size={24} />}
            color="bg-emerald-500"
            index={1}
          />
          <FeatureCard
            name="Pagos Crypto"
            percentage={behaviorData.featureUsage.cryptoPayments}
            icon={<Target size={24} />}
            color="bg-purple-500"
            index={2}
          />
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-orange-100 rounded-xl border border-orange-200">
        <h5 className="font-bold text-orange-900 mb-2">💡 Insights de Comportamiento:</h5>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• 68% de usuarios prefieren selección rápida vs manual</li>
          <li>• 5 tickets es la cantidad más popular (42.3%)</li>
          <li>• Usuarios pasan más tiempo seleccionando tickets (2.4 min)</li>
          <li>• Tasa de completación del modal: {completionRate.toFixed(1)}%</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default BehaviorSection;