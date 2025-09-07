#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICACIÓN - ESTADO ACTUAL DE LA BASE DE DATOS
 * Verificar el estado exacto de tickets y compras
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseState() {
  console.log('🔍 VERIFICANDO ESTADO ACTUAL DE LA BASE DE DATOS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Estado de tickets
    console.log('🎫 ESTADO DE TICKETS:');
    
    const { data: ticketStats, error: ticketStatsError } = await supabase
      .from('tickets')
      .select('status')
      .order('status');

    if (ticketStatsError) throw ticketStatsError;

    const statusCounts = {};
    ticketStats?.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} tickets`);
    });
    
    const totalTickets = ticketStats?.length || 0;
    console.log(`   TOTAL: ${totalTickets} tickets en base de datos`);

    // 2. Estado de compras
    console.log('\n💳 ESTADO DE COMPRAS:');
    
    const { data: purchaseStats, error: purchaseStatsError } = await supabase
      .from('purchases')
      .select(`
        status,
        total_amount,
        unit_price,
        customer_id,
        tickets(number, status)
      `)
      .order('created_at', { ascending: false });

    if (purchaseStatsError) throw purchaseStatsError;

    const purchaseStatusCounts = {};
    let totalTicketsFromPurchases = 0;
    let soldTicketsFromPurchases = 0;

    purchaseStats?.forEach(purchase => {
      purchaseStatusCounts[purchase.status] = (purchaseStatusCounts[purchase.status] || 0) + 1;
      
      const ticketCount = purchase.tickets?.length || 0;
      totalTicketsFromPurchases += ticketCount;
      
      const soldCount = purchase.tickets?.filter(t => t.status === 'vendido').length || 0;
      soldTicketsFromPurchases += soldCount;
    });

    Object.entries(purchaseStatusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} compras`);
    });

    console.log(`   TOTAL: ${purchaseStats?.length || 0} compras en base de datos`);

    // 3. Análisis de consistencia
    console.log('\n🔍 ANÁLISIS DE CONSISTENCIA:');
    
    const ticketsVendidos = statusCounts['vendido'] || 0;
    const ticketsDisponibles = statusCounts['disponible'] || 0;
    const ticketsReservados = statusCounts['reservado'] || 0;

    console.log(`   Tickets vendidos (tabla tickets): ${ticketsVendidos}`);
    console.log(`   Tickets vendidos (desde compras): ${soldTicketsFromPurchases}`);
    console.log(`   Tickets en compras confirmadas: ${totalTicketsFromPurchases}`);
    
    // 4. Detalles de compras confirmadas
    console.log('\n📋 DETALLES DE COMPRAS CONFIRMADAS:');
    
    const comprasConfirmadas = purchaseStats?.filter(p => p.status === 'confirmada') || [];
    
    comprasConfirmadas.forEach((compra, index) => {
      const ticketCount = compra.tickets?.length || 0;
      const soldTickets = compra.tickets?.filter(t => t.status === 'vendido').length || 0;
      const availableTickets = compra.tickets?.filter(t => t.status === 'disponible').length || 0;
      
      console.log(`   Compra ${index + 1}:`);
      console.log(`     Customer: ${compra.customer_id}`);
      console.log(`     Total tickets: ${ticketCount}`);
      console.log(`     Tickets vendidos: ${soldTickets}`);
      console.log(`     Tickets disponibles: ${availableTickets}`);
      console.log(`     Monto: $${compra.total_amount}`);
    });

    // 5. Resumen y diagnóstico
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN Y DIAGNÓSTICO:');
    
    const isConsistent = ticketsVendidos === soldTicketsFromPurchases;
    console.log(`   Consistencia: ${isConsistent ? '✅ CORRECTA' : '❌ INCONSISTENTE'}`);
    
    if (!isConsistent) {
      console.log('   ⚠️  PROBLEMA DETECTADO:');
      console.log(`      Tickets vendidos en tabla: ${ticketsVendidos}`);
      console.log(`      Tickets en compras confirmadas: ${soldTicketsFromPurchases}`);
      console.log(`      Diferencia: ${Math.abs(ticketsVendidos - soldTicketsFromPurchases)}`);
    }

    // 6. FOMO Analysis
    console.log('\n🎭 ANÁLISIS PARA CONTADORES FOMO:');
    console.log(`   Tickets reales vendidos: ${ticketsVendidos}`);
    console.log(`   FOMO base típico: +1200`);
    console.log(`   Display esperado: ${ticketsVendidos + 1200}`);
    
    return {
      totalTickets,
      ticketsVendidos,
      ticketsDisponibles,
      totalCompras: purchaseStats?.length || 0,
      comprasConfirmadas: comprasConfirmadas.length,
      isConsistent
    };

  } catch (error) {
    console.error('❌ ERROR:', error);
    throw error;
  }
}

// Ejecutar
if (require.main === module) {
  verifyDatabaseState()
    .then((result) => {
      console.log('\n✅ Verificación completada');
      if (result.isConsistent) {
        console.log('🎉 Base de datos está consistente');
      } else {
        console.log('⚠️  Se requiere corrección');
      }
    })
    .catch((error) => {
      console.error('\n❌ Verificación falló:', error);
      process.exit(1);
    });
}

module.exports = { verifyDatabaseState };