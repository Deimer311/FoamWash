import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstadisticasService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(periodo?: string) {
    const today = new Date();
    let startDate = new Date('2000-01-01'); // Por defecto desde siempre

    if (periodo) {
      switch (periodo.toLowerCase()) {
        case 'semanal':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          break;
        case 'mensual':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'trimestral':
          startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
          break;
        case 'semestral':
          startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
          break;
        case 'anual':
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
      }
    }

    const [totalReservas, reservasCompletadas, reservasPendientes, totalServicios, reservasIngresos] =
      await Promise.all([
        this.prisma.reserva.count({
          where: { fecha: { gte: startDate } }
        }),
        this.prisma.reserva.count({ 
          where: { 
            Estado: { in: ['Completado', 'Finalizado'] },
            fecha: { gte: startDate }
          } 
        }),
        this.prisma.reserva.count({ 
          where: { 
            Estado: { notIn: ['Completado', 'Finalizado', 'Cancelado'] },
            fecha: { gte: startDate }
          } 
        }),
        this.prisma.servicio.count(), // Los servicios no se filtran por fecha
        this.prisma.reserva.findMany({
          where: { fecha: { gte: startDate } },
          include: { servicios: true }
        }),
      ]);

    // Clientes únicos que han reservado en este periodo
    const clientesUnicos = new Set(reservasIngresos.map(r => r.Id_Usuario));
    const totalClientes = clientesUnicos.size;

    // Calcular ingresos totales sumando solo reservas completadas
    const ingresosTotales = reservasIngresos.reduce((sum, res) => {
      if (res.Estado !== 'Completado' && res.Estado !== 'Finalizado') return sum;
      const sumaServicios = res.servicios.reduce((sSum, serv) => sSum + Number(serv.Precio || 0), 0);
      return sum + sumaServicios;
    }, 0);

    return {
      Total_Clientes: totalClientes,
      Total_Reservas: totalReservas,
      Reservas_Completadas: reservasCompletadas,
      Reservas_Pendientes: reservasPendientes,
      Ingresos_Totales: ingresosTotales,
      Servicios_Ofrecidos: totalServicios,
    };
  }
}
