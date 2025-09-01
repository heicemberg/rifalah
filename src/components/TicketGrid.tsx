// ============================================================================
// GRID VIRTUALIZADO DE TICKETS PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { useRealTimeTickets } from '../hooks/useRealTimeTickets';
import { useBasicCounters, useDisplayStats, forceMasterUpdate } from '../hooks/useMasterCounters';
import { formatTicketNumber, cn } from '../lib/utils';
import { TOTAL_TICKETS } from '../lib/constants';
import { Gift, Zap, Trophy } from 'lucide-react';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

interface TicketCellProps {
  ticketNumber: number;
  isSelected: boolean;
  isSold: boolean;
  isReserved: boolean;
  onTicketClick: (ticketNumber: number) => void;
  cellSize: number;
}

interface VirtualizedRowProps {
  rowIndex: number;
  startTicket: number;
  endTicket: number;
  columnsPerRow: number;
  selectedTickets: number[];
  soldTickets: number[];
  reservedTickets: number[];
  onTicketClick: (ticketNumber: number) => void;
  cellSize: number;
  rowHeight: number;
  filterSettings: {
    hideOccupied: boolean;
    showOnlyAvailable: boolean;
    showOnlySelected: boolean;
  };
}

// Configuración de virtualización mejorada - NÚMEROS MÁS GRANDES
const CELL_SIZE_MOBILE = 64;
const CELL_SIZE_TABLET = 72;
const CELL_SIZE_DESKTOP = 80;
const CELL_GAP = 6;
const VIEWPORT_BUFFER = 3; // Filas extra a renderizar arriba y abajo

// Configuración responsive
const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
  desktop: 1280
};

// ============================================================================
// HOOK PARA CONFIGURACIÓN RESPONSIVE
// ============================================================================

const useResponsiveConfig = () => {
  const [config, setConfig] = useState({
    columnsPerRow: 15,
    cellSize: CELL_SIZE_DESKTOP
  });
  
  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      
      if (width < BREAKPOINTS.mobile) {
        setConfig({
          columnsPerRow: 6,
          cellSize: CELL_SIZE_MOBILE
        });
      } else if (width < BREAKPOINTS.tablet) {
        setConfig({
          columnsPerRow: 8,
          cellSize: CELL_SIZE_TABLET
        });
      } else if (width < BREAKPOINTS.desktop) {
        setConfig({
          columnsPerRow: 11,
          cellSize: CELL_SIZE_TABLET
        });
      } else {
        setConfig({
          columnsPerRow: 11,
          cellSize: CELL_SIZE_DESKTOP
        });
      }
    };
    
    updateConfig();
    window.addEventListener('resize', updateConfig);
    
    return () => window.removeEventListener('resize', updateConfig);
  }, []);
  
  return config;
};

// ============================================================================
// HOOK PARA VIRTUALIZACIÓN CON INTERSECTION OBSERVER
// ============================================================================

const useVirtualization = (
  totalItems: number, 
  columnsPerRow: number, 
  containerHeight: number,
  cellSize: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
  
  const rowHeight = cellSize + CELL_GAP;
  const totalRows = Math.ceil(totalItems / columnsPerRow);
  const visibleRowCount = Math.ceil(containerHeight / rowHeight);
  
  useEffect(() => {
    const startRow = Math.floor(scrollTop / rowHeight);
    const endRow = Math.min(
      startRow + visibleRowCount + (VIEWPORT_BUFFER * 2),
      totalRows
    );
    const bufferedStartRow = Math.max(0, startRow - VIEWPORT_BUFFER);
    
    setVisibleRange({
      start: bufferedStartRow,
      end: endRow
    });
  }, [scrollTop, totalRows, visibleRowCount, rowHeight]);
  
  return {
    visibleRange,
    totalRows,
    setScrollTop,
    totalHeight: totalRows * rowHeight,
    rowHeight
  };
};

// ============================================================================
// COMPONENTE DE CELDA INDIVIDUAL CON FILTROS
// ============================================================================

const TicketCell: React.FC<TicketCellProps & { shouldHide?: boolean }> = React.memo(({
  ticketNumber,
  isSelected,
  isSold,
  isReserved,
  onTicketClick,
  cellSize,
  shouldHide = false
}) => {
  const isAvailable = !isSold && !isReserved;
  
  // Ajustar tamaño de fuente según el tamaño de celda
  const fontSize = cellSize <= CELL_SIZE_MOBILE ? 'text-sm' : 
                   cellSize <= CELL_SIZE_TABLET ? 'text-base' : 'text-lg';

  const handleClick = useCallback(() => {
    if (isAvailable) {
      onTicketClick(ticketNumber);
    }
  }, [isAvailable, ticketNumber, onTicketClick]);

  // Si debe ocultarse, renderizar celda vacía
  if (shouldHide) {
    return (
      <div
        style={{
          width: cellSize,
          height: cellSize,
          minWidth: cellSize,
          minHeight: cellSize
        }}
        className="opacity-30"
      />
    );
  }
  
  const cellClasses = cn(
    'flex items-center justify-center font-bold cursor-pointer relative overflow-hidden',
    'border-2 rounded-xl transition-all duration-300 select-none backdrop-blur-sm',
    'hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl transform',
    fontSize,
    {
      // Disponible - Efecto glassmorphism premium
      'bg-gradient-to-br from-white/95 to-slate-50/90 border-emerald-400 text-slate-800 hover:border-emerald-500 hover:from-emerald-50/95 hover:to-emerald-100/90 hover:text-emerald-900 shadow-emerald-200/50 hover:shadow-emerald-300/60': 
        isAvailable && !isSelected,
      
      // Seleccionado - Verde premium con animación
      'bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-700 text-white hover:from-emerald-600 hover:to-green-700 shadow-xl shadow-emerald-500/40 ring-4 ring-emerald-400/50 animate-pulse-slow': 
        isSelected,
      
      // Vendido - Rojo premium con patrón
      'bg-gradient-to-br from-red-500 to-red-600 border-red-700 text-white cursor-not-allowed shadow-xl shadow-red-500/30': 
        isSold,
      
      // Reservado - Amarillo premium
      'bg-gradient-to-br from-amber-400 to-yellow-500 border-amber-600 text-amber-900 cursor-not-allowed shadow-xl shadow-amber-500/30': 
        isReserved,
    }
  );
  
  return (
    <div 
      className={cellClasses}
      onClick={handleClick}
      style={{
        width: cellSize,
        height: cellSize,
        minWidth: cellSize,
        minHeight: cellSize
      }}
      title={`Ticket ${formatTicketNumber(ticketNumber)} - ${
        isSold ? 'Vendido' : 
        isReserved ? 'Reservado' : 
        isSelected ? 'Seleccionado' : 
        'Disponible'
      }`}
    >
      {/* Efectos de brillo para tickets seleccionados */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      )}
      
      {/* Patrón sutil para tickets vendidos */}
      {isSold && (
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:8px_8px]"></div>
        </div>
      )}
      
      <span className="relative z-10 font-black">
        {formatTicketNumber(ticketNumber)}
      </span>
    </div>
  );
});

TicketCell.displayName = 'TicketCell';

// ============================================================================
// COMPONENTE DE FILA VIRTUALIZADA
// ============================================================================

const VirtualizedRow: React.FC<VirtualizedRowProps> = React.memo(({
  startTicket,
  columnsPerRow,
  selectedTickets,
  soldTickets,
  reservedTickets,
  onTicketClick,
  cellSize,
  rowHeight,
  filterSettings
}) => {
  const tickets = [];
  
  for (let i = 0; i < columnsPerRow; i++) {
    const ticketNumber = startTicket + i;
    
    if (ticketNumber <= TOTAL_TICKETS) {
      const isSelected = selectedTickets.includes(ticketNumber);
      const isSold = soldTickets.includes(ticketNumber);
      const isReserved = reservedTickets.includes(ticketNumber);
      const isAvailable = !isSold && !isReserved;
      
      // Determinar si debe ocultarse según los filtros
      let shouldHide = false;
      
      if (filterSettings.hideOccupied && (isSold || isReserved)) {
        shouldHide = true;
      }
      
      if (filterSettings.showOnlyAvailable && !isAvailable) {
        shouldHide = true;
      }
      
      if (filterSettings.showOnlySelected && !isSelected) {
        shouldHide = true;
      }
      
      tickets.push(
        <TicketCell
          key={ticketNumber}
          ticketNumber={ticketNumber}
          isSelected={isSelected}
          isSold={isSold}
          isReserved={isReserved}
          onTicketClick={onTicketClick}
          cellSize={cellSize}
          shouldHide={shouldHide}
        />
      );
    } else {
      // Celda vacía para mantener la estructura del grid
      tickets.push(
        <div
          key={`empty-${i}`}
          style={{
            width: cellSize,
            height: cellSize
          }}
        />
      );
    }
  }
  
  return (
    <div
      className="flex justify-center items-center"
      style={{
        height: rowHeight,
        paddingBottom: CELL_GAP,
        gap: CELL_GAP,
        width: '100%'
      }}
    >
      {tickets}
    </div>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

interface TicketGridProps {
  onOpenPurchaseModal?: (tickets: number) => void;
}

export const TicketGrid: React.FC<TicketGridProps> = ({ onOpenPurchaseModal }) => {
  // Estado del store
  const {
    selectedTickets,
    soldTickets,
    reservedTickets,
    selectTicket,
    deselectTicket
  } = useRaffleStore();
  
  // Hook de estadísticas de display
  const displayStats = useDisplayStats();
  const { 
    soldCount: visualSoldCount,
    availableCount: realAvailableCount,
    soldPercentage: visualPercentage,
    realSoldCount,
    isConnected,
    lastUpdate: lastSyncTime
  } = displayStats;
  
  // Refs y estado local
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(800);
  
  // FILTROS PARA TICKETS - NUEVO ESTADO
  const [showFilters, setShowFilters] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    hideOccupied: false, // Ocultar tickets vendidos/reservados
    showOnlyAvailable: false, // Solo mostrar disponibles
    showOnlySelected: false // Solo mostrar seleccionados
  });
  
  // Configuración responsive
  const { columnsPerRow, cellSize } = useResponsiveConfig();
  
  // Virtualización
  const { visibleRange, totalHeight, setScrollTop, rowHeight } = useVirtualization(
    TOTAL_TICKETS,
    columnsPerRow,
    containerHeight,
    cellSize
  );
  
  // Handler para scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, [setScrollTop]);
  
  // Handler para clicks en tickets
  const handleTicketClick = useCallback((ticketNumber: number) => {
    if (selectedTickets.includes(ticketNumber)) {
      deselectTicket(ticketNumber);
    } else {
      selectTicket(ticketNumber);
    }
  }, [selectedTickets, selectTicket, deselectTicket]);
  
  // Efecto para medir el contenedor - MÁS ALTO
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 150; // Menos margen
        setContainerHeight(Math.min(1000, Math.max(600, availableHeight))); // Más alto: 600-1000px
      }
    };
    
    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    
    return () => window.removeEventListener('resize', updateContainerHeight);
  }, []);
  
  // Hook para sincronización en tiempo real
  const {
    formatMexicanNumber,
    formatPriceMXN,
    calculatePrice,
    PRECIO_POR_BOLETO_MXN
  } = useRealTimeTickets();
  
  // Hook maestro para estadísticas matemáticamente garantizadas
  const masterCounters = useBasicCounters();
  
  // Usar datos reales del hook (sin números aleatorios)
  const allSoldTickets = soldTickets;
  
  // Generar filas visibles
  const visibleRows = useMemo(() => {
    const rows = [];
    
    for (let rowIndex = visibleRange.start; rowIndex < visibleRange.end; rowIndex++) {
      const startTicket = rowIndex * columnsPerRow + 1;
      const endTicket = Math.min(startTicket + columnsPerRow - 1, TOTAL_TICKETS);
      
      if (startTicket <= TOTAL_TICKETS) {
        rows.push(
          <VirtualizedRow
            key={rowIndex}
            rowIndex={rowIndex}
            startTicket={startTicket}
            endTicket={endTicket}
            columnsPerRow={columnsPerRow}
            selectedTickets={selectedTickets}
            soldTickets={allSoldTickets}
            reservedTickets={reservedTickets}
            onTicketClick={handleTicketClick}
            cellSize={cellSize}
            rowHeight={rowHeight}
            filterSettings={filterSettings}
          />
        );
      }
    }
    
    return rows;
  }, [
    visibleRange,
    columnsPerRow,
    selectedTickets,
    allSoldTickets,
    reservedTickets,
    handleTicketClick,
    cellSize,
    rowHeight,
    filterSettings
  ]);
  
  return (
    <div className="w-full" data-grid="ticket-grid">
      {/* Título del Grid de Tickets */}
      <div className="text-center mb-8">
        <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
          MAPA DE <span className="text-yellow-400">NÚMEROS DE LA SUERTE</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
          Dale clic a los números que se te antojen para la rifa. Todos tienen la misma oportunidad de ganar.
        </p>
        
        {/* Indicadores rápidos */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full border border-green-500/30">
            <span className="font-bold">{formatMexicanNumber(masterCounters.availableTickets)}</span> disponibles
          </div>
          <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full border border-red-500/30">
            <span className="font-bold">{formatMexicanNumber(masterCounters.soldTickets)}</span> vendidos
          </div>
          <div className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full border border-yellow-500/30">
            <span className="font-bold">{formatPriceMXN(PRECIO_POR_BOLETO_MXN)}</span> por boleto
          </div>
        </div>
      </div>

      {/* Leyenda Premium con Filtros */}
      <div className="mb-6 p-6 bg-gradient-to-r from-slate-50/95 to-emerald-50/95 backdrop-blur-sm rounded-3xl border-2 border-emerald-200/60 shadow-xl">
        {/* Leyenda de colores */}
        <div className="flex flex-wrap justify-center gap-6 mb-4">
          <div className="flex items-center gap-3 bg-white/80 px-4 py-2 rounded-2xl border border-emerald-200 shadow-md">
            <div className="w-6 h-6 bg-gradient-to-br from-white/95 to-slate-50/90 border-2 border-emerald-400 rounded-xl shadow-lg"></div>
            <span className="text-sm font-bold text-emerald-800">Disponible</span>
          </div>
          <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-300 shadow-md">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-emerald-700 rounded-xl shadow-lg"></div>
            <span className="text-sm font-bold text-emerald-800">Escogido</span>
          </div>
          <div className="flex items-center gap-3 bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-300 shadow-md">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-amber-600 rounded-xl shadow-lg"></div>
            <span className="text-sm font-bold text-amber-800">Reservado</span>
          </div>
          <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-2xl border border-red-300 shadow-md">
            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 border-2 border-red-700 rounded-xl shadow-lg"></div>
            <span className="text-sm font-bold text-red-800">Vendido</span>
          </div>
        </div>

        {/* Botón para mostrar/ocultar filtros */}
        <div className="text-center mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white/60 rounded-2xl p-4 border border-gray-200/50 backdrop-blur-sm animate-slide-down">
            <h4 className="text-lg font-bold text-gray-800 mb-3 text-center">🔍 Filtros de Visualización</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 cursor-pointer hover:shadow-md transition-all">
                  <input
                    type="checkbox"
                    checked={filterSettings.hideOccupied}
                    onChange={(e) => setFilterSettings(prev => ({ 
                      ...prev, 
                      hideOccupied: e.target.checked,
                      showOnlyAvailable: e.target.checked ? false : prev.showOnlyAvailable 
                    }))}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-red-800">Ocultar Ocupados</span>
                    <p className="text-xs text-red-600">Esconder vendidos y reservados</p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 cursor-pointer hover:shadow-md transition-all">
                  <input
                    type="checkbox"
                    checked={filterSettings.showOnlyAvailable}
                    onChange={(e) => setFilterSettings(prev => ({ 
                      ...prev, 
                      showOnlyAvailable: e.target.checked,
                      hideOccupied: e.target.checked ? false : prev.hideOccupied,
                      showOnlySelected: e.target.checked ? false : prev.showOnlySelected
                    }))}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-sm font-bold text-emerald-800">Solo Disponibles</span>
                    <p className="text-xs text-emerald-600">Ver solo números disponibles</p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 cursor-pointer hover:shadow-md transition-all">
                  <input
                    type="checkbox"
                    checked={filterSettings.showOnlySelected}
                    onChange={(e) => setFilterSettings(prev => ({ 
                      ...prev, 
                      showOnlySelected: e.target.checked,
                      showOnlyAvailable: e.target.checked ? false : prev.showOnlyAvailable,
                      hideOccupied: e.target.checked ? false : prev.hideOccupied
                    }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    disabled={selectedTickets.length === 0}
                  />
                  <div>
                    <span className={`text-sm font-bold ${selectedTickets.length === 0 ? 'text-gray-400' : 'text-blue-800'}`}>
                      Solo los que Escogí
                    </span>
                    <p className={`text-xs ${selectedTickets.length === 0 ? 'text-gray-400' : 'text-blue-600'}`}>
                      Ver solo tus {selectedTickets.length} tickets
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Botón para limpiar filtros */}
            <div className="text-center mt-4">
              <button
                onClick={() => setFilterSettings({ hideOccupied: false, showOnlyAvailable: false, showOnlySelected: false })}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>

            {/* Indicador del estado de conexión */}
            <div className="mt-3 text-center space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                {isConnected 
                  ? `✅ Conectado • ${realSoldCount} tickets vendidos`
                  : '⚠️ Modo offline • Usando datos locales'
                }
              </div>
              
              {isConnected && lastSyncTime && (
                <div className="text-xs text-gray-500">
                  🕐 Última sincronización: {lastSyncTime.toLocaleTimeString('es-MX')}
                  <button 
                    onClick={forceMasterUpdate}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Actualizar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      

      {/* Información del grid con datos reales */}
      <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm bg-gradient-to-r from-emerald-50/80 to-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-center">
          <div className="text-lg font-black text-gray-900">{formatMexicanNumber(masterCounters.totalTickets)}</div>
          <div className="text-xs font-medium text-gray-600">Total Números</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-green-600">{selectedTickets.length}</div>
          <div className="text-xs font-medium text-gray-600">Escogidos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-red-600">{formatMexicanNumber(masterCounters.soldTickets)}</div>
          <div className="text-xs font-medium text-gray-600">Vendidos</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-blue-600">{formatMexicanNumber(masterCounters.availableTickets)}</div>
          <div className="text-xs font-medium text-gray-600">Disponibles</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-purple-600">{masterCounters.soldPercentage.toFixed(1)}%</div>
          <div className="text-xs font-medium text-gray-600">Progreso</div>
        </div>
      </div>
      
      {/* Container virtualizado - CENTRADO Y SIN SCROLL HORIZONTAL */}
      <div className="w-full flex justify-center px-4">
        <div 
          ref={containerRef}
          className="border-2 border-gray-300/60 rounded-2xl shadow-2xl bg-gradient-to-b from-white to-gray-50 mx-auto backdrop-blur-sm"
          style={{ 
            width: `${columnsPerRow * cellSize + (columnsPerRow - 1) * CELL_GAP + 32}px`,
            height: containerHeight,
            maxWidth: '100vw'
          }}
        >
          <div
            className="overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100 p-4"
            style={{ height: '100%', width: '100%' }}
            onScroll={handleScroll}
          >
            {/* Spacer superior */}
            <div style={{ height: visibleRange.start * rowHeight }} />
            
            {/* Filas visibles - CENTRADAS */}
            <div className="flex flex-col items-center">
              {visibleRows}
            </div>
            
            {/* Spacer inferior */}
            <div style={{ 
              height: Math.max(0, totalHeight - (visibleRange.end * rowHeight))
            }} />
          </div>
        </div>
      </div>
      
      {/* Controles móviles mejorados */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600 font-medium mb-2">
          💡 Dale clic a los números para escoger tus boletos
        </div>
        <div className="text-xs text-gray-500">
          Mueve la pantalla para ver todos los números disponibles
        </div>
      </div>
      
      {/* Información de performance (oculta en producción) */}
      {false && process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <div>Grid: {columnsPerRow} columnas • Altura: {containerHeight}px</div>
          <div>Rango visible: {visibleRange.start} - {visibleRange.end}</div>
          <div>Filas renderizadas: {visibleRows.length}</div>
          <div>Total tickets: {TOTAL_TICKETS.toLocaleString()}</div>
        </div>
      )}
      
      {/* Estado cuando no hay tickets disponibles */}
      {masterCounters.availableTickets === 0 && (
        <div className="mt-6 p-8 bg-gradient-to-r from-red-600/20 to-red-700/30 rounded-3xl border-2 border-red-500/50 text-center backdrop-blur-sm">
          <div className="text-red-300 text-2xl font-black mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            ¡RIFA AGOTADA!
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="text-red-200 text-lg mb-2">
            Todos los {formatMexicanNumber(masterCounters.totalTickets)} números ya están ocupados
          </div>
          <div className="text-red-300 text-sm">
            Gracias por tu interés. El sorteo se realizará pronto.
          </div>
        </div>
      )}
      
      {/* Botón flotante de compra con precios reales mexicanos */}
      {selectedTickets.length > 0 && onOpenPurchaseModal && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative">
            {/* Pulso animado múltiple */}
            <div className="absolute -inset-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-3xl opacity-30 animate-ping"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-emerald-500 rounded-2xl opacity-40 animate-pulse"></div>
            
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 hover:from-slate-800 hover:to-emerald-800 text-white rounded-3xl shadow-2xl shadow-emerald-500/20 transform hover:scale-105 transition-all duration-300 border-2 border-emerald-400/60 backdrop-blur-sm">
              <div className="p-5 min-w-[240px]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-full p-3 shadow-lg">
                    <span className="text-xl font-black text-white">{selectedTickets.length}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-emerald-300">Números Escogidos</div>
                    <div className="text-xl font-black text-white">
                      {formatPriceMXN(calculatePrice(selectedTickets.length))}
                    </div>
                    {selectedTickets.length >= 5 && (
                      <div className="text-xs text-yellow-400 font-semibold">
                        🎉 ¡Con descuento!
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Información adicional */}
                <div className="mb-4 p-2 bg-emerald-600/20 rounded-lg border border-emerald-500/30">
                  <div className="text-xs text-emerald-200 text-center">
                    💰 Precio por boleto: {formatPriceMXN(PRECIO_POR_BOLETO_MXN)}
                  </div>
                  {selectedTickets.length >= 5 && (
                    <div className="text-xs text-yellow-300 text-center mt-1">
                      Ahorras: {formatPriceMXN((selectedTickets.length * PRECIO_POR_BOLETO_MXN) - calculatePrice(selectedTickets.length))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onOpenPurchaseModal(selectedTickets.length)}
                  className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-700 hover:via-green-700 hover:to-emerald-800 text-white font-black py-4 px-4 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transform hover:scale-105 border border-emerald-400/50"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" />
                    <span>¡Comprar Ahora!</span>
                    <Zap className="w-5 h-5 animate-pulse" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicador simple para móviles cuando no hay callback */}
      {selectedTickets.length > 0 && !onOpenPurchaseModal && (
        <div className="fixed bottom-4 right-4 md:hidden">
          <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
            {selectedTickets.length}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

TicketGrid.displayName = 'TicketGrid';

export default TicketGrid;