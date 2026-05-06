// src/cotizaciones/cotizaciones.controller.ts
import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CotizacionesService } from './cotizaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('cotizaciones')
@ApiTags('Cotizaciones')
export class CotizacionesController {
  constructor(private cotizacionesService: CotizacionesService) {}

  // Pública — lista de servicios para cotizar
  @Get('servicios')
  @ApiOperation({ summary: 'Obtener lista de servicios para cotizar' })
  async getServicios() {
    const data = await this.cotizacionesService.getServicios();
    return { success: true, data };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener todas las cotizaciones' })
  async findAll() {
    const data = await this.cotizacionesService.findAll();
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva cotización' })
  async create(@Body() body: any, @Req() req: any) {
    const data = await this.cotizacionesService.create({ ...body, Id_usuario: req.user.id });
    return { success: true, data };
  }

  @Post('sincronizar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sincronizar cotizaciones' })
  async sincronizar(@Body('items') items: any[], @Req() req: any) {
    const data = await this.cotizacionesService.sincronizar(items, req.user.id);
    return { success: true, sincronizados: data.length, data };
  }
}