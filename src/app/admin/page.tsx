'use client';

import React, { useState } from 'react';
import AdminPanel from '../../components/AdminPanel';

// ============================================================================
// PÁGINA DE ADMINISTRACIÓN PARA RIFA SILVERADO Z71 2024
// ============================================================================

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  
  // Clave de administrador simple (en producción usar autenticación real)
  const ADMIN_KEY = 'rifa2024admin';
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === ADMIN_KEY) {
      setIsAuthenticated(true);
    } else {
      alert('Clave incorrecta');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">🔐 Acceso Administrativo</h1>
            <p className="text-sm text-gray-600 mt-2">Panel de control para la Rifa Silverado Z71</p>
            <p className="text-xs text-gray-500 mt-1">Usando localStorage (datos locales)</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave de administrador:
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa la clave..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </button>
          </form>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 Clave demo: <code className="font-mono">rifa2024admin</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Botón de cerrar sesión flotante */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
        >
          🔓 Cerrar Sesión
        </button>
      </div>
      
      {/* Panel principal */}
      <AdminPanel />
    </div>
  );
}