// src/usuarios/usuarios.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.usuario.findMany({
      where: { estado: 'activo' },
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
            empleado: { select: { Nombre: true } },
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
    if (data.nombre      !== undefined && data.Nombre === undefined) updateData.Nombre = data.nombre;
    if (data.Telefono    !== undefined) updateData.Telefono    = data.Telefono;
    if (data.telefono    !== undefined && data.Telefono === undefined) updateData.Telefono = data.telefono;
    if (data.Direccion   !== undefined) updateData.Direccion   = data.Direccion;
    if (data.direccion   !== undefined && data.Direccion === undefined) updateData.Direccion = data.direccion;
    if (data.foto_perfil !== undefined) updateData.foto_perfil = data.foto_perfil;

    // Permitir edición de Correo con validación de duplicado
    if (data.Correo !== undefined || data.correo !== undefined) {
      const targetCorreo = data.Correo ?? data.correo;
      if (targetCorreo) {
        const duplicado = await this.prisma.usuario.findFirst
          ? await this.prisma.usuario.findFirst({
              where: {
                Correo: targetCorreo,
                NOT: { Id_Usuario: id },
              },
            })
          : await this.prisma.usuario.findUnique({ where: { Correo: targetCorreo } });
        if (duplicado && duplicado.Id_Usuario !== id) throw new ConflictException('El correo ya está registrado en otro usuario');
        updateData.Correo = targetCorreo;
      } else {
        updateData.Correo = null;
      }
    }

    // Permitir edición de cédula con validación de duplicado
    if (data.N_Documento !== undefined) {
      if (data.N_Documento) {
        const duplicado = await this.prisma.usuario.findFirst
          ? await this.prisma.usuario.findFirst({
              where: {
                N_Documento: data.N_Documento,
                NOT: { Id_Usuario: id },
              },
            })
          : await this.prisma.usuario.findUnique({ where: { N_Documento: data.N_Documento } });
        if (duplicado && duplicado.Id_Usuario !== id) throw new ConflictException('El número de documento ya está registrado en otro usuario');
        updateData.N_Documento = data.N_Documento;
      } else {
        updateData.N_Documento = null;
      }
    }

    // Permitir cambio de tipo de documento con validación
    if (data.tipo_de_documento_id_tipo_de_documento !== undefined) {
      const tipo = await this.prisma.tipoDeDocumento.findUnique({
        where: { idTipo_de_Documento: data.tipo_de_documento_id_tipo_de_documento },
      });
      if (!tipo) throw new BadRequestException('Tipo de documento no válido');
      updateData.tipo_de_documento_id_tipo_de_documento = data.tipo_de_documento_id_tipo_de_documento;
    }

    // Actualizar datos de Empleado si aplica
    const hasEmpleadoFields =
      data.cargo !== undefined ||
      data.especialidad !== undefined ||
      data.especialidades !== undefined ||
      data.certificaciones !== undefined ||
      data.fecha_nacimiento !== undefined ||
      data.fecha_ingreso !== undefined ||
      data.dias_laborales !== undefined ||
      data.horario !== undefined;

    if (hasEmpleadoFields && (exists.rol_Id_Rol === 2 || data.cargo !== undefined)) {
      const empleadoData: any = {};
      if (data.cargo !== undefined) empleadoData.cargo = data.cargo;
      if (data.especialidad !== undefined || data.especialidades !== undefined) {
        empleadoData.especialidades = data.especialidades ?? data.especialidad;
      }
      if (data.certificaciones !== undefined) empleadoData.certificaciones = data.certificaciones;

      if (data.fecha_nacimiento !== undefined) {
        if (!data.fecha_nacimiento || data.fecha_nacimiento.toString().trim() === '' || data.fecha_nacimiento === 'Invalid Date') {
          empleadoData.fecha_nacimiento = null;
        } else {
          const d = new Date(data.fecha_nacimiento);
          if (Number.isNaN(d.getTime())) {
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
          if (Number.isNaN(d.getTime())) {
            throw new BadRequestException('Fecha de ingreso no es válida');
          }
          empleadoData.fecha_ingreso = d;
        }
      }

      if (data.dias_laborales !== undefined) empleadoData.dias_laborales = data.dias_laborales;
      if (data.horario !== undefined) empleadoData.horario = data.horario;

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
        empleado: true,
      },
    });
  }

  async createEmpleado(data: any) {
    const {
      nombre, Nombre,
      correo, Correo,
      password,
      telefono, Telefono,
      N_Documento,
      Direccion, direccion,
      cargo,
      especialidad, especialidades,
      fecha_ingreso,
      certificaciones,
      dias_laborales,
      horario,
      contacto_emergencia_nombre,
      contacto_emergencia_telefono,
    } = data;

    const userNombre = (nombre || Nombre || '').trim();
    const userCorreo = (correo || Correo || '').trim().toLowerCase();
    const userTel = (telefono || Telefono || '').trim();
    const userDir = (direccion || Direccion || '').trim();
    const userDoc = N_Documento ? N_Documento.toString().trim() : null;

    if (!userNombre) {
      throw new BadRequestException('El nombre completo del empleado es obligatorio');
    }

    if (!userCorreo) {
      throw new BadRequestException('El correo electrónico es obligatorio');
    }

    const existingEmail = await this.prisma.usuario.findUnique({ where: { Correo: userCorreo } });
    if (existingEmail) {
      throw new ConflictException('El correo ya está registrado en el sistema');
    }

    if (userDoc) {
      const existingDoc = await this.prisma.usuario.findUnique({ where: { N_Documento: userDoc } });
      if (existingDoc) {
        throw new ConflictException('El número de documento ya está registrado en otro usuario');
      }
    }

    const password_hash = await bcrypt.hash(password || '123456', 10);

    let parsedFecha = null;
    if (fecha_ingreso && fecha_ingreso.toString().trim() !== '') {
      parsedFecha = new Date(fecha_ingreso);
      if (Number.isNaN(parsedFecha.getTime())) {
        throw new BadRequestException('Fecha de ingreso no es válida');
      }
    }

    const newUser = await this.prisma.usuario.create({
      data: {
        Nombre: userNombre,
        Correo: userCorreo,
        password_hash,
        Telefono: userTel || null,
        Direccion: userDir || null,
        N_Documento: userDoc || null,
        rol_Id_Rol: 2, // 2 = Empleado
        estado: 'activo',
        empleado: {
          create: {
            cargo: cargo || null,
            especialidades: especialidades || especialidad || null,
            fecha_ingreso: parsedFecha,
            certificaciones: certificaciones || null,
            dias_laborales: dias_laborales || null,
            horario: horario || null,
            contacto_emergencia_nombre: contacto_emergencia_nombre || null,
            contacto_emergencia_telefono: contacto_emergencia_telefono || null,
          },
        },
      },
      include: {
        empleado: true,
        rol: { select: { Rol: true } },
        tipo_de_documento: true,
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