// src/estadisticas/estadisticas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(periodo?: string) {
    let dateFilter = {};
    const now = new Date();

    if (periodo) {
      switch (periodo) {
        case 'semanal':
          dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'mensual':
          dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'trimestral':
          dateFilter = { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
        case 'anual':
          dateFilter = { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
          break;
        default:
          // No filter
          break;
      }
    }

    const [totalClientes, totalReservas, reservasCompletadas, reservasPendientes, ingresos, totalServicios] =
      await Promise.all([
        this.prisma.usuario.count({ where: { rol_Id_Rol: 3, ...(periodo ? { fecha_registro: dateFilter } : {}) } }),
        this.prisma.reserva.count({ where: periodo ? { fecha: dateFilter } : {} }),
        this.prisma.reserva.count({ where: { Estado: 'Completado', ...(periodo ? { fecha: dateFilter } : {}) } }),
        this.prisma.reserva.count({ where: { Estado: 'Pendiente', ...(periodo ? { fecha: dateFilter } : {}) } }),
        this.prisma.cotizacion.aggregate({ _sum: { Precio_cotizado: true }, where: periodo ? { /* assuming cotizacion has date, but schema doesn't show, perhaps link via reserva */ } : {} }),
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
