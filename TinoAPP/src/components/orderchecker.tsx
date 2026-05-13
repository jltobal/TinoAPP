import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  
  const lastInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lastInputRef.current?.focus();
  }, [items.length]);

  const validateProduct = async (index: number, code: string) => {
    if (!code) return false;

    try {
      const response = await fetch(`http://localhost:8000/api/menu/${code}`);
      
      if (response.ok) {
        const product = await response.json();
        const newItems = [...items];
        
        newItems[index].descripcion = product.Name || product.name || product.descripcion || "Sin nombre";
        newItems[index].precio = (product.Price || product.price || 0).toString();
        
        if (!newItems[index].cantidad || newItems[index].cantidad === '0') {
          newItems[index].cantidad = '1';
        }

        setItems(newItems);
        return true;
      } else {
        alert(`El código ${code} no existe en el menú de la base de datos.`);
        const newItems = [...items];
        newItems[index].id = ''; 
        setItems(newItems);
        return false;
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error al conectar con el servidor. Revisa si el backend está corriendo.");
      return false;
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      const code = items[index].id;
      
      if (code.trim() !== '') {
        // Esperamos a que la validación termine
        const isValid = await validateProduct(index, code);

        // Solo agregamos fila si el producto fue válido
        if (isValid && index === items.length - 1) {
          setItems(prev => [...prev, { id: '', descripcion: '', cantidad: '', precio: '' }]);
        }
      }
    }
  };

  const handleFinalizeOrder = async () => {
    const validItems = items.filter(item => item.id.trim() !== '' && item.descripcion !== '');
    
    if (validItems.length === 0) {
      alert("No hay items válidos.");
      return;
    }

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
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        navigate(0); 
      } else {
        const err = await response.json();
        alert("Error al guardar: " + (err.message || "Error de servidor"));
      }
    } catch (error) {
      alert("Error de red al intentar guardar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...items];
    if (field === 'id' || field === 'cantidad') {
      if (/^\d*$/.test(value) && value !== '0') newItems[index][field] = value;
    }
    setItems(newItems);
  };

  return (
    <div className="h-full bg-[#121212] text-white p-8 flex flex-col items-center overflow-y-auto">
      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600">
        Crear Nueva Orden
      </h2>

      <div className="w-full max-w-3xl bg-[#1a1a1a] rounded-xl p-6 shadow-2xl border border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[80px_1fr_80px_100px] gap-3 pb-2 border-b border-gray-700 text-xs font-bold uppercase text-gray-500 text-center">
            <span>Codigo</span>
            <span>Descripcion</span>
            <span>Cant.</span>
            <span>Precio</span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-[80px_1fr_80px_100px] gap-3 items-center">
              <input
                ref={index === items.length - 1 ? lastInputRef : null}
                type="text"
                value={item.id}
                placeholder="0"
                onChange={(e) => handleChange(index, 'id', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="bg-gray-800 border border-gray-700 rounded p-2 text-center focus:border-orange-500 focus:outline-none"
              />
              <input
                type="text"
                value={item.descripcion}
                readOnly
                className="bg-[#141414] border border-gray-800 text-gray-400 rounded p-2 cursor-not-allowed italic"
              />
              <input
                type="text"
                inputMode="numeric"
                value={item.cantidad}
                placeholder="1"
                onChange={(e) => handleChange(index, 'cantidad', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="bg-gray-800 border border-gray-700 rounded p-2 text-center focus:border-orange-500 focus:outline-none"
              />
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-600 text-sm">$</span>
                <input
                  type="text"
                  value={item.precio}
                  readOnly
                  className="w-full bg-[#141414] border border-gray-800 text-gray-500 rounded p-2 pl-5 text-right cursor-not-allowed"
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-center">
          <button 
            disabled={isSubmitting}
            className={`w-full font-black py-4 px-6 rounded-lg uppercase tracking-widest transition-all ${
              isSubmitting ? 'bg-gray-700' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg'
            }`}
            onClick={handleFinalizeOrder}
          >
            {isSubmitting ? "Procesando..." : "Finalizar Orden"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderChecker;