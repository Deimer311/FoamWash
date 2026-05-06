// src/empleados/empleados.controller.ts
import {
  Controller, Get, Post, Param, UseGuards,
  ParseIntPipe, UploadedFile, UseInterceptors, Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmpleadosService } from './empleados.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('empleados') // → /api/empleados
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'empleado') // Administradores y empleados pueden acceder
@ApiTags('Empleados')
export class EmpleadosController {
  constructor(private empleadosService: EmpleadosService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los empleados' })
  async findAll() {
    const data = await this.empleadosService.findAll();
    return { success: true, data };
  }

  @Get('sin-servicios')
  @ApiOperation({ summary: 'Obtener empleados sin servicios' })
  async sinServicios() {
    const data = await this.empleadosService.getSinServicios();
    return { success: true, data };
  }

  @Get('servicios-finalizados')
  @ApiOperation({ summary: 'Obtener servicios finalizados' })
  async serviciosFinalizados() {
    const data = await this.empleadosService.getServiciosFinalizados();
    return { success: true, data };
  }

  @Get('productividad/general')
  @ApiOperation({ summary: 'Obtener productividad general' })
  async productividadGeneral() {
    const data = await this.empleadosService.getProductividadGeneral();
    return { success: true, data };
  }

  @Get(':id/servicios-hoy')
  @ApiOperation({ summary: 'Obtener servicios de hoy del empleado' })
  async serviciosHoy(@Param('id', ParseIntPipe) id: number) {
    const data = await this.empleadosService.getReservasHoy(id);
    return { success: true, data, total: data.length };
  }

  @Get(':id/agenda-semanal')
  @ApiOperation({ summary: 'Obtener agenda semanal del empleado' })
  async agendaSemanal(@Param('id', ParseIntPipe) id: number) {
    const data = await this.empleadosService.getReservasSemana(id);
    return { success: true, data, total: data.length };
  }

  @Post(':id/foto')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (req, file, cb) => {
          const uniqueName = `empleado-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Actualizar foto del empleado' })
  async updateFoto(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) return { success: false, message: 'No se subió ninguna imagen' };
    const fotoUrl = `/uploads/perfiles/${file.filename}`;
    const data = await this.empleadosService.updateFoto(id, fotoUrl);
    return { success: true, data };
  }
}