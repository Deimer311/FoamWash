  // src/usuarios/usuarios.controller.ts
  import { Controller, Get, Put, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
  import { UsuariosService } from './usuarios.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { SelfOrAdminGuard } from '../common/guards/self-or-admin.guard';
  import { Roles } from '../common/decorators/roles.decorator';

  @Controller('usuarios') // → /api/usuarios
  @UseGuards(JwtAuthGuard)
  export class UsuariosController {
    constructor(private usuariosService: UsuariosService) {}

    // Solo admin puede listar todos los usuarios
    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin')
    async findAll() {
      const data = await this.usuariosService.findAll();
      return { success: true, count: data.length, data };
    }

    // Solo admin puede ver analytics
    @Get('analytics/usuarios-por-rol')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async usuariosPorRol() {
      const data = await this.usuariosService.usuariosPorRol();
      return { success: true, data };
    }

    @Get('analytics/empleados-activos')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async empleadosActivos() {
      const data = await this.usuariosService.empleadosActivos();
      return { success: true, data };
    }

    @Get('analytics/historial-cliente/:id')
    @UseGuards(SelfOrAdminGuard)
    async historialCliente(@Param('id', ParseIntPipe) id: number) {
      const data = await this.usuariosService.historialCliente(id);
      return { success: true, data };
    }

    // El propio usuario o un admin pueden ver/editar el perfil
    @Get(':id')
    @UseGuards(SelfOrAdminGuard)
    async findOne(@Param('id', ParseIntPipe) id: number) {
      const data = await this.usuariosService.findOne(id);
      return { success: true, data };
    }

    @Put(':id')
    @UseGuards(SelfOrAdminGuard)
    async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
      const data = await this.usuariosService.update(id, body);
      return { success: true, data };
    }

    // Solo admin puede desactivar usuarios
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    async softDelete(@Param('id', ParseIntPipe) id: number) {
      await this.usuariosService.softDelete(id);
      return { success: true, message: 'Usuario desactivado' };
    }
  }