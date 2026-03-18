// src/notificaciones/notificaciones.controller.ts
import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  @Get(':userId')
  async findByUsuario(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.notificacionesService.findByUsuario(userId);
    return { success: true, data };
  }
}
