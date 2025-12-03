const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Obtener notificaciones de un usuario
router.get('/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                n.id_notificaciones,
                n.descripcion_notificacion,
                n.fecha_notificacion,
                u.Nombre
            FROM notificaciones n
            INNER JOIN usuario u ON n.usuario_Id_Usuario = u.Id_Usuario
            WHERE n.usuario_Id_Usuario = ?
            ORDER BY n.fecha_notificacion DESC
        `, [req.params.userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// POST - Crear notificación
router.post('/', async (req, res) => {
    try {
        const { descripcion_notificacion, usuario_Id_Usuario } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO notificaciones (descripcion_notificacion, usuario_Id_Usuario) VALUES (?, ?)',
            [descripcion_notificacion, usuario_Id_Usuario]
        );
        
        res.status(201).json({ 
            message: 'Notificación creada exitosamente', 
            id_notificaciones: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

module.exports = router;