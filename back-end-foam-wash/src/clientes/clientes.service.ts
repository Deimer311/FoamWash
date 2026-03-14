import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  // GET - Obtener todos los usuarios con su Rol y Tipo de Documento
  async findAll() {
    return this.prisma.usuario.findMany({
      include: {
        rol: true,
        tipo_de_documento: true,
      },
      orderBy: { fecha_registro: 'desc' },
    });
  }

  // GET - Obtener un perfil completo con todo su historial (Migración de la ruta /:id/historial)
  async getHistorialCompleto(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { Id_Usuario: id },
      include: {
        reserva: {
          orderBy: { fecha: 'desc' },
          include: { servicio: true }
        },
        cotizacion: {
          orderBy: { fecha_cotizacion: 'desc' }
        },
        notificaciones: {
          take: 10,
          orderBy: { fecha_notificacion: 'desc' }
        }
      }
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    return {
      success: true,
      data: {
        reservas: usuario.reserva,
        cotizaciones: usuario.cotizacion,
        notificaciones: usuario.notificaciones,
        resumen: {
          total_reservas: usuario.reserva.length,
          total_cotizaciones: usuario.cotizacion.length,
          total_notificaciones: usuario.notificaciones.length
        }
      }
    };
  }

  // DELETE - Desactivar usuario (Borrado lógico como en tu JS)
  async remove(id: number) {
    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data: { estado: 'inactivo' }
    });
  }
}