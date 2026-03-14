import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  // 1. Usuarios por rol (Usando GroupBy)
  async getUsuariosPorRol() {
    // Nota: Si tu modelo 'usuario' tiene una relación con 'rol'
    return this.prisma.usuario.groupBy({
      by: ['rol_Id_Rol'],
      _count: {
        Id_Usuario: true,
      },
    });
    // Si necesitas el NOMBRE del rol, el $queryRaw que tienes es más directo, 
    // pero esta es la forma "Prisma-way".
  }

  // 4. Reservas pendientes
  async getReservasPendientes() {
    return this.prisma.reserva.findMany({
      where: {
        Estado: 'Pendiente',
      },
      select: {
        ID_Reserva: true,
        fecha: true,
        Hora: true,
        usuario: {
          select: { Nombre: true },
        },
      },
    });
  }

  // 10. Agenda Semanal (Rango de fechas)
  async getAgendaSemanal() {
    const hoy = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoy.getDate() + 7);

    return this.prisma.reserva.findMany({
      where: {
        fecha: {
          gte: hoy,
          lte: proximaSemana,
        },
      },
      include: {
        usuario: { select: { Nombre: true } },
        servicio: { select: { Nombre_Servicio: true } },
      },
      orderBy: [
        { fecha: 'asc' },
        { Hora: 'asc' },
      ],
    });
  }
}