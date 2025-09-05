// ============================================================================
// MODAL WIZARD DE COMPRA - 4 PASOS OPTIMIZADO PARA MÓVILES MEXICANOS
// Diseñado para usuarios menos familiarizados con tecnología
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  CreditCard, 
  Building2, 
  Smartphone,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatPrice, formatTicketNumber } from '../lib/utils';

interface PurchaseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTickets: number[];
  onConfirmPurchase: (customerData: CustomerData, paymentMethod: string) => Promise<void>;
  isProcessing: boolean;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  instructions: string;
  popular?: boolean;
}

const PurchaseWizard: React.FC<PurchaseWizardProps> = ({
  isOpen,
  onClose,
  selectedTickets,
  onConfirmPurchase,
  isProcessing
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: 'México'
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string>('');

  const totalPrice = selectedTickets.length * 250;
  const steps = [
    { number: 1, title: 'Confirmación', description: 'Verifica tu selección' },
    { number: 2, title: 'Pago', description: 'Elige cómo pagar' },
    { number: 3, title: 'Datos', description: 'Tu información' },
    { number: 4, title: 'Confirmación', description: 'Finalizar compra' }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'oxxo',
      name: 'OXXO',
      description: 'Paga en cualquier tienda OXXO',
      icon: Building2,
      color: 'bg-red-600 hover:bg-red-700',
      instructions: 'Recibe un código para pagar en cualquier OXXO',
      popular: true
    },
    {
      id: 'transfer',
      name: 'Transferencia',
      description: 'Banco, SPEI o aplicación móvil',
      icon: Smartphone,
      color: 'bg-blue-600 hover:bg-blue-700',
      instructions: 'Transfiere desde tu banco o app móvil'
    },
    {
      id: 'card',
      name: 'Tarjeta',
      description: 'Débito o crédito',
      icon: CreditCard,
      color: 'bg-emerald-600 hover:bg-emerald-700',
      instructions: 'Pago seguro con tu tarjeta'
    }
  ];

  const mexicanStates = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
    'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
    'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora',
    'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  // Reset wizard when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setValidationErrors({});
      setSelectedPaymentMethod('');
    }
  }, [isOpen]);

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 2) {
      if (!selectedPaymentMethod) {
        errors.payment = 'Selecciona un método de pago';
      }
    }

    if (step === 3) {
      if (!customerData.name.trim()) errors.name = 'Ingresa tu nombre completo';
      if (!customerData.email.trim()) errors.email = 'Ingresa tu email';
      if (!customerData.phone.trim()) errors.phone = 'Ingresa tu teléfono';
      if (!customerData.city.trim()) errors.city = 'Ingresa tu ciudad';
      
      // Validar formato de email
      if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
        errors.email = 'Ingresa un email válido';
      }
      
      // Validar teléfono mexicano
      if (customerData.phone && !/^(\+52|52)?\s?[1-9]\d{9}$/.test(customerData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Ingresa un teléfono válido (10 dígitos)';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (validateStep(3)) {
      try {
        await onConfirmPurchase(customerData, selectedPaymentMethod);
      } catch (error) {
        console.error('Error en compra:', error);
      }
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-2xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    disabled={isProcessing}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                disabled={isProcessing}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center mt-4 space-x-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    currentStep >= step.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {currentStep > step.number ? <Check size={16} /> : step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'flex-1 h-1 mx-2',
                      currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[65vh] sm:max-h-[60vh]">
            {/* Paso 1: Confirmación de Selección */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    ¡Excelente selección!
                  </h3>
                  <p className="text-gray-600">
                    Tienes {selectedTickets.length} número{selectedTickets.length !== 1 ? 's' : ''} seleccionado{selectedTickets.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedTickets.length}
                      </div>
                      <div className="text-sm text-gray-600">Números</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(totalPrice)}
                      </div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-blue-200 pt-4">
                    <div className="text-sm text-gray-600 mb-2">Tus números:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTickets.slice(0, 10).map(ticket => (
                        <span key={ticket} className="bg-white px-3 py-1 rounded-lg text-sm font-mono">
                          {formatTicketNumber(ticket)}
                        </span>
                      ))}
                      {selectedTickets.length > 10 && (
                        <span className="bg-white px-3 py-1 rounded-lg text-sm">
                          +{selectedTickets.length - 10} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Método de Pago */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">💳</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    ¿Cómo quieres pagar?
                  </h3>
                  <p className="text-gray-600">
                    Elige la opción que más te convenga
                  </p>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={cn(
                          'w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all',
                          'hover:shadow-md active:scale-98 min-h-[60px]', // Optimizado para touch
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className={cn(
                            'p-2 sm:p-3 rounded-xl text-white flex-shrink-0',
                            method.color
                          )}>
                            <Icon size={20} className="sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-bold text-gray-800 text-sm sm:text-base">
                                {method.name}
                              </span>
                              {method.popular && (
                                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                              {method.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle size={20} className="text-blue-500 sm:w-6 sm:h-6" />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {validationErrors.payment && (
                  <div className="text-red-600 text-sm mt-2">
                    {validationErrors.payment}
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Datos del Comprador */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">👤</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Tus datos
                  </h3>
                  <p className="text-gray-600">
                    Necesarios para contactarte si ganas
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users size={16} className="inline mr-1" />
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-lg border text-base',
                        validationErrors.name ? 'border-red-300' : 'border-gray-300',
                        'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      )}
                      placeholder="Ej: Juan Pérez García"
                    />
                    {validationErrors.name && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-lg border text-base',
                        validationErrors.phone ? 'border-red-300' : 'border-gray-300',
                        'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      )}
                      placeholder="Ej: 55 1234 5678"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-3 rounded-lg border text-base',
                        validationErrors.email ? 'border-red-300' : 'border-gray-300',
                        'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                      )}
                      placeholder="tu@email.com"
                    />
                    {validationErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="inline mr-1" />
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border text-base',
                          validationErrors.city ? 'border-red-300' : 'border-gray-300',
                          'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        )}
                        placeholder="Tu ciudad"
                      />
                      {validationErrors.city && (
                        <p className="text-red-600 text-sm mt-1">{validationErrors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={customerData.state}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        {mexicanStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4: Confirmación Final */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">✅</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Resumen de tu compra
                  </h3>
                  <p className="text-gray-600">
                    Revisa que todo esté correcto
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="font-medium">Números seleccionados:</span>
                    <span className="font-bold">{selectedTickets.length}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="font-medium">Método de pago:</span>
                    <span className="font-bold">
                      {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                    <span className="font-medium">Comprador:</span>
                    <span className="font-bold">{customerData.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xl font-bold text-green-600">
                    <span>Total a pagar:</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <FileText size={16} className="inline mr-2" />
                    Al confirmar tu compra, recibirás las instrucciones de pago por email y 
                    tus números quedarán reservados por 30 minutos.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="text-xs sm:text-sm text-gray-600">
                Paso {currentStep} de {steps.length}
              </div>
              
              <div className="flex space-x-3">
                {currentStep < 4 && (
                  <button
                    onClick={handleNext}
                    disabled={isProcessing}
                    className={cn(
                      'px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg',
                      'transition-colors flex items-center space-x-2 text-sm sm:text-base',
                      'disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]' // Touch target mínimo
                    )}
                  >
                    <span>Continuar</span>
                    <ArrowRight size={16} />
                  </button>
                )}
                
                {currentStep === 4 && (
                  <button
                    onClick={handleFinish}
                    disabled={isProcessing}
                    className={cn(
                      'px-6 sm:px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg',
                      'transition-colors flex items-center space-x-2 text-base sm:text-lg',
                      'disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        <span>Confirmar Compra</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseWizard;