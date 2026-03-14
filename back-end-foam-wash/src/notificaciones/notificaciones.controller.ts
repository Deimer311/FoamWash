import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { AuthGuard } from '../middlewares/auth.guard';

@Controller('notificaciones')
@UseGuards(AuthGuard) // Protegemos las notificaciones con JWT
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get(':userId')
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificacionesService.getByUserId(userId);
  }

  @Post()
  async create(@Body() dto: CreateNotificacionDto) {
    return this.notificacionesService.create(dto);
  }
}