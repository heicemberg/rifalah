'use client';

// ============================================================================
// CONTEXTO DE ADMINISTRADOR
// Maneja el estado de autenticación de admin globalmente
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  // Detectar si estamos en la página de admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isOnAdminPage = window.location.pathname.includes('/admin');
      setIsAdmin(isOnAdminPage);
      
      // Escuchar cambios de navegación
      const handleLocationChange = () => {
        const newIsOnAdminPage = window.location.pathname.includes('/admin');
        setIsAdmin(newIsOnAdminPage);
      };
      
      // Listener para cambios de historial
      window.addEventListener('popstate', handleLocationChange);
      
      return () => {
        window.removeEventListener('popstate', handleLocationChange);
      };
    }
  }, []);

  const login = () => {
    setIsAdmin(true);
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    // Si no hay contexto, asumir que no es admin
    return { isAdmin: false, login: () => {}, logout: () => {} };
  }
  return context;
}