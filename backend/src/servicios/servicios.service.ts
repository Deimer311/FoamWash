// src/servicios/servicios.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.servicio.findMany({
      select: {
        Id_Servicio: true,
        Nombre_Servicio: true,
        Precio: true,
        descripcion: true,
        imagen_url: true,
        estado: true,
        duracion_estimada: true,
      },
      orderBy: { Nombre_Servicio: 'asc' },
    });
  }

  async findOne(id: number) {
    const servicio = await this.prisma.servicio.findUnique({
      where: { Id_Servicio: id },
    });
    if (!servicio) throw new NotFoundException('Servicio no encontrado');
    return servicio;
  }

  async create(data: {
    Nombre_Servicio: string;
    Precio: number;
    descripcion?: string;
    imagen_url?: string;
  }) {
    return this.prisma.servicio.create({
      data: {
        Nombre_Servicio: data.Nombre_Servicio,
        Precio: data.Precio,
        descripcion: data.descripcion ?? null,
        imagen_url: data.imagen_url ?? null,
      },
    });
  }

  async update(
    id: number,
    data: Partial<{
      Nombre_Servicio: string;
      Precio: number;
      descripcion: string;
      imagen_url: string;
    }>,
  ) {
    const exists = await this.prisma.servicio.findUnique({ where: { Id_Servicio: id } });
    if (!exists) throw new NotFoundException('Servicio no encontrado');
    return this.prisma.servicio.update({ where: { Id_Servicio: id }, data });
  }

  async remove(id: number) {
    const exists = await this.prisma.servicio.findUnique({ where: { Id_Servicio: id } });
    if (!exists) throw new NotFoundException('Servicio no encontrado');
    return this.prisma.servicio.delete({ where: { Id_Servicio: id } });
  }

  // Analytics: más solicitados
  async masSolicitados() {
    return this.prisma.servicio.findMany({
      include: { reservas: true },
      orderBy: { Id_Servicio: 'asc' },
      take: 10,
    });
  }

  // Analytics: programados hoy
  async programadosHoy() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.servicio.findMany({
      where: {
        reservas: {
          some: {
            fecha: { gte: today, lt: tomorrow },
          },
        },
      },
      include: {
        reservas: {
          where: {
            fecha: { gte: today, lt: tomorrow },
          },
          include: {
            cliente: { select: { Nombre: true } },
            empleado: { select: { Nombre: true } },
          },
        },
      },
    });
  }
}