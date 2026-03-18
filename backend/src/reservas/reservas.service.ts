// src/reservas/reservas.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservasService {
  constructor(private prisma: PrismaService) {}

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
  // ASIGNACIÓN AUTOMÁTICA DE EMPLEADO
  // Busca el empleado activo con menos reservas pendientes/en proceso
  // en la misma fecha para balancear la carga de trabajo
  // ─────────────────────────────────────────────────────────────────────────
  private async asignarEmpleadoAutomatico(fecha: Date): Promise<number | null> {
    // 1. Obtener todos los empleados activos (rol_Id_Rol = 2)
    const empleadosActivos = await this.prisma.usuario.findMany({
      where: {
        rol_Id_Rol: 2,        // rol empleado
        estado: 'activo',
      },
      select: { Id_Usuario: true, Nombre: true },
    });

    if (empleadosActivos.length === 0) return null;

    // 2. Para cada empleado, contar sus reservas en esa fecha
    const fechaInicio = new Date(fecha);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha);
    fechaFin.setHours(23, 59, 59, 999);

    const cargaPorEmpleado = await Promise.all(
      empleadosActivos.map(async (emp) => {
        const cantidad = await this.prisma.reserva.count({
          where: {
            empleado_Id_Usuario: emp.Id_Usuario,
            fecha: { gte: fechaInicio, lte: fechaFin },
            Estado: { notIn: ['Cancelado'] },
          },
        });
        return { id: emp.Id_Usuario, nombre: emp.Nombre, carga: cantidad };
      }),
    );

    // 3. Elegir el empleado con MENOS reservas ese día
    cargaPorEmpleado.sort((a, b) => a.carga - b.carga);
    return cargaPorEmpleado[0].id;
  }

  // POST /api/reservas
  async create(data: {
    Estado?: string;
    Id_Usuario: number;
    fecha?: string;
    Hora?: string;
    Informacion_adicional?: string;
    observacion_Id_Observaciones?: number;
    empleado_Id_Usuario?: number;
    servicios?: Array<{ Id_Servicio: number; cantidad?: number; tamano?: string }>;
  }) {
    // FIX fecha: convertir "YYYY-MM-DD" a ISO-8601 DateTime completo
    let fechaISO: Date | undefined = undefined;
    if (data.fecha) {
      const soloFecha = data.fecha.split('T')[0];
      const horaStr = data.Hora && data.Hora.match(/^\d{2}:\d{2}$/)
        ? data.Hora + ':00'
        : '00:00:00';
      fechaISO = new Date(`${soloFecha}T${horaStr}.000Z`);
    }

    // FIX Hora: también es DateTime en Prisma
    let horaISO: Date | undefined = undefined;
    if (data.Hora && data.Hora.match(/^\d{2}:\d{2}$/)) {
      const soloFecha = data.fecha
        ? data.fecha.split('T')[0]
        : new Date().toISOString().split('T')[0];
      horaISO = new Date(`${soloFecha}T${data.Hora}:00.000Z`);
    }

    // FIX observacion: NOT NULL en schema → crear vacía si no se pasa
    const observacionData = data.observacion_Id_Observaciones
      ? { connect: { Id_Observaciones: data.observacion_Id_Observaciones } }
      : { create: { Observaciones: data.Informacion_adicional ?? '', estado: 'Pendiente' } };

    // ASIGNACIÓN AUTOMÁTICA: si no se pasa empleado, buscar el más disponible
    let empleadoId = data.empleado_Id_Usuario ?? null;
    if (!empleadoId && fechaISO) {
      empleadoId = await this.asignarEmpleadoAutomatico(fechaISO);
    }

    const reserva = await this.prisma.reserva.create({
      data: {
        Estado:                data.Estado ?? 'Pendiente',
        fecha:                 fechaISO,
        Hora:                  horaISO,
        Informacion_adicional: data.Informacion_adicional,
        cliente:   { connect: { Id_Usuario: data.Id_Usuario } },
        empleado:  empleadoId
                     ? { connect: { Id_Usuario: empleadoId } }
                     : undefined,
        observacion: observacionData,
      },
      include: {
        empleado: { select: { Nombre: true, Id_Usuario: true } },
      },
    });

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
    return this.prisma.reserva.update({ where: { ID_Reserva: id }, data });
  }

  // PATCH /api/reservas/:id/estado
  async updateEstado(id: number, estado: string) {
    const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
    if (!exists) throw new NotFoundException('Reserva no encontrada');
    return this.prisma.reserva.update({
      where: { ID_Reserva: id },
      data: { Estado: estado },
    });
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
      include: { servicios: true, observacion: true },
      orderBy: { fecha: 'desc' },
    });
  }
}