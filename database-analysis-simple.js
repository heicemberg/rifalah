/**
 * ============================================================================
 * COMPREHENSIVE DATABASE ANALYSIS FOR 2-TICKET DISCREPANCY
 * ============================================================================
 * 
 * This script performs a thorough analysis to find the exact source of the
 * mathematical discrepancy where sold + available ≠ 10,000.
 * 
 * Problem: User reports seeing 1900 + 8098 = 9998 (missing 2 tickets)
 * Goal: Find where the 2 tickets are lost in the counting system
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://qddoazfhbgdmtevgdzgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZG9hemZoYmdkbXRldmdkemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzg1NDAsImV4cCI6MjA0OTk1NDU0MH0.hWkiB_nj-mGTORbrLRzXhEQz6KHhp6yPNXVjDikmBTM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Constants
const TOTAL_EXPECTED_TICKETS = 10000;

// ANSI colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);
const header = (message) => log('cyan', `\n${'='.repeat(80)}\n${message}\n${'='.repeat(80)}`);
const subheader = (message) => log('blue', `\n${'-'.repeat(60)}\n${message}\n${'-'.repeat(60)}`);
const success = (message) => log('green', `✅ ${message}`);
const error = (message) => log('red', `❌ ${message}`);
const warning = (message) => log('yellow', `⚠️  ${message}`);
const info = (message) => log('white', `ℹ️  ${message}`);

/**
 * Test database connectivity
 */
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('id', { head: true, count: 'exact' });
    
    if (error) throw error;
    
    success('Database connection established');
    return true;
  } catch (err) {
    error(`Database connection failed: ${err.message}`);
    return false;
  }
}

/**
 * 1. VERIFY TOTAL TICKET RECORDS IN DATABASE
 */
async function verifyTotalTicketRecords() {
  subheader('1. VERIFYING TOTAL TICKET RECORDS');
  
  try {
    // Count total records in tickets table
    const { count: totalRecords, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    info(`Total ticket records in database: ${totalRecords}`);
    
    if (totalRecords === TOTAL_EXPECTED_TICKETS) {
      success(`Perfect! Database has exactly ${TOTAL_EXPECTED_TICKETS} ticket records`);
    } else if (totalRecords < TOTAL_EXPECTED_TICKETS) {
      error(`CRITICAL: Database is missing ${TOTAL_EXPECTED_TICKETS - totalRecords} ticket records!`);
    } else {
      error(`CRITICAL: Database has ${totalRecords - TOTAL_EXPECTED_TICKETS} extra ticket records!`);
    }
    
    return totalRecords;
  } catch (err) {
    error(`Failed to count total ticket records: ${err.message}`);
    return 0;
  }
}

/**
 * 2. ANALYZE TICKET STATUS DISTRIBUTION
 */
async function analyzeTicketStatusDistribution() {
  subheader('2. ANALYZING TICKET STATUS DISTRIBUTION');
  
  try {
    // Get all tickets with their statuses
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('status');
    
    if (error) throw error;
    
    // Count by status
    const statusCounts = {};
    tickets.forEach(ticket => {
      const status = ticket.status || 'NULL';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    info('Ticket status distribution:');
    let total = 0;
    Object.entries(statusCounts).forEach(([status, count]) => {
      info(`  ${status}: ${count} tickets`);
      total += count;
    });
    
    info(`  TOTAL: ${total} tickets`);
    
    // Check if total matches expected
    if (total === TOTAL_EXPECTED_TICKETS) {
      success(`Status distribution total matches expected ${TOTAL_EXPECTED_TICKETS}`);
    } else {
      error(`Status distribution total (${total}) does not match expected (${TOTAL_EXPECTED_TICKETS})`);
    }
    
    // Specific checks for the application's expected statuses
    const available = statusCounts['available'] || 0;
    const sold = (statusCounts['sold'] || 0) + (statusCounts['vendido'] || 0);
    const reserved = (statusCounts['reserved'] || 0) + (statusCounts['reservado'] || 0);
    const selected = statusCounts['selected'] || 0;
    const nullStatus = statusCounts['NULL'] || 0;
    
    info('Status mapping for application:');
    info(`  Available: ${available}`);
    info(`  Sold: ${sold}`);
    info(`  Reserved: ${reserved}`);
    info(`  Selected: ${selected}`);
    info(`  NULL: ${nullStatus}`);
    
    const applicationTotal = available + sold + reserved + selected + nullStatus;
    info(`  Application Total: ${applicationTotal}`);
    
    // This is likely where the 2-ticket discrepancy comes from
    if (applicationTotal !== total) {
      error(`🚨 DISCREPANCY: Application total (${applicationTotal}) ≠ Database total (${total})`);
      const difference = total - applicationTotal;
      error(`   Missing ${difference} tickets in status mapping!`);
      
      if (difference === 2) {
        error('   🎯 THIS IS THE 2-TICKET DISCREPANCY!');
      }
    }
    
    return {
      statusCounts,
      total,
      application: {
        available,
        sold,
        reserved,
        selected,
        nullStatus,
        total: applicationTotal
      }
    };
  } catch (err) {
    error(`Failed to analyze ticket status distribution: ${err.message}`);
    return null;
  }
}

/**
 * 3. COMPREHENSIVE MATHEMATICAL VERIFICATION
 */
async function comprehensiveMathVerification() {
  subheader('3. COMPREHENSIVE MATHEMATICAL VERIFICATION');
  
  try {
    // Method 1: Count by individual status queries
    info('Method 1: Individual status COUNT queries...');
    
    const [totalResult, availableResult, soldResult, vendidoResult, reservedResult, reservadoResult, selectedResult, nullResult] = await Promise.all([
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'vendido'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'reserved'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'reservado'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'selected'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).is('status', null)
    ]);
    
    const method1 = {
      total: totalResult.count,
      available: availableResult.count || 0,
      sold: (soldResult.count || 0) + (vendidoResult.count || 0),
      reserved: (reservedResult.count || 0) + (reservadoResult.count || 0),
      selected: selectedResult.count || 0,
      null: nullResult.count || 0
    };
    
    info(`  Total: ${method1.total}`);
    info(`  Available: ${method1.available}`);
    info(`  Sold: ${method1.sold} (sold: ${soldResult.count || 0}, vendido: ${vendidoResult.count || 0})`);
    info(`  Reserved: ${method1.reserved} (reserved: ${reservedResult.count || 0}, reservado: ${reservadoResult.count || 0})`);
    info(`  Selected: ${method1.selected}`);
    info(`  NULL: ${method1.null}`);
    
    const method1Sum = method1.available + method1.sold + method1.reserved + method1.selected + method1.null;
    info(`  Sum: ${method1Sum}`);
    
    // Check for the missing 2 tickets
    const method1Difference = method1.total - method1Sum;
    if (method1Difference !== 0) {
      error(`🚨 METHOD 1 DISCREPANCY: ${method1Difference} tickets unaccounted for`);
      if (method1Difference === 2) {
        error('   🎯 FOUND THE 2-TICKET DISCREPANCY IN STATUS COUNTING!');
      }
    } else {
      success('Method 1: All tickets accounted for');
    }
    
    // Method 2: Get all tickets and analyze statuses
    info('\nMethod 2: Fetch all tickets and analyze...');
    const { data: allTickets, error: allError } = await supabase
      .from('tickets')
      .select('number, status');
    
    if (allError) throw allError;
    
    // Analyze all statuses found
    const allStatuses = {};
    allTickets.forEach(ticket => {
      const status = ticket.status || 'NULL';
      allStatuses[status] = (allStatuses[status] || 0) + 1;
    });
    
    info(`  Total tickets fetched: ${allTickets.length}`);
    info(`  Unique statuses found:`);
    Object.entries(allStatuses).forEach(([status, count]) => {
      info(`    ${status}: ${count}`);
    });
    
    // Check for unknown statuses that might be causing the discrepancy
    const knownStatuses = ['available', 'sold', 'vendido', 'reserved', 'reservado', 'selected', 'NULL'];
    const unknownStatuses = Object.keys(allStatuses).filter(status => !knownStatuses.includes(status));
    
    if (unknownStatuses.length > 0) {
      error(`🚨 UNKNOWN STATUSES FOUND: ${unknownStatuses.join(', ')}`);
      let unknownCount = 0;
      unknownStatuses.forEach(status => {
        unknownCount += allStatuses[status];
        error(`   ${status}: ${allStatuses[status]} tickets`);
      });
      
      if (unknownCount === 2) {
        error('   🎯 FOUND THE 2-TICKET DISCREPANCY IN UNKNOWN STATUSES!');
      }
    }
    
    return {
      method1,
      allStatuses,
      unknownStatuses,
      totalFetched: allTickets.length
    };
  } catch (err) {
    error(`Failed comprehensive math verification: ${err.message}`);
    return null;
  }
}

/**
 * 4. CHECK FOR MISSING TICKET NUMBERS
 */
async function checkMissingTicketNumbers() {
  subheader('4. CHECKING FOR MISSING TICKET NUMBERS (1-10000)');
  
  try {
    // Get all ticket numbers
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('number')
      .order('number');
    
    if (error) throw error;
    
    const ticketNumbers = tickets.map(t => t.number);
    const uniqueNumbers = new Set(ticketNumbers);
    
    info(`Total ticket numbers retrieved: ${ticketNumbers.length}`);
    info(`Unique ticket numbers: ${uniqueNumbers.size}`);
    
    // Check for duplicates
    if (ticketNumbers.length !== uniqueNumbers.size) {
      const duplicates = ticketNumbers.filter((num, index) => ticketNumbers.indexOf(num) !== index);
      error(`CRITICAL: Found ${duplicates.length} duplicate ticket numbers:`);
      duplicates.slice(0, 10).forEach(dup => error(`  Duplicate: ${dup}`));
      if (duplicates.length > 10) {
        error(`  ... and ${duplicates.length - 10} more duplicates`);
      }
    } else {
      success('No duplicate ticket numbers found');
    }
    
    // Check for missing numbers in range 1-10000
    const missingNumbers = [];
    for (let i = 1; i <= TOTAL_EXPECTED_TICKETS; i++) {
      if (!uniqueNumbers.has(i)) {
        missingNumbers.push(i);
      }
    }
    
    if (missingNumbers.length > 0) {
      error(`CRITICAL: Found ${missingNumbers.length} missing ticket numbers:`);
      missingNumbers.slice(0, 20).forEach(missing => error(`  Missing: ${missing}`));
      if (missingNumbers.length > 20) {
        error(`  ... and ${missingNumbers.length - 20} more missing numbers`);
      }
      
      if (missingNumbers.length === 2) {
        error(`🎯 FOUND THE 2-TICKET DISCREPANCY! Missing tickets: ${missingNumbers.join(', ')}`);
      }
    } else {
      success('All numbers 1-10000 are present');
    }
    
    return {
      totalNumbers: ticketNumbers.length,
      uniqueNumbers: uniqueNumbers.size,
      duplicates: ticketNumbers.length - uniqueNumbers.size,
      missingNumbers: missingNumbers
    };
  } catch (err) {
    error(`Failed to check ticket number integrity: ${err.message}`);
    return null;
  }
}

/**
 * 5. TEST THE GET_RAFFLE_STATS FUNCTION
 */
async function testGetRaffleStatsFunction() {
  subheader('5. TESTING GET_RAFFLE_STATS() FUNCTION');
  
  try {
    // Call the database function
    const { data: statsData, error } = await supabase
      .rpc('get_raffle_stats');
    
    if (error) {
      warning(`get_raffle_stats() function failed: ${error.message}`);
      return null;
    }
    
    if (statsData && statsData.length > 0) {
      const stats = statsData[0];
      
      info('get_raffle_stats() function results:');
      info(`  Total Tickets: ${stats.total_tickets}`);
      info(`  Available: ${stats.available_tickets}`);
      info(`  Reserved: ${stats.reserved_tickets}`);
      info(`  Sold: ${stats.sold_tickets}`);
      info(`  Sold %: ${stats.sold_percentage}%`);
      
      // Check math
      const functionTotal = stats.available_tickets + stats.reserved_tickets + stats.sold_tickets;
      info(`  Function Math Check: ${stats.available_tickets} + ${stats.reserved_tickets} + ${stats.sold_tickets} = ${functionTotal}`);
      
      if (functionTotal === stats.total_tickets) {
        success(`Function math is correct: ${functionTotal} = ${stats.total_tickets}`);
      } else {
        error(`Function math error: ${functionTotal} ≠ ${stats.total_tickets} (missing ${stats.total_tickets - functionTotal})`);
        
        if (stats.total_tickets - functionTotal === 2) {
          error('🎯 FOUND THE 2-TICKET DISCREPANCY IN DATABASE FUNCTION!');
        }
      }
      
      return stats;
    } else {
      error('get_raffle_stats() function returned no data');
      return null;
    }
  } catch (err) {
    error(`Failed to test get_raffle_stats() function: ${err.message}`);
    return null;
  }
}

/**
 * MAIN ANALYSIS FUNCTION
 */
async function runDatabaseAnalysis() {
  header('COMPREHENSIVE DATABASE ANALYSIS FOR 2-TICKET DISCREPANCY');
  
  info('Starting comprehensive database analysis...');
  info(`Expected total tickets: ${TOTAL_EXPECTED_TICKETS}`);
  info(`Problem: User reports 1900 sold + 8098 available = 9998 (missing 2)`);
  
  const results = {};
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    error('Cannot proceed without database connection');
    process.exit(1);
  }
  
  // Run all analysis steps
  results.totalRecords = await verifyTotalTicketRecords();
  results.statusDistribution = await analyzeTicketStatusDistribution();
  results.mathVerification = await comprehensiveMathVerification();
  results.missingNumbers = await checkMissingTicketNumbers();
  results.dbFunction = await testGetRaffleStatsFunction();
  
  // Final summary
  header('🎯 FINAL ANALYSIS SUMMARY & ROOT CAUSE');
  
  let rootCauseFound = false;
  const possibleCauses = [];
  
  // Check 1: Missing records
  if (results.totalRecords !== TOTAL_EXPECTED_TICKETS) {
    const missing = TOTAL_EXPECTED_TICKETS - results.totalRecords;
    possibleCauses.push(`Database has ${results.totalRecords} records instead of ${TOTAL_EXPECTED_TICKETS} (missing ${missing})`);
    if (missing === 2) {
      error('🎯 ROOT CAUSE IDENTIFIED: Database is missing exactly 2 ticket records!');
      rootCauseFound = true;
    }
  }
  
  // Check 2: Missing numbers
  if (results.missingNumbers && results.missingNumbers.missingNumbers.length > 0) {
    const missing = results.missingNumbers.missingNumbers.length;
    possibleCauses.push(`${missing} ticket numbers are missing from sequence 1-10000`);
    if (missing === 2) {
      error(`🎯 ROOT CAUSE IDENTIFIED: Tickets ${results.missingNumbers.missingNumbers.join(', ')} are missing from database!`);
      rootCauseFound = true;
    }
  }
  
  // Check 3: Status mapping issues
  if (results.statusDistribution && results.statusDistribution.total !== results.statusDistribution.application.total) {
    const missing = results.statusDistribution.total - results.statusDistribution.application.total;
    possibleCauses.push(`${missing} tickets have unmapped statuses`);
    if (missing === 2) {
      error('🎯 ROOT CAUSE IDENTIFIED: 2 tickets have unmapped statuses in the application logic!');
      rootCauseFound = true;
    }
  }
  
  // Check 4: Unknown statuses
  if (results.mathVerification && results.mathVerification.unknownStatuses.length > 0) {
    let unknownCount = 0;
    results.mathVerification.unknownStatuses.forEach(status => {
      unknownCount += results.mathVerification.allStatuses[status];
    });
    if (unknownCount === 2) {
      error(`🎯 ROOT CAUSE IDENTIFIED: 2 tickets have unknown status values: ${results.mathVerification.unknownStatuses.join(', ')}`);
      rootCauseFound = true;
    }
  }
  
  // Summary
  if (rootCauseFound) {
    success('🎯 ROOT CAUSE SUCCESSFULLY IDENTIFIED!');
  } else {
    warning('Root cause not clearly identified. Possible causes:');
    possibleCauses.forEach(cause => warning(`  - ${cause}`));
  }
  
  // Generate fix recommendations
  header('🔧 RECOMMENDED FIXES');
  
  if (results.totalRecords < TOTAL_EXPECTED_TICKETS) {
    const missing = TOTAL_EXPECTED_TICKETS - results.totalRecords;
    info(`1. Insert ${missing} missing ticket records:`);
    info('   Run this SQL in your Supabase SQL editor:');
    log('cyan', `
INSERT INTO tickets (number, ticket_code, status)
SELECT 
  num,
  LPAD(num::text, 4, '0'),
  'available'
FROM generate_series(1, 10000) AS num
WHERE num NOT IN (SELECT number FROM tickets WHERE number IS NOT NULL)
ORDER BY num;`);
  }
  
  if (results.missingNumbers && results.missingNumbers.duplicates > 0) {
    info('2. Remove duplicate ticket records:');
    log('cyan', `
DELETE FROM tickets t1
WHERE t1.id NOT IN (
  SELECT MIN(t2.id)
  FROM tickets t2
  WHERE t2.number = t1.number
);`);
  }
  
  if (results.mathVerification && results.mathVerification.unknownStatuses.length > 0) {
    info('3. Fix tickets with invalid statuses:');
    results.mathVerification.unknownStatuses.forEach(status => {
      log('cyan', `UPDATE tickets SET status = 'available' WHERE status = '${status}';`);
    });
  }
  
  info('4. Verify the fix worked:');
  log('cyan', `
SELECT 
  COUNT(*) as total_after_fix,
  COUNT(*) FILTER (WHERE status = 'available') as available,
  COUNT(*) FILTER (WHERE status IN ('sold', 'vendido')) as sold,
  COUNT(*) FILTER (WHERE status IN ('reserved', 'reservado')) as reserved,
  COUNT(*) FILTER (WHERE status = 'available') + 
  COUNT(*) FILTER (WHERE status IN ('sold', 'vendido')) + 
  COUNT(*) FILTER (WHERE status IN ('reserved', 'reservado')) as math_check
FROM tickets;`);
  
  success('🎯 Analysis complete! Check the output above for the exact cause and solution.');
  
  return results;
}

// Run the analysis
runDatabaseAnalysis()
  .then(() => {
    success('Database analysis completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    error(`Database analysis failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  });