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
        estado: true,
        foto_perfil: true,
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
        fecha: { gte: today, lt: tomorrow },
      },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true, descripcion: true } },
      },
      orderBy: { Hora: 'asc' },
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

  // GET /api/empleados/:id/perfil
  async getPerfil(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { Id_Usuario: id },
      include: {
        tipo_de_documento: { select: { nombre_del_documento: true } },
        empleado: true,
      },
    });

    if (!usuario) throw new NotFoundException('Empleado no encontrado');

    const empleado = usuario.empleado && usuario.empleado.length > 0 ? usuario.empleado[0] : null;

    return {
      Id_Usuario: usuario.Id_Usuario,
      Nombre: usuario.Nombre,
      Correo: usuario.Correo,
      Telefono: usuario.Telefono,
      Direccion: usuario.Direccion,
      N_Documento: usuario.N_Documento,
      foto_perfil: usuario.foto_perfil,
      tipo_de_documento: usuario.tipo_de_documento,
      cargo: empleado?.cargo || null,
      dias_laborales: empleado?.dias_laborales || null,
      horario: empleado?.horario || null,
      especialidades: empleado?.especialidades || null,
      certificaciones: empleado?.certificaciones || null,
      fecha_ingreso: empleado?.fecha_ingreso || null,
      fecha_nacimiento: empleado?.fecha_nacimiento || null,
    };
  }

  // GET /api/empleados/:id/desempeno
  async getDesempeno(id: number) {
    const totalCompletados = await this.prisma.reserva.count({
      where: { empleado_Id_Usuario: id, Estado: 'Completado' },
    });

    const totalPendientes = await this.prisma.reserva.count({
      where: { empleado_Id_Usuario: id, Estado: 'Pendiente' },
    });

    const calificacionMediana = await this.prisma.calificacion.aggregate({
      _avg: { puntaje: true },
      where: { empleado_Id_Usuario: id },
    });

    const comentariosPositivos = await this.prisma.calificacion.count({
      where: { empleado_Id_Usuario: id, comentario: { contains: 'excelente' } },
    });

    return {
      servicios_completados: totalCompletados,
      servicios_pendientes: totalPendientes,
      calificacion_promedio: calificacionMediana._avg?.puntaje ?? '—',
      puntualidad: '—',
      comentarios_positivos: comentariosPositivos,
    };
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

  // POST foto de perfil
  async updateFoto(id: number, fotoUrl: string) {
    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data: { foto_perfil: fotoUrl },
      select: { Id_Usuario: true, foto_perfil: true },
    });
  }
}
