// ============================================================================
// MODAL DE PAGO PARA RIFA DE CAMIONETA
// ============================================================================

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';

// Importar desde archivos anteriores
import { useRaffleStore } from '../stores/raffle-store';
import { PAYMENT_METHODS } from '../lib/constants';
import type { PaymentMethodType } from '../lib/types';
import { 
  validateEmail, 
  validateWhatsApp, 
  formatPrice, 
  generateId,
  cn 
} from '../lib/utils';

// ============================================================================
// TIPOS
// ============================================================================

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentStep = 'form' | 'instructions' | 'upload' | 'success';

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  paymentMethod: PaymentMethodType;
}

interface FormErrors {
  name?: string;
  email?: string;
  whatsapp?: string;
  paymentMethod?: string;
}

// ============================================================================
// COMPONENTE DE OVERLAY
// ============================================================================

const ModalOverlay: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
}> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE DE FORMULARIO
// ============================================================================

const FormStep: React.FC<{
  formData: FormData;
  errors: FormErrors;
  onFormChange: (data: Partial<FormData>) => void;
  onNext: () => void;
  totalPrice: number;
  selectedCount: number;
}> = ({ formData, errors, onFormChange, onNext, totalPrice, selectedCount }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-800">
          🎫 Datos del Comprador
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {selectedCount} boleto{selectedCount !== 1 ? 's' : ''} • {formatPrice(totalPrice)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onFormChange({ name: e.target.value })}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              {
                'border-red-300 bg-red-50': errors.name,
                'border-gray-300': !errors.name
              }
            )}
            placeholder="Ej: Juan Pérez García"
          />
          {errors.name && (
            <p className="text-red-600 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onFormChange({ email: e.target.value })}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              {
                'border-red-300 bg-red-50': errors.email,
                'border-gray-300': !errors.email
              }
            )}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && (
            <p className="text-red-600 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp *
          </label>
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => onFormChange({ whatsapp: e.target.value })}
            className={cn(
              'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
              {
                'border-red-300 bg-red-50': errors.whatsapp,
                'border-gray-300': !errors.whatsapp
              }
            )}
            placeholder="+52 55 1234 5678"
          />
          {errors.whatsapp && (
            <p className="text-red-600 text-xs mt-1">{errors.whatsapp}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Formato: +52 seguido de 10 dígitos
          </p>
        </div>

        {/* Métodos de Pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Método de pago *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PAYMENT_METHODS.filter(method => method.enabled).map((method) => (
              <label
                key={method.id}
                className={cn(
                  'flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all',
                  {
                    'border-blue-500 bg-blue-50': formData.paymentMethod === method.id,
                    'border-gray-200 hover:border-gray-300': formData.paymentMethod !== method.id
                  }
                )}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={formData.paymentMethod === method.id}
                  onChange={(e) => onFormChange({ paymentMethod: e.target.value as PaymentMethodType })}
                  className="sr-only"
                />
                <div className="w-8 h-8 mr-3 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">{method.name.slice(0, 2)}</span>
                </div>
                <span className="font-medium text-gray-800">{method.name}</span>
              </label>
            ))}
          </div>
          {errors.paymentMethod && (
            <p className="text-red-600 text-xs mt-1">{errors.paymentMethod}</p>
          )}
          
          {/* Logos de métodos de pago */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 flex-wrap opacity-60">
              <div className="flex items-center gap-1">
                <Image
                  src="/logos/bancoppel.png"
                  alt="BanCoppel"
                  width={40}
                  height={24}
                  className="object-contain"
                />
                <span className="text-xs text-gray-500">BanCoppel</span>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src="/logos/bancoazteca.png"
                  alt="Banco Azteca"
                  width={40}
                  height={24}
                  className="object-contain"
                />
                <span className="text-xs text-gray-500">Banco Azteca</span>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src="/logos/oxxo.png"
                  alt="OXXO"
                  width={40}
                  height={24}
                  className="object-contain"
                />
                <span className="text-xs text-gray-500">OXXO</span>
              </div>
              <div className="flex items-center gap-1">
                <Image
                  src="/logos/binance.svg"
                  alt="Binance"
                  width={40}
                  height={24}
                  className="object-contain"
                />
                <span className="text-xs text-gray-500">Binance</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continuar al pago →
        </button>
      </form>
    </div>
  );
};

// ============================================================================
// COMPONENTE DE INSTRUCCIONES DE PAGO
// ============================================================================

const InstructionsStep: React.FC<{
  paymentMethod: PaymentMethodType;
  totalPrice: number;
  onNext: () => void;
  onBack: () => void;
  handleCopyToClipboard: (text: string) => void;
}> = ({ paymentMethod, totalPrice, onNext, onBack, handleCopyToClipboard }) => {
  const method = PAYMENT_METHODS.find(m => m.id === paymentMethod);
  
  if (!method) return null;

  return (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-800">
          💳 Instrucciones de Pago
        </h3>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">{method.name.slice(0, 2)}</span>
          </div>
          <span className="font-medium text-gray-700">{method.name}</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-800 mb-1">
            {formatPrice(totalPrice)}
          </div>
          <div className="text-sm text-blue-600">
            Monto total a pagar
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-gray-800">📋 Pasos a seguir:</h4>
        
        {method.id === 'binance' && (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm"><strong>1.</strong> Abre tu app de Binance</p>
              <p className="text-sm"><strong>2.</strong> Ve a &quot;Pay&quot; → &quot;Enviar&quot;</p>
              <p className="text-sm"><strong>3.</strong> Envía <strong>{formatPrice(totalPrice)}</strong> a:</p>
              <div className="bg-white border rounded p-2 mt-2 font-mono text-sm relative group">
                <div className="flex items-center justify-between">
                  <span>{method.account}</span>
                  <button
                    onClick={() => handleCopyToClipboard(method.account)}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
              </div>
              {method.accountDetails && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">{method.accountDetails}</pre>
                  <button
                    onClick={() => handleCopyToClipboard(method.accountDetails!)}
                    className="mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                  >
                    📋 Copiar todos los datos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {(method.id === 'bancoppel' || method.id === 'bancoazteca') && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm"><strong>1.</strong> Transfiere desde tu app bancaria</p>
              <p className="text-sm"><strong>2.</strong> Monto: <strong>{formatPrice(totalPrice)}</strong></p>
              <p className="text-sm"><strong>3.</strong> Cuenta destino:</p>
              <div className="bg-white border rounded p-2 mt-2 font-mono text-sm relative group">
                <div className="flex items-center justify-between">
                  <span>{method.account}</span>
                  <button
                    onClick={() => handleCopyToClipboard(method.account)}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
              </div>
              {method.accountDetails && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">{method.accountDetails}</pre>
                  <button
                    onClick={() => handleCopyToClipboard(method.accountDetails!)}
                    className="mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                  >
                    📋 Copiar todos los datos
                  </button>
                </div>
              )}
              <p className="text-sm"><strong>4.</strong> Concepto: &quot;Rifa Silverado&quot;</p>
            </div>
          </div>
        )}

        {method.id === 'oxxo' && (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm"><strong>1.</strong> Ve a cualquier OXXO</p>
              <p className="text-sm"><strong>2.</strong> Di &quot;Quiero hacer un depósito&quot;</p>
              <p className="text-sm"><strong>3.</strong> Monto: <strong>{formatPrice(totalPrice)}</strong></p>
              <p className="text-sm"><strong>4.</strong> Referencia:</p>
              <div className="bg-white border rounded p-2 mt-2 font-mono text-sm relative group">
                <div className="flex items-center justify-between">
                  <span>{method.account}</span>
                  <button
                    onClick={() => handleCopyToClipboard(method.account)}
                    className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                    title="Copiar"
                  >
                    📋
                  </button>
                </div>
              </div>
              {method.accountDetails && (
                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">{method.accountDetails}</pre>
                  <button
                    onClick={() => handleCopyToClipboard(method.accountDetails!)}
                    className="mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                  >
                    📋 Copiar todos los datos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-sm text-purple-800">
            <strong>💡 Importante:</strong> Guarda tu comprobante de pago para subirlo en el siguiente paso.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          ← Atrás
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Ya pagué →
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE DE UPLOAD
// ============================================================================

const UploadStep: React.FC<{
  onNext: () => void;
  onBack: () => void;
}> = ({ onNext, onBack }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleSubmit = () => {
    if (uploadedFile) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-200 pb-4">
        <h3 className="text-xl font-bold text-gray-800">
          📸 Subir Comprobante
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Sube la foto de tu comprobante de pago
        </p>
      </div>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          {
            'border-blue-400 bg-blue-50': isDragging,
            'border-gray-300 hover:border-gray-400': !isDragging && !uploadedFile,
            'border-green-400 bg-green-50': uploadedFile
          }
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {!uploadedFile ? (
          <div>
            <div className="text-4xl mb-4">📱</div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arrastra tu imagen aquí
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o haz click para seleccionar
            </p>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-block">
              Seleccionar archivo
            </div>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-4">✅</div>
            <p className="text-lg font-medium text-green-700 mb-2">
              ¡Archivo cargado!
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {uploadedFile.name}
            </p>
            {previewUrl && (
              <Image
                src={previewUrl}
                alt="Preview"
                width={300}
                height={200}
                className="max-w-full max-h-48 mx-auto rounded-lg shadow-md object-contain"
              />
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h4 className="font-bold text-blue-800 mb-2">🎯 Sistema de Verificación:</h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>1.</strong> Tu comprobante será revisado por nuestro equipo</p>
          <p><strong>2.</strong> Una vez verificado, tus boletos cambiarán de RESERVADOS a <span className="font-bold text-green-600">VENDIDOS</span></p>
          <p><strong>3.</strong> Recibirás confirmación por WhatsApp en menos de 30 minutos</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-bold text-yellow-800 mb-2">💡 Consejos para tu comprobante:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Asegúrate que se vea el monto claramente</li>
          <li>• Incluye fecha y hora de la transacción</li>
          <li>• La imagen debe estar enfocada y sin cortes</li>
          <li>• Formatos aceptados: JPG, PNG, HEIC</li>
        </ul>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          ← Atrás
        </button>
        <button
          onClick={handleSubmit}
          disabled={!uploadedFile}
          className={cn(
            'flex-1 py-3 px-4 rounded-lg font-medium transition-colors',
            {
              'bg-purple-600 text-white hover:bg-purple-700': uploadedFile,
              'bg-gray-300 text-gray-500 cursor-not-allowed': !uploadedFile
            }
          )}
        >
          Finalizar compra →
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE DE ÉXITO
// ============================================================================

const SuccessStep: React.FC<{
  customerData: FormData;
  selectedTickets: number[];
  totalPrice: number;
  onClose: () => void;
}> = ({ customerData, selectedTickets, totalPrice, onClose }) => {
  return (
    <div className="text-center space-y-6">
      <div className="text-6xl mb-4">🎉</div>
      
      <div>
        <h3 className="text-2xl font-bold text-green-700 mb-2">
          ¡Compra Exitosa!
        </h3>
        <p className="text-gray-600">
          Tu pago está siendo verificado
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-bold text-green-800 mb-3">📋 Resumen de tu compra:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Comprador:</span>
            <span className="font-medium">{customerData.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="font-medium">{customerData.email}</span>
          </div>
          <div className="flex justify-between">
            <span>WhatsApp:</span>
            <span className="font-medium">{customerData.whatsapp}</span>
          </div>
          <div className="flex justify-between">
            <span>Boletos:</span>
            <span className="font-medium">{selectedTickets.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-bold text-green-700">{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-2">📱 Próximos pasos:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>1. Verificaremos tu pago en las próximas 24 horas</p>
          <p>2. Te enviaremos una confirmación por WhatsApp y email</p>
          <p>3. Tus boletos quedarán reservados hasta la confirmación</p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        ¡Perfecto! 🎫
      </button>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  // Estado del store
  const {
    selectedTickets,
    totalSelected,
    totalPrice,
    setCustomerData,
    reserveTickets,
    clearSelection
  } = useRaffleStore();

  // Estado local
  const [currentStep, setCurrentStep] = useState<PaymentStep>('form');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    paymentMethod: 'bancoppel'
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  
  // Función para copiar al clipboard
  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('¡Copiado!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopyFeedback('¡Copiado!');
        setTimeout(() => setCopyFeedback(''), 2000);
      } catch {
        setCopyFeedback('Error al copiar');
        setTimeout(() => setCopyFeedback(''), 2000);
      }
      document.body.removeChild(textArea);
    }
  };

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep('form');
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        paymentMethod: 'bancoppel'
      });
      setErrors({});
    }
  }, [isOpen]);

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'El WhatsApp es requerido';
    } else if (!validateWhatsApp(formData.whatsapp)) {
      newErrors.whatsapp = 'Formato de WhatsApp inválido (+52XXXXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers de navegación
  const handleFormNext = () => {
    if (validateForm()) {
      setCurrentStep('instructions');
    }
  };

  const handleInstructionsNext = () => {
    setCurrentStep('upload');
  };

  const handleUploadNext = () => {
    // Crear customer y reservar tickets
    const customerId = generateId();
    
    setCustomerData({
      id: customerId,
      name: formData.name,
      email: formData.email,
      whatsapp: formData.whatsapp,
      selectedTickets: selectedTickets.map(String),
      totalAmount: totalPrice,
      paymentMethod: formData.paymentMethod,
      status: 'pending',
      createdAt: new Date()
    });

    reserveTickets(selectedTickets, customerId);
    setCurrentStep('success');
  };

  const handleSuccess = () => {
    clearSelection();
    onClose();
  };

  const handleFormChange = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
    // Limpiar errores relacionados
    if (data.name !== undefined && errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
    if (data.email !== undefined && errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (data.whatsapp !== undefined && errors.whatsapp) {
      setErrors(prev => ({ ...prev, whatsapp: undefined }));
    }
  };

  // No renderizar si no está abierto o no hay tickets seleccionados
  if (!isOpen || totalSelected === 0) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/Rifasilverado.png"
              alt="Rifa Silverado"
              width={48}
              height={48}
              className="object-contain"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Finalizar Compra
              </h2>
              <p className="text-sm text-gray-600">
                Paso {currentStep === 'form' ? '1' : currentStep === 'instructions' ? '2' : currentStep === 'upload' ? '3' : '4'} de 4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  currentStep === 'form' ? '25%' :
                  currentStep === 'instructions' ? '50%' :
                  currentStep === 'upload' ? '75%' : '100%'
                }`
              }}
            />
          </div>
        </div>

        {/* Copy Feedback */}
        {copyFeedback && (
          <div className="px-6 py-2">
            <div className="bg-green-100 border border-green-300 text-green-700 px-3 py-2 rounded text-sm text-center">
              {copyFeedback}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {currentStep === 'form' && (
            <FormStep
              formData={formData}
              errors={errors}
              onFormChange={handleFormChange}
              onNext={handleFormNext}
              totalPrice={totalPrice}
              selectedCount={totalSelected}
            />
          )}

          {currentStep === 'instructions' && (
            <InstructionsStep
              paymentMethod={formData.paymentMethod}
              totalPrice={totalPrice}
              onNext={handleInstructionsNext}
              handleCopyToClipboard={handleCopyToClipboard}
              onBack={() => setCurrentStep('form')}
            />
          )}

          {currentStep === 'upload' && (
            <UploadStep
              onNext={handleUploadNext}
              onBack={() => setCurrentStep('instructions')}
            />
          )}

          {currentStep === 'success' && (
            <SuccessStep
              customerData={formData}
              selectedTickets={selectedTickets}
              totalPrice={totalPrice}
              onClose={handleSuccess}
            />
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};

// ============================================================================
// EXPORT CON DISPLAY NAME
// ============================================================================

PaymentModal.displayName = 'PaymentModal';

export default PaymentModal;