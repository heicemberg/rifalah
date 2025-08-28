// ============================================================================
// HOOK PARA SINCRONIZAR DATOS CON SUPABASE
// ============================================================================

import { useEffect, useState } from 'react';
import { supabase, verificarConexion } from '../lib/supabase';
import { useRaffleStore } from '../stores/raffle-store';
import toast from 'react-hot-toast';
import { adminToast, publicToast, isCurrentUserAdmin } from '../lib/toast-utils';

export function useSupabaseSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fomoPercentage, setFomoPercentage] = useState(8);
  
  // Store actions
  const { 
    _updateAvailableTickets,
    setSoldTicketsFromDB,
    setReservedTicketsFromDB
  } = useRaffleStore(state => ({
    _updateAvailableTickets: state._updateAvailableTickets,
    setSoldTicketsFromDB: state.setSoldTicketsFromDB,
    setReservedTicketsFromDB: state.setReservedTicketsFromDB
  }));

  // ============================================================================
  // SISTEMA FOMO: GENERAR TICKETS VENDIDOS VISUALMENTE (8%-18%)
  // ============================================================================
  const generateFomoTickets = (realSoldTickets: number[]): number[] => {
    const totalTickets = 10000;
    const currentPercentage = (realSoldTickets.length / totalTickets) * 100;
    
    // Si ya tenemos más del 18% vendido realmente, no agregar FOMO
    if (currentPercentage >= 18) {
      return realSoldTickets;
    }
    
    // Calcular cuántos tickets FOMO necesitamos para llegar al porcentaje objetivo
    const targetCount = Math.floor((fomoPercentage / 100) * totalTickets);
    const fomoNeeded = Math.max(0, targetCount - realSoldTickets.length);
    
    if (fomoNeeded === 0) {
      return realSoldTickets;
    }
    
    // Generar tickets FOMO aleatorios que no estén en los reales
    const realTicketsSet = new Set(realSoldTickets);
    const fomoTickets: number[] = [];
    
    while (fomoTickets.length < fomoNeeded) {
      const randomTicket = Math.floor(Math.random() * totalTickets) + 1;
      if (!realTicketsSet.has(randomTicket) && !fomoTickets.includes(randomTicket)) {
        fomoTickets.push(randomTicket);
      }
    }
    
    // Combinar tickets reales + FOMO
    const allTickets = [...realSoldTickets, ...fomoTickets].sort((a, b) => a - b);
    
    console.log(`FOMO System: ${realSoldTickets.length} real + ${fomoTickets.length} FOMO = ${allTickets.length} total (${fomoPercentage}%)`);
    
    return allTickets;
  };

  // ============================================================================
  // CARGAR DATOS INICIALES DESDE SUPABASE
  // ============================================================================
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Verificar conexión
      const connected = await verificarConexion();
      setIsConnected(connected);
      
      if (!connected) {
        console.warn('Supabase no disponible, usando datos locales');
        // Mostrar mensaje técnico solo a administradores
        adminToast.error('Base de datos no disponible, usando modo offline');
        // Mostrar mensaje genérico a usuarios normales si es necesario
        if (!isCurrentUserAdmin()) {
          // No mostrar nada a usuarios normales, funcionará en modo offline transparente
        }
        setLoading(false);
        return;
      }

      // Obtener tickets vendidos reales desde la base de datos
      const { data: soldTicketsData, error: soldError } = await supabase
        .from('tickets')
        .select('number')
        .eq('status', 'vendido');

      if (soldError) {
        console.error('Error al obtener tickets vendidos:', soldError);
        // Mostrar error técnico solo a administradores
        adminToast.error('Error al cargar tickets vendidos');
      } else {
        const realSoldTickets = soldTicketsData?.map((t: any) => t.number) || [];
        
        // Aplicar sistema FOMO
        const visualSoldTickets = generateFomoTickets(realSoldTickets);
        
        // Actualizar store con tickets visuales (incluye FOMO)
        setSoldTicketsFromDB(visualSoldTickets);
        
        console.log(`Cargados ${realSoldTickets.length} tickets reales, mostrando ${visualSoldTickets.length} (${fomoPercentage}%)`);
        // Mostrar información técnica solo a administradores
        adminToast.info(`Cargados ${realSoldTickets.length} tickets reales, mostrando ${visualSoldTickets.length} (${fomoPercentage}%)`);
      }

      // Obtener tickets reservados
      const { data: reservedTicketsData, error: reservedError } = await supabase
        .from('tickets')
        .select('number')
        .eq('status', 'reservado');

      if (reservedError) {
        console.error('Error al obtener tickets reservados:', reservedError);
        // Mostrar error técnico solo a administradores
        adminToast.error('Error al obtener tickets reservados');
      } else {
        const reservedNumbers = reservedTicketsData?.map((t: any) => t.number) || [];
        setReservedTicketsFromDB(reservedNumbers);
      }

      // Actualizar tickets disponibles
      setTimeout(() => {
        _updateAvailableTickets();
      }, 100);
      
      // Mostrar mensaje de sincronización solo a administradores
      adminToast.success(`Datos sincronizados: ${fomoPercentage}% vendido`);
      
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
      // Mostrar error técnico solo a administradores
      adminToast.error('Error al sincronizar con la base de datos');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTUALIZAR PORCENTAJE FOMO AUTOMÁTICAMENTE
  // ============================================================================
  useEffect(() => {
    const updateFomoPercentage = () => {
      // Incrementar gradualmente de 8% a 18% basado en compras y tiempo
      const basePercentage = 8;
      const maxPercentage = 18;
      const timeBoost = Math.min(2, Math.floor(Date.now() / (1000 * 60 * 30))); // +2% cada 30 min
      const randomBoost = Math.random() * 3; // +0-3% aleatorio
      
      const newPercentage = Math.min(
        maxPercentage, 
        basePercentage + timeBoost + randomBoost
      );
      
      if (Math.abs(newPercentage - fomoPercentage) > 0.5) {
        setFomoPercentage(Math.floor(newPercentage));
      }
    };

    // Actualizar cada 2 minutos
    const interval = setInterval(updateFomoPercentage, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fomoPercentage]);

  // ============================================================================
  // SUSCRIPCIÓN A CAMBIOS EN TIEMPO REAL
  // ============================================================================
  useEffect(() => {
    if (!isConnected) return;

    console.log('Configurando suscripciones en tiempo real...');

    // Suscripción a cambios en tickets
    const ticketsSubscription = supabase
      .channel('tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        (payload: any) => {
          console.log('Cambio en tickets:', payload);
          // Recargar datos cuando hay cambios
          loadInitialData();
        }
      )
      .subscribe();

    // Suscripción a cambios en compras
    const purchasesSubscription = supabase
      .channel('purchases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases'
        },
        (payload: any) => {
          console.log('Cambio en compras:', payload);
          // Mostrar notificación de nueva compra - esto SÍ es público y debe verse por todos
          if (payload.eventType === 'INSERT') {
            publicToast.success('¡Nueva compra registrada!', {
              duration: 3000,
              icon: '🎉'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ticketsSubscription);
      supabase.removeChannel(purchasesSubscription);
    };
  }, [isConnected]);

  // ============================================================================
  // CARGAR DATOS AL MONTAR
  // ============================================================================
  useEffect(() => {
    loadInitialData();
    
    // Recargar datos cada 5 minutos
    const interval = setInterval(loadInitialData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // FUNCIÓN PARA OBTENER SOLO TICKETS REALMENTE DISPONIBLES
  // ============================================================================
  const getRealAvailableTickets = async (): Promise<number[]> => {
    try {
      if (!isConnected) {
        return [];
      }

      const { data: unavailableTickets, error } = await supabase
        .from('tickets')
        .select('number')
        .in('status', ['vendido', 'reservado']);

      if (error) {
        console.error('Error al obtener tickets no disponibles:', error);
        return [];
      }

      const unavailableNumbers = new Set(unavailableTickets?.map((t: any) => t.number) || []);
      const availableTickets: number[] = [];

      for (let i = 1; i <= 10000; i++) {
        if (!unavailableNumbers.has(i)) {
          availableTickets.push(i);
        }
      }

      return availableTickets;
    } catch (error) {
      console.error('Error en getRealAvailableTickets:', error);
      return [];
    }
  };

  return {
    isConnected,
    loading,
    fomoPercentage,
    refreshData: loadInitialData,
    getRealAvailableTickets
  };
}