// src/estadisticas/estadisticas.module.ts
import { Module } from '@nestjs/common';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ controllers: [EstadisticasController], providers: [EstadisticasService, RolesGuard] })
export class EstadisticasModule {}
