import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  // Obtener notificaciones de un usuario específico
  async getByUserId(userId: number) {
    return this.prisma.notificaciones.findMany({
      where: {
        usuario_Id_Usuario: userId, // Nombre exacto de tu schema
      },
      include: {
        usuario: {
          select: { Nombre: true } // Para traer el nombre como hacía tu INNER JOIN
        }
      },
      orderBy: {
        fecha_notificacion: 'desc',
      },
    });
  }

  // Crear una nueva notificación
  async create(dto: CreateNotificacionDto) {
    return this.prisma.notificaciones.create({
      data: {
        descripcion_notificacion: dto.descripcion_notificacion,
        usuario_Id_Usuario: dto.usuario_Id_Usuario,
      },
    });
  }
}