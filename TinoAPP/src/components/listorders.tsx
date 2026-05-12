import React, { useEffect, useState } from 'react';

interface Order {
  id: number;
  item_id: string;
  items?: string[];
  total_cost?: number;
  created_at: string;
}

const ListOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/orders')
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar órdenes:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="h-full bg-[#121212] text-white p-6 overflow-y-auto">
      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600 text-center">
        Historial de Órdenes
      </h2>

      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando registros...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No hay órdenes registradas.</p>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:border-orange-900/50 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-orange-500 uppercase tracking-tighter">
                  Orden #{order.id.toString().padStart(4, '0')}
                </span>
                <div className="text-sm text-gray-300">
                  {order.items ? (
                    <ul className="list-none space-y-1">
                      {order.items.map((txt, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                          {txt}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>{order.item_id}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
                <span className="text-xl font-black text-white">
                  ${order.total_cost?.toLocaleString() || '0.00'}
                </span>
                <span className="text-[10px] text-gray-500 uppercase">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ListOrders;