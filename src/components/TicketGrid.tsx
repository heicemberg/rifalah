// ============================================================================
// GRID VIRTUALIZADO DE TICKETS PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { formatTicketNumber, cn } from '../lib/utils';
import { TOTAL_TICKETS } from '../lib/constants';

// ============================================================================
// TIPOS Y CONSTANTES
// ============================================================================

interface TicketCellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    columnsPerRow: number;
    selectedTickets: number[];
    soldTickets: number[];
    reservedTickets: number[];
    onTicketClick: (ticketNumber: number) => void;
  };
}

// Tamaño de cada celda
const CELL_SIZE = 60;
const CELL_GAP = 2;
const ACTUAL_CELL_SIZE = CELL_SIZE + CELL_GAP;

// Configuración responsive
const DESKTOP_COLUMNS = 20;
const MOBILE_COLUMNS = 4;
const TABLET_COLUMNS = 8;

// ============================================================================
// COMPONENTE DE CELDA INDIVIDUAL
// ============================================================================

const TicketCell: React.FC<TicketCellProps> = React.memo(({ 
  columnIndex, 
  rowIndex, 
  style,
  data 
}) => {
  const { columnsPerRow, selectedTickets, soldTickets, reservedTickets, onTicketClick } = data;
  
  // Calcular número de ticket (base 1)
  const ticketNumber = rowIndex * columnsPerRow + columnIndex + 1;
  
  // Si el número excede el total de tickets, no renderizar
  if (ticketNumber > TOTAL_TICKETS) {
    return <div style={style} />;
  }
  
  // Determinar estado del ticket
  const isSelected = selectedTickets.includes(ticketNumber);
  const isSold = soldTickets.includes(ticketNumber);
  const isReserved = reservedTickets.includes(ticketNumber);
  const isAvailable = !isSold && !isReserved;
  
  // Estilos condicionales
  const ticketClasses = cn(
    'flex items-center justify-center text-xs font-bold cursor-pointer',
    'border-2 rounded-lg transition-all duration-200 select-none',
    'hover:scale-105 active:scale-95',
    {
      // Disponible - Verde
      'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:border-green-400': 
        isAvailable && !isSelected,
      
      // Seleccionado - Púrpura
      'bg-purple-500 border-purple-600 text-white hover:bg-purple-600 shadow-lg': 
        isSelected,
      
      // Vendido - Rojo
      'bg-red-100 border-red-300 text-red-800 cursor-not-allowed opacity-75': 
        isSold,
      
      // Reservado - Amarillo
      'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed opacity-75': 
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
      style={{
        ...style,
        left: (style.left as number) + CELL_GAP / 2,
        top: (style.top as number) + CELL_GAP / 2,
        width: (style.width as number) - CELL_GAP,
        height: (style.height as number) - CELL_GAP,
      }}
      className={ticketClasses}
      onClick={handleClick}
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
// HOOK PARA CONFIGURACIÓN RESPONSIVE
// ============================================================================

const useResponsiveColumns = () => {
  const [columnsPerRow, setColumnsPerRow] = useState(DESKTOP_COLUMNS);
  
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) { // Mobile
        setColumnsPerRow(MOBILE_COLUMNS);
      } else if (width < 1024) { // Tablet
        setColumnsPerRow(TABLET_COLUMNS);
      } else { // Desktop
        setColumnsPerRow(DESKTOP_COLUMNS);
      }
    };
    
    // Configurar al montar
    updateColumns();
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', updateColumns);
    
    return () => window.removeEventListener('resize', updateColumns);
  }, []);
  
  return columnsPerRow;
};

// ============================================================================
// HOOK PARA DIMENSIONES DEL GRID
// ============================================================================

const useGridDimensions = (columnsPerRow: number) => {
  const [dimensions, setDimensions] = useState({
    width: DESKTOP_COLUMNS * ACTUAL_CELL_SIZE,
    height: 600
  });
  
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.getElementById('ticket-grid-container');
      if (container) {
        const containerWidth = container.clientWidth;
        const maxWidth = columnsPerRow * ACTUAL_CELL_SIZE;
        const width = Math.min(containerWidth, maxWidth);
        
        // Calcular altura basada en el viewport disponible
        const viewportHeight = window.innerHeight;
        const maxHeight = Math.min(viewportHeight * 0.6, 600);
        
        setDimensions({ width, height: maxHeight });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [columnsPerRow]);
  
  return dimensions;
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const TicketGrid: React.FC = () => {
  // Estado del store
  const {
    selectedTickets,
    soldTickets,
    reservedTickets,
    selectTicket,
    deselectTicket
  } = useRaffleStore();
  
  // Configuración responsive
  const columnsPerRow = useResponsiveColumns();
  const { width, height } = useGridDimensions(columnsPerRow);
  
  // Calcular número de filas necesarias
  const rowCount = Math.ceil(TOTAL_TICKETS / columnsPerRow);
  
  // Handler para clicks en tickets
  const handleTicketClick = useCallback((ticketNumber: number) => {
    if (selectedTickets.includes(ticketNumber)) {
      deselectTicket(ticketNumber);
    } else {
      selectTicket(ticketNumber);
    }
  }, [selectedTickets, selectTicket, deselectTicket]);
  
  // Datos para pasar a las celdas
  const itemData = useMemo(() => ({
    columnsPerRow,
    selectedTickets,
    soldTickets,
    reservedTickets,
    onTicketClick: handleTicketClick
  }), [columnsPerRow, selectedTickets, soldTickets, reservedTickets, handleTicketClick]);
  
  return (
    <div className="w-full">
      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span className="text-sm text-gray-700">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 border-2 border-purple-600 rounded"></div>
          <span className="text-sm text-gray-700">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
          <span className="text-sm text-gray-700">Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
          <span className="text-sm text-gray-700">Vendido</span>
        </div>
      </div>
      
      {/* Información del grid */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        <span>Total: {TOTAL_TICKETS.toLocaleString()} tickets</span>
        <span>Seleccionados: {selectedTickets.length}</span>
        <span>Vendidos: {soldTickets.length}</span>
        <span>Disponibles: {TOTAL_TICKETS - soldTickets.length - reservedTickets.length}</span>
      </div>
      
      {/* Container del grid */}
      <div 
        id="ticket-grid-container"
        className="w-full flex justify-center"
      >
        <div 
          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
          style={{ 
            width: Math.min(width, columnsPerRow * ACTUAL_CELL_SIZE),
            height 
          }}
        >
          <Grid
            columnCount={columnsPerRow}
            columnWidth={ACTUAL_CELL_SIZE}
            height={height}
            rowCount={rowCount}
            rowHeight={ACTUAL_CELL_SIZE}
            width={Math.min(width, columnsPerRow * ACTUAL_CELL_SIZE)}
            itemData={itemData}
            overscanColumnCount={5}
            overscanRowCount={5}
          >
            {TicketCell}
          </Grid>
        </div>
      </div>
      
      {/* Controles móviles */}
      <div className="mt-4 md:hidden">
        <div className="text-xs text-gray-500 text-center">
          Toca un ticket para seleccionarlo • Desplázate para ver más
        </div>
      </div>
      
      {/* Información de performance (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <div>Grid: {columnsPerRow} columnas × {rowCount} filas</div>
          <div>Dimensiones: {width}px × {height}px</div>
          <div>Celdas renderizadas: ~{Math.ceil(height / ACTUAL_CELL_SIZE) * columnsPerRow}</div>
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