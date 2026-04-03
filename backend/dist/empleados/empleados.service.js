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
                estado: true,
                foto_perfil: true,
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
    async getPerfil(id) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { Id_Usuario: id },
            include: {
                tipo_de_documento: { select: { nombre_del_documento: true } },
                empleado: true,
            },
        });
        if (!usuario)
            throw new common_1.NotFoundException('Empleado no encontrado');
        const empleado = usuario.empleado && usuario.empleado.length > 0 ? usuario.empleado[0] : null;
        return {
            Id_Usuario: usuario.Id_Usuario,
            Nombre: usuario.Nombre,
            Correo: usuario.Correo,
            Telefono: usuario.Telefono,
            Direccion: usuario.Direccion,
            N_Documento: usuario.N_Documento,
            foto_perfil: usuario.foto_perfil,
            tipo_de_documento: usuario.tipo_de_documento,
            cargo: empleado?.cargo || null,
            dias_laborales: empleado?.dias_laborales || null,
            horario: empleado?.horario || null,
            especialidades: empleado?.especialidades || null,
            certificaciones: empleado?.certificaciones || null,
            fecha_ingreso: empleado?.fecha_ingreso || null,
            fecha_nacimiento: empleado?.fecha_nacimiento || null,
        };
    }
    async getDesempeno(id) {
        const totalCompletados = await this.prisma.reserva.count({
            where: { empleado_Id_Usuario: id, Estado: 'Completado' },
        });
        const totalPendientes = await this.prisma.reserva.count({
            where: { empleado_Id_Usuario: id, Estado: 'Pendiente' },
        });
        const calificacionMediana = await this.prisma.calificacion.aggregate({
            _avg: { puntaje: true },
            where: { empleado_Id_Usuario: id },
        });
        const comentariosPositivos = await this.prisma.calificacion.count({
            where: { empleado_Id_Usuario: id, comentario: { contains: 'excelente' } },
        });
        return {
            servicios_completados: totalCompletados,
            servicios_pendientes: totalPendientes,
            calificacion_promedio: calificacionMediana._avg?.puntaje ?? '—',
            puntualidad: '—',
            comentarios_positivos: comentariosPositivos,
        };
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