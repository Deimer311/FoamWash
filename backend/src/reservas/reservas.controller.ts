// src/reservas/reservas.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('reservas') // → /api/reservas
@UseGuards(JwtAuthGuard)
@ApiTags('Reservas')
export class ReservasController {
  constructor(private reservasService: ReservasService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  async findAll() {
    const data = await this.reservasService.findAll();
    return { success: true, data };
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener reservas por estado' })
  async findByEstado(@Param('estado') estado: string) {
    const data = await this.reservasService.findByEstado(estado);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.reservasService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  async create(@Body() body: any) {
    const data = await this.reservasService.create(body);
    return { success: true, message: 'Reserva creada exitosamente', data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.reservasService.update(id, body);
    return { success: true, message: 'Reserva actualizada exitosamente', data };
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de la reserva' })
  async updateEstado(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: string) {
    const data = await this.reservasService.updateEstado(id, estado);
    return { success: true, message: 'Estado actualizado', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reserva' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.reservasService.remove(id);
    return { success: true, message: 'Reserva eliminada exitosamente' };
  }
}