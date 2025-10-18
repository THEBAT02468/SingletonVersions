// === PATRÓN SINGLETON EN JAVASCRIPT - VERSIÓN FINAL CORREGIDA ===
console.log("=== PATRÓN SINGLETON EN JAVASCRIPT - VERSIÓN FINAL CORREGIDA ===\n");

// ==========================================================
// CLASE: DatabaseConnection (Patrón Singleton)
// ==========================================================
class DatabaseConnection {
    static instance = null;

    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    constructor() {
        if (DatabaseConnection.instance) {
            throw new Error("Use DatabaseConnection.getInstance() en lugar de new");
        }

        this.connection = null;
        this.sqlite3 = null;
        this._initialized = false;
        this._instanceId = Math.random().toString(36).substr(2, 9);

        console.log("🔧 Constructor ejecutado - Creando instancia Singleton");
        this._initialize();
    }

    _initialize() {
        try {
            this.sqlite3 = require('sqlite3').verbose();
            console.log('📦 Módulo SQLite3 cargado correctamente');
        } catch (error) {
            console.log('ℹ️ SQLite3 no disponible. Usando modo simulación.');
            this.sqlite3 = null;
        }
        this._initialized = true;
    }

    connect() {
        if (!this._initialized) this._initialize();

        if (this.sqlite3 && !this.connection) {
            this.connection = new this.sqlite3.Database(':memory:', (err) => {
                if (err) console.error('❌ Error conectando a BD:', err.message);
                else console.log('✅ Conectado a base de datos SQLite en memoria');
            });
        } else if (!this.connection) {
            console.log('✅ Simulando conexión a BD (modo demo)');
            this.connection = { simulated: true };
        }
        return this.connection;
    }

    async executeQuery(query, params = []) {
        if (!this.connection) await this.connect();

        if (this.connection.simulated) {
            console.log(`📝 Consulta simulada: ${query}`);
            if (query.trim().toUpperCase().startsWith('SELECT')) {
                return { data: [{ id: 1, name: 'Simulado' }] };
            }
            return { id: Math.floor(Math.random() * 1000), changes: 1 };
        }

        // Determinar si es SELECT o no
        const isSelect = query.trim().toUpperCase().startsWith('SELECT');
        if (isSelect) {
            return new Promise((resolve, reject) => {
                this.connection.all(query, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ data: rows });
                });
            });
        } else {
            return new Promise((resolve, reject) => {
                this.connection.run(query, params, function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, changes: this.changes });
                });
            });
        }
    }

    close() {
        if (this.connection) {
            if (this.connection.simulated) {
                console.log('🔌 Conexión simulada cerrada');
            } else {
                this.connection.close((err) => {
                    if (err) console.error('❌ Error cerrando conexión:', err.message);
                    else console.log('🔌 Conexión SQLite cerrada');
                });
            }
            this.connection = null;
        }
    }

    getConnectionInfo() {
        return {
            isSingleton: true,
            connected: !!this.connection,
            instanceId: this._instanceId,
        };
    }
}

// ==========================================================
// FUNCIÓN DE DEMOSTRACIÓN DEL SINGLETON
// ==========================================================
async function demonstrateSingleton() {
    console.log("🚀 INICIANDO DEMOSTRACIÓN DEL SINGLETON\n");

    const db1 = DatabaseConnection.getInstance();
    const db2 = DatabaseConnection.getInstance();

    console.log("1️⃣ ¿db1 === db2?", db1 === db2);

    console.log("\n2️⃣ Conectando...");
    await db1.connect();

    console.log("\n3️⃣ Ejecutando consultas...");
    await db1.executeQuery(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    `);

    const insert1 = await db1.executeQuery(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Ana López', 'ana@example.com']
    );
    console.log("🆕 Insert:", insert1);

    const data = await db2.executeQuery('SELECT * FROM users');
    console.log("📄 Datos:", data.data);

    console.log("\n5️⃣ Intentando crear con new...");
    try {
        new DatabaseConnection();
    } catch (error) {
        console.log("✅ Bloqueado correctamente:", error.message);
    }

    console.log("\n6️⃣ Inserciones concurrentes...");
    const promises = [];
    for (let i = 1; i <= 3; i++) {
        promises.push(
            db1.executeQuery('INSERT INTO users (name, email) VALUES (?, ?)', [
                `Usuario ${i}`,
                `user${i}@test.com`,
            ])
        );
    }

    const results = await Promise.all(promises);
    results.forEach((r, i) =>
        console.log(`   Hilo ${i + 1}: ID ${r.id}, Instancia ${db1.getConnectionInfo().instanceId}`)
    );

    console.log("\n🎉 Demostración completada correctamente.\n");
}

// ==========================================================
// CLASE: UserService (usa el Singleton)
// ==========================================================
class UserService {
    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    async createUser(name, email) {
        const result = await this.db.executeQuery(
            'INSERT INTO users (name, email) VALUES (?, ?)',
            [name, email]
        );
        return { success: true, id: result.id };
    }

    async getAllUsers() {
        const result = await this.db.executeQuery('SELECT * FROM users');
        return result.data || [];
    }
}

// ==========================================================
// FUNCIÓN DE PRUEBA DEL SERVICIO
// ==========================================================
async function testUserService() {
    console.log("\n=== 🧩 PRUEBA DEL UserService ===");
    const service1 = new UserService();
    const service2 = new UserService();

    console.log("¿Misma instancia de BD?", service1.db === service2.db);

    await service1.createUser("Servicio 1", "serv1@test.com");
    await service2.createUser("Servicio 2", "serv2@test.com");

    const users = await service1.getAllUsers();
    console.log("Usuarios en BD:", users);

    // ✅ Cerrar conexión aquí al final
    service1.db.close();
    console.log("🔚 Conexión cerrada correctamente después del UserService\n");
}

// ==========================================================
// EJECUCIÓN PRINCIPAL
// ==========================================================
(async () => {
    await demonstrateSingleton();
    await testUserService();
})();
