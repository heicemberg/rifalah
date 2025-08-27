// Tipos generados para Supabase Database
export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          state: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          city: string;
          state: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          city?: string;
          state?: string;
          created_at?: string;
        };
      };
      purchases: {
        Row: {
          id: string;
          customer_id: string;
          total_amount: number;
          unit_price: number;
          discount_applied?: number;
          payment_method: string;
          payment_reference?: string;
          payment_proof_url?: string;
          status: 'pendiente' | 'confirmada' | 'cancelada';
          verified_at?: string;
          verified_by?: string;
          notes?: string;
          browser_info?: string;
          device_info?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          total_amount: number;
          unit_price: number;
          discount_applied?: number;
          payment_method: string;
          payment_reference?: string;
          payment_proof_url?: string;
          status?: 'pendiente' | 'confirmada' | 'cancelada';
          verified_at?: string;
          verified_by?: string;
          notes?: string;
          browser_info?: string;
          device_info?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          total_amount?: number;
          unit_price?: number;
          discount_applied?: number;
          payment_method?: string;
          payment_reference?: string;
          payment_proof_url?: string;
          status?: 'pendiente' | 'confirmada' | 'cancelada';
          verified_at?: string;
          verified_by?: string;
          notes?: string;
          browser_info?: string;
          device_info?: string;
          ip_address?: string;
          user_agent?: string;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          number: number;
          status: 'disponible' | 'reservado' | 'vendido';
          customer_id?: string;
          purchase_id?: string;
          reserved_at?: string;
          sold_at?: string;
          created_at?: string;
        };
        Insert: {
          id?: string;
          number: number;
          status?: 'disponible' | 'reservado' | 'vendido';
          customer_id?: string;
          purchase_id?: string;
          reserved_at?: string;
          sold_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: number;
          status?: 'disponible' | 'reservado' | 'vendido';
          customer_id?: string;
          purchase_id?: string;
          reserved_at?: string;
          sold_at?: string;
          created_at?: string;
        };
      };
    };
  };
};