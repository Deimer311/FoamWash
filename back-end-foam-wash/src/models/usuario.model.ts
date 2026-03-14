import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuarioModel {
  // 1. Inyectamos PrismaService en lugar del Pool
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(correo: string) {
    // 2. Usamos la sintaxis de Prisma (mucho más corta y segura)
    return await (this.prisma as any)['usuario'].findFirst({
      where: {
        Correo: correo,
      },
    });
  }

  async findById(id: number) {
   return await (this.prisma as any)['usuario'].findUnique({
      where: {
        Id_Usuario: id,
      },
    });
  }

  // Si algún otro servicio usaba getPool(), ahora debería usar directamente prisma
  getPrisma() {
    return this.prisma;
  }
}