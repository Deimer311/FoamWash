// src/clientes/clientes.controller.ts
import { Controller, Get, Put, Post, Param, Body, UseGuards, ParseIntPipe, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('clientes')
@UseGuards(JwtAuthGuard)
export class ClientesController {
  constructor(private clientesService: ClientesService) {}

  @Get(':id/perfil')
  async getPerfil(@Param('id', ParseIntPipe) id: number) {
    const data = await this.clientesService.getPerfil(id);
    return { success: true, data };
  }

  @Put(':id/perfil')
  async updatePerfil(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.clientesService.updatePerfil(id, body);
    return { success: true, data };
  }

  @Post(':id/foto')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: './uploads/perfiles',
        filename: (req, file, cb) => cb(null, `cliente-${Date.now()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateFoto(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) return { success: false, message: 'No se subió ningún archivo' };
    const fotoUrl = `/uploads/perfiles/${file.filename}`;
    const data = await this.clientesService.updateFoto(id, fotoUrl);
    return { success: true, data };
  }

  @Get('tipos-documento')
  async getTiposDocumento() {
    const data = await this.clientesService.getTiposDocumento();
    return { success: true, data };
  }
}

