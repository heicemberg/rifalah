'use client';

import React, { useState, useEffect } from 'react';
import { useMasterCounters } from '../../hooks/useMasterCounters';

// ============================================================================
// COMPONENT DE MONITOREO DE SINCRONIZACIÓN EN TIEMPO REAL
// ============================================================================

interface SyncEvent {
  timestamp: Date;
  type: 'websocket' | 'interval' | 'manual' | 'admin';
  source: string;
  data: {
    soldCount?: number;
    availableCount?: number;
    reservedCount?: number;
    fomoCount?: number;
    webSocketStatus?: string;
  };
  success: boolean;
}

export default function SyncMonitor() {
  const [isVisible, setIsVisible] = useState(false);
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [webSocketStatus, setWebSocketStatus] = useState<'unknown' | 'connected' | 'disconnected' | 'error'>('unknown');
  
  const masterCounters = useMasterCounters();

  // Monitor master counter changes
  useEffect(() => {
    const addEvent = (type: SyncEvent['type'], source: string, success = true) => {
      const event: SyncEvent = {
        timestamp: new Date(),
        type,
        source,
        data: {
          soldCount: masterCounters.soldTickets,
          availableCount: masterCounters.availableTickets,
          reservedCount: masterCounters.reservedTickets,
          fomoCount: masterCounters.fomoSoldTickets,
          webSocketStatus: webSocketStatus
        },
        success
      };
      
      setEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
    };

    // Listen for counter updates
    const lastUpdate = masterCounters.lastUpdate;
    if (lastUpdate) {
      addEvent('interval', 'master-counter-update');
    }
  }, [masterCounters.lastUpdate, masterCounters.soldTickets, webSocketStatus]);

  // Monitor global sync events
  useEffect(() => {
    const handleGlobalSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const addEvent = (type: SyncEvent['type'], source: string) => {
        setEvents(prev => [{
          timestamp: new Date(),
          type,
          source: `global-${source}`,
          data: {
            soldCount: customEvent.detail?.soldCount,
            availableCount: undefined,
            reservedCount: undefined,
            fomoCount: undefined
          },
          success: true
        }, ...prev.slice(0, 19)]);
      };
      
      addEvent('admin', customEvent.detail?.source || 'unknown');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('raffle-counters-updated', handleGlobalSync);
      return () => window.removeEventListener('raffle-counters-updated', handleGlobalSync);
    }
  }, []);

  // Monitor WebSocket status through console logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    
    console.log = (...args) => {
      const message = args.join(' ');
      
      if (message.includes('WEBSOCKET CONNECTED')) {
        setWebSocketStatus('connected');
      } else if (message.includes('WEBSOCKET ERROR') || message.includes('CHANNEL_ERROR')) {
        setWebSocketStatus('error');
      } else if (message.includes('WEBSOCKET CLOSED')) {
        setWebSocketStatus('disconnected');
      }
      
      originalConsoleLog(...args);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 shadow-lg"
        >
          🔍 Debug Sync
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white border-2 border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">🔍 Sync Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 font-bold"
        >
          ×
        </button>
      </div>

      {/* Current Status */}
      <div className="p-3 border-b bg-gray-50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">WebSocket:</span>
            <span className={`ml-1 font-medium ${
              webSocketStatus === 'connected' ? 'text-green-600' : 
              webSocketStatus === 'error' ? 'text-red-600' : 
              webSocketStatus === 'disconnected' ? 'text-orange-600' : 'text-gray-600'
            }`}>
              {webSocketStatus === 'connected' && '✅ Connected'}
              {webSocketStatus === 'error' && '❌ Error'}
              {webSocketStatus === 'disconnected' && '⚠️ Disconnected'}
              {webSocketStatus === 'unknown' && '❓ Unknown'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Last:</span>
            <span className="ml-1 font-mono text-gray-800">
              {masterCounters.lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Real Sold:</span>
            <span className="ml-1 font-mono text-green-600">{masterCounters.soldTickets}</span>
          </div>
          <div>
            <span className="text-gray-600">FOMO:</span>
            <span className="ml-1 font-mono text-blue-600">{masterCounters.fomoSoldTickets}</span>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className="max-h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No sync events yet...
          </div>
        ) : (
          events.map((event, index) => (
            <div
              key={index}
              className={`p-2 border-b last:border-b-0 ${
                event.success ? 'bg-white' : 'bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                  <div className="text-sm font-medium">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                      event.type === 'websocket' ? 'bg-blue-500' :
                      event.type === 'admin' ? 'bg-green-500' :
                      event.type === 'manual' ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></span>
                    {event.source}
                  </div>
                  {event.data.soldCount !== undefined && (
                    <div className="text-xs text-gray-600 mt-1">
                      Sold: {event.data.soldCount} | Available: {event.data.availableCount} | FOMO: {event.data.fomoCount}
                    </div>
                  )}
                </div>
                <div className="text-xs">
                  {event.success ? '✅' : '❌'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="p-2 bg-gray-50 border-t flex gap-2">
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('raffle-counters-updated', {
                detail: { source: 'manual-test', timestamp: new Date().toISOString() }
              }));
            }
          }}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
        >
          Test Sync
        </button>
        <button
          onClick={() => setEvents([])}
          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
        >
          Clear
        </button>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && (window as any).raffleCounterTest) {
              (window as any).raffleCounterTest.runFullTest();
            }
          }}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
        >
          Math Test
        </button>
      </div>
    </div>
  );
}