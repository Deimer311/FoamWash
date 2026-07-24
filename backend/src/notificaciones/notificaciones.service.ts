// src/notificaciones/notificaciones.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene las notificaciones de un usuario creadas en las últimas 72 horas.
   * Elimina automáticamente las notificaciones más antiguas (> 72 horas).
   */
  async findByUsuario(userId: number) {
    const setentaydosHorasAtras = new Date(Date.now() - 72 * 60 * 60 * 1000);

    // Purga automática de notificaciones antiguas (> 72 horas)
    await this.limpiarNotificacionesAntiguas().catch(e =>
      console.log('Error al limpiar notificaciones antiguas:', e)
    );

    return this.prisma.notificacion.findMany({
      where: {
        usuario_Id_Usuario: userId,
        fecha_notificacion: { gte: setentaydosHorasAtras },
      },
      include: { usuario: { select: { Nombre: true } } },
      orderBy: { fecha_notificacion: 'desc' },
    });
  }

  /**
   * Crea una nueva notificación en la base de datos y ejecuta la purga de notificaciones antiguas.
   */
  async crear(data: { usuario_Id_Usuario: number; descripcion_notificacion: string }) {
    // Validar que el usuario exista antes de crear la notificación
    const usuario = await this.prisma.usuario.findUnique({
      where: { Id_Usuario: data.usuario_Id_Usuario },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${data.usuario_Id_Usuario} no encontrado`);
    }

    // Ejecutar purga rápida de notificaciones expiradas (> 72 horas)
    await this.limpiarNotificacionesAntiguas().catch(() => {});

    return this.prisma.notificacion.create({
      data: {
        usuario_Id_Usuario: data.usuario_Id_Usuario,
        descripcion_notificacion: data.descripcion_notificacion,
        fecha_notificacion: new Date(),
      },
    });
  }

  /**
   * Elimina de la base de datos todas las notificaciones con más de 72 horas de antigüedad.
   */
  async limpiarNotificacionesAntiguas() {
    const setentaydosHorasAtras = new Date(Date.now() - 72 * 60 * 60 * 1000);
    return this.prisma.notificacion.deleteMany({
      where: {
        fecha_notificacion: {
          lt: setentaydosHorasAtras,
        },
      },
    });
  }
}
