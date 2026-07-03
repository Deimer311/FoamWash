// src/usuarios/usuarios.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
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
        reservasComoCliente: {
          include: {
            servicios: true,
            observacion: true,
          },
          orderBy: { fecha: 'desc' },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Calcular estadísticas reales de reservas
    const reservas = user.reservasComoCliente ?? [];
    const total_reservas = reservas.length;
    const completadas = reservas.filter(r => r.Estado === 'Completado').length;
    const pendientes  = reservas.filter(r => r.Estado === 'Pendiente' || r.Estado === 'Confirmado').length;

    // Promedio de calificaciones de las reservas completadas
    const calificacionesIds = reservas.map(r => r.ID_Reserva);
    let calificacion_promedio: string | number = '—';
    if (calificacionesIds.length > 0) {
      const cals = await this.prisma.calificacion.findMany({
        where: { reserva_ID_Reserva: { in: calificacionesIds } },
        select: { puntaje: true },
      });
      if (cals.length > 0) {
        const suma = cals.reduce((s, c) => s + Number(c.puntaje), 0);
        calificacion_promedio = (suma / cals.length).toFixed(1);
      }
    }

    return {
      ...user,
      stats: {
        total_reservas,
        completadas,
        pendientes,
        calificacion_promedio,
      },
    };
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

    // ✅ Permitir edición de Correo con validación de duplicado
    if (data.Correo !== undefined) {
      if (data.Correo) {
        const duplicado = await this.prisma.usuario.findFirst({
          where: {
            Correo: data.Correo,
            NOT: { Id_Usuario: id },
          },
        });
        if (duplicado) throw new ConflictException('El correo ya está registrado en otro usuario');
        updateData.Correo = data.Correo;
      } else {
        updateData.Correo = null;
      }
    }

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

    // ✅ Actualizar datos de Empleado si aplica
    const hasEmpleadoFields =
      data.cargo !== undefined ||
      data.fecha_nacimiento !== undefined ||
      data.fecha_ingreso !== undefined ||
      data.dias_laborales !== undefined ||
      data.horario !== undefined ||
      data.especialidades !== undefined ||
      data.certificaciones !== undefined;

    if (hasEmpleadoFields && exists.rol_Id_Rol === 2) {
      const empleadoData: any = {};
      if (data.cargo !== undefined) empleadoData.cargo = data.cargo;
      
      if (data.fecha_nacimiento !== undefined) {
        if (!data.fecha_nacimiento || data.fecha_nacimiento.toString().trim() === '' || data.fecha_nacimiento === 'Invalid Date') {
          empleadoData.fecha_nacimiento = null;
        } else {
          const d = new Date(data.fecha_nacimiento);
          if (isNaN(d.getTime())) {
            throw new BadRequestException('Fecha de nacimiento no es válida');
          }
          empleadoData.fecha_nacimiento = d;
        }
      }

      if (data.fecha_ingreso !== undefined) {
        if (!data.fecha_ingreso || data.fecha_ingreso.toString().trim() === '' || data.fecha_ingreso === 'Invalid Date') {
          empleadoData.fecha_ingreso = null;
        } else {
          const d = new Date(data.fecha_ingreso);
          if (isNaN(d.getTime())) {
            throw new BadRequestException('Fecha de ingreso no es válida');
          }
          empleadoData.fecha_ingreso = d;
        }
      }

      if (data.dias_laborales !== undefined) empleadoData.dias_laborales = data.dias_laborales;
      if (data.horario !== undefined) empleadoData.horario = data.horario;
      if (data.especialidades !== undefined) empleadoData.especialidades = data.especialidades;
      if (data.certificaciones !== undefined) empleadoData.certificaciones = data.certificaciones;

      const existingEmp = await this.prisma.empleado.findFirst({
        where: { usuario_Id_Usuario: id },
      });

      if (existingEmp) {
        await this.prisma.empleado.update({
          where: { Id_Empleado: existingEmp.Id_Empleado },
          data: empleadoData,
        });
      } else {
        await this.prisma.empleado.create({
          data: {
            ...empleadoData,
            usuario_Id_Usuario: id,
          },
        });
      }
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

  async createEmpleado(data: any) {
    const { nombre, correo, password, telefono, cargo, especialidad, fecha_ingreso, certificaciones } = data;

    if (!correo) {
      throw new BadRequestException('El correo es obligatorio');
    }

    const existing = await this.prisma.usuario.findUnique({ where: { Correo: correo } });
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const password_hash = await bcrypt.hash(password || '123456', 12);

    let parsedFecha = null;
    if (fecha_ingreso && fecha_ingreso.toString().trim() !== '') {
      parsedFecha = new Date(fecha_ingreso);
      if (isNaN(parsedFecha.getTime())) {
        throw new BadRequestException('Fecha de ingreso no es válida');
      }
    }

    const newUser = await this.prisma.usuario.create({
      data: {
        Nombre: nombre,
        Correo: correo,
        password_hash,
        Telefono: telefono || null,
        rol_Id_Rol: 2, // 2 = Empleado
        estado: 'activo',
        empleado: {
          create: {
            cargo: cargo || null,
            especialidades: especialidad || null,
            fecha_ingreso: parsedFecha,
            certificaciones: certificaciones || null,
          },
        },
      },
      select: {
        Id_Usuario: true,
        Nombre: true,
        Correo: true,
        Telefono: true,
      },
    });

    return newUser;
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