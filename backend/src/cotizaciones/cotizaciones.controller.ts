// src/cotizaciones/cotizaciones.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CotizacionesService } from './cotizaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService) {}

  // Pública — lista de servicios para cotizar
  @Get('servicios')
  async getServicios() {
    const data = await this.cotizacionesService.getServicios();
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const data = await this.cotizacionesService.findAll();
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    const data = await this.cotizacionesService.create({ ...body, Id_usuario: req.user.id });
    return { success: true, data };
  }

  @Post('sincronizar')
  @UseGuards(JwtAuthGuard)
  async sincronizar(@Body('items') items: any[], @Req() req: any) {
    const data = await this.cotizacionesService.sincronizar(items, req.user.id);
    return { success: true, sincronizados: data.length, data };
  }
}
