// src/consultas/consultas.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultasService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. ¿Cuántos usuarios están registrados por tipo de rol?
  async usuariosPorRol() {
    return this.prisma.rol.findMany({
      select: { Rol: true, _count: { select: { usuarios: true } } },
    });
  }

  // 2. ¿Qué servicios están disponibles?
  async serviciosDisponibles() {
    return this.prisma.servicio.findMany({
      select: { Id_Servicio: true, Nombre_Servicio: true, Precio: true, descripcion: true },
      orderBy: { Nombre_Servicio: 'asc' },
    });
  }

  // 3. ¿Qué servicios ha solicitado cada cliente?
  async serviciosPorCliente() {
    return this.prisma.usuario.findMany({
      where: { rol_Id_Rol: 3 },
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        reservasComoCliente: {
          select: { ID_Reserva: true, fecha: true, Estado: true, servicios: true },
        },
      },
    });
  }

  // 4. ¿Cuál es la agenda de un empleado específico?
  async agendaEmpleado(id: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.reserva.findMany({
      where: {
        empleado_Id_Usuario: id,
        fecha: { gte: today },
      },
      include: {
        cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
        servicios: { select: { Nombre_Servicio: true, Precio: true } },
      },
      orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
    });
  }

  // 5. ¿Cuántos clientes han solicitado servicios esta semana?
  async clientesSemana() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return this.prisma.reserva.findMany({
      where: { fecha: { gte: startOfWeek, lte: endOfWeek } },
      include: {
        cliente: { select: { Nombre: true, Correo: true, Telefono: true } },
      },
      distinct: ['Id_Usuario'],
    });
  }

  // 6. ¿Cuántas reservas se han realizado por tipo de servicio?
  // La FK está en Servicio → Reserva (muchos-a-uno), así que consultamos
  // desde Reserva y contamos sus servicios asociados con _count
  async reservasPorServicio() {
    return this.prisma.reserva.findMany({
      select: {
        ID_Reserva: true,
        Estado: true,
        fecha: true,
        _count: { select: { servicios: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  // 7. ¿Cuántas reservas ha realizado cada cliente?
  async reservasPorCliente() {
    return this.prisma.usuario.findMany({
      where: { rol_Id_Rol: 3 },
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        _count: { select: { reservasComoCliente: true } },
      },
      orderBy: { Nombre: 'asc' },
    });
  }

  // 8. ¿Cuántos servicios ha realizado cada empleado este mes?
  async empleadosServiciosMes() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.prisma.usuario.findMany({
      where: { rol_Id_Rol: 2 },
      select: {
        Id_Usuario: true,
        Nombre: true,
        reservasComoEmpleado: {
          where: { fecha: { gte: startOfMonth, lte: endOfMonth } },
          select: { ID_Reserva: true, fecha: true, Estado: true },
        },
      },
    });
  }

  // 9. ¿Cuáles son los empleados que no han realizado ningún servicio?
  async empleadosSinServicios() {
    return this.prisma.usuario.findMany({
      where: {
        rol_Id_Rol: 2,
        reservasComoEmpleado: { none: {} },
      },
      select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true },
    });
  }

  // 10. ¿Cuál es la agenda semanal completa de todos los empleados?
  async agendaSemanalCompleta() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.prisma.reserva.findMany({
      where: {
        fecha: { gte: today, lte: nextWeek },
        empleado_Id_Usuario: { not: null },
      },
      include: {
        empleado: { select: { Nombre: true } },
        cliente: { select: { Nombre: true, Telefono: true } },
        servicios: { select: { Nombre_Servicio: true } },
      },
      orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
    });
  }

  // Todas las consultas juntas
  async todas() {
    const [c1, c2, c3, c5, c6, c7, c9] = await Promise.all([
      this.usuariosPorRol(),
      this.serviciosDisponibles(),
      this.serviciosPorCliente(),
      this.clientesSemana(),
      this.reservasPorServicio(),
      this.reservasPorCliente(),
      this.empleadosSinServicios(),
    ]);
    return {
      consulta1_usuariosPorRol: c1,
      consulta2_serviciosDisponibles: c2,
      consulta3_serviciosPorCliente: c3,
      consulta5_clientesSemana: c5,
      consulta6_reservasPorServicio: c6,
      consulta7_reservasPorCliente: c7,
      consulta9_empleadosSinServicios: c9,
    };
  }
}