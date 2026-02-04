    /**
     * ============================================================================
     * ✅ SCRIPT DE VERIFICACIÓN DE CONFIGURACIÓN
     * Ejecuta: node src/config/verify.js
     * Comprueba que las variables de entorno, constantes y estructura básica estén correctas.
     * El script verifica:
     * 1. Variables de entorno necesarias.
     * 2. Presencia de archivos de constantes clave.
     * 3. Estructura básica de carpetas.
     * Si todo está correcto, muestra un mensaje de éxito.
     * Si faltan elementos, indica qué debe corregirse.
     * este archivo esta alojado en: src/config/verify.js
     * fue editado por última vez: 5 de diciembre de 2025
     * =============================================================================
     */

    require('dotenv').config();

    const requiredEnvVars = [
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'PORT'
    ];

    console.log('🔍 Verificando configuración...\n');

    let allGood = true;

    // ========================================
    // 1. VERIFICAR VARIABLES DE ENTORNO
    // ========================================
    console.log('📋 Variables de entorno:');
    console.log('─'.repeat(50));

    requiredEnvVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`✅ ${varName}: Configurado`);
    } else {
        console.log(`❌ ${varName}: FALTA`);
        allGood = false;
    }
    });

    // ========================================
    // 2. VERIFICAR CONSTANTES (si existen)
    // ========================================
    console.log('\n📋 Verificando constantes:');
    console.log('─'.repeat(50));

    try {
    // Intentar cargar roles
    const rolesModule = require('../constants/roles');
    console.log(`✅ ROLES: ${Object.keys(rolesModule.ROLES).length} roles encontrados`);
    console.log(`   → ${Object.values(rolesModule.ROLES).join(', ')}`);
    } catch (error) {
    console.log(`⚠️  ROLES: Archivo no encontrado (crear src/constants/roles.js)`);
    }

    try {
    // Intentar cargar errores
    const errorsModule = require('../constants/errors');
    console.log(`✅ ERROR_CODES: ${Object.keys(errorsModule.ERROR_CODES).length} códigos encontrados`);
    } catch (error) {
    console.log(`⚠️  ERROR_CODES: Archivo no encontrado (crear src/constants/errors.js)`);
    }

    try {
    // Intentar cargar estados
    const estadosModule = require('../constants/estados');
    console.log(`✅ ESTADOS: Módulo cargado correctamente`);
    } catch (error) {
    console.log(`⚠️  ESTADOS: Archivo no encontrado (crear src/constants/estados.js)`);
    }

    // ========================================
    // 3. VERIFICAR ESTRUCTURA DE CARPETAS
    // ========================================
    console.log('\n📁 Verificando estructura:');
    console.log('─'.repeat(50));

    const fs = require('fs');
    const path = require('path');

    const requiredDirs = [
    'src/config',
    'src/constants',
    'src/middlewares',
    'src/routes',
    'src/utils',
    'src/validators'
    ];

    requiredDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
        console.log(`✅ ${dir}`);
    } else {
        console.log(`❌ ${dir} (no existe)`);
    }
    });

    // ========================================
    // RESULTADO FINAL
    // ========================================
    console.log('\n' + '='.repeat(50));
    if (allGood) {
    console.log('✅ ¡CONFIGURACIÓN BASE CORRECTA!');
    console.log('💡 Ahora puedes crear los archivos de constantes');
    } else {
    console.log('❌ FALTAN VARIABLES DE ENTORNO');
    console.log('💡 Revisa tu archivo .env');
    process.exit(1);
    }

    console.log('='.repeat(50));