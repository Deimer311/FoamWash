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
exports.EmpleadosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const empleados_service_1 = require("./empleados.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let EmpleadosController = class EmpleadosController {
    constructor(empleadosService) {
        this.empleadosService = empleadosService;
    }
    async findAll() {
        const data = await this.empleadosService.findAll();
        return { success: true, data };
    }
    async sinServicios() {
        const data = await this.empleadosService.getSinServicios();
        return { success: true, data };
    }
    async serviciosFinalizados() {
        const data = await this.empleadosService.getServiciosFinalizados();
        return { success: true, data };
    }
    async productividadGeneral() {
        const data = await this.empleadosService.getProductividadGeneral();
        return { success: true, data };
    }
    async serviciosHoy(id) {
        const data = await this.empleadosService.getReservasHoy(id);
        return { success: true, data, total: data.length };
    }
    async agendaSemanal(id) {
        const data = await this.empleadosService.getReservasSemana(id);
        return { success: true, data, total: data.length };
    }
    async updateFoto(id, file) {
        if (!file)
            return { success: false, message: 'No se subió ninguna imagen' };
        const fotoUrl = `/uploads/perfiles/${file.filename}`;
        const data = await this.empleadosService.updateFoto(id, fotoUrl);
        return { success: true, data };
    }
};
exports.EmpleadosController = EmpleadosController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmpleadosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('sin-servicios'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmpleadosController.prototype, "sinServicios", null);
__decorate([
    (0, common_1.Get)('servicios-finalizados'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmpleadosController.prototype, "serviciosFinalizados", null);
__decorate([
    (0, common_1.Get)('productividad/general'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EmpleadosController.prototype, "productividadGeneral", null);
__decorate([
    (0, common_1.Get)(':id/servicios-hoy'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmpleadosController.prototype, "serviciosHoy", null);
__decorate([
    (0, common_1.Get)(':id/agenda-semanal'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EmpleadosController.prototype, "agendaSemanal", null);
__decorate([
    (0, common_1.Post)(':id/foto'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/perfiles',
            filename: (req, file, cb) => {
                const uniqueName = `empleado-${Date.now()}${(0, path_1.extname)(file.originalname)}`;
                cb(null, uniqueName);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
                return cb(new Error('Solo se permiten imágenes'), false);
            }
            cb(null, true);
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EmpleadosController.prototype, "updateFoto", null);
exports.EmpleadosController = EmpleadosController = __decorate([
    (0, common_1.Controller)('empleados'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [empleados_service_1.EmpleadosService])
], EmpleadosController);
//# sourceMappingURL=empleados.controller.js.map