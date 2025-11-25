// 1. Importar librerías
const express = require('express');
const mysql = require('mysql'); // O mysql2
const app = express();
const port = 3000;

// 2. Configuración de la Conexión a la BD
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'foam_wash_db'
});

// Conectar a la base de datos
conexion.connect((err) => {
    if (err) {
        console.error('Error al conectar a la BD: ' + err.stack);
        return;
    }
    console.log('Conexión a la BD exitosa con ID: ' + conexion.threadId);
});

// NUEVA RUTA: Ruta principal (http://localhost:3000/)
// ----------------------------------------------------
app.get('/', (req, res) => {
    // Envía un mensaje de texto simple y termina la solicitud aquí
    res.send('Servidor de Foam Wash API está activo. Usa /cotizacion para obtener los datos.');
});


// ----------------------------------------------------
// RUTA CORREGIDA: Ruta para obtener datos de la BD
// ----------------------------------------------------
app.get('/cotizacion', (req, res) => {
    
    const sql_query = 'SELECT * FROM cotizacion';

    // Ejecutar la consulta (y esperar que la BD responda)
    conexion.query(sql_query, (error, resultados) => {
        if (error) {
            // Manejo de errores
            res.status(500).send({
                mensaje: "Error al ejecutar la consulta",
                detalle: error.message
            });
            return;
        }

        // ENVIAR SOLO LOS RESULTADOS JSON
        res.json(resultados);
    });
    // NOTA: La conexión NO se cierra aquí, porque el servidor
    // debe permanecer activo para manejar futuras solicitudes.
});

// 5. Iniciar el servidor web
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
