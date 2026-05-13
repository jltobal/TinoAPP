import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface OrderItem {
    id: string;
    descripcion: string;
    cantidad: string;
    precio: string;
}

function OrderPage() {
    // Capturamos el ID de la URL (ej: /order?id=1)
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('id') || '0000';

    const [items, setItems] = useState<OrderItem[]>([
        { id: '1', descripcion: 'Papas Fritas Medianas', cantidad: '2', precio: '11000' }
    ]);

    const lastInputRef = useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Enter') {
            const currentItem = items[index];
            if (currentItem.id.trim() !== '') {
                const newItems = [...items];
                if (currentItem.cantidad === '' || parseInt(currentItem.cantidad) === 0) {
                    newItems[index].cantidad = '1';
                }
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
        if (field === 'id' || field === 'cantidad') {
            if (/^\d*$/.test(value) && value !== '0') {
                newItems[index][field] = value;
            }
        } else if (field === 'descripcion') {
            newItems[index].descripcion = value;
        }
        setItems(newItems);
    };

    return (
        <div className="h-full bg-[#121212] text-white p-8 flex flex-col items-center">
            {/* Título en AZUL para diferenciar de CREAR (Naranja) */}
            <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-blue-500">
                Editar Orden #{orderId.toString().padStart(4, '0')}
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
                                className="bg-gray-800 border border-gray-700 rounded p-2 text-center focus:border-blue-500 focus:outline-none transition-colors"
                            />

                            <input
                                type="text"
                                value={item.descripcion}
                                onChange={(e) => handleChange(index, 'descripcion', e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded p-2 focus:border-blue-500 focus:outline-none transition-colors"
                            />

                            <input
                                type="text"
                                inputMode="numeric"
                                value={item.cantidad}
                                placeholder="1"
                                onChange={(e) => handleChange(index, 'cantidad', e.target.value)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="bg-gray-800 border border-gray-700 rounded p-2 text-center focus:border-blue-500 focus:outline-none transition-colors"
                            />

                            <div className="relative">
                                <span className="absolute left-2 top-2 text-gray-600 text-sm">$</span>
                                <input
                                    type="text"
                                    value={item.precio}
                                    readOnly
                                    className="w-full bg-[#141414] border border-gray-800 text-gray-500 rounded p-2 pl-5 text-right cursor-not-allowed focus:outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-6 text-gray-500 text-[10px] text-center uppercase tracking-widest">
                    Modo Edición Activo • Enter para procesar cambios
                </p>

                {/* --- BOTONES DE ACCIÓN INVERTIDOS --- */}
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                    {/* Botón Guardar: Ahora a la izquierda y más discreto */}
                    <button
                        className="flex-1 bg-transparent border-2 border-blue-600/50 hover:border-blue-600 text-blue-400 hover:text-white font-black py-3 px-6 rounded-lg uppercase transition-all active:scale-[0.98]"
                        onClick={() => console.log("Guardando cambios...")}
                    >
                        Guardar e imprimir
                    </button>

                    {/* Botón Guardar e Imprimir: Acción principal a la derecha y muy visible */}
                    <button
                        className="flex-[1.5] bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-6 rounded-lg uppercase transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98] flex items-center justify-center gap-2"
                        onClick={() => console.log("Guardando e imprimiendo...")}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderPage;