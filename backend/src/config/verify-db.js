    /**
     * ✅ SCRIPT DE VERIFICACIÓN DE BASE DE DATOS - ADAPTADO
     * 
     * Ejecuta: node src/config/verify-db.js
     */

    require('dotenv').config();
    const { testConnection, pool } = require('./database');

    async function verifyDatabase() {
    console.log('🔍 VERIFICANDO CONEXIÓN Y ESTRUCTURA DE BD\n');
    console.log('='.repeat(50));
    
    // 1. Probar conexión
    const connected = await testConnection();
    if (!connected) {
        console.log('\n❌ No se pudo conectar a la base de datos');
        console.log('💡 Verifica:');
        console.log('  - XAMPP está corriendo');
        console.log('  - MySQL está activo');
        console.log('  - Credenciales en .env son correctas');
        process.exit(1);
    }
    
    console.log('\n📋 Verificando estructura de tabla usuario:');
    console.log('-'.repeat(50));
    
    try {
        // 2. Verificar columnas de la tabla usuario
        const [columns] = await pool.query('DESCRIBE usuario');
        
        const requiredColumns = [
        'Id_Usuario',
        'Nombre',
        'Correo',
        'password_hash',
        'rol_Id_Rol',
        'last_login',
        'reset_token',
        'reset_token_expires',
        'estado'
        ];
        
        requiredColumns.forEach(col => {
        const exists = columns.some(c => c.Field === col);
        console.log(exists ? `✅ ${col}` : `❌ ${col} (FALTA)`);
        });
        
        // 3. Verificar tabla de roles
        console.log('\n📋 Verificando tabla de roles:');
        console.log('-'.repeat(50));
        
        const [roles] = await pool.query('SELECT Id_Rol, Rol FROM rol');
        console.log(`✅ Roles encontrados: ${roles.length}\n`);
        
        if (roles.length === 0) {
        console.log('⚠️  ATENCIÓN: No hay roles en la base de datos');
        console.log('💡 Necesitas insertar los roles básicos:');
        console.log('\nEjecuta esto en phpMyAdmin:');
        console.log('-'.repeat(50));
        console.log(`INSERT INTO rol (Rol) VALUES 
    ('Admin'),
    ('Trabajador'),
    ('Cliente');`);
        console.log('-'.repeat(50));
        } else {
        roles.forEach(rol => {
            console.log(`  - ID ${rol.Id_Rol}: ${rol.Rol}`);
        });
        
        // Verificar roles necesarios
        console.log('\n🔍 Verificando roles requeridos:');
        console.log('-'.repeat(50));
        
        const rolesRequeridos = ['admin', 'trabajador', 'cliente'];
        
        rolesRequeridos.forEach(rolRequerido => {
            const existe = roles.some(rol => 
            rol.Rol.toLowerCase() === rolRequerido
            );
            
            if (existe) {
            const rolData = roles.find(r => r.Rol.toLowerCase() === rolRequerido);
            console.log(`✅ ${rolRequerido} (ID: ${rolData.Id_Rol})`);
            } else {
            console.log(`❌ ${rolRequerido} (FALTA)`);
            }
        });
        }
        
        // 4. Contar usuario existentes
        console.log('\n📊 Estadísticas de usuario:');
        console.log('-'.repeat(50));
        
        const [userCount] = await pool.query(
        'SELECT COUNT(*) as total FROM usuario'
        );
        console.log(`Total de usuario: ${userCount[0].total}`);
        
        const [activeCount] = await pool.query(
        'SELECT COUNT(*) as total FROM usuario WHERE estado = "activo"'
        );
        console.log(`usuario activos: ${activeCount[0].total}`);
        
        // 5. Verificar si hay algún admin
        const [adminCount] = await pool.query(
        `SELECT COUNT(*) as total 
        FROM usuario u 
        INNER JOIN rol r ON u.rol_Id_Rol = r.Id_Rol 
        WHERE LOWER(r.Rol) = 'admin' AND u.estado = 'activo'`
        );
        console.log(`Administradores activos: ${adminCount[0].total}`);
        
        if (adminCount[0].total === 0) {
        console.log('\n⚠️  ADVERTENCIA: No hay administradores en el sistema');
        console.log('💡 Deberás crear un usuario admin después de implementar el registro');
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ VERIFICACIÓN COMPLETADA');
        console.log('='.repeat(50));
        
        console.log('\n📝 Próximos pasos:');
        console.log('  1. Si faltan roles, insértalos en phpMyAdmin');
        console.log('  2. Continuar con la implementación de autenticación');
        console.log('  3. Crear tu primer usuario admin después del registro');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
    }

    verifyDatabase();