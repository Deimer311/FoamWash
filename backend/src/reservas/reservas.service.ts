// src/reservas/reservas.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sendServiceConfirmationEmail, sendServiceUpdateEmail } from '../common/utils/email.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReservasService {
  constructor(private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) { }

  // GET /api/reservas
  async findAll() {
    return this.prisma.reserva.findMany({
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Correo: true } },
        observacion: { select: { Observaciones: true, estado: true } },
        empleado: { select: { Nombre: true } },
        servicios: true,
      },
      orderBy: [{ fecha: 'desc' }],
    });
  }

  // GET /api/reservas/estado/:estado
  async findByEstado(estado: string) {
    return this.prisma.reserva.findMany({
      where: { Estado: estado },
      include: {
        cliente: { select: { Nombre: true, Telefono: true } },
      },
      orderBy: [{ fecha: 'asc' }],
    });
  }

  // GET /api/reservas/:id
  async findOne(id: number) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { ID_Reserva: id },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Correo: true } },
        empleado: { select: { Nombre: true } },
        servicios: true,
        observacion: true,
      },
    });
    if (!reserva) throw new NotFoundException('Reserva no encontrada');
    return reserva;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDACIÓN DE DISPONIBILIDAD ESTRICTA (RF19)
  // Verifica si el empleado tiene reservas que se crucen en un rango de 2h
  // ─────────────────────────────────────────────────────────────────────────
  private async verificarDisponibilidad(empleadoId: number, fecha: Date, hora: Date, excludeReservaId?: number): Promise<boolean> {
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const reservasDelDia = await this.prisma.reserva.findMany({
      where: {
        empleado_Id_Usuario: empleadoId,
        fecha: { gte: fechaInicio, lte: fechaFin },
        Estado: { notIn: ['Cancelado'] },
        ID_Reserva: excludeReservaId ? { not: excludeReservaId } : undefined,
      },
      select: { Hora: true }
    });

    const horaMilis = hora.getTime();
    const BLOQUE_MS = 2 * 60 * 60 * 1000; // 2 horas de margen

    for (const r of reservasDelDia) {
      if (Math.abs(r.Hora.getTime() - horaMilis) < BLOQUE_MS) {
        return false; // Conflicto detectado
      }
    }
    return true; // Disponible
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASIGNACIÓN AUTOMÁTICA DE EMPLEADO
  // ─────────────────────────────────────────────────────────────────────────
  private async asignarEmpleadoAutomatico(fecha: Date, horaISO: Date): Promise<number | null> {
    // 1. Obtener todos los empleados activos (rol_Id_Rol = 2)
    const empleadosActivos = await this.prisma.usuario.findMany({
      where: {
        rol_Id_Rol: 2,        // rol empleado
        estado: 'activo',
      },
      select: { 
        Id_Usuario: true, 
        Nombre: true,
        empleado: { select: { dias_laborales: true } }
      },
    });

    if (empleadosActivos.length === 0) return null;

    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaReserva = dias[fecha.getUTCDay()];

    const empleadosDisponibles = empleadosActivos.filter(emp => {
      if (!emp.empleado || emp.empleado.length === 0) return true; // Si no tiene configuración, asume disponible
      // Normalizar quitando tildes
      const diasLaborales = (emp.empleado[0].dias_laborales || '')
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
      if (!diasLaborales) return true;
      return diasLaborales.includes(diaReserva);
    });

    if (empleadosDisponibles.length === 0) return null; // No hay nadie que trabaje ese día

    // 2. Filtrar por cruce de horarios y contar reservas para balanceo
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const cargaPorEmpleado: { empId: number, reservasEnElDia: number }[] = [];
    
    for (const emp of empleadosDisponibles) {
       const disponible = await this.verificarDisponibilidad(emp.Id_Usuario, fecha, horaISO);
       if (!disponible) continue; // Descartar a los que tienen cruce (RF19)
       
       const cantidad = await this.prisma.reserva.count({
          where: {
            empleado_Id_Usuario: emp.Id_Usuario,
            fecha: { gte: fechaInicio, lte: fechaFin },
            Estado: { notIn: ['Cancelado'] },
          },
       });
       
       cargaPorEmpleado.push({ empId: emp.Id_Usuario, reservasEnElDia: cantidad });
    }

    if (cargaPorEmpleado.length === 0) return null; // Nadie disponible en esa hora sin cruce
    
    cargaPorEmpleado.sort((a, b) => a.reservasEnElDia - b.reservasEnElDia);
    return cargaPorEmpleado[0].empId;
  }

  // POST /api/reservas
  private parseAndValidateDateTime(fecha?: string, Hora?: string): { fechaISO?: Date, horaISO?: Date } {
    let fechaISO: Date | undefined = undefined;
    if (fecha) {
      const soloFecha = fecha.split('T')[0];
      fechaISO = new Date(`${soloFecha}T00:00:00.000Z`);
    }

    let horaISO: Date | undefined = undefined;
    if (Hora && /^\d{2}:\d{2}$/.test(Hora)) {
      const horaStr = Hora.split(':')[0];
      const horaNum = Number.parseInt(horaStr, 10);

      // Validar horario laboral: 08:00 a 17:00
      if (horaNum < 8 || horaNum > 17) {
        throw new BadRequestException({ code: 'TIME_NOT_ALLOWED', message: 'La hora seleccionada no está permitida' });
      }

      horaISO = new Date(`1970-01-01T${Hora}:00.000Z`);
    }

    // Validar que la reserva no sea en el pasado
    if (fechaISO && horaISO) {
      const fechaHoraReserva = new Date(fechaISO);
      fechaHoraReserva.setUTCHours(horaISO.getUTCHours(), horaISO.getUTCMinutes(), 0, 0);
      
      // Ajuste para hora local Colombia (UTC-5)
      const ahora = new Date();
      const ahoraColombia = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
      const reservaColombia = new Date(fechaHoraReserva.getTime() - (5 * 60 * 60 * 1000));

      if (reservaColombia < ahoraColombia) {
        throw new BadRequestException('No se pueden crear reservas en el pasado.');
      }
    }

    return { fechaISO, horaISO };
  }

  private async calcularTotalServicios(servicios?: Array<{ Id_Servicio: number; cantidad?: number }>): Promise<number> {
    if (!servicios || servicios.length === 0) return 0;
    const servicioIds = servicios.map(s => s.Id_Servicio);
    const serviciosDb = await this.prisma.servicio.findMany({
      where: { Id_Servicio: { in: servicioIds } },
    });
    return servicios.reduce((sum, reqSvc) => {
       const dbSvc = serviciosDb.find(s => s.Id_Servicio === reqSvc.Id_Servicio);
       return sum + (dbSvc ? Number(dbSvc.Precio) * (reqSvc.cantidad || 1) : 0);
    }, 0);
  }

  private async enviarCorreoConfirmacion(correo: string, reserva: any, total: number) {
    const dateFormatter = new Intl.DateTimeFormat('es-CO', { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'UTC'
    });
    const timeFormatter = new Intl.DateTimeFormat('es-CO', { 
      hour: '2-digit', minute: '2-digit',
      timeZone: 'UTC'
    });

    await sendServiceConfirmationEmail(correo, {
      id: `PED-${reserva.ID_Reserva}`,
      fecha: reserva.fecha ? dateFormatter.format(new Date(reserva.fecha)) : 'Fecha no especificada',
      hora: reserva.Hora ? timeFormatter.format(new Date(reserva.Hora)) : 'Hora no especificada',
      direccion: reserva.cliente.Direccion || 'No especificada',
      total: total
    }).catch(err => console.error('Error al enviar correo de confirmación:', err));
  }

  private async asignarYValidarEmpleado(fechaISO?: Date, horaISO?: Date, empleadoId?: number): Promise<number | null> {
    if (!fechaISO || !horaISO) return empleadoId ?? null;
    
    let assignedId = empleadoId ?? null;
    if (assignedId) {
      const disponible = await this.verificarDisponibilidad(assignedId, fechaISO, horaISO);
      if (!disponible) throw new BadRequestException({ code: 'TIME_UNAVAILABLE', message: 'El horario ya está ocupado' });
    } else {
      assignedId = await this.asignarEmpleadoAutomatico(fechaISO, horaISO);
      if (!assignedId) throw new BadRequestException({ code: 'TIME_UNAVAILABLE', message: 'El horario ya está ocupado' });
    }
    return assignedId;
  }

  private prepararDatosObservacion(data: any) {
    if (data.observacion_Id_Observaciones) {
      return { connect: { Id_Observaciones: data.observacion_Id_Observaciones } };
    }
    return { create: { Observaciones: data.observaciones || data.Informacion_adicional || '', estado: 'Pendiente' } };
  }

  async create(data: {
    Estado?: string;
    Id_Usuario: number;
    fecha?: string;
    Hora?: string;
    Informacion_adicional?: string;
    observacion_Id_Observaciones?: number;
    empleado_Id_Usuario?: number;
    servicios?: Array<{ Id_Servicio: number; cantidad?: number; tamano?: string }>;
    observaciones?: string;
  }) {
    const { fechaISO, horaISO } = this.parseAndValidateDateTime(data.fecha, data.Hora);
    const observacionData = this.prepararDatosObservacion(data);
    const empleadoId = await this.asignarYValidarEmpleado(fechaISO, horaISO, data.empleado_Id_Usuario);

    const reserva = await this.prisma.reserva.create({
      data: {
        Estado: data.Estado || 'Pendiente',
        fecha: fechaISO,
        Hora: horaISO,
        Informacion_adicional: data.Informacion_adicional,
        cliente: { connect: { Id_Usuario: data.Id_Usuario } },
        empleado: empleadoId ? { connect: { Id_Usuario: empleadoId } } : undefined,
        observacion: observacionData,
        servicios: data.servicios && data.servicios.length > 0
          ? { connect: data.servicios.map(s => ({ Id_Servicio: s.Id_Servicio })) }
          : undefined,
      },
      include: {
        empleado: { select: { Nombre: true, Id_Usuario: true } },
        cliente: true,
        servicios: true,
      },
    });

    // Notificaciones delegadas
    await this._notificarCreacion(reserva, empleadoId);

    // Calcular total
    const total = await this.calcularTotalServicios(data.servicios);

    // Enviar correo si el cliente tiene correo
    if (reserva.cliente?.Correo) {
      await this.enviarCorreoConfirmacion(reserva.cliente.Correo, reserva, total);
    }

    return {
      success: true,
      data: {
        ...reserva,
        empleado_asignado: reserva.empleado?.Nombre ?? 'Sin asignar',
      },
    };
  }

  // PUT /api/reservas/:id
  async update(
    id: number,
    data: Partial<{
      Estado: string;
      fecha: Date;
      Hora: Date;
      Informacion_adicional: string;
      empleado_Id_Usuario: number;
    }>,
  ) {
    const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
    if (!exists) throw new NotFoundException('Reserva no encontrada');

    // VALIDAR DISPONIBILIDAD SI CAMBIA EMPLEADO O FECHA/HORA (RF19)
    if (data.empleado_Id_Usuario || data.fecha || data.Hora) {
      const targetEmpleadoId = data.empleado_Id_Usuario ?? exists.empleado_Id_Usuario;
      const targetFecha = data.fecha ?? exists.fecha;
      const targetHora = data.Hora ?? exists.Hora;
      
      if (targetEmpleadoId && targetFecha && targetHora) {
        const disponible = await this.verificarDisponibilidad(targetEmpleadoId, targetFecha, targetHora, id);
        if (!disponible) {
          throw new BadRequestException('El trabajador ya tiene una reserva que se cruza en ese horario (margen de 2h).');
        }
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CP-045 PERSISTENCIA EN BD: Notificación por reasignación de empleado
    // ─────────────────────────────────────────────────────────────────────────
    if (data.empleado_Id_Usuario && data.empleado_Id_Usuario !== exists.empleado_Id_Usuario) {
      if (this.prisma.notificacion?.create) {
        // Notificar al nuevo empleado
        await this.prisma.notificacion.create({
          data: {
            usuario_Id_Usuario: data.empleado_Id_Usuario,
            descripcion_notificacion: `Se te ha reasignado la orden de servicio #${id}.`,
            fecha_notificacion: new Date(),
          },
        }).catch(e => console.log('Error creando notificacion reasignacion nuevo empleado:', e));

        // Notificar al empleado previo si existía
        if (exists.empleado_Id_Usuario) {
          await this.prisma.notificacion.create({
            data: {
              usuario_Id_Usuario: exists.empleado_Id_Usuario,
              descripcion_notificacion: `La orden de servicio #${id} ha sido reasignada a otro trabajador.`,
              fecha_notificacion: new Date(),
            },
          }).catch(e => console.log('Error creando notificacion reasignacion previo empleado:', e));
        }
      }
    }

    return this.prisma.reserva.update({ where: { ID_Reserva: id }, data });
  }

  // PATCH /api/reservas/:id/estado
  async updateEstado(id: number, estado: string) {
    const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
    if (!exists) throw new NotFoundException('Reserva no encontrada');

    const updatedReserva = await this.prisma.reserva.update({
      where: { ID_Reserva: id },
      data: { Estado: estado },
      include: {
        cliente: true,
        servicios: true,
        empleado: true,
      }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // PERSISTENCIA EN BD: Guardar notificación de estado para el cliente
    // ─────────────────────────────────────────────────────────────────────────
    if (this.prisma.notificacion?.create) {
      if (updatedReserva.cliente) {
        await this.prisma.notificacion.create({
          data: {
            usuario_Id_Usuario: updatedReserva.cliente.Id_Usuario,
            descripcion_notificacion: `El estado de tu reserva #${updatedReserva.ID_Reserva} ha cambiado a: ${estado}.`,
            fecha_notificacion: new Date(),
          },
        }).catch(e => console.log('Error creando notificacion DB estado cliente:', e));
      }

      // Guardar notificación para el empleado asignado
      if (updatedReserva.empleado) {
        await this.prisma.notificacion.create({
          data: {
            usuario_Id_Usuario: updatedReserva.empleado.Id_Usuario,
            descripcion_notificacion: `El estado de la reserva #${updatedReserva.ID_Reserva} ha cambiado a: ${estado}.`,
            fecha_notificacion: new Date(),
          },
        }).catch(e => console.log('Error creando notificacion DB estado empleado:', e));
      }
    }

    if (estado === 'Confirmado' && updatedReserva.cliente?.Correo) {
      const total = updatedReserva.servicios.reduce((sum, s) => sum + Number(s.Precio || 0), 0);

      const dateFormatter = new Intl.DateTimeFormat('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        timeZone: 'America/Bogota'
      });
      const timeFormatter = new Intl.DateTimeFormat('es-CO', {
        hour: '2-digit', minute: '2-digit',
        timeZone: 'America/Bogota'
      });

      await sendServiceConfirmationEmail(updatedReserva.cliente.Correo, {
        id: `PED-${updatedReserva.ID_Reserva}`,
        fecha: dateFormatter.format(new Date(updatedReserva.fecha)),
        hora: timeFormatter.format(new Date(updatedReserva.Hora)),
        direccion: updatedReserva.cliente.Direccion || 'No especificada',
        total: total
      }).catch(err => console.error('Error al enviar correo de confirmación (empleado):', err));
    } else if (['En Camino', 'En Progreso', 'Completado'].includes(estado) && updatedReserva.cliente?.Correo) {
      await sendServiceUpdateEmail(updatedReserva.cliente.Correo, {
        id: `PED-${updatedReserva.ID_Reserva}`,
        estado: estado,
      }).catch(err => console.error('Error al enviar correo de actualización de estado:', err));
    }

    try {
      await this.notificationsService.sendToTopic(
        `user_${updatedReserva.cliente.Id_Usuario}`,
        'Actualización de tu Reserva',
        `El estado de tu reserva #${updatedReserva.ID_Reserva} ha cambiado a: ${estado}.`,
        { type: 'actualizacion_reserva', reservaId: updatedReserva.ID_Reserva.toString(), estado }
      );
    } catch (e) {}

    if (updatedReserva.empleado) {
      try {
        await this.notificationsService.sendToTopic(
          `user_${updatedReserva.empleado.Id_Usuario}`,
          'Actualización de Reserva',
          `El estado de la reserva #${updatedReserva.ID_Reserva} ha cambiado a: ${estado}.`,
          { type: 'actualizacion_reserva', reservaId: updatedReserva.ID_Reserva.toString(), estado }
        );
      } catch (e) {}
    }

    return updatedReserva;
  }

  // DELETE /api/reservas/:id/cancelar
  async cancelarReserva(id: number, motivo: string) {
    const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
    if (!exists) throw new NotFoundException('Reserva no encontrada');

    const updatedReserva = await this.prisma.reserva.update({
      where: { ID_Reserva: id },
      data: { Estado: 'Cancelado' },
      include: { cliente: true, empleado: true }
    });

    // ─────────────────────────────────────────────────────────────────────────
    // PERSISTENCIA EN BD: Notificación de cancelación en tabla `notificaciones`
    // ─────────────────────────────────────────────────────────────────────────
    if (this.prisma.notificacion?.create) {
      if (updatedReserva.cliente) {
        await this.prisma.notificacion.create({
          data: {
            usuario_Id_Usuario: updatedReserva.cliente.Id_Usuario,
            descripcion_notificacion: `La reserva #${updatedReserva.ID_Reserva} ha sido cancelada. Motivo: ${motivo}`,
            fecha_notificacion: new Date(),
          },
        }).catch(e => console.log('Error creando notificacion DB cancelacion cliente:', e));
      }

      if (updatedReserva.empleado) {
        await this.prisma.notificacion.create({
          data: {
            usuario_Id_Usuario: updatedReserva.empleado.Id_Usuario,
            descripcion_notificacion: `Se ha cancelado la reserva #${updatedReserva.ID_Reserva} que tenías asignada.`,
            fecha_notificacion: new Date(),
          },
        }).catch(e => console.log('Error creando notificacion DB cancelacion empleado:', e));
      }
    }

    if (updatedReserva.cliente?.Correo) {
      const dateFormatter = new Intl.DateTimeFormat('es-CO', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        timeZone: 'America/Bogota'
      });
      
      const { sendCancellationEmail } = await import('../common/utils/email.util');
      await sendCancellationEmail(updatedReserva.cliente.Correo, {
        id: `PED-${updatedReserva.ID_Reserva}`,
        fecha: dateFormatter.format(new Date(updatedReserva.fecha)),
        motivo: motivo
      }).catch(err => console.error('Error al enviar correo de cancelación:', err));
    }

    try {
      await this.notificationsService.sendToTopic(
        'topic_admin',
        'Reserva Cancelada',
        `La reserva #${updatedReserva.ID_Reserva} ha sido cancelada.`,
        { type: 'reserva_cancelada', reservaId: updatedReserva.ID_Reserva.toString() }
      );
    } catch (e) {}

    if (updatedReserva.empleado) {
      try {
        await this.notificationsService.sendToTopic(
          `user_${updatedReserva.empleado.Id_Usuario}`,
          'Reserva Cancelada',
          `Se ha cancelado la reserva #${updatedReserva.ID_Reserva} que tenías asignada.`,
          { type: 'reserva_cancelada', reservaId: updatedReserva.ID_Reserva.toString() }
        );
      } catch (e) {}
    }

    return updatedReserva;
  }

  // DELETE /api/reservas/:id
  async remove(id: number) {
    const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
    if (!exists) throw new NotFoundException('Reserva no encontrada');
    return this.prisma.reserva.delete({ where: { ID_Reserva: id } });
  }

  // GET reservas por cliente
  async findByCliente(clienteId: number) {
    return this.prisma.reserva.findMany({
      where: { Id_Usuario: clienteId },
      include: { servicios: true, observacion: true, empleado: { select: { Nombre: true } } },
      orderBy: { fecha: 'desc' },
    });
  }

  private async _notificarCreacion(reserva: any, empleadoId: number | null) {
    if (reserva.cliente && this.prisma.notificacion?.create) {
      await this.prisma.notificacion.create({
        data: {
          usuario_Id_Usuario: reserva.cliente.Id_Usuario,
          descripcion_notificacion: `Tu reserva #${reserva.ID_Reserva} ha sido agendada exitosamente.`,
          fecha_notificacion: new Date(),
        },
      }).catch(e => console.log('Error creando notificacion DB cliente:', e));
    }

    try {
      await this.notificationsService.sendToTopic(
        'topic_admin',
        'Nueva Reserva Creada',
        `Reserva #${reserva.ID_Reserva} para el cliente ${reserva.cliente.Nombre}.`,
        { type: 'nueva_reserva', reservaId: reserva.ID_Reserva.toString() }
      );
    } catch (e) {
      console.log('Error enviando push notification:', e);
    }

    if (empleadoId) {
      if (this.prisma.notificacion?.create) {
        await this.prisma.notificacion.create({
          data: {
            usuario_Id_Usuario: empleadoId,
            descripcion_notificacion: `Tienes una nueva orden de servicio #${reserva.ID_Reserva} asignada.`,
            fecha_notificacion: new Date(),
          },
        }).catch(e => console.log('Error creando notificacion DB empleado:', e));
      }

      try {
        await this.notificationsService.sendToTopic(
          `user_${empleadoId}`,
          'Nueva Cita Asignada',
          `Tienes una nueva reserva #${reserva.ID_Reserva} asignada.`,
          { type: 'nueva_reserva', reservaId: reserva.ID_Reserva.toString() }
        );
      } catch (e) {
        console.log('Error enviando push notification al empleado:', e);
      }
    }
  }
}