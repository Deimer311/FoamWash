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
exports.ServiciosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServiciosService = class ServiciosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.servicio.findMany({
            select: {
                Id_Servicio: true,
                Nombre_Servicio: true,
                Precio: true,
                descripcion: true,
                imagen_url: true,
                estado: true,
                duracion_estimada: true,
            },
            orderBy: { Nombre_Servicio: 'asc' },
        });
    }
    async findOne(id) {
        const servicio = await this.prisma.servicio.findUnique({
            where: { Id_Servicio: id },
        });
        if (!servicio)
            throw new common_1.NotFoundException('Servicio no encontrado');
        return servicio;
    }
    async create(data) {
        return this.prisma.servicio.create({
            data: {
                Nombre_Servicio: data.Nombre_Servicio,
                Precio: data.Precio,
                descripcion: data.descripcion ?? null,
                imagen_url: data.imagen_url ?? null,
            },
        });
    }
    async update(id, data) {
        const exists = await this.prisma.servicio.findUnique({ where: { Id_Servicio: id } });
        if (!exists)
            throw new common_1.NotFoundException('Servicio no encontrado');
        return this.prisma.servicio.update({ where: { Id_Servicio: id }, data });
    }
    async remove(id) {
        const exists = await this.prisma.servicio.findUnique({ where: { Id_Servicio: id } });
        if (!exists)
            throw new common_1.NotFoundException('Servicio no encontrado');
        return this.prisma.servicio.delete({ where: { Id_Servicio: id } });
    }
    async masSolicitados() {
        return this.prisma.servicio.findMany({
            include: { reserva: true },
            orderBy: { Id_Servicio: 'asc' },
            take: 10,
        });
    }
    async programadosHoy() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.prisma.servicio.findMany({
            where: {
                reserva: {
                    fecha: { gte: today, lt: tomorrow },
                },
            },
            include: {
                reserva: {
                    include: {
                        cliente: { select: { Nombre: true } },
                        empleado: { select: { Nombre: true } },
                    },
                },
            },
        });
    }
};
exports.ServiciosService = ServiciosService;
exports.ServiciosService = ServiciosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiciosService);
//# sourceMappingURL=servicios.service.js.map