import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  // --- [ GET ] --- 
  // Cada mañana a las 8:00 AM CONSULTA los servicios del día
  @Cron('0 8 * * *')
  async handleMorningAlerts() {
    this.logger.log('--- [GET] Revisando servicios programados para hoy ---');
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    // Buscamos (GET) las reservas de hoy
    const reservasHoy = await (this.prisma as any).reserva.findMany({
      where: {
        Fecha: { gte: hoy, lt: mañana },
        Estado: 'Pendiente',
      },
    });

    if (reservasHoy.length > 0) {
      this.logger.log(`Se encontraron ${reservasHoy.length} servicios hoy.`);
      // Aquí llamaríamos a la función POST para notificar
      await this.createNotifications(reservasHoy);
    }
  }

  // --- [ POST ] ---
  // CREA registros de notificación basados en las reservas encontradas
  async createNotifications(reservas: any[]) {
    this.logger.log('--- [POST] Creando notificaciones internas ---');
    
    for (const reserva of reservas) {
      await (this.prisma as any).notificacion.create({
        data: {
          Id_Usuario: reserva.Id_Empleado,
          Mensaje: `Servicio pendiente hoy a las ${reserva.Fecha.toLocaleTimeString()}`,
          Fecha_Envio: new Date(),
          Leido: false,
        },
      });
    }
  }

  // --- [ PUT ] ---
  // ACTUALIZA estados automáticamente cada hora
  @Cron(CronExpression.EVERY_HOUR)
  async updateOldReservations() {
    this.logger.log('--- [PUT] Actualizando estados de reservas pasadas ---');
    
    const ahora = new Date();

    // Cambiamos (PUT) las reservas que ya pasaron y siguen pendientes
    const actualizadas = await (this.prisma as any).reserva.updateMany({
      where: {
        Fecha: { lt: ahora },
        Estado: 'Pendiente',
      },
      data: {
        Estado: 'Vencida', // O 'Por Verificar'
      },
    });

    this.logger.log(`Se actualizaron ${actualizadas.count} reservas antiguas.`);
  }

  // --- [ DELETE ] ---
  // ELIMINA datos innecesarios o temporales cada domingo a medianoche
  @Cron(CronExpression.EVERY_WEEKEND)
  async cleanupDatabase() {
    this.logger.warn('--- [DELETE] Limpiando notificaciones leídas muy antiguas ---');
    
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    // Borramos (DELETE) notificaciones viejas para no llenar la DB
    const eliminadas = await (this.prisma as any).notificacion.deleteMany({
      where: {
        Leido: true,
        Fecha_Envio: { lt: haceUnMes },
      },
    });

    this.logger.log(`Limpieza completada: ${eliminadas.count} registros eliminados.`);
  }
}


