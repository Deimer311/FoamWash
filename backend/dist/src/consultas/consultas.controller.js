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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const consultas_service_1 = require("./consultas.service");
let ConsultasController = class ConsultasController {
    constructor(consultasService) {
        this.consultasService = consultasService;
    }
    async c1() {
        const data = await this.consultasService.usuariosPorRol();
        return { success: true, consulta: 1, data };
    }
    async c2() {
        const data = await this.consultasService.serviciosDisponibles();
        return { success: true, consulta: 2, data };
    }
    async c3() {
        const data = await this.consultasService.serviciosPorCliente();
        return { success: true, consulta: 3, data };
    }
    async c4(id) {
        const data = await this.consultasService.agendaEmpleado(id);
        return { success: true, consulta: 4, data };
    }
    async c5() {
        const data = await this.consultasService.clientesSemana();
        return { success: true, consulta: 5, data };
    }
    async c6() {
        const data = await this.consultasService.reservasPorServicio();
        return { success: true, consulta: 6, data };
    }
    async c7() {
        const data = await this.consultasService.reservasPorCliente();
        return { success: true, consulta: 7, data };
    }
    async c8() {
        const data = await this.consultasService.empleadosServiciosMes();
        return { success: true, consulta: 8, data };
    }
    async c9() {
        const data = await this.consultasService.empleadosSinServicios();
        return { success: true, consulta: 9, data };
    }
    async c10() {
        const data = await this.consultasService.agendaSemanalCompleta();
        return { success: true, consulta: 10, data };
    }
    async todas() {
        const data = await this.consultasService.todas();
        return { success: true, data };
    }
};
exports.ConsultasController = ConsultasController;
__decorate([
    (0, common_1.Get)('1-usuarios-por-rol'),
    (0, swagger_1.ApiOperation)({ summary: 'Usuarios por rol' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c1", null);
__decorate([
    (0, common_1.Get)('2-servicios-disponibles'),
    (0, swagger_1.ApiOperation)({ summary: 'Servicios disponibles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c2", null);
__decorate([
    (0, common_1.Get)('3-servicios-por-cliente'),
    (0, swagger_1.ApiOperation)({ summary: 'Servicios por cliente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c3", null);
__decorate([
    (0, common_1.Get)('4-agenda-empleado/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Agenda del empleado' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c4", null);
__decorate([
    (0, common_1.Get)('5-clientes-semana'),
    (0, swagger_1.ApiOperation)({ summary: 'Clientes de la semana' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c5", null);
__decorate([
    (0, common_1.Get)('6-reservas-por-servicio'),
    (0, swagger_1.ApiOperation)({ summary: 'Reservas por servicio' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c6", null);
__decorate([
    (0, common_1.Get)('7-reservas-por-cliente'),
    (0, swagger_1.ApiOperation)({ summary: 'Reservas por cliente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c7", null);
__decorate([
    (0, common_1.Get)('8-empleados-servicios-mes'),
    (0, swagger_1.ApiOperation)({ summary: 'Empleados con servicios del mes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c8", null);
__decorate([
    (0, common_1.Get)('9-empleados-sin-servicios'),
    (0, swagger_1.ApiOperation)({ summary: 'Empleados sin servicios' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c9", null);
__decorate([
    (0, common_1.Get)('10-agenda-semanal-completa'),
    (0, swagger_1.ApiOperation)({ summary: 'Agenda semanal completa' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "c10", null);
__decorate([
    (0, common_1.Get)('todas'),
    (0, swagger_1.ApiOperation)({ summary: 'Todas las consultas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ConsultasController.prototype, "todas", null);
exports.ConsultasController = ConsultasController = __decorate([
    (0, common_1.Controller)('consultas'),
    (0, swagger_1.ApiTags)('Consultas'),
    __metadata("design:paramtypes", [consultas_service_1.ConsultasService])
], ConsultasController);
//# sourceMappingURL=consultas.controller.js.map