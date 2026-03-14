import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { AuthGuard } from '../middlewares/auth.guard';

@Controller('reservas')
@UseGuards(AuthGuard)
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get()
  findAll() {
    return this.reservasService.findAll();
  }

  @Get('estado/:estado')
  findByEstado(@Param('estado') estado: string) {
    return this.reservasService.findByEstado(estado);
  }

  @Post()
  create(@Body() dto: CreateReservaDto) {
    return this.reservasService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body('estado') estado: string) {
    return this.reservasService.updateEstado(id, estado);
  }
}