// === SINGLETON EN JAVASCRIPT (versión equivalente al código Python) ===

// Clase base Singleton
class Singleton {
    static _instances = new Map();

    constructor() {
        const cls = this.constructor;

        // Si ya existe una instancia de esta clase, se devuelve la misma
        if (Singleton._instances.has(cls)) {
            return Singleton._instances.get(cls);
        }

        // Si no existe, se guarda esta nueva instancia
        Singleton._instances.set(cls, this);
    }
}

// Importar sqlite3 (debes tenerlo instalado con `npm install sqlite3`)
const sqlite3 = require('sqlite3').verbose();

// Clase DatabaseConnection que hereda de Singleton
class DatabaseConnection extends Singleton {
    constructor() {
        super(); // 🔹 llama al constructor de Singleton

        // Solo se inicializa la conexión si no existe aún
        if (!this.connection) {
            this.connection = null;
        }
    }

    connect() {
        if (!this.connection) {
            this.connection = new sqlite3.Database('demo_db.db', (err) => {
                if (err) {
                    console.error('❌ Error al conectar con la base de datos:', err.message);
                } else {
                    console.log('✅ Conectado a demo_db.db');
                }
            });
        } else {
            console.log('⚙️ Conexión ya existente, reutilizando instancia.');
        }
    }

    executeQuery(query) {
        if (!this.connection) {
            console.log('⚠️ No hay conexión a la base de datos.');
            return;
        }

        this.connection.run(query, function (err) {
            if (err) {
                console.error('❌ Error al ejecutar consulta:', err.message);
            } else {
                console.log(`✅ Consulta ejecutada correctamente. Último ID: ${this.lastID}`);
            }
        });
    }

    close() {
        if (this.connection) {
            this.connection.close((err) => {
                if (err) {
                    console.error('❌ Error al cerrar conexión:', err.message);
                } else {
                    console.log('🔌 Conexión cerrada.');
                }
            });
            this.connection = null;
        }
    }
}

// === DEMOSTRACIÓN DEL SINGLETON ===

const db1 = new DatabaseConnection();
db1.connect();
db1.executeQuery('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');

// Segunda instancia (usará la misma conexión)
const db2 = new DatabaseConnection();
db2.executeQuery('INSERT INTO users (name) VALUES ("John")');

// Comprobación de que ambas instancias son la misma
console.log(`Se compara las conexiones y el resultado es: ${db1.connection === db2.connection}`);

db1.close();
