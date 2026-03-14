import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  // Ejemplo de un método para buscar un usuario
  async findAll() {
    return (this.prisma as any)['usuario'].findMany();
  }
}


