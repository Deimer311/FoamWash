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
exports.ReservasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReservasService = class ReservasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.reserva.findMany({
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Correo: true } },
                observacion: { select: { Observaciones: true, estado: true } },
                empleado: { select: { Nombre: true } },
                servicios: true,
            },
            orderBy: [{ fecha: 'desc' }],
        });
    }
    async findByEstado(estado) {
        return this.prisma.reserva.findMany({
            where: { Estado: estado },
            include: {
                cliente: { select: { Nombre: true, Telefono: true } },
            },
            orderBy: [{ fecha: 'asc' }],
        });
    }
    async findOne(id) {
        const reserva = await this.prisma.reserva.findUnique({
            where: { ID_Reserva: id },
            include: {
                cliente: { select: { Nombre: true, Telefono: true, Correo: true } },
                empleado: { select: { Nombre: true } },
                servicios: true,
                observacion: true,
            },
        });
        if (!reserva)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return reserva;
    }
    async asignarEmpleadoAutomatico(fecha) {
        const empleadosActivos = await this.prisma.usuario.findMany({
            where: {
                rol_Id_Rol: 2,
                estado: 'activo',
            },
            select: { Id_Usuario: true, Nombre: true },
        });
        if (empleadosActivos.length === 0)
            return null;
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        const cargaPorEmpleado = await Promise.all(empleadosActivos.map(async (emp) => {
            const cantidad = await this.prisma.reserva.count({
                where: {
                    empleado_Id_Usuario: emp.Id_Usuario,
                    fecha: { gte: fechaInicio, lte: fechaFin },
                    Estado: { notIn: ['Cancelado'] },
                },
            });
            return { id: emp.Id_Usuario, nombre: emp.Nombre, carga: cantidad };
        }));
        cargaPorEmpleado.sort((a, b) => a.carga - b.carga);
        return cargaPorEmpleado[0].id;
    }
    async create(data) {
        let fechaISO = undefined;
        if (data.fecha) {
            const soloFecha = data.fecha.split('T')[0];
            const horaStr = data.Hora && data.Hora.match(/^\d{2}:\d{2}$/)
                ? data.Hora + ':00'
                : '00:00:00';
            fechaISO = new Date(`${soloFecha}T${horaStr}.000Z`);
        }
        let horaISO = undefined;
        if (data.Hora && data.Hora.match(/^\d{2}:\d{2}$/)) {
            const soloFecha = data.fecha
                ? data.fecha.split('T')[0]
                : new Date().toISOString().split('T')[0];
            horaISO = new Date(`${soloFecha}T${data.Hora}:00.000Z`);
        }
        const observacionData = data.observacion_Id_Observaciones
            ? { connect: { Id_Observaciones: data.observacion_Id_Observaciones } }
            : { create: { Observaciones: data.Informacion_adicional ?? '', estado: 'Pendiente' } };
        let empleadoId = data.empleado_Id_Usuario ?? null;
        if (!empleadoId && fechaISO) {
            empleadoId = await this.asignarEmpleadoAutomatico(fechaISO);
        }
        const reserva = await this.prisma.reserva.create({
            data: {
                Estado: data.Estado ?? 'Pendiente',
                fecha: fechaISO,
                Hora: horaISO,
                Informacion_adicional: data.Informacion_adicional,
                cliente: { connect: { Id_Usuario: data.Id_Usuario } },
                empleado: empleadoId
                    ? { connect: { Id_Usuario: empleadoId } }
                    : undefined,
                observacion: observacionData,
            },
            include: {
                empleado: { select: { Nombre: true, Id_Usuario: true } },
            },
        });
        return {
            success: true,
            data: {
                ...reserva,
                empleado_asignado: reserva.empleado?.Nombre ?? 'Sin asignar',
            },
        };
    }
    async update(id, data) {
        const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
        if (!exists)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return this.prisma.reserva.update({ where: { ID_Reserva: id }, data });
    }
    async updateEstado(id, estado) {
        const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
        if (!exists)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return this.prisma.reserva.update({
            where: { ID_Reserva: id },
            data: { Estado: estado },
        });
    }
    async remove(id) {
        const exists = await this.prisma.reserva.findUnique({ where: { ID_Reserva: id } });
        if (!exists)
            throw new common_1.NotFoundException('Reserva no encontrada');
        return this.prisma.reserva.delete({ where: { ID_Reserva: id } });
    }
    async findByCliente(clienteId) {
        return this.prisma.reserva.findMany({
            where: { Id_Usuario: clienteId },
            include: { servicios: true, observacion: true },
            orderBy: { fecha: 'desc' },
        });
    }
};
exports.ReservasService = ReservasService;
exports.ReservasService = ReservasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservasService);
//# sourceMappingURL=reservas.service.js.map