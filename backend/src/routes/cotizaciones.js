const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Obtener todas las cotizaciones
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.Id_Cotizacion,
                c.Precio_cotizado,
                c.Cantidad,
                c.Tamaño,
                c.fecha_cotizacion,
                u.Nombre AS Cliente,
                u.Correo,
                u.Telefono
            FROM cotizacion c
            INNER JOIN usuario u ON c.Id_usuario = u.Id_Usuario
            ORDER BY c.fecha_cotizacion DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener cotizaciones:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// POST - Crear una cotización
router.post('/', async (req, res) => {
    try {
        const { Id_usuario, Precio_cotizado, Cantidad, Tamaño } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO cotizacion (Id_usuario, Precio_cotizado, Cantidad, Tamaño) VALUES (?, ?, ?, ?)',
            [Id_usuario, Precio_cotizado, Cantidad, Tamaño]
        );
        
        res.status(201).json({ 
            message: 'Cotización creada exitosamente', 
            Id_Cotizacion: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear cotización:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

module.exports = router;