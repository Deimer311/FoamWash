const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Obtener todas las reservas
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                res.ID_Reserva,
                res.Estado,
                res.fecha,
                res.Hora,
                res.Informacion_adicional,
                u.Nombre AS Cliente,
                u.Telefono,
                u.Correo,
                obs.Observaciones,
                obs.estado AS Estado_Observacion
            FROM reserva res
            INNER JOIN usuario u ON res.Id_Usuario = u.Id_Usuario
            INNER JOIN observacion obs ON res.observacion_Id_Observaciones = obs.Id_Observaciones
            ORDER BY res.fecha DESC, res.Hora DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// GET - Obtener reservas por estado
router.get('/estado/:estado', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                res.ID_Reserva,
                res.Estado,
                res.fecha,
                res.Hora,
                u.Nombre AS Cliente,
                u.Telefono
            FROM reserva res
            INNER JOIN usuario u ON res.Id_Usuario = u.Id_Usuario
            WHERE res.Estado = ?
            ORDER BY res.fecha, res.Hora
        `, [req.params.estado]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// POST - Crear una nueva reserva
router.post('/', async (req, res) => {
    try {
        const { Estado, Id_Usuario, fecha, Hora, Informacion_adicional, observacion_Id_Observaciones } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO reserva (Estado, Id_Usuario, fecha, Hora, Informacion_adicional, observacion_Id_Observaciones) VALUES (?, ?, ?, ?, ?, ?)',
            [Estado, Id_Usuario, fecha, Hora, Informacion_adicional, observacion_Id_Observaciones]
        );
        
        res.status(201).json({ 
            message: 'Reserva creada exitosamente', 
            ID_Reserva: result.insertId 
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

// PUT - Actualizar estado de reserva
router.put('/:id', async (req, res) => {
    try {
        const { Estado } = req.body;
        
        const [result] = await pool.query(
            'UPDATE reserva SET Estado = ? WHERE ID_Reserva = ?',
            [Estado, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }
        
        res.json({ message: 'Reserva actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

module.exports = router;