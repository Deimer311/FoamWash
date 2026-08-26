// src/usuarios/usuarios.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmpleadosService } from '../empleados/empleados.service';
@Injectable()
export class UsuariosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly empleadosService: EmpleadosService
  ) {}

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

    const updateData: any = {};
    if (data.Nombre      !== undefined) updateData.Nombre      = data.Nombre;
    if (data.Telefono    !== undefined) updateData.Telefono    = data.Telefono;
    if (data.Direccion   !== undefined) updateData.Direccion   = data.Direccion;
    if (data.foto_perfil !== undefined) updateData.foto_perfil = data.foto_perfil;

    await this.validateCorreo(id, data.Correo, updateData);
    await this.validateDocumento(id, data.N_Documento, updateData);
    await this.validateTipoDocumento(data.tipo_de_documento_id_tipo_de_documento, updateData);

    if (exists.rol_Id_Rol === 2) {
      await this.handleEmpleadoUpdate(id, data);
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

  private async validateCorreo(id: number, correo: string | undefined | null, updateData: any) {
    if (correo !== undefined) {
      if (correo) {
        const duplicado = await this.prisma.usuario.findFirst({
          where: { Correo: correo, NOT: { Id_Usuario: id } },
        });
        if (duplicado) throw new ConflictException('El correo ya está registrado en otro usuario');
        updateData.Correo = correo;
      } else {
        updateData.Correo = null;
      }
    }
  }

  private async validateDocumento(id: number, documento: string | undefined, updateData: any) {
    if (documento !== undefined) {
      const duplicado = await this.prisma.usuario.findFirst({
        where: { N_Documento: documento, NOT: { Id_Usuario: id } },
      });
      if (duplicado) throw new ConflictException('El número de documento ya está registrado en otro usuario');
      updateData.N_Documento = documento;
    }
  }

  private async validateTipoDocumento(tipoId: number | undefined, updateData: any) {
    if (tipoId !== undefined) {
      const tipo = await this.prisma.tipoDeDocumento.findUnique({
        where: { idTipo_de_Documento: tipoId },
      });
      if (!tipo) throw new BadRequestException('Tipo de documento no válido');
      updateData.tipo_de_documento_id_tipo_de_documento = tipoId;
    }
  }

  private async handleEmpleadoUpdate(id: number, data: any) {
    const hasEmpleadoFields =
      data.cargo !== undefined ||
      data.fecha_nacimiento !== undefined ||
      data.fecha_ingreso !== undefined ||
      data.dias_laborales !== undefined ||
      data.horario !== undefined ||
      data.especialidades !== undefined ||
      data.certificaciones !== undefined;

    if (!hasEmpleadoFields) return;

    const empleadoData: any = {};
    if (data.cargo !== undefined) empleadoData.cargo = data.cargo;

    this.assignDateIfValid(empleadoData, 'fecha_nacimiento', data.fecha_nacimiento);
    this.assignDateIfValid(empleadoData, 'fecha_ingreso', data.fecha_ingreso);

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

  private assignDateIfValid(target: any, field: string, value: any) {
    if (value === undefined) return;
    if (!value || value.toString().trim() === '' || value === 'Invalid Date') {
      target[field] = null;
    } else {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        const fieldName = field === 'fecha_nacimiento' ? 'nacimiento' : 'ingreso';
        throw new BadRequestException(`Fecha de ${fieldName} no es válida`);
      }
      target[field] = d;
    }
  }

  async createEmpleado(data: any) {
    return this.empleadosService.createEmpleado(data);
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