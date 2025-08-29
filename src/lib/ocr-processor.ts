import { createWorker } from 'tesseract.js';
import sharp from 'sharp';

export interface ReceiptData {
  amount?: number;
  reference?: string;
  date?: Date;
  bank?: string;
  transactionId?: string;
  confidence: number;
  extractedText: string;
}

// Patrones para bancos mexicanos
const BANK_PATTERNS = {
  binance: {
    amount: [/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi, /(\d+(?:,\d{3})*(?:\.\d{2})?) USD/gi],
    reference: [/ID:\s*([A-Za-z0-9]+)/gi, /transaction:\s*([A-Za-z0-9]+)/gi],
    date: [/(\d{1,2}\/\d{1,2}\/\d{4})/g, /(\d{4}-\d{2}-\d{2})/g],
    bank: 'Binance Pay'
  },
  bancoppel: {
    amount: [/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi, /monto:\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi],
    reference: [/referencia:\s*([A-Za-z0-9\-]+)/gi, /ref\.\s*([A-Za-z0-9\-]+)/gi],
    date: [/(\d{1,2}\/\d{1,2}\/\d{4})/g, /fecha:\s*(\d{1,2}\/\d{1,2}\/\d{4})/gi],
    bank: 'BanCoppel'
  },
  bancoazteca: {
    amount: [/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi, /importe:\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/gi],
    reference: [/referencia:\s*([A-Za-z0-9\-]+)/gi, /folio:\s*([A-Za-z0-9\-]+)/gi],
    date: [/(\d{1,2}\/\d{1,2}\/\d{4})/g, /fecha:\s*(\d{1,2}\/\d{1,2}\/\d{4})/gi],
    bank: 'Banco Azteca'
  },
  mercadopago: {
    amount: [/\$\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/gi, /(\d+(?:,\d{3})*(?:\.\d{2})?) pesos/gi],
    reference: [/c[oó]digo:\s*([A-Za-z0-9\-]+)/gi, /operaci[oó]n:\s*([A-Za-z0-9\-]+)/gi],
    date: [/(\d{1,2}\/\d{1,2}\/\d{4})/g, /(\d{1,2} de \w+ de \d{4})/gi],
    bank: 'MercadoPago'
  }
};

export class OCRProcessor {
  private worker: any = null;
  
  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('spa');
    }
  }

  async compressImage(file: File): Promise<Buffer> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return await sharp(buffer)
      .resize(1200, 1200, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .toBuffer();
  }

  async extractText(imageBuffer: Buffer): Promise<string> {
    await this.initialize();
    
    const { data: { text, confidence } } = await this.worker.recognize(imageBuffer);
    
    if (confidence < 60) {
      console.warn('Low OCR confidence:', confidence);
    }
    
    return text;
  }

  parseReceiptData(text: string, expectedAmount: number): ReceiptData {
    const normalizedText = text.toLowerCase();
    let detectedBank = '';
    let patterns: any = null;

    // Detectar banco
    if (normalizedText.includes('binance') || normalizedText.includes('bnb')) {
      detectedBank = 'binance';
      patterns = BANK_PATTERNS.binance;
    } else if (normalizedText.includes('bancoppel') || normalizedText.includes('coppel')) {
      detectedBank = 'bancoppel';
      patterns = BANK_PATTERNS.bancoppel;
    } else if (normalizedText.includes('azteca')) {
      detectedBank = 'bancoazteca';
      patterns = BANK_PATTERNS.bancoazteca;
    } else if (normalizedText.includes('mercadopago') || normalizedText.includes('mercado pago')) {
      detectedBank = 'mercadopago';
      patterns = BANK_PATTERNS.mercadopago;
    }

    let confidence = 50; // Base confidence
    const result: ReceiptData = {
      extractedText: text,
      confidence,
      bank: patterns?.bank || 'Desconocido'
    };

    if (patterns) {
      // Extraer monto
      for (const amountPattern of patterns.amount) {
        const amountMatch = text.match(amountPattern);
        if (amountMatch) {
          const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
          result.amount = amount;
          
          // Verificar si coincide con el monto esperado (±10%)
          const tolerance = expectedAmount * 0.1;
          if (Math.abs(amount - expectedAmount) <= tolerance) {
            confidence += 30;
          }
          break;
        }
      }

      // Extraer referencia
      for (const refPattern of patterns.reference) {
        const refMatch = text.match(refPattern);
        if (refMatch) {
          result.reference = refMatch[1].trim();
          confidence += 15;
          break;
        }
      }

      // Extraer fecha
      for (const datePattern of patterns.date) {
        const dateMatch = text.match(datePattern);
        if (dateMatch) {
          try {
            result.date = new Date(dateMatch[1]);
            confidence += 10;
          } catch (e) {
            console.warn('Invalid date format:', dateMatch[1]);
          }
          break;
        }
      }

      // Extraer ID de transacción
      const transactionPatterns = [
        /transacci[oó]n:\s*([A-Za-z0-9]+)/gi,
        /operaci[oó]n:\s*([A-Za-z0-9]+)/gi,
        /folio:\s*([A-Za-z0-9]+)/gi
      ];

      for (const txPattern of transactionPatterns) {
        const txMatch = text.match(txPattern);
        if (txMatch) {
          result.transactionId = txMatch[1].trim();
          confidence += 10;
          break;
        }
      }
    }

    result.confidence = Math.min(confidence, 100);
    return result;
  }

  async processReceipt(file: File, expectedAmount: number): Promise<ReceiptData> {
    try {
      // Comprimir imagen
      const compressedBuffer = await this.compressImage(file);
      
      // Extraer texto
      const extractedText = await this.extractText(compressedBuffer);
      
      // Parsear datos
      const receiptData = this.parseReceiptData(extractedText, expectedAmount);
      
      return receiptData;
    } catch (error) {
      console.error('OCR processing error:', error);
      return {
        extractedText: '',
        confidence: 0,
        bank: 'Error'
      };
    }
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

// Hook para usar OCR en componentes React
export const useOCRProcessor = () => {
  const processor = new OCRProcessor();

  const processFile = async (file: File, expectedAmount: number) => {
    return await processor.processReceipt(file, expectedAmount);
  };

  const cleanup = async () => {
    await processor.cleanup();
  };

  return { processFile, cleanup };
};