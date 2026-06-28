// src/estadisticas/estadisticas.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'periodo', required: false, description: 'semanal, mensual, trimestral, semestral, anual' })
  async getDashboard(@Query('periodo') periodo?: string) {
    return this.estadisticasService.getDashboard(periodo);
  }
}

// src/estadisticas/estadisticas.module.ts — abajo