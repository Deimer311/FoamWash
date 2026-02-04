// Importa el módulo 'mysql2/promise' para interactuar con la base de datos MySQL.
// Se utiliza la versión 'promise' para trabajar con async/await y evitar callbacks anidados.
const mysql = require('mysql2/promise');

// Importa y configura el módulo 'dotenv' para cargar variables de entorno desde un archivo .env.
// Esto mantiene las credenciales de la base de datos seguras y separadas del código fuente.
require('dotenv').config();

// Crea un 'pool' (piscina) de conexiones a la base de datos.
// Un pool gestiona múltiples conexiones y las reutiliza, lo que es más eficiente que abrir y cerrar
// una nueva conexión para cada consulta.
const pool = mysql.createPool({
    // Dirección del host de la base de datos (e.g., 'localhost' o una IP).
    host: process.env.DB_HOST,
    // Nombre de usuario para autenticarse en la base de datos.
    user: process.env.DB_USER,
    // Contraseña del usuario.
    password: process.env.DB_PASSWORD,
    // Nombre de la base de datos específica a la que se conectará.
    database: process.env.DB_NAME,
    // Indica si el pool debe esperar automáticamente si se excede el límite de conexiones disponibles.
    waitForConnections: true,
    // El número máximo de conexiones simultáneas que el pool puede manejar en un momento dado.
    connectionLimit: 10,
    // El número máximo de solicitudes de conexión que se pueden poner en cola si el límite de conexiones está lleno.
    queueLimit: 0
});

// --- Bloque de prueba de conexión ---
// Intenta obtener una conexión del pool para verificar si la configuración es correcta.
pool.getConnection()
    .then(connection => {
        // Si tiene éxito, libera la conexión inmediatamente de vuelta al pool.
        pool.releaseConnection(connection);
        // Muestra un mensaje de éxito en la consola.
        console.log('✅ Base de datos MySQL conectada exitosamente');
    })
    .catch(err => {
        // Si ocurre un error durante la conexión inicial, lo captura y lo muestra en la consola.
        console.error('❌ Error al conectar a la BD:', err);
    });

// Exporta el objeto 'pool' para que pueda ser utilizado en otros archivos de la aplicación
// (e.g., para ejecutar consultas SQL).
module.exports = pool;
