// src/estadisticas/estadisticas.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EstadisticasService } from './estadisticas.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // Solo administradores pueden acceder a estas rutas

@ApiTags('Estadísticas')
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  async getDashboard() {
    return this.estadisticasService.getDashboard();
  }
}

// src/estadisticas/estadisticas.module.ts — abajo