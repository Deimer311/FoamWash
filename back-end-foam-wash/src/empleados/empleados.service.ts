import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  // 1. Listar empleados (Usuarios con Rol de empleado y su tabla extendida)
  async findAll() {
    return this.prisma.usuario.findMany({
      where: {
        estado: 'activo',
        rol_Id_Rol: 2, // Asumiendo que 2 es el ID de Empleado en tu tabla 'rol'
      },
      include: {
        empleado: true, // Relación con la tabla empleado
      },
      orderBy: { Nombre: 'asc' },
    });
  }

  // 2. Agenda de hoy para un empleado específico
  async getReservasHoy(idUsuario: number) {
    // Obtenemos la fecha actual en formato YYYY-MM-DD
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return this.prisma.reserva.findMany({
      where: {
        empleado_Id_Usuario: idUsuario, // Nombre exacto de tu schema
        fecha: {
          gte: hoy,
          lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        usuario: { // El cliente que reservó
          select: { Nombre: true, Telefono: true }
        },
        observacion: true
      },
    });
  }

  // 3. Actualizar perfil (Usa los nombres exactos de tu modelo Usuario y Empleado)
  async updatePerfil(idUsuario: number, dto: UpdateEmpleadoDto) {
    return this.prisma.usuario.update({
      where: { Id_Usuario: idUsuario },
      data: {
        Nombre: dto.Nombre,
        Telefono: dto.Telefono,
        // Actualización anidada en la tabla empleado
        empleado: {
          updateMany: {
            where: { usuario_Id_Usuario: idUsuario },
            data: {
              cargo: dto.cargo,
              especialidades: dto.especialidades,
            },
          },
        },
      },
    });
  }
}