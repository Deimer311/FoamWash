    /**
     * 🧪 SCRIPT DE PRUEBA DE UTILIDADES
     * -------------------------------------------------------------------------
     * Ejecuta: node src/utils/test-utils.js
     * -------------------------------------------------------------------------
     * Este script prueba todas las funciones de utilidades
     * sin necesidad de levantar el servidor.
     */

    require('dotenv').config();

    const { hashPassword, comparePassword, validatePasswordStrength, generateRandomPassword } = require('./password.util');
    const { generateAccessToken, verifyToken, getTokenExpiration, generateTokenPair } = require('./jwt.util');

    console.log('🧪 INICIANDO PRUEBAS DE UTILIDADES\n');
    console.log('='.repeat(50));
    // ========================================
    // PRUEBA 1: Password Utilities
    // ========================================
    async function testPasswordUtils() {
    console.log('\n📝 PRUEBA 1: Utilidades de Contraseñas');
    console.log('-'.repeat(50));
    
    try {
        // Test 1.1: Hashear contraseña
        const plainPassword = 'MiContraseña123';
        console.log(`\n✓ Contraseña original: ${plainPassword}`);
        
        const hashed = await hashPassword(plainPassword);
        console.log(`✓ Contraseña hasheada: ${hashed.substring(0, 30)}...`);
        
        // Test 1.2: Comparar contraseñas
        const isValid = await comparePassword(plainPassword, hashed);
        console.log(`✓ Comparación correcta: ${isValid}`);
        
        const isInvalid = await comparePassword('OtraContraseña', hashed);
        console.log(`✓ Comparación incorrecta: ${!isInvalid}`);
        
        // Test 1.3: Validar fortaleza
        const validation1 = validatePasswordStrength('abc');
        console.log(`\n✓ Validación "abc": ${JSON.stringify(validation1, null, 2)}`);
        
        const validation2 = validatePasswordStrength('MiContraseñaSegura123');
        console.log(`✓ Validación "MiContraseñaSegura123": ${JSON.stringify(validation2, null, 2)}`);
        
        // Test 1.4: Generar contraseña aleatoria
        const randomPass = generateRandomPassword(16);
        console.log(`\n✓ Contraseña aleatoria generada (16 chars): ${randomPass}`);
        
        console.log('\n✅ Todas las pruebas de password pasaron correctamente');
        
    } catch (error) {
        console.error('❌ Error en pruebas de password:', error.message);
    }
    }

    // ========================================
    // PRUEBA 2: JWT Utilities
    // ========================================
    async function testJWTUtils() {
    console.log('\n📝 PRUEBA 2: Utilidades de JWT');
    console.log('-'.repeat(50));
    
    try {
        // Test 2.1: Generar access token
        const payload = {
        id: 'test-uuid-123',
        email: 'test@ejemplo.com',
        role: 'cliente'
        };
        
        console.log(`\n✓ Payload original:`, payload);
        
        const accessToken = generateAccessToken(payload);
        console.log(`✓ Access Token generado: ${accessToken.substring(0, 50)}...`);
        
        // Test 2.2: Verificar token
        const decoded = verifyToken(accessToken);
        console.log(`✓ Token verificado exitosamente:`, {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
        });
        
        // Test 2.3: Información de expiración
        const expInfo = getTokenExpiration(accessToken);
        console.log(`\n✓ Información de expiración:`, {
        expired: expInfo.expired,
        expiresInDays: Math.floor(expInfo.expiresIn / 86400),
        expiresAt: expInfo.expiresAt
        });
        
        // Test 2.4: Generar par de tokens
        const tokens = generateTokenPair(payload);
        console.log(`\n✓ Par de tokens generado:`);
        console.log(`  - Access Token: ${tokens.accessToken.substring(0, 30)}...`);
        console.log(`  - Refresh Token: ${tokens.refreshToken.substring(0, 30)}...`);
        
        // Test 2.5: Verificar refresh token
        const decodedRefresh = verifyToken(tokens.refreshToken, true);
        console.log(`✓ Refresh Token verificado:`, {
        id: decodedRefresh.id,
        type: decodedRefresh.type
        });
        
        console.log('\n✅ Todas las pruebas de JWT pasaron correctamente');
        
    } catch (error) {
        console.error('❌ Error en pruebas de JWT:', error.message);
    }
    }

    // ========================================
    // EJECUTAR TODAS LAS PRUEBAS
    // ========================================
    async function runAllTests() {
    await testPasswordUtils();
    await testJWTUtils();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
    console.log('='.repeat(50));
    }

    // Ejecutar
    runAllTests();