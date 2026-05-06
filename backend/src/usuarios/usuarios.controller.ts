// src/usuarios/usuarios.controller.ts
import {
  Controller, Get, Put, Post, Delete,
  Param, Body, UseGuards, ParseIntPipe,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SelfOrAdminGuard } from '../common/guards/self-or-admin.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

// Ruta absoluta basada en process.cwd() para evitar problemas con CWD relativo en Docker
const UPLOADS_PATH = join(process.cwd(), 'uploads', 'perfiles');

@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@Controller('usuarios') // → /api/usuarios
@UseGuards(JwtAuthGuard)
@Roles('admin')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Listar todos los usuarios (admin)' })
  async findAll() {
    const data = await this.usuariosService.findAll();
    return { success: true, count: data.length, data };
  }

  @Get('analytics/usuarios-por-rol')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Usuarios agrupados por rol (admin)' })
  async usuariosPorRol() {
    const data = await this.usuariosService.usuariosPorRol();
    return { success: true, data };
  }

  @Get('analytics/empleados-activos')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Empleados activos (admin)' })
  async empleadosActivos() {
    const data = await this.usuariosService.empleadosActivos();
    return { success: true, data };
  }

  @Get('analytics/historial-cliente/:id')
  @UseGuards(SelfOrAdminGuard)
  @ApiOperation({ summary: 'Historial de reservas de un cliente' })
  async historialCliente(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usuariosService.historialCliente(id);
    return { success: true, data };
  }

  @Get(':id')
  @UseGuards(SelfOrAdminGuard)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usuariosService.findOne(id);
    return { success: true, data };
  }

  @Put(':id')
  @UseGuards(SelfOrAdminGuard)
  @ApiOperation({ summary: 'Actualizar datos de un usuario' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.usuariosService.update(id, body);
    return { success: true, data };
  }

  @Post(':id/foto')
  @UseGuards(SelfOrAdminGuard)
  @ApiOperation({ summary: 'Subir foto de perfil de un usuario' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        foto: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: UPLOADS_PATH,
        filename: (req, file, cb) => {
          const userId = req.params?.id ?? 'usr';
          const uniqueName = `perfil-${userId}-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  async updateFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      return { success: false, message: 'No se subió ninguna imagen' };
    }
    const fotoUrl = `/uploads/perfiles/${file.filename}`;
    const data = await this.usuariosService.update(id, { foto_perfil: fotoUrl });
    return { success: true, data };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Desactivar (soft delete) un usuario (admin)' })
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    await this.usuariosService.softDelete(id);
    return { success: true, message: 'Usuario desactivado' };
  }
}