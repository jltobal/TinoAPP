const sqlite3 = require('sqlite3').verbose();

// Abrimos la conexión (esto creará el archivo tinoapp.db si no existe)
const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
        process.exit(1);
    }
    console.log("Conectado a tinoapp.db para inicialización de tablas.");
});

db.serialize(() => {
    console.log("--- Iniciando creación de tablas ---");

    // Tabla MENU
    db.run(`CREATE TABLE IF NOT EXISTS menu (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descripcion TEXT NOT NULL,
        price REAL NOT NULL
    )`, (err) => {
        if (err) console.error("Error en tabla 'menu':", err.message);
        else console.log("[OK] Tabla 'menu' creada.");
    });

    // Tabla ORdenes
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_price REAL DEFAULT 0,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error("Error en tabla 'orders':", err.message);
        else console.log("[OK] Tabla 'orders' creada.");
    });

    // Tabla Order items
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        menu_id INTEGER,
        cantidad INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menu(id)
    )`, (err) => {
        if (err) console.error("Error en tabla 'order_items':", err.message);
        else console.log("[OK] Tabla 'order_items' creada.");
    });

    db.close(() => {
        console.log("--- Estructura de base de datos finalizada ---");
    });
});