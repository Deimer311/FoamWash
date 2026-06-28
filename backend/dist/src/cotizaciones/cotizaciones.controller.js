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
exports.CotizacionesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cotizaciones_service_1 = require("./cotizaciones.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let CotizacionesController = class CotizacionesController {
    constructor(cotizacionesService) {
        this.cotizacionesService = cotizacionesService;
    }
    async getServicios() {
        const data = await this.cotizacionesService.getServicios();
        return { success: true, data };
    }
    async findAll() {
        const data = await this.cotizacionesService.findAll();
        return { success: true, data };
    }
    async create(body, req) {
        const data = await this.cotizacionesService.create({ ...body, Id_usuario: req.user.id });
        return { success: true, data };
    }
    async sincronizar(items, req) {
        const data = await this.cotizacionesService.sincronizar(items, req.user.id);
        return { success: true, sincronizados: data.length, data };
    }
};
exports.CotizacionesController = CotizacionesController;
__decorate([
    (0, common_1.Get)('servicios'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener lista de servicios para cotizar' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "getServicios", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las cotizaciones' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva cotización' }),
    (0, swagger_1.ApiBody)({ schema: { example: { "Total": 45000, "servicios": [1, 2] } } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('sincronizar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Sincronizar cotizaciones' }),
    (0, swagger_1.ApiBody)({ schema: { example: { "items": [{ "Id_Servicio": 1, "cantidad": 1 }] } } }),
    __param(0, (0, common_1.Body)('items')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], CotizacionesController.prototype, "sincronizar", null);
exports.CotizacionesController = CotizacionesController = __decorate([
    (0, common_1.Controller)('cotizaciones'),
    (0, swagger_1.ApiTags)('Cotizaciones'),
    __metadata("design:paramtypes", [cotizaciones_service_1.CotizacionesService])
], CotizacionesController);
//# sourceMappingURL=cotizaciones.controller.js.map