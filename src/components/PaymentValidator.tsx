'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, X, RefreshCw, CreditCard, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { validatePaymentConfig, getPaymentMethods } from '../lib/config/payment-config';

// ============================================================================
// INTERFACES
// ============================================================================

interface PaymentValidatorProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

interface ValidationResult {
  valid: boolean;
  missing: string[];
  enabled: string[];
  disabled: string[];
}

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

const runFullValidation = (): ValidationResult => {
  const configValidation = validatePaymentConfig();
  const paymentMethods = getPaymentMethods();

  const enabled = paymentMethods.filter(method => method.enabled).map(method => method.name);
  const disabled = paymentMethods.filter(method => !method.enabled).map(method => method.name);

  return {
    valid: configValidation.valid && enabled.length > 0,
    missing: configValidation.missing,
    enabled,
    disabled
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PaymentValidator: React.FC<PaymentValidatorProps> = ({
  isOpen,
  onClose,
  onRetry
}) => {
  const [validation, setValidation] = useState<ValidationResult>(() => runFullValidation());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    // Simulate some async validation time
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newValidation = runFullValidation();
    setValidation(newValidation);
    setIsRefreshing(false);

    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  // ============================================================================
  // RENDER STATUS ICON
  // ============================================================================

  const renderStatusIcon = () => {
    if (isRefreshing) {
      return (
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <RefreshCw size={28} className="text-blue-600 animate-spin" />
        </div>
      );
    }

    if (validation.valid) {
      return (
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={28} className="text-green-600" />
        </div>
      );
    }

    return (
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
        <AlertTriangle size={28} className="text-amber-600" />
      </div>
    );
  };

  // ============================================================================
  // RENDER PAYMENT METHODS STATUS
  // ============================================================================

  const renderPaymentMethods = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
        <CreditCard size={18} />
        Estado de Métodos de Pago
      </h3>

      {/* Enabled Methods */}
      {validation.enabled.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-green-700">✅ Métodos Activos ({validation.enabled.length})</h4>
          <div className="grid grid-cols-1 gap-2">
            {validation.enabled.map((method, index) => (
              <div
                key={`enabled-${index}`}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <span className="text-sm font-medium text-green-800">{method}</span>
                <CheckCircle size={16} className="text-green-600" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disabled Methods */}
      {validation.disabled.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-amber-700">⚠️ Métodos Deshabilitados ({validation.disabled.length})</h4>
          <div className="grid grid-cols-1 gap-2">
            {validation.disabled.map((method, index) => (
              <div
                key={`disabled-${index}`}
                className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <span className="text-sm font-medium text-amber-800">{method}</span>
                <AlertCircle size={16} className="text-amber-600" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER MISSING VARIABLES
  // ============================================================================

  const renderMissingVariables = () => {
    if (validation.missing.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <AlertTriangle size={18} />
          Variables de Entorno Faltantes
        </h3>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 mb-3">
            Para habilitar todos los métodos de pago en producción, configura estas variables:
          </p>
          <div className="space-y-1">
            {validation.missing.map((variable, index) => (
              <code
                key={index}
                className="block text-xs font-mono bg-amber-100 text-amber-900 px-2 py-1 rounded border"
              >
                {variable}
              </code>
            ))}
          </div>
          <p className="text-xs text-amber-700 mt-3">
            💡 Ve a tu dashboard de hosting (Netlify/Vercel) y configura estas variables en Environment Variables.
          </p>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Validación de Métodos de Pago
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status Header */}
              <div className="text-center space-y-4">
                {renderStatusIcon()}

                <div className="space-y-2">
                  <h3 className={cn(
                    "text-lg font-semibold",
                    validation.valid ? "text-green-900" : "text-amber-900"
                  )}>
                    {isRefreshing ? (
                      "Validando configuración..."
                    ) : validation.valid ? (
                      "✅ Configuración Válida"
                    ) : (
                      "⚠️ Configuración Incompleta"
                    )}
                  </h3>

                  <p className={cn(
                    "text-sm",
                    validation.valid ? "text-green-700" : "text-amber-700"
                  )}>
                    {isRefreshing ? (
                      "Verificando métodos de pago y variables de entorno..."
                    ) : validation.valid ? (
                      "Todos los métodos de pago están configurados correctamente."
                    ) : (
                      `${validation.enabled.length} de ${validation.enabled.length + validation.disabled.length} métodos disponibles.`
                    )}
                  </p>
                </div>
              </div>

              {/* Payment Methods Status */}
              {!isRefreshing && renderPaymentMethods()}

              {/* Missing Variables */}
              {!isRefreshing && renderMissingVariables()}

              {/* Environment Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">ℹ️ Información del Ambiente</h4>
                <div className="space-y-1 text-xs text-slate-600">
                  <div>Ambiente: <code className="bg-slate-200 px-1 rounded">{process.env.NODE_ENV || 'development'}</code></div>
                  <div>Total métodos: <code className="bg-slate-200 px-1 rounded">{validation.enabled.length + validation.disabled.length}</code></div>
                  <div>Variables faltantes: <code className="bg-slate-200 px-1 rounded">{validation.missing.length}</code></div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all",
                  "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "Validando..." : "Revalidar"}
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PaymentValidator;