// src/reservas/reservas.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reservas') // → /api/reservas
@UseGuards(JwtAuthGuard)
export class ReservasController {
  constructor(private reservasService: ReservasService) {}

  @Get()
  async findAll() {
    const data = await this.reservasService.findAll();
    return { success: true, data };
  }

  @Get('estado/:estado')
  async findByEstado(@Param('estado') estado: string) {
    const data = await this.reservasService.findByEstado(estado);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.reservasService.findOne(id);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any) {
    const data = await this.reservasService.create(body);
    return { success: true, message: 'Reserva creada exitosamente', data };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.reservasService.update(id, body);
    return { success: true, message: 'Reserva actualizada exitosamente', data };
  }

  @Patch(':id/estado')
  async updateEstado(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: string) {
    const data = await this.reservasService.updateEstado(id, estado);
    return { success: true, message: 'Estado actualizado', data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.reservasService.remove(id);
    return { success: true, message: 'Reserva eliminada exitosamente' };
  }
}
