import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCotizacionDto } from './dto/create-cotizacion.dto';

@Injectable()
export class ServiciosService {
  constructor(private prisma: PrismaService) {}

  // Obtener servicios activos (público)
  async getServiciosPublicos() {
    return this.prisma.servicio.findMany({
      select: {
        Id_Servicio: true,
        Nombre_Servicio: true,
        Precio: true,
        descripcion: true,
        imagen_url: true,
      },
    });
  }

  // Lógica de cotizaciones (Migración de cotizaciones.js)
  async createCotizacion(dto: CreateCotizacionDto) {
    // Usamos 'upsert' o una lógica de búsqueda para evitar duplicados del mismo día
    // como hacía tu código original con el pool.query
    return this.prisma.cotizacion.create({
      data: {
        Id_usuario: dto.Id_usuario,
        Id_servicio: dto.Id_servicio,
        Precio_cotizado: dto.Precio_cotizado,
        Cantidad: dto.Cantidad || 1,
        Tama_o: dto.Tamaño || 'Estándar',
      },
    });
  }

  async getAllCotizaciones() {
    return this.prisma.cotizacion.findMany({
      include: {
        usuario: {
          select: { Nombre: true, Correo: true, Telefono: true }
        }
      },
      orderBy: { fecha_cotizacion: 'desc' }
    });
  }
}