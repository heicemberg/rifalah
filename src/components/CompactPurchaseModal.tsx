'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Upload, Check, Loader2, AlertCircle, Shield, Users, Clock, Star, Zap, Award, Lock } from 'lucide-react';
import { useTickets, useTicketActions, useCheckout } from '../stores/raffle-store';
import { formatPrice, validateEmail, validateWhatsApp, generateId } from '../lib/utils';
import { useOCRProcessor, type ReceiptData } from '../lib/ocr-processor';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { useRealTimeTickets } from '../hooks/useRealTimeTickets';
import { guardarCompra, obtenerMetadata, type CompraCompleta } from '../lib/supabase';
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
  { tickets: 2, price: 100, discount: 0, popular: false, desc: '¡Échate la suerte!', badge: '🎯 FACILITÓ', conversion: 'Solo $100 pesitos' },
  { tickets: 5, price: 225, discount: 10, popular: false, desc: '¡Más oportunidad de ganar!', badge: '💪 INTELIGENTE', conversion: 'Te ahorras $25 pesos' },
  { tickets: 10, price: 400, discount: 20, popular: true, desc: '¡El más comprado!', badge: '🔥 MÁS ELEGIDO', conversion: 'Te ahorras $100 pesos' },
  { tickets: 25, price: 750, discount: 40, popular: false, desc: '¡Para quien va en serio!', badge: '👑 PRO', conversion: 'Te ahorras $500 pesos' }
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
  const { selectedTickets } = useTickets(); // Obtener tickets seleccionados del store
  const { setCustomerData, setCurrentStep } = useCheckout();
  
  // Hook de Supabase para funciones reales
  const { isConnected, getRealAvailableTickets } = useSupabaseSync();
  
  // Hook para precios correctos
  const { PRECIO_POR_BOLETO_MXN, calculatePrice } = useRealTimeTickets();
  
  // Debug log on every render (dev only)
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 CompactPurchaseModal render - selectedTickets:', selectedTickets, 'isOpen:', isOpen);
  }
  
  const [step, setStep] = useState<'select' | 'details' | 'payment' | 'upload'>('select');
  const [selectedOption, setSelectedOption] = useState(QUICK_OPTIONS[0]); // Default: 2 tickets - más conservador
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    whatsapp: '',
    email: ''
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingPurchase, setIsSavingPurchase] = useState(false);
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

  // Auto-detectar tickets pre-seleccionados cuando se abre el modal
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 CompactPurchaseModal useEffect - isOpen:', isOpen, 'selectedTickets.length:', selectedTickets.length, 'selectedTickets:', selectedTickets);
      console.log('🔍 Current selectedOption:', selectedOption);
    }
    
    if (isOpen && selectedTickets.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Tickets pre-seleccionados detectados. Creando opción personalizada...');
        console.log('✅ selectedTickets:', selectedTickets);
        console.log('✅ Precio calculado:', calculatePrice(selectedTickets.length));
      }
      // Si hay tickets seleccionados, crear una opción personalizada
      const customOption = {
        tickets: selectedTickets.length,
        price: calculatePrice(selectedTickets.length), // Usar precio correcto con descuentos
        discount: 0,
        popular: true,
        desc: `Tus ${selectedTickets.length} números elegidos`,
        badge: '🎯 SELECCIONADOS',
        conversion: `Números: ${selectedTickets.slice(0, 5).map(n => n.toString().padStart(4, '0')).join(', ')}${selectedTickets.length > 5 ? ` +${selectedTickets.length - 5} más` : ''}`
      };
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Opción personalizada creada:', customOption);
      }
      setSelectedOption(customOption);
      setStep('details'); // Saltar directamente a detalles
    } else if (isOpen) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Modal abierto sin selección previa - usando default QUICK_OPTIONS[0]:', QUICK_OPTIONS[0]);
      }
      // Reset al abrir sin selección previa
      setStep('select');
      setSelectedOption(QUICK_OPTIONS[0]); // Consistente con el estado inicial
    }
  }, [isOpen, selectedTickets, calculatePrice]);

  if (!isOpen) return null;

  const handleQuickSelect = (option: typeof QUICK_OPTIONS[0]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🎯 handleQuickSelect called with option:', option);
    }
    setSelectedOption(option);
    // Only call quickSelect if this isn't a pre-selected ticket option
    if (option.badge !== '🎯 SELECCIONADOS') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🎲 Generating new random tickets');
      }
      quickSelect(option.tickets);
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('✋ Skipping quickSelect for pre-selected tickets');
      }
    }
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
          setTimeout(async () => {
            toast.success('¡Compra confirmada automáticamente!');
            await handlePurchaseSuccess();
          }, 2000);
        } else {
          setTimeout(async () => {
            toast.success('¡Compra registrada! Te confirmaremos en breve');
            await handlePurchaseSuccess();
          }, 3000);
        }
      } else {
        toast('Comprobante subido - Requiere verificación manual', {
          icon: '⚠️',
          style: { background: '#fef3c7', color: '#92400e' }
        });
        setTimeout(async () => {
          toast.success('¡Compra registrada! Te confirmaremos en breve');
          await handlePurchaseSuccess();
        }, 3000);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast('Comprobante subido - Se verificará manualmente', {
        icon: '⚠️',
        style: { background: '#fef3c7', color: '#92400e' }
      });
      setTimeout(async () => {
        toast.success('¡Compra registrada! Te confirmaremos pronto');
        await handlePurchaseSuccess();
      }, 2000);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePurchaseSuccess = async () => {
    if (isSavingPurchase) return; // Prevenir doble procesamiento
    
    try {
      setIsSavingPurchase(true);
      
      if (isConnected) {
        // Verificar disponibilidad de tickets
        const availableTickets = await getRealAvailableTickets();
        
        if (selectedTickets.length > 0) {
          // Usuario seleccionó números específicos - verificar que estén disponibles
          const unavailableTickets = selectedTickets.filter(ticket => !availableTickets.includes(ticket));
          if (unavailableTickets.length > 0) {
            toast.error(`Los números ${unavailableTickets.slice(0, 3).join(', ')} ya no están disponibles. Por favor selecciona otros números.`);
            return;
          }
        } else {
          // Números automáticos - verificar que hay suficientes disponibles
          if (availableTickets.length < selectedOption.tickets) {
            toast.error(`Solo hay ${availableTickets.length} tickets disponibles reales. Selecciona menos tickets.`);
            return;
          }
        }
        
        // Preparar datos de la compra completa
        const metadata = obtenerMetadata();
        const [nombre, ...apellidos] = customerInfo.name.trim().split(' ');
        
        if (process.env.NODE_ENV === 'development') {
          console.log('💾 Preparando datos de compra:');
          console.log('- selectedTickets:', selectedTickets);
          console.log('- selectedOption:', selectedOption);
          console.log('- Usando números específicos:', selectedTickets.length > 0);
        }
        
        const datosCompra: CompraCompleta = {
          nombre: nombre,
          apellidos: apellidos.join(' ') || '',
          telefono: customerInfo.whatsapp,
          email: customerInfo.email,
          estado: 'México', // Por defecto
          ciudad: 'Ciudad de México', // Por defecto
          info_adicional: `Compra desde modal compacto - ${selectedOption.tickets} tickets${selectedTickets.length > 0 ? ' (números específicos)' : ' (números automáticos)'}`,
          cantidad_boletos: selectedOption.tickets,
          numeros_boletos: selectedTickets.length > 0 ? selectedTickets : [], // Usar números seleccionados o dejar vacío para asignación automática
          precio_unitario: selectedOption.price / selectedOption.tickets,
          precio_total: selectedOption.price,
          descuento_aplicado: selectedOption.discount,
          metodo_pago: selectedPayment.name,
          referencia_pago: selectedPayment.account,
          captura_comprobante_url: uploadedFile ? uploadedFile.name : undefined,
          ...metadata
        };
        
        console.log('💾 Guardando compra en Supabase:', datosCompra);
        
        // Guardar la compra en Supabase
        const result = await guardarCompra(datosCompra);
        
        console.log('✅ Compra guardada exitosamente:', result);
        toast.success('¡Compra registrada en la base de datos!');
        
        // Actualizar store local también
        setCustomerData({
          id: result.customer.id,
          name: result.customer.name,
          email: result.customer.email,
          whatsapp: result.customer.phone,
          selectedTickets: [], // Se asignarán cuando el admin confirme
          totalAmount: result.purchase.total_amount,
          paymentMethod: result.purchase.payment_method as any,
          status: 'pending',
          createdAt: new Date(result.purchase.created_at || Date.now())
        });
        
      } else {
        // Fallback para modo offline (localStorage)
        console.log('⚠️ Modo offline - Guardando en localStorage');
        
        const compraLocal = {
          id: generateId(),
          nombre: customerInfo.name.split(' ')[0],
          apellidos: customerInfo.name.split(' ').slice(1).join(' '),
          telefono: customerInfo.whatsapp,
          email: customerInfo.email,
          cantidad_boletos: selectedOption.tickets,
          precio_total: selectedOption.price,
          metodo_pago: selectedPayment.name,
          archivo_subido: !!uploadedFile,
          nombre_archivo: uploadedFile?.name || '',
          fecha_compra: new Date().toISOString(),
          estado_compra: 'pendiente',
          timestamp: Date.now()
        };
        
        const comprasExistentes = JSON.parse(localStorage.getItem('compras-registradas') || '[]');
        comprasExistentes.push(compraLocal);
        localStorage.setItem('compras-registradas', JSON.stringify(comprasExistentes));
        
        toast.success('¡Compra registrada localmente!');
      }
      
    } catch (error) {
      console.error('❌ Error al guardar compra:', error);
      toast.error('Error al registrar la compra. Intenta de nuevo.');
      return; // No cerrar el modal si hay error
    } finally {
      setIsSavingPurchase(false);
    }
    
    // Cerrar modal y resetear estado
    onClose();
    setTimeout(() => {
      setStep('select');
      setUploadedFile(null);
      setOcrData(null);
      setIsProcessing(false);
      setIsSavingPurchase(false);
      setCustomerInfo({ name: '', whatsapp: '', email: '' });
      setErrors({});
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-emerald-100">
        {/* Enhanced Header with Urgency & Social Proof */}
        <div className="relative">
          {/* Urgency Banner */}
          {step === 'select' && (
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white text-center py-3 px-4 font-bold text-sm animate-pulse shadow-lg">
              ⏰ PROMOCIÓN SE ACABA EN: {formatTime(timeLeft)} • Solo quedan {Math.floor(Math.random() * 150) + 50} boletos con descuento
            </div>
          )}
          
          <div className="flex items-center justify-between p-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50">
            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                {step === 'select' && '🎫 ¡Elige Tus Números de la Suerte!'}
                {step === 'details' && '📝 Tus Datos (Paso 2/4)'}
                {step === 'payment' && '💳 ¿Cómo Quieres Pagar? (Paso 3/4)'}
                {step === 'upload' && '📸 Confirmación (Paso 4/4)'}
              </h2>
              
              {/* Live Social Proof */}
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1 text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                  <Users className="w-4 h-4" />
                  <span className="font-medium">{showingOthers} personas viendo ahora</span>
                </div>
                
                <div className="flex items-center gap-1 text-teal-600">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">100% Confiable</span>
                </div>
                
                {step !== 'select' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Números apartados por 30 min</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 hover:text-red-600 rounded-xl transition-all duration-200 ml-4 hover:scale-110"
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
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  ¡Más Boletos = Más Oportunidades de Ganar! 🎯
                </h3>
                <p className="text-gray-600 text-sm">
                  <strong className="text-emerald-600">🚀 Miles ya están participando</strong> • Elige tu estrategia ganadora
                </p>
              </div>

              {/* Trust Badges Row */}
              <div className="flex justify-center gap-3 py-2">
                <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 px-3 py-2 rounded-full text-xs font-medium shadow-sm border border-emerald-200">
                  <Shield className="w-3 h-3" />
                  Pago Seguro
                </div>
                <div className="flex items-center gap-1 bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 px-3 py-2 rounded-full text-xs font-medium shadow-sm border border-teal-200">
                  <Zap className="w-3 h-3" />
                  Entrega Inmediata
                </div>
                <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-2 rounded-full text-xs font-medium shadow-sm border border-amber-200">
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
                        ? 'from-amber-50 via-yellow-50 to-orange-50 border-amber-400 ring-2 ring-amber-300 shadow-lg animate-pulse-slow' 
                        : 'from-white to-emerald-50 border-emerald-200 hover:border-emerald-400 hover:from-emerald-50 hover:to-green-100'
                    }`}
                  >
                    {/* Enhanced Popular Badge */}
                    {option.popular && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-bounce border border-amber-300">
                        ⭐ MÁS ELEGIDO
                      </div>
                    )}

                    {/* Custom Badge */}
                    {option.badge && (
                      <div className="absolute -top-2 -left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md border border-emerald-400">
                        {option.badge}
                      </div>
                    )}
                    
                    <div className="text-4xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-1">
                      {option.tickets}
                    </div>
                    
                    <div className="text-sm font-bold text-gray-800 mb-2">
                      {option.desc}
                    </div>
                    
                    {/* Value Proposition */}
                    <div className="text-xs text-emerald-600 font-medium mb-2">
                      {option.conversion}
                    </div>
                    
                    {option.discount > 0 && (
                      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 shadow-md animate-pulse border border-red-400">
                        🔥 DESCUENTO {option.discount}%
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="text-2xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
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
              <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2 shadow-sm">
                <h4 className="font-bold text-gray-800 flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  ¿Por qué elegir más boletos?
                </h4>
                <div className="grid grid-cols-1 gap-2 text-sm text-gray-700">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm"></div>
                    <span><strong>Más chances de ganar</strong> la camioneta del año</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full shadow-sm"></div>
                    <span><strong>Descuentos automáticos</strong> por volumen</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm"></div>
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
              <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 text-center shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-green-100/50 animate-pulse"></div>
                <div className="relative">
                  <h3 className="text-emerald-800 font-bold text-xl mb-2">
                    🎉 ¡Excelente Elección!
                  </h3>
                  <p className="text-emerald-700 font-bold text-lg">
                    {selectedOption.tickets} boletos por {formatPrice(selectedOption.price)}
                  </p>
                  {/* Mostrar números específicos si fueron preseleccionados */}
                  {selectedTickets.length > 0 && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-green-200">
                      <p className="text-emerald-800 text-sm font-bold mb-1">🎯 Tus números elegidos:</p>
                      <p className="text-emerald-700 text-sm font-mono">
                        {selectedTickets.slice(0, 8).map(n => n.toString().padStart(4, '0')).join(' • ')}
                        {selectedTickets.length > 8 && ` • +${selectedTickets.length - 8} más`}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Clock className="w-4 h-4" />
                      <span>Reservados por 30min</span>
                    </div>
                    <div className="flex items-center gap-1 text-teal-600">
                      <Zap className="w-4 h-4" />
                      <span>{selectedTickets.length > 0 ? 'Números específicos' : 'Números automáticos'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gray-100 rounded-full h-3 relative overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm" 
                     style={{width: '50%'}}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
              <p className="text-center text-sm font-medium text-gray-600">
                Paso 2 de 4 • <span className="text-emerald-600">¡Solo falta tu información!</span>
              </p>

              {/* Security & Trust Messaging */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Tus datos están 100% seguros y encriptados</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                    ¿Cuál es tu nombre completo?
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({...prev, name: ''}));
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg ${
                      errors.name ? 'border-red-300 bg-red-50' : 
                      customerInfo.name ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
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
                    <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      ¡Perfecto! 👍
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                    Tu WhatsApp (para confirmar tu ganancia)
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.whatsapp}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, whatsapp: e.target.value }));
                      if (errors.whatsapp) setErrors(prev => ({...prev, whatsapp: ''}));
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg ${
                      errors.whatsapp ? 'border-red-300 bg-red-50' : 
                      customerInfo.whatsapp && !errors.whatsapp ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
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
                    <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      ¡Te contactaremos aquí cuando ganes! 🎉
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                    Email (para enviar tus boletos)
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => {
                      setCustomerInfo(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors(prev => ({...prev, email: ''}));
                    }}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg ${
                      errors.email ? 'border-red-300 bg-red-50' : 
                      customerInfo.email && !errors.email ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
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
                    <p className="text-emerald-600 text-sm mt-2 flex items-center gap-1">
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
                    : 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 hover:shadow-xl hover:scale-105'
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
              <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 rounded-xl p-4 text-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-green-100/30 to-teal-100/30 animate-pulse"></div>
                <div className="relative">
                  <h3 className="text-emerald-800 font-bold text-xl mb-2">
                    💰 ¡Solo falta el pago final!
                  </h3>
                  <div className="text-3xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                    {formatPrice(selectedOption.price)}
                  </div>
                  <p className="text-emerald-700 font-medium mt-1">
                    Por {selectedOption.tickets} boletos {selectedTickets.length > 0 ? 'con tus números elegidos' : 'con números automáticos'}
                  </p>
                  {/* Mostrar números específicos en el resumen de pago */}
                  {selectedTickets.length > 0 && (
                    <div className="mt-2 p-2 bg-white rounded-lg border border-green-200">
                      <p className="text-emerald-800 text-xs font-bold mb-1">Números seleccionados:</p>
                      <p className="text-emerald-700 text-xs font-mono">
                        {selectedTickets.slice(0, 6).map(n => n.toString().padStart(4, '0')).join(' • ')}
                        {selectedTickets.length > 6 && ` • +${selectedTickets.length - 6} más`}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-orange-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">Boletos reservados por {formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="bg-gray-100 rounded-full h-3 relative overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-3 rounded-full transition-all duration-500 ease-out shadow-sm" 
                     style={{width: '75%'}}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
              <p className="text-center text-sm font-medium text-gray-600">
                Paso 3 de 4 • <span className="text-emerald-600">¡Casi terminamos! Elige tu método preferido</span>
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
                      className={`p-3 border-2 rounded-xl transition-all duration-200 relative ${
                        selectedPayment.id === method.id
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      {method.badge && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-1 py-0.5 rounded-full text-[10px] shadow-sm">
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
                            ? 'bg-emerald-500 border-emerald-500 scale-110'
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
              <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5 shadow-lg">
                <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    💳
                  </div>
                  Instrucciones de Pago - {selectedPayment.name}
                </h4>
                <div className="space-y-4">
                  {selectedPayment.id === 'binance' ? (
                    <div className="bg-white rounded-xl p-4 text-center border-2 border-emerald-200 shadow-sm">
                      <div className="w-40 h-40 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-3 shadow-inner">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📱</div>
                          <span className="text-emerald-600 text-sm font-medium">Código QR Binance</span>
                        </div>
                      </div>
                      <p className="text-sm text-emerald-700 font-medium">Escanea con tu app Binance Pay</p>
                    </div>
                  ) : null}
                  
                  <div 
                    className="bg-white border-2 border-dashed border-emerald-400 rounded-xl p-4 cursor-pointer hover:bg-emerald-50 transition-all transform hover:scale-102 shadow-sm"
                    onClick={() => copyToClipboard(selectedPayment.account)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-800 text-lg break-all">{selectedPayment.account}</p>
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all">
                        📋 COPIAR
                      </div>
                    </div>
                    <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      Toca para copiar automáticamente al portapapeles
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                    <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed font-medium">
                      {selectedPayment.details}
                    </div>
                  </div>

                  {/* Security Reminder */}
                  <div className="bg-emerald-100 border border-emerald-200 rounded-lg p-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-medium text-sm">
                      <Shield className="w-4 h-4" />
                      <span>Pago 100% seguro • Nunca compartas tu información bancaria</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced CTA Button */}
              <button
                onClick={() => setStep('upload')}
                className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg relative overflow-hidden"
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
              <div className="text-center text-sm text-gray-600 bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="flex items-center justify-center gap-1 font-medium">
                  <AlertCircle className="w-4 h-4 text-emerald-500" />
                  ¿Necesitas ayuda? Contacta por WhatsApp: <span className="text-emerald-600 font-bold">+52 55 1234-5678</span>
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Enhanced Upload Receipt */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Final Step Header */}
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-white text-2xl">🎉</div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                  ¡Último Paso para Ganar!
                </h3>
                <p className="text-gray-600 text-lg">
                  Sube tu comprobante y <span className="font-bold text-emerald-600">¡listo!</span>
                </p>
              </div>

              {/* Progress Indicator - Complete */}
              <div className="bg-gray-100 rounded-full h-3 relative overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm" 
                     style={{width: '100%'}}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </div>
              <p className="text-center text-sm font-bold text-emerald-600 animate-pulse">
                ✅ Paso 4 de 4 • ¡Proceso casi completado!
              </p>

              {/* Upload Area */}
              <div
                onClick={() => !isProcessing && !isSavingPurchase && fileInputRef.current?.click()}
                className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-102 ${
                  isProcessing || isSavingPurchase ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 cursor-not-allowed' :
                  uploadedFile ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg' :
                  'border-gray-300 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 cursor-pointer shadow-md hover:shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-emerald-500 mx-auto animate-spin" />
                      <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-25"></div>
                    </div>
                    <h4 className="text-emerald-700 font-bold text-lg">
                      🤖 Procesando tu comprobante...
                    </h4>
                    <p className="text-sm text-emerald-600">
                      ✨ Tecnología OCR extrayendo datos automáticamente
                    </p>
                    <div className="flex justify-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Check className="w-16 h-16 text-green-500 mx-auto" />
                      <div className="absolute inset-0 bg-green-200 rounded-full animate-pulse opacity-50"></div>
                    </div>
                    <h4 className="text-emerald-700 font-bold text-lg">
                      ✅ ¡Comprobante Subido!
                    </h4>
                    <p className="text-emerald-600 font-medium">
                      📄 {uploadedFile.name}
                    </p>
                    {ocrData && (
                      <div className="bg-white rounded-xl p-4 shadow-inner border border-green-200">
                        <h5 className="font-bold text-gray-800 mb-2">📊 Datos Extraídos:</h5>
                        {ocrData.amount && (
                          <p className="text-emerald-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            💰 Monto: <span className="font-bold">${ocrData.amount}</span>
                          </p>
                        )}
                        {ocrData.bank && (
                          <p className="text-gray-700 flex items-center gap-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            🏦 Banco: <span className="font-medium">{ocrData.bank}</span>
                          </p>
                        )}
                        <div className={`mt-2 p-2 rounded-lg ${
                          ocrData.confidence > 70 ? 'bg-emerald-100 text-emerald-800' :
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
                ) : isSavingPurchase ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Loader2 className="w-16 h-16 text-emerald-500 mx-auto animate-spin" />
                      <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-25"></div>
                    </div>
                    <h4 className="text-emerald-700 font-bold text-xl">
                      💾 Guardando tu compra...
                    </h4>
                    <p className="text-emerald-600">
                      {isConnected 
                        ? '📡 Registrando en la base de datos...' 
                        : '💾 Guardando localmente...'
                      }
                    </p>
                    <div className="flex justify-center gap-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
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
                    <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg p-3 text-sm">
                      <p className="text-emerald-700 font-medium flex items-center justify-center gap-2">
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
                disabled={isProcessing || isSavingPurchase}
                className="hidden"
              />

              {/* Verification Status */}
              <div className={`border-2 rounded-xl p-4 text-center ${
                ocrData?.confidence && ocrData.confidence > 70 ? 
                'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 shadow-lg' : 
                'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300'
              }`}>
                <div className={`text-lg font-bold mb-2 ${
                  ocrData?.confidence && ocrData.confidence > 70 ? 'text-emerald-800' : 'text-yellow-800'
                }`}>
                  {ocrData?.confidence && ocrData.confidence > 70 ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
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
                  ocrData?.confidence && ocrData.confidence > 70 ? 'text-emerald-700' : 'text-yellow-700'
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
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-center shadow-sm">
                    <h4 className="font-bold text-emerald-800 mb-2 flex items-center justify-center gap-2">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm">ℹ️</div>
                      ¿Qué sigue ahora?
                    </h4>
                    <div className="space-y-2 text-sm text-emerald-700">
                      <p className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span>📧 Enviaremos tus boletos por email</span>
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span>📱 Confirmación por WhatsApp</span>
                      </p>
                      <p className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>🎯 ¡Ya participas en el sorteo!</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Support */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-gray-600 font-medium">
                      💬 ¿Dudas? Escríbenos a WhatsApp: 
                      <span className="text-emerald-600 font-bold ml-1">+52 55 1234-5678</span>
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