// Deep debug to find the real issue
import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG = {
  URL: 'https://ugmfmnwbynppdzkhvrih.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWZtbndieW5wcGR6a2h2cmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODE4NzAsImV4cCI6MjA3MTQ1Nzg3MH0.MTNKqQCzmRETjULZ2PRx8mTK3hpR90tn6Pz36h1nMR4'
};

const supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);

async function deepDebug() {
  console.log('🕵️ DEEP DEBUGGING...\n');
  
  try {
    // 1. Check table structure
    console.log('🔍 CHECKING TABLE STRUCTURE...');
    const { data: schema, error: schemaError } = await supabase.rpc('describe_table', { table_name: 'tickets' });
    if (!schemaError && schema) {
      console.log('Table structure:', schema);
    } else {
      console.log('Could not get table structure, trying direct select...');
    }

    // 2. Check total row count first
    console.log('\n📊 TOTAL ROW COUNT:');
    const { count: totalCount, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting count:', countError);
    } else {
      console.log(`Total tickets in database: ${totalCount}`);
    }

    // 3. Sample some records to see actual data
    console.log('\n🔍 SAMPLE RECORDS:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('tickets')
      .select('*')
      .order('number')
      .limit(10);
    
    if (sampleError) {
      console.error('Error getting sample:', sampleError);
    } else {
      console.log('Sample tickets:', sampleData);
    }

    // 4. Check specifically for sold tickets
    console.log('\n🎫 SOLD TICKETS:');
    const { data: soldTickets, error: soldError } = await supabase
      .from('tickets')
      .select('*')
      .eq('status', 'vendido')
      .limit(10);
    
    if (soldError) {
      console.error('Error getting sold tickets:', soldError);
    } else {
      console.log(`Found ${soldTickets?.length || 0} sold tickets (showing first 10):`);
      soldTickets?.forEach(ticket => {
        console.log(`  - Ticket ${ticket.number}: ${ticket.status}, Purchase: ${ticket.purchase_id}`);
      });
    }

    // 5. Count by status using aggregation
    console.log('\n📈 STATUS COUNTS USING AGGREGATION:');
    const { data: statusCounts, error: statusError } = await supabase
      .from('tickets')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error };
        
        if (!data) return { data: null, error: new Error('No data') };
        
        // Log first few records to see what we're getting
        console.log('Sample status data:', data.slice(0, 5));
        
        const counts = data.reduce((acc, ticket) => {
          acc[ticket.status] = (acc[ticket.status] || 0) + 1;
          return acc;
        }, {});
        
        return { data: counts, error: null };
      });
    
    if (statusError) {
      console.error('Error counting statuses:', statusError);
    } else {
      console.log('Status counts:', statusCounts);
    }

    // 6. Direct SQL query if possible
    console.log('\n💾 ATTEMPTING DIRECT SQL QUERY:');
    try {
      const { data: sqlResult, error: sqlError } = await supabase
        .rpc('get_ticket_stats');
      
      if (sqlError) {
        console.log('Direct SQL not available:', sqlError.message);
      } else {
        console.log('SQL result:', sqlResult);
      }
    } catch (e) {
      console.log('Direct SQL not supported');
    }

    // 7. Check if there's a different tickets table
    console.log('\n🔍 CHECKING FOR OTHER TICKET TABLES:');
    try {
      // Try to see if there are other table names
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .ilike('table_name', '%ticket%');
      
      if (!tablesError && tables) {
        console.log('Tables with "ticket" in name:', tables);
      }
    } catch (e) {
      console.log('Could not check table names');
    }

  } catch (error) {
    console.error('❌ Deep debug error:', error);
  }
}

deepDebug().catch(console.error);