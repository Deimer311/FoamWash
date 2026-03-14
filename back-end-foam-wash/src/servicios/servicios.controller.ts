import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';
import { AuthGuard } from '../middlewares/auth.guard';

@Controller('cotizaciones')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  // GET /api/cotizaciones/servicios (Público)
  @Get('servicios')
  async getPublic() {
    return this.serviciosService.getServiciosPublicos();
  }

  // POST /api/cotizaciones (Privado)
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() dto: CreateCotizacionDto) {
    return this.serviciosService.createCotizacion(dto);
  }

  // GET /api/cotizaciones (Solo Admin)
  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    return this.serviciosService.getAllCotizaciones();
  }
}