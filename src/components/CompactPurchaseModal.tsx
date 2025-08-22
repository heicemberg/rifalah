'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { X, Upload, Check } from 'lucide-react';
import { useTickets, useTicketActions, useCheckout } from '../stores/raffle-store';
import { formatPrice } from '../lib/utils';
import toast from 'react-hot-toast';

interface CompactPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_OPTIONS = [
  { tickets: 1, price: 50, discount: 0, popular: false, desc: 'Prueba tu suerte' },
  { tickets: 5, price: 225, discount: 10, popular: false, desc: 'Buena opción' },
  { tickets: 10, price: 400, discount: 20, popular: true, desc: 'Más popular' },
  { tickets: 25, price: 750, discount: 40, popular: false, desc: 'Mayor oportunidad' }
];

const PAYMENT_METHODS = [
  {
    id: 'binance',
    name: 'Binance Pay',
    icon: '/logos/binance.svg',
    account: 'ID: 123456789',
    details: 'Envía el pago a ID: 123456789\nEmail: payments@rifa.mx'
  },
  {
    id: 'bancoppel',
    name: 'BanCoppel',
    icon: '/logos/bancoppel.png',
    account: '1234 5678 9012 3456',
    details: 'CLABE: 137180001234567890\nBeneficiario: RIFAS MEXICO SA'
  },
  {
    id: 'bancoazteca',
    name: 'Banco Azteca',
    icon: '/logos/bancoazteca.png',
    account: '9876 5432 1098 7654',
    details: 'CLABE: 127180001234567890\nBeneficiario: RIFAS MEXICO SA'
  },
  {
    id: 'oxxo',
    name: 'OXXO',
    icon: '/logos/oxxo.png',
    account: 'Referencia: RF123456',
    details: 'Presenta este código en cualquier OXXO\nReferencia: RF123456'
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleQuickSelect = (option: typeof QUICK_OPTIONS[0]) => {
    setSelectedOption(option);
    quickSelect(option.tickets);
    setStep('details');
  };

  const handleCustomerSubmit = () => {
    if (!customerInfo.name || !customerInfo.whatsapp || !customerInfo.email) {
      toast.error('Por favor completa todos los campos');
      return;
    }
    
    setCustomerData({
      name: customerInfo.name,
      whatsapp: customerInfo.whatsapp,
      email: customerInfo.email,
      paymentMethod: selectedPayment.id as any,
      totalAmount: selectedOption.price
    });
    
    setStep('payment');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success('Comprobante subido exitosamente');
      
      // Simular confirmación después de 2 segundos
      setTimeout(() => {
        toast.success('¡Compra confirmada! Recibirás tu confirmación por email');
        onClose();
        // Reset modal state
        setTimeout(() => {
          setStep('select');
          setUploadedFile(null);
          setCustomerInfo({ name: '', whatsapp: '', email: '' });
        }, 500);
      }, 2000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            {step === 'select' && '🎫 Comprar Boletos'}
            {step === 'details' && '📝 Tus Datos'}
            {step === 'payment' && '💳 Pagar'}
            {step === 'upload' && '📸 Comprobante'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Step 1: Select tickets */}
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center">
                Selecciona cuántos boletos quieres comprar
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {QUICK_OPTIONS.map((option) => (
                  <button
                    key={option.tickets}
                    onClick={() => handleQuickSelect(option)}
                    className={`relative bg-white border-2 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                      option.popular 
                        ? 'border-yellow-400 ring-2 ring-yellow-200' 
                        : 'border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {option.popular && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full">
                        POPULAR
                      </div>
                    )}
                    
                    <div className="text-2xl font-black text-gray-800 mb-1">
                      {option.tickets}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {option.desc}
                    </div>
                    
                    {option.discount > 0 && (
                      <div className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full mb-2">
                        {option.discount}% OFF
                      </div>
                    )}
                    
                    <div className="text-lg font-bold text-green-600">
                      {formatPrice(option.price)}
                    </div>
                    
                    {option.discount > 0 && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatPrice(option.tickets * 50)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Customer details */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 font-medium">
                  {selectedOption.tickets} boletos • {formatPrice(selectedOption.price)}
                </p>
                <p className="text-blue-600 text-sm">
                  Se seleccionarán números aleatorios
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.whatsapp}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+52 55 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <button
                onClick={handleCustomerSubmit}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
              >
                Continuar al Pago
              </button>
            </div>
          )}

          {/* Step 3: Payment method */}
          {step === 'payment' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">
                  Total a pagar: {formatPrice(selectedOption.price)}
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-3">Selecciona método de pago:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method)}
                      className={`p-3 border-2 rounded-lg transition-all duration-200 ${
                        selectedPayment.id === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={method.icon}
                          alt={method.name}
                          width={24}
                          height={24}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">{method.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">Datos para el pago:</h4>
                <div className="space-y-2">
                  <div 
                    className="bg-white border border-gray-200 rounded p-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => copyToClipboard(selectedPayment.account)}
                  >
                    <p className="text-sm font-mono">{selectedPayment.account}</p>
                    <p className="text-xs text-gray-500">Toca para copiar</p>
                  </div>
                  
                  <div className="text-xs text-gray-600 whitespace-pre-line">
                    {selectedPayment.details}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('upload')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Ya Realicé el Pago
              </button>
            </div>
          )}

          {/* Step 4: Upload receipt */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Sube tu comprobante de pago para confirmar tu compra
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <Check className="w-12 h-12 text-green-500 mx-auto" />
                    <p className="text-green-600 font-medium">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Archivo subido correctamente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-gray-600 font-medium">
                      Subir comprobante
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG o PDF • Máx 5MB
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  ⏱️ Tu compra será confirmada en 5-10 minutos después de verificar el pago
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactPurchaseModal;