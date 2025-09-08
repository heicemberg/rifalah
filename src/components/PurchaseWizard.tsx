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
import { PAYMENT_METHODS, QUICK_SELECT_OPTIONS, MIN_TICKETS_PER_PURCHASE } from '../lib/constants';
import type { PaymentMethod as PaymentMethodType } from '../lib/types';
import { useSupabaseSync } from '../hooks/useSupabaseSync';

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
// MAIN COMPONENT
// ============================================================================

const PurchaseWizard: React.FC<PurchaseWizardProps> = ({
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
  
  const hasTicketsSelected = selectedTickets.length >= MIN_TICKETS_PER_PURCHASE;
  const [currentStep, setCurrentStep] = useState(hasTicketsSelected ? 1 : 0);
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

  const totalPrice = selectedTickets.length * 250;

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
      setCurrentStep(hasTicketsSelected ? 1 : 0);
      setValidationErrors({});
      setSelectedPaymentMethod('');
      setCopiedField('');
      setPaymentScreenshot(null);
      setPreviewUrl('');
    }
  }, [isOpen, hasTicketsSelected]);

  // Update step when tickets are selected externally (from grid only)
  useEffect(() => {
    // Only advance if tickets were selected from grid and we're not in selection process
    if (isOpen && selectedTickets.length >= MIN_TICKETS_PER_PURCHASE && currentStep === 0 && !isSelectingTickets) {
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

  const validateTicketSelection = useCallback(async (): Promise<boolean> => {
    // Clear previous errors
    setValidationErrors(prev => {
      const { tickets, ...rest } = prev;
      return rest;
    });
    
    if (selectedTickets.length < MIN_TICKETS_PER_PURCHASE) {
      setValidationErrors({
        tickets: `Mínimo ${MIN_TICKETS_PER_PURCHASE} boletos requeridos. No se permite comprar 1 solo boleto por razones de equidad en el sorteo.`
      });
      return false;
    }

    if (selectedTickets.length === 0) {
      setValidationErrors({
        tickets: 'Debes seleccionar al menos algunos boletos para continuar.'
      });
      return false;
    }

    // Real-time Supabase validation if connected
    if (isConnected) {
      try {
        const availableTickets = await getRealAvailableTickets();
        
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

        // Check if there are enough available tickets
        if (availableTickets.length < selectedTickets.length) {
          setValidationErrors({
            tickets: `Solo quedan ${availableTickets.length} boletos disponibles. Selecciona menos números.`
          });
          return false;
        }

      } catch (error) {
        console.warn('Error validating tickets:', error);
        setValidationErrors({
          tickets: 'Error de conexión. Por favor verifica tu conexión e intenta de nuevo.'
        });
        return false;
      }
    }

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
    if (currentStep > (hasTicketsSelected ? 1 : 0)) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, hasTicketsSelected]);

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

  const handleQuickSelect = useCallback(async (ticketCount: number) => {
    // Clear any previous errors
    setValidationErrors({});
    setIsSelectingTickets(true);
    
    // Validate minimum tickets
    if (ticketCount < MIN_TICKETS_PER_PURCHASE) {
      setValidationErrors({
        quickSelect: `Mínimo ${MIN_TICKETS_PER_PURCHASE} boletos requeridos para participar en el sorteo`
      });
      setIsSelectingTickets(false);
      return;
    }

    try {
      // Check availability if connected to Supabase
      if (isConnected) {
        const availableTickets = await getRealAvailableTickets();
        if (availableTickets.length < ticketCount) {
          setValidationErrors({
            quickSelect: `Solo quedan ${availableTickets.length} boletos disponibles`
          });
          setIsSelectingTickets(false);
          return;
        }
      }

      // Call the parent's onQuickSelect function - this should update selectedTickets
      onQuickSelect(ticketCount);
      
      // Clear errors after selection
      setValidationErrors({});
      
      // Advance to step 1 after a short delay to allow parent state to update
      setTimeout(() => {
        setCurrentStep(1);
        setIsSelectingTickets(false);
      }, 200);
      
    } catch (error) {
      console.error('Error in quick select:', error);
      setValidationErrors({
        quickSelect: 'Error al seleccionar boletos. Intenta de nuevo.'
      });
      setIsSelectingTickets(false);
    }
  }, [isConnected, getRealAvailableTickets, onQuickSelect]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStepProgress = () => (
    <div className="flex items-center gap-2 sm:gap-3">
      {wizardSteps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className="flex items-center">
            <div className={cn(
              'w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-500 ease-out ring-2',
              currentStep > step.number 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ring-emerald-300/40 shadow-lg shadow-emerald-500/20 scale-110' 
                : currentStep === step.number
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ring-blue-300/40 shadow-lg shadow-blue-500/20 scale-110 animate-pulse'
                : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500 ring-slate-200/50 hover:ring-slate-300/60'
            )}>
              {currentStep > step.number ? (
                <CheckCircle size={14} className="animate-in zoom-in-50 duration-300" />
              ) : (
                <span>{hasTicketsSelected ? step.number : step.number + 1}</span>
              )}
            </div>
          </div>
          {index < wizardSteps.length - 1 && (
            <div className="flex-1 h-2 sm:h-3 mx-1 sm:mx-3 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 shadow-inner overflow-hidden">
              <div className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {mainPaymentMethods.map((method, index) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.25, 
                    delay: index * 0.05,
                    ease: "easeOut" 
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.15 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PaymentMethodCard
                    method={method}
                    isSelected={false}
                    onSelect={() => setSelectedPaymentMethod(method.id)}
                    animationDelay={0}
                  />
                </motion.div>
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
              transition={{ duration: 0.4 }}
            >
              {/* Top row - small unselected methods */}
              <motion.div 
                className="flex justify-center gap-3"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                {unselectedMethods.map((method, index) => (
                  <motion.button
                    key={method.id}
                    layoutId={method.id}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                    className="group relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-200/60 bg-gradient-to-br from-white to-slate-50/40 hover:border-blue-300/70 hover:shadow-lg overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: index * 0.05,
                      ease: "easeOut" 
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      transition: { duration: 0.2 }
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
                <motion.div
                  key={selectedMethod.id}
                  layoutId={selectedMethod.id}
                  initial={{ y: 20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.1,
                    ease: "easeOut" 
                  }}
                >
                  <PaymentMethodCard
                    method={selectedMethod}
                    isSelected={true}
                    onSelect={() => {}}
                    expanded={true}
                    animationDelay={0}
                  />
                </motion.div>
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
          {/* Premium Glass Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90 backdrop-blur-lg backdrop-saturate-150" 
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Modal Container */}
          <div className="flex items-center justify-center min-h-screen p-3 sm:p-6">
            <motion.div 
              className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl"
              style={{ maxHeight: '90vh' }}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-slate-200/50 border border-white/20 overflow-hidden flex flex-col max-h-[90vh]">
          
            {/* Header */}
            <div className="shrink-0 bg-gradient-to-r from-slate-50/90 to-white/90 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  {currentStep > (hasTicketsSelected ? 1 : 0) && (
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
                      {wizardSteps[hasTicketsSelected ? currentStep - 1 : currentStep]?.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium">
                      {wizardSteps[hasTicketsSelected ? currentStep - 1 : currentStep]?.description}
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
                    Paso {hasTicketsSelected ? currentStep : currentStep + 1} de {wizardSteps.length}
                  </span>
                  <div className="relative w-12 sm:w-16 bg-slate-200 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-sm" 
                      style={{ 
                        width: `${((hasTicketsSelected ? currentStep : currentStep + 1) / wizardSteps.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-slate-500 font-medium">
                    {Math.round(((hasTicketsSelected ? currentStep : currentStep + 1) / wizardSteps.length) * 100)}%
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
};

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

    {/* Quick Buy Cards Grid */}
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {QUICK_SELECT_OPTIONS.map((option, index) => (
        <motion.button
          key={option.tickets}
          onClick={() => onQuickSelect(option.tickets)}
          disabled={isSelectingTickets}
          className={cn(
            'group relative bg-gradient-to-br from-white via-white to-slate-50/80 rounded-3xl p-4 sm:p-6 text-center focus:outline-none focus:ring-4 ring-1 ring-slate-200/50',
            'hover:from-blue-50 hover:via-blue-50 hover:to-blue-100/80 hover:ring-blue-300/40 hover:shadow-blue-100/30',
            'disabled:opacity-50 disabled:cursor-wait',
            option.popular 
              ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100/80 ring-amber-300/50 shadow-xl shadow-amber-400/15'
              : 'border-2 border-transparent hover:border-blue-300/50'
          )}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1 * index,
            ease: "easeOut" 
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Popular Badge */}
          {option.popular && (
            <div className="absolute -top-2 -right-2 z-10">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-full blur animate-pulse" />
                <div className="relative bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg shadow-emerald-500/40 flex items-center gap-1">
                  <Gift size={10} />
                  MÁS POPULAR
                </div>
              </div>
            </div>
          )}

          <div className="relative space-y-3">
            <div className="space-y-2">
              <div className={cn(
                'text-3xl sm:text-4xl font-black transition-colors duration-300',
                option.popular
                  ? 'bg-gradient-to-br from-mexican-red to-sunset-orange bg-clip-text text-transparent'
                  : 'bg-gradient-to-br from-slate-800 to-slate-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-blue-600'
              )}>
                {option.tickets}
              </div>
              <div className={cn(
                'text-xs font-bold uppercase tracking-wider transition-colors duration-300',
                option.popular 
                  ? 'text-emerald-700'
                  : 'text-slate-600 group-hover:text-blue-700'
              )}>
                Números
              </div>
            </div>

            <div className="space-y-1">
              <div className={cn(
                'text-xl sm:text-2xl font-black transition-colors duration-300',
                option.popular
                  ? 'text-emerald-700'
                  : 'text-slate-900 group-hover:text-blue-700'
              )}>
                {formatPrice(option.price)}
              </div>
              {option.discount > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-slate-400 line-through text-sm font-medium">
                    {formatPrice(option.tickets * 250)}
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold shadow-sm',
                    option.popular
                      ? 'bg-emerald-200 text-emerald-800 ring-1 ring-emerald-300/50'
                      : 'bg-red-100 text-red-800 ring-1 ring-red-200/50'
                  )}>
                    <TrendingUp size={10} />
                    -{option.discount}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>

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
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({ 
  method, 
  isSelected, 
  onSelect, 
  expanded = false, 
  animationDelay 
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
                expanded ? 'max-w-8 max-h-8' : 'max-w-full max-h-[60px] sm:max-h-[80px]'
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
    {isSelected && expanded && method.accountDetails && (
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