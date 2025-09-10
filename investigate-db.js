#!/usr/bin/env node

/**
 * INVESTIGATE DATABASE INCONSISTENCY
 * Something is resetting the ticket statuses
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateDB() {
  console.log('🔬 INVESTIGATING DATABASE INCONSISTENCY');
  console.log('=' .repeat(50));
  
  try {
    // Multiple rapid checks to see if status is changing
    for (let i = 1; i <= 5; i++) {
      console.log(`\n📊 Check #${i}:`);
      
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('status')
        .order('status');

      if (error) throw error;

      const counts = {};
      tickets?.forEach(t => {
        counts[t.status] = (counts[t.status] || 0) + 1;
      });

      console.log(`   Status counts:`, counts);
      console.log(`   Total tickets: ${tickets?.length || 0}`);
      
      // Wait 2 seconds between checks
      if (i < 5) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Check specific ticket numbers that should be sold
    console.log('\n🎯 Checking specific ticket numbers (1-50):');
    const { data: specificTickets, error2 } = await supabase
      .from('tickets')
      .select('number, status, purchase_id, customer_id, sold_at')
      .gte('number', 1)
      .lte('number', 50)
      .order('number');

    if (error2) throw error2;

    console.log('First 20 tickets details:');
    specificTickets?.slice(0, 20).forEach(ticket => {
      console.log(`   ${ticket.number}: ${ticket.status} | purchase_id: ${ticket.purchase_id ? 'YES' : 'NO'} | sold_at: ${ticket.sold_at ? 'YES' : 'NO'}`);
    });

    // Check if there are triggers or functions affecting the data
    console.log('\n🔍 Database structure check:');
    console.log(`   Total tickets in table: ${specificTickets?.length || 0}`);

    // Check what happens when we update a single ticket manually
    console.log('\n⚡ Manual update test on ticket #10000:');
    
    // First, check current status
    const { data: beforeUpdate, error3 } = await supabase
      .from('tickets')
      .select('number, status, purchase_id')
      .eq('number', 10000)
      .single();

    if (error3) {
      console.log('   Could not find ticket 10000:', error3.message);
    } else {
      console.log(`   Before: ticket 10000 is "${beforeUpdate.status}" with purchase_id: ${beforeUpdate.purchase_id || 'null'}`);
      
      // Try to update it
      const { data: updateResult, error4 } = await supabase
        .from('tickets')
        .update({ 
          status: 'vendido',
          sold_at: new Date().toISOString(),
          customer_id: 'test-customer'
        })
        .eq('number', 10000)
        .select('number, status, purchase_id, sold_at');

      if (error4) {
        console.log('   Update failed:', error4.message);
      } else {
        console.log(`   Update result:`, updateResult);
        
        // Check again immediately
        const { data: afterUpdate, error5 } = await supabase
          .from('tickets')
          .select('number, status, purchase_id, sold_at')
          .eq('number', 10000)
          .single();

        if (!error5) {
          console.log(`   After: ticket 10000 is "${afterUpdate.status}" with purchase_id: ${afterUpdate.purchase_id || 'null'}`);
        }
      }
    }

    // Final comprehensive count
    console.log('\n📋 FINAL COMPREHENSIVE COUNT:');
    const { data: finalTickets, error6 } = await supabase
      .from('tickets')
      .select('status');

    const finalCounts = {};
    finalTickets?.forEach(t => {
      finalCounts[t.status] = (finalCounts[t.status] || 0) + 1;
    });

    console.log('   Final status distribution:');
    Object.entries(finalCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });

    console.log(`\n🎯 CONCLUSION:`);
    if (finalCounts['vendido'] > 0) {
      console.log(`   ✅ Database has ${finalCounts['vendido']} sold tickets`);
      console.log(`   ✅ Master counter should show: ${finalCounts['vendido']} real + 1200 FOMO = ${finalCounts['vendido'] + 1200} display`);
    } else {
      console.log(`   ❌ Database shows 0 sold tickets despite confirmed purchases`);
      console.log(`   🔧 This suggests a systematic issue with ticket status management`);
    }

  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

investigateDB();