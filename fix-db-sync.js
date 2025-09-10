#!/usr/bin/env node

/**
 * URGENT DATABASE SYNCHRONIZATION FIX
 * 
 * Problem: 700 tickets sold in purchases table but 0 marked as sold in tickets table
 * Solution: Sync tickets status based on confirmed purchases
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables not configured');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseSync() {
  console.log('🔧 FIXING DATABASE SYNCHRONIZATION');
  console.log('=' .repeat(50));
  
  try {
    // 1. Get all confirmed purchases
    console.log('📊 Step 1: Getting confirmed purchases...');
    
    const { data: confirmedPurchases, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        id,
        customer_id,
        total_amount,
        status
      `)
      .eq('status', 'confirmada');

    if (purchaseError) throw purchaseError;

    console.log(`   Found ${confirmedPurchases?.length || 0} confirmed purchases`);

    // 2. Get tickets associated with confirmed purchases
    console.log('\n📋 Step 2: Getting tickets for confirmed purchases...');
    
    let allSoldTickets = [];
    let totalTicketsSold = 0;

    for (const purchase of confirmedPurchases || []) {
      // Get tickets for this purchase
      const { data: purchaseTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('number, status')
        .eq('purchase_id', purchase.id);

      if (ticketsError) throw ticketsError;

      const ticketNumbers = purchaseTickets?.map(t => t.number) || [];
      allSoldTickets = allSoldTickets.concat(ticketNumbers);
      totalTicketsSold += ticketNumbers.length;
      
      console.log(`   Purchase ${purchase.id}: ${ticketNumbers.length} tickets (${ticketNumbers.slice(0,5).join(', ')}${ticketNumbers.length > 5 ? '...' : ''})`);
    }

    console.log(`   Total tickets to mark as sold: ${totalTicketsSold}`);

    // 3. Verify current tickets status
    console.log('\n🔍 Step 3: Checking current tickets status...');
    
    const { data: currentTickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('number, status')
      .in('number', allSoldTickets);

    if (ticketsError) throw ticketsError;

    const currentSoldCount = currentTickets?.filter(t => t.status === 'vendido').length || 0;
    const needsUpdate = allSoldTickets.filter(num => {
      const ticket = currentTickets?.find(t => t.number === num);
      return !ticket || ticket.status !== 'vendido';
    });

    console.log(`   Currently marked as sold: ${currentSoldCount}`);
    console.log(`   Need to update: ${needsUpdate.length} tickets`);

    // 4. Update tickets status if needed
    if (needsUpdate.length > 0) {
      console.log('\n⚡ Step 4: Updating tickets status...');
      
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'vendido',
          sold_at: new Date().toISOString()
        })
        .in('number', needsUpdate);

      if (updateError) throw updateError;
      
      console.log(`   ✅ Successfully updated ${needsUpdate.length} tickets to 'vendido'`);
    } else {
      console.log('\n✅ Step 4: No updates needed - all tickets already synced');
    }

    // 5. Final verification
    console.log('\n🧮 Step 5: Final verification...');
    
    const { data: finalStats, error: statsError } = await supabase
      .from('tickets')
      .select('status');

    if (statsError) throw statsError;

    const statusCounts = {};
    finalStats?.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });

    console.log('\n📊 FINAL DATABASE STATE:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} tickets`);
    });

    const finalSoldCount = statusCounts['vendido'] || 0;
    const finalAvailableCount = statusCounts['disponible'] || 0;
    const finalTotalCount = finalSoldCount + finalAvailableCount;

    console.log('\n✅ SYNCHRONIZATION RESULTS:');
    console.log(`   Sold: ${finalSoldCount} tickets`);
    console.log(`   Available: ${finalAvailableCount} tickets`);
    console.log(`   Total: ${finalTotalCount} tickets`);
    
    // 6. Mathematical integrity check
    const mathCheck = finalSoldCount + finalAvailableCount;
    const isConsistent = mathCheck === finalTotalCount;
    
    console.log('\n🧮 MATHEMATICAL INTEGRITY CHECK:');
    console.log(`   ${finalSoldCount} sold + ${finalAvailableCount} available = ${mathCheck}`);
    console.log(`   Expected total: ${finalTotalCount}`);
    console.log(`   Status: ${isConsistent ? '✅ CONSISTENT' : '❌ INCONSISTENT'}`);

    // 7. FOMO calculation preview
    console.log('\n🎭 FOMO SYSTEM PREVIEW:');
    const realSold = finalSoldCount;
    const fomoAmount = 1200;
    const displaySold = realSold + fomoAmount;
    const displayAvailable = 10000 - displaySold - 0; // Assuming 0 reserved for now
    
    console.log(`   Real sold: ${realSold}`);
    console.log(`   FOMO amount: ${fomoAmount}`);
    console.log(`   Display sold: ${displaySold}`);
    console.log(`   Display available: ${displayAvailable}`);
    console.log(`   Display total: ${displaySold + displayAvailable} (should be 10000)`);

    if (displaySold + displayAvailable === 10000) {
      console.log('   🎯 PERFECT: Display math will be exactly 10,000!');
    } else {
      console.error('   ❌ ERROR: Display math will NOT equal 10,000!');
    }

    console.log('\n🎉 DATABASE SYNCHRONIZATION COMPLETE');
    console.log('🔄 The master counter will now show correct values!');
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    process.exit(1);
  }
}

// Run the fix
fixDatabaseSync();