const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ajustado para la ruta correcta desde src/routes/

// ==================== LAS 10 CONSULTAS PRINCIPALES DEL PROYECTO ====================

// 1. ¿Cuántos usuarios están registrados por tipo de rol?
router.get('/1-usuarios-por-rol', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                r.Rol AS usuario, 
                COUNT(u.Id_Usuario) AS total_usuario 
            FROM usuario u 
            JOIN rol r ON r.Id_Rol = u.rol_Id_Rol 
            GROUP BY r.Rol
        `);
        res.json({
            success: true,
            consulta: 1,
            titulo: "¿Cuántos usuarios están registrados por tipo de rol?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 1:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 2. ¿Cuáles son los servicios disponibles?
router.get('/2-servicios-disponibles', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                s.Id_Servicio, 
                s.Nombre_Servicio AS servicio_disponible,
                s.Precio,
                s.descripcion
            FROM servicio s 
            GROUP BY s.Id_Servicio
        `);
        res.json({
            success: true,
            consulta: 2,
            titulo: "¿Cuáles son los servicios disponibles?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 2:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 3. ¿Cuántos servicios ha solicitado cada cliente en total?
router.get('/3-servicios-por-cliente', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                CONCAT(u.Nombre, ' ') AS cliente, 
                COUNT(r.ID_Reserva) AS total_servicios 
            FROM usuario u 
            LEFT JOIN reserva r ON u.Id_Usuario = r.Id_Usuario 
            WHERE u.rol_Id_Rol = 3
            GROUP BY cliente 
            ORDER BY total_servicios DESC
        `);
        res.json({
            success: true,
            consulta: 3,
            titulo: "¿Cuántos servicios ha solicitado cada cliente en total?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 3:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 4. ¿Cuál es la agenda semanal de un empleado?
router.get('/4-agenda-empleado/:id', async (req, res) => {
    try {
        const empleadoId = req.params.id;
        
        let query = `
            SELECT s.Nombre_Servicio, r.fecha
            AS fecha_programada,
            CONCAT(u.Nombre, ' ')
            AS cliente FROM reserva r INNER JOIN
            servicio s ON r.observacion_Id_Observaciones = s.Id_Servicio
            INNER JOIN usuario u ON r.ID_Usuario = u.ID_Usuario;
        `;
        
        const params = [];
        if (empleadoId) {
            query += ` AND os.empleado_Id_Usuario = ?`;
            params.push(empleadoId);
        }
        
        query += ` ORDER BY os.fecha_inicio`;
        
        const [rows] = await pool.query(query, params);
        
        res.json({
            success: true,
            consulta: 4,
            titulo: "¿Cuál es la agenda semanal de un empleado?",
            empleado_id: empleadoId || 'Todos',
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 4:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 5. ¿Qué clientes tienen servicios programados esta semana?
router.get('/5-clientes-semana', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT DISTINCT 
                CONCAT(u.Nombre, ' ') AS cliente,
                u.Correo,
                u.Telefono,
                r.fecha AS fecha_servicio,
                r.Hora,
                GROUP_CONCAT(DISTINCT s.Nombre_Servicio SEPARATOR ', ') AS servicios
            FROM reserva r
            INNER JOIN usuario u ON r.Id_Usuario = u.Id_Usuario
            INNER JOIN reserva_has_servicio rs ON r.ID_Reserva = rs.reserva_ID_Reserva
            INNER JOIN servicio s ON rs.servicio_Id_Servicio = s.Id_Servicio
            WHERE WEEK(r.fecha) = WEEK(CURDATE())
            AND YEAR(r.fecha) = YEAR(CURDATE())
            GROUP BY r.ID_Reserva, u.Id_Usuario, r.fecha, r.Hora
            ORDER BY r.fecha, r.Hora
        `);
        res.json({
            success: true,
            consulta: 5,
            titulo: "¿Qué clientes tienen servicios programados esta semana?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 5:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 6. ¿Cuántas reservas se han hecho por servicio?
router.get('/6-reservas-por-servicio', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                servicio.Nombre_Servicio,
                servicio.Precio,
                COUNT(rs.reserva_ID_Reserva) AS Total_Reservas
            FROM servicio
            LEFT JOIN reserva_has_servicio rs ON servicio.Id_Servicio = rs.servicio_Id_Servicio
            GROUP BY servicio.Id_Servicio, servicio.Nombre_Servicio
            ORDER BY Total_Reservas DESC
        `);
        res.json({
            success: true,
            consulta: 6,
            titulo: "¿Cuántas reservas se han hecho por servicio?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 6:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 7. ¿Cuántas reservas tiene cada cliente?
router.get('/7-reservas-por-cliente', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                usuario.Id_Usuario,
                usuario.Nombre,
                usuario.Correo,
                usuario.Telefono,
                COUNT(reserva.ID_Reserva) AS Total_Reservas
            FROM usuario
            LEFT JOIN reserva ON reserva.Id_Usuario = usuario.Id_Usuario
            WHERE usuario.rol_Id_Rol = 3
            GROUP BY usuario.Id_Usuario, usuario.Nombre
            ORDER BY Total_Reservas DESC
        `);
        res.json({
            success: true,
            consulta: 7,
            titulo: "¿Cuántas reservas tiene cada cliente?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 7:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 8. ¿Qué empleados tienen más servicios asignados este mes?
router.get('/8-empleados-servicios-mes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.Nombre AS Empleado, COUNT(r.ID_Reserva) 
            AS Reservas_Gestionadas FROM reserva r INNER JOIN 
            usuario u ON r.ID_Usuario = u.ID_Usuario 
            WHERE MONTH(r.fecha) = MONTH(CURDATE()) 
            AND YEAR(r.fecha) = YEAR(CURDATE()) 
            GROUP BY u.Nombre ORDER BY Reservas_Gestionadas DESC;
        `);
        res.json({
            success: true,
            consulta: 8,
            titulo: "¿Qué empleados tienen más servicios asignados este mes?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 8:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 9. ¿Qué empleados no tienen servicios asignados actualmente?
router.get('/9-empleados-sin-servicios', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.Nombre AS Empleado_Sin_Reservas 
            FROM usuario u 
            LEFT JOIN reserva r ON u.ID_Usuario = r.ID_Usuario AND MONTH(r.fecha) = MONTH(CURDATE()) AND YEAR(r.fecha) = YEAR(CURDATE()) WHERE r.ID_Reserva IS NULL ORDER BY u.Nombre;
        `);
        res.json({
            success: true,
            consulta: 9,
            titulo: "¿Qué empleados no tienen servicios asignados actualmente?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 9:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// 10. ¿Cuál es la agenda semanal completa? (Todos los servicios de la semana)
router.get('/10-agenda-semanal-completa', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.Nombre_Servicio, 
            r.fecha AS fecha_programada, 
            CONCAT(u.Nombre, ' ') AS cliente 
            FROM reserva r INNER JOIN servicio s ON r.ID_Reserva = s.Id_Servicio 
            INNER JOIN usuario u ON r.ID_Usuario = u.ID_Usuario;
        `);
        res.json({
            success: true,
            consulta: 10,
            titulo: "¿Cuál es la agenda semanal completa?",
            data: rows
        });
    } catch (error) {
        console.error('Error en consulta 10:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// ==================== ENDPOINT PARA TODAS LAS CONSULTAS ====================

// GET - Obtener todas las consultas a la vez
router.get('/todas', async (req, res) => {
    try {
        const consultas = [];
        
        // Ejecutar todas las consultas
        const [c1] = await pool.query(`
            SELECT r.Rol AS usuario, COUNT(u.Id_Usuario) AS total_usuario 
            FROM usuario u JOIN rol r ON r.Id_Rol = u.rol_Id_Rol GROUP BY r.Rol
        `);
        consultas.push({ numero: 1, titulo: "Usuarios por rol", data: c1 });
        
        const [c2] = await pool.query(`
            SELECT s.Id_Servicio, s.Nombre_Servicio AS servicio_disponible, s.Precio 
            FROM servicio s GROUP BY s.Id_Servicio
        `);
        consultas.push({ numero: 2, titulo: "Servicios disponibles", data: c2 });
        
        const [c3] = await pool.query(`
            SELECT CONCAT(u.Nombre, ' ') AS cliente, COUNT(r.ID_Reserva) AS total_servicios 
            FROM usuario u LEFT JOIN reserva r ON u.Id_Usuario = r.Id_Usuario 
            WHERE u.rol_Id_Rol = 3 GROUP BY cliente ORDER BY total_servicios DESC
        `);
        consultas.push({ numero: 3, titulo: "Servicios por cliente", data: c3 });
        
        const [c6] = await pool.query(`
            SELECT servicio.Nombre_Servicio, COUNT(rs.reserva_ID_Reserva) AS Total_Reservas
            FROM servicio
            LEFT JOIN reserva_has_servicio rs ON servicio.Id_Servicio = rs.servicio_Id_Servicio
            GROUP BY servicio.Id_Servicio, servicio.Nombre_Servicio
            ORDER BY Total_Reservas DESC
        `);
        consultas.push({ numero: 6, titulo: "Reservas por servicio", data: c6 });
        
        const [c7] = await pool.query(`
            SELECT usuario.Id_Usuario, usuario.Nombre, COUNT(reserva.ID_Reserva) AS Total_Reservas
            FROM usuario
            LEFT JOIN reserva ON reserva.Id_Usuario = usuario.Id_Usuario
            WHERE usuario.rol_Id_Rol = 3
            GROUP BY usuario.Id_Usuario, usuario.Nombre
            ORDER BY Total_Reservas DESC
        `);
        consultas.push({ numero: 7, titulo: "Reservas por cliente", data: c7 });
        
        res.json({
            success: true,
            message: "Las 10 consultas principales del proyecto FoamWash",
            total_consultas: 10,
            consultas: consultas
        });
    } catch (error) {
        console.error('Error al obtener todas las consultas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error en el servidor', 
            error: error.message 
        });
    }
});

// ==================== ENDPOINT DE DOCUMENTACIÓN ====================

router.get('/', (req, res) => {
    res.json({
        success: true,
        message: "Las 10 Consultas SQL del Proyecto FoamWash",
        proyecto: "Sistema de Gestión de Servicios - FoamWash",
        empresa: "Lavados González",
        autores: [
            "Deimer Jesús González Jiménez",
            "Cristian Andrés Criollo Tovar",
            "Carolina Gómez Rodríguez",
            "Michel Alejandra Quintero Aragon",
            "Marlon Narváes Alexis Eraso"
        ],
        consultas: [
            {
                numero: 1,
                pregunta: "¿Cuántos usuarios están registrados por tipo de rol?",
                endpoint: "/api/consultas/1-usuarios-por-rol",
                proposito: "Conocer la distribución de usuarios según su rol (cliente, empleado, administrador)"
            },
            {
                numero: 2,
                pregunta: "¿Cuáles son los servicios disponibles?",
                endpoint: "/api/consultas/2-servicios-disponibles",
                proposito: "Mostrar el catálogo de servicios con nombres y tarifas"
            },
            {
                numero: 3,
                pregunta: "¿Cuántos servicios ha solicitado cada cliente en total?",
                endpoint: "/api/consultas/3-servicios-por-cliente",
                proposito: "Identificar clientes más activos para estrategias de fidelización"
            },
            {
                numero: 4,
                pregunta: "¿Cuál es la agenda semanal de un empleado?",
                endpoint: "/api/consultas/4-agenda-empleado/:id",
                proposito: "Planificación operativa y gestión de carga laboral"
            },
            {
                numero: 5,
                pregunta: "¿Qué clientes tienen servicios programados esta semana?",
                endpoint: "/api/consultas/5-clientes-semana",
                proposito: "Anticipar atención y preparar recursos para reservas activas"
            },
            {
                numero: 6,
                pregunta: "¿Cuántas reservas se han hecho por servicio?",
                endpoint: "/api/consultas/6-reservas-por-servicio",
                proposito: "Identificar servicios más demandados para ajustar estrategias"
            },
            {
                numero: 7,
                pregunta: "¿Cuántas reservas tiene cada cliente?",
                endpoint: "/api/consultas/7-reservas-por-cliente",
                proposito: "Analizar historial de uso para segmentación y retención"
            },
            {
                numero: 8,
                pregunta: "¿Qué empleados tienen más servicios asignados este mes?",
                endpoint: "/api/consultas/8-empleados-servicios-mes",
                proposito: "Evaluar carga de trabajo y redistribución de tareas"
            },
            {
                numero: 9,
                pregunta: "¿Qué empleados no tienen servicios asignados actualmente?",
                endpoint: "/api/consultas/9-empleados-sin-servicios",
                proposito: "Identificar personal disponible para mejorar eficiencia"
            },
            {
                numero: 10,
                pregunta: "¿Cuál es la agenda semanal completa?",
                endpoint: "/api/consultas/10-agenda-semanal-completa",
                proposito: "Vista general de todos los servicios programados de la semana"
            }
        ],
        endpoints_adicionales: {
            todas_consultas: "/api/consultas/todas"
        }
    });
});

module.exports = router;