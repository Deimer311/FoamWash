  // src/servicios/servicios.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiciosService } from './servicios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('servicios') // → /api/servicios
@ApiTags('Servicios')
export class ServiciosController {
  constructor(private serviciosService: ServiciosService) {}

  // Rutas públicas (sin @UseGuards)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los servicios' })
  async findAll() {
    const data = await this.serviciosService.findAll();
    return { success: true, count: data.length, data };
  }

  @Get('analytics/mas-solicitados')
  @ApiOperation({ summary: 'Obtener servicios más solicitados' })
  async masSolicitados() {
    const data = await this.serviciosService.masSolicitados();
    return { success: true, data };
  }

  @Get('analytics/programados-hoy')
  @ApiOperation({ summary: 'Obtener servicios programados para hoy' })
  async programadosHoy() {
    const data = await this.serviciosService.programadosHoy();
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un servicio por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.serviciosService.findOne(id);
    return { success: true, data };
  }

  // Rutas protegidas
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear un nuevo servicio' })
  async create(@Body() body: any) {
    const data = await this.serviciosService.create(body);
    return { success: true, message: 'Servicio creado exitosamente', data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar un servicio' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.serviciosService.update(id, body);
    return { success: true, message: 'Servicio actualizado exitosamente', data };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar un servicio' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.serviciosService.remove(id);
    return { success: true, message: 'Servicio eliminado exitosamente' };
  }
}

// src/servicios/servicios.module.ts