// Check if there's a limit issue causing the problem
import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  URL: 'https://ugmfmnwbynppdzkhvrih.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWZtbndieW5wcGR6a2h2cmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE4NzAsImV4cCI6MjA3MTQ1Nzg3MH0.MTNKqQCzmRETjULZ2PRx8mTK3hpR90tn6Pz36h1nMR4'
};

const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

async function checkLimitIssue() {
  console.log('🔍 CHECKING FOR LIMIT/PAGINATION ISSUES...\n');
  
  try {
    // 1. Try without any limits
    console.log('📊 ALL STATUS DATA (NO LIMIT):');
    const { data: allData, error: allError } = await supabase
      .from('tickets')
      .select('status')
      .range(0, 10000); // Explicit range to get all

    if (allError) {
      console.error('Error:', allError);
      return;
    }

    console.log(`Total records received: ${allData?.length || 0}`);
    
    if (allData) {
      const statusCounts = allData.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Status counts with explicit range:', statusCounts);
    }

    // 2. Check count of sold tickets directly
    console.log('\n🎫 DIRECT COUNT OF SOLD TICKETS:');
    const { count: soldCount, error: soldCountError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'vendido');

    if (soldCountError) {
      console.error('Error counting sold:', soldCountError);
    } else {
      console.log(`Direct count of sold tickets: ${soldCount}`);
    }

    // 3. Check count of available tickets directly
    console.log('\n✅ DIRECT COUNT OF AVAILABLE TICKETS:');
    const { count: availableCount, error: availableCountError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'disponible');

    if (availableCountError) {
      console.error('Error counting available:', availableCountError);
    } else {
      console.log(`Direct count of available tickets: ${availableCount}`);
    }

    // 4. Check count of reserved tickets directly
    console.log('\n🕐 DIRECT COUNT OF RESERVED TICKETS:');
    const { count: reservedCount, error: reservedCountError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'reservado');

    if (reservedCountError) {
      console.error('Error counting reserved:', reservedCountError);
    } else {
      console.log(`Direct count of reserved tickets: ${reservedCount}`);
    }

    // 5. Summary
    console.log('\n📋 SUMMARY:');
    const totalExpected = (soldCount || 0) + (availableCount || 0) + (reservedCount || 0);
    console.log(`Total expected: ${totalExpected}`);
    console.log(`- Sold: ${soldCount || 0}`);
    console.log(`- Available: ${availableCount || 0}`);
    console.log(`- Reserved: ${reservedCount || 0}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkLimitIssue().catch(console.error);