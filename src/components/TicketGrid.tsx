// ============================================================================
// GRID VIRTUALIZADO DE TICKETS PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { formatTicketNumber, cn } from '../lib/utils';
import { TOTAL_TICKETS } from '../lib/constants';

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
// COMPONENTE DE CELDA INDIVIDUAL
// ============================================================================

const TicketCell: React.FC<TicketCellProps> = React.memo(({
  ticketNumber,
  isSelected,
  isSold,
  isReserved,
  onTicketClick,
  cellSize
}) => {
  const isAvailable = !isSold && !isReserved;
  
  // Ajustar tamaño de fuente según el tamaño de celda
  const fontSize = cellSize <= CELL_SIZE_MOBILE ? 'text-sm' : 
                   cellSize <= CELL_SIZE_TABLET ? 'text-base' : 'text-lg';
  
  const cellClasses = cn(
    'flex items-center justify-center font-bold cursor-pointer',
    'border-2 rounded-lg transition-all duration-200 select-none',
    'hover:scale-105 active:scale-95 shadow-sm hover:shadow-md',
    fontSize,
    {
      // Disponible - Blanco con borde verde intenso
      'bg-white border-green-500 text-gray-900 hover:border-green-600 hover:bg-green-100 hover:text-green-900 shadow-md': 
        isAvailable && !isSelected,
      
      // Seleccionado - Verde muy intenso
      'bg-gradient-to-br from-green-600 to-green-700 border-green-800 text-white hover:from-green-700 hover:to-green-800 shadow-xl ring-2 ring-green-400 ring-opacity-50': 
        isSelected,
      
      // Vendido - Rojo intenso
      'bg-gradient-to-br from-red-600 to-red-700 border-red-800 text-white cursor-not-allowed shadow-lg': 
        isSold,
      
      // Reservado - Amarillo intenso
      'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600 text-yellow-900 cursor-not-allowed shadow-lg': 
        isReserved,
    }
  );
  
  const handleClick = useCallback(() => {
    if (isAvailable) {
      onTicketClick(ticketNumber);
    }
  }, [isAvailable, ticketNumber, onTicketClick]);
  
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
      {formatTicketNumber(ticketNumber)}
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
  rowHeight
}) => {
  const tickets = [];
  
  for (let i = 0; i < columnsPerRow; i++) {
    const ticketNumber = startTicket + i;
    
    if (ticketNumber <= TOTAL_TICKETS) {
      tickets.push(
        <TicketCell
          key={ticketNumber}
          ticketNumber={ticketNumber}
          isSelected={selectedTickets.includes(ticketNumber)}
          isSold={soldTickets.includes(ticketNumber)}
          isReserved={reservedTickets.includes(ticketNumber)}
          onTicketClick={onTicketClick}
          cellSize={cellSize}
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
  
  // Refs y estado local
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(800);
  
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
  
  // Generar números vendidos aleatoriamente para demo
  const randomSoldTickets = useMemo(() => {
    const sold = [];
    const totalSold = Math.floor(Math.random() * 1500) + 800; // Entre 800-2300 vendidos
    const usedNumbers = new Set();
    
    while (sold.length < totalSold) {
      const randomTicket = Math.floor(Math.random() * TOTAL_TICKETS) + 1;
      if (!usedNumbers.has(randomTicket)) {
        sold.push(randomTicket);
        usedNumbers.add(randomTicket);
      }
    }
    
    return sold.sort((a, b) => a - b);
  }, []); // Solo generar una vez al montar
  
  // Combinar tickets vendidos del store con los aleatorios
  const allSoldTickets = useMemo(() => {
    return [...new Set([...soldTickets, ...randomSoldTickets])];
  }, [soldTickets, randomSoldTickets]);
  
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
    rowHeight
  ]);
  
  return (
    <div className="w-full">
      {/* Leyenda */}
      <div className="flex flex-wrap justify-center gap-4 mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border-2 border-green-500 rounded shadow-md"></div>
          <span className="text-sm text-slate-300">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 border-2 border-green-800 rounded shadow-md"></div>
          <span className="text-sm text-slate-300">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 border-2 border-yellow-600 rounded shadow-md"></div>
          <span className="text-sm text-slate-300">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 border-2 border-red-800 rounded shadow-md"></div>
          <span className="text-sm text-slate-300">Vendido</span>
        </div>
      </div>
      
      {/* Información del grid */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-400 bg-slate-800/30 p-3 rounded-lg">
        <span>Total: <span className="text-slate-200 font-semibold">{TOTAL_TICKETS.toLocaleString()}</span></span>
        <span>Seleccionados: <span className="text-emerald-400 font-semibold">{selectedTickets.length}</span></span>
        <span>Vendidos: <span className="text-slate-400 font-semibold">{allSoldTickets.length}</span></span>
        <span>Disponibles: <span className="text-emerald-400 font-semibold">{TOTAL_TICKETS - allSoldTickets.length - reservedTickets.length}</span></span>
      </div>
      
      {/* Container virtualizado - CENTRADO Y SIN SCROLL HORIZONTAL */}
      <div className="w-full flex justify-center px-4">
        <div 
          ref={containerRef}
          className="border-2 border-gray-300 rounded-xl shadow-xl bg-white mx-auto"
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
          💡 Toca los números para seleccionar tus boletos
        </div>
        <div className="text-xs text-gray-500">
          Deslízate para explorar todos los números disponibles
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
      {(TOTAL_TICKETS - allSoldTickets.length - reservedTickets.length) === 0 && (
        <div className="mt-6 p-6 bg-red-50 rounded-lg border border-red-200 text-center">
          <div className="text-red-600 text-lg font-bold mb-2">
            ¡Todos los boletos están vendidos!
          </div>
          <div className="text-red-700 text-sm">
            Gracias por tu interés. Mantente atento para futuras rifas.
          </div>
        </div>
      )}
      
      {/* Botón flotante de compra */}
      {selectedTickets.length > 0 && onOpenPurchaseModal && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative">
            {/* Pulso animado */}
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl opacity-40 animate-ping"></div>
            
            <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-emerald-500/50">
              <div className="p-4 min-w-[200px]">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="bg-emerald-500 rounded-full p-2">
                    <span className="text-xl font-bold text-white">{selectedTickets.length}</span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-slate-300">Boletos seleccionados</div>
                    <div className="text-lg font-bold text-emerald-400">${(selectedTickets.length * 10).toLocaleString()} USD</div>
                  </div>
                </div>
                <button
                  onClick={() => onOpenPurchaseModal(selectedTickets.length)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-colors shadow-md transform hover:scale-105"
                >
                  🛒 Comprar Ahora
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