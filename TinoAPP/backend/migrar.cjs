const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tinoapp.db', (err) => {
    if (err) {
        console.error("Error al abrir la base de datos:", err.message);
        process.exit(1);
    }
    console.log("Conectado a tinoapp.db para migración.");
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = OFF");

    db.run("BEGIN TRANSACTION");

    db.run(`CREATE TABLE IF NOT EXISTS order_items_backup (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        order_id INTEGER, 
        menu_id INTEGER, 
        cantidad INTEGER NOT NULL DEFAULT 1, 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, 
        FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE
    )`);

    db.run(`INSERT INTO order_items_backup (id, order_id, menu_id, cantidad) 
            SELECT id, order_id, menu_id, cantidad FROM order_items`, (err) => {
        if (err) {
            console.error("Error al copiar los datos. Operación abortada:", err.message);
            db.run("ROLLBACK");
            return;
        }
        
        db.run(`DROP TABLE order_items`, () => {
            db.run(`ALTER TABLE order_items_backup RENAME TO order_items`, () => {
                db.run("COMMIT", (err) => {
                    if (err) {
                        console.error("Error al confirmar la transacción:", err.message);
                    } else {
                        console.log("¡Estructura actualizada con éxito sin pérdida de datos!");
                    }
                    db.run("PRAGMA foreign_keys = ON");
                    db.close();
                });
            });
        });
    });
});