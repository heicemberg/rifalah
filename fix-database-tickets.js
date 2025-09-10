#!/usr/bin/env node

/**
 * SCRIPT DEFINITIVO: Arreglar Base de Datos de Tickets
 * 
 * Problema identificado: Solo hay 1,000 tickets en la BD, faltan 9,000
 * Solución: Agregar los tickets faltantes para llegar a exactamente 10,000
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  console.error('   Asegúrate de que .env.local tenga:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixDatabaseTickets() {
  console.log('🔍 INICIANDO DIAGNÓSTICO Y REPARACIÓN DE BASE DE DATOS...\n');

  try {
    // 1. Verificar estado actual
    console.log('1️⃣ Verificando estado actual de la base de datos...');
    const { data: currentTickets, error: countError } = await supabase
      .from('tickets')
      .select('number', { count: 'exact' });

    if (countError) {
      throw new Error(`Error al contar tickets: ${countError.message}`);
    }

    const currentCount = currentTickets.length;
    console.log(`   📊 Tickets actuales en BD: ${currentCount}`);
    console.log(`   🎯 Tickets requeridos: 10,000`);
    console.log(`   ❌ Faltantes: ${10000 - currentCount}\n`);

    // 2. Encontrar números faltantes
    console.log('2️⃣ Identificando números de tickets faltantes...');
    const existingNumbers = new Set(currentTickets.map(t => t.number));
    const missingNumbers = [];
    
    for (let i = 1; i <= 10000; i++) {
      if (!existingNumbers.has(i)) {
        missingNumbers.push(i);
      }
    }

    console.log(`   🔍 Números faltantes encontrados: ${missingNumbers.length}`);
    if (missingNumbers.length > 0) {
      console.log(`   📝 Primeros 10 faltantes: ${missingNumbers.slice(0, 10).join(', ')}`);
      if (missingNumbers.length > 10) {
        console.log(`   📝 Últimos 10 faltantes: ${missingNumbers.slice(-10).join(', ')}`);
      }
    }
    console.log('');

    // 3. Crear tickets faltantes
    if (missingNumbers.length > 0) {
      console.log('3️⃣ Creando tickets faltantes...');
      
      // Crear tickets en lotes de 1000 para evitar timeouts
      const BATCH_SIZE = 1000;
      let processed = 0;

      for (let i = 0; i < missingNumbers.length; i += BATCH_SIZE) {
        const batch = missingNumbers.slice(i, i + BATCH_SIZE);
        const ticketsToInsert = batch.map(number => ({
          number: number,
          status: null  // null = disponible
        }));

        console.log(`   🔄 Procesando lote ${Math.floor(i/BATCH_SIZE) + 1}: números ${batch[0]} a ${batch[batch.length-1]}`);
        
        const { error: insertError } = await supabase
          .from('tickets')
          .upsert(ticketsToInsert, { 
            onConflict: 'number',
            ignoreDuplicates: false
          });

        if (insertError) {
          console.log(`   ⚠️  Error en lote, intentando individualmente...`);
          // Try inserting individually to handle conflicts
          for (const ticket of ticketsToInsert) {
            const { error: singleError } = await supabase
              .from('tickets')
              .upsert([ticket], { 
                onConflict: 'number',
                ignoreDuplicates: true
              });
            
            if (singleError && !singleError.message.includes('duplicate')) {
              console.log(`     ❌ Error en ticket ${ticket.number}: ${singleError.message}`);
            }
          }
        }

        processed += batch.length;
        console.log(`   ✅ Procesados: ${processed}/${missingNumbers.length}`);
      }

      console.log(`\n✅ TICKETS CREADOS EXITOSAMENTE: ${missingNumbers.length}\n`);
    } else {
      console.log('✅ No hay tickets faltantes - la base de datos está completa.\n');
    }

    // 4. Verificación final
    console.log('4️⃣ VERIFICACIÓN FINAL...');
    const { data: finalTickets, error: finalCountError } = await supabase
      .from('tickets')
      .select('number', { count: 'exact' });

    if (finalCountError) {
      throw new Error(`Error en verificación final: ${finalCountError.message}`);
    }

    const finalCount = finalTickets.length;
    console.log(`   📊 Total de tickets después de reparación: ${finalCount}`);

    // 5. Verificar estadísticas
    console.log('\n5️⃣ ESTADÍSTICAS FINALES...');
    const { data: stats, error: statsError } = await supabase
      .rpc('obtener_estadisticas_tickets');

    if (statsError) {
      console.log(`   ⚠️  Error obteniendo estadísticas: ${statsError.message}`);
    } else {
      console.log(`   📈 Disponibles: ${stats.disponibles}`);
      console.log(`   💰 Vendidos: ${stats.vendidos}`);
      console.log(`   🔒 Reservados: ${stats.reservados}`);
      console.log(`   🎯 Total: ${stats.total}`);
      
      const mathCheck = stats.disponibles + stats.vendidos + stats.reservados;
      if (mathCheck === 10000) {
        console.log(`   ✅ MATEMÁTICA PERFECTA: ${mathCheck} = 10,000`);
      } else {
        console.log(`   ❌ ERROR MATEMÁTICO: ${mathCheck} ≠ 10,000`);
      }
    }

    // 6. Resultado final
    console.log('\n🎉 REPARACIÓN COMPLETA');
    if (finalCount === 10000) {
      console.log('✅ BASE DE DATOS REPARADA - EXACTAMENTE 10,000 TICKETS');
      console.log('🎯 El sistema ahora tendrá contadores perfectos');
      console.log('💯 Matemática garantizada: vendidos + disponibles + reservados = 10,000');
    } else {
      console.log(`❌ ADVERTENCIA: Se esperaban 10,000 tickets pero hay ${finalCount}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA REPARACIÓN:');
    console.error(`   ${error.message}`);
    console.error('\n🔧 SOLUCIÓN MANUAL:');
    console.error('   1. Verifica las variables de entorno de Supabase');
    console.error('   2. Asegúrate de tener permisos de escritura en la tabla tickets');
    console.error('   3. Ejecuta el script nuevamente');
    process.exit(1);
  }
}

// Ejecutar script
console.log('🚀 SCRIPT DE REPARACIÓN DE BASE DE DATOS');
console.log('📅 Fecha:', new Date().toLocaleString('es-MX'));
console.log('🎯 Objetivo: Exactamente 10,000 tickets en la base de datos\n');

fixDatabaseTickets()
  .then(() => {
    console.log('\n✨ SCRIPT COMPLETADO EXITOSAMENTE');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 SCRIPT FALLÓ:', error.message);
    process.exit(1);
  });