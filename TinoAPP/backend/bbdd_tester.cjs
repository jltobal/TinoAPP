const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) {
        console.error("Error al conectar:", err.message);
        process.exit(1);
    }
    console.log("Conectado para testeo relacional masivo.");
});

// Creador de menu para testeo 
const menuItems = [
    { desc: 'Hamburguesa Simple', price: 8500 },
    { desc: 'Hamburguesa Completa', price: 12500 },
    { desc: 'Super Pancho', price: 4500 },
    { desc: 'Papas Fritas Medianas', price: 5500 },
    { desc: 'Papas con Cheddar', price: 7500 },
    { desc: 'Gaseosa 500ml', price: 2500 },
    { desc: 'Cerveza Lata', price: 3500 },
    { desc: 'Empanada Carne', price: 1200 },
    { desc: 'Combo Tino Max', price: 18000 },
    { desc: 'Postre Helado', price: 3000 }
];

db.serialize(() => {
    console.log("--- Cargando Menú de Prueba ---");
    const menuStmt = db.prepare("INSERT INTO menu (descripcion, price) VALUES (?, ?)");
    menuItems.forEach(item => {
        menuStmt.run(item.desc, item.price);
    });
    menuStmt.finalize();

    console.log("--- Generando 20 Órdenes Aleatorias ---");
    
    // GENERADOR DE ORDENES - Testeo de bbdd
    for (let i = 0; i < 20; i++) {
  
        db.run("INSERT INTO orders (total_price) VALUES (0)", function(err) {
            if (err) return;
            const orderId = this.lastID;
            let orderTotal = 0;

            const itemsCount = Math.floor(Math.random() * 4) + 1;
            
            for (let j = 0; j < itemsCount; j++) {
                const randomProductIdx = Math.floor(Math.random() * menuItems.length);
                const quantity = Math.floor(Math.random() * 3) + 1;
                const menuId = randomProductIdx + 1; // IDs en SQLite empiezan en 1
                const price = menuItems[randomProductIdx].price;

                orderTotal += (price * quantity);

                db.run("INSERT INTO order_items (order_id, menu_id, cantidad) VALUES (?, ?, ?)", 
                    [orderId, menuId, quantity]);
            }

            db.run("UPDATE orders SET total_price = ? WHERE id = ?", [orderTotal, orderId]);
            console.log(`[TEST] Orden #${orderId} creada. Total: $${orderTotal}`);
        });
    }
});