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
      
      {/* Modal Container - Estilo Mexicano Premium para Rifas */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4 lg:p-6">
        <div className="relative bg-gradient-to-br from-white via-green-50/80 to-red-50/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] w-full max-w-6xl max-h-[95vh] overflow-auto border-4 border-gradient-to-r from-green-600 via-white to-red-600 flex flex-col">
          
          {/* Elementos decorativos mexicanos */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-400/20 via-transparent to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-400/20 via-transparent to-transparent rounded-full blur-2xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-300/5 via-transparent to-yellow-300/5 rounded-full blur-3xl" />
          
          {/* Header Mexicano Premium para Rifas */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-green-700 via-white to-red-700 backdrop-blur-xl border-b-4 border-yellow-400 px-4 sm:px-6 py-4 sm:py-5">
            {/* Patrón azteca de fondo */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2240%22%20viewBox%3D%220%200%2060%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23fbbf24%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M30%200l10%2020-10%2020-10-20z%20M0%2020l10-20v40l-10-20z%20M50%2020l10-20v40l-10-20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
            
            <div className="relative z-10">
              {/* Título principal mexicano */}
              <div className="text-center mb-4">
                <h2 className="text-2xl sm:text-4xl font-black text-green-800 drop-shadow-lg mb-2 flex items-center justify-center gap-2">
                  🎯 ¡PARTICIPA EN LA RIFA!
                </h2>
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl px-4 py-2 inline-block">
                  <p className="text-red-700 font-bold text-base sm:text-lg flex items-center gap-2">
                    📋 Paso {currentStep}: {steps[currentStep - 1].title}
                  </p>
                  <p className="text-sm text-green-700 font-medium">
                    {steps[currentStep - 1].description}
                  </p>
                </div>
              </div>

              {/* Controles de navegación */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {currentStep > 1 && (
                    <button
                      onClick={handleBack}
                      className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-xl transition-all duration-200 group shadow-lg border-2 border-yellow-400"
                      disabled={isProcessing}
                    >
                      <ArrowLeft size={20} className="group-hover:translate-x-[-2px] transition-transform" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all duration-200 group shadow-lg border-2 border-yellow-400"
                  disabled={isProcessing}
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>
            
            {/* Barra de Progreso Mexicana */}
            <div className="bg-white/90 rounded-xl p-4 border-2 border-yellow-400 shadow-lg">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <div className={cn(
                          'w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all duration-500 shadow-xl border-3',
                          currentStep >= step.number 
                            ? 'bg-gradient-to-br from-green-500 to-green-700 text-white shadow-green-500/50 border-yellow-400 scale-110' 
                            : currentStep === step.number
                            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-500/50 border-yellow-400 animate-pulse scale-105'
                            : 'bg-gray-200 text-gray-500 border-gray-300'
                        )}>
                          {currentStep > step.number ? (
                            <CheckCircle size={20} className="animate-bounce text-yellow-200" />
                          ) : (
                            <span className="font-black">{step.number}</span>
                          )}
                        </div>
                        {/* Efecto de brillo para paso actual */}
                        {currentStep === step.number && (
                          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-red-400 to-yellow-400 opacity-40 animate-ping" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <div className={cn(
                          'text-xs sm:text-sm font-bold transition-colors',
                          currentStep >= step.number ? 'text-green-700' : 'text-gray-500'
                        )}>
                          {step.title}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 px-2 sm:px-4">
                        <div className={cn(
                          'h-3 rounded-full transition-all duration-700 shadow-sm border border-yellow-300',
                          currentStep > step.number 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-green-500/50' 
                            : 'bg-gray-200'
                        )}>
                          {currentStep > step.number && (
                            <div className="h-full bg-gradient-to-r from-yellow-300/50 to-transparent rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Contenedor de Contenido Mexicano Premium */}
          <div className="relative flex-1 p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-white/98 to-green-50/50 backdrop-blur-sm">
            {/* Paso 1: Confirmación de Selección - Estilo Mexicano */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center bg-gradient-to-r from-green-100 via-white to-red-100 p-6 rounded-2xl border-4 border-yellow-400 shadow-xl">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-2xl sm:text-3xl font-black text-green-800 mb-3">
                    ¡EXCELENTE SELECCIÓN!
                  </h3>
                  <p className="text-lg sm:text-xl text-red-700 font-bold">
                    Tienes {selectedTickets.length} número{selectedTickets.length !== 1 ? 's' : ''} seleccionado{selectedTickets.length !== 1 ? 's' : ''} 🎫
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 via-white to-red-50 rounded-2xl p-6 sm:p-8 border-4 border-yellow-400 shadow-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="text-center bg-green-100 p-6 rounded-xl border-2 border-green-400 shadow-lg">
                      <div className="text-4xl sm:text-5xl font-black text-green-700 mb-2">
                        {selectedTickets.length}
                      </div>
                      <div className="text-lg font-bold text-green-800">Números Seleccionados</div>
                      <div className="text-green-600 text-sm font-medium">¡Más números = más chances!</div>
                    </div>
                    <div className="text-center bg-red-100 p-6 rounded-xl border-2 border-red-400 shadow-lg">
                      <div className="text-4xl sm:text-5xl font-black text-red-700 mb-2">
                        {formatPrice(totalPrice)}
                      </div>
                      <div className="text-lg font-bold text-red-800">Total a Pagar</div>
                      <div className="text-red-600 text-sm font-medium">¡$250 pesos por número!</div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-400">
                    <h4 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                      🎫 Tus Números de la Suerte:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTickets.slice(0, 12).map(ticket => (
                        <span key={ticket} className="bg-gradient-to-r from-green-500 to-red-500 text-white px-4 py-2 rounded-lg text-base font-black shadow-lg border-2 border-yellow-400">
                          {formatTicketNumber(ticket)}
                        </span>
                      ))}
                      {selectedTickets.length > 12 && (
                        <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg text-base font-black shadow-lg border-2 border-yellow-600">
                          +{selectedTickets.length - 12} más números
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Método de Pago - Estilo Mexicano Premium */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center bg-gradient-to-r from-green-100 via-white to-red-100 p-6 rounded-2xl border-4 border-yellow-400 shadow-xl">
                  <div className="text-5xl mb-4">💳</div>
                  <h3 className="text-2xl sm:text-3xl font-black text-green-800 mb-3">
                    ¡ELIGE CÓMO PAGAR!
                  </h3>
                  <p className="text-lg text-red-700 font-bold">
                    Selecciona el método que más te convenga 🇲🇽
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="space-y-4">
                      <button
                        onClick={() => {
                          setSelectedPaymentMethod(method.id);
                          setShowPaymentDetails(showPaymentDetails === method.id ? '' : method.id);
                        }}
                        className={cn(
                          'w-full p-6 rounded-2xl border-4 text-center transition-all group shadow-xl',
                          'hover:shadow-2xl active:scale-95 min-h-[160px] sm:min-h-[180px] flex flex-col items-center justify-center relative',
                          selectedPaymentMethod === method.id
                            ? 'border-green-500 bg-gradient-to-br from-green-50 via-white to-yellow-50 shadow-green-500/50 transform scale-105'
                            : 'border-yellow-400 bg-gradient-to-br from-white via-gray-50 to-white hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-yellow-50'
                        )}
                      >
                        {/* Badge seleccionado */}
                        {selectedPaymentMethod === method.id && (
                          <div className="absolute -top-3 -right-3 bg-green-600 text-white rounded-full p-2 shadow-lg border-2 border-yellow-400">
                            <CheckCircle size={20} />
                          </div>
                        )}

                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative bg-white p-4 rounded-xl shadow-lg border-2 border-yellow-300">
                            <img
                              src={method.icon}
                              alt={method.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-contain group-hover:scale-110 transition-transform"
                            />
                          </div>
                          
                          <div className="text-center">
                            <div className="font-black text-gray-800 text-lg sm:text-xl mb-2">
                              {method.name}
                            </div>
                            {method.enabled && (
                              <span className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg border-2 border-yellow-400">
                                ✅ Disponible
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Datos desplegables del método de pago - Estilo Mexicano */}
                      {showPaymentDetails === method.id && (
                        <div className="bg-gradient-to-br from-yellow-50 via-white to-green-50 rounded-2xl p-4 sm:p-6 border-4 border-red-400 shadow-2xl animate-in slide-in-from-top-2 duration-300">
                          <h4 className="font-black text-red-800 mb-4 flex items-center gap-3 text-lg">
                            <FileText size={20} className="text-green-600" />
                            📋 Datos para {method.name}
                          </h4>
                          <div className="space-y-3">
                            {method.accountDetails?.split('\n').map((line, index) => (
                              <div key={index} className="bg-white p-4 rounded-xl border-2 border-yellow-300 shadow-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-800 font-bold text-sm sm:text-base flex-1 mr-2">{line}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(line.split(': ')[1] || line);
                                      setCopiedField(`${method.id}-${index}`);
                                      setTimeout(() => setCopiedField(''), 2000);
                                    }}
                                    className={cn(
                                      'px-3 py-2 rounded-lg font-bold text-sm transition-all shadow-md',
                                      copiedField === `${method.id}-${index}` 
                                        ? 'bg-green-600 text-white border-2 border-green-700' 
                                        : 'bg-yellow-400 text-yellow-900 border-2 border-yellow-500 hover:bg-yellow-500'
                                    )}
                                  >
                                    {copiedField === `${method.id}-${index}` ? (
                                      <>
                                        <Check size={16} className="inline mr-1" />
                                        ¡Copiado!
                                      </>
                                    ) : (
                                      <>
                                        <Copy size={16} className="inline mr-1" />
                                        Copiar
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 bg-blue-50 p-3 rounded-xl border-2 border-blue-300">
                            <p className="text-blue-800 font-bold text-sm flex items-center gap-2">
                              💡 <strong>Tip:</strong> Copia los datos y realiza tu transferencia desde tu app bancaria
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {validationErrors.payment && (
                  <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4 text-center">
                    <p className="text-red-800 font-bold text-lg">
                      ⚠️ {validationErrors.payment}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Datos del Comprador - Estilo Mexicano Premium */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center bg-gradient-to-r from-green-100 via-white to-red-100 p-6 rounded-2xl border-4 border-yellow-400 shadow-xl">
                  <div className="text-5xl mb-4">👤</div>
                  <h3 className="text-2xl sm:text-3xl font-black text-green-800 mb-3">
                    ¡INGRESA TUS DATOS!
                  </h3>
                  <p className="text-lg text-red-700 font-bold">
                    Necesarios para contactarte cuando GANES 🏆
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Nombre completo - Estilo Mexicano Grande */}
                  <div className="bg-gradient-to-br from-green-50 via-white to-yellow-50 p-4 sm:p-6 rounded-2xl border-4 border-green-400 shadow-2xl">
                    <label className="flex items-center text-lg sm:text-xl font-black text-green-800 mb-4">
                      <div className="bg-green-600 p-3 rounded-xl mr-4 shadow-lg">
                        <Users size={24} className="text-white" />
                      </div>
                      👤 Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        'w-full px-6 py-4 rounded-xl border-4 text-lg sm:text-xl font-bold shadow-lg transition-all duration-300',
                        'bg-white placeholder:text-gray-400 text-gray-800',
                        'focus:bg-white focus:shadow-2xl focus:scale-[1.02] transform',
                        validationErrors.name 
                          ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-300/50' 
                          : 'border-yellow-400 focus:border-green-500 focus:ring-4 focus:ring-green-300/50',
                        'hover:shadow-xl hover:border-green-500'
                      )}
                      placeholder="Ejemplo: Juan Pérez García"
                    />
                    {validationErrors.name && (
                      <p className="text-red-700 text-sm mt-3 font-bold flex items-center bg-red-100 p-3 rounded-xl border-2 border-red-300">
                        <X size={16} className="mr-2" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Teléfono - Estilo Mexicano Grande */}
                  <div className="bg-gradient-to-br from-red-50 via-white to-yellow-50 p-4 sm:p-6 rounded-2xl border-4 border-red-400 shadow-2xl">
                    <label className="flex items-center text-lg sm:text-xl font-black text-red-800 mb-4">
                      <div className="bg-red-600 p-3 rounded-xl mr-4 shadow-lg">
                        <Phone size={24} className="text-white" />
                      </div>
                      📱 WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      className={cn(
                        'w-full px-6 py-4 rounded-xl border-4 text-lg sm:text-xl font-bold shadow-lg transition-all duration-300',
                        'bg-white placeholder:text-gray-400 text-gray-800',
                        'focus:bg-white focus:shadow-2xl focus:scale-[1.02] transform',
                        validationErrors.phone 
                          ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-300/50' 
                          : 'border-yellow-400 focus:border-red-500 focus:ring-4 focus:ring-red-300/50',
                        'hover:shadow-xl hover:border-red-500'
                      )}
                      placeholder="Ejemplo: +52 55 1234 5678"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-700 text-sm mt-3 font-bold flex items-center bg-red-100 p-3 rounded-xl border-2 border-red-300">
                        <X size={16} className="mr-2" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email - Estilo Mexicano Grande */}
                  <div className="bg-gradient-to-br from-yellow-50 via-white to-green-50 p-4 sm:p-6 rounded-2xl border-4 border-yellow-400 shadow-2xl">
                    <label className="flex items-center text-lg sm:text-xl font-black text-yellow-800 mb-4">
                      <div className="bg-yellow-600 p-3 rounded-xl mr-4 shadow-lg">
                        <Mail size={24} className="text-white" />
                      </div>
                      📧 Email *
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      className={cn(
                        'w-full px-6 py-4 rounded-xl border-4 text-lg sm:text-xl font-bold shadow-lg transition-all duration-300',
                        'bg-white placeholder:text-gray-400 text-gray-800',
                        'focus:bg-white focus:shadow-2xl focus:scale-[1.02] transform',
                        validationErrors.email 
                          ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-300/50' 
                          : 'border-yellow-400 focus:border-yellow-600 focus:ring-4 focus:ring-yellow-300/50',
                        'hover:shadow-xl hover:border-yellow-600'
                      )}
                      placeholder="ejemplo@email.com"
                    />
                    {validationErrors.email && (
                      <p className="text-red-700 text-sm mt-3 font-bold flex items-center bg-red-100 p-3 rounded-xl border-2 border-red-300">
                        <X size={16} className="mr-2" />
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  {/* Ciudad y Estado - Grid Responsivo */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 sm:p-6 rounded-2xl border-4 border-blue-400 shadow-2xl">
                      <label className="flex items-center text-lg sm:text-xl font-black text-blue-800 mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl mr-4 shadow-lg">
                          <MapPin size={24} className="text-white" />
                        </div>
                        🏙️ Ciudad *
                      </label>
                      <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                        className={cn(
                          'w-full px-6 py-4 rounded-xl border-4 text-lg font-bold shadow-lg transition-all duration-300',
                          'bg-white placeholder:text-gray-400 text-gray-800',
                          'focus:bg-white focus:shadow-2xl focus:scale-[1.02] transform',
                          validationErrors.city 
                            ? 'border-red-500 focus:border-red-600' 
                            : 'border-yellow-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-300/50',
                          'hover:shadow-xl hover:border-blue-500'
                        )}
                        placeholder="Tu ciudad"
                      />
                      {validationErrors.city && (
                        <p className="text-red-700 text-sm mt-3 font-bold">{validationErrors.city}</p>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 via-white to-red-50 p-4 sm:p-6 rounded-2xl border-4 border-purple-400 shadow-2xl">
                      <label className="flex items-center text-lg sm:text-xl font-black text-purple-800 mb-4">
                        <div className="bg-purple-600 p-3 rounded-xl mr-4 shadow-lg">
                          <MapPin size={24} className="text-white" />
                        </div>
                        🗺️ Estado
                      </label>
                      <select
                        value={customerData.state}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-6 py-4 rounded-xl border-4 border-yellow-400 text-lg font-bold bg-white text-gray-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-300/50 shadow-lg hover:shadow-xl hover:border-purple-500 transition-all duration-300"
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