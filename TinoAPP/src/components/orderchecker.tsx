import React, { useState, useRef, useEffect } from 'react';

interface OrderItem {
  id: string;
  descripcion: string;
  cantidad: string;
  precio: string;
}

function OrderChecker() {
  const [items, setItems] = useState<OrderItem[]>([
    { id: '', descripcion: '', cantidad: '', precio: '' }
  ]);
  
  const lastInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lastInputRef.current?.focus();
  }, [items.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      const currentItem = items[index];
      
      if (currentItem.id.trim() !== '') {
        const newItems = [...items];
        
        // Si la cantidad está vacía al dar Enter, se setea en 1 por defecto
        if (currentItem.cantidad === '' || parseInt(currentItem.cantidad) === 0) {
          newItems[index].cantidad = '1';
        }

        // Agregar nueva fila si es la última
        if (index === items.length - 1) {
          setItems([...newItems, { id: '', descripcion: '', cantidad: '', precio: '' }]);
        } else {
          setItems(newItems);
        }
      }
    }
  };

 const handleChange = (index: number, field: keyof OrderItem, value: string) => {
    const newItems = [...items];
    
    if (field === 'id') {
      if (/^\d*$/.test(value) && value !== '0') {
        newItems[index][field] = value;
      }
    } 
    else if (field === 'cantidad') {
      if (/^\d*$/.test(value)) {
        newItems[index][field] = value;
      }
    } 
    else if (field === 'descripcion') {
      newItems[index].descripcion = value;
    }
    
    setItems(newItems);
  };

  return (
    <div className="h-full bg-[#121212] text-white p-8 flex flex-col items-center">
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
              
              {/* ID / CODIGO - Ahora con placeholder "0" */}
              <input
                ref={index === items.length - 1 ? lastInputRef : null}
                type="text"
                value={item.id}
                placeholder="0"
                onChange={(e) => handleChange(index, 'id', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="bg-gray-800 border border-gray-700 rounded p-2 text-center focus:border-orange-500 focus:outline-none transition-colors"
              />

              {/* DESCRIPCION */}
              <input
                type="text"
                value={item.descripcion}
                onChange={(e) => handleChange(index, 'descripcion', e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded p-2 focus:border-orange-500 focus:outline-none transition-colors"
              />

              {/* CANTIDAD */}
              <input
                type="text"
                inputMode="numeric"
                value={item.cantidad}
                placeholder="1"
                onChange={(e) => handleChange(index, 'cantidad', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="bg-gray-800 border border-gray-700 rounded p-2 text-center focus:border-orange-500 focus:outline-none transition-colors"
              />

              {/* PRECIO - Bloqueado (readOnly) */}
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-600 text-sm">$</span>
                <input
                  type="text"
                  value={item.precio}
                  readOnly
                  className="w-full bg-[#141414] border border-gray-800 text-gray-500 rounded p-2 pl-5 text-right cursor-not-allowed focus:outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
        
        <p className="mt-6 text-gray-500 text-[10px] text-center uppercase tracking-widest">
          Enter para procesar item • Cantidad mínima: 1
        </p>

        <div className="mt-6 flex justify-center">
          <button 
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 px-6 rounded-lg uppercase transition-all shadow-lg active:scale-[0.98]"
            onClick={() => console.log("Finalizando orden...", items)}
          >
            Finalizar Orden
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderChecker;