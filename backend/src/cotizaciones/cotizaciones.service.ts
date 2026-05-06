  // src/cotizaciones/cotizaciones.service.ts
  import { Injectable } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';

  @Injectable()
  export class CotizacionesService {
    constructor(private prisma: PrismaService) {}

    async getServicios() {
      return this.prisma.servicio.findMany({
        select: { Id_Servicio: true, Nombre_Servicio: true, Precio: true, descripcion: true, imagen_url: true },
        orderBy: { Nombre_Servicio: 'asc' },
      });
    }

    async findAll() {
      return this.prisma.cotizacion.findMany({
        include: {
          cliente: { select: { Nombre: true, Correo: true, Telefono: true } },
          servicios: true,
        },
        orderBy: { fecha_cotizacion: 'desc' },
      });
    }

    // FIX: el frontend manda { Tamano, Id_servicio } pero el schema usa "Tamaño" (con ñ)
    // Se acepta cualquiera de las dos formas para mayor compatibilidad
    async create(data: {
      Precio_cotizado: number;
      Cantidad:        number;
      Tamaño?:         string;   // con ñ (schema Prisma)
      Tamano?:         string;   // sin ñ (viene del frontend)
      Id_usuario:      number;
      Id_servicio?:    number;
      fecha_cotizacion?: Date;
    }) {
      return this.prisma.cotizacion.create({
        data: {
          Precio_cotizado:  data.Precio_cotizado,
          Cantidad:         data.Cantidad,
          // Acepta con ñ o sin ñ, prioriza el que venga
          'Tamaño':         data['Tamaño'] ?? data.Tamano ?? 'Estándar',
          Id_usuario:       data.Id_usuario,
          fecha_cotizacion: data.fecha_cotizacion ?? new Date(),
          // Conectar servicio si se pasa el ID
          ...(data.Id_servicio
            ? { servicios: { connect: { Id_Servicio: data.Id_servicio } } }
            : {}),
        },
      });
    }

    async sincronizar(items: any[], userId: number) {
      const results = [];21
      for (const item of items) {
        const existing = await this.prisma.cotizacion.findFirst({
          where: { Id_usuario: userId, servicios: { some: { Id_Servicio: item.servicioId || item.id } } },
        });
        if (!existing) {
          const created = await this.prisma.cotizacion.create({
            data: {
              Precio_cotizado:  item.precio,
              Cantidad:         item.cantidad || 1,
              // FIX: campo con ñ, acepta tamano/tamaño/Tamano/Tamaño
              'Tamaño':         item['Tamaño'] ?? item.Tamano ?? item.tamano ?? item['tamaño'] ?? 'Estándar',
              Id_usuario:       userId,
              fecha_cotizacion: new Date(),
              servicios: { connect: { Id_Servicio: item.servicioId || item.id } },
            },
          });
          results.push(created);
        }
      }
      return results;
    }
  }