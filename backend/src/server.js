    const express = require('express');
    const cors = require('cors');
    require('dotenv').config();

    const app = express();

    // MIDDLEWARES
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    // RUTAS
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);

    // HEALTH CHECK
    app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API FoamWash funcionando correctamente',
        timestamp: new Date().toISOString()
    });
    });

    // MANEJO DE ERRORES
    const { notFound, errorHandler } = require('./middlewares/error.middleware');
    app.use(notFound);
    app.use(errorHandler);

    // INICIAR SERVIDOR
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔐 Auth: http://localhost:${PORT}/api/auth/*`);
    });