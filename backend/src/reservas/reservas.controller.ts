// src/reservas/reservas.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Param, Body, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ReservasService } from './reservas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('reservas') // → /api/reservas
@UseGuards(JwtAuthGuard)
@ApiTags('Reservas')
@ApiBearerAuth()
export class ReservasController {
  constructor(private reservasService: ReservasService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  async findAll() {
    const data = await this.reservasService.findAll();
    return { success: true, data };
  }

  // Reservas de un cliente específico
  @Get('cliente/:id')
  @ApiOperation({ summary: 'Obtener reservas de un cliente por su ID' })
  async findByCliente(@Param('id', ParseIntPipe) id: number) {
    const data = await this.reservasService.findByCliente(id);
    return { success: true, data };
  }

  @Get('estado/:estado')
  @ApiOperation({ summary: 'Obtener reservas por estado' })
  async findByEstado(@Param('estado') estado: string) {
    const data = await this.reservasService.findByEstado(estado);
    return { success: true, data };
  }

  @Get('cliente/:id')
  @ApiOperation({ summary: 'Obtener reservas de un cliente' })
  async findByCliente(@Param('id', ParseIntPipe) id: number) {
    const data = await this.reservasService.findByCliente(id);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.reservasService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiBody({
    schema: {
      example: {
        "fecha": "2024-12-24",
        "Hora": "14:30",
        "Informacion_adicional": "Lavado con cera por favor",
        "servicios": [
          { "Id_Servicio": 1, "cantidad": 1, "tamano": "Automovil" }
        ]
      }
    }
  })
  async create(@Req() req: any, @Body() body: any) {
    // Inyectar el Id_Usuario del token JWT al cuerpo de la petición
    // req.user viene del JwtAuthGuard y contiene 'id' según jwt.strategy.ts
    const userId = req.user?.id;
    if (userId && !body.Id_Usuario) {
      body.Id_Usuario = userId;
    }
    const data = await this.reservasService.create(body);
    return { success: true, message: 'Reserva creada exitosamente', data };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una reserva' })
  @ApiBody({ schema: { example: { "Estado": "Confirmado", "Informacion_adicional": "Llegaré 10 mins tarde" } } })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const data = await this.reservasService.update(id, body);
    return { success: true, message: 'Reserva actualizada exitosamente', data };
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Actualizar estado de la reserva' })
  @ApiBody({ schema: { example: { "estado": "En Camino" } } })
  async updateEstado(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: string) {
    const data = await this.reservasService.updateEstado(id, estado);
    return { success: true, message: 'Estado actualizado', data };
  }

  @Delete(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una reserva con motivo' })
  @ApiBody({ schema: { example: { "motivo": "El cliente canceló por lluvia" } } })
  async cancelarReserva(@Param('id', ParseIntPipe) id: number, @Body('motivo') motivo: string) {
    if (!motivo) motivo = 'Cancelado por el administrador sin especificar motivo';
    const data = await this.reservasService.cancelarReserva(id, motivo);
    return { success: true, message: 'Reserva cancelada y correo enviado', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una reserva' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.reservasService.remove(id);
    return { success: true, message: 'Reserva eliminada exitosamente' };
  }
}