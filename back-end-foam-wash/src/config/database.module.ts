import { Module, Global } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import { ConfigService } from '@nestjs/config';
import { DatabaseVerifyService } from './database-verify.service';

// Recordar registrar estos archivos en la AppModule o databasemodule, ejemplo gemini marlon

@Global() // Lo hacemos global para no tener que importarlo en cada módulo
@Module({
  providers: [
    {
      provide: 'DATABASE_POOL',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pool = mysql.createPool({
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 3306),
          user: configService.get<string>('DB_USER', 'root'),
          password: configService.get<string>('DB_PASSWORD', ''),
          database: configService.get<string>('DB_NAME', 'foam_wash_db'),
          waitForConnections: true,
          connectionLimit: configService.get<number>('DB_QUEUE_LIMIT', 10),
          timezone: 'Z',
          charset: 'utf8mb4',
          enableKeepAlive: true,
        });

        // Test de conexión (Tu lógica de validación)
        try {
          const connection = await pool.getConnection();
          console.log('✅ Conexión a MySQL exitosa (NestJS Pool)');
          connection.release();
        } catch (error) {
          console.error('❌ Error de conexión a MySQL:', error.message);
        }

        return pool;
      },
    },
  ],
  exports: ['DATABASE_POOL'],
})
export class DatabaseModule {}