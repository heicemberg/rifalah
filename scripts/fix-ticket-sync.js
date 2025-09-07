#!/usr/bin/env node

/**
 * SCRIPT DE MIGRACIÓN - ARREGLAR SINCRONIZACIÓN DE TICKETS
 * 
 * Problema: Compras confirmadas tienen tickets con status 'disponible' 
 * en lugar de 'vendido'
 * 
 * Solución: Marcar todos los tickets de compras confirmadas como 'vendido'
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTicketSynchronization() {
  console.log('🔧 INICIANDO MIGRACIÓN DE SINCRONIZACIÓN DE TICKETS');
  console.log('=' .repeat(60));
  
  try {
    // 1. Obtener todas las compras confirmadas
    console.log('📋 Buscando compras confirmadas...');
    const { data: comprasConfirmadas, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        id,
        customer_id,
        status,
        total_amount,
        unit_price,
        created_at,
        tickets(number, status, purchase_id)
      `)
      .eq('status', 'confirmada');

    if (purchasesError) throw purchasesError;

    console.log(`✅ Encontradas ${comprasConfirmadas?.length || 0} compras confirmadas`);

    if (!comprasConfirmadas || comprasConfirmadas.length === 0) {
      console.log('ℹ️  No hay compras confirmadas para procesar');
      return;
    }

    // 2. Analizar estado actual
    let totalTicketsToFix = 0;
    let ticketsAlreadyFixed = 0;
    
    const comprasConProblemas = [];

    for (const compra of comprasConfirmadas) {
      const tickets = compra.tickets || [];
      const ticketsDisponibles = tickets.filter(t => t.status === 'disponible').length;
      const ticketsVendidos = tickets.filter(t => t.status === 'vendido').length;
      
      if (ticketsDisponibles > 0) {
        comprasConProblemas.push({
          id: compra.id,
          customerId: compra.customer_id,
          ticketsDisponibles: ticketsDisponibles,
          ticketsVendidos: ticketsVendidos,
          totalTickets: tickets.length,
          numbers: tickets.map(t => t.number)
        });
        totalTicketsToFix += ticketsDisponibles;
      } else {
        ticketsAlreadyFixed += ticketsVendidos;
      }
    }

    console.log('\n📊 ANÁLISIS DE ESTADO ACTUAL:');
    console.log(`   Compras con problemas: ${comprasConProblemas.length}`);
    console.log(`   Tickets a arreglar: ${totalTicketsToFix}`);
    console.log(`   Tickets ya correctos: ${ticketsAlreadyFixed}`);

    if (comprasConProblemas.length === 0) {
      console.log('✅ Todos los tickets están correctamente sincronizados');
      return;
    }

    // 3. Confirmar antes de proceder
    console.log('\n⚠️  ATENCIÓN: Este script va a:');
    console.log(`   • Marcar ${totalTicketsToFix} tickets como 'vendido'`);
    console.log(`   • Actualizar ${comprasConProblemas.length} compras`);
    console.log(`   • Establecer sold_at timestamp`);
    
    // En producción, podrías descomentar esto para confirmación manual:
    // const readline = require('readline').createInterface({
    //   input: process.stdin,
    //   output: process.stdout
    // });
    // const answer = await new Promise(resolve => {
    //   readline.question('¿Continuar? (y/N): ', resolve);
    // });
    // readline.close();
    // if (answer.toLowerCase() !== 'y') {
    //   console.log('❌ Migración cancelada');
    //   return;
    // }

    // 4. Procesar cada compra con problemas
    console.log('\n🔄 PROCESANDO ARREGLOS...\n');
    
    let ticketsArreglados = 0;
    const ahora = new Date().toISOString();

    for (const compra of comprasConProblemas) {
      console.log(`⚡ Procesando compra ${compra.id}:`);
      console.log(`   Customer ID: ${compra.customerId}`);
      console.log(`   Tickets a arreglar: ${compra.ticketsDisponibles}`);
      console.log(`   Números: ${compra.numbers.join(', ')}`);

      try {
        // Actualizar tickets a status 'vendido'
        const { data: ticketsActualizados, error: updateError } = await supabase
          .from('tickets')
          .update({
            status: 'vendido',
            customer_id: compra.customerId,
            purchase_id: compra.id,
            sold_at: ahora
          })
          .in('number', compra.numbers)
          .eq('purchase_id', compra.id)
          .select('number, status');

        if (updateError) {
          console.error(`   ❌ Error: ${updateError.message}`);
          continue;
        }

        const ticketsProcesados = ticketsActualizados?.length || 0;
        ticketsArreglados += ticketsProcesados;

        console.log(`   ✅ ${ticketsProcesados} tickets actualizados a 'vendido'`);
        
      } catch (error) {
        console.error(`   ❌ Error al procesar compra ${compra.id}:`, error.message);
      }
    }

    // 5. Verificación final
    console.log('\n🔍 VERIFICACIÓN FINAL...');
    
    const { data: verificacion, error: verifyError } = await supabase
      .from('tickets')
      .select('status')
      .eq('status', 'vendido');

    if (verifyError) {
      console.error('❌ Error en verificación:', verifyError.message);
    } else {
      const ticketsVendidosFinal = verificacion?.length || 0;
      console.log(`✅ Total tickets vendidos en BD: ${ticketsVendidosFinal}`);
    }

    // 6. Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN:');
    console.log(`   Compras procesadas: ${comprasConProblemas.length}`);
    console.log(`   Tickets arreglados: ${ticketsArreglados}/${totalTicketsToFix}`);
    console.log(`   Estado: ${ticketsArreglados === totalTicketsToFix ? '✅ EXITOSA' : '⚠️  PARCIAL'}`);
    
    if (ticketsArreglados === totalTicketsToFix) {
      console.log('\n🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
      console.log('   Los contadores admin ahora deberían mostrar números correctos');
    } else {
      console.log('\n⚠️  MIGRACIÓN INCOMPLETA');
      console.log('   Revisa los errores arriba y ejecuta nuevamente si es necesario');
    }

  } catch (error) {
    console.error('❌ ERROR FATAL en migración:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  fixTicketSynchronization()
    .then(() => {
      console.log('\n✅ Script de migración finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script falló:', error);
      process.exit(1);
    });
}

module.exports = { fixTicketSynchronization };