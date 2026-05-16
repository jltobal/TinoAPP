import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoPrinter from '../assets/JPG/Logo_ByN_350px_jpg.jpg';

interface Order {
  id: number;
  total_price: number;
  date: string;
  items_summary: string | null;
}

interface DailySummary {
  timestamp: string;
  items: { [key: string]: number };
  totalOrders: number;
  totalRevenue: number;
}

const ListOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToPrint, setOrderToPrint] = useState<any>(null);
  const [summaryToPrint, setSummaryToPrint] = useState<DailySummary | null>(null);
  const navigate = useNavigate();

  // Función auxiliar para normalizar fechas de la DB
  const parseDBDate = (dateStr: string) => {
    // Si el string no termina en Z, se la agregamos para que JS lo tome como UTC
    const normalizedStr = dateStr.endsWith('Z') ? dateStr : `${dateStr.replace(' ', 'T')}Z`;
    return new Date(normalizedStr);
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Error en el servidor');
        return res.json();
      })
      .then((data: Order[]) => {
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
    if (orderToPrint || summaryToPrint) {
      const timer = setTimeout(() => {
        window.print();
        setOrderToPrint(null);
        setSummaryToPrint(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint, summaryToPrint]);

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
      date: parseDBDate(order.date).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
    });
  };

  const handleDailySummary = () => {
    const now = new Date();
    const eightHoursAgo = now.getTime() - (12 * 60 * 60 * 1000); //Imprime ordenes desde el momento actual hasta 12 horas atras

    const recentOrders = orders.filter(order => {
      const orderTime = parseDBDate(order.date).getTime();
      return orderTime >= eightHoursAgo && orderTime <= now.getTime();
    });

    const summary: DailySummary = {
      timestamp: now.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
      items: {},
      totalOrders: recentOrders.length,
      totalRevenue: 0
    };

    recentOrders.forEach(order => {
      summary.totalRevenue += order.total_price;
      if (order.items_summary) {
        order.items_summary.split(', ').forEach(itemStr => {
          const parts = itemStr.split('x ');
          if (parts.length >= 2) {
            const qty = parseInt(parts[0]);
            const desc = parts.slice(1).join('x ').trim();
            summary.items[desc] = (summary.items[desc] || 0) + qty;
          }
        });
      }
    });

    setSummaryToPrint(summary);
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
            .col-qty { width: 20%; text-align: left; }
            .col-desc { width: 80%; text-align: left; }
            .ticket-divider { border-top: 1px dashed black; margin: 8px 0; }
            .summary-item { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .ticket-footer { text-align: center; font-size: 10px; margin-top: 15px; line-height: 1.4; }
        }
        `}
      </style>

      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={handleDailySummary}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] border border-blue-400/30"
        >
          Generar Resumen Diario
        </button>
      </div>

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
                  <span className="text-[10px] text-gray-500 uppercase">
                    {parseDBDate(order.date).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
                  </span>
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
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ticket-divider"></div>
          <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
            <span>TOTAL: ${orderToPrint.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="ticket-footer">
            <div>Documento no válido como factura</div>
            <div style={{ marginTop: '5px' }}>TOMI'S FOOD TRUCK</div>
            <div>*** GRACIAS POR SU COMPRA ***</div>
          </div>
        </div>
      )}


      {summaryToPrint && (
        <div className="ticket-print-area ticket-visual-hidden">
          <div className="ticket-header">
            <img src={logoPrinter} className="ticket-logo" alt="Logo" />
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '10px', textTransform: 'uppercase' }}>Resumen Diario</div>
            <div style={{ fontSize: '11px' }}>{summaryToPrint.timestamp}</div>
          </div>
          <div className="ticket-divider"></div>
          <div style={{ padding: '5px 0' }}>
            {Object.entries(summaryToPrint.items).map(([desc, qty]) => (
              <div key={desc} className="summary-item">
                <span>{desc}</span>
                <span style={{ fontWeight: 'bold' }}>= {qty}</span>
              </div>
            ))}
          </div>
          <div className="ticket-divider"></div>
          <div className="summary-item" style={{ fontSize: '13px' }}>
            <span>Ordenes totales=</span>
            <span style={{ fontWeight: 'bold' }}>{summaryToPrint.totalOrders}</span>
          </div>
          <div className="summary-item" style={{ fontSize: '13px' }}>
            <span>Ingresos=</span>
            <span style={{ fontWeight: 'bold' }}>${summaryToPrint.totalRevenue.toLocaleString('es-AR')}</span>
          </div>
          <div className="ticket-footer">
            <div>- Documento de control -</div>
            <div>- No valido como factura -</div>
            <div style={{ marginTop: '10px' }}>TinoAPP v2.0</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOrders;