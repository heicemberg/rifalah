// Test the final fixed statistics function
import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  URL: 'https://ugmfmnwbynppdzkhvrih.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWZtbndieW5wcGR6a2h2cmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE4NzAsImV4cCI6MjA3MTQ1Nzg3MH0.MTNKqQCzmRETjULZ2PRx8mTK3hpR90tn6Pz36h1nMR4'
};

const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

async function testFinalFixedFunction() {
  console.log('🧪 TESTING FINAL FIXED STATISTICS FUNCTION...\n');
  
  try {
    console.log('📊 SUPABASE: Fetching ticket statistics using optimized counts...');
    
    // Get counts for each status using direct count queries (same as new function)
    const [
      { count: totalCount, error: totalError },
      { count: disponiblesCount, error: disponiblesError },
      { count: vendidosCount, error: vendidosError },
      { count: reservadosCount, error: reservadosError }
    ] = await Promise.all([
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'disponible'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'vendido'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'reservado')
    ]);

    // Check for errors
    if (totalError || disponiblesError || vendidosError || reservadosError) {
      const firstError = totalError || disponiblesError || vendidosError || reservadosError;
      console.error('❌ Error fetching ticket counts:', firstError);
      return;
    }

    const stats = {
      total: totalCount || 0,
      disponibles: disponiblesCount || 0,
      vendidos: vendidosCount || 0,
      reservados: reservadosCount || 0
    };

    console.log('✅ FIXED STATISTICS (using direct counts):', stats);
    
    // Validation check
    const sumCheck = stats.disponibles + stats.vendidos + stats.reservados;
    console.log(`🔍 Validation - Total: ${stats.total}, Sum: ${sumCheck}, Match: ${sumCheck === stats.total ? '✅' : '❌'}`);

    // Verify with confirmed purchases
    const { data: purchases } = await supabase
      .from('purchases')
      .select('status, total_amount, unit_price')
      .eq('status', 'confirmada');

    const expectedSoldTickets = purchases?.reduce((sum, p) => {
      return sum + Math.round(p.total_amount / p.unit_price);
    }, 0) || 0;

    console.log('\n🔍 FINAL VERIFICATION:');
    console.log(`Expected sold tickets (from confirmed purchases): ${expectedSoldTickets}`);
    console.log(`Actual sold tickets (from new stats function): ${stats.vendidos}`);
    console.log(`Perfect Match: ${expectedSoldTickets === stats.vendidos ? '✅ YES - PROBLEM SOLVED!' : '❌ NO'}`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testFinalFixedFunction().catch(console.error);