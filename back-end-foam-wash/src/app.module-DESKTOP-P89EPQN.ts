import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Importación del Servicio de Base de Datos
import { PrismaService } from './prisma/prisma.service';

// Importación de todos los Módulos migrados

import { ReservasModule } from './reservas/reservas.module';
import { EstadisticasModule } from './estadisticas/estadisticas.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ServiciosModule } from './servicios/servicios.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { ClientesModule } from './clientes/clientes.module';
import { AuthModule } from './auth/auth.module'; 
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    AuthModule,
    ReservasModule,
    EstadisticasModule,
    NotificacionesModule,
    ServiciosModule,
    EmpleadosModule,
    ClientesModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService, 
    PrismaService // Hacemos que Prisma esté disponible en toda la aplicación
  ],
})
export class AppModule {}