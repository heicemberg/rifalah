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

                <div className="space-y-4">
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedPaymentMethod(method.id);
                          setShowPaymentDetails(showPaymentDetails === method.id ? '' : method.id);
                        }}
                        className={cn(
                          'w-full p-4 sm:p-6 rounded-xl border-2 text-left transition-all',
                          'hover:shadow-lg active:scale-98 min-h-[80px]',
                          selectedPaymentMethod === method.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center space-x-4 sm:space-x-6">
                          <div className="flex-shrink-0">
                            <img
                              src={method.icon}
                              alt={method.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-bold text-gray-800 text-base sm:text-lg">
                                {method.name}
                              </span>
                              {method.enabled && (
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                  Disponible
                                </span>
                              )}
                            </div>
                            <p className="text-sm sm:text-base text-gray-600 leading-tight">
                              Cuenta: {method.account}
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex items-center space-x-2">
                            {selectedPaymentMethod === method.id && (
                              <CheckCircle size={20} className="text-blue-500 sm:w-6 sm:h-6" />
                            )}
                            <ArrowRight 
                              size={16} 
                              className={cn(
                                'text-gray-400 transition-transform',
                                showPaymentDetails === method.id ? 'rotate-90' : ''
                              )} 
                            />
                          </div>
                        </div>
                      </button>

                      {/* Datos desplegables del método de pago */}
                      {showPaymentDetails === method.id && (
                        <div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <FileText size={16} />
                            Información para transferir
                          </h4>
                          <div className="space-y-3 text-sm">
                            {method.accountDetails?.split('\n').map((line, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                <span className="text-gray-700 font-mono">{line}</span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(line.split(': ')[1] || line);
                                    setCopiedField(`${method.id}-${index}`);
                                    setTimeout(() => setCopiedField(''), 2000);
                                  }}
                                  className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
                                >
                                  {copiedField === `${method.id}-${index}` ? (
                                    <Check size={14} className="text-green-600" />
                                  ) : (
                                    <Copy size={14} className="text-gray-500" />
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                              💡 <strong>Importante:</strong> Envía tu comprobante de pago por WhatsApp después de transferir.
                            </p>
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

                <div className="space-y-6">
                  {/* Nombre completo */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <label className="flex items-center text-sm font-bold text-blue-800 mb-3">
                      <div className="bg-blue-500 p-2 rounded-lg mr-3">
                        <Users size={16} className="text-white" />
                      </div>
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-4 rounded-xl border-2 text-base font-medium shadow-sm',
                        'bg-white/80 backdrop-blur-sm transition-all duration-200',
                        validationErrors.name 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200' 
                          : 'border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200',
                        'hover:bg-white hover:shadow-md'
                      )}
                      placeholder="Ej: Juan Pérez García"
                    />
                    {validationErrors.name && (
                      <p className="text-red-600 text-sm mt-2 font-medium flex items-center">
                        <X size={14} className="mr-1" />
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <label className="flex items-center text-sm font-bold text-green-800 mb-3">
                      <div className="bg-green-500 p-2 rounded-lg mr-3">
                        <Phone size={16} className="text-white" />
                      </div>
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-4 rounded-xl border-2 text-base font-medium shadow-sm',
                        'bg-white/80 backdrop-blur-sm transition-all duration-200',
                        validationErrors.phone 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200' 
                          : 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-200',
                        'hover:bg-white hover:shadow-md'
                      )}
                      placeholder="Ej: 55 1234 5678"
                    />
                    {validationErrors.phone && (
                      <p className="text-red-600 text-sm mt-2 font-medium flex items-center">
                        <X size={14} className="mr-1" />
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                    <label className="flex items-center text-sm font-bold text-purple-800 mb-3">
                      <div className="bg-purple-500 p-2 rounded-lg mr-3">
                        <Mail size={16} className="text-white" />
                      </div>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                      className={cn(
                        'w-full px-4 py-4 rounded-xl border-2 text-base font-medium shadow-sm',
                        'bg-white/80 backdrop-blur-sm transition-all duration-200',
                        validationErrors.email 
                          ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-200' 
                          : 'border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200',
                        'hover:bg-white hover:shadow-md'
                      )}
                      placeholder="tu@email.com"
                    />
                    {validationErrors.email && (
                      <p className="text-red-600 text-sm mt-2 font-medium flex items-center">
                        <X size={14} className="mr-1" />
                        {validationErrors.email}
                      </p>
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

            {/* Paso 4: Subir Comprobante */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">📸</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Subir comprobante de pago
                  </h3>
                  <p className="text-gray-600">
                    Toma una foto o captura de pantalla de tu transferencia
                  </p>
                </div>

                {/* Área de subida de archivo */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-dashed border-orange-300">
                  <div className="text-center">
                    <div className="mb-4">
                      <div className="bg-orange-500 p-4 rounded-full inline-block mb-4">
                        <Download size={32} className="text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-orange-800 mb-2">
                        Selecciona tu comprobante
                      </h4>
                      <p className="text-orange-700 text-sm mb-4">
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
                      className="cursor-pointer inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl"
                    >
                      <Download size={20} />
                      Seleccionar archivo
                    </label>
                  </div>

                  {/* Preview de la imagen */}
                  {previewUrl && (
                    <div className="mt-6 bg-white p-4 rounded-lg border-2 border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-orange-800 font-bold flex items-center gap-2">
                          <CheckCircle size={16} className="text-green-600" />
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
                          <X size={20} />
                        </button>
                      </div>
                      <img
                        src={previewUrl}
                        alt="Comprobante de pago"
                        className="w-full max-w-md mx-auto rounded-lg shadow-md border border-gray-200"
                      />
                      <p className="text-sm text-gray-600 text-center mt-3">
                        Archivo: {paymentScreenshot?.name}
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

                {/* Resumen de la compra */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Resumen de tu compra
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600">Números:</span>
                      <div className="font-bold text-lg">{selectedTickets.length}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600">Total:</span>
                      <div className="font-bold text-lg text-green-600">{formatPrice(totalPrice)}</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Método de pago:</span>
                      <span className="font-bold">
                        {PAYMENT_METHODS.find((m: PaymentMethodType) => m.id === selectedPaymentMethod)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Comprador:</span>
                      <span className="font-bold">{customerData.name}</span>
                    </div>
                  </div>
                </div>

                {/* Instrucciones finales */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800 flex items-start gap-2">
                    <FileText size={16} className="mt-0.5 flex-shrink-0" />
                    <span>
                      Al finalizar tu compra, recibirás un email de confirmación y tus números 
                      quedarán reservados. Un administrador revisará tu comprobante y confirmará 
                      tu pago en las próximas 24 horas.
                    </span>
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