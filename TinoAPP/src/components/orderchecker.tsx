import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoPrinter from '../assets/JPG/Logo_ByN_350px_jpg.jpg';

interface OrderItem {
  id: string;
  descripcion: string;
  cantidad: string;
  precio: string; // Guarda siempre el precio UNITARIO base
}

function OrderChecker() {
  const navigate = useNavigate();
  const [items, setItems] = useState<OrderItem[]>([
    { id: '', descripcion: '', cantidad: '', precio: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<any>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const firstInput = inputRefs.current[`id-0`];
    if (firstInput) firstInput.focus();
  }, []);

  useEffect(() => {
    if (orderToPrint) {
      const timer = setTimeout(() => {
        window.print();
        setOrderToPrint(null);
        setItems([{ id: '', descripcion: '', cantidad: '', precio: '' }]);
        setTimeout(() => inputRefs.current[`id-0`]?.focus(), 100);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint]);

  // FIX 2: Cálculo del Total General de la orden en tiempo real
  const totalOrden = items.reduce((acc, item) => {
    if (!item.id.trim() || !item.precio) return acc;
    const parsedQty = parseInt(item.cantidad, 10);
    const currentQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1;
    return acc + (parseFloat(item.precio) * currentQty);
  }, 0);

  const validateProduct = async (index: number, code: string) => {
    if (!code) return false;
    try {
      const response = await fetch(`http://localhost:8000/api/menu/${code}`);
      if (response.ok) {
        const product = await response.json();
        const newItems = [...items];
        newItems[index].descripcion = product.Name || product.name || product.descripcion || "Sin nombre";
        newItems[index].precio = (product.Price || product.price || product.precio || 0).toString();
        
        if (!newItems[index].cantidad || newItems[index].cantidad === '0') {
          newItems[index].cantidad = '1';
        }
        setItems(newItems);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: 'id' | 'cantidad') => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (field === 'id') {
        const code = items[index].id;
        if (code.trim() !== '') {
          const isValid = await validateProduct(index, code);
          if (isValid) {
            setTimeout(() => {
              const qtyInput = inputRefs.current[`cantidad-${index}`];
              if (qtyInput) {
                qtyInput.focus();
                qtyInput.select();
              }
            }, 50);
          }
        }
      } 
      
      else if (field === 'cantidad') {
        const currentQty = items[index].cantidad.trim();
        const parsedQty = parseInt(currentQty, 10);
        const finalQty = (!isNaN(parsedQty) && parsedQty > 0) ? parsedQty.toString() : '1';
        
        setItems(prevItems => {
          const updatedItems = [...prevItems];
          updatedItems[index].cantidad = finalQty;

          if (index === updatedItems.length - 1) {
            return [...updatedItems, { id: '', descripcion: '', cantidad: '', precio: '' }];
          }
          return updatedItems;
        });
        
        setTimeout(() => {
          inputRefs.current[`id-${index + 1}`]?.focus();
        }, 50);
      }
    }
  };

  const handleFinalizeOrder = async () => {
    const validItems = items
      .filter(item => item.id.trim() !== '' && item.descripcion !== '')
      .map(item => {
        const parsedQty = parseInt(item.cantidad, 10);
        const finalQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1;
        return {
          ...item,
          cantidad: finalQty.toString()
        };
      });

    if (validItems.length === 0) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_price: totalOrden, // Usamos directamente el total ya calculado
          date: new Date().toISOString(),
          items: validItems.map(item => ({
            menu_id: parseInt(item.id, 10),
            quantity: parseInt(item.cantidad, 10)
          }))
        }),
      });

      if (response.ok) {
        const lastOrderRes = await fetch('http://localhost:8000/api/orders');
        const allOrders = await lastOrderRes.json();

        const lastOrder = allOrders.reduce((prev: any, current: any) => {
          return (prev.id > current.id) ? prev : current;
        });

        setOrderToPrint({
          id: (lastOrder.id).toString().padStart(4, '0'),
          items: validItems,
          total: totalOrden,
          date: new Date().toLocaleString('es-AR')
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...items];
    if (field === 'id' || field === 'cantidad') {
      if (/^\d*$/.test(value)) newItems[index][field] = value;
    }
    setItems(newItems);
  };

  return (
    <div className="h-full bg-[#121212] text-white p-8 flex flex-col items-center overflow-y-auto">
      <style>
        {`
        .ticket-visual-hidden { display: none; }
        @media print {
            @page { size: 80mm auto; margin: 0 !important; }
            body * { visibility: hidden; }
            
            .ticket-print-area {
                visibility: visible !important;
                display: block !important;
                position: absolute;
                left: 0; top: 0;
                width: 72mm;
                padding: 4mm;
                background: white;
                color: black;
                font-family: 'Courier New', Courier, monospace;
                font-size: 12px;
                font-weight: 900 !important;
            }

            .ticket-print-area * { visibility: visible !important; }
            .ticket-header { text-align: center; margin-bottom: 10px; }
            .ticket-logo { width: 140px; display: block; margin: 0 auto; }
            
            .ticket-table { width: 100% !important; display: table !important; border-collapse: collapse; margin-top: 5px; }
            .ticket-table tr { display: table-row !important; }
            
            .ticket-table td { 
                display: table-cell !important; 
                padding: 2px 0; 
                vertical-align: top; 
                font-weight: 900;
                -webkit-text-stroke: 0.3px black;
            }
            .col-qty { width: 20%; text-align: left; }
            .col-desc { width: 80%; text-align: left; }

            .ticket-divider { border-top: 1px dashed black; margin: 8px 0; }
            
            .ticket-footer { 
                text-align: center; 
                font-size: 10px; 
                margin-top: 15px; 
                line-height: 1.4;
                font-weight: 900;
                -webkit-text-stroke: 0.2px black;
            }
        }
        `}
      </style>

      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600">
        Crear Nueva Orden
      </h2>

      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-xl p-6 shadow-2xl border border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[100px_1fr_100px_120px] gap-4 pb-2 border-b border-gray-700 text-xs font-bold uppercase text-gray-500 text-center">
            <span>Codigo</span>
            <span>Descripcion</span>
            <span>Cant.</span>
            <span>Precio</span>
          </div>

          {items.map((item, index) => {
            const parsedQty = parseInt(item.cantidad, 10);
            const currentQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1;
            const rowSubtotal = parseFloat(item.precio || '0') * currentQty;

            return (
              <div key={index} className="grid grid-cols-[100px_1fr_100px_120px] gap-4 items-center">
                <input
                  ref={el => { inputRefs.current[`id-${index}`] = el; }}
                  type="text"
                  value={item.id}
                  placeholder="0"
                  onChange={(e) => handleChange(index, 'id', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'id')}
                  className="bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-orange-500 focus:outline-none transition-colors"
                />
                <input
                  type="text"
                  value={item.descripcion}
                  readOnly
                  className="bg-[#141414] border border-gray-800 text-gray-400 rounded p-3 italic cursor-default"
                />
                <input
                  ref={el => { inputRefs.current[`cantidad-${index}`] = el; }}
                  type="text"
                  value={item.cantidad}
                  placeholder="1"
                  onChange={(e) => handleChange(index, 'cantidad', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'cantidad')}
                  className="bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-orange-500 focus:outline-none transition-colors"
                />
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-600">$</span>
                  <input
                    type="text"
                    value={rowSubtotal > 0 ? rowSubtotal.toString() : item.precio}
                    readOnly
                    className="w-full bg-[#141414] border border-gray-800 text-gray-500 rounded p-3 pl-7 text-right cursor-default"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* FIX 2: Bloque visual para el valor Total de la Orden */}
        <div className="mt-8 pt-4 border-t border-gray-800 flex justify-end items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Total Orden:</span>
          <div className="relative w-44">
            <span className="absolute left-4 top-3 text-orange-500 font-bold">$</span>
            <input
              type="text"
              value={totalOrden.toLocaleString('es-AR')}
              readOnly
              className="w-full bg-[#111] border border-orange-900/40 text-orange-500 text-lg font-black rounded-lg p-3 pl-8 text-right cursor-default shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        <button
          disabled={isSubmitting}
          onClick={handleFinalizeOrder}
          className={`mt-4 w-full font-black py-5 px-6 rounded-lg uppercase tracking-widest transition-all text-lg ${
            isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]'
          }`}
        >
          {isSubmitting ? "Guardando..." : "Finalizar Orden"}
        </button>
      </div>

      {orderToPrint && (
        <div className="ticket-print-area ticket-visual-hidden">
          <div className="ticket-header">
            <img src={logoPrinter} className="ticket-logo" alt="Logo" />
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px', WebkitTextStroke: '0.4px black' }}>ORDEN #{orderToPrint.id}</div>
            <div style={{ fontSize: '10px' }}>{orderToPrint.date}</div>
          </div>

          <div className="ticket-divider"></div>

          <table className="ticket-table">
            <tbody>
              {orderToPrint.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="col-qty">{item.cantidad} x</td>
                  <td className="col-desc">{item.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ticket-divider"></div>

          <div style={{ textAlign: 'right', fontWeight: 'bold', WebkitTextStroke: '0.4px black' }}>
            <span>TOTAL: ${orderToPrint.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="ticket-footer">
            <div>Documento no válido como factura</div>
            <div style={{ marginTop: '5px' }}>EL CLASICO DE SIEMPRE</div>
            <div>Olavarría, Buenos Aires</div>
            <div style={{ marginTop: '5px' }}>*** GRACIAS POR SU COMPRA ***</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderChecker;