// Netlify Edge Function para mantener Supabase activo
// Se ejecuta automáticamente cada 6 horas

import { Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  try {
    // Solo ejecutar en requests GET al endpoint keep-alive
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Llamar a nuestra API de keep-alive
    const response = await fetch(`${new URL(request.url).origin}/api/keep-alive`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Netlify-KeepAlive/1.0',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    console.log('Keep-alive executed:', data);
    
    return new Response(JSON.stringify({
      status: 'success',
      message: 'Supabase keep-alive completed',
      timestamp: new Date().toISOString(),
      data: data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Keep-alive failed:', error);
    
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Keep-alive failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

// Configuración para ejecutar cada 6 horas
export const config = {
  schedule: "0 */6 * * *"  // Cada 6 horas
};