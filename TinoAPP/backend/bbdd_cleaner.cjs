const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) {
        console.error("Error al conectar:", err.message);
        process.exit(1);
    }
    console.log("Conectado a tinoapp.db para limpieza de registros (Truncate).");
});

db.serialize(() => {
    console.log("--- Iniciando vaciado de tablas ---");

    db.run("PRAGMA foreign_keys = OFF");

    const tables = ['order_items', 'orders', 'menu'];

    tables.forEach((table) => {
        db.run(`DELETE FROM ${table}`, (err) => {
            if (err) {
                console.error(`Error al vaciar la tabla ${table}:`, err.message);
            } else {
                console.log(`[CLEAN] Datos de la tabla '${table}' eliminados.`);
            }
        });
    });

    db.run("DELETE FROM sqlite_sequence", (err) => {
        if (!err) console.log("[RESET] Contadores de ID reiniciados a cero.");
    });

    db.run("PRAGMA foreign_keys = ON", () => {
        console.log("--- Tablas limpias y listas para nuevos datos ---");
        db.close();
    });
});