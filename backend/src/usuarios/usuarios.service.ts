// src/usuarios/usuarios.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
        N_Documento: true,
        Direccion: true,
        estado: true,
        fecha_registro: true,
        foto_perfil: true,
        rol: { select: { Rol: true } },
        tipo_de_documento: { select: { nombre_del_documento: true } },
      },
      orderBy: { Nombre: 'asc' },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { Id_Usuario: id },
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
        N_Documento: true,
        Direccion: true,
        estado: true,
        fecha_registro: true,
        last_login: true,
        foto_perfil: true,
        rol: true,
        tipo_de_documento: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, data: any) {
    const exists = await this.prisma.usuario.findUnique({ where: { Id_Usuario: id } });
    if (!exists) throw new NotFoundException('Usuario no encontrado');
    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data,
      select: {
        Id_Usuario: true, Nombre: true, Correo: true, Telefono: true, Direccion: true, estado: true,
      },
    });
  }

  async softDelete(id: number) {
    const exists = await this.prisma.usuario.findUnique({ where: { Id_Usuario: id } });
    if (!exists) throw new NotFoundException('Usuario no encontrado');
    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data: { estado: 'inactivo' },
    });
  }

  // Analytics
  async usuariosPorRol() {
    return this.prisma.rol.findMany({
      include: { _count: { select: { usuarios: true } } },
    });
  }

  async empleadosActivos() {
    return this.prisma.usuario.findMany({
      where: { rol_Id_Rol: 2, estado: 'activo' },
      select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true, last_login: true },
    });
  }

  async historialCliente(id: number) {
    return this.prisma.reserva.findMany({
      where: { Id_Usuario: id },
      include: { servicios: true, observacion: true },
      orderBy: { fecha: 'desc' },
    });
  }
}
