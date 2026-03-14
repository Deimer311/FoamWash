import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservaDto } from './dto/create-reserva.dto';

@Injectable()
export class ReservasService {
  constructor(private prisma: PrismaService) {}

  // Obtener todas las reservas (INNER JOIN con usuario y observacion)
  async findAll() {
    return this.prisma.reserva.findMany({
      include: {
        usuario: {
          select: { Nombre: true, Telefono: true, Correo: true }
        },
        observacion: true
      },
      orderBy: [
        { fecha: 'desc' },
        { Hora: 'desc' }
      ]
    });
  }

  // Obtener reservas por estado
  async findByEstado(estado: string) {
    return this.prisma.reserva.findMany({
      where: { Estado: estado },
      include: {
        usuario: { select: { Nombre: true, Telefono: true } }
      }
    });
  }

  // Crear una reserva
  async create(dto: CreateReservaDto) {
    // Convertimos la hora de string a objeto Date para MySQL si es necesario
    const horaDate = new Date(`1970-01-01T${dto.Hora}Z`);

    return this.prisma.reserva.create({
      data: {
        Id_Usuario: dto.Id_Usuario,
        fecha: new Date(dto.fecha),
        Hora: horaDate,
        Informacion_adicional: dto.Informacion_adicional,
        observacion_Id_Observaciones: dto.observacion_Id_Observaciones,
        empleado_Id_Usuario: dto.empleado_Id_Usuario,
        Estado: 'Pendiente' // Estado por defecto
      }
    });
  }

  // Actualizar estado (PUT)
  async updateEstado(id: number, estado: string) {
    return this.prisma.reserva.update({
      where: { ID_Reserva: id },
      data: { Estado: estado }
    });
  }
}