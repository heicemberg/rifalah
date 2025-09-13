// Script para sincronizar tickets con compras confirmadas
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

// Usar service key para bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncTicketsWithPurchases() {
  console.log('🔄 SINCRONIZACIÓN DE TICKETS CON COMPRAS CONFIRMADAS\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Obtener todas las compras confirmadas
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .eq('status', 'confirmada')
      .order('created_at');
    
    if (purchasesError) {
      console.error('❌ Error al obtener compras:', purchasesError);
      return;
    }
    
    console.log(`✅ Compras confirmadas encontradas: ${purchases.length}`);
    
    // 2. Calcular boletos totales que deberían estar vendidos
    let totalBoletosCalculados = 0;
    let boletosParaMarcar = [];
    
    purchases.forEach((purchase, index) => {
      let boletosEnCompra = 0;
      
      if (purchase.total_amount && purchase.unit_price && purchase.unit_price > 0) {
        boletosEnCompra = Math.round(purchase.total_amount / purchase.unit_price);
        totalBoletosCalculados += boletosEnCompra;
        
        console.log(`\nCompra ${index + 1}:`);
        console.log(`  ID: ${purchase.id}`);
        console.log(`  Total: $${purchase.total_amount}`);
        console.log(`  Precio unitario: $${purchase.unit_price}`);
        console.log(`  Boletos: ${boletosEnCompra}`);
        
        // Agregar a la lista de boletos para marcar
        boletosParaMarcar.push({
          purchaseId: purchase.id,
          cantidad: boletosEnCompra,
          customerId: purchase.customer_id
        });
      }
    });
    
    console.log(`\n📊 Total de boletos que deberían estar vendidos: ${totalBoletosCalculados}`);
    
    // 3. Obtener tickets actualmente vendidos
    const { data: currentlySold, error: soldError } = await supabase
      .from('tickets')
      .select('number')
      .eq('status', 'vendido');
    
    if (soldError) {
      console.error('❌ Error al obtener tickets vendidos:', soldError);
      return;
    }
    
    const soldNumbers = new Set(currentlySold.map(t => t.number));
    console.log(`📌 Tickets actualmente marcados como vendidos: ${soldNumbers.size}`);
    console.log(`⚠️  Tickets faltantes por marcar: ${totalBoletosCalculados - soldNumbers.size}`);
    
    // 4. Obtener tickets disponibles para asignar
    const { data: availableTickets, error: availError } = await supabase
      .from('tickets')
      .select('number')
      .eq('status', 'disponible')
      .order('number')
      .limit(totalBoletosCalculados - soldNumbers.size);
    
    if (availError) {
      console.error('❌ Error al obtener tickets disponibles:', availError);
      return;
    }
    
    console.log(`\n📦 Tickets disponibles encontrados: ${availableTickets.length}`);
    
    if (availableTickets.length === 0) {
      console.log('⚠️  No hay tickets disponibles para asignar');
      return;
    }
    
    // 5. Marcar tickets como vendidos
    console.log('\n🔄 Iniciando actualización de tickets...');
    
    const ticketsToUpdate = availableTickets.map(t => t.number);
    const batchSize = 100; // Actualizar en lotes de 100
    
    for (let i = 0; i < ticketsToUpdate.length; i += batchSize) {
      const batch = ticketsToUpdate.slice(i, i + batchSize);
      
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'vendido' })
        .in('number', batch);
      
      if (updateError) {
        console.error(`❌ Error actualizando lote ${i/batchSize + 1}:`, updateError);
      } else {
        console.log(`✅ Lote ${i/batchSize + 1}: ${batch.length} tickets actualizados`);
      }
    }
    
    // 6. Verificar resultado final
    const { count: finalSoldCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'vendido');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SINCRONIZACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`Tickets vendidos antes: ${soldNumbers.size}`);
    console.log(`Tickets vendidos ahora: ${finalSoldCount}`);
    console.log(`Tickets sincronizados: ${finalSoldCount - soldNumbers.size}`);
    console.log('='.repeat(60));
    
    if (finalSoldCount < totalBoletosCalculados) {
      console.log(`\n⚠️  Advertencia: Aún faltan ${totalBoletosCalculados - finalSoldCount} tickets por sincronizar`);
      console.log('Esto puede deberse a que no hay suficientes tickets en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar sincronización
syncTicketsWithPurchases();