    // index.js

    // Importa el módulo Express, el framework para crear el servidor web.
    const express = require('express');

    // Importa el middleware CORS, necesario para permitir peticiones desde tu frontend de React.
    const cors = require('cors');

    // Importa el pool de conexiones a la base de datos MySQL que configuraste en src/db.js.
    const pool = require('./src/db');

    // Inicializa la aplicación Express.
    const app = express();

    // Define el puerto en el que correrá el servidor.
    // Intenta usar el puerto definido en tus variables de entorno (ej. 5000), si no, usa 5000 por defecto.
    const PORT = process.env.PORT || 5000;

    // -- Middlewares --
    // Funciones que se ejecutan para cada solicitud entrante.

    // Middleware CORS: Habilita el intercambio de recursos de origen cruzado.
    // Permite que tu aplicación de React (que probablemente corre en un puerto diferente)
    // pueda hacer peticiones a este servidor.
    app.use(cors());

    // Middleware Express JSON: Parsea automáticamente los cuerpos de las peticiones entrantes
    // que tienen el formato JSON y los pone a disposición en `req.body`.
    app.use(express.json());

    // -- RUTA DE EJEMPLO: Obtener usuarios --
    // Define un endpoint GET en la URL '/api/usuarios'.
    app.get('/api/usuarios', async (req, res) => {
    try {
        // Ejecuta una consulta SQL usando el pool de conexiones.
        // 'pool.query' devuelve una promesa que, cuando se resuelve, contiene un array de resultados.
        // Usamos la desestructuración `[rows]` para obtener solo la primera parte de la respuesta (las filas de datos).
        const [rows] = await pool.query('SELECT * FROM usuarios');

        // Envía los datos obtenidos (las filas) como respuesta JSON al frontend.
        res.json(rows);

    } catch (error) {
        // Si ocurre un error durante la consulta, lo captura, lo imprime en la consola del servidor
        console.error(error);
        // y envía una respuesta de error 500 (Error Interno del Servidor) al cliente.
        res.status(500).json({ message: 'Error en el servidor' });
    }
    });

    // Inicia el servidor para que escuche peticiones en el puerto especificado.
    app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
