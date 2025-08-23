'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ComprasTestPage() {
  const [compras, setCompras] = useState<any[]>([]);

  useEffect(() => {
    const comprasGuardadas = JSON.parse(localStorage.getItem('compras-registradas') || '[]');
    setCompras(comprasGuardadas);
  }, []);

  const limpiarCompras = () => {
    localStorage.removeItem('compras-registradas');
    setCompras([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📋 Compras Registradas ({compras.length})
          </h1>
          <button
            onClick={limpiarCompras}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            🗑️ Limpiar Todo
          </button>
        </div>

        {compras.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">
              No hay compras registradas aún.
            </p>
            <p className="text-gray-500 mt-2">
              Ve a la <Link href="/" className="text-blue-500 underline">página principal</Link> y prueba hacer una compra.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {compras.map((compra, index) => (
              <div key={compra.id || index} className="bg-white rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Datos del cliente */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-blue-800 mb-2">👤 Cliente</h3>
                    <p><strong>Nombre:</strong> {compra.nombre} {compra.apellidos}</p>
                    <p><strong>Teléfono:</strong> {compra.telefono || 'N/A'}</p>
                    <p><strong>Email:</strong> {compra.email || 'N/A'}</p>
                    <p><strong>Ubicación:</strong> {compra.ciudad}, {compra.estado}</p>
                  </div>

                  {/* Datos de la compra */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-bold text-green-800 mb-2">🎫 Compra</h3>
                    <p><strong>Boletos:</strong> {compra.cantidad_boletos}</p>
                    <p><strong>Precio unitario:</strong> ${compra.precio_unitario}</p>
                    <p><strong>Total:</strong> ${compra.precio_total}</p>
                    {compra.descuento_aplicado > 0 && (
                      <p className="text-green-600">
                        <strong>Descuento:</strong> {compra.descuento_aplicado}%
                      </p>
                    )}
                  </div>

                  {/* Datos del pago */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-bold text-yellow-800 mb-2">💳 Pago</h3>
                    <p><strong>Método:</strong> {compra.metodo_pago}</p>
                    <p><strong>Estado:</strong> {compra.estado_compra}</p>
                    <p><strong>Archivo:</strong> {compra.archivo_subido ? '✅ Sí' : '❌ No'}</p>
                    <p><strong>Fecha:</strong> {new Date(compra.fecha_compra).toLocaleString()}</p>
                  </div>
                </div>

                {/* Info adicional */}
                {compra.info_adicional && (
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <strong>Info adicional:</strong> {compra.info_adicional}
                  </div>
                )}

                {/* ID de la compra */}
                <div className="mt-4 text-xs text-gray-500">
                  ID: {compra.id} | Timestamp: {compra.timestamp}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-100 border border-blue-300 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">ℹ️ Información</h3>
          <p className="text-blue-700 text-sm">
            Esta página muestra las compras guardadas en localStorage (almacenamiento local del navegador).
            Cuando integres Supabase, las compras se guardarán en la base de datos real.
          </p>
        </div>
      </div>
    </div>
  );
}