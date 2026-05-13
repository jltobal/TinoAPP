import React, { useEffect, useState } from 'react';

interface Order {
  id: number;
  total_price: number;
  date: string;
  items_summary: string | null;
}

const ListOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Error en el servidor');
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar órdenes:", err);
        setLoading(false);
      });
  }, []);

  const handleEdit = (orderId: number) => {
    console.log(`Abriendo edición para la orden #${orderId}`);
  };

  const handlePrint = (orderId: number) => {
    console.log(`Generando impresión para la orden #${orderId}`);
  };

  return (
    <div className="h-full bg-[#121212] text-white p-6 overflow-y-auto">
      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600 text-center">
        Historial de Órdenes
      </h2>

      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando registros...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No hay órdenes registradas en tinoapp.db</p>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col gap-4 hover:border-orange-900/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-xs font-bold text-orange-500 uppercase tracking-tighter">
                    Orden #{order.id?.toString().padStart(4, '0')}
                  </span>
                  
                  <div className="text-sm text-gray-300">
                    {order.items_summary ? (
                      <ul className="list-none space-y-1">
                        {order.items_summary.split(', ').map((txt, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-800 rounded-full"></span>
                            {txt}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-gray-500 text-xs">Sin detalles</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                  <span className="text-xl font-black text-white">
                    ${order.total_price?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    {new Date(order.date).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/50">
                <button 
                  onClick={() => handleEdit(order.id)}
                  className="px-4 py-2 bg-gray-800 hover:bg-orange-700 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>✏️</span> Editar
                </button>
                <button 
                  onClick={() => handlePrint(order.id)}
                  className="px-4 py-2 bg-gray-800 hover:bg-blue-700 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>🖨️</span> Imprimir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListOrders;