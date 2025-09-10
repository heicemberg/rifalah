#!/usr/bin/env node

/**
 * CHECK DATABASE SCHEMA
 * Understand the actual structure of the database tables
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

async function checkSchema() {
  console.log('🔍 CHECKING DATABASE SCHEMA');
  console.log('=' .repeat(40));
  
  try {
    // Check tickets table
    console.log('\n🎫 TICKETS TABLE STRUCTURE:');
    const { data: ticketSample, error: ticketError } = await supabase
      .from('tickets')
      .select('*')
      .limit(2);

    if (ticketError) throw ticketError;
    
    if (ticketSample && ticketSample.length > 0) {
      console.log('   Columns:', Object.keys(ticketSample[0]).join(', '));
      console.log('   Sample record:', ticketSample[0]);
    }

    // Check purchases table
    console.log('\n💳 PURCHASES TABLE STRUCTURE:');
    const { data: purchaseSample, error: purchaseError } = await supabase
      .from('purchases')
      .select('*')
      .limit(2);

    if (purchaseError) throw purchaseError;
    
    if (purchaseSample && purchaseSample.length > 0) {
      console.log('   Columns:', Object.keys(purchaseSample[0]).join(', '));
      console.log('   Sample record:', purchaseSample[0]);
    }

    // Check customers table
    console.log('\n👤 CUSTOMERS TABLE STRUCTURE:');
    const { data: customerSample, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .limit(2);

    if (customerError) throw customerError;
    
    if (customerSample && customerSample.length > 0) {
      console.log('   Columns:', Object.keys(customerSample[0]).join(', '));
      console.log('   Sample record:', customerSample[0]);
    }

    // Get detailed status counts
    console.log('\n📊 CURRENT DATA STATUS:');
    
    const { data: ticketStats } = await supabase
      .from('tickets')
      .select('status');
    
    const statusCounts = {};
    ticketStats?.forEach(ticket => {
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
    });
    
    console.log('   Tickets by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });

    const { data: purchaseStats } = await supabase
      .from('purchases')
      .select('status');
    
    const purchaseStatusCounts = {};
    purchaseStats?.forEach(purchase => {
      purchaseStatusCounts[purchase.status] = (purchaseStatusCounts[purchase.status] || 0) + 1;
    });
    
    console.log('   Purchases by status:');
    Object.entries(purchaseStatusCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Schema check failed:', error);
    process.exit(1);
  }
}

checkSchema();