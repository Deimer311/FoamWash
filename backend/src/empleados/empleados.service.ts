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
