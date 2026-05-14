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

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const addNewItem = () => {
        setItems([...items, { id: '', descripcion: '', cantidad: 1, precio: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const saveOrder = async () => {
        const validItems = items.filter(i => i.descripcion !== "No encontrado" && i.id !== '');

        if (validItems.length === 0) {
            alert("No se puede guardar una orden vacía. Debe agregar al menos un producto válido.");
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
        <div className="p-6 bg-[#121212] min-h-screen text-white">
            <h2 className="text-2xl font-bold mb-4 text-blue-500 uppercase">
                {orderId ? `MODO EDICIÓN: ORDEN #${orderId}` : 'CREAR NUEVA ORDEN'}
            </h2>
            
            <div className="bg-[#1e1e1e] p-4 rounded-lg shadow-xl border border-gray-800">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase">
                            <th className="p-2">COD</th>
                            <th className="p-2">DESCRIPCIÓN</th>
                            <th className="p-2">CANT.</th>
                            <th className="p-2">PRECIO</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500 uppercase tracking-widest">
                                    No hay productos en esta orden
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                                    <td className="p-2">
                                        <input 
                                            className="bg-gray-900 border border-gray-700 p-1 w-20 rounded text-center focus:border-blue-500 outline-none"
                                            value={item.id}
                                            onChange={(e) => handleCodeChange(index, e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 font-medium">{item.descripcion || "---"}</td>
                                    <td className="p-2">
                                        <input 
                                            type="number"
                                            min="1"
                                            className="bg-gray-900 border border-gray-700 p-1 w-20 rounded text-center focus:border-blue-500 outline-none"
                                            value={item.cantidad}
                                            onChange={(e) => updateItem(index, 'cantidad', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-2 text-gray-400">${item.precio}</td>
                                    <td className="p-2">
                                        <button 
                                            onClick={() => removeItem(index)} 
                                            className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors"
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
                    className="mt-6 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider border border-gray-600 transition-all"
                >
                    + AGREGAR PRODUCTO
                </button>

                <div className="mt-8 flex justify-between items-center border-t border-gray-700 pt-6">
                    <span className="text-2xl font-bold">TOTAL: ${total.toLocaleString()}</span>
                    <button 
                        onClick={saveOrder}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-95 px-10 py-3 rounded font-black uppercase tracking-tighter shadow-lg shadow-blue-900/20 transition-all"
                    >
                        {orderId ? 'Confirmar Cambios' : 'Finalizar Orden'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderPage;