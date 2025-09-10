#!/usr/bin/env node

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

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qddoazfhbgdmtevgdzgz.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZG9hemZoYmdkbXRldmdkemd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzg1NDAsImV4cCI6MjA0OTk1NDU0MH0.hWkiB_nj-mGTORbrLRzXhEQz6KHhp6yPNXVjDikmBTM';

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
 * 2. CHECK FOR GAPS OR DUPLICATES IN TICKET NUMBERING
 */
async function checkTicketNumberIntegrity() {
  subheader('2. CHECKING TICKET NUMBER INTEGRITY (1-10000)');
  
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
    } else {
      success('All numbers 1-10000 are present');
    }
    
    // Check for numbers outside valid range
    const invalidNumbers = ticketNumbers.filter(num => num < 1 || num > TOTAL_EXPECTED_TICKETS);
    if (invalidNumbers.length > 0) {
      error(`CRITICAL: Found ${invalidNumbers.length} invalid ticket numbers:`);
      invalidNumbers.forEach(invalid => error(`  Invalid: ${invalid}`));
    } else {
      success('All ticket numbers are within valid range (1-10000)');
    }
    
    return {
      totalNumbers: ticketNumbers.length,
      uniqueNumbers: uniqueNumbers.size,
      duplicates: ticketNumbers.length - uniqueNumbers.size,
      missingNumbers: missingNumbers.length,
      invalidNumbers: invalidNumbers.length
    };
  } catch (err) {
    error(`Failed to check ticket number integrity: ${err.message}`);
    return null;
  }
}

/**
 * 3. ANALYZE TICKET STATUS DISTRIBUTION
 */
async function analyzeTicketStatusDistribution() {
  subheader('3. ANALYZING TICKET STATUS DISTRIBUTION');
  
  try {
    // Get count by status
    const { data: statusCounts, error } = await supabase
      .from('tickets')
      .select('status')
      .then(({ data, error }) => {
        if (error) throw error;
        
        const counts = {};
        data.forEach(ticket => {
          counts[ticket.status || 'NULL'] = (counts[ticket.status || 'NULL'] || 0) + 1;
        });
        
        return { data: counts, error: null };
      });
    
    if (error) throw error;
    
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
    const sold = statusCounts['sold'] || statusCounts['vendido'] || 0;
    const reserved = statusCounts['reserved'] || statusCounts['reservado'] || 0;
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
 * 4. TEST THE GET_RAFFLE_STATS FUNCTION
 */
async function testGetRaffleStatsFunction() {
  subheader('4. TESTING GET_RAFFLE_STATS() FUNCTION');
  
  try {
    // Call the database function
    const { data: statsData, error } = await supabase
      .rpc('get_raffle_stats');
    
    if (error) throw error;
    
    if (statsData && statsData.length > 0) {
      const stats = statsData[0];
      
      info('get_raffle_stats() function results:');
      info(`  Total Tickets: ${stats.total_tickets}`);
      info(`  Available: ${stats.available_tickets}`);
      info(`  Reserved: ${stats.reserved_tickets}`);
      info(`  Sold: ${stats.sold_tickets}`);
      info(`  Sold %: ${stats.sold_percentage}%`);
      info(`  Total Revenue: $${stats.total_revenue}`);
      info(`  Pending Purchases: ${stats.pending_purchases}`);
      info(`  Completed Purchases: ${stats.completed_purchases}`);
      
      // Check math
      const functionTotal = stats.available_tickets + stats.reserved_tickets + stats.sold_tickets;
      info(`  Function Math Check: ${stats.available_tickets} + ${stats.reserved_tickets} + ${stats.sold_tickets} = ${functionTotal}`);
      
      if (functionTotal === stats.total_tickets) {
        success(`Function math is correct: ${functionTotal} = ${stats.total_tickets}`);
      } else {
        error(`Function math error: ${functionTotal} ≠ ${stats.total_tickets} (missing ${stats.total_tickets - functionTotal})`);
      }
      
      return stats;
    } else {
      error('get_raffle_stats() function returned no data');
      return null;
    }
  } catch (err) {
    error(`Failed to test get_raffle_stats() function: ${err.message}`);
    
    // Try manual count as fallback
    warning('Attempting manual count as fallback...');
    try {
      const { count: totalCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true });
        
      const { count: availableCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');
        
      const { count: soldCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sold');
        
      const { count: reservedCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'reserved');
      
      info('Manual count fallback:');
      info(`  Total: ${totalCount}`);
      info(`  Available: ${availableCount}`);
      info(`  Sold: ${soldCount}`);
      info(`  Reserved: ${reservedCount}`);
      
      const manualTotal = (availableCount || 0) + (soldCount || 0) + (reservedCount || 0);
      info(`  Manual Total: ${manualTotal}`);
      
      if (manualTotal === totalCount) {
        success(`Manual math is correct: ${manualTotal} = ${totalCount}`);
      } else {
        error(`Manual math error: ${manualTotal} ≠ ${totalCount} (missing ${totalCount - manualTotal})`);
      }
      
      return {
        total_tickets: totalCount,
        available_tickets: availableCount,
        sold_tickets: soldCount,
        reserved_tickets: reservedCount,
        manual_total: manualTotal
      };
    } catch (fallbackErr) {
      error(`Manual count fallback also failed: ${fallbackErr.message}`);
      return null;
    }
  }
}

/**
 * 5. VERIFY FOREIGN KEY RELATIONSHIPS
 */
async function verifyForeignKeyRelationships() {
  subheader('5. VERIFYING FOREIGN KEY RELATIONSHIPS');
  
  try {
    // Check tickets with invalid customer_id
    const { count: orphanTickets, error: orphanError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .not('customer_id', 'is', null)
      .not('customer_id', 'in', `(SELECT id FROM customers)`);
    
    if (orphanError) {
      warning(`Could not check orphan tickets (table relationship might not be enforced): ${orphanError.message}`);
    } else {
      if (orphanTickets > 0) {
        error(`Found ${orphanTickets} tickets with invalid customer_id references`);
      } else {
        success('All ticket customer_id references are valid');
      }
    }
    
    // Check purchase_tickets relationships
    try {
      const { count: orphanPurchaseTickets, error: ptError } = await supabase
        .from('purchase_tickets')
        .select('*', { count: 'exact', head: true })
        .not('ticket_id', 'in', `(SELECT id FROM tickets)`);
        
      if (ptError) {
        warning(`Could not check purchase_tickets relationships: ${ptError.message}`);
      } else {
        if (orphanPurchaseTickets > 0) {
          error(`Found ${orphanPurchaseTickets} purchase_tickets with invalid ticket_id references`);
        } else {
          success('All purchase_tickets relationships are valid');
        }
      }
    } catch (ptErr) {
      warning(`purchase_tickets table might not exist: ${ptErr.message}`);
    }
    
    return {
      orphanTickets: orphanTickets || 0
    };
  } catch (err) {
    error(`Failed to verify foreign key relationships: ${err.message}`);
    return null;
  }
}

/**
 * 6. COMPREHENSIVE MATHEMATICAL VERIFICATION
 */
async function comprehensiveMathVerification() {
  subheader('6. COMPREHENSIVE MATHEMATICAL VERIFICATION');
  
  try {
    // Method 1: Direct status count
    info('Method 1: Direct status counting...');
    const { data: allTickets, error: allError } = await supabase
      .from('tickets')
      .select('number, status');
    
    if (allError) throw allError;
    
    const method1 = {
      total: allTickets.length,
      available: allTickets.filter(t => t.status === 'available').length,
      sold: allTickets.filter(t => t.status === 'sold' || t.status === 'vendido').length,
      reserved: allTickets.filter(t => t.status === 'reserved' || t.status === 'reservado').length,
      selected: allTickets.filter(t => t.status === 'selected').length,
      null: allTickets.filter(t => !t.status).length,
      other: allTickets.filter(t => t.status && !['available', 'sold', 'vendido', 'reserved', 'reservado', 'selected'].includes(t.status)).length
    };
    
    info(`  Total: ${method1.total}`);
    info(`  Available: ${method1.available}`);
    info(`  Sold: ${method1.sold}`);
    info(`  Reserved: ${method1.reserved}`);
    info(`  Selected: ${method1.selected}`);
    info(`  NULL: ${method1.null}`);
    info(`  Other: ${method1.other}`);
    
    const method1Sum = method1.available + method1.sold + method1.reserved + method1.selected + method1.null + method1.other;
    info(`  Sum: ${method1Sum}`);
    
    // Method 2: Separate COUNT queries
    info('\nMethod 2: Separate COUNT queries...');
    const countQueries = await Promise.all([
      supabase.from('tickets').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'available'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['sold', 'vendido']),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).in('status', ['reserved', 'reservado']),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'selected'),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).is('status', null)
    ]);
    
    const method2 = {
      total: countQueries[0].count,
      available: countQueries[1].count,
      sold: countQueries[2].count,
      reserved: countQueries[3].count,
      selected: countQueries[4].count,
      null: countQueries[5].count
    };
    
    info(`  Total: ${method2.total}`);
    info(`  Available: ${method2.available}`);
    info(`  Sold: ${method2.sold}`);
    info(`  Reserved: ${method2.reserved}`);
    info(`  Selected: ${method2.selected}`);
    info(`  NULL: ${method2.null}`);
    
    const method2Sum = method2.available + method2.sold + method2.reserved + method2.selected + method2.null;
    info(`  Sum (without other): ${method2Sum}`);
    
    // Method 3: Database function
    info('\nMethod 3: Database function...');
    let method3 = null;
    try {
      const { data: statsData, error: statsError } = await supabase.rpc('get_raffle_stats');
      if (!statsError && statsData && statsData.length > 0) {
        method3 = {
          total: statsData[0].total_tickets,
          available: statsData[0].available_tickets,
          sold: statsData[0].sold_tickets,
          reserved: statsData[0].reserved_tickets
        };
        
        info(`  Total: ${method3.total}`);
        info(`  Available: ${method3.available}`);
        info(`  Sold: ${method3.sold}`);
        info(`  Reserved: ${method3.reserved}`);
        
        const method3Sum = method3.available + method3.sold + method3.reserved;
        info(`  Sum: ${method3Sum}`);
      } else {
        warning('Database function not available or returned no data');
      }
    } catch (statsErr) {
      warning(`Database function failed: ${statsErr.message}`);
    }
    
    // Compare all methods
    info('\n📊 COMPARISON OF ALL METHODS:');
    info(`Method 1 (Direct):     Total=${method1.total}, Available=${method1.available}, Sold=${method1.sold}, Reserved=${method1.reserved}, Sum=${method1Sum}`);
    info(`Method 2 (Separate):   Total=${method2.total}, Available=${method2.available}, Sold=${method2.sold}, Reserved=${method2.reserved}, Sum=${method2Sum}`);
    if (method3) {
      const method3Sum = method3.available + method3.sold + method3.reserved;
      info(`Method 3 (Function):   Total=${method3.total}, Available=${method3.available}, Sold=${method3.sold}, Reserved=${method3.reserved}, Sum=${method3Sum}`);
    }
    
    // Look for discrepancies
    const discrepancies = [];
    
    if (method1.total !== method2.total) {
      discrepancies.push(`Total count mismatch: Method1=${method1.total} vs Method2=${method2.total}`);
    }
    
    if (method1.available !== method2.available) {
      discrepancies.push(`Available count mismatch: Method1=${method1.available} vs Method2=${method2.available}`);
    }
    
    if (method1.sold !== method2.sold) {
      discrepancies.push(`Sold count mismatch: Method1=${method1.sold} vs Method2=${method2.sold}`);
    }
    
    if (method1.reserved !== method2.reserved) {
      discrepancies.push(`Reserved count mismatch: Method1=${method1.reserved} vs Method2=${method2.reserved}`);
    }
    
    if (method3) {
      if (method1.total !== method3.total) {
        discrepancies.push(`Total vs function mismatch: Method1=${method1.total} vs Function=${method3.total}`);
      }
      if (method2.available !== method3.available) {
        discrepancies.push(`Available vs function mismatch: Method2=${method2.available} vs Function=${method3.available}`);
      }
    }
    
    if (discrepancies.length > 0) {
      error('🚨 CRITICAL DISCREPANCIES FOUND:');
      discrepancies.forEach(d => error(`  ${d}`));
    } else {
      success('✅ All counting methods agree - no discrepancies found');
    }
    
    // Check the 2-ticket problem specifically
    const expectedSum = TOTAL_EXPECTED_TICKETS;
    const actualSums = [method1Sum, method2Sum];
    if (method3) {
      actualSums.push(method3.available + method3.sold + method3.reserved);
    }
    
    info('\n🔍 SEARCHING FOR THE 2-TICKET DISCREPANCY:');
    actualSums.forEach((sum, index) => {
      const methodName = ['Method1', 'Method2', 'Method3'][index];
      const difference = expectedSum - sum;
      
      if (difference === 2) {
        error(`🎯 FOUND IT! ${methodName} is missing exactly 2 tickets (${sum} vs ${expectedSum})`);
      } else if (difference !== 0) {
        warning(`${methodName} has ${difference} ticket difference (${sum} vs ${expectedSum})`);
      } else {
        success(`${methodName} has correct total (${sum})`);
      }
    });
    
    return {
      method1,
      method2,
      method3,
      discrepancies,
      expectedSum,
      actualSums
    };
  } catch (err) {
    error(`Failed comprehensive math verification: ${err.message}`);
    return null;
  }
}

/**
 * 7. IDENTIFY SPECIFIC MISSING TICKETS
 */
async function identifyMissingTickets() {
  subheader('7. IDENTIFYING SPECIFIC MISSING TICKETS');
  
  try {
    // Get all ticket numbers and statuses
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('number, status')
      .order('number');
    
    if (error) throw error;
    
    // Create a complete set of expected numbers
    const expectedNumbers = new Set();
    for (let i = 1; i <= TOTAL_EXPECTED_TICKETS; i++) {
      expectedNumbers.add(i);
    }
    
    // Create a set of actual numbers
    const actualNumbers = new Set(tickets.map(t => t.number));
    
    // Find missing numbers
    const missingNumbers = [];
    expectedNumbers.forEach(num => {
      if (!actualNumbers.has(num)) {
        missingNumbers.push(num);
      }
    });
    
    // Find status issues
    const statusIssues = tickets.filter(t => 
      !t.status || 
      !['available', 'sold', 'vendido', 'reserved', 'reservado', 'selected'].includes(t.status)
    );
    
    info(`Missing ticket numbers: ${missingNumbers.length}`);
    if (missingNumbers.length > 0 && missingNumbers.length <= 20) {
      missingNumbers.forEach(num => error(`  Missing: ${num}`));
    } else if (missingNumbers.length > 20) {
      missingNumbers.slice(0, 10).forEach(num => error(`  Missing: ${num}`));
      error(`  ... and ${missingNumbers.length - 10} more missing numbers`);
    }
    
    info(`Status issues: ${statusIssues.length}`);
    if (statusIssues.length > 0 && statusIssues.length <= 10) {
      statusIssues.forEach(ticket => warning(`  Ticket ${ticket.number}: status="${ticket.status}"`));
    } else if (statusIssues.length > 10) {
      statusIssues.slice(0, 5).forEach(ticket => warning(`  Ticket ${ticket.number}: status="${ticket.status}"`));
      warning(`  ... and ${statusIssues.length - 5} more status issues`);
    }
    
    // Check for exactly 2 missing tickets
    if (missingNumbers.length === 2) {
      error(`🎯 FOUND THE 2-TICKET PROBLEM! Missing tickets: ${missingNumbers.join(', ')}`);
    }
    
    return {
      missingNumbers,
      statusIssues,
      totalActual: tickets.length,
      totalExpected: TOTAL_EXPECTED_TICKETS
    };
  } catch (err) {
    error(`Failed to identify missing tickets: ${err.message}`);
    return null;
  }
}

/**
 * 8. GENERATE SQL QUERIES FOR PRECISE COUNTING
 */
function generatePreciseCountingQueries() {
  subheader('8. PRECISE SQL QUERIES FOR TICKET COUNTING');
  
  info('Use these SQL queries in your Supabase SQL editor or database client:');
  
  const queries = [
    {
      title: 'Total ticket count verification',
      sql: `SELECT COUNT(*) as total_tickets FROM tickets;`
    },
    {
      title: 'Ticket status distribution',
      sql: `SELECT 
  status,
  COUNT(*) as count,
  ROUND((COUNT(*)::decimal / (SELECT COUNT(*) FROM tickets)) * 100, 2) as percentage
FROM tickets 
GROUP BY status 
ORDER BY count DESC;`
    },
    {
      title: 'Missing ticket numbers check',
      sql: `SELECT num as missing_ticket_number
FROM generate_series(1, 10000) as num
WHERE num NOT IN (SELECT number FROM tickets ORDER BY number);`
    },
    {
      title: 'Duplicate ticket numbers check',
      sql: `SELECT number, COUNT(*) as occurrences
FROM tickets
GROUP BY number
HAVING COUNT(*) > 1
ORDER BY number;`
    },
    {
      title: 'Precise available ticket count',
      sql: `SELECT COUNT(*) as available_tickets
FROM tickets 
WHERE status = 'available';`
    },
    {
      title: 'Precise sold ticket count',
      sql: `SELECT COUNT(*) as sold_tickets
FROM tickets 
WHERE status IN ('sold', 'vendido');`
    },
    {
      title: 'Precise reserved ticket count',
      sql: `SELECT COUNT(*) as reserved_tickets
FROM tickets 
WHERE status IN ('reserved', 'reservado');`
    },
    {
      title: 'Mathematical verification query',
      sql: `SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'available') as available,
  COUNT(*) FILTER (WHERE status IN ('sold', 'vendido')) as sold,
  COUNT(*) FILTER (WHERE status IN ('reserved', 'reservado')) as reserved,
  COUNT(*) FILTER (WHERE status = 'selected') as selected,
  COUNT(*) FILTER (WHERE status IS NULL) as null_status,
  COUNT(*) FILTER (WHERE status NOT IN ('available', 'sold', 'vendido', 'reserved', 'reservado', 'selected') AND status IS NOT NULL) as other_status,
  -- Verification
  COUNT(*) FILTER (WHERE status = 'available') + 
  COUNT(*) FILTER (WHERE status IN ('sold', 'vendido')) + 
  COUNT(*) FILTER (WHERE status IN ('reserved', 'reservado')) + 
  COUNT(*) FILTER (WHERE status = 'selected') + 
  COUNT(*) FILTER (WHERE status IS NULL) +
  COUNT(*) FILTER (WHERE status NOT IN ('available', 'sold', 'vendido', 'reserved', 'reservado', 'selected') AND status IS NOT NULL) as calculated_total
FROM tickets;`
    },
    {
      title: 'Data integrity check',
      sql: `SELECT 
  'Tickets with invalid numbers' as issue_type,
  COUNT(*) as count
FROM tickets 
WHERE number < 1 OR number > 10000
UNION ALL
SELECT 
  'Tickets with NULL numbers' as issue_type,
  COUNT(*) as count
FROM tickets 
WHERE number IS NULL
UNION ALL
SELECT 
  'Tickets with empty status' as issue_type,
  COUNT(*) as count
FROM tickets 
WHERE status IS NULL OR status = '';`
    },
    {
      title: 'Find the exact 2 missing tickets',
      sql: `WITH expected_tickets AS (
  SELECT generate_series(1, 10000) as ticket_number
),
actual_tickets AS (
  SELECT number as ticket_number FROM tickets
)
SELECT 
  e.ticket_number as missing_ticket_number
FROM expected_tickets e
LEFT JOIN actual_tickets a ON e.ticket_number = a.ticket_number
WHERE a.ticket_number IS NULL
ORDER BY e.ticket_number;`
    }
  ];
  
  queries.forEach((query, index) => {
    info(`\n${index + 1}. ${query.title}:`);
    log('cyan', query.sql);
  });
  
  return queries;
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
  results.numberIntegrity = await checkTicketNumberIntegrity();
  results.statusDistribution = await analyzeTicketStatusDistribution();
  results.dbFunction = await testGetRaffleStatsFunction();
  results.foreignKeys = await verifyForeignKeyRelationships();
  results.mathVerification = await comprehensiveMathVerification();
  results.missingTickets = await identifyMissingTickets();
  
  // Generate SQL queries
  const sqlQueries = generatePreciseCountingQueries();
  
  // Final summary
  header('🎯 FINAL ANALYSIS SUMMARY');
  
  if (results.totalRecords !== TOTAL_EXPECTED_TICKETS) {
    error(`🚨 ROOT CAUSE IDENTIFIED: Database has ${results.totalRecords} records instead of ${TOTAL_EXPECTED_TICKETS}`);
    if (results.totalRecords < TOTAL_EXPECTED_TICKETS) {
      const missing = TOTAL_EXPECTED_TICKETS - results.totalRecords;
      error(`   Missing ${missing} ticket records in database`);
      
      if (missing === 2) {
        error('   🎯 THIS IS THE SOURCE OF THE 2-TICKET DISCREPANCY!');
      }
    }
  }
  
  if (results.numberIntegrity) {
    if (results.numberIntegrity.missingNumbers > 0) {
      error(`🚨 NUMBERING ISSUE: ${results.numberIntegrity.missingNumbers} missing ticket numbers`);
      if (results.numberIntegrity.missingNumbers === 2) {
        error('   🎯 THIS COULD BE THE SOURCE OF THE 2-TICKET DISCREPANCY!');
      }
    }
    
    if (results.numberIntegrity.duplicates > 0) {
      error(`🚨 DUPLICATE ISSUE: ${results.numberIntegrity.duplicates} duplicate ticket numbers`);
    }
  }
  
  if (results.mathVerification) {
    const { actualSums, expectedSum } = results.mathVerification;
    actualSums.forEach((sum, index) => {
      const difference = expectedSum - sum;
      if (difference === 2) {
        error(`🎯 METHOD ${index + 1} CONFIRMS: Missing exactly 2 tickets (${sum}/${expectedSum})`);
      }
    });
  }
  
  if (results.missingTickets) {
    if (results.missingTickets.missingNumbers.length === 2) {
      error(`🎯 SPECIFIC MISSING TICKETS: ${results.missingTickets.missingNumbers.join(', ')}`);
    }
  }
  
  // Recommendations
  header('🔧 RECOMMENDED FIXES');
  
  if (results.totalRecords < TOTAL_EXPECTED_TICKETS) {
    const missing = TOTAL_EXPECTED_TICKETS - results.totalRecords;
    info(`1. Insert ${missing} missing ticket records:`);
    log('cyan', `INSERT INTO tickets (number, ticket_code, status)
SELECT 
  num,
  LPAD(num::text, 4, '0'),
  'available'
FROM generate_series(1, 10000) AS num
WHERE num NOT IN (SELECT number FROM tickets)
ORDER BY num;`);
  }
  
  if (results.numberIntegrity && results.numberIntegrity.duplicates > 0) {
    info('2. Remove duplicate ticket records (keep the first occurrence)');
    log('cyan', `DELETE FROM tickets t1
WHERE t1.id NOT IN (
  SELECT MIN(t2.id)
  FROM tickets t2
  WHERE t2.number = t1.number
);`);
  }
  
  info('3. Verify the fix worked:');
  log('cyan', `SELECT 
  COUNT(*) as total_after_fix,
  COUNT(*) FILTER (WHERE status = 'available') as available,
  COUNT(*) FILTER (WHERE status IN ('sold', 'vendido')) as sold,
  COUNT(*) FILTER (WHERE status IN ('reserved', 'reservado')) as reserved
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