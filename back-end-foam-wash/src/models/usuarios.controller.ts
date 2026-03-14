import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
// import { AuthGuard } from '../middlewares/auth.guard'; // Descomenta esto después

@Controller('usuario') // <--- Esto es lo que quita el error 404
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  // @UseGuards(AuthGuard) // Comentado por ahora para probar sin trabas
  async getAll() {
    return this.usuariosService.findAll();
  }
}