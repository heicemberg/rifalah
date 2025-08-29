'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Check, Loader2, AlertCircle, Shield, Users, Clock, Star, Zap, Award, Lock } from 'lucide-react';
import { useTickets, useTicketActions, useCheckout } from '../stores/raffle-store';
import { formatPrice, validateEmail, validateWhatsApp } from '../lib/utils';
import { useOCRProcessor, type ReceiptData } from '../lib/ocr-processor';
import toast from 'react-hot-toast';

interface CompactPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QuickOption {
  tickets: number;
  price: number;
  discount: number;
  popular: boolean;
  desc: string;
  badge?: string;
  conversion: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  { tickets: 1, price: 50, discount: 0, popular: false, desc: '¡Empieza ahora!', badge: '🎯 FÁCIL', conversion: 'Solo $50 pesos' },
  { tickets: 5, price: 225, discount: 10, popular: false, desc: '¡5x más chances!', badge: '💪 INTELIGENTE', conversion: 'Ahorras $25' },
  { tickets: 10, price: 400, discount: 20, popular: true, desc: '¡10x oportunidad!', badge: '🔥 MÁS ELEGIDO', conversion: 'Ahorras $100' },
  { tickets: 25, price: 750, discount: 40, popular: false, desc: '¡Máxima ventaja!', badge: '👑 PRO', conversion: 'Ahorras $500' }
];

const PAYMENT_METHODS = [
  {
    id: 'binance',
    name: 'Binance',
    icon: '/logos/binance.svg',
    account: 'binancerifa2024@gmail.com',
    details: '📱 Envía desde Binance\n📧 A: binancerifa2024@gmail.com\n📝 Concepto: RifaBoletos\n\n✨ Confirmación inmediata',
    badge: '🚀 RÁPIDO'
  },
  {
    id: 'bancoppel',
    name: 'BanCoppel',
    icon: '/logos/bancoppel.png',
    account: '4169 1598 7643 2108',
    details: '🏦 App BanCoppel\n💳 4169 1598 7643 2108\n👤 MARIA GONZALEZ\n📝 Concepto: RIFA',
    badge: '🏆 SEGURO'
  },
  {
    id: 'bancoazteca',
    name: 'Banco Azteca',
    icon: '/logos/bancoazteca.png',
    account: '5204 8765 4321 0987',
    details: '🏦 App Banco Azteca\n💳 5204 8765 4321 0987\n👤 MARIA GONZALEZ\n📝 Concepto: BOLETOS',
    badge: '💰 POPULAR'
  },
  {
    id: 'oxxo',
    name: 'OXXO',
    icon: '/logos/oxxo.png',
    account: 'RIFA2024001',
    details: '🏦 Cualquier OXXO\n📝 Ref: RIFA2024001\n💰 Monto exacto\n\n🕰️ 24/7 disponible',
    badge: '🎆 24/7'
  }
];

const CompactPurchaseModal: React.FC<CompactPurchaseModalProps> = ({ isOpen, onClose }) => {
  const { quickSelect } = useTicketActions();
  const { setCustomerData, setCurrentStep } = useCheckout();
  const [step, setStep] = useState<'select' | 'details' | 'payment' | 'upload'>('select');
  const [selectedOption, setSelectedOption] = useState(QUICK_OPTIONS[2]); // Default: 10 tickets
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrData, setOcrData] = useState<ReceiptData | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes urgency timer
  const [showingOthers, setShowingOthers] = useState(Math.floor(Math.random() * 8) + 12); // 12-19 people viewing
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { processFile, cleanup } = useOCRProcessor();

  // Urgency timer effect
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 900; // Reset timer
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Simulate live activity
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setShowingOthers(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newVal = prev + change;
        return Math.max(8, Math.min(23, newVal)); // Keep between 8-23
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup OCR on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  if (!isOpen) return null;

  const handleQuickSelect = (option: typeof QUICK_OPTIONS[0]) => {
    setSelectedOption(option);
    quickSelect(option.tickets);
    setStep('details');
  };

  const handleCustomerSubmit = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!customerInfo.name?.trim()) {
      newErrors.name = 'Nombre requerido';
    } else if (customerInfo.name.trim().length < 2) {
      newErrors.name = 'Mínimo 2 caracteres';
    }
    
    if (!customerInfo.email?.trim()) {
      newErrors.email = 'Email requerido';
    } else if (!validateEmail(customerInfo.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!customerInfo.whatsapp?.trim()) {
      newErrors.whatsapp = 'WhatsApp requerido';
    } else if (!validateWhatsApp(customerInfo.whatsapp)) {
      newErrors.whatsapp = 'Formato: +52XXXXXXXXXX';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Por favor corrige los errores');
      return;
    }
    
    setErrors({});
    setCustomerData({
      name: customerInfo.name.trim(),
      whatsapp: customerInfo.whatsapp.trim(),
      email: customerInfo.email.trim(),
      paymentMethod: selectedPayment.id as any,
      totalAmount: selectedOption.price
    });
    
    setStep('payment');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }
    
    // Validar tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es muy grande (máx 10MB)');
      return;
    }
    
    setUploadedFile(file);
    setIsProcessing(true);
    
    try {
      // Procesar con OCR
      const ocrResult = await processFile(file, selectedOption.price);
      setOcrData(ocrResult);
      
      if (ocrResult.confidence > 70) {
        toast.success(`Comprobante procesado (${ocrResult.confidence}% confianza)`);
        
        // Auto-confirmar si alta confianza y monto correcto
        if (ocrResult.amount && Math.abs(ocrResult.amount - selectedOption.price) <= 5) {
          setTimeout(() => {
            toast.success('¡Compra confirmada automáticamente!');
            handlePurchaseSuccess();
          }, 2000);
        }
      } else {
        toast('Comprobante subido - Requiere verificación manual', {
          icon: '⚠️',
          style: { background: '#fef3c7', color: '#92400e' }
        });
        setTimeout(() => {
          toast.success('¡Compra registrada! Te confirmaremos en breve');
          handlePurchaseSuccess();
        }, 3000);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast('Comprobante subido - Se verificará manualmente', {
        icon: '⚠️',
        style: { background: '#fef3c7', color: '#92400e' }
      });
      setTimeout(() => {
        toast.success('¡Compra registrada! Te confirmaremos pronto');
        handlePurchaseSuccess();
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePurchaseSuccess = () => {
    onClose();
    setTimeout(() => {
      setStep('select');
      setUploadedFile(null);
      setOcrData(null);
      setIsProcessing(false);
      setCustomerInfo({ name: '', whatsapp: '', email: '' });
      setErrors({});
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Enhanced Header with Urgency & Social Proof */}
        <div className="relative">
          {/* Urgency Banner */}
          {step === 'select' && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2 px-4 font-bold text-sm animate-pulse">
              ⏰ OFERTA ESPECIAL TERMINA EN: {formatTime(timeLeft)} • Solo quedan {Math.floor(Math.random() * 150) + 50} boletos en descuento
            </div>
          )}
          
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {step === 'select' && '🎫 ¡Asegura tu Boleto Ganador!'}
                {step === 'details' && '📝 Últimos Datos (Paso 2/4)'}
                {step === 'payment' && '💳 Pago Seguro (Paso 3/4)'}
                {step === 'upload' && '📸 Confirmación (Paso 4/4)'}
              </h2>
              
              {/* Live Social Proof */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{showingOthers} personas viendo</span>
                </div>
                
                <div className="flex items-center gap-1 text-blue-600">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">100% Seguro</span>
                </div>
                
                {step !== 'select' && (
                  <div className="flex items-center gap-1 text-purple-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Boletos reservados por 30min</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors ml-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Step 1: Enhanced Ticket Selection */}
          {step === 'select' && (
            <div className="space-y-5">
              {/* Compelling Headline */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  ¡Más Boletos = Más Oportunidades de Ganar! 🎯
                </h3>
                <p className="text-gray-600 text-sm">
                  <strong>🚀 Miles ya están participando</strong> • Elige tu estrategia ganadora
                </p>
              </div>

              {/* Trust Badges Row */}
              <div className="flex justify-center gap-4 py-2">
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Pago Seguro
                </div>
                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Zap className="w-3 h-3" />
                  Entrega Inmediata
                </div>
                <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  <Award className="w-3 h-3" />
                  100% Verificado
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {QUICK_OPTIONS.map((option, index) => (
                  <button
                    key={option.tickets}
                    onClick={() => handleQuickSelect(option)}
                    className={`relative bg-gradient-to-br border-2 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-xl hover:scale-105 transform ${
                      option.popular 
                        ? 'from-yellow-50 to-orange-50 border-yellow-400 ring-2 ring-yellow-300 shadow-lg animate-pulse-slow' 
                        : 'from-white to-gray-50 border-gray-200 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100'
                    }`}
                  >
                    {/* Enhanced Popular Badge */}
                    {option.popular && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce">
                        ⭐ MÁS ELEGIDO
                      </div>
                    )}

                    {/* Custom Badge */}
                    {option.badge && (
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                        {option.badge}
                      </div>
                    )}
                    
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      {option.tickets}
                    </div>
                    
                    <div className="text-sm font-bold text-gray-800 mb-2">
                      {option.desc}
                    </div>
                    
                    {/* Value Proposition */}
                    <div className="text-xs text-blue-600 font-medium mb-2">
                      {option.conversion}
                    </div>
                    
                    {option.discount > 0 && (
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-md animate-pulse">
                        🔥 DESCUENTO {option.discount}%
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-black bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                        {formatPrice(option.price)}
                      </div>
                      
                      {option.discount > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          Normal: {formatPrice(option.tickets * 50)}
                        </div>
                      )}
                    </div>

                    {/* Winning Odds Visual */}
                    <div className="mt-2 flex justify-center">
                      {[...Array(Math.min(option.tickets, 5))].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                      ))}
                      {option.tickets > 5 && (
                        <span className="text-yellow-600 text-xs font-bold ml-1">+{option.tickets - 5}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Bottom Value Props */}
              <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 text-center space-y-2">
                <h4 className="font-bold text-gray-800 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  ¿Por qué elegir más boletos?
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span><strong>Más chances de ganar</strong> la camioneta del año</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span><strong>Descuentos automáticos</strong> por volumen</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span><strong>Números aleatorios</strong> seleccionados por ti</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Enhanced Customer Details */}
          {step === 'details' && (
            <div className="space-y-5">
              {/* Purchase Summary with Excitement */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 text-center shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 animate-pulse"></div>
                <div className="relative">
                  <h3 className="text-green-800 font-bold text-xl mb-2">
                    🎉 ¡Excelente Elección!
                  </h3>
                  <p className="text-green-700 font-bold text-lg">
                    {selectedOption.tickets} boletos por {formatPrice(selectedOption.price)}
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <Clock className="w-4 h-4" />
                      <span>Reservados por 30min</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                      <Zap className="w-4 h-4" />
                      <span>Números automáticos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gray-100 rounded-full h-2 relative overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out" 
                     style={{width: '50%'}}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
              <p className="text-center text-sm font-medium text-gray-600">
                Paso 2 de 4 • <span className="text-blue-600">¡Solo falta tu información!</span>
              </p>

              {/* Security & Trust Messaging */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-700 font-medium text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Tus datos están 100% seguros y encriptados</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    ¿Cuál es tu nombre completo?
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({...prev, name: ''}));
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg ${
                      errors.name ? 'border-red-300 bg-red-50' : 
                      customerInfo.name ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                    placeholder="Ejemplo: María González López"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                  {customerInfo.name && !errors.name && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      ¡Perfecto! 👍
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    Tu WhatsApp (para confirmar tu ganancia)
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.whatsapp}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, whatsapp: e.target.value }));
                      if (errors.whatsapp) setErrors(prev => ({...prev, whatsapp: ''}));
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg ${
                      errors.whatsapp ? 'border-red-300 bg-red-50' : 
                      customerInfo.whatsapp && !errors.whatsapp ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                    placeholder="+52 55 1234 5678"
                  />
                  {errors.whatsapp && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.whatsapp}
                    </p>
                  )}
                  {customerInfo.whatsapp && !errors.whatsapp && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      ¡Te contactaremos aquí cuando ganes! 🎉
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    Email (para enviar tus boletos)
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors(prev => ({...prev, email: ''}));
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-lg ${
                      errors.email ? 'border-red-300 bg-red-50' : 
                      customerInfo.email && !errors.email ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                  {customerInfo.email && !errors.email && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      ¡Recibirás tus boletos instantáneamente! 📧
                    </p>
                  )}
                </div>
              </div>

              {/* Enhanced CTA Button */}
              <button
                onClick={handleCustomerSubmit}
                disabled={!customerInfo.name || !customerInfo.whatsapp || !customerInfo.email}
                className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 text-lg relative overflow-hidden ${
                  !customerInfo.name || !customerInfo.whatsapp || !customerInfo.email
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white hover:from-green-600 hover:via-emerald-600 hover:to-green-700 hover:shadow-xl hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    💳
                  </div>
                  <span>¡Ir al Pago Seguro!</span>
                  <div className="flex">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce mx-1" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
                {customerInfo.name && customerInfo.whatsapp && customerInfo.email && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                )}
              </button>

              {/* Trust Footer */}
              <div className="text-center text-xs text-gray-500 space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  Información encriptada con SSL 256-bit
                </p>
                <p>✨ Proceso de compra 100% seguro y verificado</p>
              </div>
            </div>
          )}

          {/* Step 3: Enhanced Payment Method */}
          {step === 'payment' && (
            <div className="space-y-5">
              {/* Payment Summary with Urgency */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-green-300 rounded-xl p-4 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 to-green-100/30 animate-pulse"></div>
                <div className="relative">
                  <h3 className="text-green-800 font-bold text-xl mb-2">
                    💰 ¡Solo falta el pago final!
                  </h3>
                  <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatPrice(selectedOption.price)}
                  </div>
                  <p className="text-green-700 font-medium mt-1">
                    Por {selectedOption.tickets} boletos con números automáticos
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-orange-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">Boletos reservados por {formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gray-100 rounded-full h-2 relative overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out" 
                     style={{width: '75%'}}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
              <p className="text-center text-sm font-medium text-gray-600">
                Paso 3 de 4 • <span className="text-green-600">¡Casi terminamos! Elige tu método preferido</span>
              </p>

              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-center text-lg">
                  💳 Elige tu método de pago favorito:
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`p-3 border-2 rounded-lg transition-all duration-200 relative ${
                        selectedPayment.id === method.id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {method.badge && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-1 py-0.5 rounded-full text-[10px]">
                          {method.badge.split(' ')[1] || method.badge}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md border">
                            <Image
                              src={method.icon}
                              alt={method.name}
                              width={32}
                              height={32}
                              className="rounded"
                            />
                          </div>
                          <div className="text-left">
                            <span className="font-bold text-gray-800 text-lg">{method.name}</span>
                            <p className="text-sm text-gray-600">Pago seguro y confiable</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedPayment.id === method.id
                            ? 'bg-blue-500 border-blue-500 scale-110'
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment.id === method.id && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enhanced Payment Details */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5 shadow-lg">
                <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    💳
                  </div>
                  Instrucciones de Pago - {selectedPayment.name}
                </h4>
                <div className="space-y-4">
                  {selectedPayment.id === 'binance' ? (
                    <div className="bg-white rounded-xl p-4 text-center border-2 border-blue-200 shadow-sm">
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-3 shadow-inner">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📱</div>
                          <span className="text-blue-600 text-sm font-medium">Código QR Binance</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">Escanea con tu app Binance Pay</p>
                    </div>
                  ) : null}
                  
                  <div 
                    className="bg-white border-2 border-dashed border-blue-400 rounded-xl p-4 cursor-pointer hover:bg-blue-50 transition-all transform hover:scale-102 shadow-sm"
                    onClick={() => copyToClipboard(selectedPayment.account)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-800 text-lg break-all">{selectedPayment.account}</p>
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all">
                        📋 COPIAR
                      </div>
                    </div>
                    <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Toca para copiar automáticamente al portapapeles
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                    <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed font-medium">
                      {selectedPayment.details}
                    </div>
                  </div>

                  {/* Security Reminder */}
                  <div className="bg-green-100 border border-green-200 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-green-700 font-medium text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Pago 100% seguro • Nunca compartas tu información bancaria</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced CTA Button */}
              <button
                onClick={() => setStep('upload')}
                className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-green-600 hover:via-emerald-600 hover:to-green-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    ✅
                  </div>
                  <span>¡Ya Pagué! Subir Comprobante</span>
                  <div className="flex">
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce mx-1" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </button>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <p className="flex items-center justify-center gap-1 font-medium">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  ¿Necesitas ayuda? Contacta por WhatsApp: <span className="text-blue-600 font-bold">+52 55 1234-5678</span>
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Enhanced Upload Receipt */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Final Step Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-white text-2xl">🎉</div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ¡Último Paso para Ganar!
                </h3>
                <p className="text-gray-600 text-lg">
                  Sube tu comprobante y <span className="font-bold text-green-600">¡listo!</span>
                </p>
              </div>

              {/* Progress Indicator - Complete */}
              <div className="bg-gray-100 rounded-full h-3 relative overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                     style={{width: '100%'}}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
              <p className="text-center text-sm font-bold text-green-600 animate-pulse">
                ✅ Paso 4 de 4 • ¡Proceso casi completado!
              </p>

              {/* Upload Area */}
              <div
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-102 ${
                  isProcessing ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 cursor-not-allowed' :
                  uploadedFile ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg' :
                  'border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer shadow-md hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-blue-500 mx-auto animate-spin" />
                      <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-25"></div>
                    </div>
                    <h4 className="text-blue-700 font-bold text-lg">
                      🤖 Procesando tu comprobante...
                    </h4>
                    <p className="text-sm text-blue-600">
                      ✨ Tecnología OCR extrayendo datos automáticamente
                    </p>
                    <div className="flex justify-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Check className="w-16 h-16 text-green-500 mx-auto" />
                      <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse opacity-50"></div>
                    </div>
                    <h4 className="text-green-700 font-bold text-lg">
                      ✅ ¡Comprobante Subido!
                    </h4>
                    <p className="text-green-600 font-medium">
                      📄 {uploadedFile.name}
                    </p>
                    {ocrData && (
                      <div className="bg-white rounded-xl p-4 shadow-inner border border-green-200">
                        <h5 className="font-bold text-gray-800 mb-2">📊 Datos Extraídos:</h5>
                        {ocrData.amount && (
                          <p className="text-green-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            💰 Monto: <span className="font-bold">${ocrData.amount}</span>
                          </p>
                        )}
                        {ocrData.bank && (
                          <p className="text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            🏦 Banco: <span className="font-medium">{ocrData.bank}</span>
                          </p>
                        )}
                        <div className={`mt-2 p-2 rounded-lg ${
                          ocrData.confidence > 70 ? 'bg-green-100 text-green-800' :
                          ocrData.confidence > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {ocrData.confidence > 70 ? '🎯' : ocrData.confidence > 50 ? '⚠️' : '❌'}
                            Precisión: {ocrData.confidence}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                      <div className="absolute -inset-2 bg-blue-100 rounded-full opacity-0 animate-pulse"></div>
                    </div>
                    <h4 className="text-gray-700 font-bold text-xl">
                      📸 Subir Comprobante de Pago
                    </h4>
                    <div className="space-y-2">
                      <p className="text-gray-600 font-medium">
                        Arrastra tu imagen o toca para seleccionar
                      </p>
                      <p className="text-sm text-gray-500">
                        📱 JPG, PNG • Máximo 10MB
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3 text-sm">
                      <p className="text-blue-700 font-medium flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4" />
                        ✨ Procesamiento automático con IA
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
              />

              {/* Verification Status */}
              <div className={`border-2 rounded-xl p-4 text-center ${
                ocrData?.confidence && ocrData.confidence > 70 ? 
                'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-lg' : 
                'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
              }`}>
                <div className={`text-lg font-bold mb-2 ${
                  ocrData?.confidence && ocrData.confidence > 70 ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {ocrData?.confidence && ocrData.confidence > 70 ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        ✅
                      </div>
                      <span>¡Verificación Automática Exitosa!</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        ⏱️
                      </div>
                      <span>Verificación Manual en Proceso</span>
                    </div>
                  )}
                </div>
                
                <div className={`text-sm ${
                  ocrData?.confidence && ocrData.confidence > 70 ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {ocrData?.confidence && ocrData.confidence > 70 ? (
                    <div className="space-y-2">
                      <p className="font-medium">🎉 ¡Tu compra se confirmó instantáneamente!</p>
                      <p>Recibirás tus boletos por email en los próximos 5 minutos</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium">📋 Tu compra será verificada en 5-30 minutos</p>
                      <p>Te notificaremos por WhatsApp cuando esté confirmada</p>
                    </div>
                  )}
                </div>

                {ocrData?.confidence && ocrData.confidence <= 70 && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-xs text-orange-700 bg-orange-100 rounded-lg p-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Nuestro equipo revisará manualmente tu pago</span>
                  </div>
                )}
              </div>

              {/* Success Actions */}
              {uploadedFile && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 text-center">
                    <h4 className="font-bold text-blue-800 mb-2 flex items-center justify-center gap-2">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">ℹ️</div>
                      ¿Qué sigue ahora?
                    </h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>📧 Enviaremos tus boletos por email</span>
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>📱 Confirmación por WhatsApp</span>
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>🎯 ¡Ya participas en el sorteo!</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Support */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-600 font-medium">
                      💬 ¿Dudas? Escríbenos a WhatsApp: 
                      <span className="text-green-600 font-bold ml-1">+52 55 1234-5678</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactPurchaseModal;