// src/cotizaciones/cotizaciones.controller.ts
import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { Controller, Get, Post, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
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

  // Cotizaciones de un cliente específico
  @Get('cliente/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener cotizaciones de un cliente por su ID' })
  @Get('cliente/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener cotizaciones de un cliente' })
  async findByCliente(@Param('id', ParseIntPipe) id: number) {
    const data = await this.cotizacionesService.findByCliente(id);
    return { success: true, data };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Crear una nueva cotización' })
  @ApiBody({ schema: { example: { "Total": 45000, "servicios": [1, 2] } } })
  async create(@Body() body: any, @Req() req: any) {
    const data = await this.cotizacionesService.create({ ...body, Id_usuario: req.user.id });
    return { success: true, data };
  }

  @Post('sincronizar')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sincronizar cotizaciones' })
  @ApiBody({ schema: { example: { "items": [{ "Id_Servicio": 1, "cantidad": 1 }] } } })
  async sincronizar(@Body('items') items: any[], @Req() req: any) {
    const data = await this.cotizacionesService.sincronizar(items, req.user.id);
    return { success: true, sincronizados: data.length, data };
  }
}