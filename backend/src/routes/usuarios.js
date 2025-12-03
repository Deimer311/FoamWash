const express = require('express');
const router = express.Router();
const pool = require('../db');

// ==================== CONSULTAS BÁSICAS ====================

// GET - Obtener todos los usuarios con información completa
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre,
                u.Correo,
                u.Telefono,
                u.N_Documento,
                u.Direccion,
                r.Rol,
                td.nombre_del_documento,
                DATE_FORMAT(u.fecha_registro, '%Y-%m-%d') as fecha_registro
            FROM usuario u
            INNER JOIN rol r ON u.rol_Id_Rol = r.Id_Rol
            INNER JOIN Tipo_de_Documento td ON u.Tipo_de_Documento_idTipo_de_Documento = td.idTipo_de_Documento
            ORDER BY u.fecha_registro DESC
        `);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// GET - Obtener un usuario por ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre,
                u.Correo,
                u.Telefono,
                u.N_Documento,
                u.Direccion,
                r.Rol,
                r.Id_Rol,
                td.nombre_del_documento,
                td.idTipo_de_Documento,
                DATE_FORMAT(u.fecha_registro, '%Y-%m-%d') as fecha_registro
            FROM usuario u
            INNER JOIN rol r ON u.rol_Id_Rol = r.Id_Rol
            INNER JOIN Tipo_de_Documento td ON u.Tipo_de_Documento_idTipo_de_Documento = td.idTipo_de_Documento
            WHERE u.Id_Usuario = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }
        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// POST - Crear un nuevo usuario
router.post('/', async (req, res) => {
    try {
        const { 
            Nombre, 
            Telefono, 
            N_Documento, 
            Direccion, 
            Correo, 
            contraseña, 
            rol_Id_Rol, 
            Tipo_de_Documento_idTipo_de_Documento 
        } = req.body;
        
        // Validaciones básicas
        if (!Nombre || !Correo || !N_Documento || !rol_Id_Rol) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO usuario 
            (Nombre, Telefono, N_Documento, Direccion, Correo, contraseña, rol_Id_Rol, Tipo_de_Documento_idTipo_de_Documento) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [Nombre, Telefono, N_Documento, Direccion, Correo, contraseña, rol_Id_Rol, Tipo_de_Documento_idTipo_de_Documento]
        );
        
        res.status(201).json({ 
            success: true,
            message: 'Usuario creado exitosamente', 
            data: {
                Id_Usuario: result.insertId,
                Nombre,
                Correo
            }
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'El correo o documento ya está registrado'
            });
        }
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// PUT - Actualizar un usuario
router.put('/:id', async (req, res) => {
    try {
        const { Nombre, Telefono, Direccion, Correo } = req.body;
        
        const [result] = await pool.query(
            'UPDATE usuario SET Nombre = ?, Telefono = ?, Direccion = ?, Correo = ? WHERE Id_Usuario = ?',
            [Nombre, Telefono, Direccion, Correo, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Usuario actualizado exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// DELETE - Eliminar un usuario
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM usuario WHERE Id_Usuario = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Usuario no encontrado' 
            });
        }
        
        res.json({ 
            success: true,
            message: 'Usuario eliminado exitosamente' 
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// ==================== CONSULTAS COMPLEJAS ====================

// GET - Cuántos usuarios hay por tipo de rol
router.get('/analytics/usuarios-por-rol', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                r.Rol,
                r.Id_Rol,
                COUNT(u.Id_Usuario) as Total_Usuarios,
                ROUND((COUNT(u.Id_Usuario) * 100.0 / (SELECT COUNT(*) FROM usuario)), 2) as Porcentaje
            FROM rol r
            LEFT JOIN usuario u ON u.rol_Id_Rol = r.Id_Rol
            GROUP BY r.Id_Rol, r.Rol
            ORDER BY Total_Usuarios DESC
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

// GET - Usuarios con direcciones incompletas o vacías
router.get('/analytics/direcciones-incompletas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre,
                u.Correo,
                u.Telefono,
                u.Direccion,
                r.Rol
            FROM usuario u
            INNER JOIN rol r ON u.rol_Id_Rol = r.Id_Rol
            WHERE u.Direccion IS NULL 
                OR u.Direccion = '' 
                OR LENGTH(TRIM(u.Direccion)) < 5
            ORDER BY u.Nombre
        `);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Tipo de documento más común entre los usuarios
router.get('/analytics/documentos-comunes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                td.nombre_del_documento,
                COUNT(u.Id_Usuario) as Total_Usuarios,
                ROUND((COUNT(u.Id_Usuario) * 100.0 / (SELECT COUNT(*) FROM usuario)), 2) as Porcentaje
            FROM Tipo_de_Documento td
            LEFT JOIN usuario u ON u.Tipo_de_Documento_idTipo_de_Documento = td.idTipo_de_Documento
            GROUP BY td.idTipo_de_Documento, td.nombre_del_documento
            ORDER BY Total_Usuarios DESC
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

// GET - Usuarios por tipo de documento específico
router.get('/analytics/por-tipo-documento/:tipoDocumento', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre,
                u.Correo,
                u.Telefono,
                u.N_Documento,
                r.Rol,
                td.nombre_del_documento
            FROM usuario u
            INNER JOIN rol r ON u.rol_Id_Rol = r.Id_Rol
            INNER JOIN Tipo_de_Documento td ON u.Tipo_de_Documento_idTipo_de_Documento = td.idTipo_de_Documento
            WHERE td.nombre_del_documento LIKE ?
            ORDER BY u.Nombre
        `, [`%${req.params.tipoDocumento}%`]);
        
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Clientes sin vehículos registrados (si existe tabla vehículo)
router.get('/analytics/clientes-sin-vehiculos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre,
                u.Correo,
                u.Telefono,
                u.Direccion
            FROM usuario u
            WHERE u.rol_Id_Rol = 3
            AND NOT EXISTS (
                SELECT 1 FROM vehiculo v WHERE v.usuario_Id_Usuario = u.Id_Usuario
            )
            ORDER BY u.Nombre
        `);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Empleados activos y disponibles
router.get('/analytics/empleados-activos', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.Id_Usuario,
                u.Nombre,
                u.Correo,
                u.Telefono,
                COUNT(DISTINCT r.ID_Reserva) as Reservas_Activas,
                COUNT(DISTINCT os.Id_Orden_servicio) as Servicios_Pendientes
            FROM usuario u
            LEFT JOIN reserva r ON r.Id_Usuario = u.Id_Usuario 
                AND r.Estado IN ('Pendiente', 'En Proceso')
            LEFT JOIN orden_servicio os ON os.empleado_Id_Usuario = u.Id_Usuario 
                AND os.Estado_Servicio != 'Finalizado'
            WHERE u.rol_Id_Rol = 2
            GROUP BY u.Id_Usuario
            ORDER BY Servicios_Pendientes ASC, u.Nombre
        `);
        res.json({
            success: true,
            count: rows.length,
            data: rows
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

// GET - Historial completo de un cliente
router.get('/analytics/historial-cliente/:id', async (req, res) => {
    try {
        const [reservas] = await pool.query(`
            SELECT 
                r.ID_Reserva,
                r.Estado,
                r.fecha,
                r.Hora,
                COUNT(DISTINCT rs.servicio_Id_Servicio) as Total_Servicios
            FROM reserva r
            LEFT JOIN reserva_has_servicio rs ON r.ID_Reserva = rs.reserva_ID_Reserva
            WHERE r.Id_Usuario = ?
            GROUP BY r.ID_Reserva
            ORDER BY r.fecha DESC
        `, [req.params.id]);

        const [cotizaciones] = await pool.query(`
            SELECT 
                c.Id_Cotizacion,
                c.Precio_cotizado,
                c.Cantidad,
                c.Tamaño,
                c.fecha_cotizacion
            FROM cotizacion c
            WHERE c.Id_usuario = ?
            ORDER BY c.fecha_cotizacion DESC
        `, [req.params.id]);

        const [notificaciones] = await pool.query(`
            SELECT 
                n.id_notificaciones,
                n.descripcion_notificacion,
                n.fecha_notificacion
            FROM notificaciones n
            WHERE n.usuario_Id_Usuario = ?
            ORDER BY n.fecha_notificacion DESC
            LIMIT 10
        `, [req.params.id]);

        res.json({
            success: true,
            data: {
                reservas,
                cotizaciones,
                notificaciones,
                resumen: {
                    total_reservas: reservas.length,
                    total_cotizaciones: cotizaciones.length,
                    total_notificaciones: notificaciones.length
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

module.exports = router;