// src/estadisticas/estadisticas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [totalClientes, totalReservas, reservasCompletadas, reservasPendientes, ingresos, totalServicios] =
      await Promise.all([
        this.prisma.usuario.count({ where: { rol_Id_Rol: 3 } }),
        this.prisma.reserva.count(),
        this.prisma.reserva.count({ where: { Estado: 'Completado' } }),
        this.prisma.reserva.count({ where: { Estado: 'Pendiente' } }),
        this.prisma.cotizacion.aggregate({ _sum: { Precio_cotizado: true } }),
        this.prisma.servicio.count(),
      ]);

    return {
      Total_Clientes: totalClientes,
      Total_Reservas: totalReservas,
      Reservas_Completadas: reservasCompletadas,
      Reservas_Pendientes: reservasPendientes,
      Ingresos_Totales: ingresos._sum.Precio_cotizado || 0,
      Servicios_Ofrecidos: totalServicios,
    };
  }
}
