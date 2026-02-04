    /**
     * 🔐 RUTAS DE AUTENTICACIÓN
     */

    const express = require('express');
    const router = express.Router();

    const authController = require('../controllers/auth.controller');
    const { protect } = require('../middlewares/auth.middleware');
    const { validate } = require('../middlewares/validation.middleware');
    const {
    registerValidation,
    loginValidation
    } = require('../validators/auth.validator');

    router.post('/register', validate(registerValidation), authController.register);
    router.post('/login', validate(loginValidation), authController.login);
    router.get('/me', protect, authController.getMe);

    module.exports = router;