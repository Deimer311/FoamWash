// src/empleados/empleados.service.ts
// ============================================================
// Reemplaza routes/empleados.js + controllers/empleado.controller.js
// ============================================================
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  // GET /api/empleados — lista todos los empleados
  async findAll() {
    return this.prisma.usuario.findMany({
      where: { rol_Id_Rol: 2 },
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
        Direccion: true,
        N_Documento: true,
        estado: true,
        foto_perfil: true,
        tipo_de_documento: {
          select: {
            idTipo_de_Documento: true,
            nombre_del_documento: true,
          },
        },
        empleado: {
          select: {
            cargo: true,
            fecha_nacimiento: true,
            fecha_ingreso: true,
            dias_laborales: true,
            horario: true,
            especialidades: true,
            certificaciones: true,
            contacto_emergencia_nombre: true,
            contacto_emergencia_telefono: true,
          },
          take: 1,
        },
      },
    });
  }

  // GET /api/empleados/:id/servicios-hoy
  async getReservasHoy(id: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.reserva.findMany({
      where: {
        empleado_Id_Usuario: id,
        OR: [
          { fecha: { gte: today, lt: tomorrow } }, // Programadas para hoy
          { 
            fecha: { lt: today }, 
            Estado: { notIn: ['Completado', 'Cancelado', 'Finalizado'] } // Atrasadas sin completar
          }
        ]
      },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true, descripcion: true } },
      },
      orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
    });
  }

  // GET /api/empleados/:id/agenda-semanal
  async getReservasSemana(id: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.prisma.reserva.findMany({
      where: {
        empleado_Id_Usuario: id,
        fecha: { gte: today, lte: nextWeek },
      },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true } },
      },
      orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
    });
  }

  // GET /api/empleados/:id/agenda-mensual
  async getReservasMes(id: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return this.prisma.reserva.findMany({
      where: {
        empleado_Id_Usuario: id,
        fecha: { gte: today, lte: nextMonth },
      },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true } },
      },
      orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
    });
  }

  // GET /api/empleados/sin-servicios
  async getSinServicios() {
    return this.prisma.usuario.findMany({
      where: {
        rol_Id_Rol: 2,
        reservasComoEmpleado: { none: {} },
      },
      select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true },
    });
  }

  // GET /api/empleados/servicios-finalizados
  async getServiciosFinalizados() {
    return this.prisma.reserva.findMany({
      where: {
        Estado: 'Completado',
        empleado_Id_Usuario: { not: null },
      },
      include: {
        empleado: { select: { Nombre: true } },
        cliente: { select: { Nombre: true } },
        servicios: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }

  // GET /api/empleados/productividad/general
  async getProductividadGeneral() {
    return this.prisma.usuario.findMany({
      where: { rol_Id_Rol: 2 },
      select: {
        Id_Usuario: true,
        Nombre: true,
        _count: { select: { reservasComoEmpleado: true } },
      },
      orderBy: { Nombre: 'asc' },
    });
  }

  // GET /api/empleados/:id/historial — RF14: historial completo
  async getHistorial(id: number) {
    return this.prisma.reserva.findMany({
      where: { empleado_Id_Usuario: id },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true, descripcion: true } },
        observacion: { select: { Observaciones: true, estado: true } },
      },
      orderBy: [{ fecha: 'desc' }, { Hora: 'desc' }],
    });
  }

  // GET /api/empleados/:id/completados
  async getCompletados(id: number) {
    return this.prisma.reserva.findMany({
      where: { empleado_Id_Usuario: id, Estado: 'Completado' },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true } },
      },
      orderBy: [{ fecha: 'desc' }],
    });
  }

  // GET /api/empleados/:id/pendientes
  async getPendientes(id: number) {
    return this.prisma.reserva.findMany({
      where: {
        empleado_Id_Usuario: id,
        Estado: { in: ['Pendiente', 'Confirmado', 'En Proceso'] },
      },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true } },
      },
      orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
    });
  }

  // GET /api/empleados/:id/perfil — perfil completo (usuario + empleado + relaciones)
  async getPerfilCompleto(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { Id_Usuario: id },
      select: {
        Id_Usuario:     true,
        Nombre:         true,
        Correo:         true,
        Telefono:       true,
        N_Documento:    true,
        Direccion:      true,
        foto_perfil:    true,
        estado:         true,
        fecha_registro: true,
        tipo_de_documento: {
          select: {
            idTipo_de_Documento: true,
            nombre_del_documento: true,
          },
        },
        rol: {
          select: { Rol: true },
        },
        empleado: {
          select: {
            cargo:                        true,
            fecha_nacimiento:             true,
            fecha_ingreso:                true,
            dias_laborales:               true,
            horario:                      true,
            especialidades:               true,
            certificaciones:              true,
            contacto_emergencia_nombre:   true,
            contacto_emergencia_telefono: true,
          },
          take: 1,
        },
      },
    });

    if (!usuario) throw new NotFoundException(`Empleado con id ${id} no encontrado`);

    const emp = usuario.empleado?.[0] ?? null;

    return {
      Id_Usuario:                   usuario.Id_Usuario,
      Nombre:                       usuario.Nombre,
      Correo:                       usuario.Correo,
      Telefono:                     usuario.Telefono,
      N_Documento:                  usuario.N_Documento,
      Direccion:                    usuario.Direccion,
      foto_perfil:                  usuario.foto_perfil,
      estado:                       usuario.estado,
      fecha_registro:               usuario.fecha_registro,
      tipo_de_documento:            usuario.tipo_de_documento,
      rol:                          usuario.rol,
      cargo:                        emp?.cargo                        ?? null,
      fecha_nacimiento:             emp?.fecha_nacimiento             ?? null,
      fecha_ingreso:                emp?.fecha_ingreso                ?? null,
      dias_laborales:               emp?.dias_laborales               ?? null,
      horario:                      emp?.horario                      ?? null,
      especialidades:               emp?.especialidades               ?? null,
      certificaciones:              emp?.certificaciones              ?? null,
      contacto_emergencia_nombre:   emp?.contacto_emergencia_nombre   ?? null,
      contacto_emergencia_telefono: emp?.contacto_emergencia_telefono ?? null,
    };
  }

  // GET /api/empleados/:id/desempeno — métricas reales del empleado
  async getDesempeno(id: number) {
    const ahora     = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes    = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

    const [serviciosMes, calificaciones] = await Promise.all([
      this.prisma.reserva.count({
        where: {
          empleado_Id_Usuario: id,
          Estado:              'Completado',
          fecha:               { gte: inicioMes, lte: finMes },
        },
      }),
      this.prisma.calificacion.findMany({
        where:  { empleado_Id_Usuario: id },
        select: { puntaje: true, comentario: true },
      }),
    ]);

    const totalCalificaciones = calificaciones.length;
    const calificacionPromedio =
      totalCalificaciones > 0
        ? Math.round(
            (calificaciones.reduce((s, c) => s + Number(c.puntaje), 0) /
              totalCalificaciones) * 10,
          ) / 10
        : null;

    const comentarios = calificaciones.filter(
      (c) => c.comentario && c.comentario.trim() !== '',
    ).length;

    return {
      servicios_mes:         serviciosMes,
      calificacion_promedio: calificacionPromedio,
      total_calificaciones:  totalCalificaciones,
      comentarios:           comentarios,
      // puntualidad = null: el sistema no registra hora real de inicio de servicio
      puntualidad:           null,
    };
  }

  // POST foto de perfil
  async updateFoto(id: number, fotoUrl: string) {
    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data: { foto_perfil: fotoUrl },
      select: { Id_Usuario: true, foto_perfil: true },
    });
  }
}
