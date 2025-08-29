'use client';

import React, { useState, useEffect } from 'react';
import { inicializarTickets, verificarConexion, obtenerEstadisticasTickets } from '../lib/supabase';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { adminToast } from '../lib/toast-utils';

// ============================================================================
// COMPONENTE PARA INICIALIZAR LA BASE DE DATOS DE TICKETS
// ============================================================================

export const SupabaseInitializer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [needsInitialization, setNeedsInitialization] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    disponibles: number;
    vendidos: number;
    reservados: number;
  } | null>(null);
  
  const { isConnected, refreshData } = useSupabaseSync();

  // Verificar estado de la base de datos al montar
  useEffect(() => {
    checkDatabaseStatus();
  }, [isConnected]);

  const checkDatabaseStatus = async () => {
    if (!isConnected) return;

    try {
      const ticketStats = await obtenerEstadisticasTickets();
      
      if (ticketStats) {
        setStats(ticketStats);
        setNeedsInitialization(ticketStats.total === 0);
        
        if (ticketStats.total === 0) {
          adminToast.error('⚠️ Base de datos vacía. Necesita inicialización.');
        } else {
          console.log(`✅ Base de datos OK: ${ticketStats.total} tickets, ${ticketStats.vendidos} vendidos`);
        }
      }
    } catch (error) {
      console.error('❌ Error al verificar estado de BD:', error);
      adminToast.error('Error al verificar estado de la base de datos');
    }
  };

  const handleInitialize = async () => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
      adminToast.loading('Inicializando base de datos de tickets...');
      
      const success = await inicializarTickets();
      
      if (success) {
        adminToast.success('✅ Base de datos inicializada correctamente!');
        await checkDatabaseStatus();
        await refreshData();
      } else {
        adminToast.error('❌ Error al inicializar la base de datos');
      }
    } catch (error) {
      console.error('Error en inicialización:', error);
      adminToast.error('Error crítico durante la inicialización');
    } finally {
      setIsInitializing(false);
    }
  };

  // No renderizar nada si no está conectado o no necesita inicialización
  if (!isConnected || !needsInitialization) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            ⚠️
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-yellow-800 font-bold text-sm mb-2">
            Base de Datos Vacía
          </h3>
          <p className="text-yellow-700 text-xs mb-3">
            La base de datos no tiene tickets. Se necesita inicializar con 10,000 tickets numerados.
          </p>
          
          {stats && (
            <div className="bg-white rounded p-2 mb-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>Total: {stats.total}</div>
                <div>Vendidos: {stats.vendidos}</div>
                <div>Disponibles: {stats.disponibles}</div>
                <div>Reservados: {stats.reservados}</div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleInitialize}
            disabled={isInitializing}
            className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isInitializing
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isInitializing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Inicializando...
              </div>
            ) : (
              '🚀 Inicializar BD'
            )}
          </button>
          
          <p className="text-yellow-600 text-xs mt-2">
            ⏱️ Este proceso puede tomar 1-2 minutos
          </p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseInitializer;