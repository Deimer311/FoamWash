// src/notificaciones/notificaciones.controller.ts
import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
@ApiTags('Notificaciones')
export class NotificacionesController {
  constructor(private notificacionesService: NotificacionesService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Obtener notificaciones del usuario' })
  async findByUsuario(@Param('userId', ParseIntPipe) userId: number) {
    const data = await this.notificacionesService.findByUsuario(userId);
    return { success: true, data };
  }
}