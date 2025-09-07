#!/usr/bin/env node

/**
 * SCRIPT DE SINCRONIZACIÓN FORZADA
 * 
 * Problema específico identificado:
 * - 222 tickets en compras confirmadas con status 'vendido'
 * - 0 tickets en tabla tickets con status 'vendido'  
 * - Necesitamos sincronizar forzadamente
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

async function forceSyncTickets() {
  console.log('⚡ SINCRONIZACIÓN FORZADA DE TICKETS');
  console.log('=' .repeat(50));
  
  try {
    // 1. Obtener todas las compras confirmadas con sus tickets
    console.log('📋 Obteniendo compras confirmadas...');
    
    const { data: comprasConfirmadas, error: purchasesError } = await supabase
      .from('purchases')
      .select(`
        id,
        customer_id,
        status,
        created_at,
        tickets!inner(number, status, purchase_id)
      `)
      .eq('status', 'confirmada');

    if (purchasesError) throw purchasesError;

    console.log(`✅ ${comprasConfirmadas?.length || 0} compras confirmadas encontradas`);

    if (!comprasConfirmadas || comprasConfirmadas.length === 0) {
      console.log('ℹ️  No hay compras confirmadas');
      return;
    }

    // 2. Extraer todos los números de tickets de estas compras
    const todosLosTickets = [];
    let totalTickets = 0;

    for (const compra of comprasConfirmadas) {
      console.log(`\n📦 Compra ${compra.id}:`);
      console.log(`   Customer: ${compra.customer_id}`);
      console.log(`   Tickets: ${compra.tickets.length}`);
      
      for (const ticket of compra.tickets) {
        todosLosTickets.push({
          number: ticket.number,
          purchaseId: compra.id,
          customerId: compra.customer_id,
          currentStatus: ticket.status
        });
        totalTickets++;
        
        console.log(`   - Ticket ${ticket.number} (status: ${ticket.status})`);
      }
    }

    console.log(`\n🎯 TOTAL TICKETS A SINCRONIZAR: ${totalTickets}`);

    // 3. Actualizar TODOS estos tickets a 'vendido' en la tabla tickets
    console.log('\n⚡ FORZANDO ACTUALIZACIÓN MASIVA...');
    
    const ahora = new Date().toISOString();
    const numerosTickets = todosLosTickets.map(t => t.number);
    
    console.log(`📝 Números de tickets: ${numerosTickets.join(', ')}`);
    
    // Actualización masiva
    const { data: ticketsActualizados, error: updateError } = await supabase
      .from('tickets')
      .update({
        status: 'vendido',
        sold_at: ahora
      })
      .in('number', numerosTickets)
      .select('number, status, sold_at');

    if (updateError) {
      console.error('❌ Error en actualización masiva:', updateError);
      throw updateError;
    }

    const ticketsAfectados = ticketsActualizados?.length || 0;
    console.log(`✅ ${ticketsAfectados}/${totalTickets} tickets actualizados`);

    // 4. Actualización individual por purchase_id y customer_id
    console.log('\n🔄 ACTUALIZANDO RELACIONES INDIVIDUALES...');
    
    let ticketsPorCompra = 0;
    
    for (const compra of comprasConfirmadas) {
      const ticketsDeCompra = todosLosTickets
        .filter(t => t.purchaseId === compra.id)
        .map(t => t.number);
      
      if (ticketsDeCompra.length > 0) {
        console.log(`   Compra ${compra.id}: ${ticketsDeCompra.length} tickets`);
        
        const { error: relationError } = await supabase
          .from('tickets')
          .update({
            customer_id: compra.customer_id,
            purchase_id: compra.id,
            status: 'vendido',
            sold_at: ahora
          })
          .in('number', ticketsDeCompra);

        if (relationError) {
          console.error(`   ❌ Error en compra ${compra.id}:`, relationError.message);
        } else {
          console.log(`   ✅ Compra ${compra.id} sincronizada`);
          ticketsPorCompra += ticketsDeCompra.length;
        }
      }
    }

    // 5. Verificación final
    console.log('\n🔍 VERIFICACIÓN POST-SINCRONIZACIÓN...');
    
    const { data: verificacionVendidos, error: verifyError } = await supabase
      .from('tickets')
      .select('number, status, customer_id, purchase_id')
      .eq('status', 'vendido');

    if (verifyError) {
      console.error('❌ Error en verificación:', verifyError);
    } else {
      const vendidosAhora = verificacionVendidos?.length || 0;
      console.log(`✅ Tickets con status 'vendido': ${vendidosAhora}`);
      
      if (vendidosAhora > 0) {
        console.log('📋 Tickets vendidos encontrados:');
        verificacionVendidos?.forEach(t => {
          console.log(`   ${t.number}: customer=${t.customer_id}, purchase=${t.purchase_id}`);
        });
      }
    }

    // 6. Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE SINCRONIZACIÓN:');
    console.log(`   Compras procesadas: ${comprasConfirmadas.length}`);
    console.log(`   Tickets encontrados: ${totalTickets}`);
    console.log(`   Tickets actualizados: ${ticketsAfectados}`);
    console.log(`   Tickets por relación: ${ticketsPorCompra}`);
    console.log(`   Estado: ${ticketsAfectados > 0 ? '✅ EXITOSA' : '❌ FALLÓ'}`);
    
    if (ticketsAfectados > 0) {
      console.log('\n🎉 SINCRONIZACIÓN FORZADA EXITOSA');
      console.log('   Los contadores deberían actualizar automáticamente');
    }

    return {
      comprasProcesadas: comprasConfirmadas.length,
      ticketsEncontrados: totalTickets,
      ticketsActualizados: ticketsAfectados,
      exitosa: ticketsAfectados > 0
    };

  } catch (error) {
    console.error('❌ ERROR CRÍTICO:', error);
    throw error;
  }
}

// Ejecutar
if (require.main === module) {
  forceSyncTickets()
    .then((result) => {
      if (result.exitosa) {
        console.log('\n🚀 ¡SINCRONIZACIÓN COMPLETADA!');
        console.log('   Prueba aceptar un ticket en admin para ver contadores dinámicos');
      } else {
        console.log('\n⚠️  Sincronización no completada');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 SINCRONIZACIÓN FALLÓ:', error.message);
      process.exit(1);
    });
}

module.exports = { forceSyncTickets };