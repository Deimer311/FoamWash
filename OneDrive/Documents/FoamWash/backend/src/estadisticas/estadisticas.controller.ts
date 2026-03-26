  // src/estadisticas/estadisticas.controller.ts
  import { Controller, Get, UseGuards } from '@nestjs/common';
  import { EstadisticasService } from './estadisticas.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';

  @Controller('estadisticas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  export class EstadisticasController {
    constructor(private estadisticasService: EstadisticasService) {}

    @Get()
    async getDashboard() {
      return this.estadisticasService.getDashboard();
    }
  }

  // src/estadisticas/estadisticas.module.ts — abajo