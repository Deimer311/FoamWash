import { Controller, Get, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { AuthGuard } from '../middlewares/auth.guard';

@Controller('consultas') // Cambié el nombre de la ruta a 'consultas' para que coincida con tu JS
export class EstadisticasController {
  constructor(private readonly statsService: EstadisticasService) {}

  @UseGuards(AuthGuard) // Protegemos las consultas para que solo usuarios logueados las vean
  @Get('usuarios-por-rol')
  async getUsuariosRol() {
    return this.statsService.getUsuariosPorRol();
  }

  @UseGuards(AuthGuard)
  @Get('pendientes')
  async getPendientes() {
    return this.statsService.getReservasPendientes();
  }

  @UseGuards(AuthGuard)
  @Get('agenda-semanal')
  async getAgenda() {
    return this.statsService.getAgendaSemanal();
  }
}

