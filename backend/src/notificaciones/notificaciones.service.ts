// src/notificaciones/notificaciones.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async findByUsuario(userId: number) {
    return this.prisma.notificacion.findMany({
      where: { usuario_Id_Usuario: userId },
      include: { usuario: { select: { Nombre: true } } },
      orderBy: { fecha_notificacion: 'desc' },
    });
  }
}
