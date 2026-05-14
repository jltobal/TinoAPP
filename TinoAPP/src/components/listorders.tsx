import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoPrinter from '../assets/JPG/TinoAPP_Logo_Printer_350px_JPG.jpg';

interface Order {
  id: number;
  total_price: number;
  date: string;
  items_summary: string | null;
}

const ListOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToPrint, setOrderToPrint] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Error en el servidor');
        return res.json();
      })
      .then((data: Order[]) => {
        // CORRECCIÓN DE ORDEN: Ordenamos de mayor a menor por ID
        const sortedOrders = [...data].sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar órdenes:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (orderToPrint) {
      const timer = setTimeout(() => {
        window.print();
        setOrderToPrint(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint]);

  const handleEdit = (orderId: number) => {
    navigate(`/order?id=${orderId}`);
  };

  const handlePrint = (order: Order) => {
    const itemsArray = order.items_summary 
      ? order.items_summary.split(', ').map(itemStr => {
          const [cantidadStr, ...descParts] = itemStr.split('x ');
          return {
            cantidad: cantidadStr.trim(),
            descripcion: descParts.join('x ').trim(),
            precio: 0 
          };
        })
      : [];

    setOrderToPrint({
      id: order.id.toString().padStart(4, '0'),
      items: itemsArray,
      total: order.total_price,
      date: new Date(order.date).toLocaleString('es-AR')
    });
  };

  return (
    <div className="h-full bg-[#121212] text-white p-6 overflow-y-auto">
      <style>
        {`
        .ticket-visual-hidden { display: none; }
        @media print {
            @page { size: 80mm auto; margin: 0 !important; }
            body * { visibility: hidden; }
            .ticket-print-area, .ticket-print-area * {
                visibility: visible !important;
                display: block !important;
            }
            .ticket-print-area {
                position: absolute; left: 0; top: 0; width: 72mm; padding: 4mm;
                background: white; color: black; font-family: 'Courier New', Courier, monospace; font-size: 12px;
            }
            .ticket-header { text-align: center; margin-bottom: 10px; }
            .ticket-logo { width: 140px; display: block; margin: 0 auto; }
            .ticket-table { width: 100% !important; display: table !important; border-collapse: collapse; margin-top: 5px; }
            .ticket-table tr { display: table-row !important; }
            .ticket-table td { display: table-cell !important; padding: 2px 0; vertical-align: top; }
            .col-qty { width: 15%; text-align: left; }
            .col-desc { width: 55%; text-align: left; }
            .col-price { width: 30%; text-align: right; }
            .ticket-divider { border-top: 1px dashed black; margin: 5px 0; }
            .ticket-total-row { display: flex !important; justify-content: space-between; align-items: baseline; font-weight: bold; margin-top: 5px; }
            .total-label { font-size: 14px; }
            .total-amount { font-size: 22px; }
            .ticket-footer { text-align: center; font-size: 9px; margin-top: 15px; line-height: 1.2; }
        }
        `}
      </style>

      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600 text-center">
        Historial de Órdenes
      </h2>

      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando registros...</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-xs font-bold text-orange-500 uppercase">Orden #{order.id?.toString().padStart(4, '0')}</span>
                  <div className="text-sm text-gray-300">
                    {order.items_summary?.split(', ').map((txt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-800 rounded-full"></span>
                        {txt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                  <span className="text-xl font-black text-white">${order.total_price?.toLocaleString('es-AR')}</span>
                  <span className="text-[10px] text-gray-500 uppercase">{new Date(order.date).toLocaleString('es-AR')}</span>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800/50">
                <button onClick={() => handleEdit(order.id)} className="px-4 py-2 bg-[#1e293b] hover:bg-orange-700 text-xs font-bold uppercase rounded-lg text-white border border-gray-700">
                  <span className="text-orange-500">✏️</span> EDITAR
                </button>
                <button onClick={() => handlePrint(order)} className="px-4 py-2 bg-[#1e293b] hover:bg-blue-700 text-xs font-bold uppercase rounded-lg text-white border border-gray-700">
                  <span>🖨️</span> IMPRIMIR
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {orderToPrint && (
        <div className="ticket-print-area ticket-visual-hidden">
          <div className="ticket-header">
            <img src={logoPrinter} className="ticket-logo" alt="Logo" />
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>ORDEN #{orderToPrint.id}</div>
            <div style={{ fontSize: '10px' }}>{orderToPrint.date}</div>
          </div>
          <div className="ticket-divider"></div>
          <table className="ticket-table">
            <tbody>
              {orderToPrint.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="col-qty">{item.cantidad} x</td>
                  <td className="col-desc">{item.descripcion}</td>
                  <td className="col-price"></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ticket-divider"></div>
          <div className="ticket-total-row">
            <span className="total-label">TOTAL:</span>
            <span className="total-amount">
              ${orderToPrint.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="ticket-footer">
              <div>Documento no válido como factura</div>
              <div style={{ marginTop: '10px' }}>TOMI'S FOOD TRUCK</div>
              <div>Olavarría, Buenos Aires</div>
              <div style={{ marginTop: '5px' }}>*** GRACIAS POR SU COMPRA ***</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrders;