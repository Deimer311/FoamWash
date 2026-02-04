const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==================== CONSULTAS BÁSICAS ====================

// GET - Obtener todos los servicios
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Id_Servicio,
                s.Nombre_Servicio,
                s.Precio,
                s.descripcion,
                s.duracion_estimada,
                s.estado
            FROM servicio s
            ORDER BY s.Nombre_Servicio
        `);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// GET - Obtener un servicio por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Id_Servicio,
                s.Nombre_Servicio,
                s.Precio,
                s.descripcion,
                s.duracion_estimada,
                s.estado
            FROM servicio s
            WHERE s.Id_Servicio = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Servicio no encontrado' 
            });
        }
        
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener servicio:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// POST - Crear un nuevo servicio
router.post('/', async (req, res) => {
    try {
        const { Nombre_Servicio, Precio, descripcion, duracion_estimada, estado } = req.body;
        
        if (!Nombre_Servicio || !Precio) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos (Nombre_Servicio, Precio)'
            });
        }

        const [result] = await pool.query(
            'INSERT INTO servicio (Nombre_Servicio, Precio, descripcion, duracion_estimada, estado) VALUES (?, ?, ?, ?, ?)',
            [Nombre_Servicio, Precio, descripcion, duracion_estimada, estado || 'activo']
        );
        
        res.status(201).json({ 
            success: true,
            message: 'Servicio creado exitosamente', 
            data: {
                Id_Servicio: result.insertId,
                Nombre_Servicio,
                Precio
            }
        });
    } catch (error) {
        console.error('Error al crear servicio:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// PUT - Actualizar un servicio
router.put('/:id', async (req, res) => {
    try {
        const { Nombre_Servicio, Precio, descripcion, duracion_estimada, estado } = req.body;
        
        const [result] = await pool.query(
            'UPDATE servicio SET Nombre_Servicio = ?, Precio = ?, descripcion = ?, duracion_estimada = ?, estado = ? WHERE Id_Servicio = ?',
            [Nombre_Servicio, Precio, descripcion, duracion_estimada, estado, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Servicio no encontrado' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Servicio actualizado exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar servicio:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// DELETE - Eliminar un servicio
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM servicio WHERE Id_Servicio = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Servicio no encontrado' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Servicio eliminado exitosamente' 
        });
    } catch (error) {
        console.error('Error al eliminar servicio:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// ==================== CONSULTAS ANALYTICS ====================

// GET - Servicios más solicitados
router.get('/analytics/mas-solicitados', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Id_Servicio,
                s.Nombre_Servicio,
                s.Precio,
                COUNT(rs.reserva_ID_Reserva) as Total_Reservas,
                SUM(s.Precio) as Ingresos_Totales
            FROM servicio s
            LEFT JOIN reserva_has_servicio rs ON s.Id_Servicio = rs.servicio_Id_Servicio
            GROUP BY s.Id_Servicio
            ORDER BY Total_Reservas DESC
            LIMIT 10
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Servicios por mes
router.get('/analytics/por-mes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Nombre_Servicio,
                DATE_FORMAT(r.fecha, '%Y-%m') as Mes,
                COUNT(rs.reserva_ID_Reserva) as Total_Servicios
            FROM servicio s
            INNER JOIN reserva_has_servicio rs ON s.Id_Servicio = rs.servicio_Id_Servicio
            INNER JOIN reserva r ON rs.reserva_ID_Reserva = r.ID_Reserva
            GROUP BY s.Id_Servicio, Mes
            ORDER BY Mes DESC, Total_Servicios DESC
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Servicios por empleado en el mes
router.get('/analytics/por-empleado-mes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Nombre as Empleado,
                s.Nombre_Servicio,
                COUNT(os.Id_Orden_servicio) as Total_Servicios,
                SUM(CASE WHEN os.Estado_Servicio = 'Finalizado' THEN 1 ELSE 0 END) as Finalizados
            FROM usuario u
            INNER JOIN orden_servicio os ON u.Id_Usuario = os.empleado_Id_Usuario
            INNER JOIN servicio s ON os.servicio_Id_Servicio = s.Id_Servicio
            WHERE MONTH(os.fecha_inicio) = MONTH(CURDATE())
            AND YEAR(os.fecha_inicio) = YEAR(CURDATE())
            GROUP BY u.Id_Usuario, s.Id_Servicio
            ORDER BY Total_Servicios DESC
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Historial de servicios de un empleado
router.get('/analytics/historial-empleado/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Nombre_Servicio,
                os.fecha_inicio,
                os.fecha_finalizacion,
                os.Estado_Servicio,
                CONCAT(u.Nombre, ' ') as Cliente
            FROM orden_servicio os
            INNER JOIN servicio s ON os.servicio_Id_Servicio = s.Id_Servicio
            LEFT JOIN reserva r ON os.reserva_ID_Reserva = r.ID_Reserva
            LEFT JOIN usuario u ON r.Id_Usuario = u.Id_Usuario
            WHERE os.empleado_Id_Usuario = ?
            ORDER BY os.fecha_inicio DESC
        `, [req.params.id]);
        
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Servicios programados para hoy
router.get('/analytics/programados-hoy', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Nombre_Servicio,
                os.fecha_inicio,
                CONCAT(emp.Nombre, ' ') as Empleado,
                CONCAT(cli.Nombre, ' ') as Cliente,
                os.Estado_Servicio
            FROM orden_servicio os
            INNER JOIN servicio s ON os.servicio_Id_Servicio = s.Id_Servicio
            INNER JOIN usuario emp ON os.empleado_Id_Usuario = emp.Id_Usuario
            LEFT JOIN reserva r ON os.reserva_ID_Reserva = r.ID_Reserva
            LEFT JOIN usuario cli ON r.Id_Usuario = cli.Id_Usuario
            WHERE DATE(os.fecha_inicio) = CURDATE()
            ORDER BY os.fecha_inicio
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Días con mayor carga de servicios
router.get('/analytics/dias-mayor-carga', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                DATE_FORMAT(os.fecha_inicio, '%Y-%m-%d') as Fecha,
                DAYNAME(os.fecha_inicio) as Dia_Semana,
                COUNT(os.Id_Orden_servicio) as Total_Servicios
            FROM orden_servicio os
            WHERE os.fecha_inicio >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY Fecha
            ORDER BY Total_Servicios DESC
            LIMIT 10
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Servicios con más observaciones
router.get('/analytics/mas-observaciones', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Nombre_Servicio,
                COUNT(DISTINCT obs.Id_Observaciones) as Total_Observaciones,
                GROUP_CONCAT(DISTINCT obs.Observaciones SEPARATOR ' | ') as Observaciones
            FROM servicio s
            INNER JOIN reserva_has_servicio rs ON s.Id_Servicio = rs.servicio_Id_Servicio
            INNER JOIN reserva r ON rs.reserva_ID_Reserva = r.ID_Reserva
            INNER JOIN observacion obs ON r.observacion_Id_Observaciones = obs.Id_Observaciones
            WHERE obs.Observaciones IS NOT NULL AND obs.Observaciones != ''
            GROUP BY s.Id_Servicio
            ORDER BY Total_Observaciones DESC
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Servicios cotizados sin reserva
router.get('/analytics/cotizados-sin-reserva', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                c.Id_Cotizacion,
                c.Precio_cotizado,
                c.Cantidad,
                c.Tamaño,
                c.fecha_cotizacion,
                u.Nombre as Cliente,
                u.Correo,
                u.Telefono
            FROM cotizacion c
            INNER JOIN usuario u ON c.Id_usuario = u.Id_Usuario
            WHERE NOT EXISTS (
                SELECT 1 FROM reserva r WHERE r.Id_Usuario = c.Id_usuario
                AND DATE(r.fecha) >= DATE(c.fecha_cotizacion)
            )
            ORDER BY c.fecha_cotizacion DESC
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Promedio de servicios por cliente
router.get('/analytics/promedio-por-cliente', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre as Cliente,
                COUNT(r.ID_Reserva) as Total_Reservas,
                COUNT(DISTINCT rs.servicio_Id_Servicio) as Servicios_Diferentes,
                ROUND(COUNT(rs.servicio_Id_Servicio) / NULLIF(COUNT(DISTINCT r.ID_Reserva), 0), 2) as Promedio_Servicios_Por_Reserva
            FROM usuario u
            INNER JOIN reserva r ON u.Id_Usuario = r.Id_Usuario
            INNER JOIN reserva_has_servicio rs ON r.ID_Reserva = rs.reserva_ID_Reserva
            WHERE u.rol_Id_Rol = 3
            GROUP BY u.Id_Usuario
            ORDER BY Total_Reservas DESC
        `);
        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;