import { Controller, Get, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { AuthGuard } from '../middlewares/auth.guard';

@Controller('usuarios')
@UseGuards(AuthGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  async getAll() {
    return this.clientesService.findAll();
  }

  @Get(':id/historial')
  async getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.getHistorialCompleto(id);
  }

  @Delete(':id')
  async softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.clientesService.remove(id);
  }
}