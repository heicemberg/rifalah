// ============================================================================
// UTILIDADES PARA TOAST CONDICIONAL
// Permite mostrar mensajes solo a administradores o a todos los usuarios
// ============================================================================

import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  icon?: string;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

// Función para toast administrativo (solo visible para administradores)
export const adminToast = {
  success: (message: string, options?: ToastOptions) => {
    // Solo mostrar si estamos en ruta de admin
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
      toast.success(`[ADMIN] ${message}`, {
        duration: options?.duration || 4000,
        icon: options?.icon || '🔧',
        position: options?.position || 'top-right',
      });
    }
  },

  error: (message: string, options?: ToastOptions) => {
    // Solo mostrar si estamos en ruta de admin
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
      toast.error(`[ADMIN] ${message}`, {
        duration: options?.duration || 5000,
        icon: options?.icon || '❌',
        position: options?.position || 'top-right',
      });
    }
  },

  loading: (message: string, options?: ToastOptions) => {
    // Solo mostrar si estamos en ruta de admin
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
      return toast.loading(`[ADMIN] ${message}`, {
        duration: options?.duration,
        icon: options?.icon || '⏳',
        position: options?.position || 'top-right',
      });
    }
    return null;
  },

  info: (message: string, options?: ToastOptions) => {
    // Solo mostrar si estamos en ruta de admin
    if (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) {
      toast(`[ADMIN] ${message}`, {
        duration: options?.duration || 4000,
        icon: options?.icon || 'ℹ️',
        position: options?.position || 'top-right',
      });
    }
  }
};

// Función para toast público (visible para todos los usuarios)
export const publicToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: options?.duration || 3000,
      icon: options?.icon || '✅',
      position: options?.position || 'top-center',
    });
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: options?.duration || 4000,
      icon: options?.icon || '❌',
      position: options?.position || 'top-center',
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      duration: options?.duration,
      icon: options?.icon || '⏳',
      position: options?.position || 'top-center',
    });
  },

  info: (message: string, options?: ToastOptions) => {
    toast(message, {
      duration: options?.duration || 3000,
      icon: options?.icon || 'ℹ️',
      position: options?.position || 'top-center',
    });
  }
};

// Función que decide automáticamente si mostrar mensaje técnico o no
export const conditionalToast = {
  success: (message: string, isAdminMessage: boolean = false, options?: ToastOptions) => {
    if (isAdminMessage) {
      adminToast.success(message, options);
    } else {
      publicToast.success(message, options);
    }
  },

  error: (message: string, isAdminMessage: boolean = false, options?: ToastOptions) => {
    if (isAdminMessage) {
      adminToast.error(message, options);
    } else {
      publicToast.error(message, options);
    }
  },

  loading: (message: string, isAdminMessage: boolean = false, options?: ToastOptions) => {
    if (isAdminMessage) {
      return adminToast.loading(message, options);
    } else {
      return publicToast.loading(message, options);
    }
  },

  info: (message: string, isAdminMessage: boolean = false, options?: ToastOptions) => {
    if (isAdminMessage) {
      adminToast.info(message, options);
    } else {
      publicToast.info(message, options);
    }
  }
};

// Función para detectar si el usuario actual es administrador
export const isCurrentUserAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.includes('/admin');
};