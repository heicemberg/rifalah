#!/usr/bin/env node

/**
 * DEEP DEBUG - DATABASE SYNCHRONIZATION ISSUE
 * Investigate the exact mismatch between purchase_id and status
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepDebugSync() {
  console.log('🔬 DEEP DEBUG: DATABASE SYNCHRONIZATION ISSUE');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check tickets with purchase_id but wrong status
    console.log('🔍 Step 1: Tickets with purchase_id but status != "vendido"');
    const { data: linkedButNotSold, error1 } = await supabase
      .from('tickets')
      .select('id, number, status, purchase_id, customer_id')
      .not('purchase_id', 'is', null)
      .neq('status', 'vendido');

    console.log(`   Found: ${linkedButNotSold?.length || 0} tickets`);
    if (linkedButNotSold && linkedButNotSold.length > 0) {
      console.log('   Sample tickets:');
      linkedButNotSold.slice(0, 5).forEach(ticket => {
        console.log(`     Ticket ${ticket.number}: status="${ticket.status}", purchase_id="${ticket.purchase_id}"`);
      });
    }

    // 2. Check tickets with status "vendido" but no purchase_id
    console.log('\n🔍 Step 2: Tickets with status "vendido" but no purchase_id');
    const { data: soldButNotLinked, error2 } = await supabase
      .from('tickets')
      .select('id, number, status, purchase_id, customer_id')
      .eq('status', 'vendido')
      .is('purchase_id', null);

    console.log(`   Found: ${soldButNotLinked?.length || 0} tickets`);
    if (soldButNotLinked && soldButNotLinked.length > 0) {
      console.log('   Sample tickets:');
      soldButNotLinked.slice(0, 5).forEach(ticket => {
        console.log(`     Ticket ${ticket.number}: status="${ticket.status}", purchase_id=null`);
      });
    }

    // 3. Get confirmed purchase IDs
    console.log('\n🔍 Step 3: Confirmed purchase IDs');
    const { data: confirmedPurchases, error3 } = await supabase
      .from('purchases')
      .select('id, status')
      .eq('status', 'confirmada');

    const confirmedPurchaseIds = confirmedPurchases?.map(p => p.id) || [];
    console.log(`   Confirmed purchases: ${confirmedPurchaseIds.length}`);

    // 4. Count tickets by status
    console.log('\n📊 Step 4: Complete ticket status breakdown');
    const { data: allTickets, error4 } = await supabase
      .from('tickets')
      .select('status, purchase_id, customer_id');

    const statusBreakdown = {
      'disponible': 0,
      'vendido': 0,
      'reservado': 0,
      'other': 0
    };

    const purchaseIdBreakdown = {
      'with_purchase_id': 0,
      'without_purchase_id': 0
    };

    allTickets?.forEach(ticket => {
      // Count by status
      if (statusBreakdown.hasOwnProperty(ticket.status)) {
        statusBreakdown[ticket.status]++;
      } else {
        statusBreakdown['other']++;
      }

      // Count by purchase_id
      if (ticket.purchase_id) {
        purchaseIdBreakdown['with_purchase_id']++;
      } else {
        purchaseIdBreakdown['without_purchase_id']++;
      }
    });

    console.log('   Status breakdown:');
    Object.entries(statusBreakdown).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });

    console.log('   Purchase ID breakdown:');
    Object.entries(purchaseIdBreakdown).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });

    // 5. THE FIX - Update status for tickets with purchase_id
    console.log('\n⚡ Step 5: APPLYING THE FIX');
    
    if (linkedButNotSold && linkedButNotSold.length > 0) {
      console.log(`   Updating ${linkedButNotSold.length} tickets to "vendido" status...`);
      
      const ticketIds = linkedButNotSold.map(t => t.id);
      const { data: updateResult, error: updateError } = await supabase
        .from('tickets')
        .update({ 
          status: 'vendido',
          sold_at: new Date().toISOString()
        })
        .in('id', ticketIds)
        .select('id, number, status');

      if (updateError) {
        console.error('   ❌ Update failed:', updateError);
      } else {
        console.log(`   ✅ Successfully updated ${updateResult?.length || 0} tickets`);
        console.log(`   Sample updated tickets: ${updateResult?.slice(0, 5).map(t => t.number).join(', ')}`);
      }
    } else {
      console.log('   ✅ No tickets need status update');
    }

    // 6. Final verification
    console.log('\n🧮 Step 6: FINAL VERIFICATION');
    const { data: finalStatus, error5 } = await supabase
      .from('tickets')
      .select('status');

    const finalCounts = {
      'disponible': 0,
      'vendido': 0,
      'reservado': 0,
      'other': 0
    };

    finalStatus?.forEach(ticket => {
      if (finalCounts.hasOwnProperty(ticket.status)) {
        finalCounts[ticket.status]++;
      } else {
        finalCounts['other']++;
      }
    });

    console.log('   FINAL STATUS COUNTS:');
    Object.entries(finalCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });

    const soldCount = finalCounts['vendido'];
    const availableCount = finalCounts['disponible'];
    const totalCount = soldCount + availableCount + finalCounts['reservado'] + finalCounts['other'];

    console.log('\n🎯 MATHEMATICAL CHECK:');
    console.log(`   Sold: ${soldCount}`);
    console.log(`   Available: ${availableCount}`);
    console.log(`   Reserved: ${finalCounts['reservado']}`);
    console.log(`   Total: ${totalCount}`);

    // 7. FOMO preview with correct data
    console.log('\n🎭 CORRECTED FOMO SYSTEM PREVIEW:');
    const realSold = soldCount;
    const fomoAmount = 1200;
    const displaySold = realSold + fomoAmount;
    const displayAvailable = 10000 - displaySold - finalCounts['reservado'];
    
    console.log(`   Real sold: ${realSold}`);
    console.log(`   FOMO amount: ${fomoAmount}`);
    console.log(`   Display sold: ${displaySold}`);
    console.log(`   Display available: ${displayAvailable}`);
    console.log(`   Display total: ${displaySold + displayAvailable + finalCounts['reservado']}`);

    const displayMathCorrect = (displaySold + displayAvailable + finalCounts['reservado']) === 10000;
    console.log(`   ✅ Display math: ${displayMathCorrect ? 'PERFECT ✅' : 'BROKEN ❌'}`);

    console.log('\n🎉 DEEP DEBUG COMPLETE - DATABASE SHOULD NOW BE SYNCED');

  } catch (error) {
    console.error('❌ Deep debug failed:', error);
    process.exit(1);
  }
}

deepDebugSync();