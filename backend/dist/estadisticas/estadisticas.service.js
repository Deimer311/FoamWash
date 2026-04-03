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
exports.EstadisticasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let EstadisticasService = class EstadisticasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(periodo) {
        let dateFilter = {};
        const now = new Date();
        if (periodo) {
            switch (periodo) {
                case 'semanal':
                    dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
                    break;
                case 'mensual':
                    dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                    break;
                case 'trimestral':
                    dateFilter = { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
                    break;
                case 'anual':
                    dateFilter = { gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
                    break;
                default:
                    break;
            }
        }
        const [totalClientes, totalReservas, reservasCompletadas, reservasPendientes, ingresos, totalServicios] = await Promise.all([
            this.prisma.usuario.count({ where: { rol_Id_Rol: 3, ...(periodo ? { fecha_registro: dateFilter } : {}) } }),
            this.prisma.reserva.count({ where: periodo ? { fecha: dateFilter } : {} }),
            this.prisma.reserva.count({ where: { Estado: 'Completado', ...(periodo ? { fecha: dateFilter } : {}) } }),
            this.prisma.reserva.count({ where: { Estado: 'Pendiente', ...(periodo ? { fecha: dateFilter } : {}) } }),
            this.prisma.cotizacion.aggregate({ _sum: { Precio_cotizado: true }, where: periodo ? {} : {} }),
            this.prisma.servicio.count(),
        ]);
        return {
            Total_Clientes: totalClientes,
            Total_Reservas: totalReservas,
            Reservas_Completadas: reservasCompletadas,
            Reservas_Pendientes: reservasPendientes,
            Ingresos_Totales: ingresos._sum.Precio_cotizado || 0,
            Servicios_Ofrecidos: totalServicios,
        };
    }
};
exports.EstadisticasService = EstadisticasService;
exports.EstadisticasService = EstadisticasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EstadisticasService);
//# sourceMappingURL=estadisticas.service.js.map