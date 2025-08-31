'use client';

import React, { useState, useEffect } from 'react';
import { obtenerCompras, actualizarEstadoCompra, type CompraConDetalles, type PurchaseStatus } from '../lib/supabase';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { useAdminCounters } from '../hooks/useSmartCounters';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS LOCALES
// ============================================================================

// Los tipos ya están importados de supabase.ts

// ============================================================================
// COMPONENTE PRINCIPAL DEL PANEL DE ADMINISTRACIÓN
// ============================================================================

export default function AdminPanel() {
  const [compras, setCompras] = useState<CompraConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | PurchaseStatus>('todas');
  const [busqueda, setBusqueda] = useState('');
  
  // Hook de sincronización con Supabase
  const { isConnected, visualPercentage, refreshData } = useSupabaseSync();
  
  // Hook para contadores inteligentes (administrador)
  const adminCounters = useAdminCounters();

  // Cargar compras al montar el componente
  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      
      if (isConnected) {
        // Cargar desde Supabase
        const comprasSupabase = await obtenerCompras();
        setCompras(comprasSupabase || []);
        toast.success(`${comprasSupabase?.length || 0} compras cargadas desde Supabase • ${visualPercentage}% mostrado`);
        
        // Sincronizar datos de tickets también
        await refreshData();
      } else {
        // Fallback a localStorage si Supabase no está disponible
        console.warn('Supabase no disponible, usando localStorage como fallback');
        const datosLocalStorage = JSON.parse(localStorage.getItem('compras-registradas') || '[]');
        
        // Convertir formato si es necesario (fallback para localStorage)
        const comprasFormateadas: CompraConDetalles[] = datosLocalStorage.map((compra: any) => ({
          id: compra.id || Date.now().toString(),
          customer_id: 'local',
          total_amount: compra.precio_total || 0,
          unit_price: compra.precio_unitario || 10,
          discount_applied: compra.descuento_aplicado || 0,
          payment_method: compra.metodo_pago || '',
          payment_reference: compra.referencia_pago || '',
          payment_proof_url: compra.captura_comprobante_url || '',
          status: compra.estado_compra || 'pending',
          created_at: compra.fecha_compra || new Date().toISOString(),
          customer: {
            id: 'local',
            name: `${compra.nombre || ''} ${compra.apellidos || ''}`.trim(),
            email: compra.email || '',
            phone: compra.telefono || '',
            city: compra.ciudad || '',
            state: compra.estado || ''
          },
          tickets: compra.numeros_boletos?.map((num: number) => ({
            id: `ticket-${num}`,
            number: num,
            status: 'vendido' as const,
            customer_id: 'local'
          })) || []
        }));
        
        setCompras(comprasFormateadas);
        toast(`${comprasFormateadas.length} compras cargadas desde localStorage (Supabase no disponible)`, { 
          icon: '⚠️',
          style: { background: '#fbbf24', color: '#92400e' }
        });
      }
    } catch (error) {
      console.error('Error al cargar compras:', error);
      toast.error('Error al cargar las compras');
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id: string, nuevoEstado: PurchaseStatus) => {
    try {
      if (isConnected) {
        // Actualizar en Supabase
        await actualizarEstadoCompra(id, nuevoEstado);
        toast.success(`Estado actualizado a: ${nuevoEstado}`);
        
        // Si se confirma una compra, actualizar contadores inteligentes
        if (nuevoEstado === 'completed') {
          // Los contadores se actualizarán automáticamente via WebSocket
          toast.success(`🎯 Compra confirmada - Real: ${adminCounters.real.soldCount}, Mostrado: ${adminCounters.display.soldPercentage.toFixed(1)}%`);
        }
        
        // Refrescar datos de tickets para mantener sincronización
        await refreshData();
      } else {
        // Fallback a localStorage
        const comprasActuales = JSON.parse(localStorage.getItem('compras-registradas') || '[]');
        const comprasActualizadas = comprasActuales.map((compra: any) => 
          compra.id === id ? { ...compra, estado_compra: nuevoEstado } : compra
        );
        
        localStorage.setItem('compras-registradas', JSON.stringify(comprasActualizadas));
        toast(`Estado actualizado localmente a: ${nuevoEstado} (Supabase no disponible)`, {
          icon: '⚠️',
          style: { background: '#fbbf24', color: '#92400e' }
        });
      }
      
      cargarCompras(); // Recargar datos
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const agregarDatosPrueba = () => {
    const datosPrueba = [
      {
        id: '1',
        nombre: 'Juan Carlos',
        apellidos: 'Pérez García',
        telefono: '+52 55 1234 5678',
        email: 'juan.perez@email.com',
        estado: 'CDMX',
        ciudad: 'Ciudad de México',
        info_adicional: 'Compra desde la página principal',
        cantidad_boletos: 5,
        numeros_boletos: [1234, 2567, 3890, 4123, 5678],
        numeros_boletos_formateados: '1234, 2567, 3890, 4123, 5678',
        precio_unitario: 200,
        precio_total: 900,
        descuento_aplicado: 10,
        metodo_pago: 'Binance Pay',
        archivo_subido: true,
        nombre_archivo: 'comprobante_juan.jpg',
        fecha_compra: new Date(Date.now() - 86400000).toISOString(), // Ayer
        estado_compra: 'completed' as const,
        timestamp: Date.now() - 86400000
      },
      {
        id: '2',
        nombre: 'María Fernanda',
        apellidos: 'López Rodríguez',
        telefono: '+52 33 9876 5432',
        email: 'maria.lopez@email.com',
        estado: 'Jalisco',
        ciudad: 'Guadalajara',
        info_adicional: '',
        cantidad_boletos: 10,
        numeros_boletos: [123, 456, 789, 1012, 1345, 1678, 1901, 2234, 2567, 2890],
        numeros_boletos_formateados: '0123, 0456, 0789, 1012, 1345, 1678, 1901, 2234, 2567, 2890',
        precio_unitario: 200,
        precio_total: 1600,
        descuento_aplicado: 20,
        metodo_pago: 'OXXO',
        archivo_subido: false,
        nombre_archivo: '',
        fecha_compra: new Date(Date.now() - 43200000).toISOString(), // Hace 12 horas
        estado_compra: 'pending' as const,
        timestamp: Date.now() - 43200000
      },
      {
        id: '3',
        nombre: 'Carlos Eduardo',
        apellidos: 'Martínez Sánchez',
        telefono: '+52 81 5555 1234',
        email: 'carlos.martinez@email.com',
        estado: 'Nuevo León',
        ciudad: 'Monterrey',
        info_adicional: 'Cliente frecuente',
        cantidad_boletos: 25,
        numeros_boletos: [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012, 3013, 3014, 3015, 3016, 3017, 3018, 3019, 3020, 3021, 3022, 3023, 3024, 3025],
        numeros_boletos_formateados: '3001-3025 (25 boletos consecutivos)',
        precio_unitario: 200,
        precio_total: 3750,
        descuento_aplicado: 25,
        metodo_pago: 'Banco Azteca',
        archivo_subido: true,
        nombre_archivo: 'transferencia_carlos.png',
        fecha_compra: new Date().toISOString(),
        estado_compra: 'pending' as const,
        timestamp: Date.now()
      }
    ];

    localStorage.setItem('compras-registradas', JSON.stringify(datosPrueba));
    toast.success('Datos de prueba agregados exitosamente');
    cargarCompras();
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  // Filtrar compras
  const comprasFiltradas = compras.filter(compra => {
    const coincideFiltro = filtro === 'todas' || compra.status === filtro;
    const coincideBusqueda = busqueda === '' || 
      compra.customer.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      compra.customer.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      compra.customer.phone.includes(busqueda);
    
    return coincideFiltro && coincideBusqueda;
  });

  // Calcular estadísticas
  const stats = {
    total: compras.length,
    pendientes: compras.filter(c => c.status === 'pending').length,
    confirmadas: compras.filter(c => c.status === 'completed').length,
    canceladas: compras.filter(c => c.status === 'cancelled').length,
    ingresosTotales: compras.reduce((sum, c) => sum + c.total_amount, 0),
    boletosVendidos: compras.reduce((sum, c) => sum + c.tickets.length, 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Panel de Administración - Rifa Silverado Z71
              </h1>
              <p className="text-gray-600">
                Gestiona todas las compras de boletos de la rifa
              </p>
              <div className={`text-sm mt-2 px-3 py-1 rounded-full inline-flex items-center gap-2 ${
                isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                {isConnected 
                  ? `✅ Conectado a Supabase • ${visualPercentage}% mostrado` 
                  : '⚠️ Modo offline • Usando localStorage'
                }
              </div>
            </div>
            {compras.length === 0 && (
              <button
                onClick={agregarDatosPrueba}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                📝 Agregar Datos de Prueba
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Compras</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{stats.confirmadas}</div>
            <div className="text-sm text-gray-600">Confirmadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600">{stats.canceladas}</div>
            <div className="text-sm text-gray-600">Canceladas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.boletosVendidos}</div>
            <div className="text-sm text-gray-600">Boletos Vendidos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">{formatearPrecio(stats.ingresosTotales)}</div>
            <div className="text-sm text-gray-600">Ingresos</div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filtros */}
            <div className="flex gap-2">
              {(['todas', 'pending', 'completed', 'cancelled'] as const).map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltro(estado)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filtro === estado
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Búsqueda */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Botón actualizar */}
            <button
              onClick={cargarCompras}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>

        {/* Tabla de compras */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Compra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boletos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comprasFiltradas.map((compra) => (
                  <tr key={compra.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {compra.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {compra.customer.city}, {compra.customer.state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{compra.customer.email}</div>
                      <div className="text-sm text-gray-500">{compra.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {compra.tickets.length} boleto{compra.tickets.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {formatearPrecio(compra.total_amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatearPrecio(compra.unit_price)}/boleto
                      </div>
                      {compra.discount_applied && compra.discount_applied > 0 && (
                        <div className="text-xs text-orange-600 font-medium">
                          🏷️ -{compra.discount_applied}% descuento
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {compra.tickets && compra.tickets.length > 0 ? (
                        <div>
                          <div className="text-sm text-gray-900 font-mono max-w-xs">
                            {compra.tickets.length <= 5 
                              ? compra.tickets.map(t => String(t.number).padStart(4, '0')).join(', ')
                              : `${compra.tickets.slice(0, 3).map(t => String(t.number).padStart(4, '0')).join(', ')}... (+${compra.tickets.length - 3} más)`
                            }
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            ✅ {compra.tickets.length} números asignados
                          </div>
                        </div>
                      ) : compra.status === 'completed' ? (
                        <div className="text-sm text-red-600">
                          ❌ Error: Confirmada sin números
                        </div>
                      ) : (
                        <div className="text-sm text-orange-600">
                          ⏳ Pendiente de asignación
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{compra.payment_method}</div>
                      {compra.payment_reference && (
                        <div className="text-xs text-gray-500">{compra.payment_reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        compra.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : compra.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {compra.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(compra.created_at || '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {compra.status === 'pending' && (
                        <button
                          onClick={() => cambiarEstado(compra.id!, 'completed')}
                          className="text-green-600 hover:text-green-900 font-medium"
                          title={`Confirmar compra y asignar ${compra.tickets.length === 0 ? Math.round(compra.total_amount / 200) : compra.tickets.length} números disponibles`}
                        >
                          ✅ Confirmar & Asignar
                        </button>
                      )}
                      {compra.status === 'completed' && compra.tickets.length === 0 && (
                        <button
                          onClick={() => cambiarEstado(compra.id!, 'completed')}
                          className="text-orange-600 hover:text-orange-900 font-medium"
                          title="Reintentar asignación de números"
                        >
                          🔄 Reasignar Números
                        </button>
                      )}
                      {compra.status !== 'cancelled' && (
                        <button
                          onClick={() => cambiarEstado(compra.id!, 'cancelled')}
                          className="text-red-600 hover:text-red-900"
                          title={compra.tickets.length > 0 ? `Cancelar y liberar ${compra.tickets.length} números` : 'Cancelar compra'}
                        >
                          ❌ Cancelar
                        </button>
                      )}
                      {compra.payment_proof_url && (
                        <button
                          onClick={() => {
                            window.open(compra.payment_proof_url!, '_blank');
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          📷 Ver Captura
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {comprasFiltradas.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron compras con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}