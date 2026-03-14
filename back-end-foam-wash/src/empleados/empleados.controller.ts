import { Controller, Get, Put, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { AuthGuard } from '../middlewares/auth.guard';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Controller('empleados')
@UseGuards(AuthGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Get()
  async getAll() {
    return this.empleadosService.findAll();
  }

  @Get(':id/reservas/hoy')
  async getHoy(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.getReservasHoy(id);
  }

  @Put(':id/perfil')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmpleadoDto) {
    return this.empleadosService.updatePerfil(id, dto);
  }
}