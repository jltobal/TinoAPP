import React, { useEffect, useState } from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

// PAGINA PARA LISTAR Y EDITAR EL MENU - AUTOGESTION DEL USUARIO -

//PAGINA INCOMPLETA - EN DESAROLLO

const Menu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const [newItem, setNewItem] = useState({ name: '', price: 0 });

  // Obtener todos los items del menú
  const fetchMenu = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/menu');
      if (!res.ok) throw new Error('Error al obtener el menú');
      const data = await res.json();
      
      // Orden creciente: de menor ID arriba a mayor ID abajo
      const sortedData = [...data].sort((a, b) => a.id - b.id);
      setItems(sortedData);
      setLoading(false);
    } catch (err) {
      console.error("Error en el GET del menú:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        setNewItem({ name: '', price: 0 });
        fetchMenu();
      }
    } catch (err) {
      console.error("Error al agregar item:", err);
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const handleUpdate = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8000/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingId(null);
        fetchMenu();
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Confirmas la eliminación de este producto?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/menu/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchMenu();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  return (
    <div className="h-full bg-[#121212] text-white p-6 overflow-y-auto">
      <h2 className="text-2xl font-black mb-8 uppercase tracking-widest text-orange-600 text-center">
        Gestión de Menú
      </h2>

      <div className="max-w-3xl mx-auto mb-10 bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-4 tracking-[0.2em]">Nuevo Producto</h3>
        <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] text-orange-500 font-bold uppercase ml-1">Nombre / Descripción</label>
            <input 
              type="text" 
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none"
              placeholder="Ej: Hamburguesa Simple"
              required
            />
          </div>
          <div className="w-full md:w-32">
            <label className="text-[10px] text-orange-500 font-bold uppercase ml-1">Precio</label>
            <input 
              type="number" 
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
              className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg p-2.5 text-sm focus:border-orange-500 outline-none"
              required
            />
          </div>
          <button type="submit" className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-8 rounded-lg text-sm transition-all active:scale-95">
            AGREGAR
          </button>
        </form>
      </div>

      <div className="max-w-4xl mx-auto bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1e1e1e] text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-800">
              <th className="p-4 w-20">ID</th>
              <th className="p-4">Descripción</th>
              <th className="p-4 text-right w-40">Precio</th>
              <th className="p-4 text-center w-32">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-gray-600">Sincronizando con base de datos...</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  {/* ID NO EDITABLE */}
                  <td className="p-4 font-mono text-xs text-orange-500/70 font-bold">
                    #{item.id.toString().padStart(3, '0')}
                  </td>
                  
                  <td className="p-4">
                    {editingId === item.id ? (
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="bg-black border border-orange-500/50 rounded px-3 py-1.5 w-full outline-none text-white"
                      />
                    ) : (
                      <span className="font-semibold text-gray-300">{item.name}</span>
                    )}
                  </td>

                  <td className="p-4 text-right font-mono font-bold">
                    {editingId === item.id ? (
                      <input 
                        type="number" 
                        value={editForm.price} 
                        onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
                        className="bg-black border border-orange-500/50 rounded px-3 py-1.5 w-28 text-right outline-none text-white"
                      />
                    ) : (
                      <span className="text-white">${item.price.toLocaleString('es-AR')}</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-3">
                      {editingId === item.id ? (
                        <>
                          <button onClick={() => handleUpdate(item.id)} className="text-green-500 hover:scale-125 transition-transform" title="Guardar">✔️</button>
                          <button onClick={() => setEditingId(null)} className="text-red-500 hover:scale-125 transition-transform" title="Cancelar">❌</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="opacity-60 hover:opacity-100 hover:text-blue-400 transition-all" title="Editar">✏️</button>
                          <button onClick={() => handleDelete(item.id)} className="opacity-60 hover:opacity-100 hover:text-red-500 transition-all" title="Eliminar">🗑️</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Menu;