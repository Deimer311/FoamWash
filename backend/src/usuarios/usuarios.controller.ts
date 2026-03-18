// src/usuarios/usuarios.controller.ts
import { Controller, Get, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('usuarios') // → /api/usuarios
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @Roles('admin')
  async findAll() {
    const data = await this.usuariosService.findAll();
    return { success: true, count: data.length, data };
  }

  @Get('analytics/usuarios-por-rol')
  @Roles('admin')
  async usuariosPorRol() {
    const data = await this.usuariosService.usuariosPorRol();
    return { success: true, data };
  }

  @Get('analytics/empleados-activos')
  @Roles('admin')
  async empleadosActivos() {
    const data = await this.usuariosService.empleadosActivos();
    return { success: true, data };
  }

  @Get('analytics/historial-cliente/:id')
  async historialCliente(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usuariosService.historialCliente(id);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usuariosService.findOne(id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.usuariosService.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('admin')
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.softDelete(id);
    return { success: true, message: 'Usuario desactivado' };
  }
}
