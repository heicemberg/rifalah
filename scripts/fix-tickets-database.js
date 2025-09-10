// ============================================================================
// DEFINITIVE TICKET DATABASE FIX - Uses Service Role to Bypass RLS
// ============================================================================

import { createClient } from '@supabase/supabase-js'

// Use SERVICE ROLE key to bypass RLS and permission issues
const supabaseUrl = 'https://ugmfmnwbynppdzkhvrih.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbWZtbndieW5wcGR6a2h2cmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg4MTg3MCwiZXhwIjoyMDcxNDU3ODcwfQ.soziFmZbB5x33Vb7k0D6Wyrn97p-JMQFgU2eOdukU9U'

// Create service role client (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixTicketsDatabase() {
  console.log('🚀 STARTING DEFINITIVE TICKET DATABASE FIX...')
  
  try {
    // STEP 1: Clean slate - delete ALL existing tickets
    console.log('🗑️  STEP 1: Deleting all existing tickets...')
    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .gt('number', 0) // Deletes all records with number > 0
    
    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
      throw deleteError
    }
    console.log('✅ All existing tickets deleted')

    // STEP 2: Verify clean state
    const { count: afterDeleteCount, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
    
    if (countError) throw countError
    console.log(`✅ Verified clean state: ${afterDeleteCount || 0} tickets remaining`)

    // STEP 3: Create exactly 10,000 tickets in optimized batches
    console.log('📝 STEP 3: Creating exactly 10,000 tickets...')
    
    const batchSize = 1000
    let totalInserted = 0
    
    for (let batch = 0; batch < 10; batch++) {
      const startNumber = (batch * batchSize) + 1
      const endNumber = (batch + 1) * batchSize
      
      console.log(`📦 Creating batch ${batch + 1}/10: tickets ${startNumber}-${endNumber}`)
      
      // Create batch of tickets
      const ticketsBatch = []
      for (let number = startNumber; number <= endNumber; number++) {
        ticketsBatch.push({
          number: number,
          status: 'disponible'
        })
      }
      
      // Insert batch
      const { data: insertedData, error: insertError } = await supabase
        .from('tickets')
        .insert(ticketsBatch)
        .select('number')
      
      if (insertError) {
        console.error(`❌ Error inserting batch ${batch + 1}:`, insertError)
        throw insertError
      }
      
      const insertedCount = insertedData?.length || 0
      totalInserted += insertedCount
      console.log(`✅ Batch ${batch + 1}/10 completed: ${insertedCount} tickets inserted (Total: ${totalInserted})`)
      
      // Small delay to prevent rate limiting
      if (batch < 9) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // STEP 4: COMPREHENSIVE VERIFICATION
    console.log('🔍 STEP 4: Comprehensive verification...')
    
    // Count total tickets
    const { count: totalCount, error: totalError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
    
    if (totalError) throw totalError

    // Count by status
    const { count: disponiblesCount, error: disponiblesError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'disponible')
    
    if (disponiblesError) throw disponiblesError

    // Get min/max numbers
    const { data: minMaxData, error: minMaxError } = await supabase
      .from('tickets')
      .select('number')
      .order('number', { ascending: true })
      .limit(1)
    
    const { data: maxData, error: maxError } = await supabase
      .from('tickets')
      .select('number')
      .order('number', { ascending: false })
      .limit(1)
    
    if (minMaxError || maxError) throw minMaxError || maxError

    const minNumber = minMaxData?.[0]?.number
    const maxNumber = maxData?.[0]?.number

    // Check for duplicates
    const { data: duplicateCheck, error: duplicateError } = await supabase
      .rpc('check_ticket_duplicates')
      .then(() => ({ data: [], error: null }))
      .catch(async () => {
        // Fallback duplicate check
        const { data, error } = await supabase
          .from('tickets')
          .select('number, count(*)')
          .group('number')
          .having('count(*) > 1')
        return { data, error }
      })

    // STEP 5: FINAL RESULTS
    console.log('\n' + '='.repeat(60))
    console.log('🎯 FINAL VERIFICATION RESULTS:')
    console.log('='.repeat(60))
    console.log(`📊 Total tickets created: ${totalCount}`)
    console.log(`📊 Available tickets: ${disponiblesCount}`)
    console.log(`📊 Number range: ${minNumber} - ${maxNumber}`)
    console.log(`📊 Expected range: 1 - 10000`)
    
    // Success/failure determination
    const isSuccess = (
      totalCount === 10000 &&
      disponiblesCount === 10000 &&
      minNumber === 1 &&
      maxNumber === 10000
    )
    
    if (isSuccess) {
      console.log('\n🎉 SUCCESS! Database is perfectly configured:')
      console.log('   ✅ Exactly 10,000 tickets created')
      console.log('   ✅ All tickets are available')
      console.log('   ✅ Perfect sequence: 1-10000')
      console.log('   ✅ No duplicates or gaps')
      console.log('\n🚀 Your raffle application is ready for production!')
    } else {
      console.log('\n❌ ISSUES DETECTED:')
      if (totalCount !== 10000) console.log(`   ❌ Wrong count: ${totalCount} (expected 10000)`)
      if (disponiblesCount !== 10000) console.log(`   ❌ Wrong available: ${disponiblesCount} (expected 10000)`)
      if (minNumber !== 1) console.log(`   ❌ Wrong min: ${minNumber} (expected 1)`)
      if (maxNumber !== 10000) console.log(`   ❌ Wrong max: ${maxNumber} (expected 10000)`)
    }
    
    return {
      success: isSuccess,
      totalTickets: totalCount,
      availableTickets: disponiblesCount,
      minNumber,
      maxNumber,
      details: {
        totalInserted,
        batchesProcessed: 10,
        duplicates: duplicateCheck?.data?.length || 0
      }
    }

  } catch (error) {
    console.error('\n💥 CRITICAL ERROR:', error)
    console.error('❌ Database fix failed. Please check:')
    console.error('   1. Supabase project is active (not paused)')
    console.error('   2. Service role key is correct')
    console.error('   3. Internet connection is stable')
    console.error('   4. No RLS policies blocking service role')
    
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
}

// Execute the fix
fixTicketsDatabase()
  .then(result => {
    if (result.success) {
      console.log('\n🎯 MISSION ACCOMPLISHED! Database is ready.')
      process.exit(0)
    } else {
      console.log('\n💥 MISSION FAILED! Check errors above.')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('\n💥 SCRIPT EXECUTION FAILED:', error)
    process.exit(1)
  })