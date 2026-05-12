const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const PORT = 5700;
const app = express();
app.use(cors());
app.use(express.json());

// La base de datos se crea en la misma carpeta del backend
const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) console.error("Error al abrir DB:", err.message);
    else console.log("Conectado a SQLite: tinoapp.db");
});

db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/api/orders', (req, res) => {
    const { item_id } = req.body;
    db.run(`INSERT INTO orders (item_id) VALUES (?)`, [item_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, item_id });
    });
});

app.listen(PORT, () => console.log(`Backend escuchando en http://localhost:${PORT}`));