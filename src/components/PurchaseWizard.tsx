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
import { PAYMENT_METHODS } from '../lib/constants';
import type { PaymentMethod as PaymentMethodType } from '../lib/types';

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
  const [showPaymentDetails, setShowPaymentDetails] = useState<string>('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const totalPrice = selectedTickets.length * 250;
  const steps = [
    { number: 1, title: 'Confirmación', description: 'Verifica tu selección' },
    { number: 2, title: 'Pago', description: 'Elige cómo pagar' },
    { number: 3, title: 'Datos', description: 'Tu información' },
    { number: 4, title: 'Comprobante', description: 'Sube tu captura' }
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

    if (step === 4) {
      if (!paymentScreenshot) {
        errors.screenshot = 'Sube una captura de pantalla de tu comprobante de pago';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setValidationErrors({ screenshot: 'Por favor selecciona una imagen (JPG, PNG, etc.)' });
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setValidationErrors({ screenshot: 'La imagen es muy grande. Máximo 10MB.' });
        return;
      }
      
      setPaymentScreenshot(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Limpiar errores
      setValidationErrors({});
    }
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
    if (validateStep(4)) {
      try {
        // Aquí podrías incluir el paymentScreenshot en los datos enviados
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
      {/* Premium Backdrop with Multiple Layers */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-black/95 backdrop-blur-xl transition-all duration-500" 
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-cyan-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>
      
      {/* Modal Container Ultra Premium */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative bg-gradient-to-br from-white via-gray-50/95 to-slate-50/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] w-full max-w-4xl h-[95vh] overflow-hidden border border-white/20 flex flex-col">
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-400/10 via-transparent to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-400/10 via-transparent to-transparent rounded-full blur-2xl" />
          
          {/* Header Ultra Premium */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group backdrop-blur-sm border border-white/20"
                    disabled={isProcessing}
                  >
                    <ArrowLeft size={20} className="text-white group-hover:translate-x-[-2px] transition-transform" />
                  </button>
                )}
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 font-medium">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group backdrop-blur-sm border border-white/20"
                disabled={isProcessing}
              >
                <X size={20} className="text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Ultra Premium Progress Bar */}
            <div className="flex items-center justify-between space-x-3">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="relative">
                    <div className={cn(
                      'w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 shadow-lg border backdrop-blur-sm',
                      currentStep >= step.number 
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30 border-emerald-300/50 scale-110' 
                        : currentStep === step.number
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30 border-blue-300/50 animate-pulse scale-105'
                        : 'bg-white/10 text-white/50 border-white/20'
                    )}>
                      {currentStep > step.number ? (
                        <Check size={18} className="animate-bounce" />
                      ) : (
                        <span className="font-black">{step.number}</span>
                      )}
                    </div>
                    {/* Glow Effect for Current Step */}
                    {currentStep === step.number && (
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 animate-ping" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-3">
                      <div className={cn(
                        'h-2 rounded-full transition-all duration-700 shadow-sm',
                        currentStep > step.number 
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-emerald-500/50' 
                          : 'bg-white/20 backdrop-blur-sm'
                      )}>
                        {currentStep > step.number && (
                          <div className="h-full bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Premium Content Container */}
          <div className="relative flex-1 p-6 sm:p-8 bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-sm overflow-hidden">
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
                        <span key={ticket} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm font-mono border border-gray-200">
                          {formatTicketNumber(ticket)}
                        </span>
                      ))}
                      {selectedTickets.length > 10 && (
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-lg text-sm border border-gray-200">
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

                <div className="grid grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedPaymentMethod(method.id);
                          setShowPaymentDetails(showPaymentDetails === method.id ? '' : method.id);
                        }}
                        className={cn(
                          'w-full p-3 sm:p-4 rounded-xl border-2 text-center transition-all group',
                          'hover:shadow-lg active:scale-95 min-h-[120px] flex flex-col items-center justify-center',
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-200/50'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                        )}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <div className="relative">
                            <img
                              src={method.icon}
                              alt={method.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-110 transition-transform"
                            />
                            {selectedPaymentMethod === method.id && (
                              <div className="absolute -top-1 -right-1">
                                <CheckCircle size={16} className="text-blue-500 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                          
                          <div className="text-center">
                            <div className="font-bold text-gray-800 text-sm mb-1">
                              {method.name}
                            </div>
                            {method.enabled && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                Disponible
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Datos desplegables del método de pago - Compacto */}
                      {showPaymentDetails === method.id && (
                        <div className="col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 animate-in slide-in-from-top-2 duration-200">
                          <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                            <FileText size={14} />
                            Información para {method.name}
                          </h4>
                          <div className="space-y-2 text-xs">
                            {method.accountDetails?.split('\n').slice(0, 2).map((line, index) => (
                              <div key={index} className="flex items-center justify-between bg-white/80 p-2 rounded border border-blue-200">
                                <span className="text-gray-700 font-mono text-xs truncate flex-1">{line}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(line.split(': ')[1] || line);
                                    setCopiedField(`${method.id}-${index}`);
                                    setTimeout(() => setCopiedField(''), 2000);
                                  }}
                                  className="ml-2 p-1 rounded hover:bg-blue-100 transition-colors flex-shrink-0"
                                >
                                  {copiedField === `${method.id}-${index}` ? (
                                    <Check size={12} className="text-green-600" />
                                  ) : (
                                    <Copy size={12} className="text-blue-500" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
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
                  {/* Nombre completo Ultra Premium - Compacto */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/60 p-3 rounded-xl border border-white/20 backdrop-blur-xl shadow-lg">
                      <label className="flex items-center text-sm font-bold text-slate-800 mb-2">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-2 rounded-lg mr-3 shadow-md">
                          <Users size={14} className="text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                          Nombre completo *
                        </span>
                      </label>
                      <input
                        type="text"
                        value={customerData.name}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border-2 text-base font-medium shadow-inner transition-all duration-300',
                          'bg-white/90 backdrop-blur-sm placeholder:text-slate-400 text-slate-800',
                          'focus:bg-white focus:shadow-lg transform',
                          validationErrors.name 
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200/50' 
                            : 'border-blue-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200/50',
                          'hover:shadow-md hover:border-blue-400'
                        )}
                        placeholder="Ej: Juan Pérez García"
                      />
                      {validationErrors.name && (
                        <p className="text-red-600 text-xs mt-2 font-medium flex items-center bg-red-50 p-2 rounded border border-red-200">
                          <X size={12} className="mr-1" />
                          {validationErrors.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Teléfono Ultra Premium - Compacto */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-gradient-to-br from-white via-emerald-50/80 to-green-50/60 p-3 rounded-xl border border-white/20 backdrop-blur-xl shadow-lg">
                      <label className="flex items-center text-sm font-bold text-slate-800 mb-2">
                        <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-2 rounded-lg mr-3 shadow-md">
                          <Phone size={14} className="text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                          Teléfono (WhatsApp) *
                        </span>
                      </label>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border-2 text-base font-medium shadow-inner transition-all duration-300',
                          'bg-white/90 backdrop-blur-sm placeholder:text-slate-400 text-slate-800',
                          'focus:bg-white focus:shadow-lg transform',
                          validationErrors.phone 
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200/50' 
                            : 'border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200/50',
                          'hover:shadow-md hover:border-emerald-400'
                        )}
                        placeholder="Ej: +52 55 1234 5678"
                      />
                      {validationErrors.phone && (
                        <p className="text-red-600 text-xs mt-2 font-medium flex items-center bg-red-50 p-2 rounded border border-red-200">
                          <X size={12} className="mr-1" />
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Ultra Premium - Compacto */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-gradient-to-br from-white via-purple-50/80 to-pink-50/60 p-3 rounded-xl border border-white/20 backdrop-blur-xl shadow-lg">
                      <label className="flex items-center text-sm font-bold text-slate-800 mb-2">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-700 p-2 rounded-lg mr-3 shadow-md">
                          <Mail size={14} className="text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">
                          Correo Electrónico *
                        </span>
                      </label>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                        className={cn(
                          'w-full px-4 py-3 rounded-lg border-2 text-base font-medium shadow-inner transition-all duration-300',
                          'bg-white/90 backdrop-blur-sm placeholder:text-slate-400 text-slate-800',
                          'focus:bg-white focus:shadow-lg transform',
                          validationErrors.email 
                            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200/50' 
                            : 'border-purple-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200/50',
                          'hover:shadow-md hover:border-purple-400'
                        )}
                        placeholder="tu@email.com"
                      />
                      {validationErrors.email && (
                        <p className="text-red-600 text-xs mt-2 font-medium flex items-center bg-red-50 p-2 rounded border border-red-200">
                          <X size={12} className="mr-1" />
                          {validationErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-white via-orange-50/80 to-yellow-50/60 p-3 rounded-xl border border-white/20 shadow-lg">
                      <label className="flex items-center text-sm font-bold text-slate-800 mb-2">
                        <MapPin size={14} className="text-orange-600 mr-2" />
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                        className={cn(
                          'w-full px-3 py-2 rounded-lg border text-sm bg-white/90 text-slate-800 placeholder:text-slate-400',
                          validationErrors.city ? 'border-red-300' : 'border-orange-300',
                          'focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                        )}
                        placeholder="Tu ciudad"
                      />
                      {validationErrors.city && (
                        <p className="text-red-600 text-xs mt-1">{validationErrors.city}</p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-white via-teal-50/80 to-cyan-50/60 p-3 rounded-xl border border-white/20 shadow-lg">
                      <label className="flex items-center text-sm font-bold text-slate-800 mb-2">
                        <MapPin size={14} className="text-teal-600 mr-2" />
                        Estado
                      </label>
                      <select
                        value={customerData.state}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-teal-300 text-sm bg-white/90 text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
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

            {/* Paso 4: Subir Comprobante */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="text-2xl mb-1">📸</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    Subir comprobante de pago
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Toma una foto o captura de pantalla de tu transferencia
                  </p>
                </div>

                {/* Área de subida de archivo - Compacta */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border-2 border-dashed border-orange-300">
                  <div className="text-center">
                    <div className="mb-3">
                      <div className="bg-orange-500 p-3 rounded-full inline-block mb-3">
                        <Download size={24} className="text-white" />
                      </div>
                      <h4 className="text-base font-bold text-orange-800 mb-1">
                        Selecciona tu comprobante
                      </h4>
                      <p className="text-orange-700 text-xs mb-3">
                        JPG, PNG o cualquier imagen (máximo 10MB)
                      </p>
                    </div>

                    <input
                      type="file"
                      id="screenshot-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    <label
                      htmlFor="screenshot-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-md hover:shadow-lg text-sm"
                    >
                      <Download size={16} />
                      Seleccionar archivo
                    </label>
                  </div>

                  {/* Preview de la imagen - Compacto */}
                  {previewUrl && (
                    <div className="mt-4 bg-white p-3 rounded-lg border-2 border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-orange-800 font-bold flex items-center gap-1 text-sm">
                          <CheckCircle size={14} className="text-green-600" />
                          Comprobante cargado
                        </span>
                        <button
                          onClick={() => {
                            setPaymentScreenshot(null);
                            setPreviewUrl('');
                            setValidationErrors({});
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <img
                        src={previewUrl}
                        alt="Comprobante de pago"
                        className="w-full max-w-xs mx-auto rounded-lg shadow-sm border border-gray-200 max-h-40 object-cover"
                      />
                      <p className="text-xs text-gray-600 text-center mt-2 truncate">
                        {paymentScreenshot?.name}
                      </p>
                    </div>
                  )}

                  {validationErrors.screenshot && (
                    <div className="mt-4 text-red-600 text-sm font-medium flex items-center justify-center gap-2">
                      <X size={16} />
                      {validationErrors.screenshot}
                    </div>
                  )}
                </div>

                {/* Resumen de la compra - Compacto */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-base">
                    <CheckCircle size={16} className="text-green-600" />
                    Resumen de tu compra
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded-lg">
                      <span className="text-gray-600 text-xs">Números:</span>
                      <div className="font-bold text-base">{selectedTickets.length}</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <span className="text-gray-600 text-xs">Total:</span>
                      <div className="font-bold text-base text-green-600">{formatPrice(totalPrice)}</div>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Método:</span>
                      <span className="font-bold truncate ml-2">
                        {PAYMENT_METHODS.find((m: PaymentMethodType) => m.id === selectedPaymentMethod)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Comprador:</span>
                      <span className="font-bold truncate ml-2">{customerData.name}</span>
                    </div>
                  </div>
                </div>

                {/* Instrucciones finales - Compactas */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 flex items-start gap-2">
                    <FileText size={14} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Al finalizar, recibirás confirmación por email. Un administrador revisará tu comprobante en 24 horas.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-slate-800 via-gray-800 to-slate-900 backdrop-blur-xl border-t border-white/10 px-6 sm:px-8 py-5 sm:py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="text-sm sm:text-base text-slate-300 font-medium">
                  Paso {currentStep} de {steps.length}
                </div>
                <div className="w-16 bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50" 
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-400 font-medium">
                  {Math.round((currentStep / steps.length) * 100)}%
                </span>
              </div>
              
              <div className="flex space-x-3">
                {currentStep < 4 && (
                  <button
                    onClick={handleNext}
                    disabled={isProcessing}
                    className={cn(
                      'relative group px-8 sm:px-10 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 shadow-2xl min-h-[56px]',
                      'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white',
                      'hover:from-blue-500 hover:via-purple-500 hover:to-blue-600 hover:shadow-blue-500/30 hover:scale-105',
                      'focus:ring-4 focus:ring-blue-200/50 focus:outline-none active:scale-95',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                    )}
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                    <span className="relative flex items-center space-x-3">
                      <span>Continuar</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                )}
                
                {currentStep === 4 && (
                  <button
                    onClick={handleFinish}
                    disabled={isProcessing}
                    className={cn(
                      'relative group px-10 sm:px-12 py-4 rounded-2xl font-black text-base sm:text-lg transition-all duration-300 shadow-2xl min-h-[56px]',
                      'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white',
                      'hover:from-emerald-500 hover:via-green-500 hover:to-emerald-600 hover:shadow-emerald-500/30 hover:scale-105',
                      'focus:ring-4 focus:ring-emerald-200/50 focus:outline-none active:scale-95',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                    )}
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
                    <span className="relative flex items-center space-x-3">
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} className="group-hover:rotate-12 transition-transform" />
                          <span>Confirmar Compra</span>
                        </>
                      )}
                    </span>
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