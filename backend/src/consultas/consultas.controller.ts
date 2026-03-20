  // src/consultas/consultas.controller.ts
  import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
  import { ConsultasService } from './consultas.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';

  @Controller('consultas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  export class ConsultasController {
    constructor(private consultasService: ConsultasService) {}

    @Get('1-usuarios-por-rol')
    async c1() {
      const data = await this.consultasService.usuariosPorRol();
      return { success: true, consulta: 1, data };
    }

    @Get('2-servicios-disponibles')
    async c2() {
      const data = await this.consultasService.serviciosDisponibles();
      return { success: true, consulta: 2, data };
    }

    @Get('3-servicios-por-cliente')
    async c3() {
      const data = await this.consultasService.serviciosPorCliente();
      return { success: true, consulta: 3, data };
    }

    @Get('4-agenda-empleado/:id')
    async c4(@Param('id', ParseIntPipe) id: number) {
      const data = await this.consultasService.agendaEmpleado(id);
      return { success: true, consulta: 4, data };
    }

    @Get('5-clientes-semana')
    async c5() {
      const data = await this.consultasService.clientesSemana();
      return { success: true, consulta: 5, data };
    }

    @Get('6-reservas-por-servicio')
    async c6() {
      const data = await this.consultasService.reservasPorServicio();
      return { success: true, consulta: 6, data };
    }

    @Get('7-reservas-por-cliente')
    async c7() {
      const data = await this.consultasService.reservasPorCliente();
      return { success: true, consulta: 7, data };
    }

    @Get('8-empleados-servicios-mes')
    async c8() {
      const data = await this.consultasService.empleadosServiciosMes();
      return { success: true, consulta: 8, data };
    }

    @Get('9-empleados-sin-servicios')
    async c9() {
      const data = await this.consultasService.empleadosSinServicios();
      return { success: true, consulta: 9, data };
    }

    @Get('10-agenda-semanal-completa')
    async c10() {
      const data = await this.consultasService.agendaSemanalCompleta();
      return { success: true, consulta: 10, data };
    }

    @Get('todas')
    async todas() {
      const data = await this.consultasService.todas();
      return { success: true, data };
    }
  }