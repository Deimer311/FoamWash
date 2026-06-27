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
exports.ReservasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reservas_service_1 = require("./reservas.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ReservasController = class ReservasController {
    constructor(reservasService) {
        this.reservasService = reservasService;
    }
    async findAll() {
        const data = await this.reservasService.findAll();
        return { success: true, data };
    }
    async findByEstado(estado) {
        const data = await this.reservasService.findByEstado(estado);
        return { success: true, data };
    }
    async findOne(id) {
        const data = await this.reservasService.findOne(id);
        return { success: true, data };
    }
    async create(req, body) {
        const userId = req.user?.id;
        if (userId && !body.Id_Usuario) {
            body.Id_Usuario = userId;
        }
        const data = await this.reservasService.create(body);
        return { success: true, message: 'Reserva creada exitosamente', data };
    }
    async update(id, body) {
        const data = await this.reservasService.update(id, body);
        return { success: true, message: 'Reserva actualizada exitosamente', data };
    }
    async updateEstado(id, estado) {
        const data = await this.reservasService.updateEstado(id, estado);
        return { success: true, message: 'Estado actualizado', data };
    }
    async cancelarReserva(id, motivo) {
        if (!motivo)
            motivo = 'Cancelado por el administrador sin especificar motivo';
        const data = await this.reservasService.cancelarReserva(id, motivo);
        return { success: true, message: 'Reserva cancelada y correo enviado', data };
    }
    async remove(id) {
        await this.reservasService.remove(id);
        return { success: true, message: 'Reserva eliminada exitosamente' };
    }
};
exports.ReservasController = ReservasController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las reservas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('estado/:estado'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener reservas por estado' }),
    __param(0, (0, common_1.Param)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "findByEstado", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener una reserva por ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva reserva' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                "fecha": "2024-12-24",
                "Hora": "14:30",
                "Informacion_adicional": "Lavado con cera por favor",
                "servicios": [
                    { "Id_Servicio": 1, "cantidad": 1, "tamano": "Automovil" }
                ]
            }
        }
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar una reserva' }),
    (0, swagger_1.ApiBody)({ schema: { example: { "Estado": "Confirmado", "Informacion_adicional": "Llegaré 10 mins tarde" } } }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar estado de la reserva' }),
    (0, swagger_1.ApiBody)({ schema: { example: { "estado": "En Camino" } } }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "updateEstado", null);
__decorate([
    (0, common_1.Delete)(':id/cancelar'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar una reserva con motivo' }),
    (0, swagger_1.ApiBody)({ schema: { example: { "motivo": "El cliente canceló por lluvia" } } }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('motivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "cancelarReserva", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar una reserva' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "remove", null);
exports.ReservasController = ReservasController = __decorate([
    (0, common_1.Controller)('reservas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiTags)('Reservas'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reservas_service_1.ReservasService])
], ReservasController);
//# sourceMappingURL=reservas.controller.js.map