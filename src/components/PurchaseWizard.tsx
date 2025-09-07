// ============================================================================
// PURCHASE WIZARD MODAL - 4 STEPS OPTIMIZED FOR MOBILE
// Clean, professional design with subtle theming
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
  Upload,
  Copy,
  Check,
  Camera
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

  // Filter to show only 4 main payment methods
  const mainPaymentMethods = PAYMENT_METHODS.filter(method => 
    ['bancoppel', 'bancoazteca', 'oxxo', 'binance'].includes(method.id)
  );


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
      {/* Premium Glass Backdrop */}
      <div 
        className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90 backdrop-blur-lg backdrop-saturate-150 transition-all duration-500 ease-out" 
        onClick={onClose}
      />
      
      {/* Modal Container - Premium Glass Morphism - Optimized Size */}
      <div className="flex items-center justify-center min-h-screen p-3 sm:p-6">
        <div 
          className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl transform animate-in fade-in-50 slide-in-from-bottom-4 duration-300 ease-out"
          style={{ maxHeight: '85vh' }}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-slate-200/50 border border-white/20 overflow-hidden flex flex-col h-[85vh] max-h-[85vh]">
          
          {/* Premium Glass Header - Compact */}
          <div className="shrink-0 bg-gradient-to-r from-slate-50/90 to-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="group relative bg-gradient-to-br from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 p-2.5 rounded-xl transition-all duration-300 ease-out ring-1 ring-slate-200/50 hover:ring-slate-300/50 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    disabled={isProcessing}
                  >
                    <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                  </button>
                )}
                <div className="space-y-1">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-sm text-slate-600 font-medium">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="group text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300/50 active:scale-95"
                disabled={isProcessing}
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            {/* Premium Progress Indicator */}
            <div className="flex items-center gap-3">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex items-center">
                    <div className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ease-out ring-2',
                      currentStep > step.number 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ring-emerald-200/60 shadow-lg shadow-emerald-500/25 scale-110' 
                        : currentStep === step.number
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-blue-200/60 shadow-lg shadow-blue-500/25 scale-110 animate-pulse'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 ring-slate-200/50 hover:ring-slate-300/60'
                    )}>
                      {currentStep > step.number ? (
                        <CheckCircle size={18} className="animate-in zoom-in-50 duration-300" />
                      ) : (
                        <span className="transform transition-transform duration-200">
                          {step.number}
                        </span>
                      )}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-3 mx-3 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 shadow-inner overflow-hidden">
                      <div className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        currentStep > step.number ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm' : 'bg-transparent'
                      )} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Premium Content Container - With proper scroll */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            <div className="p-4 sm:p-6 space-y-6">
              {/* Step 1: Premium Confirmation */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl shadow-2xl shadow-emerald-500/30 animate-pulse" />
                      <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center">
                        <CheckCircle size={36} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Confirma tu selección
                      </h3>
                      <p className="text-slate-600 text-lg font-medium">
                        Has seleccionado {selectedTickets.length} número{selectedTickets.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="group relative bg-gradient-to-br from-slate-50 to-slate-100/80 backdrop-blur-sm rounded-2xl p-8 text-center ring-1 ring-slate-200/50 hover:ring-slate-300/60 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className="text-4xl font-black bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                          {selectedTickets.length}
                        </div>
                        <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                          Números Seleccionados
                        </div>
                      </div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100/80 backdrop-blur-sm rounded-2xl p-8 text-center ring-1 ring-emerald-200/50 hover:ring-emerald-300/60 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative">
                        <div className="text-4xl font-black bg-gradient-to-br from-emerald-700 to-emerald-600 bg-clip-text text-transparent mb-3">
                          {formatPrice(totalPrice)}
                        </div>
                        <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                          Total a Pagar
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-slate-200/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
                    <div className="relative">
                      <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        Números seleccionados
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {selectedTickets.slice(0, 15).map((ticket, index) => (
                          <span 
                            key={ticket} 
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 transition-all duration-200 ring-1 ring-blue-500/30"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            {formatTicketNumber(ticket)}
                          </span>
                        ))}
                        {selectedTickets.length > 15 && (
                          <span className="bg-gradient-to-r from-slate-400 to-slate-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-400/25 ring-1 ring-slate-400/30">
                            +{selectedTickets.length - 15} más
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Premium Payment Methods */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl shadow-2xl shadow-blue-500/30 animate-pulse" />
                      <div className="relative w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center">
                        <CreditCard size={36} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Elige tu método de pago
                      </h3>
                      <p className="text-slate-600 text-lg font-medium">
                        Selecciona cómo prefieres pagar
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {mainPaymentMethods.map((method, index) => (
                      <div key={method.id} className="space-y-4" style={{ animationDelay: `${index * 100}ms` }}>
                        <button
                          onClick={() => {
                            setSelectedPaymentMethod(method.id);
                            setShowPaymentDetails(showPaymentDetails === method.id ? '' : method.id);
                          }}
                          className={cn(
                            'group w-full p-6 rounded-2xl border-2 text-center transition-all duration-300 min-h-[140px] flex flex-col items-center justify-center relative backdrop-blur-sm',
                            'hover:shadow-2xl hover:scale-105 active:scale-95 focus:outline-none focus:ring-4',
                            selectedPaymentMethod === method.id
                              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/80 shadow-xl shadow-blue-500/20 ring-4 ring-blue-200/50'
                              : 'border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80 hover:border-slate-300 hover:shadow-slate-200/50 ring-1 ring-slate-200/30 hover:ring-slate-300/50 focus:ring-blue-200/50'
                          )}
                        >
                          {selectedPaymentMethod === method.id && (
                            <div className="absolute -top-3 -right-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-2 shadow-lg shadow-blue-500/30 animate-in zoom-in-50 duration-300">
                              <CheckCircle size={18} />
                            </div>
                          )}

                          <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-100 rounded-2xl shadow-inner" />
                              <div className="relative bg-gradient-to-br from-white to-slate-50 p-4 rounded-2xl shadow-lg ring-1 ring-slate-200/50 group-hover:shadow-xl transition-shadow duration-300">
                                <img
                                  src={method.icon}
                                  alt={method.name}
                                  className="w-14 h-14 object-contain filter group-hover:scale-110 transition-transform duration-200"
                                />
                              </div>
                            </div>
                            
                            <div className="text-center space-y-2">
                              <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors duration-200">
                                {method.name}
                              </div>
                              {method.enabled && (
                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ring-1 ring-emerald-200/50">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  Disponible
                                </span>
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Premium Payment Details */}
                        {showPaymentDetails === method.id && (
                          <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-slate-200/50 animate-in slide-in-from-top-4 fade-in-50 duration-300">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
                            <div className="relative space-y-4">
                              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-3 text-base">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                                  <FileText size={16} className="text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                                  Datos para {method.name}
                                </span>
                              </h4>
                              <div className="space-y-3">
                                {method.accountDetails?.split('\n').map((line, index) => (
                                  <div key={index} className="group relative bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-200">
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <div className="relative flex items-center justify-between">
                                      <span className="text-slate-800 text-sm flex-1 mr-3 font-mono font-medium">{line}</span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(line.split(': ')[1] || line);
                                          setCopiedField(`${method.id}-${index}`);
                                          setTimeout(() => setCopiedField(''), 2000);
                                        }}
                                        className={cn(
                                          'px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ring-1 shadow-sm active:scale-95',
                                          copiedField === `${method.id}-${index}` 
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-emerald-200/50 shadow-emerald-500/25' 
                                            : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300 ring-slate-200/50 hover:shadow-md'
                                        )}
                                      >
                                        {copiedField === `${method.id}-${index}` ? (
                                          <>
                                            <Check size={12} className="inline mr-1.5" />
                                            Copiado
                                          </>
                                        ) : (
                                          <>
                                            <Copy size={12} className="inline mr-1.5" />
                                            Copiar
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="relative bg-gradient-to-r from-blue-50 to-blue-100/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-200/60 ring-1 ring-blue-200/30">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl" />
                                <p className="relative text-blue-800 text-sm font-medium flex items-start gap-3">
                                  <div className="p-1.5 bg-blue-500 rounded-lg shadow-sm">
                                    <FileText size={12} className="text-white" />
                                  </div>
                                  <span className="leading-relaxed">
                                    Realiza tu transferencia y sube el comprobante en el siguiente paso
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {validationErrors.payment && (
                    <div className="relative bg-gradient-to-r from-red-50 to-red-100/80 backdrop-blur-sm border border-red-200/60 rounded-2xl p-4 text-center ring-1 ring-red-200/30 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl" />
                      <p className="relative text-red-800 text-sm font-bold flex items-center justify-center gap-2">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <X size={12} className="text-white" />
                        </div>
                        {validationErrors.payment}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Premium Customer Data */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-violet-600 rounded-3xl shadow-2xl shadow-violet-500/30 animate-pulse" />
                      <div className="relative w-full h-full bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl flex items-center justify-center">
                        <Users size={36} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Ingresa tus datos
                      </h3>
                      <p className="text-slate-600 text-lg font-medium">
                        Necesarios para contactarte cuando ganes
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Premium Full Name Field */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        Nombre completo *
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={customerData.name}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                          className={cn(
                            'w-full px-5 py-4 rounded-2xl border-2 text-sm transition-all duration-300',
                            'bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm placeholder:text-slate-400 text-slate-900',
                            'focus:outline-none focus:ring-4 hover:shadow-lg group-hover:shadow-md',
                            validationErrors.name 
                              ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500 shadow-red-100' 
                              : 'border-slate-200/60 focus:ring-violet-200/50 focus:border-violet-500 hover:border-slate-300/60'
                          )}
                          placeholder="Tu nombre completo"
                        />
                        <div className={cn(
                          'absolute inset-0 rounded-2xl ring-1 pointer-events-none transition-all duration-300',
                          validationErrors.name 
                            ? 'ring-red-200/50' 
                            : 'ring-slate-200/30 group-hover:ring-slate-300/50'
                        )} />
                      </div>
                      {validationErrors.name && (
                        <p className="text-red-600 text-xs mt-2 flex items-center gap-2 font-medium animate-in fade-in-50 slide-in-from-top-1 duration-200">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <X size={10} className="text-white" />
                          </div>
                          {validationErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Premium Phone Field */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Phone size={14} className="text-emerald-500" />
                        Teléfono WhatsApp *
                      </label>
                      <div className="relative group">
                        <input
                          type="tel"
                          value={customerData.phone}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                          className={cn(
                            'w-full px-5 py-4 rounded-2xl border-2 text-sm transition-all duration-300',
                            'bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm placeholder:text-slate-400 text-slate-900',
                            'focus:outline-none focus:ring-4 hover:shadow-lg',
                            validationErrors.phone 
                              ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500 shadow-red-100' 
                              : 'border-slate-200/60 focus:ring-emerald-200/50 focus:border-emerald-500 hover:border-slate-300/60'
                          )}
                          placeholder="+52 55 1234 5678"
                        />
                        <div className={cn(
                          'absolute inset-0 rounded-2xl ring-1 pointer-events-none transition-all duration-300',
                          validationErrors.phone 
                            ? 'ring-red-200/50' 
                            : 'ring-slate-200/30 group-hover:ring-slate-300/50'
                        )} />
                      </div>
                      {validationErrors.phone && (
                        <p className="text-red-600 text-xs mt-2 flex items-center gap-2 font-medium animate-in fade-in-50 slide-in-from-top-1 duration-200">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <X size={10} className="text-white" />
                          </div>
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Premium Email Field */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Mail size={14} className="text-blue-500" />
                        Email *
                      </label>
                      <div className="relative group">
                        <input
                          type="email"
                          value={customerData.email}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          className={cn(
                            'w-full px-5 py-4 rounded-2xl border-2 text-sm transition-all duration-300',
                            'bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm placeholder:text-slate-400 text-slate-900',
                            'focus:outline-none focus:ring-4 hover:shadow-lg',
                            validationErrors.email 
                              ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500 shadow-red-100' 
                              : 'border-slate-200/60 focus:ring-blue-200/50 focus:border-blue-500 hover:border-slate-300/60'
                          )}
                          placeholder="tu@email.com"
                        />
                        <div className={cn(
                          'absolute inset-0 rounded-2xl ring-1 pointer-events-none transition-all duration-300',
                          validationErrors.email 
                            ? 'ring-red-200/50' 
                            : 'ring-slate-200/30 group-hover:ring-slate-300/50'
                        )} />
                      </div>
                      {validationErrors.email && (
                        <p className="text-red-600 text-xs mt-2 flex items-center gap-2 font-medium animate-in fade-in-50 slide-in-from-top-1 duration-200">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <X size={10} className="text-white" />
                          </div>
                          {validationErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Premium City Field */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <MapPin size={14} className="text-orange-500" />
                        Ciudad *
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={customerData.city}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                          className={cn(
                            'w-full px-5 py-4 rounded-2xl border-2 text-sm transition-all duration-300',
                            'bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm placeholder:text-slate-400 text-slate-900',
                            'focus:outline-none focus:ring-4 hover:shadow-lg',
                            validationErrors.city 
                              ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500 shadow-red-100' 
                              : 'border-slate-200/60 focus:ring-orange-200/50 focus:border-orange-500 hover:border-slate-300/60'
                          )}
                          placeholder="Tu ciudad"
                        />
                        <div className={cn(
                          'absolute inset-0 rounded-2xl ring-1 pointer-events-none transition-all duration-300',
                          validationErrors.city 
                            ? 'ring-red-200/50' 
                            : 'ring-slate-200/30 group-hover:ring-slate-300/50'
                        )} />
                      </div>
                      {validationErrors.city && (
                        <p className="text-red-600 text-xs mt-2 flex items-center gap-2 font-medium animate-in fade-in-50 slide-in-from-top-1 duration-200">
                          <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <X size={10} className="text-white" />
                          </div>
                          {validationErrors.city}
                        </p>
                      )}
                    </div>

                    {/* Premium State Field */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Building2 size={14} className="text-purple-500" />
                        Estado
                      </label>
                      <div className="relative group">
                        <select
                          value={customerData.state}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200/60 text-sm bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-purple-200/50 focus:border-purple-500 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
                        >
                          {mexicanStates.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-slate-200/30 group-hover:ring-slate-300/50 pointer-events-none transition-all duration-300" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Premium Upload Screenshot */}
              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-2xl shadow-orange-500/30 animate-pulse" />
                      <div className="relative w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center">
                        <Camera size={36} className="text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Sube tu comprobante
                      </h3>
                      <div className="space-y-2">
                        <p className="text-slate-600 text-lg font-medium">
                          Captura de pantalla de tu transferencia bancaria
                        </p>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-2 rounded-2xl ring-1 ring-orange-200/50 shadow-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <span className="text-orange-800 font-bold text-sm">
                            📸 IMPORTANTE: Debes subir tu captura de pantalla para completar la compra
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium File Upload Area */}
                  <div className="group relative border-2 border-dashed border-slate-300/60 rounded-3xl p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:border-slate-400/60 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative text-center">
                      {!previewUrl ? (
                        <>
                          <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl animate-pulse" />
                            <div className="relative w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Upload size={40} className="text-white drop-shadow-sm" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-xl font-bold text-slate-900">
                              Selecciona tu comprobante
                            </h4>
                            <p className="text-slate-600 font-medium">
                              JPG, PNG o cualquier imagen (máx. 10MB)
                            </p>
                            
                            <input
                              type="file"
                              id="screenshot-upload"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            
                            <label
                              htmlFor="screenshot-upload"
                              className="cursor-pointer inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 ring-2 ring-blue-500/20"
                            >
                              <Upload size={18} />
                              Seleccionar archivo
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-300">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-700 font-bold flex items-center gap-3 text-lg">
                              <div className="p-2 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/25">
                                <CheckCircle size={18} className="text-white" />
                              </div>
                              Comprobante cargado
                            </span>
                            <button
                              onClick={() => {
                                setPaymentScreenshot(null);
                                setPreviewUrl('');
                                setValidationErrors({});
                              }}
                              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-200/80 transition-all duration-200 hover:scale-110 active:scale-95"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="Comprobante de pago"
                              className="w-full max-w-sm mx-auto rounded-2xl shadow-xl border-2 border-slate-200/60 max-h-48 object-cover ring-1 ring-slate-200/30"
                            />
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-slate-300/30 pointer-events-none" />
                          </div>
                          <p className="text-sm text-slate-700 font-medium truncate bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/60 inline-block">
                            {paymentScreenshot?.name}
                          </p>
                        </div>
                      )}
                    </div>

                    {validationErrors.screenshot && (
                      <div className="relative mt-6 bg-gradient-to-r from-red-50 to-red-100/80 backdrop-blur-sm border border-red-200/60 rounded-2xl p-4 text-center ring-1 ring-red-200/30 animate-in fade-in-50 slide-in-from-top-2 duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl" />
                        <div className="relative text-red-800 text-sm font-bold flex items-center justify-center gap-2">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                            <X size={12} className="text-white" />
                          </div>
                          {validationErrors.screenshot}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Premium Purchase Summary */}
                  <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-slate-200/50 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
                    <div className="relative">
                      <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-3 text-lg">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25">
                          <CheckCircle size={18} className="text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                          Resumen de tu compra
                        </span>
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="group relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl text-center ring-1 ring-slate-200/50 hover:ring-slate-300/60 hover:shadow-lg transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative">
                            <div className="text-sm text-slate-600 font-semibold mb-2">Números</div>
                            <div className="text-2xl font-black bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">{selectedTickets.length}</div>
                          </div>
                        </div>
                        <div className="group relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl text-center ring-1 ring-emerald-200/50 hover:ring-emerald-300/60 hover:shadow-lg transition-all duration-300">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative">
                            <div className="text-sm text-emerald-700 font-semibold mb-2">Total</div>
                            <div className="text-2xl font-black bg-gradient-to-br from-emerald-700 to-emerald-600 bg-clip-text text-transparent">{formatPrice(totalPrice)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl space-y-4 text-sm ring-1 ring-slate-200/50">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium flex items-center gap-2">
                            <CreditCard size={14} className="text-blue-500" />
                            Método:
                          </span>
                          <span className="font-bold text-slate-900 truncate ml-2">
                            {mainPaymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium flex items-center gap-2">
                            <Users size={14} className="text-violet-500" />
                            Comprador:
                          </span>
                          <span className="font-bold text-slate-900 truncate ml-2">{customerData.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Premium Final Instructions */}
                  <div className="relative bg-gradient-to-r from-blue-50 to-blue-100/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-6 ring-1 ring-blue-200/30 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl" />
                    <div className="relative flex gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 flex-shrink-0">
                        <FileText size={20} className="text-white" />
                      </div>
                      <div className="text-blue-800 space-y-2">
                        <p className="font-bold text-lg">¿Qué sigue?</p>
                        <p className="text-sm font-medium leading-relaxed">
                          Recibirás confirmación por email. Revisaremos tu comprobante en máximo 24 horas 
                          y te contactaremos para confirmar tus números.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Premium Footer - Always Visible & Compact */}
          <div className="shrink-0 border-t border-slate-200/60 bg-gradient-to-r from-white to-slate-50/80 backdrop-blur-sm px-4 sm:px-6 py-3 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-bold text-slate-700">Paso {currentStep} de {steps.length}</span>
                <div className="relative w-16 bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-sm" 
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  />
                </div>
                <span className="text-slate-500 font-medium">{Math.round((currentStep / steps.length) * 100)}%</span>
              </div>
              
              <div className="flex gap-3 sm:gap-4 w-full sm:w-auto justify-center sm:justify-end">
                {currentStep < 4 && (
                  <button
                    onClick={handleNext}
                    disabled={isProcessing}
                    className={cn(
                      'group px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-sm transition-all duration-300',
                      'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white',
                      'hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95',
                      'focus:outline-none focus:ring-4 focus:ring-blue-200/50',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                      'flex items-center gap-2 sm:gap-3 ring-2 ring-blue-500/20',
                      'flex-1 sm:flex-initial justify-center'
                    )}
                  >
                    <span>Continuar</span>
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                )}
                
                {currentStep === 4 && (
                  <button
                    onClick={handleFinish}
                    disabled={isProcessing}
                    className={cn(
                      'group px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl font-bold text-sm transition-all duration-300',
                      'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white',
                      'hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 active:scale-95',
                      'focus:outline-none focus:ring-4 focus:ring-emerald-200/50',
                      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                      'flex items-center gap-2 sm:gap-3 ring-2 ring-emerald-500/20',
                      'flex-1 sm:flex-initial justify-center'
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} className="group-hover:scale-110 transition-transform duration-200" />
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
    </div>
  );
};

export default PurchaseWizard;