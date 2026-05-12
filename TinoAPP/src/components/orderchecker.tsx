import React, { useState, useRef, useEffect } from 'react';

interface OrderItem {
  id: string;
}

function OrderChecker() {
  const [items, setItems] = useState<OrderItem[]>([{ id: '' }]);
  
  const lastInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    lastInputRef.current?.focus();
  }, [items.length]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value;

      if (index === items.length - 1 && value.trim() !== '') {
        setItems([...items, { id: '' }]);
      }
    }
  };

  const handleChange = (index: number, value: string) => {
    if (/^\d{0,4}$/.test(value)) {
      const newItems = [...items];
      newItems[index].id = value;
      setItems(newItems);
    }
  };

  return (
    <div className="h-full bg-[#121212] text-white p-8 flex flex-col items-center">
      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600">
        Crear Nueva Orden
      </h2>

      <div className="w-full max-w-md bg-[#1a1a1a] rounded-xl p-6 shadow-2xl border border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-2 pb-2 border-b border-gray-700 text-xs font-bold uppercase text-gray-500">
            <span>Codigo</span>
            <span>Descripcion</span>
            <span>Cantidad</span>
            <span>Precio</span>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 items-center animate-in fade-in duration-300">
              <input
                ref={index === items.length - 1 ? lastInputRef : null}
                type="text"
                value={item.id}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="0000"
                className="bg-gray-800 border border-gray-700 rounded p-2 text-center focus:border-orange-500 focus:outline-none transition-colors"
              />
              <div className="h-10 bg-gray-900/50 rounded border border-gray-800/50"></div>
              <div className="h-10 bg-gray-900/50 rounded border border-gray-800/50"></div>
              <div className="h-10 bg-gray-900/50 rounded border border-gray-800/50"></div>
            </div>
          ))}
        </div>
        
        <p className="mt-6 text-gray-500 text-xs text-center italic">
          Presiona Enter para agregar el siguiente item
        </p>

        {/* --- BOTÓN AGREGADO --- */}
        <div className="mt-6 flex justify-center">
          <button 
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-3 px-6 rounded-lg uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-900/20"
            onClick={() => console.log("Finalizando orden...")}
          >
            Finalizar Orden
          </button>
        </div>
        {/* ---------------------- */}
      </div>
    </div>
  );
}

export default OrderChecker;