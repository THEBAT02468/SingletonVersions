// Singleton2.js - VERSIÓN FINAL Y 100% FUNCIONAL
console.log("=== PATRÓN SINGLETON EN JAVASCRIPT - VERSIÓN FINAL ===\n");

// SOLUCIÓN RECOMENDADA: Singleton con método estático getInstance()
class DatabaseConnection {
    static instance = null;

    // Método estático para obtener la instancia singleton
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    constructor() {
        // Prevenir creación directa con new
        if (DatabaseConnection.instance) {
            throw new Error("Use DatabaseConnection.getInstance() en lugar de new");
        }

        this.connection = null;
        this._initialized = false;
        this.sqlite3 = null;
        
        console.log("🔧 Constructor de DatabaseConnection ejecutado");
        this._initialize();
    }

    _initialize() {
        try {
            this.sqlite3 = require('sqlite3').verbose();
            console.log('📦 Módulo SQLite3 cargado');
        } catch (error) {
            console.log('ℹ️ SQLite3 no disponible. Usando modo simulación.');
            this.sqlite3 = null;
        }
        this._initialized = true;
    }

    connect() {
        if (!this._initialized) {
            this._initialize();
        }

        if (this.sqlite3 && !this.connection) {
            this.connection = new this.sqlite3.Database(':memory:', (err) => {
                if (err) {
                    console.error('❌ Error conectando a BD:', err.message);
                } else {
                    console.log('✅ Conectado a base de datos SQLite en memoria');
                }
            });
        } else if (!this.connection) {
            console.log('✅ Simulando conexión a BD (Singleton funcionando)');
            this.connection = { simulated: true };
        }
        return this.connection;
    }

    async executeQuery(query, params = []) {
        if (!this.connection) {
            await this.connect();
        }

        if (this.connection.simulated) {
            console.log(`📝 Ejecutando consulta simulada: ${query}`);
            console.log(`📝 Parámetros:`, params);
            
            // Simular diferentes respuestas según la consulta
            if (query.trim().toUpperCase().startsWith('INSERT')) {
                return { id: Math.floor(Math.random() * 1000) + 1, changes: 1 };
            } else if (query.trim().toUpperCase().startsWith('CREATE')) {
                return { id: null, changes: 0 };
            } else if (query.trim().toUpperCase().startsWith('SELECT')) {
                return { 
                    data: [
                        { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
                        { id: 2, name: 'María García', email: 'maria@example.com' }
                    ] 
                };
            } else {
                return { id: null, changes: 1 };
            }
        }

        return new Promise((resolve, reject) => {
            this.connection.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        id: this.lastID, 
                        changes: this.changes 
                    });
                }
            });
        });
    }

    close() {
        if (this.connection) {
            if (this.connection.simulated) {
                console.log('🔌 Conexión simulada cerrada');
            } else {
                this.connection.close((err) => {
                    if (err) {
                        console.error('❌ Error cerrando conexión:', err.message);
                    } else {
                        console.log('🔌 Conexión a BD cerrada');
                    }
                });
            }
            this.connection = null;
        }
    }

    getConnectionInfo() {
        return {
            isSingleton: true,
            hasConnection: !!this.connection,
            isSimulated: this.connection ? this.connection.simulated : false,
            instanceId: this._getInstanceId()
        };
    }

    _getInstanceId() {
        if (!this._instanceId) {
            this._instanceId = Math.random().toString(36).substr(2, 9);
        }
        return this._instanceId;
    }
}

// DEMOSTRACIÓN COMPLETA DEL SINGLETON
async function demonstrateSingleton() {
    console.log("🚀 INICIANDO DEMOSTRACIÓN DEL SINGLETON\n");

    // ========== PRUEBA 1: Verificar que es un Singleton ==========
    console.log("1. ✅ VERIFICANDO PATRÓN SINGLETON");
    
    const db1 = DatabaseConnection.getInstance();
    const db2 = DatabaseConnection.getInstance();
    const db3 = DatabaseConnection.getInstance();

    console.log("   ¿db1 === db2?", db1 === db2);
    console.log("   ¿db2 === db3?", db2 === db3);
    console.log("   ¿Todas las instancias son iguales?", db1 === db2 && db2 === db3);
    console.log("   ID de instancia db1:", db1.getConnectionInfo().instanceId);
    console.log("   ID de instancia db2:", db2.getConnectionInfo().instanceId);
    console.log("   ID de instancia db3:", db3.getConnectionInfo().instanceId);

    // ========== PRUEBA 2: Verificar que los métodos existen ==========
    console.log("\n2. ✅ VERIFICANDO MÉTODOS");
    
    console.log("   ¿connect existe?", typeof db1.connect === 'function');
    console.log("   ¿executeQuery existe?", typeof db1.executeQuery === 'function');
    console.log("   ¿close existe?", typeof db1.close === 'function');
    console.log("   ¿getConnectionInfo existe?", typeof db1.getConnectionInfo === 'function');

    // ========== PRUEBA 3: Probar conexión y consultas ==========
    console.log("\n3. ✅ PROBANDO CONEXIÓN Y CONSULTAS");
    
    await db1.connect();
    
    // Crear tabla
    console.log("\n   📊 CREANDO TABLA...");
    const createResult = await db1.executeQuery(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log("   Resultado:", createResult);

    // Insertar datos
    console.log("\n   📝 INSERTANDO DATOS...");
    const insertResult1 = await db1.executeQuery(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Ana López', 'ana@example.com']
    );
    console.log("   Usuario insertado con ID:", insertResult1.id);

    const insertResult2 = await db2.executeQuery( // ¡Usando db2!
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['Carlos Ruiz', 'carlos@example.com']
    );
    console.log("   Usuario insertado con ID:", insertResult2.id);

    // Consultar datos
    console.log("\n   🔍 CONSULTANDO DATOS...");
    const selectResult = await db3.executeQuery( // ¡Usando db3!
        'SELECT * FROM users ORDER BY id DESC'
    );
    console.log("   Datos obtenidos:", selectResult.data);

    // ========== PRUEBA 4: Verificar estado de la conexión ==========
    console.log("\n4. ✅ ESTADO DE LA CONEXIÓN");
    
    console.log("   Información de conexión db1:", db1.getConnectionInfo());
    console.log("   Información de conexión db2:", db2.getConnectionInfo());
    console.log("   Información de conexión db3:", db3.getConnectionInfo());

    // ========== PRUEBA 5: Intentar crear instancia directa (debe fallar) ==========
    console.log("\n5. ✅ PREVENCIÓN DE CREACIÓN DIRECTA");
    
    try {
        const invalidDb = new DatabaseConnection();
        console.log("   ❌ ERROR: No debería llegar aquí");
    } catch (error) {
        console.log("   ✅ Correcto - Creación bloqueada:", error.message);
    }

    // ========== PRUEBA 6: Probar con múltiples hilos de ejecución ==========
    console.log("\n6. ✅ PRUEBA CON MÚLTIPLES 'HILOS' (setTimeout)");
    
    const promises = [];
    for (let i = 0; i < 3; i++) {
        promises.push(new Promise(async (resolve) => {
            setTimeout(async () => {
                const tempDb = DatabaseConnection.getInstance();
                const result = await tempDb.executeQuery(
                    'INSERT INTO users (name, email) VALUES (?, ?)',
                    [`Usuario${i}`, `user${i}@test.com`]
                );
                resolve({ instance: tempDb, result });
            }, 100 * i);
        }));
    }

    const results = await Promise.all(promises);
    console.log("   Resultados de inserciones concurrentes:");
    results.forEach((result, index) => {
        console.log(`     Hilo ${index + 1}: ID ${result.result.id}, Instancia ID: ${result.instance.getConnectionInfo().instanceId}`);
    });

    // ========== LIMPIEZA FINAL ==========
    console.log("\n7. 🧹 LIMPIEZA Y CIERRE");
    
    db1.close();
    
    console.log("\n🎉 ¡DEMOSTRACIÓN COMPLETADA EXITOSAMENTE!");
    console.log("📚 RESUMEN: El patrón Singleton garantiza una única instancia");
    console.log("   compartida entre todas las referencias a la clase.");
}

// Ejecutar la demostración
demonstrateSingleton().catch(console.error);

// EJEMPLO ADICIONAL: Uso práctico en una aplicación
console.log("\n\n=== EJEMPLO PRÁCTICO: USO EN APLICACIÓN ===");

class UserService {
    constructor() {
        this.db = DatabaseConnection.getInstance();
    }

    async createUser(name, email) {
        try {
            const result = await this.db.executeQuery(
                'INSERT INTO users (name, email) VALUES (?, ?)',
                [name, email]
            );
            return { success: true, userId: result.id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAllUsers() {
        try {
            const result = await this.db.executeQuery('SELECT * FROM users');
            return { success: true, users: result.data || [] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Probar el servicio
async function testUserService() {
    const userService1 = new UserService();
    const userService2 = new UserService();

    console.log("¿Misma instancia de BD en servicios?", 
                userService1.db === userService2.db);

    // Los dos servicios comparten la misma conexión a BD
    await userService1.createUser("Servicio1", "serv1@test.com");
    await userService2.createUser("Servicio2", "serv2@test.com");

    const users = await userService1.getAllUsers();
    console.log("Usuarios registrados:", users.users);
}

// Ejecutar ejemplo práctico después de un delay
setTimeout(() => {
    testUserService().catch(console.error);
}, 2000);