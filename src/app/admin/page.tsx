// ============================================================================
// PANEL DE ADMINISTRACIÓN PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Importar desde archivos anteriores
import { useRaffleStore } from '../../stores/raffle-store';
import { PAYMENT_METHODS, TOTAL_TICKETS } from '../../lib/constants';
import type { PaymentMethod, PaymentMethodType, ThemeColors } from '../../lib/types';
import { formatPrice, formatTicketNumber, cn } from '../../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

type AdminTab = 'dashboard' | 'payment-config' | 'prize-config' | 'theme-config' | 'sales' | 'raffle';

interface LoginState {
  isAuthenticated: boolean;
  password: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const ADMIN_PASSWORD = 'admin2024'; // En producción usar variables de entorno

// ============================================================================
// COMPONENTE LOGIN
// ============================================================================

const AdminLogin: React.FC<{
  onLogin: (password: string) => void;
  loading: boolean;
}> = ({ onLogin, loading }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            🔐 Panel de Administración
          </h1>
          <p className="text-gray-600">Ingresa la contraseña para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ingresa la contraseña"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className={cn(
              'w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200',
              {
                'bg-blue-600 text-white hover:bg-blue-700': !loading && password,
                'bg-gray-400 text-gray-600 cursor-not-allowed': loading || !password
              }
            )}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verificando...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Demo: contraseña es "admin2024"
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE SIDEBAR
// ============================================================================

const AdminSidebar: React.FC<{
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
}> = ({ activeTab, onTabChange, onLogout }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'payment-config', label: 'Métodos de Pago', icon: '💳' },
    { id: 'prize-config', label: 'Configurar Premio', icon: '🏆' },
    { id: 'theme-config', label: 'Personalización', icon: '🎨' },
    { id: 'sales', label: 'Ventas', icon: '📈' },
    { id: 'raffle', label: 'Sorteo', icon: '🎲' }
  ] as const;

  return (
    <div className="bg-white shadow-lg h-full">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        <p className="text-sm text-gray-600">Rifa Silverado Z71</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left',
                  {
                    'bg-blue-100 text-blue-700 font-medium': activeTab === tab.id,
                    'text-gray-700 hover:bg-gray-100': activeTab !== tab.id
                  }
                )}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="text-xl">🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// DASHBOARD TAB
// ============================================================================

const DashboardTab: React.FC = () => {
  const { soldTickets, reservedTickets, availableTickets, soldPercentage, liveActivities } = useRaffleStore();

  const totalRevenue = soldTickets.length * 50;
  const conversionRate = soldTickets.length / TOTAL_TICKETS * 100;
  const recentActivities = liveActivities.slice(0, 5);

  const stats = [
    {
      title: 'Boletos Vendidos',
      value: soldTickets.length.toLocaleString(),
      subtitle: `de ${TOTAL_TICKETS.toLocaleString()}`,
      color: 'bg-green-500',
      icon: '🎫'
    },
    {
      title: 'Ingresos Totales',
      value: formatPrice(totalRevenue),
      subtitle: `${soldPercentage.toFixed(1)}% del objetivo`,
      color: 'bg-blue-500',
      icon: '💰'
    },
    {
      title: 'Tasa de Conversión',
      value: `${conversionRate.toFixed(2)}%`,
      subtitle: 'Boletos vendidos vs total',
      color: 'bg-purple-500',
      icon: '📈'
    },
    {
      title: 'Boletos Reservados',
      value: reservedTickets.length.toLocaleString(),
      subtitle: 'Pendientes de pago',
      color: 'bg-yellow-500',
      icon: '⏳'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen general de la rifa</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center text-white', stat.color)}>
                <span className="text-xl">{stat.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Progreso de Ventas</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progreso</span>
            <span>{soldPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(soldPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{soldTickets.length} vendidos</span>
            <span>{availableTickets.length} disponibles</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Actividad Reciente</h3>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">🎫</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {activity.buyerName} compró {activity.ticketCount} boleto{activity.ticketCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAYMENT CONFIG TAB
// ============================================================================

const PaymentConfigTab: React.FC = () => {
  const { adminConfig, updateAdminConfig } = useRaffleStore();
  const [paymentMethods, setPaymentMethods] = useState(adminConfig.paymentMethods);

  const handleUpdateMethod = useCallback((methodId: PaymentMethodType, field: keyof PaymentMethod, value: string | boolean) => {
    const updatedMethods = paymentMethods.map(method =>
      method.id === methodId ? { ...method, [field]: value } : method
    );
    setPaymentMethods(updatedMethods);
    
    updateAdminConfig({
      paymentMethods: updatedMethods
    });
    
    toast.success('Método de pago actualizado');
  }, [paymentMethods, updateAdminConfig]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Métodos de Pago</h1>
        <p className="text-gray-600">Configura las cuentas para recibir pagos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <img src={method.icon} alt={method.name} className="w-12 h-12" />
              <div>
                <h3 className="text-lg font-bold text-gray-800">{method.name}</h3>
                <p className="text-sm text-gray-600">Configurar cuenta de {method.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Información de Cuenta
                </label>
                <input
                  type="text"
                  value={method.account}
                  onChange={(e) => handleUpdateMethod(method.id, 'account', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    method.id === 'binance' ? 'Email de Binance' :
                    method.id === 'oxxo' ? 'Referencia OXXO' :
                    'Número de cuenta'
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Método habilitado</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    onChange={(e) => handleUpdateMethod(method.id, 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PRIZE CONFIG TAB
// ============================================================================

const PrizeConfigTab: React.FC = () => {
  const { adminConfig, updateAdminConfig } = useRaffleStore();
  const [prizeData, setPrizeData] = useState({
    title: adminConfig.prizeTitle,
    value: adminConfig.prizeValue,
    image: adminConfig.prizeImage
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePrize = useCallback(() => {
    updateAdminConfig({
      prizeTitle: prizeData.title,
      prizeValue: prizeData.value,
      prizeImage: prizeData.image
    });
    toast.success('Configuración del premio actualizada');
  }, [prizeData, updateAdminConfig]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setPrizeData(prev => ({ ...prev, image: imageUrl }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Configurar Premio</h1>
        <p className="text-gray-600">Actualiza la información del premio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Información del Premio</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Premio
              </label>
              <input
                type="text"
                value={prizeData.title}
                onChange={(e) => setPrizeData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Chevrolet Silverado Z71 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor del Premio (MXN)
              </label>
              <input
                type="number"
                value={prizeData.value}
                onChange={(e) => setPrizeData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="890000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del Premio
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-600"
              >
                📸 Seleccionar Imagen
              </button>
            </div>

            <button
              onClick={handleUpdatePrize}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Actualizar Premio
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Vista Previa</h3>
          
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={prizeData.image}
                alt={prizeData.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <h4 className="text-xl font-bold text-gray-800">{prizeData.title}</h4>
              <p className="text-lg font-semibold text-green-600">{formatPrice(prizeData.value)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// THEME CONFIG TAB
// ============================================================================

const ThemeConfigTab: React.FC = () => {
  const { adminConfig, updateAdminConfig } = useRaffleStore();
  const [colors, setColors] = useState<ThemeColors>(adminConfig.colors);

  const handleColorChange = useCallback((colorKey: keyof ThemeColors, value: string) => {
    const newColors = { ...colors, [colorKey]: value };
    setColors(newColors);
    
    // Actualizar CSS custom properties
    document.documentElement.style.setProperty(`--color-${colorKey}`, value);
    
    updateAdminConfig({
      colors: newColors
    });
    
    toast.success('Color actualizado');
  }, [colors, updateAdminConfig]);

  const colorConfig = [
    { key: 'primary' as keyof ThemeColors, label: 'Color Primario', description: 'Botones principales y enlaces' },
    { key: 'secondary' as keyof ThemeColors, label: 'Color Secundario', description: 'Elementos de apoyo' },
    { key: 'accent' as keyof ThemeColors, label: 'Color de Acento', description: 'Destacados y llamadas a la acción' },
    { key: 'success' as keyof ThemeColors, label: 'Color de Éxito', description: 'Mensajes de confirmación' },
    { key: 'error' as keyof ThemeColors, label: 'Color de Error', description: 'Mensajes de error' },
    { key: 'warning' as keyof ThemeColors, label: 'Color de Advertencia', description: 'Mensajes de alerta' }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Personalización</h1>
        <p className="text-gray-600">Customiza los colores del tema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colorConfig.map((config) => (
          <div key={config.key} className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{config.label}</h3>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={colors[config.key]}
                  onChange={(e) => handleColorChange(config.key, e.target.value)}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <div>
                  <input
                    type="text"
                    value={colors[config.key]}
                    onChange={(e) => handleColorChange(config.key, e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
              </div>
              
              {/* Preview */}
              <div
                className="w-full h-12 rounded-lg border-2 border-gray-200"
                style={{ backgroundColor: colors[config.key] }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Vista Previa</h3>
        <div className="space-y-4">
          <button
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Botón Primario
          </button>
          <button
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: colors.secondary }}
          >
            Botón Secundario
          </button>
          <div
            className="p-4 rounded-lg text-white"
            style={{ backgroundColor: colors.success }}
          >
            Mensaje de éxito
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SALES TAB
// ============================================================================

const SalesTab: React.FC = () => {
  const { soldTickets } = useRaffleStore();

  const exportCSV = useCallback(() => {
    const csvData = [
      ['Ticket', 'Cliente', 'Email', 'Fecha', 'Monto'],
      ...soldTickets.map(ticket => [
        formatTicketNumber(ticket),
        'Cliente Demo',
        'cliente@ejemplo.com',
        new Date().toLocaleDateString('es-MX'),
        '$50 MXN'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ventas-rifa-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV exportado exitosamente');
  }, [soldTickets]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Ventas</h1>
          <p className="text-gray-600">Lista de boletos vendidos</p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          📊 Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {soldTickets.slice(0, 50).map((ticket, index) => (
                <tr key={ticket} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatTicketNumber(ticket)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Cliente Demo
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    cliente@ejemplo.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date().toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    $50 MXN
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {soldTickets.length > 50 && (
          <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-500">
            Mostrando 50 de {soldTickets.length} boletos vendidos
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// RAFFLE TAB
// ============================================================================

const RaffleTab: React.FC = () => {
  const { soldTickets } = useRaffleStore();
  const [winner, setWinner] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const drawWinner = useCallback(async () => {
    if (soldTickets.length === 0) {
      toast.error('No hay boletos vendidos para sortear');
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    // Simular sorteo con animación
    for (let i = 0; i < 10; i++) {
      const randomTicket = soldTickets[Math.floor(Math.random() * soldTickets.length)];
      setWinner(randomTicket);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Ganador final
    const finalWinner = soldTickets[Math.floor(Math.random() * soldTickets.length)];
    setWinner(finalWinner);
    setIsDrawing(false);
    
    toast.success(`¡Ganador: Ticket ${formatTicketNumber(finalWinner)}!`);
  }, [soldTickets]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sorteo</h1>
        <p className="text-gray-600">Realizar el sorteo del ganador</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel de Sorteo */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-6">🎲 Sorteo Aleatorio</h3>
          
          <div className="mb-8">
            <div className="text-6xl mb-4">
              {isDrawing ? '🎰' : winner ? '🏆' : '🎫'}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Boletos participantes:</p>
              <p className="text-3xl font-bold text-blue-600">{soldTickets.length}</p>
            </div>
          </div>

          {winner && (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-lg font-bold text-green-800 mb-2">🎉 ¡Ganador!</h4>
              <p className="text-2xl font-bold text-green-700">
                Ticket {formatTicketNumber(winner)}
              </p>
            </div>
          )}

          <button
            onClick={drawWinner}
            disabled={isDrawing || soldTickets.length === 0}
            className={cn(
              'w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200',
              {
                'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105': !isDrawing && soldTickets.length > 0,
                'bg-gray-400 text-gray-600 cursor-not-allowed': isDrawing || soldTickets.length === 0
              }
            )}
          >
            {isDrawing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Sorteando...
              </div>
            ) : (
              '🎲 Realizar Sorteo'
            )}
          </button>

          {soldTickets.length === 0 && (
            <p className="text-red-600 text-sm mt-4">
              No hay boletos vendidos para realizar el sorteo
            </p>
          )}
        </div>

        {/* Información del Sorteo */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">ℹ️ Información del Sorteo</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Estadísticas:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Total Boletos</p>
                  <p className="text-lg font-bold text-gray-800">{TOTAL_TICKETS.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Vendidos</p>
                  <p className="text-lg font-bold text-green-600">{soldTickets.length.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Probabilidad</p>
                  <p className="text-lg font-bold text-blue-600">
                    1 en {soldTickets.length || 1}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-gray-600">Ingresos</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatPrice(soldTickets.length * 50)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Proceso del Sorteo:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• El sorteo es completamente aleatorio</li>
                <li>• Solo participan boletos vendidos</li>
                <li>• El resultado es inmediato e irrevocable</li>
                <li>• Se notifica automáticamente al ganador</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-800 mb-1">⚠️ Importante:</h5>
              <p className="text-sm text-yellow-700">
                Una vez realizado el sorteo, el resultado no se puede cambiar. 
                Asegúrate de que todos los pagos estén verificados antes de proceder.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminPage() {
  // Estado de autenticación
  const [loginState, setLoginState] = useState<LoginState>({
    isAuthenticated: false,
    password: ''
  });
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loginLoading, setLoginLoading] = useState(false);

  // Verificar autenticación en localStorage
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin-auth');
    if (savedAuth === 'true') {
      setLoginState(prev => ({ ...prev, isAuthenticated: true }));
    }
  }, []);

  // Handler de login
  const handleLogin = useCallback(async (password: string) => {
    setLoginLoading(true);
    
    // Simular verificación del servidor
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (password === ADMIN_PASSWORD) {
      setLoginState({
        isAuthenticated: true,
        password: ''
      });
      localStorage.setItem('admin-auth', 'true');
      toast.success('¡Bienvenido al panel de administración!');
    } else {
      toast.error('Contraseña incorrecta');
    }
    
    setLoginLoading(false);
  }, []);

  // Handler de logout
  const handleLogout = useCallback(() => {
    setLoginState({
      isAuthenticated: false,
      password: ''
    });
    localStorage.removeItem('admin-auth');
    toast.success('Sesión cerrada correctamente');
  }, []);

  // Renderizar componente de login si no está autenticado
  if (!loginState.isAuthenticated) {
    return (
      <AdminLogin
        onLogin={handleLogin}
        loading={loginLoading}
      />
    );
  }

  // Renderizar panel de administración
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg relative">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'payment-config' && <PaymentConfigTab />}
          {activeTab === 'prize-config' && <PrizeConfigTab />}
          {activeTab === 'theme-config' && <ThemeConfigTab />}
          {activeTab === 'sales' && <SalesTab />}
          {activeTab === 'raffle' && <RaffleTab />}
        </div>
      </div>
    </div>
  );
}