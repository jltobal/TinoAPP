const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) {
        console.error("Error crítico al abrir la DB:", err.message);
        process.exit(1);
    }
    console.log("--- TinoAPP Backend: Base de datos conectada ---");
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
    db.run(`CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL,
        precio REAL NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_price REAL DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        menu_id INTEGER,
        cantidad INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menu(id)
    )`);
});

app.get('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM menu WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: "Producto no encontrado" });
        }
    });
});

app.get('/api/orders', (req, res) => {
    const sql = `
        SELECT o.id, o.total_price, o.date, 
               group_concat(oi.cantidad || 'x ' || m.descripcion, ', ') as items_summary
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu m ON oi.menu_id = m.id
        GROUP BY o.id
        ORDER BY o.date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/orders', (req, res) => {
    const { items, total_price } = req.body; 
    
    if (!items || items.length === 0) {
        return res.status(400).json({ error: "No se enviaron items" });
    }

    db.run(`INSERT INTO orders (total_price) VALUES (?)`, [total_price], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        const orderId = this.lastID;
        const stmt = db.prepare(`INSERT INTO order_items (order_id, menu_id, cantidad) VALUES (?, ?, ?)`);
        
        try {
            items.forEach(item => {
                stmt.run(orderId, item.menu_id, item.quantity || item.cantidad);
            });
            stmt.finalize();
            res.json({ success: true, orderId });
        } catch (insertError) {
            res.status(500).json({ error: insertError.message });
        }
    });
});

app.listen(PORT, () => {
    console.log(`--- Servidor TinoAPP activo en http://localhost:${PORT} ---`);
});