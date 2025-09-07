// DATABASE DEBUG SCRIPT - Check synchronization issues
import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  PROJECT_REF: 'ugmfmnwbynppdzkhvrih',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWZtbndieW5wcGR6a2h2cmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE4NzAsImV4cCI6MjA3MTQ1Nzg3MH0.MTNKqQCzmRETjULZ2PRx8mTK3hpR90tn6Pz36h1nMR4',
  URL: 'https://ugmfmnwbynppdzkhvrih.supabase.co'
};

const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

async function debugDatabase() {
  console.log('🔍 DEBUGGING DATABASE SYNCHRONIZATION...\n');

  try {
    // 1. Check purchases table
    console.log('📊 PURCHASES TABLE:');
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('id, status, total_amount, unit_price, customer_id, created_at')
      .order('created_at', { ascending: false });

    if (purchasesError) {
      console.error('❌ Error fetching purchases:', purchasesError);
      return;
    }

    console.log(`Total purchases: ${purchases?.length || 0}`);
    purchases?.forEach(p => {
      const expectedTickets = Math.round(p.total_amount / p.unit_price);
      console.log(`- Purchase ${p.id}: ${p.status} | ${expectedTickets} tickets expected | Customer: ${p.customer_id}`);
    });

    console.log('\n📊 TICKETS TABLE:');
    const { data: ticketStats, error: statsError } = await supabase
      .from('tickets')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        const stats = {
          total: data?.length || 0,
          disponibles: data?.filter(t => t.status === 'disponible').length || 0,
          vendidos: data?.filter(t => t.status === 'vendido').length || 0,
          reservados: data?.filter(t => t.status === 'reservado').length || 0
        };
        
        return { data: stats, error: null };
      });

    if (statsError) {
      console.error('❌ Error fetching ticket stats:', statsError);
      return;
    }

    console.log(`Total tickets: ${ticketStats?.total}`);
    console.log(`- Disponibles: ${ticketStats?.disponibles}`);
    console.log(`- Vendidos: ${ticketStats?.vendidos}`);
    console.log(`- Reservados: ${ticketStats?.reservados}`);

    // 3. Check tickets associated with confirmed purchases
    console.log('\n🔗 TICKETS ASSOCIATED WITH CONFIRMED PURCHASES:');
    const confirmedPurchases = purchases?.filter(p => p.status === 'confirmada') || [];
    
    for (const purchase of confirmedPurchases) {
      const { data: ticketsForPurchase, error: ticketsError } = await supabase
        .from('tickets')
        .select('number, status, purchase_id, customer_id, sold_at')
        .eq('purchase_id', purchase.id);

      if (ticketsError) {
        console.error(`❌ Error fetching tickets for purchase ${purchase.id}:`, ticketsError);
        continue;
      }

      const expectedTickets = Math.round(purchase.total_amount / purchase.unit_price);
      console.log(`Purchase ${purchase.id} (confirmed):`);
      console.log(`  - Expected tickets: ${expectedTickets}`);
      console.log(`  - Actual tickets found: ${ticketsForPurchase?.length || 0}`);
      
      if (ticketsForPurchase && ticketsForPurchase.length > 0) {
        const statusCounts = ticketsForPurchase.reduce((acc, t) => {
          acc[t.status] = (acc[t.status] || 0) + 1;
          return acc;
        }, {});
        console.log(`  - Status breakdown:`, statusCounts);
        console.log(`  - Numbers: ${ticketsForPurchase.map(t => t.number).sort((a, b) => a - b).join(', ')}`);
      } else {
        console.log(`  ⚠️ NO TICKETS FOUND FOR CONFIRMED PURCHASE!`);
      }
    }

    // 4. Check orphaned tickets (have purchase_id but purchase doesn't exist)
    console.log('\n🔍 ORPHANED TICKETS CHECK:');
    const { data: ticketsWithPurchase, error: orphanError } = await supabase
      .from('tickets')
      .select('number, status, purchase_id, customer_id')
      .not('purchase_id', 'is', null);

    if (orphanError) {
      console.error('❌ Error checking orphaned tickets:', orphanError);
    } else if (ticketsWithPurchase) {
      const purchaseIds = new Set(purchases?.map(p => p.id) || []);
      const orphanedTickets = ticketsWithPurchase.filter(t => !purchaseIds.has(t.purchase_id));
      
      if (orphanedTickets.length > 0) {
        console.log(`⚠️ Found ${orphanedTickets.length} orphaned tickets:`);
        orphanedTickets.forEach(t => {
          console.log(`  - Ticket ${t.number}: status=${t.status}, purchase_id=${t.purchase_id}`);
        });
      } else {
        console.log('✅ No orphaned tickets found');
      }
    }

    // 5. Summary of synchronization issues
    console.log('\n📋 SYNCHRONIZATION ANALYSIS:');
    const confirmedPurchasesCount = confirmedPurchases.length;
    const soldTicketsCount = ticketStats?.vendidos || 0;
    const totalExpectedSoldTickets = confirmedPurchases.reduce((sum, p) => {
      return sum + Math.round(p.total_amount / p.unit_price);
    }, 0);

    console.log(`- Confirmed purchases: ${confirmedPurchasesCount}`);
    console.log(`- Expected sold tickets: ${totalExpectedSoldTickets}`);
    console.log(`- Actual sold tickets: ${soldTicketsCount}`);
    
    if (totalExpectedSoldTickets !== soldTicketsCount) {
      console.log(`❌ SYNCHRONIZATION PROBLEM DETECTED!`);
      console.log(`   Gap: ${totalExpectedSoldTickets - soldTicketsCount} tickets`);
    } else {
      console.log(`✅ Ticket synchronization appears correct`);
    }

  } catch (error) {
    console.error('❌ Critical error during debug:', error);
  }
}

// Run the debug
debugDatabase().catch(console.error);