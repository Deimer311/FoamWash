// src/estadisticas/estadisticas.controller.ts
import { Controller, Get } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';

@Controller('estadisticas')
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  @Get()
  async getDashboard() {
    return this.estadisticasService.getDashboard();
  }
}

// src/estadisticas/estadisticas.module.ts — abajo
