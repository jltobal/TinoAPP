import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoPrinter from '../assets/JPG/Logo_ByN_350px_jpg.jpg';

interface OrderItem {
  id: string;
  descripcion: string;
  cantidad: string;
  precio: string;
}

function OrderChecker() {
  const navigate = useNavigate();
  const [items, setItems] = useState<OrderItem[]>([
    { id: '', descripcion: '', cantidad: '', precio: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<any>(null);

  const lastInputRef = useRef<HTMLInputElement>(null);

  // Foco automático en el nuevo campo de código al añadir fila
  useEffect(() => {
    lastInputRef.current?.focus();
  }, [items.length]);

  // Manejo de impresión y reset
  useEffect(() => {
    if (orderToPrint) {
      const timer = setTimeout(() => {
        window.print();
        setOrderToPrint(null);
        setItems([{ id: '', descripcion: '', cantidad: '', precio: '' }]);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint]);

  const validateProduct = async (index: number, code: string) => {
    if (!code) return false;
    try {
      const response = await fetch(`http://localhost:8000/api/menu/${code}`);
      if (response.ok) {
        const product = await response.json();
        const newItems = [...items];
        newItems[index].descripcion = product.Name || product.name || product.descripcion || "Sin nombre";
        newItems[index].precio = (product.Price || product.price || 0).toString();
        // Si la cantidad está vacía al validar, ponemos 1 por defecto
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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      const code = items[index].id;
      if (code.trim() !== '') {
        const isValid = await validateProduct(index, code);
        // Si el producto es válido y estamos en la última fila, creamos una nueva
        if (isValid && index === items.length - 1) {
          setItems(prev => [...prev, { id: '', descripcion: '', cantidad: '', precio: '' }]);
        }
      }
    }
  };

  const handleFinalizeOrder = async () => {
    const validItems = items.filter(item => item.id.trim() !== '' && item.descripcion !== '');
    if (validItems.length === 0) return;

    setIsSubmitting(true);
    const total = validItems.reduce((acc, item) => acc + (parseFloat(item.precio) * parseInt(item.cantidad)), 0);

    const orderData = {
      total_price: total,
      date: new Date().toISOString(),
      items: validItems.map(item => ({
        menu_id: parseInt(item.id),
        quantity: parseInt(item.cantidad)
      }))
    };

    try {
      // 1. Guardar
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        // 2. Obtener todas las órdenes para asegurar el ID real
        const lastOrderRes = await fetch('http://localhost:8000/api/orders');
        const allOrders = await lastOrderRes.json();

        // CORRECCIÓN CRÍTICA: Buscar el ID máximo numéricamente
        // No importa si el JSON viene ordenado de arriba a abajo o viceversa
        const lastOrder = allOrders.reduce((prev: any, current: any) => {
          return (prev.id > current.id) ? prev : current;
        });

        // 3. Preparar impresión con el ID verificado
        setOrderToPrint({
          id: (lastOrder.id).toString().padStart(4, '0'),
          items: validItems,
          total: total,
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
                left: 0; right: 0;
                margin: 0 auto;
                width: 72mm;
                padding: 4mm;
                background: white;
                color: black;
                font-family: 'Courier New', Courier, monospace;
                font-size: 14px;
            }

            .ticket-print-area * { visibility: visible !important; }
            .ticket-header { text-align: center; margin-bottom: 10px; }
            .ticket-logo { width: 160px; margin: 0 auto; display: block; }
            
            .ticket-id { font-weight: bold; font-size: 16px; margin: 15px 0; text-align: left; }
            
            .ticket-table { width: 100%; border-collapse: collapse; }
            .ticket-table td { padding: 4px 0; vertical-align: top; text-align: left; }
            .col-desc { width: 70%; }
            .col-val { width: 30%; text-align: right; }

            .ticket-divider { border-top: 1px dashed black; margin: 10px 0; }
            
            .ticket-total-row {
                display: flex !important;
                justify-content: space-between;
                align-items: center;
                font-weight: bold;
                margin-top: 5px;
            }
            .total-dots { flex-grow: 1; border-bottom: 1px solid black; margin: 0 8px; position: relative; top: -4px; }
            .total-amount { font-size: 20px; }

            .ticket-footer { text-align: left; font-size: 11px; margin-top: 20px; }
        }
        `}
      </style>

      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600">
        Crear Nueva Orden
      </h2>

      <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-xl p-6 shadow-2xl border border-gray-800">
        <div className="flex flex-col gap-4">
          {/* Header de la tabla según image_bf27fb.png */}
          <div className="grid grid-cols-[100px_1fr_100px_120px] gap-4 pb-2 border-b border-gray-700 text-xs font-bold uppercase text-gray-500 text-center">
            <span>Codigo</span>
            <span>Descripcion</span>
            <span>Cant.</span>
            <span>Precio</span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[100px_1fr_100px_120px] gap-4 items-center">
              <input
                ref={index === items.length - 1 ? lastInputRef : null}
                type="text"
                value={item.id}
                placeholder="0"
                onChange={(e) => handleChange(index, 'id', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-orange-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={item.descripcion}
                readOnly
                className="bg-[#141414] border border-gray-800 text-gray-400 rounded p-3 italic cursor-default"
              />
              <input
                type="text"
                value={item.cantidad}
                placeholder="1"
                onChange={(e) => handleChange(index, 'cantidad', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)} // AHORA FUNCIONA EL ENTER AQUÍ TAMBIÉN
                className="bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-orange-500 focus:outline-none transition-colors"
              />
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-600">$</span>
                <input
                  type="text"
                  value={item.precio}
                  readOnly
                  className="w-full bg-[#141414] border border-gray-800 text-gray-500 rounded p-3 pl-7 text-right cursor-default"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={isSubmitting}
          onClick={handleFinalizeOrder}
          className={`mt-10 w-full font-black py-5 px-6 rounded-lg uppercase tracking-widest transition-all text-lg ${isSubmitting ? 'bg-gray-700 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)]'
            }`}
        >
          {isSubmitting ? "Guardando..." : "Finalizar Orden"}
        </button>
      </div>

      {/* TICKET DE IMPRESIÓN (Basado en mockup image_bf3438.png) */}
      {orderToPrint && (
        <div className="ticket-print-area ticket-visual-hidden">
          <div className="ticket-header">
            <img src={logoPrinter} className="ticket-logo" alt="Tomi's Food Truck" />
          </div>

          <div className="ticket-id">ORDEN#{orderToPrint.id}</div>

          <table className="ticket-table">
            <tbody>
              {orderToPrint.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="col-desc">{item.cantidad} x {item.descripcion}</td>
                  <td className="col-val">${(parseFloat(item.precio) * parseInt(item.cantidad)).toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ticket-divider"></div>

          <div className="ticket-total-row">
            <span>TOTAL</span>
            <div className="total-dots"></div>
            <span className="total-amount">${orderToPrint.total.toLocaleString('es-AR')}</span>
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
}

export default OrderChecker;