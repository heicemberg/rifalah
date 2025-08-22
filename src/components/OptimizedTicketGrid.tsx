// ============================================================================
// GRID DE TICKETS OPTIMIZADO PARA 10,000 BOLETOS SIN LAG
// ============================================================================

'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { cn } from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

interface TicketGridProps {
  selectedTickets: number[];
  soldTickets: number[];
  reservedTickets: number[];
  onToggleTicket: (ticketNumber: number) => void;
  onSelectRandom: (count: number) => void;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL CON VIRTUALIZACIÓN
// ============================================================================

const OptimizedTicketGrid: React.FC<TicketGridProps> = ({
  selectedTickets,
  soldTickets,
  reservedTickets,
  onToggleTicket,
  onSelectRandom,
  className
}) => {
  const [viewMode] = useState<'all' | 'available'>('available');
  const [startRange, setStartRange] = useState(1);
  const [endRange, setEndRange] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Configuración de virtualización
  const TICKETS_PER_ROW = 20;
  const ROWS_TO_SHOW = 10;
  const TICKETS_PER_VIEW = TICKETS_PER_ROW * ROWS_TO_SHOW;

  // Generar estado de todos los tickets
  const ticketStates = useMemo(() => {
    const states = new Map<number, 'available' | 'selected' | 'sold' | 'reserved'>();
    
    // Inicializar todos como disponibles
    for (let i = 1; i <= 10000; i++) {
      states.set(i, 'available');
    }
    
    // Marcar vendidos
    soldTickets.forEach(ticket => {
      states.set(ticket, 'sold');
    });
    
    // Marcar reservados
    reservedTickets.forEach(ticket => {
      states.set(ticket, 'reserved');
    });
    
    // Marcar seleccionados
    selectedTickets.forEach(ticket => {
      if (states.get(ticket) === 'available') {
        states.set(ticket, 'selected');
      }
    });
    
    return states;
  }, [selectedTickets, soldTickets, reservedTickets]);

  // Filtrar tickets según el modo de vista
  const filteredTickets = useMemo(() => {
    const tickets = [];
    for (let i = 1; i <= 10000; i++) {
      const state = ticketStates.get(i)!;
      if (viewMode === 'available' && (state === 'available' || state === 'selected')) {
        tickets.push(i);
      } else if (viewMode === 'all') {
        tickets.push(i);
      }
    }
    return tickets;
  }, [ticketStates, viewMode]);

  // Note: filteredTickets is computed but not currently used in display

  // Tickets a mostrar en el rango actual
  const currentTickets = useMemo(() => {
    return Array.from({ length: endRange - startRange + 1 }, (_, i) => startRange + i)
      .filter(num => num <= 10000);
  }, [startRange, endRange]);

  // Estadísticas
  const stats = useMemo(() => ({
    available: Array.from(ticketStates.values()).filter(state => state === 'available').length,
    selected: selectedTickets.length,
    sold: soldTickets.length,
    reserved: reservedTickets.length
  }), [ticketStates, selectedTickets.length, soldTickets.length, reservedTickets.length]);

  const getTicketStyle = useCallback((ticketNumber: number) => {
    const state = ticketStates.get(ticketNumber);
    
    switch (state) {
      case 'sold':
        return 'bg-red-500 text-white cursor-not-allowed opacity-60';
      case 'reserved':
        return 'bg-yellow-500 text-white cursor-not-allowed opacity-80';
      case 'selected':
        return 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600 ring-2 ring-blue-300 scale-105';
      default:
        return 'bg-white text-gray-800 cursor-pointer hover:bg-blue-50 hover:text-blue-700 border border-gray-300 hover:border-blue-400 transition-all duration-150';
    }
  }, [ticketStates]);

  const handleTicketClick = useCallback((ticketNumber: number) => {
    const state = ticketStates.get(ticketNumber);
    if (state === 'available' || state === 'selected') {
      onToggleTicket(ticketNumber);
    }
  }, [ticketStates, onToggleTicket]);

  // Navegación por rangos
  const goToRange = (start: number) => {
    const end = Math.min(start + TICKETS_PER_VIEW - 1, 10000);
    setStartRange(start);
    setEndRange(end);
  };

  const nextRange = () => {
    const newStart = Math.min(endRange + 1, 10000 - TICKETS_PER_VIEW + 1);
    goToRange(newStart);
  };

  const prevRange = () => {
    const newStart = Math.max(startRange - TICKETS_PER_VIEW, 1);
    goToRange(newStart);
  };

  // Rangos rápidos
  const quickRanges = [
    { label: '1-1000', start: 1 },
    { label: '1001-2000', start: 1001 },
    { label: '2001-3000', start: 2001 },
    { label: '3001-4000', start: 3001 },
    { label: '4001-5000', start: 4001 },
    { label: '5001-6000', start: 5001 },
    { label: '6001-7000', start: 6001 },
    { label: '7001-8000', start: 7001 },
    { label: '8001-9000', start: 8001 },
    { label: '9001-10000', start: 9001 }
  ];

  // Opciones de selección rápida
  const quickSelectOptions = [
    { count: 1, label: '1 boleto' },
    { count: 5, label: '5 boletos' },
    { count: 10, label: '10 boletos' },
    { count: 25, label: '25 boletos' },
    { count: 50, label: '50 boletos' }
  ];

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.available.toLocaleString()}</div>
          <div className="text-sm text-green-700">Disponibles</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.selected.toLocaleString()}</div>
          <div className="text-sm text-blue-700">Seleccionados</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.sold.toLocaleString()}</div>
          <div className="text-sm text-red-700">Vendidos</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.reserved.toLocaleString()}</div>
          <div className="text-sm text-yellow-700">Reservados</div>
        </div>
      </div>

      {/* Selección rápida */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-blue-800 mb-3">⚡ Selección Rápida</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {quickSelectOptions.map((option) => (
            <button
              key={option.count}
              onClick={() => onSelectRandom(option.count)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navegación por rangos */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">🎯 Navegar por Rangos</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          {quickRanges.map((range) => (
            <button
              key={range.start}
              onClick={() => goToRange(range.start)}
              className={cn(
                'py-2 px-3 rounded-lg font-medium transition-colors text-sm',
                startRange >= range.start && startRange < range.start + 1000
                  ? 'bg-purple-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-purple-50'
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando: {startRange.toLocaleString()} - {endRange.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevRange}
              disabled={startRange <= 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={nextRange}
              disabled={endRange >= 10000}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      {/* Grid de tickets */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div 
          ref={containerRef}
          className="grid gap-1 max-h-96 overflow-y-auto"
          style={{
            gridTemplateColumns: `repeat(${TICKETS_PER_ROW}, minmax(0, 1fr))`
          }}
        >
          {currentTickets.map((ticketNumber) => (
            <button
              key={ticketNumber}
              onClick={() => handleTicketClick(ticketNumber)}
              disabled={ticketStates.get(ticketNumber) === 'sold' || ticketStates.get(ticketNumber) === 'reserved'}
              className={cn(
                'aspect-square rounded text-xs font-medium transition-all duration-150',
                'flex items-center justify-center min-h-[32px] min-w-[32px]',
                getTicketStyle(ticketNumber)
              )}
              title={`Ticket ${ticketNumber.toString().padStart(4, '0')} - ${ticketStates.get(ticketNumber)}`}
            >
              {ticketNumber.toString().padStart(4, '0')}
            </button>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">📋 Leyenda</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>Seleccionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Vendido</span>
          </div>
        </div>
      </div>

      {/* Información de rendimiento */}
      <div className="text-xs text-gray-500 text-center">
        💡 Mostrando {currentTickets.length} de 10,000 boletos para óptimo rendimiento
      </div>
    </div>
  );
};

export default OptimizedTicketGrid;