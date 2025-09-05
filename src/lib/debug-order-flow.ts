'use client';

// ============================================================================
// DEBUG UTILITY: Comprehensive Order Flow Testing
// ============================================================================

import { supabase } from './supabase';

export interface OrderFlowTest {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
  timestamp: string;
}

export class OrderFlowDebugger {
  private tests: OrderFlowTest[] = [];
  
  private log(step: string, status: 'pending' | 'success' | 'error', message: string, data?: any) {
    const test: OrderFlowTest = {
      step,
      status,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.tests.push(test);
    
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳';
    console.log(`${emoji} [${step.toUpperCase()}] ${message}`, data || '');
    
    return test;
  }

  async testCompleteOrderFlow(testData = {
    nombre: 'Test User',
    apellidos: 'Debug',
    telefono: '+52 55 1234 5678',
    email: 'test@debug.com',
    cantidad_boletos: 2
  }): Promise<{ success: boolean; tests: OrderFlowTest[]; summary: string }> {
    this.tests = [];
    
    try {
      // STEP 1: Database Connection
      this.log('connection', 'pending', 'Testing database connection...');
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('count', { count: 'exact', head: true });
        
        if (error) throw error;
        
        this.log('connection', 'success', `Database connected successfully`, { count: data });
      } catch (error) {
        this.log('connection', 'error', `Database connection failed: ${error instanceof Error ? error.message : 'unknown'}`, error);
        return { success: false, tests: this.tests, summary: 'Connection failed' };
      }

      // STEP 2: Tickets Table Verification
      this.log('tickets_table', 'pending', 'Verifying tickets table...');
      
      try {
        const { data: ticketsData, error } = await supabase
          .from('tickets')
          .select('status')
          .limit(10);
        
        if (error) throw error;
        
        const availableCount = ticketsData?.filter(t => t.status === 'disponible').length || 0;
        
        this.log('tickets_table', 'success', `Tickets table verified`, { 
          sampleSize: ticketsData?.length || 0,
          availableInSample: availableCount
        });
      } catch (error) {
        this.log('tickets_table', 'error', `Tickets table error: ${error instanceof Error ? error.message : 'unknown'}`, error);
      }

      // STEP 3: Test Customer Creation
      this.log('customer_creation', 'pending', 'Testing customer creation...');
      
      let customerId: string;
      try {
        const { data: customer, error } = await supabase
          .from('customers')
          .insert([{
            name: `${testData.nombre} ${testData.apellidos}`,
            email: testData.email,
            phone: testData.telefono,
            city: 'Test City',
            state: 'Test State'
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        customerId = customer.id;
        this.log('customer_creation', 'success', 'Customer created successfully', { id: customerId });
      } catch (error) {
        this.log('customer_creation', 'error', `Customer creation failed: ${error instanceof Error ? error.message : 'unknown'}`, error);
        return { success: false, tests: this.tests, summary: 'Customer creation failed' };
      }

      // STEP 4: Test Purchase Creation
      this.log('purchase_creation', 'pending', 'Testing purchase creation...');
      
      let purchaseId: string;
      try {
        const { data: purchase, error } = await supabase
          .from('purchases')
          .insert([{
            customer_id: customerId,
            total_amount: testData.cantidad_boletos * 199,
            unit_price: 199,
            discount_applied: 0,
            payment_method: 'Test Method',
            payment_reference: `TEST-${Date.now()}`,
            browser_info: 'Debug Test',
            device_info: 'Test Device',
            user_agent: 'Debug/1.0',
            status: 'pendiente'
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        purchaseId = purchase.id;
        this.log('purchase_creation', 'success', 'Purchase created successfully', { id: purchaseId });
      } catch (error) {
        this.log('purchase_creation', 'error', `Purchase creation failed: ${error instanceof Error ? error.message : 'unknown'}`, error);
        return { success: false, tests: this.tests, summary: 'Purchase creation failed' };
      }

      // STEP 5: Test Ticket Assignment
      this.log('ticket_assignment', 'pending', 'Testing ticket assignment...');
      
      try {
        // Get available tickets
        const { data: availableTickets, error: getError } = await supabase
          .from('tickets')
          .select('number')
          .eq('status', 'disponible')
          .limit(testData.cantidad_boletos);
        
        if (getError) throw getError;
        
        if (!availableTickets || availableTickets.length < testData.cantidad_boletos) {
          throw new Error(`Not enough available tickets. Need ${testData.cantidad_boletos}, found ${availableTickets?.length || 0}`);
        }
        
        const ticketNumbers = availableTickets.map(t => t.number);
        
        // Reserve tickets
        const { data: reservedTickets, error: updateError } = await supabase
          .from('tickets')
          .update({
            status: 'reservado',
            customer_id: customerId,
            purchase_id: purchaseId,
            reserved_at: new Date().toISOString()
          })
          .in('number', ticketNumbers)
          .select();
        
        if (updateError) throw updateError;
        
        this.log('ticket_assignment', 'success', 'Tickets assigned successfully', { 
          assigned: reservedTickets?.length || 0,
          numbers: ticketNumbers
        });
      } catch (error) {
        this.log('ticket_assignment', 'error', `Ticket assignment failed: ${error instanceof Error ? error.message : 'unknown'}`, error);
        return { success: false, tests: this.tests, summary: 'Ticket assignment failed' };
      }

      // STEP 6: Test Admin Confirmation Flow
      this.log('admin_confirmation', 'pending', 'Testing admin confirmation...');
      
      try {
        // Update purchase to confirmed
        const { data: confirmedPurchase, error: confirmError } = await supabase
          .from('purchases')
          .update({
            status: 'confirmada',
            verified_at: new Date().toISOString(),
            verified_by: 'Debug Test'
          })
          .eq('id', purchaseId)
          .select()
          .single();
        
        if (confirmError) throw confirmError;
        
        // Update tickets to sold
        const { data: soldTickets, error: ticketError } = await supabase
          .from('tickets')
          .update({
            status: 'vendido',
            sold_at: new Date().toISOString()
          })
          .eq('purchase_id', purchaseId)
          .select();
        
        if (ticketError) throw ticketError;
        
        this.log('admin_confirmation', 'success', 'Admin confirmation completed', {
          purchaseStatus: confirmedPurchase.status,
          ticketsSold: soldTickets?.length || 0
        });
      } catch (error) {
        this.log('admin_confirmation', 'error', `Admin confirmation failed: ${error instanceof Error ? error.message : 'unknown'}`, error);
        return { success: false, tests: this.tests, summary: 'Admin confirmation failed' };
      }

      // STEP 7: Cleanup Test Data
      this.log('cleanup', 'pending', 'Cleaning up test data...');
      
      try {
        // Delete tickets
        await supabase
          .from('tickets')
          .update({
            status: 'disponible',
            customer_id: null,
            purchase_id: null,
            reserved_at: null,
            sold_at: null
          })
          .eq('purchase_id', purchaseId);
        
        // Delete purchase
        await supabase
          .from('purchases')
          .delete()
          .eq('id', purchaseId);
        
        // Delete customer
        await supabase
          .from('customers')
          .delete()
          .eq('id', customerId);
        
        this.log('cleanup', 'success', 'Test data cleaned up successfully');
      } catch (error) {
        this.log('cleanup', 'error', `Cleanup failed: ${error instanceof Error ? error.message : 'unknown'}`, error);
      }

      const successCount = this.tests.filter(t => t.status === 'success').length;
      const totalCount = this.tests.length;
      
      return {
        success: true,
        tests: this.tests,
        summary: `Complete order flow test successful: ${successCount}/${totalCount} steps passed`
      };
      
    } catch (error) {
      this.log('fatal_error', 'error', `Fatal error: ${error instanceof Error ? error.message : 'unknown'}`, error);
      return {
        success: false,
        tests: this.tests,
        summary: `Fatal error during test: ${error instanceof Error ? error.message : 'unknown'}`
      };
    }
  }

  async testCounterSync(): Promise<{ success: boolean; details: any }> {
    console.group('🧮 TESTING COUNTER SYNCHRONIZATION...');
    
    try {
      // Get real ticket counts
      const { data: ticketData, error } = await supabase
        .from('tickets')
        .select('status');
      
      if (error) throw error;
      
      const counts = {
        total: ticketData?.length || 0,
        disponible: ticketData?.filter(t => t.status === 'disponible').length || 0,
        vendido: ticketData?.filter(t => t.status === 'vendido').length || 0,
        reservado: ticketData?.filter(t => t.status === 'reservado').length || 0
      };
      
      const mathCheck = counts.disponible + counts.vendido + counts.reservado;
      const isValid = mathCheck === counts.total && counts.total === 10000;
      
      console.log('📊 Real Counts:', counts);
      console.log('🧮 Math Check:', { calculated: mathCheck, expected: counts.total, valid: isValid });
      
      // Test Zustand store connection
      let zustandSync = false;
      if (typeof window !== 'undefined') {
        const raffleStore = (window as any).__ZUSTAND_RAFFLE_STORE__;
        if (raffleStore && raffleStore.getState) {
          const state = raffleStore.getState();
          console.log('🔄 Zustand State:', {
            soldCount: state.soldTickets?.length || 0,
            reservedCount: state.reservedTickets?.length || 0
          });
          zustandSync = true;
        }
      }
      
      console.groupEnd();
      
      return {
        success: isValid,
        details: {
          counts,
          mathValid: isValid,
          zustandConnected: zustandSync,
          discrepancy: mathCheck - counts.total
        }
      };
      
    } catch (error) {
      console.error('❌ Counter sync test failed:', error);
      console.groupEnd();
      return {
        success: false,
        details: { error: error instanceof Error ? error.message : 'unknown' }
      };
    }
  }

  getTestResults(): OrderFlowTest[] {
    return this.tests;
  }

  printSummary(): void {
    console.group('📋 ORDER FLOW DEBUG SUMMARY');
    
    const successCount = this.tests.filter(t => t.status === 'success').length;
    const errorCount = this.tests.filter(t => t.status === 'error').length;
    const pendingCount = this.tests.filter(t => t.status === 'pending').length;
    
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`⏳ Pending: ${pendingCount}`);
    console.log(`📊 Total: ${this.tests.length}`);
    
    if (errorCount > 0) {
      console.log('\n❌ FAILED STEPS:');
      this.tests
        .filter(t => t.status === 'error')
        .forEach(t => console.log(`   ${t.step}: ${t.message}`));
    }
    
    console.groupEnd();
  }
}

// Global instance for console debugging
if (typeof window !== 'undefined') {
  (window as any).__ORDER_FLOW_DEBUGGER__ = new OrderFlowDebugger();
  
  // Expose quick test function to console
  (window as any).testOrderFlow = async () => {
    const debugger = new OrderFlowDebugger();
    const result = await debugger.testCompleteOrderFlow();
    debugger.printSummary();
    return result;
  };
  
  (window as any).testCounters = async () => {
    const debugger = new OrderFlowDebugger();
    return await debugger.testCounterSync();
  };
}

export default OrderFlowDebugger;