import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import type { Pool } from 'mysql2/promise';

@Injectable()
export class DatabaseVerifyService implements OnModuleInit {
  private readonly logger = new Logger('DatabaseVerify');

  constructor(@Inject('DATABASE_POOL') private readonly pool: Pool) {}

  // Se ejecuta automáticamente al arrancar la app
  async onModuleInit() {
    await this.verifyDatabase();
  }

  async verifyDatabase() {
    this.logger.log('🔍 INICIANDO VERIFICACIÓN DE ESTRUCTURA DE BD');
    console.log('='.repeat(50));

    try {
      // 1. Verificar columnas de la tabla usuario
      const [columns]: any = await this.pool.query('DESCRIBE usuario');
      
      const requiredColumns = [
        'Id_Usuario', 'Nombre', 'Correo', 'password_hash', 
        'rol_Id_Rol', 'last_login', 'reset_token', 
        'reset_token_expires', 'estado'
      ];

      this.logger.log('📋 Verificando columnas en tabla "usuario":');
      requiredColumns.forEach(col => {
        const exists = columns.some((c: any) => c.Field === col);
        console.log(exists ? `  ✅ ${col}` : `  ❌ ${col} (FALTA)`);
      });

      // 2. Verificar tabla de roles
      console.log('\n📋 Verificando tabla de roles:');
      const [roles]: any = await this.pool.query('SELECT Id_Rol, Rol FROM rol');
      this.logger.log(`Roles encontrados: ${roles.length}`);

      if (roles.length === 0) {
        this.logger.warn('⚠️ ATENCIÓN: No hay roles en la base de datos');
        console.log('Ejecuta en tu SQL: INSERT INTO rol (Rol) VALUES ("Admin"), ("Trabajador"), ("Cliente");');
      } else {
        const rolesRequeridos = ['admin', 'trabajador', 'cliente'];
        rolesRequeridos.forEach(req => {
          const existe = roles.some((r: any) => r.Rol.toLowerCase() === req);
          console.log(existe ? `  ✅ Rol: ${req}` : `  ❌ Rol: ${req} (FALTA)`);
        });
      }

      // 3. Estadísticas rápidas
      console.log('\n📊 Estadísticas:');
      const [stats]: any = await this.pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM usuario) as total,
          (SELECT COUNT(*) FROM usuario WHERE estado = 'activo') as activos,
          (SELECT COUNT(*) FROM usuario u INNER JOIN rol r ON u.rol_Id_Rol = r.Id_Rol WHERE LOWER(r.Rol) = 'admin') as admins
      `);

      console.log(`  Total usuarios: ${stats[0].total}`);
      console.log(`  Usuarios activos: ${stats[0].activos}`);
      console.log(`  Admins activos: ${stats[0].admins}`);

      if (stats[0].admins === 0) {
        this.logger.error('❌ ADVERTENCIA: No existe ningún administrador activo.');
      }

      console.log('='.repeat(50));
      this.logger.log('✅ VERIFICACIÓN COMPLETADA');

    } catch (error) {
      this.logger.error(`❌ Error en verificación: ${error.message}`);
    }
  }
}