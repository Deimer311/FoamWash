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
exports.UsuariosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsuariosService = class UsuariosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.usuario.findMany({
            select: {
                Id_Usuario: true,
                Nombre: true,
                Correo: true,
                Telefono: true,
                N_Documento: true,
                Direccion: true,
                estado: true,
                fecha_registro: true,
                foto_perfil: true,
                rol: { select: { Rol: true } },
                tipo_de_documento: { select: { nombre_del_documento: true } },
            },
            orderBy: { Nombre: 'asc' },
        });
    }
    async findOne(id) {
        const user = await this.prisma.usuario.findUnique({
            where: { Id_Usuario: id },
            select: {
                Id_Usuario: true,
                Nombre: true,
                Correo: true,
                Telefono: true,
                N_Documento: true,
                Direccion: true,
                estado: true,
                fecha_registro: true,
                last_login: true,
                foto_perfil: true,
                rol: true,
                tipo_de_documento: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return user;
    }
    async update(id, data) {
        const exists = await this.prisma.usuario.findUnique({ where: { Id_Usuario: id } });
        if (!exists)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return this.prisma.usuario.update({
            where: { Id_Usuario: id },
            data,
            select: {
                Id_Usuario: true, Nombre: true, Correo: true, Telefono: true, Direccion: true, estado: true,
            },
        });
    }
    async softDelete(id) {
        const exists = await this.prisma.usuario.findUnique({ where: { Id_Usuario: id } });
        if (!exists)
            throw new common_1.NotFoundException('Usuario no encontrado');
        return this.prisma.usuario.update({
            where: { Id_Usuario: id },
            data: { estado: 'inactivo' },
        });
    }
    async usuariosPorRol() {
        return this.prisma.rol.findMany({
            include: { _count: { select: { usuarios: true } } },
        });
    }
    async empleadosActivos() {
        return this.prisma.usuario.findMany({
            where: { rol_Id_Rol: 2, estado: 'activo' },
            select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true, last_login: true },
        });
    }
    async historialCliente(id) {
        return this.prisma.reserva.findMany({
            where: { Id_Usuario: id },
            include: { servicios: true, observacion: true },
            orderBy: { fecha: 'desc' },
        });
    }
};
exports.UsuariosService = UsuariosService;
exports.UsuariosService = UsuariosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsuariosService);
//# sourceMappingURL=usuarios.service.js.map