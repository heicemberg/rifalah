// ============================================================================
// PREMIUM PURCHASE WIZARD - 5-STEP MODAL WITH SUPABASE INTEGRATION
// Ultra Premium UI/UX with Real-time Validation and Payment Animations
// Fixed: Minimum 2 tickets validation, smooth Framer Motion animations
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
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
  Camera,
  Zap,
  TrendingUp,
  Gift,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '../lib/utils';
import { formatPrice, formatTicketNumber } from '../lib/utils';
import { PAYMENT_METHODS, QUICK_SELECT_OPTIONS, MAIN_CARD_OPTIONS, MIN_TICKETS_PER_PURCHASE } from '../lib/constants';
import type { PaymentMethod as PaymentMethodType } from '../lib/types';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { useLazyCryptoPrice } from '../hooks/useLazyCryptoPrice';
import { useRaffleStore } from '../stores/raffle-store';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface PurchaseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTickets: number[];
  onConfirmPurchase: (customerData: CustomerData, paymentMethod: string) => Promise<void>;
  onQuickSelect: (count: number) => void;
  isProcessing: boolean;
}

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface WizardStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

// ============================================================================
// OPTIMIZED COMPONENTS FOR MAXIMUM PERFORMANCE
// ============================================================================

interface OptimizedQuickSelectCardProps {
  option: { tickets: number; price: number; discount: number; popular?: boolean };
  onSelect: () => void;
  disabled?: boolean;
}

// ✅ ULTRA-OPTIMIZED: High-performance card with robust click handling
const OptimizedQuickSelectCard: React.FC<OptimizedQuickSelectCardProps> = React.memo(({
  option,
  onSelect,
  disabled = false
}) => {
  // ✅ PERFORMANCE: Ultra-robust event handler with multiple event types
  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) {
      console.log(`⚠️ CARD DISABLED: ${option.tickets} boletos`);
      return;
    }

    console.log(`🎯 CARD CLICKED: ${option.tickets} boletos - EJECUTANDO onSelect`);

    // Ejecutar inmediatamente sin condiciones
    try {
      onSelect();
      console.log(`✅ onSelect ejecutado para ${option.tickets} boletos`);
    } catch (error) {
      console.error(`❌ Error ejecutando onSelect:`, error);
    }
  }, [onSelect, disabled, option.tickets]);

  // ✅ FALLBACK: Touch support for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!disabled) {
      console.log(`👆 CARD TOUCHED: ${option.tickets} boletos`);
      onSelect();
    }
  }, [onSelect, disabled, option.tickets]);

  // ✅ PERFORMANCE: Pre-calculated styles to avoid runtime computation
  const isPopular = Boolean(option.popular);
  const baseStyles = useMemo(() => ({
    base: cn(
      'relative overflow-hidden rounded-2xl p-4 sm:p-5 text-center transition-all duration-150 ease-out',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
      'z-10', // Ensure cards are above any background elements
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95',
      isPopular
        ? 'bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300 shadow-lg shadow-amber-400/20'
        : 'bg-white border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
    )
  }), [disabled, isPopular]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={baseStyles.base}
      type="button"
      aria-label={`Seleccionar ${option.tickets} boletos por $${option.price.toLocaleString('es-MX')}`}
    >
      {/* Popular Badge - Simple and efficient */}
      {isPopular && (
        <div className="absolute -top-2 -right-2 z-10 bg-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-md">
          POPULAR
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-3">
        {/* Tickets Count */}
        <div className="space-y-1">
          <div className={cn(
            'text-3xl sm:text-4xl font-black leading-none',
            isPopular 
              ? 'text-amber-700' 
              : 'text-slate-800'
          )}>
            {option.tickets}
          </div>
          <div className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            isPopular 
              ? 'text-amber-600' 
              : 'text-slate-500'
          )}>
            Números
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-1">
          <div className={cn(
            'text-xl sm:text-2xl font-black',
            isPopular 
              ? 'text-emerald-700' 
              : 'text-slate-900'
          )}>
            {formatPrice(option.price)}
          </div>
          
          {/* Discount Badge */}
          {option.discount > 0 && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-slate-400 line-through text-sm">
                {formatPrice(option.tickets * 250)}
              </span>
              <span className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold',
                isPopular
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-red-100 text-red-800'
              )}>
                <TrendingUp size={10} />
                -{option.discount}%
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
});

OptimizedQuickSelectCard.displayName = 'OptimizedQuickSelectCard';

// ============================================================================
// OPTIMIZED PAYMENT METHOD CARD - ULTRA-FAST PERFORMANCE
// ============================================================================

interface OptimizedPaymentMethodCardProps {
  method: any;
  isSelected: boolean;
  onSelect: () => void;
  expanded?: boolean;
  selectedTickets?: number[];
  convertedAmounts?: any;
  cryptoLoading?: boolean;
  lastUpdate?: Date | null;
}

// ✅ ULTRA-OPTIMIZED: Payment method card with instant responsiveness
const OptimizedPaymentMethodCard: React.FC<OptimizedPaymentMethodCardProps> = React.memo(({ 
  method, 
  isSelected, 
  onSelect, 
  expanded = false,
  selectedTickets = [],
  convertedAmounts = {},
  cryptoLoading = false,
  lastUpdate = null
}) => {
  // ✅ PERFORMANCE: Memoized click handler
  const handleClick = useCallback(() => {
    onSelect();
  }, [onSelect]);

  // ✅ PERFORMANCE: Pre-calculated styles - no runtime computation
  const cardStyles = useMemo(() => {
    const base = 'group w-full rounded-2xl border-2 text-center relative overflow-hidden transition-all duration-150 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50';
    
    if (expanded) {
      return cn(base, 'px-6 py-4 min-h-[80px] border-blue-500 bg-blue-50 shadow-lg');
    }
    
    if (isSelected) {
      return cn(base, 'px-4 py-6 min-h-[120px] border-blue-500 bg-blue-50 shadow-lg');
    }
    
    return cn(base, 'px-4 py-6 min-h-[120px] border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md');
  }, [expanded, isSelected]);

  // ✅ PERFORMANCE: Memoized crypto prices for Binance
  const cryptoPricesAvailable = useMemo(() => {
    return method.id === 'binance' && convertedAmounts &&
           convertedAmounts.USDT && convertedAmounts.BTC;
  }, [method.id, convertedAmounts?.USDT, convertedAmounts?.BTC]);

  return (
    <button
      onClick={handleClick}
      className={cardStyles}
      style={{
        transform: 'translateZ(0)', // GPU acceleration
      }}
      onMouseEnter={(e) => {
        if (!expanded) {
          e.currentTarget.style.transform = 'translateZ(0) scale(1.02)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateZ(0) scale(1)';
      }}
    >
      {/* Selection Indicator - Simple and efficient */}
      {isSelected && !expanded && (
        <div className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
          <CheckCircle size={14} className="text-white" />
        </div>
      )}

      <div className={cn(
        'flex items-center justify-center h-full',
        expanded ? 'flex-row gap-4' : 'flex-col space-y-3'
      )}>
        {/* Logo Container - Simplified */}
        <div className={cn(
          'flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-100',
          expanded ? 'w-16 h-16 p-3' : 'w-full py-4 px-6'
        )}>
          <img
            src={method.icon}
            alt={method.name}
            className={cn(
              'object-contain',
              expanded 
                ? (method.id === 'binance' ? 'max-w-12 max-h-12' : 'max-w-8 max-h-8')
                : (method.id === 'binance' ? 'max-w-full max-h-[80px]' : 'max-w-full max-h-[60px]')
            )}
          />
        </div>
        
        {/* Payment Method Info */}
        <div className={cn(
          'text-center',
          expanded ? 'flex-1 text-left' : ''
        )}>
          <div className="font-black text-slate-900 text-base group-hover:text-blue-700 transition-colors duration-150">
            {method.name}
          </div>
          
          {/* Binance Price Display - Optimized */}
          {method.id === 'binance' && (
            <div className="mt-2 space-y-1">
              {cryptoLoading ? (
                <div className="text-sm font-medium text-blue-600">
                  Calculando precios...
                </div>
              ) : convertedAmounts ? (
                expanded ? (
                  // Expanded view - more crypto details
                  <div className="space-y-2 bg-gradient-to-r from-emerald-50 to-blue-50 p-3 rounded-xl border border-emerald-200/50">
                    <div className="text-xs font-bold text-emerald-800 mb-2">
                      💰 Equivalencias en criptomonedas:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/80 p-2 rounded-lg">
                        <div className="font-bold text-emerald-700">≈ {convertedAmounts.USDT?.toFixed(2)}</div>
                        <div className="text-slate-600">USDT</div>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <div className="font-bold text-orange-600">≈ {convertedAmounts.BTC?.toFixed(6)}</div>
                        <div className="text-slate-600">BTC</div>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <div className="font-bold text-blue-600">≈ {convertedAmounts.ETH?.toFixed(4)}</div>
                        <div className="text-slate-600">ETH</div>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <div className="font-bold text-purple-600">≈ {convertedAmounts.SOL?.toFixed(2)}</div>
                        <div className="text-slate-600">SOL</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Compact view - main cryptos only
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-emerald-700">
                      ≈ {convertedAmounts.USDT?.toFixed(2)} USDT
                    </div>
                    <div className="text-xs text-slate-600">
                      ≈ {convertedAmounts.BTC?.toFixed(6)} BTC
                    </div>
                  </div>
                )
              ) : (
                <div className="text-xs text-amber-600 font-medium">
                  Precios no disponibles
                </div>
              )}
              {lastUpdate && (
                <div className="text-xs text-slate-500">
                  Actualizado: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
});

OptimizedPaymentMethodCard.displayName = 'OptimizedPaymentMethodCard';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

// ✅ PERFORMANCE: Memoized PurchaseWizard for optimal re-renders
const PurchaseWizard: React.FC<PurchaseWizardProps> = React.memo(({
  isOpen,
  onClose,
  selectedTickets,
  onConfirmPurchase,
  onQuickSelect,
  isProcessing
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Obtener precio fijo del store (para cards principales)
  const { fixedPrice } = useRaffleStore();

  // Calculate if tickets are selected (this will update reactively)
  const hasTicketsSelected = selectedTickets.length >= MIN_TICKETS_PER_PURCHASE;
  
  // Initialize step based on tickets - but always allow starting from 0 for quick select
  const [currentStep, setCurrentStep] = useState(() => {
    return hasTicketsSelected ? 1 : 0;
  });
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: 'México'
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [copiedField, setCopiedField] = useState<string>('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSelectingTickets, setIsSelectingTickets] = useState(false);
  
  // Supabase integration for real-time validation
  const { getRealAvailableTickets, isConnected, loading: supabaseLoading } = useSupabaseSync();
  
  // ✅ PERFORMANCE: Lazy crypto loading - only when needed
  const { convertedAmounts, loading: cryptoLoading, error: cryptoError, lastUpdate, activate: activateCrypto, isActive: cryptoActive } = useLazyCryptoPrice(selectedTickets.length * 250);

  // ============================================================================
  // WIZARD CONFIGURATION
  // ============================================================================
  
  const wizardSteps: WizardStep[] = useMemo(() => {
    const baseSteps = [
      {
        number: 0,
        title: 'Selección',
        description: 'Elige tus números',
        icon: <Zap size={16} />,
        color: 'mexican-gold'
      },
      {
        number: 1,
        title: 'Confirmación',
        description: 'Verifica tu selección',
        icon: <CheckCircle size={16} />,
        color: 'mexican-red'
      },
      {
        number: 2,
        title: 'Pago',
        description: 'Método de pago',
        icon: <CreditCard size={16} />,
        color: 'mexican-green'
      },
      {
        number: 3,
        title: 'Datos',
        description: 'Tu información',
        icon: <Users size={16} />,
        color: 'sunset-orange'
      },
      {
        number: 4,
        title: 'Comprobante',
        description: 'Sube tu captura',
        icon: <Camera size={16} />,
        color: 'tequila-amber'
      }
    ];

    return hasTicketsSelected ? baseSteps.slice(1) : baseSteps;
  }, [hasTicketsSelected]);

  // Calcular precio total - priorizar precio fijo de cards principales
  const totalPrice = useMemo(() => {
    const ticketCount = selectedTickets.length;

    // 1. Si hay precio fijo (cards principales), usar ese precio
    if (fixedPrice !== null) {
      console.log('💰 PRECIO FIJO desde cards principales:', fixedPrice);
      return fixedPrice;
    }

    // 2. Si viene del modal wizard, buscar precio con descuento
    const matchingOption = QUICK_SELECT_OPTIONS.find(option => option.tickets === ticketCount);

    if (matchingOption) {
      console.log('💰 PRECIO CON DESCUENTO desde modal wizard:', matchingOption.price);
      return matchingOption.price;
    }

    // 3. Selección manual - precio base sin descuentos
    const basePrice = ticketCount * 250;
    console.log('💰 PRECIO BASE selección manual:', basePrice);
    return basePrice;
  }, [selectedTickets.length, fixedPrice]);

  // Filter main payment methods (4 methods in 2x2 grid)
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

  // ============================================================================
  // EFFECT HOOKS
  // ============================================================================

  // Reset wizard when opening
  useEffect(() => {
    if (isOpen) {
      // Always start at step 0 if no tickets, or step 1 if tickets exist
      const initialStep = selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? 1 : 0;
      setCurrentStep(initialStep);
      setValidationErrors({});
      setSelectedPaymentMethod('');
      setCopiedField('');
      setPaymentScreenshot(null);
      setPreviewUrl('');
      setIsSelectingTickets(false); // Reset click blocking state
      
      console.log('🔄 WIZARD RESET:', {
        isOpen,
        selectedTickets: selectedTickets.length,
        initialStep,
        hasTicketsSelected: selectedTickets.length >= MIN_TICKETS_PER_PURCHASE
      });
    }
  }, [isOpen, selectedTickets.length]);

  // Update step when tickets are selected (from external grid or quick select)
  useEffect(() => {
    console.log('🔄 WIZARD: useEffect triggered - selectedTickets change:', {
      isOpen,
      selectedTicketsLength: selectedTickets.length,
      minRequired: MIN_TICKETS_PER_PURCHASE,
      currentStep,
      isSelectingTickets,
      shouldAdvance: isOpen && selectedTickets.length >= MIN_TICKETS_PER_PURCHASE && currentStep === 0
    });
    
    // Don't proceed if modal is not open
    if (!isOpen) return;
    
    // Always clear isSelectingTickets when selectedTickets changes (means store updated)
    if (isSelectingTickets && selectedTickets.length >= MIN_TICKETS_PER_PURCHASE) {
      console.log('✅ WIZARD: Store updated with tickets, clearing isSelectingTickets');
      setIsSelectingTickets(false);
    }
    
    // ✅ PERFORMANCE: Advance to step 1 instantly when tickets are selected
    if (selectedTickets.length >= MIN_TICKETS_PER_PURCHASE && currentStep === 0) {
      console.log('🚀 WIZARD: Advancing to confirmation step instantly');
      setCurrentStep(1);
    }
  }, [selectedTickets.length, currentStep, isOpen, isSelectingTickets]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // ============================================================================
  // VALIDATION LOGIC
  // ============================================================================

  // ✅ PERFORMANCE: Optimized validation with early returns
  const validateTicketSelection = useCallback(async (): Promise<boolean> => {
    // Early return for basic validation
    if (selectedTickets.length === 0) {
      setValidationErrors({
        tickets: 'Debes seleccionar al menos algunos boletos para continuar.'
      });
      return false;
    }
    
    if (selectedTickets.length < MIN_TICKETS_PER_PURCHASE) {
      setValidationErrors({
        tickets: `Mínimo ${MIN_TICKETS_PER_PURCHASE} boletos requeridos. No se permite comprar 1 solo boleto por razones de equidad en el sorteo.`
      });
      return false;
    }

    // Skip Supabase validation if not connected (performance optimization)
    if (!isConnected) {
      return true;
    }

    // Optimized Supabase validation with timeout
    try {
      const availableTickets = await Promise.race([
        getRealAvailableTickets(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Validation timeout')), 2000)
        )
      ]) as number[];
      
      if (availableTickets.length === 0) {
        setValidationErrors({
          tickets: '¡Lo sentimos! Todos los boletos están agotados. El sorteo ha terminado.'
        });
        return false;
      }
      
      const unavailableSelected = selectedTickets.filter(ticket => 
        !availableTickets.includes(ticket)
      );

      if (unavailableSelected.length > 0) {
        const unavailableFormatted = unavailableSelected.map(t => formatTicketNumber(t)).join(', ');
        setValidationErrors({
          tickets: `Los boletos ${unavailableFormatted} ya no están disponibles. Por favor selecciona otros números disponibles.`
        });
        return false;
      }

      if (availableTickets.length < selectedTickets.length) {
        setValidationErrors({
          tickets: `Solo quedan ${availableTickets.length} boletos disponibles. Selecciona menos números.`
        });
        return false;
      }

    } catch (error) {
      console.warn('Error validating tickets (using fallback):', error);
      // Don't block user for connection issues, allow to proceed
      return true;
    }

    // Clear previous errors if all validation passes
    setValidationErrors(prev => {
      const { tickets, ...rest } = prev;
      return rest;
    });

    return true;
  }, [selectedTickets, isConnected, getRealAvailableTickets]);

  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    const errors: ValidationErrors = {};

    // Step 0: Ticket selection validation
    if (step === 0) {
      return await validateTicketSelection();
    }

    // Step 1: Confirmation (ticket validation)
    if (step === 1) {
      return await validateTicketSelection();
    }

    // Step 2: Payment method
    if (step === 2) {
      if (!selectedPaymentMethod) {
        errors.payment = 'Selecciona un método de pago';
      }
    }

    // Step 3: Customer data
    if (step === 3) {
      if (!customerData.name.trim()) {
        errors.name = 'Ingresa tu nombre completo';
      }
      if (!customerData.email.trim()) {
        errors.email = 'Ingresa tu email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
        errors.email = 'Ingresa un email válido';
      }
      if (!customerData.phone.trim()) {
        errors.phone = 'Ingresa tu teléfono';
      } else if (!/^(\+52|52)?\s?[1-9]\d{9}$/.test(customerData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Ingresa un teléfono válido (10 dígitos)';
      }
      if (!customerData.city.trim()) {
        errors.city = 'Ingresa tu ciudad';
      }
    }

    // Step 4: Payment proof
    if (step === 4) {
      if (!paymentScreenshot) {
        errors.screenshot = 'Sube una captura de pantalla de tu comprobante de pago';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedPaymentMethod, customerData, paymentScreenshot, validateTicketSelection]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationErrors({ screenshot: 'Por favor selecciona una imagen (JPG, PNG, etc.)' });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setValidationErrors({ screenshot: 'La imagen es muy grande. Máximo 10MB.' });
      return;
    }

    setPaymentScreenshot(file);

    // Create preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);

    // Clear errors
    setValidationErrors(prev => {
      const { screenshot, ...rest } = prev;
      return rest;
    });
  }, [previewUrl]);

  const handleNext = useCallback(async () => {
    // Extra validation: never allow advancing from step 1 without tickets
    if (currentStep === 1 && selectedTickets.length < MIN_TICKETS_PER_PURCHASE) {
      setValidationErrors({
        tickets: `Debes seleccionar al menos ${MIN_TICKETS_PER_PURCHASE} boletos antes de continuar.`
      });
      return;
    }
    
    if (await validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, validateStep, selectedTickets.length]);

  const handleBack = useCallback(() => {
    // Calculate minimum step dynamically
    const minStep = selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? 1 : 0;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, selectedTickets.length]);

  const handleFinish = useCallback(async () => {
    if (await validateStep(4)) {
      try {
        await onConfirmPurchase(customerData, selectedPaymentMethod);
      } catch (error) {
        console.error('Error en compra:', error);
      }
    }
  }, [validateStep, onConfirmPurchase, customerData, selectedPaymentMethod]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  }, []);

  // ✅ PERFORMANCE: Optimized instant quick select with enhanced logging
  const handleQuickSelect = useCallback(async (ticketCount: number) => {
    console.log(`🚀 MODAL WIZARD: handleQuickSelect called with ${ticketCount} boletos`);

    // Clear any previous errors
    setValidationErrors({});
    setIsSelectingTickets(true);

    console.log(`⚡ Estado: isSelectingTickets = true para ${ticketCount} boletos`);

    // Validate minimum tickets
    if (ticketCount < MIN_TICKETS_PER_PURCHASE) {
      setValidationErrors({
        quickSelect: `Mínimo ${MIN_TICKETS_PER_PURCHASE} boletos requeridos para participar en el sorteo`
      });
      setIsSelectingTickets(false);
      return;
    }

    try {
      // Optimized: Skip availability check for instant UX
      // The store will handle conflicts automatically
      console.log('🚀 WIZARD: Instant quick select with count:', ticketCount);

      // Call the parent's onQuickSelect function instantly
      onQuickSelect(ticketCount);

      // Clear errors immediately
      setValidationErrors({});

    } catch (error) {
      console.error('Error in quick select:', error);
      setValidationErrors({
        quickSelect: 'Error al seleccionar boletos. Intenta de nuevo.'
      });
    } finally {
      // Always reset selection state
      setIsSelectingTickets(false);
    }
  }, [onQuickSelect]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStepProgress = () => (
    <div className="flex items-center gap-2 sm:gap-3">
      {wizardSteps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div className={cn(
              'w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 ease-out ring-2',
              currentStep > step.number 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ring-emerald-300/40 shadow-lg shadow-emerald-500/20 scale-110' 
                : currentStep === step.number
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-blue-300/40 shadow-lg shadow-blue-500/20 scale-110 animate-pulse'
                : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 ring-slate-200/50 hover:ring-slate-300/60'
            )}>
              {currentStep > step.number ? (
                <CheckCircle size={14} className="animate-in zoom-in-50 duration-300" />
              ) : (
                <span>{selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? step.number : step.number + 1}</span>
              )}
            </div>
          </div>
          {index < wizardSteps.length - 1 && (
            <div className="flex-1 h-2 sm:h-3 mx-1 sm:mx-3 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 shadow-inner overflow-hidden">
              <div className={cn(
                'h-full rounded-full transition-all duration-300 ease-out',
                currentStep > step.number ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm' : 'bg-transparent'
              )} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderPaymentMethodAnimation = () => {
    const selectedMethod = mainPaymentMethods.find(m => m.id === selectedPaymentMethod);
    const unselectedMethods = mainPaymentMethods.filter(m => m.id !== selectedPaymentMethod);

    return (
      <LayoutGroup>
        <AnimatePresence mode="wait">
          {!selectedPaymentMethod ? (
            // Initial 2x2 grid layout
            <motion.div 
              key="grid"
              className="grid grid-cols-2 gap-4 sm:gap-6"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {mainPaymentMethods.map((method, index) => (
                <div key={method.id}>
                  <OptimizedPaymentMethodCard
                    method={method}
                    isSelected={false}
                    onSelect={() => {
                      setSelectedPaymentMethod(method.id);
                      // ✅ PERFORMANCE: Activate crypto only when Binance is selected
                      if (method.id === 'binance' && !cryptoActive) {
                        activateCrypto();
                      }
                    }}
                    selectedTickets={selectedTickets}
                    convertedAmounts={convertedAmounts}
                    cryptoLoading={cryptoLoading}
                    lastUpdate={lastUpdate}
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            // Selected layout: top row (3 small) + bottom expanded
            <motion.div 
              key="selected"
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Top row - small unselected methods */}
              <motion.div 
                className="flex justify-center gap-3"
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.15, delay: 0.02 }}
              >
                {unselectedMethods.map((method, index) => (
                  <motion.button
                    key={method.id}
                    layoutId={method.id}
                    onClick={() => {
                      setSelectedPaymentMethod(method.id);
                      // ✅ PERFORMANCE: Activate crypto when switching to Binance
                      if (method.id === 'binance' && !cryptoActive) {
                        activateCrypto();
                      }
                    }}
                    className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-200/60 bg-gradient-to-br from-white to-slate-50/40 hover:border-blue-300/70 hover:shadow-lg overflow-hidden"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.15, 
                      delay: index * 0.02,
                      ease: "easeOut" 
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      transition: { duration: 0.1 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={method.icon}
                        alt={method.name}
                        className="max-w-8 max-h-8 sm:max-w-10 sm:max-h-10 object-contain filter group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              {/* Bottom - expanded selected method */}
              {selectedMethod && (
                <div key={selectedMethod.id}>
                  <OptimizedPaymentMethodCard
                    method={selectedMethod}
                    isSelected={true}
                    onSelect={() => {}}
                    expanded={true}
                    selectedTickets={selectedTickets}
                    convertedAmounts={convertedAmounts}
                    cryptoLoading={cryptoLoading}
                    lastUpdate={lastUpdate}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    );
  };

  // ============================================================================
  // RENDER CONDITIONS
  // ============================================================================

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* ✅ SOLID BACKDROP: Light background overlay */}
          <motion.div
            className="fixed inset-0 bg-gray-100/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen p-3 sm:p-6">
            {/* ✅ PERFORMANCE: Optimized modal animation */}
            <motion.div 
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
              style={{ maxHeight: '90vh' }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.25, 
                ease: "easeOut"
              }}
            >
          {/* ✅ PERFORMANCE: Optimized modal background */}
          <div className="bg-white/98 rounded-3xl shadow-2xl ring-1 ring-slate-200/60 border border-white/30 overflow-hidden flex flex-col max-h-[90vh]">
          
            {/* Header */}
            {/* ✅ PERFORMANCE: Simplified header background */}
            <div className="shrink-0 bg-gradient-to-r from-slate-50/95 to-white/95 border-b border-slate-200/60 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {currentStep > (selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? 1 : 0) && (
                    <button
                      onClick={handleBack}
                      className="group relative bg-gradient-to-br from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 text-slate-700 p-2 sm:p-2.5 rounded-xl transition-all duration-300 ease-out ring-1 ring-slate-200/50 hover:ring-slate-300/50 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      disabled={isProcessing}
                    >
                      <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                    </button>
                  )}
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {wizardSteps[selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? currentStep - 1 : currentStep]?.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {wizardSteps[selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? currentStep - 1 : currentStep]?.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="group text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-300/50 active:scale-95"
                  disabled={isProcessing}
                >
                  <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
              
              {/* Progress Indicator */}
              {renderStepProgress()}
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              <div className="p-4 sm:p-6 space-y-6">
                
                <AnimatePresence mode="wait">
                  {/* Step 0: Quick Selection */}
                  {currentStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <QuickSelectionStep
                        onQuickSelect={handleQuickSelect}
                        validationError={validationErrors.quickSelect}
                        isSelectingTickets={isSelectingTickets}
                      />
                    </motion.div>
                  )}

                  {/* Step 1: Confirmation */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <ConfirmationStep
                        selectedTickets={selectedTickets}
                        totalPrice={totalPrice}
                        validationError={validationErrors.tickets}
                      />
                    </motion.div>
                  )}

                  {/* Step 2: Payment Methods */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="space-y-8"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.1 }}
                      >
                        <StepHeader
                          icon={<CreditCard size={28} />}
                          title="Elige tu método de pago"
                          description="Selecciona cómo prefieres pagar"
                          color="blue"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                      >
                        {renderPaymentMethodAnimation()}
                      </motion.div>

                      {validationErrors.payment && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ErrorMessage message={validationErrors.payment} />
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 3: Customer Data */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <CustomerDataStep
                        customerData={customerData}
                        onDataChange={setCustomerData}
                        validationErrors={validationErrors}
                        mexicanStates={mexicanStates}
                      />
                    </motion.div>
                  )}

                  {/* Step 4: Payment Proof */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <PaymentProofStep
                        selectedPaymentMethod={selectedPaymentMethod}
                        mainPaymentMethods={mainPaymentMethods}
                        customerData={customerData}
                        selectedTickets={selectedTickets}
                        totalPrice={totalPrice}
                        paymentScreenshot={paymentScreenshot}
                        previewUrl={previewUrl}
                        onFileChange={handleFileChange}
                        onRemoveFile={() => {
                          setPaymentScreenshot(null);
                          setPreviewUrl('');
                          setValidationErrors(prev => {
                        const { screenshot, ...rest } = prev;
                        return rest;
                      });
                        }}
                        validationError={validationErrors.screenshot}
                        copiedField={copiedField}
                        onCopyToClipboard={copyToClipboard}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-slate-200/60 bg-gradient-to-r from-white to-slate-50/80 backdrop-blur-sm px-4 sm:px-6 py-3 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-3 text-xs sm:text-sm">
                  <span className="font-bold text-slate-700">
                    Paso {selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? currentStep : currentStep + 1} de {wizardSteps.length}
                  </span>
                  <div className="relative w-12 sm:w-16 bg-slate-200 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-sm" 
                      style={{ 
                        width: `${((selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? currentStep : currentStep + 1) / wizardSteps.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-slate-500 font-medium">
                    {Math.round(((selectedTickets.length >= MIN_TICKETS_PER_PURCHASE ? currentStep : currentStep + 1) / wizardSteps.length) * 100)}%
                  </span>
                </div>
                
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
                  {currentStep < 4 && currentStep !== 0 && (
                    <button
                      onClick={handleNext}
                      disabled={isProcessing || supabaseLoading}
                      className={cn(
                        'group px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl font-bold text-sm transition-all duration-300',
                        'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white',
                        'hover:shadow-xl hover:shadow-blue-500/20 hover:scale-105 active:scale-95',
                        'focus:outline-none focus:ring-4 focus:ring-blue-300/30',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                        'flex items-center gap-2 ring-1 ring-blue-300/20',
                        'flex-1 sm:flex-initial justify-center'
                      )}
                    >
                      {supabaseLoading ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Validando...</span>
                        </>
                      ) : (
                        <>
                          <span>Continuar</span>
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                        </>
                      )}
                    </button>
                  )}
                  
                  {currentStep === 4 && (
                    <button
                      onClick={handleFinish}
                      disabled={isProcessing}
                      className={cn(
                        'group px-4 sm:px-6 py-2 sm:py-2.5 rounded-2xl font-bold text-sm transition-all duration-300',
                        'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white',
                        'hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-105 active:scale-95',
                        'focus:outline-none focus:ring-4 focus:ring-emerald-300/30',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                        'flex items-center gap-2 ring-1 ring-emerald-300/20',
                        'flex-1 sm:flex-initial justify-center'
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} className="group-hover:scale-110 transition-transform duration-200" />
                          <span>Confirmar Compra</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
});

// ✅ PERFORMANCE: Set display name for debugging
PurchaseWizard.displayName = 'PurchaseWizard';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StepHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const StepHeader: React.FC<StepHeaderProps> = ({ icon, title, description, color }) => (
  <div className="text-center space-y-4">
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-3xl shadow-2xl shadow-${color}-500/30 animate-pulse`} />
      <div className={`relative w-full h-full bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-3xl flex items-center justify-center`}>
        <div className="text-white drop-shadow-lg">
          {icon}
        </div>
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
        {title}
      </h3>
      <p className="text-slate-600 text-base sm:text-lg font-medium">
        {description}
      </p>
    </div>
  </div>
);

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="relative bg-gradient-to-r from-red-50 to-red-100/80 backdrop-blur-sm border border-red-200/60 rounded-2xl p-4 text-center ring-1 ring-red-200/30 animate-in fade-in-50 slide-in-from-top-2 duration-300">
    <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl" />
    <p className="relative text-red-800 text-sm font-bold flex items-center justify-center gap-2">
      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
        <AlertCircle size={12} className="text-white" />
      </div>
      {message}
    </p>
  </div>
);

interface QuickSelectionStepProps {
  onQuickSelect: (count: number) => void;
  validationError?: string;
  isSelectingTickets?: boolean;
}

const QuickSelectionStep: React.FC<QuickSelectionStepProps> = ({ onQuickSelect, validationError, isSelectingTickets }) => (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StepHeader
        icon={<Zap size={28} />}
        title="Compra Rápida"
        description="Elige cuántos números quieres"
        color="emerald"
      />
    </motion.div>

    {validationError && (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ErrorMessage message={validationError} />
      </motion.div>
    )}

    {/* Quick Buy Cards Grid - Enhanced for all cards */}
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {QUICK_SELECT_OPTIONS.map((option, index) => {
        console.log(`🔄 Renderizando card ${index}: ${option.tickets} boletos, disabled: ${isSelectingTickets}`);
        return (
          <OptimizedQuickSelectCard
            key={`quick-${option.tickets}`}
            option={option}
            onSelect={() => {
              console.log(`🎯 onSelect triggered para ${option.tickets} boletos`);
              onQuickSelect(option.tickets);
            }}
            disabled={isSelectingTickets}
          />
        );
      })}
    </div>

    {/* Benefits Section */}
    <div className="relative bg-gradient-to-r from-blue-50 to-blue-100/80 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-6 ring-1 ring-blue-200/30 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl" />
      <div className="relative">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-3 text-lg">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
            ¿Por qué elegir Compra Rápida?
          </span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-blue-800 font-medium">Números asignados al instante</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-blue-800 font-medium">Descuentos automáticos por volumen</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-blue-800 font-medium">Proceso más rápido</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
            <span className="text-blue-800 font-medium">Misma probabilidad de ganar</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface ConfirmationStepProps {
  selectedTickets: number[];
  totalPrice: number;
  validationError?: string;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ selectedTickets, totalPrice, validationError }) => (
  <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
    <StepHeader
      icon={<CheckCircle size={20} />}
      title="Confirma tu selección"
      description={`${selectedTickets.length} número${selectedTickets.length !== 1 ? 's' : ''} seleccionado${selectedTickets.length !== 1 ? 's' : ''}`}
      color="blue"
    />

    {validationError && <ErrorMessage message={validationError} />}

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="group relative bg-gradient-to-br from-slate-50 to-slate-100/80 backdrop-blur-sm rounded-2xl p-6 text-center ring-1 ring-slate-200/50 hover:ring-slate-300/60 hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="text-3xl font-black bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
            {selectedTickets.length}
          </div>
          <div className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
            Números Seleccionados
          </div>
        </div>
      </div>
      <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100/80 backdrop-blur-sm rounded-2xl p-6 text-center ring-1 ring-blue-200/40 hover:ring-blue-300/50 hover:shadow-lg transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative">
          <div className="text-3xl font-black bg-gradient-to-br from-slate-700 to-slate-600 bg-clip-text text-transparent mb-2">
            {formatPrice(totalPrice)}
          </div>
          <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
            Total a Pagar
          </div>
        </div>
      </div>
    </div>
    
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-slate-200/50">
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
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 transition-all duration-200 ring-1 ring-blue-500/30"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {formatTicketNumber(ticket)}
            </span>
          ))}
          {selectedTickets.length > 15 && (
            <span className="bg-gradient-to-r from-slate-400 to-slate-500 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-400/25 ring-1 ring-slate-400/30">
              +{selectedTickets.length - 15} más
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

interface PaymentMethodCardProps {
  method: any;
  isSelected: boolean;
  onSelect: () => void;
  expanded?: boolean;
  animationDelay: number;
  selectedTickets: number[];
  convertedAmounts: any;
  cryptoLoading: boolean;
  lastUpdate: Date | null;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ 
  method, 
  isSelected, 
  onSelect, 
  expanded = false, 
  animationDelay,
  selectedTickets,
  convertedAmounts,
  cryptoLoading,
  lastUpdate
}) => (
  <div className="space-y-3">
    <motion.button
      onClick={onSelect}
      className={cn(
        'group w-full rounded-3xl border-2 text-center relative backdrop-blur-sm overflow-hidden',
        'focus:outline-none focus:ring-4',
        expanded 
          ? 'px-6 py-4 min-h-[80px] border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100/90 ring-4 ring-blue-200/60 shadow-2xl shadow-blue-500/25'
          : 'px-4 py-6 sm:px-6 sm:py-8 min-h-[120px] sm:min-h-[140px]',
        isSelected && !expanded
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/90 ring-4 ring-blue-200/60 shadow-2xl shadow-blue-500/25'
          : !expanded && 'border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/40 hover:border-blue-300/70 hover:shadow-blue-100/30 ring-1 ring-slate-200/30'
      )}
      whileHover={{ 
        scale: expanded ? 1.01 : 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Selection Indicator */}
      {isSelected && !expanded && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur animate-pulse" />
            <div className="relative w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
              <CheckCircle size={16} className="text-white" />
            </div>
          </div>
        </div>
      )}

      <div className={cn(
        'flex items-center justify-center space-y-3 h-full',
        expanded ? 'flex-row gap-4' : 'flex-col'
      )}>
        {/* Logo Container */}
        <div className={cn(
          'relative flex items-center justify-center',
          expanded ? 'w-16 h-16' : 'flex-1 w-full'
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-slate-100/60 rounded-2xl shadow-inner" />
          <div className={cn(
            'relative bg-gradient-to-br from-white to-slate-50/80 rounded-2xl shadow-xl ring-1 ring-slate-200/50 group-hover:shadow-2xl transition-all duration-300 flex items-center justify-center',
            expanded ? 'w-16 h-16 p-4' : 'px-4 py-6 sm:px-6 sm:py-8 w-full h-full'
          )}>
            <img
              src={method.icon}
              alt={method.name}
              className={cn(
                'object-contain filter group-hover:scale-105 transition-transform duration-300',
                expanded 
                  ? (method.id === 'binance' ? 'max-w-12 max-h-12' : 'max-w-8 max-h-8')
                  : (method.id === 'binance' ? 'max-w-full max-h-[100px] sm:max-h-[120px]' : 'max-w-full max-h-[60px] sm:max-h-[80px]')
              )}
            />
          </div>
        </div>
        
        {/* Payment Method Info */}
        <div className={cn(
          'text-center space-y-2',
          expanded ? 'flex-1 text-left' : 'flex-shrink-0'
        )}>
          <div className="font-black text-slate-900 text-sm sm:text-base group-hover:text-blue-700 transition-colors duration-200">
            {method.name}
          </div>
          {method.enabled && (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold shadow-sm ring-1 ring-emerald-200/50">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Disponible 24/7
              </span>
              <div className="text-xs text-slate-600 font-medium">
                {method.id === 'binance' && 'Criptomonedas'}
                {method.id === 'oxxo' && 'Efectivo'}
                {(method.id === 'bancoppel' || method.id === 'bancoazteca') && 'Transferencia'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl pointer-events-none" />
    </motion.button>

    {/* Payment Details */}
    {isSelected && expanded && (
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-slate-200/50 animate-in slide-in-from-top-4 fade-in-50 duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
        <div className="relative space-y-4">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-3 text-base">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <FileText size={16} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {method.id === 'binance' ? 'Montos Exactos en Criptomonedas' : `Datos para ${method.name}`}
            </span>
            {method.id === 'binance' && lastUpdate && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Actualizado: {lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </h4>
          
          {/* Binance Crypto Conversions */}
          {method.id === 'binance' && (
            <div className="space-y-6">
              {/* Total Amount Header - Enhanced */}
              <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl border-2 border-yellow-200/80 shadow-lg ring-1 ring-yellow-300/20">
                <div className="flex items-center gap-3 text-yellow-900 font-bold text-lg mb-2">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-md">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-yellow-900 via-orange-900 to-red-900 bg-clip-text text-transparent">
                    Total: {selectedTickets.length * 250} MXN
                  </span>
                </div>
                <div className="text-base text-yellow-800 font-semibold ml-14">
                  Selecciona tu criptomoneda preferida:
                </div>
              </div>

              {/* 🔥 RECOMENDADAS - Enhanced Section */}
              <div className="mb-8 p-5 bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 rounded-3xl border-2 border-red-200/70 shadow-xl ring-2 ring-red-100/50">
                <div className="flex items-center gap-3 text-red-800 font-black text-base mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg" />
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150 shadow-md" />
                  </div>
                  <span className="bg-gradient-to-r from-red-700 via-orange-700 to-pink-700 bg-clip-text text-transparent">
                    🔥 RECOMENDADAS - RÁPIDAS Y ECONÓMICAS
                  </span>
                </div>
                
                <div className="space-y-4">
                  {/* BTC - Enhanced Premium Card */}
                  <div className="group relative bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 backdrop-blur-sm p-6 rounded-3xl border-3 border-orange-300/70 hover:border-orange-400/90 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ring-2 ring-orange-200/40 hover:ring-orange-300/60">
                    {/* Enhanced Badge BTC */}
                    <div className="absolute -top-3 -right-3 z-10">
                      <div className="bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500 text-white text-sm font-black px-4 py-2 rounded-full shadow-2xl transform rotate-12 border-3 border-white backdrop-blur-sm animate-pulse ring-2 ring-orange-200/50">
                        💎 MÁS POPULAR
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-yellow-100/50 to-amber-100/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl ring-4 ring-orange-200/60 group-hover:ring-orange-300/80 transition-all duration-300">
                          ₿
                        </div>
                        <div>
                          <div className="font-black text-orange-900 text-2xl mb-1">Bitcoin</div>
                          <div className="text-sm text-orange-700 font-bold bg-orange-100/60 px-3 py-1 rounded-full">
                            BTC Network • La más confiable
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-3">
                        <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-3 rounded-2xl border border-orange-200/60 shadow-inner">
                          <div className="font-mono font-black text-orange-900 text-2xl leading-none">
                            {cryptoLoading || !convertedAmounts ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-lg">Cargando...</span>
                              </div>
                            ) : (
                              `${convertedAmounts?.BTC?.toFixed(8) || '...'} BTC`
                            )}
                          </div>
                          <div className="text-sm text-orange-700 font-bold mt-1">
                            ≈ ${selectedTickets.length * 250} MXN
                          </div>
                        </div>
                        <button
                          onClick={() => convertedAmounts?.BTC && navigator.clipboard.writeText(convertedAmounts.BTC.toString())}
                          className="w-full px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 ring-2 shadow-xl active:scale-95 bg-gradient-to-r from-orange-200 to-yellow-200 text-orange-900 hover:from-orange-300 hover:to-yellow-300 ring-orange-400/60 hover:shadow-2xl hover:scale-105 border border-orange-300/50"
                        >
                          <Copy size={14} className="inline mr-2" />
                          Copiar Monto BTC
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SOL - Enhanced Premium Card */}
                  <div className="group relative bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 backdrop-blur-sm p-6 rounded-3xl border-3 border-violet-300/70 hover:border-violet-400/90 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ring-2 ring-violet-200/40 hover:ring-violet-300/60">
                    {/* Enhanced Badge SOL */}
                    <div className="absolute -top-3 -left-3 z-10">
                      <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 text-white text-sm font-black px-4 py-2 rounded-full shadow-2xl transform -rotate-12 border-3 border-white backdrop-blur-sm animate-pulse ring-2 ring-violet-200/50">
                        ⚡ SÚPER RÁPIDA
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-100/50 via-purple-100/50 to-indigo-100/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl ring-4 ring-violet-200/60 group-hover:ring-violet-300/80 transition-all duration-300">
                          ◎
                        </div>
                        <div>
                          <div className="font-black text-violet-900 text-2xl mb-1">Solana</div>
                          <div className="text-sm text-violet-700 font-bold bg-violet-100/60 px-3 py-1 rounded-full">
                            SOL Network • Ultra rápida
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-3">
                        <div className="bg-gradient-to-r from-violet-100 to-purple-100 p-3 rounded-2xl border border-violet-200/60 shadow-inner">
                          <div className="font-mono font-black text-violet-900 text-2xl leading-none">
                            {cryptoLoading || !convertedAmounts ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-lg">Cargando...</span>
                              </div>
                            ) : (
                              `${convertedAmounts?.SOL?.toFixed(4) || '...'} SOL`
                            )}
                          </div>
                          <div className="text-sm text-violet-700 font-bold mt-1">
                            ≈ ${selectedTickets.length * 250} MXN
                          </div>
                        </div>
                        <button
                          onClick={() => convertedAmounts?.SOL && navigator.clipboard.writeText(convertedAmounts.SOL.toString())}
                          className="w-full px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 ring-2 shadow-xl active:scale-95 bg-gradient-to-r from-violet-200 to-purple-200 text-violet-900 hover:from-violet-300 hover:to-purple-300 ring-violet-400/60 hover:shadow-2xl hover:scale-105 border border-violet-300/50"
                        >
                          <Copy size={14} className="inline mr-2" />
                          Copiar Monto SOL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Otras Opciones - Enhanced Secondary Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700 font-bold text-lg mb-4">
                  <div className="p-2 bg-gradient-to-r from-slate-400 to-slate-500 rounded-lg shadow-md">
                    <div className="text-white font-black text-sm">💰</div>
                  </div>
                  <span>Otras opciones disponibles:</span>
                </div>

                <div className="grid gap-4">
                  {/* USDT - Enhanced */}
                  <div className="group relative bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm p-5 rounded-2xl border-2 border-green-200/70 hover:border-green-300/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-100/30 to-emerald-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-3 ring-green-200/50">
                          ₮
                        </div>
                        <div>
                          <div className="font-black text-green-800 text-lg">USDT (Tether)</div>
                          <div className="text-sm text-green-600 font-semibold bg-green-100/60 px-2 py-1 rounded-full">TRC20 Network</div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="bg-green-100/60 p-2 rounded-xl border border-green-200/50">
                          <div className="font-mono font-black text-green-800 text-lg">
                            {cryptoLoading || !convertedAmounts ? '...' : `${convertedAmounts?.USDT?.toFixed(2) || '...'} USDT`}
                          </div>
                          <div className="text-xs text-green-600 font-bold">
                            ≈ ${selectedTickets.length * 250} MXN
                          </div>
                        </div>
                        <button
                          onClick={() => convertedAmounts?.USDT && navigator.clipboard.writeText(convertedAmounts.USDT.toString())}
                          className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ring-2 shadow-lg active:scale-95 bg-gradient-to-r from-green-200 to-emerald-200 text-green-800 hover:from-green-300 hover:to-emerald-300 ring-green-300/50 hover:shadow-xl"
                        >
                          <Copy size={12} className="inline mr-2" />
                          Copiar USDT
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* USDC - Enhanced */}
                  <div className="group relative bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-sm p-5 rounded-2xl border-2 border-blue-200/70 hover:border-blue-300/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 to-cyan-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-3 ring-blue-200/50">
                          $
                        </div>
                        <div>
                          <div className="font-black text-blue-800 text-lg">USDC (USD Coin)</div>
                          <div className="text-sm text-blue-600 font-semibold bg-blue-100/60 px-2 py-1 rounded-full">ERC20 Network</div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="bg-blue-100/60 p-2 rounded-xl border border-blue-200/50">
                          <div className="font-mono font-black text-blue-800 text-lg">
                            {cryptoLoading || !convertedAmounts ? '...' : `${convertedAmounts?.USDC?.toFixed(2) || '...'} USDC`}
                          </div>
                          <div className="text-xs text-blue-600 font-bold">
                            ≈ ${selectedTickets.length * 250} MXN
                          </div>
                        </div>
                        <button
                          onClick={() => convertedAmounts?.USDC && navigator.clipboard.writeText(convertedAmounts.USDC.toString())}
                          className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ring-2 shadow-lg active:scale-95 bg-gradient-to-r from-blue-200 to-cyan-200 text-blue-800 hover:from-blue-300 hover:to-cyan-300 ring-blue-300/50 hover:shadow-xl"
                        >
                          <Copy size={12} className="inline mr-2" />
                          Copiar USDC
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ETH - Enhanced */}
                  <div className="group relative bg-gradient-to-r from-purple-50 to-indigo-50 backdrop-blur-sm p-5 rounded-2xl border-2 border-purple-200/70 hover:border-purple-300/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100/30 to-indigo-100/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-3 ring-purple-200/50">
                          Ξ
                        </div>
                        <div>
                          <div className="font-black text-purple-800 text-lg">Ethereum</div>
                          <div className="text-sm text-purple-600 font-semibold bg-purple-100/60 px-2 py-1 rounded-full">ERC20 Network</div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="bg-purple-100/60 p-2 rounded-xl border border-purple-200/50">
                          <div className="font-mono font-black text-purple-800 text-lg">
                            {cryptoLoading || !convertedAmounts ? '...' : `${convertedAmounts?.ETH?.toFixed(6) || '...'} ETH`}
                          </div>
                          <div className="text-xs text-purple-600 font-bold">
                            ≈ ${selectedTickets.length * 250} MXN
                          </div>
                        </div>
                        <button
                          onClick={() => convertedAmounts?.ETH && navigator.clipboard.writeText(convertedAmounts.ETH.toString())}
                          className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ring-2 shadow-lg active:scale-95 bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-800 hover:from-purple-300 hover:to-indigo-300 ring-purple-300/50 hover:shadow-xl"
                        >
                          <Copy size={12} className="inline mr-2" />
                          Copiar ETH
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Address - Dramatically Enhanced */}
              <div className="mt-8 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border-2 border-slate-700/60 shadow-2xl ring-2 ring-slate-600/30">
                <div className="space-y-4">
                  {/* Header with Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg ring-2 ring-blue-400/30">
                      <div className="text-white font-bold text-lg">📧</div>
                    </div>
                    <div>
                      <div className="text-slate-200 font-black text-xl">Dirección de Wallet Binance</div>
                      <div className="text-slate-400 text-sm font-semibold">Envía a esta dirección exacta</div>
                    </div>
                  </div>

                  {/* QR Code Placeholder */}
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex flex-col items-center justify-center border-2 border-slate-600/50 shadow-xl">
                        <div className="text-slate-400 text-3xl mb-2">📱</div>
                        <div className="text-slate-400 text-xs font-bold text-center px-2">QR próximamente</div>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    <div className="flex-1 space-y-4">
                      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 rounded-2xl border border-slate-600/50 shadow-inner">
                        <div className="text-slate-300 font-bold text-sm mb-2 uppercase tracking-wide">Email de Wallet:</div>
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-600/30">
                          <div className="font-mono font-bold text-white text-xl break-all leading-relaxed tracking-wide">
                            rifadesilverado2024@gmail.com
                          </div>
                        </div>
                      </div>

                      {/* Copy Button - Enhanced */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('rifadesilverado2024@gmail.com');
                          // Visual feedback could be added here
                        }}
                        className="w-full px-6 py-4 rounded-2xl text-base font-black transition-all duration-300 ring-3 shadow-xl active:scale-95 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-indigo-600 ring-blue-400/50 hover:shadow-2xl hover:scale-105 border border-blue-400/30"
                      >
                        <Copy size={16} className="inline mr-3" />
                        Copiar Dirección de Wallet
                      </button>
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center gap-2 bg-green-900/30 text-green-300 px-3 py-2 rounded-full text-xs font-bold border border-green-700/50">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Verificado
                    </div>
                    <div className="flex items-center gap-2 bg-blue-900/30 text-blue-300 px-3 py-2 rounded-full text-xs font-bold border border-blue-700/50">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      Binance Pay
                    </div>
                    <div className="flex items-center gap-2 bg-purple-900/30 text-purple-300 px-3 py-2 rounded-full text-xs font-bold border border-purple-700/50">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      Procesamiento Rápido
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regular Payment Method Details */}
          {method.id !== 'binance' && method.accountDetails && (
            <div className="space-y-3">
              {method.accountDetails.split('\n').map((line: string, index: number) => (
                <div key={index} className="group relative bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <div className="relative flex items-center justify-between">
                    <span className="text-slate-800 text-sm flex-1 mr-3 font-mono font-medium">{line}</span>
                    <button
                      onClick={() => {
                        const textToCopy = line.split(': ')[1] || line;
                        navigator.clipboard.writeText(textToCopy);
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ring-1 shadow-sm active:scale-95 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300 ring-slate-200/50 hover:shadow-md"
                    >
                      <Copy size={12} className="inline mr-1.5" />
                      Copiar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Enhanced Instructions Section */}
          {method.id === 'binance' ? (
            <div className="mt-6 space-y-4">
              {/* Main Instruction Card */}
              <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6 rounded-3xl border-2 border-amber-200/80 shadow-xl ring-2 ring-amber-100/50">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/30 via-orange-100/30 to-red-100/30 rounded-3xl" />
                <div className="relative space-y-4">
                  {/* Header with Strong Icon */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-xl ring-2 ring-amber-300/50">
                      <FileText size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-amber-900 font-black text-xl">Instrucciones de Pago</div>
                      <div className="text-amber-700 font-bold text-sm">Sigue estos pasos exactamente</div>
                    </div>
                  </div>

                  {/* Step-by-step Instructions */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-amber-200/50">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                        1
                      </div>
                      <div className="text-amber-900 font-bold text-base leading-relaxed">
                        Copia el <span className="bg-amber-200/60 px-2 py-1 rounded-lg font-black">monto EXACTO</span> de tu criptomoneda preferida
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-amber-200/50">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                        2
                      </div>
                      <div className="text-amber-900 font-bold text-base leading-relaxed">
                        Envía a la dirección: <span className="bg-slate-800 text-white px-2 py-1 rounded-lg font-mono text-sm">rifadesilverado2024@gmail.com</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-amber-200/50">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-lg">
                        3
                      </div>
                      <div className="text-amber-900 font-bold text-base leading-relaxed">
                        Sube el <span className="bg-green-200/60 px-2 py-1 rounded-lg font-black">comprobante de pago</span> en el siguiente paso
                      </div>
                    </div>
                  </div>

                  {/* Important Note */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl border-2 border-red-200/70 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="text-red-600 text-2xl">⚠️</div>
                      <div>
                        <div className="text-red-900 font-black text-sm">IMPORTANTE</div>
                        <div className="text-red-800 font-bold text-sm">El monto debe ser exacto para procesar tu compra correctamente</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    )}
  </div>
);

interface CustomerDataStepProps {
  customerData: CustomerData;
  onDataChange: (data: React.SetStateAction<CustomerData>) => void;
  validationErrors: ValidationErrors;
  mexicanStates: string[];
}

const CustomerDataStep: React.FC<CustomerDataStepProps> = ({ 
  customerData, 
  onDataChange, 
  validationErrors, 
  mexicanStates 
}) => (
  <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
    <StepHeader
      icon={<Users size={28} />}
      title="Ingresa tus datos"
      description="Necesarios para contactarte cuando ganes"
      color="orange"
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Full Name Field */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          Nombre completo *
        </label>
        <div className="relative group">
          <input
            type="text"
            value={customerData.name}
            onChange={(e) => onDataChange(prev => ({ ...prev, name: e.target.value }))}
            className={cn(
              'w-full px-5 py-4 rounded-2xl border-2 text-sm transition-all duration-300',
              'bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm placeholder:text-slate-400 text-slate-900',
              'focus:outline-none focus:ring-4 hover:shadow-lg group-hover:shadow-md',
              validationErrors.name 
                ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500 shadow-red-100' 
                : 'border-slate-200/60 focus:ring-orange-200/50 focus:border-orange-500 hover:border-slate-300/60'
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

      {/* Phone Field */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Phone size={14} className="text-emerald-500" />
          Teléfono WhatsApp *
        </label>
        <div className="relative group">
          <input
            type="tel"
            value={customerData.phone}
            onChange={(e) => onDataChange(prev => ({ ...prev, phone: e.target.value }))}
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

      {/* Email Field */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Mail size={14} className="text-blue-500" />
          Email *
        </label>
        <div className="relative group">
          <input
            type="email"
            value={customerData.email}
            onChange={(e) => onDataChange(prev => ({ ...prev, email: e.target.value }))}
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

      {/* City Field */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <MapPin size={14} className="text-purple-500" />
          Ciudad *
        </label>
        <div className="relative group">
          <input
            type="text"
            value={customerData.city}
            onChange={(e) => onDataChange(prev => ({ ...prev, city: e.target.value }))}
            className={cn(
              'w-full px-5 py-4 rounded-2xl border-2 text-sm transition-all duration-300',
              'bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm placeholder:text-slate-400 text-slate-900',
              'focus:outline-none focus:ring-4 hover:shadow-lg',
              validationErrors.city 
                ? 'border-red-300 focus:ring-red-200/50 focus:border-red-500 shadow-red-100' 
                : 'border-slate-200/60 focus:ring-purple-200/50 focus:border-purple-500 hover:border-slate-300/60'
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

      {/* State Field */}
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Building2 size={14} className="text-indigo-500" />
          Estado
        </label>
        <div className="relative group">
          <select
            value={customerData.state}
            onChange={(e) => onDataChange(prev => ({ ...prev, state: e.target.value }))}
            className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200/60 text-sm bg-gradient-to-r from-white to-slate-50/50 backdrop-blur-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-200/50 focus:border-indigo-500 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300 appearance-none cursor-pointer"
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
);

interface PaymentProofStepProps {
  selectedPaymentMethod: string;
  mainPaymentMethods: any[];
  customerData: CustomerData;
  selectedTickets: number[];
  totalPrice: number;
  paymentScreenshot: File | null;
  previewUrl: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  validationError?: string;
  copiedField: string;
  onCopyToClipboard: (text: string, field: string) => void;
}

const PaymentProofStep: React.FC<PaymentProofStepProps> = ({
  selectedPaymentMethod,
  mainPaymentMethods,
  customerData,
  selectedTickets,
  totalPrice,
  paymentScreenshot,
  previewUrl,
  onFileChange,
  onRemoveFile,
  validationError,
  copiedField,
  onCopyToClipboard
}) => (
  <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
    <StepHeader
      icon={<Camera size={28} />}
      title="Sube tu comprobante"
      description="Captura de pantalla de tu transferencia"
      color="pink"
    />

    {/* File Upload Area */}
    <div className="group relative border-2 border-dashed border-slate-300/60 rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/50 backdrop-blur-sm transition-all duration-500 hover:border-slate-400/60 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative text-center">
        {!previewUrl ? (
          <>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload size={32} className="text-white drop-shadow-sm" />
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                Selecciona tu comprobante
              </h4>
              <p className="text-slate-600 font-medium">
                JPG, PNG o cualquier imagen (máx. 10MB)
              </p>
              
              <input
                type="file"
                id="screenshot-upload"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 ring-2 ring-blue-500/20"
              >
                <Upload size={16} />
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
                onClick={onRemoveFile}
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

      {validationError && (
        <div className="relative mt-6 bg-gradient-to-r from-red-50 to-red-100/80 backdrop-blur-sm border border-red-200/60 rounded-2xl p-4 text-center ring-1 ring-red-200/30 animate-in fade-in-50 slide-in-from-top-2 duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl" />
          <div className="relative text-red-800 text-sm font-bold flex items-center justify-center gap-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <X size={12} className="text-white" />
            </div>
            {validationError}
          </div>
        </div>
      )}
    </div>

    {/* Purchase Summary */}
    <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-sm rounded-2xl p-6 ring-1 ring-slate-200/50 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
      <div className="relative">
        <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-3 text-lg">
          <div className="p-2 bg-gradient-to-br from-mexican-green to-cactus-green rounded-xl shadow-lg shadow-mexican-green/25">
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
              <div className="text-2xl font-black bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {selectedTickets.length}
              </div>
            </div>
          </div>
          <div className="group relative bg-white/80 backdrop-blur-sm p-5 rounded-2xl text-center ring-1 ring-emerald-200/50 hover:ring-emerald-300/60 hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="text-sm text-emerald-700 font-semibold mb-2">Total</div>
              <div className="text-2xl font-black bg-gradient-to-br from-mexican-red to-sunset-orange bg-clip-text text-transparent">
                {formatPrice(totalPrice)}
              </div>
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

    {/* Payment Account Information */}
    {(() => {
      const selectedMethod = mainPaymentMethods.find(m => m.id === selectedPaymentMethod);
      if (!selectedMethod) return null;

      return (
        <div className="relative bg-gradient-to-br from-emerald-50 to-emerald-100/80 backdrop-blur-sm border border-emerald-200/60 rounded-2xl p-6 ring-1 ring-emerald-200/30 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-2xl" />
          <div className="relative">
            <h4 className="font-bold text-emerald-900 mb-6 flex items-center gap-3 text-lg">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25">
                <CreditCard size={18} className="text-white" />
              </div>
              <span className="bg-gradient-to-r from-emerald-900 to-emerald-700 bg-clip-text text-transparent">
                Datos para tu transferencia - {selectedMethod.name}
              </span>
            </h4>

            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl space-y-4 ring-1 ring-emerald-200/50 shadow-md">
              {selectedMethod.id === 'binance' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-emerald-700 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Email Binance Pay:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                        {selectedMethod.account}
                      </span>
                      <button
                        onClick={() => onCopyToClipboard(selectedMethod.account, 'binance-email')}
                        className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        {copiedField === 'binance-email' ? <CheckCircle size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <p className="text-sm text-emerald-800 font-medium">
                      💡 <strong>Importante:</strong> Transfiere exactamente <strong className="text-emerald-900">{formatPrice(totalPrice)}</strong>
                      al email de Binance Pay mostrado arriba.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedMethod.accountDetails?.split('\n').map((line: string, index: number) => {
                    const [label, ...valueParts] = line.split(':');
                    const value = valueParts.join(':').trim();

                    if (!value) return null;

                    return (
                      <div key={index} className="flex justify-between items-center group">
                        <span className="text-emerald-700 font-semibold flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                          {label.trim()}:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                            {value}
                          </span>
                          <button
                            onClick={() => onCopyToClipboard(value, `${selectedMethod.id}-${index}`)}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
                          >
                            {copiedField === `${selectedMethod.id}-${index}` ? <CheckCircle size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <p className="text-sm text-emerald-800 font-medium">
                      💡 <strong>Importante:</strong> Transfiere exactamente <strong className="text-emerald-900">{formatPrice(totalPrice)}</strong>
                      a la cuenta mostrada arriba.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    })()}

    {/* Final Instructions */}
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
);

export default PurchaseWizard;