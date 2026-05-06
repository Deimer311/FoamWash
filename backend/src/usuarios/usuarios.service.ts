// src/usuarios/usuarios.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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

    // Construir objeto de actualización de forma segura
    const updateData: any = {};

    if (data.Nombre      !== undefined) updateData.Nombre      = data.Nombre;
    if (data.Telefono    !== undefined) updateData.Telefono    = data.Telefono;
    if (data.Direccion   !== undefined) updateData.Direccion   = data.Direccion;
    if (data.foto_perfil !== undefined) updateData.foto_perfil = data.foto_perfil;

    // ✅ Tarea 7 — permitir edición de cédula con validación de duplicado
    if (data.N_Documento !== undefined) {
      const duplicado = await this.prisma.usuario.findFirst({
        where: {
          N_Documento: data.N_Documento,
          NOT: { Id_Usuario: id },
        },
      });
      if (duplicado) throw new ConflictException('El número de documento ya está registrado en otro usuario');
      updateData.N_Documento = data.N_Documento;
    }

    // ✅ Tarea 9 — permitir cambio de tipo de documento con validación
    if (data.tipo_de_documento_id_tipo_de_documento !== undefined) {
      const tipo = await this.prisma.tipoDeDocumento.findUnique({
        where: { idTipo_de_Documento: data.tipo_de_documento_id_tipo_de_documento },
      });
      if (!tipo) throw new BadRequestException('Tipo de documento no válido');
      updateData.tipo_de_documento_id_tipo_de_documento = data.tipo_de_documento_id_tipo_de_documento;
    }

    return this.prisma.usuario.update({
      where: { Id_Usuario: id },
      data: updateData,
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
        Direccion: true,
        N_Documento: true,
        estado: true,
        foto_perfil: true,
        tipo_de_documento: {
          select: {
            idTipo_de_Documento: true,
            nombre_del_documento: true,
          },
        },
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

  // ── Analytics ─────────────────────────────────────────────────────────────

  async usuariosPorRol() {
    return this.prisma.rol.findMany({
      include: { _count: { select: { usuarios: true } } },
    });
  }

  async empleadosActivos() {
    return this.prisma.usuario.findMany({
      where: { rol_Id_Rol: 2, estado: 'activo' },
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
        last_login: true,
      },
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