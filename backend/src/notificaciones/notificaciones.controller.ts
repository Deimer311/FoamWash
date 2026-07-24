// src/notificaciones/notificaciones.controller.ts
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
@ApiTags('Notificaciones')
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener notificaciones del usuario (últimas 72 horas)' })
  async findByUsuario(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.notificacionesService.findByUsuario(userId);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear notificación en la base de datos' })
  async crear(@Body() body: { usuario_Id_Usuario: number; descripcion_notificacion: string }) {
    const data = await this.notificacionesService.crear(body);
    return { success: true, data };
  }

  @Delete('limpiar-antiguas')
  @ApiOperation({ summary: 'Eliminar notificaciones con más de 72 horas de antigüedad' })
  async limpiarAntiguas() {
    const result = await this.notificacionesService.limpiarNotificacionesAntiguas();
    return { success: true, count: result.count, message: 'Notificaciones antiguas purgadas' };
  }
}