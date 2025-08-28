// ============================================================================
// CONFIGURACIÓN DE SUPABASE - OPTIMIZADA PARA NETLIFY PRODUCTION
// Usa la versión optimizada para SSG (Static Site Generation)
// ============================================================================

import { 
  supabase as supabaseClient, 
  getSupabaseClient, 
  initializeSupabase, 
  getConnectionStatus,
  testSupabaseConnection
} from './supabase-production';

// Re-exportar cliente y funciones útiles
export const supabase = supabaseClient;
export { getSupabaseClient, initializeSupabase, getConnectionStatus, testSupabaseConnection };

// ============================================================================
// TIPOS DE DATOS PARA LA BASE DE DATOS
// ============================================================================

export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  created_at?: string;
}

export interface Purchase {
  id?: string;
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
}

export interface Ticket {
  id?: string;
  number: number;
  status: 'disponible' | 'reservado' | 'vendido';
  customer_id?: string;
  purchase_id?: string;
  reserved_at?: string;
  sold_at?: string;
  created_at?: string;
}

export interface CompraCompleta {
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  estado: string;
  ciudad: string;
  info_adicional?: string;
  cantidad_boletos: number;
  numeros_boletos: number[];
  precio_unitario: number;
  precio_total: number;
  descuento_aplicado?: number;
  metodo_pago: string;
  referencia_pago?: string;
  captura_comprobante_url?: string;
  navegador?: string;
  dispositivo?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CompraConDetalles extends Purchase {
  customer: Customer;
  tickets: Ticket[];
}

// ============================================================================
// FUNCIONES DE BASE DE DATOS CON MANEJO ROBUSTO DE ERRORES
// ============================================================================

/**
 * Verificar conexión con manejo de errores específicos
 */
export async function verificarConexion(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error de conexión Supabase:', error.message);
      
      // Errores específicos de base de datos pausada
      if (error.message.includes('database is paused') || 
          error.message.includes('project is paused') ||
          error.message.includes('timeout')) {
        console.error('🚨 Base de datos pausada. Revisa tu plan de Supabase.');
        throw new Error('Base de datos pausada. Contacta al administrador o actualiza el plan.');
      }
      
      return false;
    }

    console.log('✅ Conexión Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error crítico de conexión:', error);
    return false;
  }
}

/**
 * Guarda una compra completa con manejo robusto de errores
 */
export async function guardarCompra(datosCompra: CompraCompleta): Promise<{ customer: Customer; purchase: Purchase; tickets: Ticket[] }> {
  try {
    // Verificar conexión primero
    const isConnected = await verificarConexion();
    if (!isConnected) {
      throw new Error('No se pudo establecer conexión con la base de datos. Intenta más tarde.');
    }

    console.log('💾 Guardando compra:', datosCompra);

    // Crear cliente
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        name: `${datosCompra.nombre} ${datosCompra.apellidos}`,
        email: datosCompra.email,
        phone: datosCompra.telefono,
        city: datosCompra.ciudad,
        state: datosCompra.estado
      }])
      .select()
      .single();

    if (customerError) {
      console.error('❌ Error al crear cliente:', customerError);
      throw new Error(`Error al crear cliente: ${customerError.message}`);
    }

    // Crear compra
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert([{
        customer_id: customer.id,
        total_amount: datosCompra.precio_total,
        unit_price: datosCompra.precio_unitario,
        discount_applied: datosCompra.descuento_aplicado || 0,
        payment_method: datosCompra.metodo_pago,
        payment_reference: datosCompra.referencia_pago,
        payment_proof_url: datosCompra.captura_comprobante_url,
        browser_info: datosCompra.navegador,
        device_info: datosCompra.dispositivo,
        ip_address: datosCompra.ip_address,
        user_agent: datosCompra.user_agent,
        status: 'pendiente'
      }])
      .select()
      .single();

    if (purchaseError) {
      console.error('❌ Error al crear compra:', purchaseError);
      throw new Error(`Error al crear compra: ${purchaseError.message}`);
    }

    const resultado = {
      customer,
      purchase,
      tickets: []
    };

    console.log('✅ Compra guardada exitosamente');
    return resultado;
  } catch (error) {
    console.error('❌ Error completo en guardarCompra:', error);
    throw error;
  }
}

/**
 * Obtener metadata del dispositivo
 */
export function obtenerMetadata() {
  if (typeof window === 'undefined') return {};
  
  return {
    navegador: navigator.userAgent,
    dispositivo: /Mobi|Android/i.test(navigator.userAgent) ? 'móvil' : 'escritorio',
    user_agent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    idioma: navigator.language,
    pantalla: `${screen.width}x${screen.height}`,
  };
}

/**
 * Subir archivo a Supabase Storage
 */
export async function subirCaptura(archivo: File, nombreCliente: string): Promise<string | null> {
  try {
    const timestamp = new Date().getTime();
    const extension = archivo.name.split('.').pop();
    const nombreArchivo = `capturas/${nombreCliente.replace(/\s+/g, '_')}_${timestamp}.${extension}`;

    const { data, error } = await supabase.storage
      .from('comprobantes')
      .upload(nombreArchivo, archivo);

    if (error) {
      console.error('❌ Error al subir archivo:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('comprobantes')
      .getPublicUrl(nombreArchivo);

    console.log('✅ Archivo subido exitosamente');
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('❌ Error en subirCaptura:', error);
    return null;
  }
}

/**
 * Obtener todas las compras (para admin)
 */
export async function obtenerCompras(): Promise<CompraConDetalles[]> {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        customer:customers(*),
        tickets(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al obtener compras:', error);
      throw error;
    }

    return data as CompraConDetalles[];
  } catch (error) {
    console.error('❌ Error en obtenerCompras:', error);
    throw error;
  }
}

/**
 * Actualizar estado de una compra
 */
export async function actualizarEstadoCompra(
  purchaseId: string, 
  estado: 'pendiente' | 'confirmada' | 'cancelada',
  notas?: string,
  verificadoPor?: string
) {
  try {
    const { data: purchaseData, error: getError } = await supabase
      .from('purchases')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', purchaseId)
      .single();

    if (getError) throw getError;

    const updates: Partial<Purchase> = {
      status: estado,
      notes: notas,
      verified_by: verificadoPor
    };

    if (estado === 'confirmada') {
      updates.verified_at = new Date().toISOString();
    }

    const { data: updatedPurchase, error: updateError } = await supabase
      .from('purchases')
      .update(updates)
      .eq('id', purchaseId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Asignar tickets si se confirma
    let tickets: Ticket[] = [];
    if (estado === 'confirmada') {
      const cantidadBoletos = Math.round(updatedPurchase.total_amount / updatedPurchase.unit_price);
      
      try {
        tickets = await asignarNumerosDisponibles(
          purchaseId, 
          updatedPurchase.customer_id, 
          cantidadBoletos
        );
        console.log(`✅ Compra confirmada y ${tickets.length} tickets asignados`);
      } catch (ticketError) {
        console.error('❌ Error al asignar tickets:', ticketError);
        await supabase
          .from('purchases')
          .update({ status: 'pendiente' })
          .eq('id', purchaseId);
        
        throw new Error(`No se pudo confirmar: ${ticketError instanceof Error ? ticketError.message : 'Error al asignar tickets'}`);
      }
    }

    // Liberar tickets si se cancela
    if (estado === 'cancelada') {
      await supabase
        .from('tickets')
        .update({
          status: 'disponible',
          customer_id: null,
          purchase_id: null,
          sold_at: null
        })
        .eq('purchase_id', purchaseId);
      
      console.log('🔄 Tickets liberados por cancelación');
    }

    const { data: finalData, error: finalError } = await supabase
      .from('purchases')
      .select(`
        *,
        customer:customers(*),
        tickets(*)
      `)
      .eq('id', purchaseId)
      .single();

    if (finalError) throw finalError;

    console.log('✅ Compra actualizada');
    return finalData as CompraConDetalles;
  } catch (error) {
    console.error('❌ Error en actualizarEstadoCompra:', error);
    throw error;
  }
}

/**
 * Asignar números de tickets disponibles automáticamente
 */
export async function asignarNumerosDisponibles(
  purchaseId: string, 
  customerId: string, 
  cantidadBoletos: number
): Promise<Ticket[]> {
  try {
    const { data: ticketsDisponibles, error: selectError } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'disponible')
      .order('number')
      .limit(cantidadBoletos);

    if (selectError) throw selectError;

    if (!ticketsDisponibles || ticketsDisponibles.length < cantidadBoletos) {
      throw new Error(`Solo hay ${ticketsDisponibles?.length || 0} tickets disponibles, necesitas ${cantidadBoletos}`);
    }

    const numerosAsignados = ticketsDisponibles.map((t: any) => t.number);
    const ahora = new Date().toISOString();

    const { data: ticketsActualizados, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'vendido',
        customer_id: customerId,
        purchase_id: purchaseId,
        sold_at: ahora
      })
      .in('number', numerosAsignados)
      .select();

    if (updateError) throw updateError;

    console.log(`✅ Asignados ${ticketsActualizados?.length} tickets:`, numerosAsignados);
    return ticketsActualizados || [];
  } catch (error) {
    console.error('❌ Error al asignar números:', error);
    throw error;
  }
}