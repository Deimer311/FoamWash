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
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ClientesService = class ClientesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPerfil(id) {
        const cliente = await this.prisma.usuario.findUnique({
            where: { Id_Usuario: id },
            select: {
                Id_Usuario: true,
                Nombre: true,
                Correo: true,
                Telefono: true,
                Direccion: true,
                N_Documento: true,
                foto_perfil: true,
                fecha_registro: true,
                last_login: true,
                estado: true,
                rol: { select: { Rol: true } },
                tipo_de_documento: { select: { nombre_del_documento: true } },
                reservasComoCliente: {
                    include: { servicios: true, observacion: true },
                    orderBy: { fecha: 'desc' },
                    take: 10,
                },
                cotizaciones: { orderBy: { fecha_cotizacion: 'desc' }, take: 5 },
            },
        });
        if (!cliente)
            throw new common_1.NotFoundException('Cliente no encontrado');
        return cliente;
    }
    async updatePerfil(id, data) {
        return this.prisma.usuario.update({
            where: { Id_Usuario: id },
            data,
            select: { Id_Usuario: true, Nombre: true, Correo: true, Telefono: true, Direccion: true, N_Documento: true },
        });
    }
    async updateFoto(id, fotoUrl) {
        return this.prisma.usuario.update({
            where: { Id_Usuario: id },
            data: { foto_perfil: fotoUrl },
            select: { Id_Usuario: true, foto_perfil: true },
        });
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map