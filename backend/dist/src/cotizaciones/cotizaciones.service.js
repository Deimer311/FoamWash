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
exports.CotizacionesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CotizacionesService = class CotizacionesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getServicios() {
        return this.prisma.servicio.findMany({
            select: { Id_Servicio: true, Nombre_Servicio: true, Precio: true, descripcion: true, imagen_url: true },
            orderBy: { Nombre_Servicio: 'asc' },
        });
    }
    async findAll() {
        return this.prisma.cotizacion.findMany({
            include: {
                cliente: { select: { Nombre: true, Correo: true, Telefono: true } },
                servicios: true,
            },
            orderBy: { fecha_cotizacion: 'desc' },
        });
    }
    async create(data) {
        return this.prisma.cotizacion.create({
            data: {
                Precio_cotizado: data.Precio_cotizado,
                Cantidad: data.Cantidad,
                'Tamaño': data['Tamaño'] ?? data.Tamano ?? 'Estándar',
                Id_usuario: data.Id_usuario,
                fecha_cotizacion: data.fecha_cotizacion ?? new Date(),
                ...(data.Id_servicio
                    ? { servicios: { connect: { Id_Servicio: data.Id_servicio } } }
                    : {}),
            },
        });
    }
    async sincronizar(items, userId) {
        const results = [];
        21;
        for (const item of items) {
            const existing = await this.prisma.cotizacion.findFirst({
                where: { Id_usuario: userId, servicios: { some: { Id_Servicio: item.servicioId || item.id } } },
            });
            if (!existing) {
                const created = await this.prisma.cotizacion.create({
                    data: {
                        Precio_cotizado: item.precio,
                        Cantidad: item.cantidad || 1,
                        'Tamaño': item['Tamaño'] ?? item.Tamano ?? item.tamano ?? item['tamaño'] ?? 'Estándar',
                        Id_usuario: userId,
                        fecha_cotizacion: new Date(),
                        servicios: { connect: { Id_Servicio: item.servicioId || item.id } },
                    },
                });
                results.push(created);
            }
        }
        return results;
    }
};
exports.CotizacionesService = CotizacionesService;
exports.CotizacionesService = CotizacionesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CotizacionesService);
//# sourceMappingURL=cotizaciones.service.js.map