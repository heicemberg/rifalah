// API endpoint para mantener la base de datos Supabase activa
// Previene que se pause por inactividad en el Free Plan

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Hacer una consulta simple para mantener la BD activa
    const { data, error } = await supabase
      .from('customers')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Keep-alive error:', error.message);
      return NextResponse.json({ 
        status: 'error', 
        message: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    console.log('✅ Keep-alive successful:', new Date().toISOString());
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database is alive',
      timestamp: new Date().toISOString(),
      count: data
    });

  } catch (error) {
    console.error('Keep-alive critical error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}