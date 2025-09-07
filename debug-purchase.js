// Quick debug script to test the purchase functionality
// Run this in browser console to test purchase flow

async function testPurchaseFlow() {
  console.log('🧪 DEBUGGING: Testing purchase flow...');
  
  try {
    // Import Supabase functions
    const { guardarCompra, obtenerMetadata, verificarConexion } = await import('./src/lib/supabase');
    
    // Test connection first
    console.log('🔍 Testing Supabase connection...');
    const isConnected = await verificarConexion();
    console.log(`✅ Connection status: ${isConnected}`);
    
    if (!isConnected) {
      console.error('❌ Cannot proceed without database connection');
      return;
    }
    
    // Get metadata
    const metadata = obtenerMetadata();
    console.log('📱 Device metadata:', metadata);
    
    // Prepare test purchase data
    const testPurchase = {
      nombre: 'Juan',
      apellidos: 'Pérez Test',
      telefono: '+52 55 1234 5678',
      email: 'test@example.com',
      estado: 'Ciudad de México',
      ciudad: 'CDMX',
      cantidad_boletos: 2,
      numeros_boletos: [1001, 1002],
      precio_unitario: 250,
      precio_total: 500,
      metodo_pago: 'bancoppel',
      navegador: metadata.navegador,
      dispositivo: metadata.dispositivo,
      ip_address: metadata.ip_address,
      user_agent: metadata.user_agent
    };
    
    console.log('💰 Test purchase data:', testPurchase);
    
    // Attempt to save purchase
    console.log('💾 Attempting to save purchase...');
    const result = await guardarCompra(testPurchase);
    
    console.log('✅ SUCCESS! Purchase saved:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ ERROR in test purchase:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    return null;
  }
}

// If running in browser, expose the function globally
if (typeof window !== 'undefined') {
  window.testPurchaseFlow = testPurchaseFlow;
  console.log('🚀 Test function available: window.testPurchaseFlow()');
}

export { testPurchaseFlow };