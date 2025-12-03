const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET - Dashboard general
router.get('/', async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM usuario WHERE rol_Id_Rol = 3) AS Total_Clientes,
                (SELECT COUNT(*) FROM reserva) AS Total_Reservas,
                (SELECT COUNT(*) FROM reserva WHERE Estado = 'Completado') AS Reservas_Completadas,
                (SELECT COUNT(*) FROM reserva WHERE Estado = 'Pendiente') AS Reservas_Pendientes,
                (SELECT SUM(Precio_cotizado) FROM cotizacion) AS Ingresos_Totales,
                (SELECT COUNT(*) FROM servicio) AS Servicios_Ofrecidos
        `);
        res.json(stats[0]);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

module.exports = router;