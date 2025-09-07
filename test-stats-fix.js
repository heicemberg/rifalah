// Test the fixed statistics function
import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  URL: 'https://ugmfmnwbynppdzkhvrih.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWZtbndieW5wcGR6a2h2cmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE4NzAsImV4cCI6MjA3MTQ1Nzg3MH0.MTNKqQCzmRETjULZ2PRx8mTK3hpR90tn6Pz36h1nMR4'
};

const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

async function testFixedStatsFunction() {
  console.log('🧪 TESTING FIXED STATISTICS FUNCTION...\n');
  
  try {
    console.log('📊 Fetching ticket statistics...');
    
    const { data, error } = await supabase
      .from('tickets')
      .select('status');

    if (error) {
      console.error('❌ Error fetching ticket statuses:', error);
      return;
    }

    if (!data) {
      console.warn('⚠️ No ticket data received');
      return;
    }

    const stats = {
      total: data.length,
      disponibles: data.filter(t => t.status === 'disponible').length,
      vendidos: data.filter(t => t.status === 'vendido').length,
      reservados: data.filter(t => t.status === 'reservado').length
    };

    console.log('✅ FIXED STATISTICS:', stats);
    
    // Verify with confirmed purchases
    const { data: purchases } = await supabase
      .from('purchases')
      .select('status, total_amount, unit_price')
      .eq('status', 'confirmada');

    const expectedSoldTickets = purchases?.reduce((sum, p) => {
      return sum + Math.round(p.total_amount / p.unit_price);
    }, 0) || 0;

    console.log('\n🔍 VERIFICATION:');
    console.log(`Expected sold tickets (from confirmed purchases): ${expectedSoldTickets}`);
    console.log(`Actual sold tickets (from stats): ${stats.vendidos}`);
    console.log(`Match: ${expectedSoldTickets === stats.vendidos ? '✅ YES' : '❌ NO'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testFixedStatsFunction().catch(console.error);