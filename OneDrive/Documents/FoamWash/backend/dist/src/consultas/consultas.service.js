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
exports.ConsultasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ConsultasService = class ConsultasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async usuariosPorRol() {
        return this.prisma.rol.findMany({
            select: { Rol: true, _count: { select: { usuarios: true } } },
        });
    }
    async serviciosDisponibles() {
        return this.prisma.servicio.findMany({
            select: { Id_Servicio: true, Nombre_Servicio: true, Precio: true, descripcion: true },
            orderBy: { Nombre_Servicio: 'asc' },
        });
    }
    async serviciosPorCliente() {
        return this.prisma.usuario.findMany({
            where: { rol_Id_Rol: 3 },
            select: {
                Id_Usuario: true,
                Nombre: true,
                Correo: true,
                reservasComoCliente: {
                    select: { ID_Reserva: true, fecha: true, Estado: true, servicios: true },
                },
            },
        });
    }
    async agendaEmpleado(id) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.prisma.reserva.findMany({
            where: {
                empleado_Id_Usuario: id,
                fecha: { gte: today },
            },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Direccion: true } },
                servicios: { select: { Nombre_Servicio: true, Precio: true } },
            },
            orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
        });
    }
    async clientesSemana() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return this.prisma.reserva.findMany({
            where: { fecha: { gte: startOfWeek, lte: endOfWeek } },
            include: {
                cliente: { select: { Nombre: true, Correo: true, Telefono: true } },
            },
            distinct: ['Id_Usuario'],
        });
    }
    async reservasPorServicio() {
        return this.prisma.reserva.findMany({
            select: {
                ID_Reserva: true,
                Estado: true,
                fecha: true,
                _count: { select: { servicios: true } },
            },
            orderBy: { fecha: 'desc' },
        });
    }
    async reservasPorCliente() {
        return this.prisma.usuario.findMany({
            where: { rol_Id_Rol: 3 },
            select: {
                Id_Usuario: true,
                Nombre: true,
                Correo: true,
                _count: { select: { reservasComoCliente: true } },
            },
            orderBy: { Nombre: 'asc' },
        });
    }
    async empleadosServiciosMes() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return this.prisma.usuario.findMany({
            where: { rol_Id_Rol: 2 },
            select: {
                Id_Usuario: true,
                Nombre: true,
                reservasComoEmpleado: {
                    where: { fecha: { gte: startOfMonth, lte: endOfMonth } },
                    select: { ID_Reserva: true, fecha: true, Estado: true },
                },
            },
        });
    }
    async empleadosSinServicios() {
        return this.prisma.usuario.findMany({
            where: {
                rol_Id_Rol: 2,
                reservasComoEmpleado: { none: {} },
            },
            select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true },
        });
    }
    async agendaSemanalCompleta() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return this.prisma.reserva.findMany({
            where: {
                fecha: { gte: today, lte: nextWeek },
                empleado_Id_Usuario: { not: null },
            },
            include: {
                empleado: { select: { Nombre: true } },
                cliente: { select: { Nombre: true, Telefono: true } },
                servicios: { select: { Nombre_Servicio: true } },
            },
            orderBy: [{ fecha: 'asc' }, { Hora: 'asc' }],
        });
    }
    async todas() {
        const [c1, c2, c3, c5, c6, c7, c9] = await Promise.all([
            this.usuariosPorRol(),
            this.serviciosDisponibles(),
            this.serviciosPorCliente(),
            this.clientesSemana(),
            this.reservasPorServicio(),
            this.reservasPorCliente(),
            this.empleadosSinServicios(),
        ]);
        return {
            consulta1_usuariosPorRol: c1,
            consulta2_serviciosDisponibles: c2,
            consulta3_serviciosPorCliente: c3,
            consulta5_clientesSemana: c5,
            consulta6_reservasPorServicio: c6,
            consulta7_reservasPorCliente: c7,
            consulta9_empleadosSinServicios: c9,
        };
    }
};
exports.ConsultasService = ConsultasService;
exports.ConsultasService = ConsultasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConsultasService);
//# sourceMappingURL=consultas.service.js.map