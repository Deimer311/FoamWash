import { Module } from '@nestjs/common';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { PrismaModule } from '../prisma/prisma.module'; // O la ruta a tu PrismaModule

@Module({
  imports: [PrismaModule], // 1. Importa el módulo que tiene el PrismaService
  controllers: [EstadisticasController], // 2. Registra el Controller
  providers: [EstadisticasService], // 3. ¡IMPORTANTE! Registra el Service aquí
})
export class EstadisticasModule {}