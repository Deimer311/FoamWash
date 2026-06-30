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
exports.ServiciosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const servicios_service_1 = require("./servicios.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const UPLOADS_PATH = (0, path_1.join)(process.cwd(), 'uploads', 'servicios');
let ServiciosController = class ServiciosController {
    constructor(serviciosService) {
        this.serviciosService = serviciosService;
    }
    async findAll() {
        const data = await this.serviciosService.findAll();
        return { success: true, count: data.length, data };
    }
    async masSolicitados() {
        const data = await this.serviciosService.masSolicitados();
        return { success: true, data };
    }
    async programadosHoy() {
        const data = await this.serviciosService.programadosHoy();
        return { success: true, data };
    }
    async findOne(id) {
        const data = await this.serviciosService.findOne(id);
        return { success: true, data };
    }
    async create(body) {
        const data = await this.serviciosService.create(body);
        return { success: true, message: 'Servicio creado exitosamente', data };
    }
    async update(id, body) {
        const data = await this.serviciosService.update(id, body);
        return { success: true, message: 'Servicio actualizado exitosamente', data };
    }
    async remove(id) {
        await this.serviciosService.remove(id);
        return { success: true, message: 'Servicio eliminado exitosamente' };
    }
    async uploadImagen(id, file) {
        if (!file)
            throw new Error('No se subió ningún archivo');
        const url = `/uploads/servicios/${file.filename}`;
        await this.serviciosService.update(id, { imagen_url: url });
        return { success: true, url };
    }
};
exports.ServiciosController = ServiciosController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los servicios' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('analytics/mas-solicitados'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener servicios más solicitados' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "masSolicitados", null);
__decorate([
    (0, common_1.Get)('analytics/programados-hoy'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener servicios programados para hoy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "programadosHoy", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un servicio por ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo servicio' }),
    (0, swagger_1.ApiBody)({ schema: { example: { "Nombre_Servicio": "Lavado Premium", "Descripcion": "Lavado y encerado", "Precio": 25000, "Duracion": 60, "Imagen_URL": "" } } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar un servicio' }),
    (0, swagger_1.ApiBody)({ schema: { example: { "Precio": 30000, "Duracion": 75 } } }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un servicio' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/imagen'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Subir imagen de un servicio' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                imagen: { type: 'string', format: 'binary' },
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('imagen', {
        storage: (0, multer_1.diskStorage)({
            destination: UPLOADS_PATH,
            filename: (req, file, cb) => {
                const srvId = req.params?.id ?? 'srv';
                const uniqueName = `servicio-${srvId}-${Date.now()}${(0, path_1.extname)(file.originalname)}`;
                cb(null, uniqueName);
            },
        }),
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ServiciosController.prototype, "uploadImagen", null);
exports.ServiciosController = ServiciosController = __decorate([
    (0, common_1.Controller)('servicios'),
    (0, swagger_1.ApiTags)('Servicios'),
    __metadata("design:paramtypes", [servicios_service_1.ServiciosService])
], ServiciosController);
//# sourceMappingURL=servicios.controller.js.map