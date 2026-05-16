const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) {
        console.error("Error crítico:", err.message);
        process.exit(1);
    }
    console.log("DB Conectada");
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");
    db.run(`CREATE TABLE IF NOT EXISTS menu (id INTEGER PRIMARY KEY AUTOINCREMENT, descripcion TEXT NOT NULL, price REAL NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, total_price REAL DEFAULT 0, date DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, menu_id INTEGER, cantidad INTEGER NOT NULL DEFAULT 1, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, FOREIGN KEY (menu_id) REFERENCES menu(id))`);
});

app.get('/api/menu/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM menu WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        row ? res.json(row) : res.status(404).json({ message: "No encontrado" });
    });
});

app.get('/api/orders', (req, res) => {
    const sql = `SELECT o.id, o.total_price, o.date, group_concat(oi.cantidad || 'x ' || m.descripcion, ', ') as items_summary FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN menu m ON oi.menu_id = m.id GROUP BY o.id ORDER BY o.date DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

app.get('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT o.id as order_id, o.total_price, o.date, oi.menu_id, oi.cantidad, m.descripcion, m.price FROM orders o LEFT JOIN order_items oi ON o.id = oi.order_id LEFT JOIN menu m ON oi.menu_id = m.id WHERE o.id = ?`;
    db.all(sql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!rows || rows.length === 0 || rows[0].order_id === null) return res.status(404).json({ items: [] });
        const orderData = {
            id: rows[0].order_id,
            total_price: rows[0].total_price,
            items: rows[0].menu_id ? rows.map(r => ({
                id: String(r.menu_id),
                descripcion: r.descripcion || '',
                cantidad: String(r.cantidad || '1'),
                precio: String(r.price || '0')
            })) : []
        };
        res.json(orderData);
    });
});

app.post('/api/orders', (req, res) => {
    const { items, total_price } = req.body;
    db.run(`INSERT INTO orders (total_price) VALUES (?)`, [total_price], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const orderId = this.lastID;
        const stmt = db.prepare(`INSERT INTO order_items (order_id, menu_id, cantidad) VALUES (?, ?, ?)`);
        items.forEach(item => stmt.run(orderId, item.id || item.menu_id, item.cantidad || 1));
        stmt.finalize(() => res.json({ success: true, orderId }));
    });
});

app.put('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const { items, total_price } = req.body;
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        db.run(`DELETE FROM order_items WHERE order_id = ?`, [id]);
        db.run(`UPDATE orders SET total_price = ? WHERE id = ?`, [total_price, id]);
        const stmt = db.prepare(`INSERT INTO order_items (order_id, menu_id, cantidad) VALUES (?, ?, ?)`);
        items.forEach(item => stmt.run(id, item.id, item.cantidad));
        stmt.finalize(() => {
            db.run("COMMIT");
            res.json({ success: true });
        });
    });
});

app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));

//Inicia la base de datos y establece los endpoints.