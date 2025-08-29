// ============================================================================
// INTEGRACIÓN SUPABASE PARA SISTEMA DE RIFAS
// ============================================================================
// Funciones TypeScript para integrar con la base de datos optimizada

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// TIPOS TYPESCRIPT PARA LA BASE DE DATOS
// ============================================================================

export interface DatabaseTicket {
  id: string;
  number: number;
  ticket_code: string;
  status: 'available' | 'selected' | 'reserved' | 'sold';
  customer_id?: string;
  purchase_id?: string;
  reserved_at?: string;
  sold_at?: string;
  reservation_expires_at?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface DatabaseCustomer {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  city?: string;
  state?: string;
  is_recurring: boolean;
  total_purchases: number;
  total_spent: number;
  loyalty_points: number;
  status: 'active' | 'verified' | 'suspended' | 'blocked';
  email_verified: boolean;
  whatsapp_verified: boolean;
  created_at: string;
  updated_at: string;
  last_purchase_at?: string;
  preferences?: Record<string, any>;
  notes?: string;
}

export interface DatabasePurchase {
  id: string;
  customer_id: string;
  ticket_count: number;
  total_amount: number;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  payment_method: 'binance' | 'bancoppel' | 'bancoazteca' | 'oxxo' | 'spei' | 'tarjeta';
  status: 'pending' | 'confirmed' | 'verified' | 'completed' | 'cancelled' | 'failed';
  step_1_completed: boolean;
  step_2_completed: boolean;
  step_3_completed: boolean;
  step_4_completed: boolean;
  step_1_completed_at?: string;
  step_2_completed_at?: string;
  step_3_completed_at?: string;
  step_4_completed_at?: string;
  payment_reference?: string;
  payment_account?: string;
  payment_details?: Record<string, any>;
  confirmed_at?: string;
  confirmed_by?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  admin_notes?: string;
  metadata?: Record<string, any>;
}

export interface DatabaseReceipt {
  id: string;
  purchase_id: string;
  customer_id: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  file_extension: string;
  original_url: string;
  compressed_url?: string;
  thumbnail_url?: string;
  ocr_text?: string;
  ocr_confidence?: number;
  parsed_amount?: number;
  parsed_date?: string;
  parsed_reference?: string;
  parsed_account?: string;
  parsed_bank?: string;
  parsed_method?: string;
  status: 'pending' | 'processing' | 'verified' | 'rejected' | 'invalid';
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  uploaded_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  ocr_metadata?: Record<string, any>;
  processing_metadata?: Record<string, any>;
  admin_metadata?: Record<string, any>;
}

export interface DatabaseLiveActivity {
  id: string;
  buyer_name: string;
  ticket_count: number;
  purchase_id?: string;
  activity_type: string;
  created_at: string;
  expires_at: string;
}

export interface RaffleStats {
  total_tickets: number;
  available_tickets: number;
  reserved_tickets: number;
  sold_tickets: number;
  sold_percentage: number;
  total_revenue: number;
  pending_purchases: number;
  completed_purchases: number;
}

// ============================================================================
// CLASE PRINCIPAL PARA INTEGRACIÓN CON SUPABASE
// ============================================================================

export class SupabaseRaffleClient {
  private supabase;

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // ============================================================================
  // MÉTODOS PARA TICKETS
  // ============================================================================

  /**
   * Obtiene todos los tickets con su estado actual
   */
  async getAllTickets(): Promise<DatabaseTicket[]> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('*')
      .order('number');

    if (error) throw error;
    return data || [];
  }

  /**
   * Obtiene solo los tickets disponibles reales (sin FOMO)
   */
  async getRealAvailableTickets(): Promise<number[]> {
    const { data, error } = await this.supabase
      .rpc('get_real_available_tickets');

    if (error) throw error;
    return data?.map((item: any) => item.ticket_number) || [];
  }

  /**
   * Obtiene tickets por estado específico
   */
  async getTicketsByStatus(status: DatabaseTicket['status']): Promise<DatabaseTicket[]> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('*')
      .eq('status', status)
      .order('number');

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // MÉTODOS PARA COMPRAS (CompactPurchaseModal)
  // ============================================================================

  /**
   * Crea una compra completa con los datos del CompactPurchaseModal
   */
  async createCompletePurchase(purchaseData: {
    customerInfo: {
      name: string;
      email: string;
      whatsapp: string;
      city?: string;
      state?: string;
    };
    selectedOption: {
      tickets: number;
      price: number;
      discount: number;
    };
    selectedPayment: {
      id: string;
      name: string;
      account: string;
    };
  }): Promise<{
    success: boolean;
    message: string;
    purchaseId?: string;
    customerId?: string;
    reservedTickets?: number[];
  }> {
    const { data, error } = await this.supabase.rpc('create_complete_purchase', {
      p_customer_data: {
        name: purchaseData.customerInfo.name,
        email: purchaseData.customerInfo.email,
        whatsapp: purchaseData.customerInfo.whatsapp,
        city: purchaseData.customerInfo.city || 'Ciudad de México',
        state: purchaseData.customerInfo.state || 'CDMX'
      },
      p_ticket_count: purchaseData.selectedOption.tickets,
      p_total_amount: purchaseData.selectedOption.price,
      p_payment_method: purchaseData.selectedPayment.id,
      p_discount_percentage: purchaseData.selectedOption.discount
    });

    if (error) {
      console.error('Error creating purchase:', error);
      return { success: false, message: error.message };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      message: result?.message || 'Error desconocido',
      purchaseId: result?.purchase_id,
      customerId: result?.customer_id,
      reservedTickets: result?.reserved_tickets
    };
  }

  /**
   * Procesa la subida del comprobante (Paso 4 del modal)
   */
  async processUploadedReceipt(receiptData: {
    purchaseId: string;
    customerId: string;
    file: File;
    originalUrl: string;
    compressedUrl?: string;
    thumbnailUrl?: string;
  }): Promise<{
    success: boolean;
    message: string;
    receiptId?: string;
  }> {
    const { data, error } = await this.supabase.rpc('process_uploaded_receipt', {
      p_purchase_id: receiptData.purchaseId,
      p_customer_id: receiptData.customerId,
      p_filename: receiptData.file.name,
      p_file_size: receiptData.file.size,
      p_file_type: receiptData.file.type,
      p_original_url: receiptData.originalUrl,
      p_compressed_url: receiptData.compressedUrl,
      p_thumbnail_url: receiptData.thumbnailUrl
    });

    if (error) {
      console.error('Error processing receipt:', error);
      return { success: false, message: error.message };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      message: result?.message || 'Error desconocido',
      receiptId: result?.receipt_id
    };
  }

  // ============================================================================
  // MÉTODOS PARA CLIENTES
  // ============================================================================

  /**
   * Busca un cliente por email o WhatsApp
   */
  async findCustomer(email: string, whatsapp: string): Promise<DatabaseCustomer | null> {
    const { data, error } = await this.supabase
      .from('customers')
      .select('*')
      .or(`email.eq.${email},whatsapp.eq.${whatsapp}`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data;
  }

  /**
   * Obtiene el historial de compras de un cliente
   */
  async getCustomerHistory(customerEmail: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('get_customer_history', {
        p_customer_email: customerEmail
      });

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // MÉTODOS PARA ADMINISTRACIÓN
  // ============================================================================

  /**
   * Obtiene compras pendientes de verificación
   */
  async getPendingVerifications(limit: number = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('get_pending_verifications', {
        limit_count: limit
      });

    if (error) throw error;
    return data || [];
  }

  /**
   * Aprueba una compra y marca tickets como vendidos
   */
  async approvePurchase(
    purchaseId: string,
    adminEmail: string,
    adminNotes?: string
  ): Promise<{
    success: boolean;
    message: string;
    soldTickets?: number[];
  }> {
    const { data, error } = await this.supabase.rpc('approve_purchase', {
      p_purchase_id: purchaseId,
      p_admin_email: adminEmail,
      p_admin_notes: adminNotes
    });

    if (error) {
      console.error('Error approving purchase:', error);
      return { success: false, message: error.message };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      message: result?.message || 'Error desconocido',
      soldTickets: result?.sold_tickets
    };
  }

  /**
   * Rechaza un comprobante
   */
  async rejectReceipt(
    receiptId: string,
    adminEmail: string,
    rejectionReason: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const { data, error } = await this.supabase.rpc('reject_receipt', {
      p_receipt_id: receiptId,
      p_admin_email: adminEmail,
      p_rejection_reason: rejectionReason
    });

    if (error) {
      console.error('Error rejecting receipt:', error);
      return { success: false, message: error.message };
    }

    const result = data?.[0];
    return {
      success: result?.success || false,
      message: result?.message || 'Error desconocido'
    };
  }

  // ============================================================================
  // MÉTODOS PARA ESTADÍSTICAS
  // ============================================================================

  /**
   * Obtiene estadísticas en tiempo real
   */
  async getRaffleStats(): Promise<RaffleStats> {
    const { data, error } = await this.supabase
      .rpc('get_raffle_stats');

    if (error) throw error;
    
    const stats = data?.[0];
    return {
      total_tickets: stats?.total_tickets || 10000,
      available_tickets: stats?.available_tickets || 10000,
      reserved_tickets: stats?.reserved_tickets || 0,
      sold_tickets: stats?.sold_tickets || 0,
      sold_percentage: stats?.sold_percentage || 0,
      total_revenue: stats?.total_revenue || 0,
      pending_purchases: stats?.pending_purchases || 0,
      completed_purchases: stats?.completed_purchases || 0
    };
  }

  /**
   * Obtiene actividades recientes para FOMO
   */
  async getRecentActivities(limit: number = 10): Promise<DatabaseLiveActivity[]> {
    const { data, error } = await this.supabase
      .rpc('get_recent_activities', {
        limit_count: limit
      });

    if (error) throw error;
    return data || [];
  }

  // ============================================================================
  // MÉTODOS PARA TIEMPO REAL (REAL-TIME SUBSCRIPTIONS)
  // ============================================================================

  /**
   * Suscribe a cambios en tickets para actualizaciones en tiempo real
   */
  subscribeToTicketChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('ticket_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        callback
      )
      .subscribe();
  }

  /**
   * Suscribe a nuevas actividades en vivo
   */
  subscribeToLiveActivities(callback: (payload: any) => void) {
    return this.supabase
      .channel('live_activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_activities'
        },
        callback
      )
      .subscribe();
  }

  /**
   * Suscribe a cambios en compras para el admin
   */
  subscribeToPurchaseChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('purchase_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases'
        },
        callback
      )
      .subscribe();
  }

  // ============================================================================
  // MÉTODOS PARA STORAGE (COMPROBANTES)
  // ============================================================================

  /**
   * Sube un comprobante al storage de Supabase
   */
  async uploadReceipt(
    file: File,
    purchaseId: string,
    customerId: string
  ): Promise<{
    success: boolean;
    originalUrl?: string;
    error?: string;
  }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${purchaseId}_${customerId}_${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }

    // Obtener URL pública
    const { data: urlData } = this.supabase.storage
      .from('receipts')
      .getPublicUrl(data.path);

    return {
      success: true,
      originalUrl: urlData.publicUrl
    };
  }

  /**
   * Obtiene URL firmada de un comprobante
   */
  async getReceiptSignedUrl(
    receiptId: string,
    type: 'original' | 'compressed' | 'thumbnail' = 'original'
  ): Promise<string | null> {
    const { data, error } = await this.supabase
      .rpc('get_receipt_signed_url', {
        p_receipt_id: receiptId,
        p_type: type
      });

    if (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }

    return data;
  }

  // ============================================================================
  // MÉTODOS DE MANTENIMIENTO
  // ============================================================================

  /**
   * Ejecuta tareas de mantenimiento automático
   */
  async runMaintenance(): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('maintenance_cleanup');

    if (error) throw error;
    return data || [];
  }

  /**
   * Libera reservas expiradas manualmente
   */
  async releaseExpiredReservations(): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('release_expired_reservations');

    if (error) throw error;
    return data || 0;
  }
}

// ============================================================================
// HOOK PERSONALIZADO PARA REACT
// ============================================================================

import { useEffect, useState, useCallback } from 'react';

export function useSupabaseRaffle(supabaseUrl: string, supabaseAnonKey: string) {
  const [client] = useState(() => new SupabaseRaffleClient(supabaseUrl, supabaseAnonKey));
  const [stats, setStats] = useState<RaffleStats | null>(null);
  const [activities, setActivities] = useState<DatabaseLiveActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, activitiesData] = await Promise.all([
        client.getRaffleStats(),
        client.getRecentActivities(10)
      ]);

      setStats(statsData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Configurar suscripciones en tiempo real
  useEffect(() => {
    // Suscripción a cambios en tickets
    const ticketSubscription = client.subscribeToTicketChanges(() => {
      // Recargar estadísticas cuando cambien los tickets
      client.getRaffleStats().then(setStats).catch(console.error);
    });

    // Suscripción a nuevas actividades
    const activitySubscription = client.subscribeToLiveActivities((payload) => {
      if (payload.eventType === 'INSERT') {
        setActivities(prev => [payload.new, ...prev.slice(0, 9)]);
      }
    });

    // Cargar datos iniciales
    loadInitialData();

    // Cleanup subscriptions
    return () => {
      ticketSubscription.unsubscribe();
      activitySubscription.unsubscribe();
    };
  }, [client, loadInitialData]);

  return {
    client,
    stats,
    activities,
    loading,
    error,
    refetch: loadInitialData
  };
}

// ============================================================================
// UTILIDADES DE INTEGRACIÓN
// ============================================================================

/**
 * Convierte datos del CompactPurchaseModal al formato de la base de datos
 */
export function convertModalDataToPurchase(modalData: {
  customerInfo: { name: string; whatsapp: string; email: string };
  selectedOption: { tickets: number; price: number; discount: number };
  selectedPayment: { id: string; name: string; account: string };
}) {
  return {
    customerInfo: {
      name: modalData.customerInfo.name,
      email: modalData.customerInfo.email,
      whatsapp: modalData.customerInfo.whatsapp,
      city: 'Ciudad de México', // Default
      state: 'CDMX' // Default
    },
    selectedOption: modalData.selectedOption,
    selectedPayment: modalData.selectedPayment
  };
}

/**
 * Formatea nombre del comprador para actividades FOMO
 */
export function formatBuyerNameForActivity(fullName: string): string {
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) return 'Usuario';
  if (parts.length === 1) return parts[0];
  
  const firstName = parts[0];
  const lastNameInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastNameInitial}.`;
}

/**
 * Calcula descuento basado en cantidad de tickets
 */
export function calculateTicketDiscount(ticketCount: number): number {
  if (ticketCount >= 25) return 40;
  if (ticketCount >= 10) return 20;
  if (ticketCount >= 5) return 10;
  return 0;
}

export default SupabaseRaffleClient;