  // src/servicios/servicios.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ServiciosService } from './servicios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const UPLOADS_PATH = join(process.cwd(), 'uploads', 'servicios');

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
  @ApiBody({ schema: { example: { "Nombre_Servicio": "Lavado Premium", "Descripcion": "Lavado y encerado", "Precio": 25000, "Duracion": 60, "Imagen_URL": "" } } })
  async create(@Body() body: any) {
    const data = await this.serviciosService.create(body);
    return { success: true, message: 'Servicio creado exitosamente', data };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Actualizar un servicio' })
  @ApiBody({ schema: { example: { "Precio": 30000, "Duracion": 75 } } })
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

  @Post(':id/imagen')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subir imagen de un servicio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imagen: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: diskStorage({
        destination: UPLOADS_PATH,
        filename: (req, file, cb) => {
          const srvId = req.params?.id ?? 'srv';
          const uniqueName = `servicio-${srvId}-${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadImagen(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No se subió ningún archivo');
    const url = `/uploads/servicios/${file.filename}`;
    await this.serviciosService.update(id, { imagen_url: url });
    return { success: true, url };
  }
}

// src/servicios/servicios.module.ts