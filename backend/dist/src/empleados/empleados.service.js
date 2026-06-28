"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmpleadosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EmpleadosService = class EmpleadosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.usuario.findMany({
            where: { rol_Id_Rol: 2 },
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
                empleado: {
                    select: {
                        cargo: true,
                        fecha_nacimiento: true,
                        fecha_ingreso: true,
                        dias_laborales: true,
                        horario: true,
                        especialidades: true,
                        certificaciones: true,
                        contacto_emergencia_nombre: true,
                        contacto_emergencia_telefono: true,
                    },
                    take: 1,
                },
            },
        });
    }
    async getReservasHoy(id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.prisma.reserva.findMany({
            where: {
                empleado_Id_Usuario: id,
                fecha: { gte: today, lt: tomorrow },
            },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
                servicios: { select: { Nombre_Servicio: true, Precio: true, descripcion: true } },
            },
            orderBy: { Hora: 'asc' },
        });
    }
    async getReservasSemana(id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return this.prisma.reserva.findMany({
            where: {
                empleado_Id_Usuario: id,
                fecha: { gte: today, lte: nextWeek },
            },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
                servicios: { select: { Nombre_Servicio: true, Precio: true } },
            },
            orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
        });
    }
    async getSinServicios() {
        return this.prisma.usuario.findMany({
            where: {
                rol_Id_Rol: 2,
                reservasComoEmpleado: { none: {} },
            },
            select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true },
        });
    }
    async getServiciosFinalizados() {
        return this.prisma.reserva.findMany({
            where: {
                Estado: 'Completado',
                empleado_Id_Usuario: { not: null },
            },
            include: {
                empleado: { select: { Nombre: true } },
                cliente: { select: { Nombre: true } },
                servicios: true,
            },
            orderBy: { fecha: 'desc' },
        });
    }
    async getProductividadGeneral() {
        return this.prisma.usuario.findMany({
            where: { rol_Id_Rol: 2 },
            select: {
                Id_Usuario: true,
                Nombre: true,
                _count: { select: { reservasComoEmpleado: true } },
            },
            orderBy: { Nombre: 'asc' },
        });
    }
    async getHistorial(id) {
        return this.prisma.reserva.findMany({
            where: { empleado_Id_Usuario: id },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
                servicios: { select: { Nombre_Servicio: true, Precio: true, descripcion: true } },
                observacion: { select: { Observaciones: true, estado: true } },
            },
            orderBy: [{ fecha: 'desc' }, { Hora: 'desc' }],
        });
    }
    async getCompletados(id) {
        return this.prisma.reserva.findMany({
            where: { empleado_Id_Usuario: id, Estado: 'Completado' },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
                servicios: { select: { Nombre_Servicio: true, Precio: true } },
            },
            orderBy: [{ fecha: 'desc' }],
        });
    }
    async getPendientes(id) {
        return this.prisma.reserva.findMany({
            where: {
                empleado_Id_Usuario: id,
                Estado: { in: ['Pendiente', 'Confirmado', 'En Proceso'] },
            },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
                servicios: { select: { Nombre_Servicio: true, Precio: true } },
            },
            orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
        });
    }
    async getPerfilCompleto(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { Id_Usuario: id },
            select: {
                Id_Usuario: true,
                Nombre: true,
                Correo: true,
                Telefono: true,
                N_Documento: true,
                Direccion: true,
                foto_perfil: true,
                estado: true,
                fecha_registro: true,
                tipo_de_documento: {
                    select: {
                        idTipo_de_Documento: true,
                        nombre_del_documento: true,
                    },
                },
                rol: {
                    select: { Rol: true },
                },
                empleado: {
                    select: {
                        cargo: true,
                        fecha_nacimiento: true,
                        fecha_ingreso: true,
                        dias_laborales: true,
                        horario: true,
                        especialidades: true,
                        certificaciones: true,
                        contacto_emergencia_nombre: true,
                        contacto_emergencia_telefono: true,
                    },
                    take: 1,
                },
            },
        });
        if (!usuario)
            throw new common_1.NotFoundException(`Empleado con id ${id} no encontrado`);
        const emp = usuario.empleado?.[0] ?? null;
        return {
            Id_Usuario: usuario.Id_Usuario,
            Nombre: usuario.Nombre,
            Correo: usuario.Correo,
            Telefono: usuario.Telefono,
            N_Documento: usuario.N_Documento,
            Direccion: usuario.Direccion,
            foto_perfil: usuario.foto_perfil,
            estado: usuario.estado,
            fecha_registro: usuario.fecha_registro,
            tipo_de_documento: usuario.tipo_de_documento,
            rol: usuario.rol,
            cargo: emp?.cargo ?? null,
            fecha_nacimiento: emp?.fecha_nacimiento ?? null,
            fecha_ingreso: emp?.fecha_ingreso ?? null,
            dias_laborales: emp?.dias_laborales ?? null,
            horario: emp?.horario ?? null,
            especialidades: emp?.especialidades ?? null,
            certificaciones: emp?.certificaciones ?? null,
            contacto_emergencia_nombre: emp?.contacto_emergencia_nombre ?? null,
            contacto_emergencia_telefono: emp?.contacto_emergencia_telefono ?? null,
        };
    }
    async getDesempeno(id) {
        const ahora = new Date();
        const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
        const [serviciosMes, calificaciones] = await Promise.all([
            this.prisma.reserva.count({
                where: {
                    empleado_Id_Usuario: id,
                    Estado: 'Completado',
                    fecha: { gte: inicioMes, lte: finMes },
                },
            }),
            this.prisma.calificacion.findMany({
                where: { empleado_Id_Usuario: id },
                select: { puntaje: true, comentario: true },
            }),
        ]);
        const totalCalificaciones = calificaciones.length;
        const calificacionPromedio = totalCalificaciones > 0
            ? Math.round((calificaciones.reduce((s, c) => s + Number(c.puntaje), 0) /
                totalCalificaciones) * 10) / 10
            : null;
        const comentarios = calificaciones.filter((c) => c.comentario && c.comentario.trim() !== '').length;
        return {
            servicios_mes: serviciosMes,
            calificacion_promedio: calificacionPromedio,
            total_calificaciones: totalCalificaciones,
            comentarios: comentarios,
            puntualidad: null,
        };
    }
    async updateFoto(id, fotoUrl) {
        return this.prisma.usuario.update({
            where: { Id_Usuario: id },
            data: { foto_perfil: fotoUrl },
            select: { Id_Usuario: true, foto_perfil: true },
        });
    }
};
exports.EmpleadosService = EmpleadosService;
exports.EmpleadosService = EmpleadosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmpleadosService);
//# sourceMappingURL=empleados.service.js.map