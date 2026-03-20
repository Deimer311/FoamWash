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
    async create(body) {
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
    async remove(id) {
        await this.reservasService.remove(id);
        return { success: true, message: 'Reserva eliminada exitosamente' };
    }
};
exports.ReservasController = ReservasController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('estado/:estado'),
    __param(0, (0, common_1.Param)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "findByEstado", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "updateEstado", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ReservasController.prototype, "remove", null);
exports.ReservasController = ReservasController = __decorate([
    (0, common_1.Controller)('reservas'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reservas_service_1.ReservasService])
], ReservasController);
//# sourceMappingURL=reservas.controller.js.map