// src/servicios/servicios.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('servicios') // → /api/servicios
export class ServiciosController {
  constructor(private serviciosService: ServiciosService) {}

  // Rutas públicas (sin @UseGuards)
  @Get()
  async findAll() {
    const data = await this.serviciosService.findAll();
    return { success: true, count: data.length, data };
  }

  @Get('analytics/mas-solicitados')
  async masSolicitados() {
    const data = await this.serviciosService.masSolicitados();
    return { success: true, data };
  }

  @Get('analytics/programados-hoy')
  async programadosHoy() {
    const data = await this.serviciosService.programadosHoy();
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.serviciosService.findOne(id);
    return { success: true, data };
  }

  // Rutas protegidas
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any) {
    const data = await this.serviciosService.create(body);
    return { success: true, message: 'Servicio creado exitosamente', data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.serviciosService.update(id, body);
    return { success: true, message: 'Servicio actualizado exitosamente', data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.serviciosService.remove(id);
    return { success: true, message: 'Servicio eliminado exitosamente' };
  }
}

// src/servicios/servicios.module.ts
