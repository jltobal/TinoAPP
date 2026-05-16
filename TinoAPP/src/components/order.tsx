import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const OrderPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('id');
    
    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetch(`http://localhost:8000/api/orders/${orderId}`)
                .then(res => res.json())
                .then(data => {
                    setItems(data.items || []);
                    setTotal(data.total_price || 0);
                    setLoading(false);
                })
                .catch(() => {
                    alert("Error al cargar la orden");
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        const newTotal = items.reduce((acc, item) => acc + (Number(item.precio) * Number(item.cantidad)), 0);
        setTotal(newTotal);
    }, [items]);

    const handleCodeChange = async (index: number, code: string) => {
        if (!/^\d*$/.test(code)) return;

        const newItems = [...items];
        newItems[index].id = code;

        if (code.length > 0) {
            try {
                const res = await fetch(`http://localhost:8000/api/menu/${code}`);
                if (res.ok) {
                    const product = await res.json();
                    newItems[index] = {
                        ...newItems[index],
                        descripcion: product.descripcion,
                        precio: product.price
                    };
                } else {
                    newItems[index].descripcion = "No encontrado";
                    newItems[index].precio = 0;
                }
            } catch (e) {
                console.error(e);
            }
        }
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: string) => {
        if (field === 'cantidad' && !/^\d*$/.test(value)) return;
        
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addNewItem = () => {
        setItems([...items, { id: '', descripcion: '', cantidad: '1', precio: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const saveOrder = async () => {
        const validItems = items.filter(i => i.descripcion !== "No encontrado" && i.id !== '');

        if (validItems.length === 0) {
            alert("No se puede guardar una orden vacía.");
            return;
        }

        const body = {
            items: validItems,
            total_price: total
        };

        const method = orderId ? 'PUT' : 'POST';
        const url = orderId ? `http://localhost:8000/api/orders/${orderId}` : `http://localhost:8000/api/orders`;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                navigate('/list');
            }
        } catch (e) {
            alert("Error al guardar");
        }
    };

    if (loading) return <div className="text-white p-6">Cargando...</div>;

    return (
        <div className="p-8 bg-[#121212] min-h-screen text-white flex flex-col items-center">
            <style>
                {`
                    input::-webkit-outer-spin-button,
                    input::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type=number] {
                        -moz-appearance: textfield;
                    }
                `}
            </style>

            <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-blue-500 text-center">
                {orderId ? `MODO EDICIÓN: ORDEN #${orderId.padStart(4, '0')}` : 'CREAR NUEVA ORDEN'}
            </h2>
            
            <div className="w-full max-w-4xl bg-[#1a1a1a] rounded-xl p-6 shadow-2xl border border-gray-800">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-gray-500 text-xs font-bold uppercase tracking-wider text-center">
                            <th className="pb-2 w-24">Cod</th>
                            <th className="pb-2 text-left px-4">Descripción</th>
                            <th className="pb-2 w-24">Cant.</th>
                            <th className="pb-2 w-32">Precio</th>
                            <th className="pb-2 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-gray-600 uppercase tracking-widest text-sm">
                                    No hay productos en esta orden
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="group">
                                    <td className="text-center">
                                        <input 
                                            className="bg-gray-800 border border-gray-700 p-3 w-20 rounded text-center focus:border-blue-500 outline-none transition-colors"
                                            value={item.id}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4">
                                        <div className="bg-[#141414] border border-gray-800 text-gray-400 rounded p-3 italic">
                                            {item.descripcion || "---"}
                                        </div>
                                    </td>
                                    <td className="text-center">
                                        <input 
                                            type="text"
                                            inputMode="numeric"
                                            className="bg-gray-800 border border-gray-700 p-3 w-20 rounded text-center focus:border-blue-500 outline-none transition-colors"
                                            value={item.cantidad}
                                            onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                                        />
                                    </td>
                                    <td>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-600">$</span>
                                            <div className="w-full bg-[#141414] border border-gray-800 text-gray-500 rounded p-3 pl-7 text-right">
                                                {item.precio || 0}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <button 
                                            onClick={() => removeItem(index)} 
                                            className="text-gray-600 hover:text-red-500 transition-colors p-2 text-xl"
                                        >
                                            ✕
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <button 
                    onClick={addNewItem}
                    className="mt-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest px-2"
                >
                    <span className="text-lg">+</span> Agregar Producto
                </button>

                <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-gray-800 pt-8">
                    <span className="text-3xl font-black text-white uppercase tracking-tighter">
                        Total: <span className="text-blue-500">${total.toLocaleString('es-AR')}</span>
                    </span>
                    <button 
                        onClick={saveOrder}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 active:scale-95 px-12 py-4 rounded-lg font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all text-white"
                    >
                        {orderId ? 'Confirmar Cambios' : 'Finalizar Orden'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;

//Pagina para listar la orden individual, editar e imprimir. 