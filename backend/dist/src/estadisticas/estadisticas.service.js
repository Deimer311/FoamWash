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
        const today = new Date();
        let startDate = new Date('2000-01-01');
        if (periodo) {
            switch (periodo.toLowerCase()) {
                case 'semanal':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - today.getDay());
                    break;
                case 'mensual':
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'trimestral':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
                    break;
                case 'semestral':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
                    break;
                case 'anual':
                    startDate = new Date(today.getFullYear(), 0, 1);
                    break;
            }
        }
        const [totalReservas, reservasCompletadas, reservasPendientes, totalServicios, reservasIngresos] = await Promise.all([
            this.prisma.reserva.count({
                where: { fecha: { gte: startDate } }
            }),
            this.prisma.reserva.count({
                where: {
                    Estado: { in: ['Completado', 'Finalizado'] },
                    fecha: { gte: startDate }
                }
            }),
            this.prisma.reserva.count({
                where: {
                    Estado: { notIn: ['Completado', 'Finalizado', 'Cancelado'] },
                    fecha: { gte: startDate }
                }
            }),
            this.prisma.servicio.count(),
            this.prisma.reserva.findMany({
                where: { fecha: { gte: startDate } },
                include: { servicios: true }
            }),
        ]);
        const clientesUnicos = new Set(reservasIngresos.map(r => r.Id_Usuario));
        const totalClientes = clientesUnicos.size;
        const ingresosTotales = reservasIngresos.reduce((sum, res) => {
            if (res.Estado !== 'Completado' && res.Estado !== 'Finalizado')
                return sum;
            const sumaServicios = res.servicios.reduce((sSum, serv) => sSum + Number(serv.Precio || 0), 0);
            return sum + sumaServicios;
        }, 0);
        return {
            Total_Clientes: totalClientes,
            Total_Reservas: totalReservas,
            Reservas_Completadas: reservasCompletadas,
            Reservas_Pendientes: reservasPendientes,
            Ingresos_Totales: ingresosTotales,
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