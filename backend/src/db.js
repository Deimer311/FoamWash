    //=====================================================================
    // ESTE ARCHIVO MANEJA LA CONEXION CON LA BASE DE DATOS
    //=====================================================================

    // src/db.js

    // Importa el módulo 'mysql2' con la interfaz de promesas.
    // Esto permite usar async/await para manejar las operaciones de la base de datos de forma más limpia.
    const mysql = require('mysql2/promise'); // Nota el '/promise'

    // Carga las variables de entorno del archivo .env.
    // Esto permite acceder a las credenciales de forma segura usando process.env.
    require('dotenv').config();

    // Crea un "pool" de conexiones a la base de datos.
    // Un pool gestiona automáticamente un grupo de conexiones abiertas y las reutiliza,
    // lo cual es mucho más eficiente que abrir y cerrar una conexión para cada consulta.
    const pool = mysql.createPool({
    host: process.env.DB_HOST,         // Dirección del servidor MySQL (ej. 'localhost')
    user: process.env.DB_USER,         // Nombre de usuario de la BD (ej. 'root')
    password: process.env.DB_PASSWORD, // Contraseña del usuario (del archivo .env)
    database: process.env.DB_NAME,     // Nombre de la base de datos a la que conectarse
    waitForConnections: true,          // Si se agotan las conexiones, espera en cola en lugar de dar error inmediatamente
    connectionLimit: 10,               // Número máximo de conexiones simultáneas que el pool mantendrá abiertas
    queueLimit: 0                      // Límite para la cola de espera de conexiones (0 significa ilimitado)
    });

    // Prueba de conexión rápida (opcional):
    // Intenta obtener una conexión del pool para verificar que la configuración es correcta.
    pool.getConnection()
    .then(connection => {
        // Si tiene éxito, libera la conexión inmediatamente de vuelta al pool
        pool.releaseConnection(connection);
        console.log('✅ Base de datos MySQL conectada exitosamente');
    })
    .catch(err => {
        // Si hay un error en la conexión inicial, lo muestra en la consola
        console.error('❌ Error al conectar a la BD:', err);
    });

    // Exporta el objeto pool para que pueda ser utilizado en otras partes de la aplicación (ej. en tus rutas).
    // Al exportar el pool, puedes ejecutar consultas en cualquier momento sin preocuparte por la conexión.
    module.exports = pool;
