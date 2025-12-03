const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar las rutas CON VALIDACIÓN
console.log('🔍 Cargando rutas...');

const usuariosRoutes = require('./src/routes/usuarios.js');
console.log('✅ usuarios.js:', typeof usuariosRoutes, usuariosRoutes ? 'OK' : '❌ UNDEFINED');

const reservasRoutes = require('./src/routes/reservas.js');
console.log('✅ reservas.js:', typeof reservasRoutes, reservasRoutes ? 'OK' : '❌ UNDEFINED');

const serviciosRoutes = require('./src/routes/servicios.js');
console.log('✅ servicios.js:', typeof serviciosRoutes, serviciosRoutes ? 'OK' : '❌ UNDEFINED');

const cotizacionesRoutes = require('./src/routes/cotizaciones.js');
console.log('✅ cotizaciones.js:', typeof cotizacionesRoutes, cotizacionesRoutes ? 'OK' : '❌ UNDEFINED');

const notificacionesRoutes = require('./src/routes/notificaciones.js');
console.log('✅ notificaciones.js:', typeof notificacionesRoutes, notificacionesRoutes ? 'OK' : '❌ UNDEFINED');

const estadisticasRoutes = require('./src/routes/estadisticas.js');
console.log('✅ estadisticas.js:', typeof estadisticasRoutes, estadisticasRoutes ? 'OK' : '❌ UNDEFINED');

const empleadosRoutes = require('./src/routes/empleados.js');
console.log('✅ empleados.js:', typeof empleadosRoutes, empleadosRoutes ? 'OK' : '❌ UNDEFINED');

const consultasRoutes = require('./src/routes/consultas.js');
console.log('✅ consultas.js:', typeof consultasRoutes, consultasRoutes ? 'OK' : '❌ UNDEFINED');

console.log('');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logging de requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Ruta de bienvenida mejorada
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: '🚀 API Foam Wash funcionando correctamente',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            usuarios: {
                base: '/api/usuarios',
                analytics: [
                    '/api/usuarios/analytics/usuarios-por-rol',
                    '/api/usuarios/analytics/direcciones-incompletas',
                    '/api/usuarios/analytics/documentos-comunes',
                    '/api/usuarios/analytics/por-tipo-documento/:tipo',
                    '/api/usuarios/analytics/clientes-sin-vehiculos',
                    '/api/usuarios/analytics/empleados-activos',
                    '/api/usuarios/analytics/historial-cliente/:id'
                ]
            },
            servicios: {
                base: '/api/servicios',
                analytics: [
                    '/api/servicios/analytics/mas-solicitados',
                    '/api/servicios/analytics/por-mes',
                    '/api/servicios/analytics/por-empleado-mes',
                    '/api/servicios/analytics/historial-empleado/:id',
                    '/api/servicios/analytics/programados-hoy',
                    '/api/servicios/analytics/dias-mayor-carga',
                    '/api/servicios/analytics/mas-observaciones',
                    '/api/servicios/analytics/cotizados-sin-reserva',
                    '/api/servicios/analytics/promedio-por-cliente'
                ]
            },
            empleados: {
                base: '/api/empleados',
                endpoints: [
                    '/api/empleados/sin-servicios',
                    '/api/empleados/servicios-finalizados',
                    '/api/empleados/mas-servicios-mes',
                    '/api/empleados/:id/notificaciones-servicios',
                    '/api/empleados/:id/agenda-semanal',
                    '/api/empleados/:id/servicios-hoy',
                    '/api/empleados/:id/observaciones',
                    '/api/empleados/productividad/general'
                ]
            },
            consultas: {
                base: '/api/consultas',
                descripcion: 'Las 10 consultas principales del proyecto',
                endpoints: [
                    '/api/consultas/1-usuarios-por-rol',
                    '/api/consultas/2-servicios-disponibles',
                    '/api/consultas/3-servicios-por-cliente',
                    '/api/consultas/4-agenda-empleado/:id',
                    '/api/consultas/5-clientes-semana',
                    '/api/consultas/6-reservas-por-servicio',
                    '/api/consultas/7-reservas-por-cliente',
                    '/api/consultas/8-empleados-servicios-mes',
                    '/api/consultas/9-empleados-sin-servicios',
                    '/api/consultas/10-agenda-semanal-completa',
                    '/api/consultas/todas'
                ]
            },
            reservas: '/api/reservas',
            cotizaciones: '/api/cotizaciones',
            notificaciones: '/api/notificaciones/:userId',
            estadisticas: '/api/estadisticas'
        },
        documentation: 'Para más información, consulta la documentación de cada endpoint'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Usar las rutas CON VALIDACIÓN
console.log('🔧 Registrando rutas en Express...');

if (typeof usuariosRoutes === 'function') {
    app.use('/api/usuarios', usuariosRoutes);
    console.log('✅ Ruta /api/usuarios registrada');
} else {
    console.error('❌ ERROR: usuariosRoutes no es una función válida');
}

if (typeof reservasRoutes === 'function') {
    app.use('/api/reservas', reservasRoutes);
    console.log('✅ Ruta /api/reservas registrada');
} else {
    console.error('❌ ERROR: reservasRoutes no es una función válida');
}

if (typeof serviciosRoutes === 'function') {
    app.use('/api/servicios', serviciosRoutes);
    console.log('✅ Ruta /api/servicios registrada');
} else {
    console.error('❌ ERROR: serviciosRoutes no es una función válida');
}

if (typeof cotizacionesRoutes === 'function') {
    app.use('/api/cotizaciones', cotizacionesRoutes);
    console.log('✅ Ruta /api/cotizaciones registrada');
} else {
    console.error('❌ ERROR: cotizacionesRoutes no es una función válida');
}

if (typeof notificacionesRoutes === 'function') {
    app.use('/api/notificaciones', notificacionesRoutes);
    console.log('✅ Ruta /api/notificaciones registrada');
} else {
    console.error('❌ ERROR: notificacionesRoutes no es una función válida');
}

if (typeof estadisticasRoutes === 'function') {
    app.use('/api/estadisticas', estadisticasRoutes);
    console.log('✅ Ruta /api/estadisticas registrada');
} else {
    console.error('❌ ERROR: estadisticasRoutes no es una función válida');
}

if (typeof empleadosRoutes === 'function') {
    app.use('/api/empleados', empleadosRoutes);
    console.log('✅ Ruta /api/empleados registrada');
} else {
    console.error('❌ ERROR: empleadosRoutes no es una función válida');
}

if (typeof consultasRoutes === 'function') {
    app.use('/api/consultas', consultasRoutes);
    console.log('✅ Ruta /api/consultas registrada');
} else {
    console.error('❌ ERROR: consultasRoutes no es una función válida');
}

console.log('');

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Ruta 404
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor Foam Wash corriendo`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50));
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;