// ============================================================================
// CONFIGURACIÓN DE SUPABASE - OPTIMIZADA PARA NETLIFY PRODUCTION
// Usa la versión optimizada para SSG (Static Site Generation)
// ============================================================================

// SOLUCIÓN DEFINITIVA PARA IPv6/NETLIFY: Usar cliente especializado
import { 
  netlifySupabaseClient,
  createNetlifyCompatibleSupabaseClient,
  testNetlifySupabaseConnection,
  resetNetlifyClient
} from './supabase-netlify-fix';

// Cliente principal optimizado para Netlify
export const supabase = netlifySupabaseClient;

// Funciones de compatibilidad
export const getSupabaseClient = () => netlifySupabaseClient;
export const initializeSupabase = async (): Promise<boolean> => {
  const result = await testNetlifySupabaseConnection();
  return result.success;
};
export const getConnectionStatus = () => ({
  hasInstance: true,
  attempts: 0,
  url: 'netlify-compatible',
  environment: 'netlify-compatible',
  ready: true
});
export const testSupabaseConnection = testNetlifySupabaseConnection;

// Función de reset para debugging
export const resetSupabaseConnection = resetNetlifyClient;

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
 * Actualizar estado de una compra - VERSIÓN MEJORADA CON MEJOR MANEJO
 */
export async function actualizarEstadoCompra(
  purchaseId: string, 
  estado: 'pendiente' | 'confirmada' | 'cancelada',
  notas?: string,
  verificadoPor?: string
) {
  try {
    console.log(`🔄 Actualizando compra ${purchaseId} a estado: ${estado}`);
    
    const { data: purchaseData, error: getError } = await supabase
      .from('purchases')
      .select(`
        *,
        customer:customers(*),
        tickets(*)
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
      
      // Solo asignar si no tiene tickets ya
      if (!purchaseData.tickets || purchaseData.tickets.length === 0) {
        try {
          tickets = await asignarNumerosDisponibles(
            purchaseId, 
            updatedPurchase.customer_id, 
            cantidadBoletos
          );
          console.log(`✅ Compra confirmada y ${tickets.length} tickets asignados`);
        } catch (ticketError) {
          console.error('❌ Error al asignar tickets:', ticketError);
          
          // Revertir estado a pendiente si no se pudieron asignar tickets
          await supabase
            .from('purchases')
            .update({ status: 'pendiente' })
            .eq('id', purchaseId);
          
          throw new Error(`No se pudo confirmar: ${ticketError instanceof Error ? ticketError.message : 'Error al asignar tickets'}`);
        }
      } else {
        console.log(`ℹ️ La compra ya tiene ${purchaseData.tickets.length} tickets asignados`);
        tickets = purchaseData.tickets;
      }
    }

    // Liberar tickets si se cancela
    if (estado === 'cancelada') {
      const { error: releaseError } = await supabase
        .from('tickets')
        .update({
          status: 'disponible',
          customer_id: null,
          purchase_id: null,
          sold_at: null,
          reserved_at: null
        })
        .eq('purchase_id', purchaseId);
      
      if (releaseError) {
        console.error('❌ Error al liberar tickets:', releaseError);
      } else {
        console.log('🔄 Tickets liberados por cancelación');
      }
    }

    // Obtener datos finales actualizados
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

    console.log('✅ Compra actualizada correctamente');
    return finalData as CompraConDetalles;
  } catch (error) {
    console.error('❌ Error en actualizarEstadoCompra:', error);
    throw error;
  }
}

/**
 * Asignar números de tickets disponibles automáticamente - VERSIÓN MEJORADA
 */
export async function asignarNumerosDisponibles(
  purchaseId: string, 
  customerId: string, 
  cantidadBoletos: number
): Promise<Ticket[]> {
  try {
    console.log(`🎫 Intentando asignar ${cantidadBoletos} tickets para compra ${purchaseId}`);
    
    const { data: ticketsDisponibles, error: selectError } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'disponible')
      .order('number')
      .limit(cantidadBoletos);

    if (selectError) throw selectError;

    if (!ticketsDisponibles || ticketsDisponibles.length < cantidadBoletos) {
      const disponibles = ticketsDisponibles?.length || 0;
      throw new Error(`Insuficientes tickets disponibles. Solo hay ${disponibles}, necesitas ${cantidadBoletos}`);
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

/**
 * Inicializar la base de datos con todos los tickets disponibles (1-10000)
 */
export async function inicializarTickets(): Promise<boolean> {
  try {
    console.log('🚀 Inicializando base de datos de tickets...');
    
    // Verificar si ya existen tickets
    const { count, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    if (count && count > 0) {
      console.log(`ℹ️ Ya existen ${count} tickets en la base de datos`);
      return true;
    }

    // Crear todos los tickets del 1 al 10000
    const tickets: Omit<Ticket, 'id' | 'created_at'>[] = [];
    for (let i = 1; i <= 10000; i++) {
      tickets.push({
        number: i,
        status: 'disponible'
      });
    }

    console.log('📝 Insertando 10,000 tickets...');
    
    // Insertar en lotes de 1000 para evitar límites
    const batchSize = 1000;
    for (let i = 0; i < tickets.length; i += batchSize) {
      const batch = tickets.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('tickets')
        .insert(batch);

      if (insertError) {
        console.error(`❌ Error insertando lote ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }
      
      console.log(`✅ Lote ${i / batchSize + 1}/${Math.ceil(tickets.length / batchSize)} insertado`);
    }

    console.log('✅ Base de datos de tickets inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar tickets:', error);
    return false;
  }
}

/**
 * Obtener estadísticas de tickets en tiempo real
 */
export async function obtenerEstadisticasTickets(): Promise<{
  total: number;
  disponibles: number;
  vendidos: number;
  reservados: number;
} | null> {
  try {
    const { data: stats, error } = await supabase
      .from('tickets')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const counts = {
          total: data?.length || 0,
          disponibles: data?.filter(t => t.status === 'disponible').length || 0,
          vendidos: data?.filter(t => t.status === 'vendido').length || 0,
          reservados: data?.filter(t => t.status === 'reservado').length || 0
        };
        
        return { data: counts, error: null };
      });

    if (error) throw error;
    return stats;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return null;
  }
}