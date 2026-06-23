// src/app.module.ts
// ============================================================
// MÓDULO RAÍZ — Reemplaza el index.js donde se registraban todas las rutas
// ============================================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ReservasModule } from './reservas/reservas.module';
import { ServiciosModule } from './servicios/servicios.module';
import { CotizacionesModule } from './cotizaciones/cotizaciones.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { ConsultasModule } from './consultas/consultas.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [
    // Variables de entorno disponibles globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Servir archivos estáticos (carpeta uploads) — igual que antes
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Módulo de Prisma (conexión a la BD)
    PrismaModule,

    // Módulos de la aplicación (cada uno agrupa rutas + lógica)
    AuthModule,
    UsuariosModule,
    ReservasModule,
    ServiciosModule,
    CotizacionesModule,
    EmpleadosModule,
    ClientesModule,
    ConsultasModule,
    EstadisticasModule,
    NotificacionesModule,
  ],
})
export class AppModule {}
