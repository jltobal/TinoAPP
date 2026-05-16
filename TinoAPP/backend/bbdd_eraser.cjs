const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) {
        console.error("Error al abrir la base de datos:", err.message);
        process.exit(1);
    }
    console.log("Conectado a tinoapp.db para limpieza profunda.");
});

db.serialize(() => {
    console.log("--- Iniciando purga de datos ---");

    db.run("PRAGMA foreign_keys = OFF");

    const tables = ['order_items', 'orders', 'menu'];

    tables.forEach((table) => {
        db.run(`DELETE FROM ${table}`, (err) => {
            if (err) {
                if (!err.message.includes("no such table")) {
                    console.error(`Error al limpiar tabla ${table}:`, err.message);
                }
            } else {
                console.log(`[OK] Tabla '${table}' vaciada.`);
            }
        });
    });

    db.run("DELETE FROM sqlite_sequence", (err) => {
        if (!err) console.log("[OK] Contadores de ID reseteados.");
    });

    db.run("PRAGMA foreign_keys = ON", () => {
        console.log("--- Limpieza finalizada con éxito ---");
        db.close();
    });
});

//Elimina las tablas, no el contenido. Codigo para debug y control de errores. 