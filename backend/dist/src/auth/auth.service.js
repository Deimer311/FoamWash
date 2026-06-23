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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
const email_util_1 = require("../common/utils/email.util");
let AuthService = class AuthService {
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    generateTokenPair(payload) {
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: this.config.get('JWT_EXPIRES_IN') || '7d',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
    async register(dto) {
        const { nombre, correo, password, telefono, direccion, tipoDocumentoId, role } = dto;
        const existing = await this.prisma.usuario.findUnique({ where: { Correo: correo } });
        if (existing) {
            throw new common_1.ConflictException({ code: 'EMAIL_EXISTS', message: 'Este correo ya está registrado' });
        }
        let rolId = 3;
        if (role === 'admin')
            rolId = 1;
        else if (role === 'empleado')
            rolId = 2;
        const password_hash = await bcrypt.hash(password, 12);
        const newUser = await this.prisma.usuario.create({
            data: {
                Nombre: nombre,
                Correo: correo,
                password_hash,
                Telefono: telefono || null,
                Direccion: direccion || null,
                tipo_de_documento_id_tipo_de_documento: tipoDocumentoId || null,
                rol_Id_Rol: rolId,
                estado: 'activo',
            },
            include: { rol: true },
        });
        const tokens = this.generateTokenPair({
            id: newUser.Id_Usuario,
            email: newUser.Correo,
            role: newUser.rol.Rol.toLowerCase(),
        });
        await this.prisma.usuario.update({
            where: { Id_Usuario: newUser.Id_Usuario },
            data: {
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                token_created_at: new Date(),
                token_expires_at: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        return {
            tokens,
            user: {
                id: newUser.Id_Usuario,
                nombre: newUser.Nombre,
                correo: newUser.Correo,
                rol: newUser.rol.Rol.toLowerCase(),
            },
        };
    }
    async login(dto) {
        const { correo, password } = dto;
        const user = await this.prisma.usuario.findUnique({
            where: { Correo: correo },
            include: { rol: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' });
        }
        if (user.estado !== 'activo') {
            throw new common_1.UnauthorizedException({ code: 'USER_INACTIVE', message: 'Usuario inactivo' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            throw new common_1.UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' });
        }
        const rolName = user.rol.Rol.toLowerCase();
        const tokens = this.generateTokenPair({
            id: user.Id_Usuario,
            email: user.Correo,
            role: rolName,
        });
        await this.prisma.usuario.update({
            where: { Id_Usuario: user.Id_Usuario },
            data: {
                last_login: new Date(),
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
                token_created_at: new Date(),
                token_expires_at: new Date(Date.now() + 15 * 60 * 1000),
            },
        });
        return {
            tokens,
            user: {
                id: user.Id_Usuario,
                nombre: user.Nombre,
                correo: user.Correo,
                rol: rolName,
                foto_perfil: user.foto_perfil,
            },
        };
    }
    async logout(userId) {
        await this.prisma.usuario.update({
            where: { Id_Usuario: userId },
            data: {
                access_token: null,
                refresh_token: null,
                token_created_at: null,
                token_expires_at: null,
            },
        });
        return { message: 'Sesión cerrada exitosamente' };
    }
    async getMe(userId) {
        const user = await this.prisma.usuario.findUnique({
            where: { Id_Usuario: userId },
            include: { rol: true, tipo_de_documento: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const { password_hash, reset_token, reset_token_expires, access_token, refresh_token, ...safeUser } = user;
        return safeUser;
    }
    async requestPasswordReset(dto) {
        const user = await this.prisma.usuario.findUnique({ where: { Correo: dto.correo } });
        if (!user)
            throw new common_1.NotFoundException('No existe usuario con ese correo');
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        await this.prisma.usuario.update({
            where: { Correo: dto.correo },
            data: { reset_token: resetCode, reset_token_expires: expiresAt },
        });
        await (0, email_util_1.sendResetCode)(dto.correo, resetCode);
        return { message: 'Código de recuperación enviado al correo' };
    }
    async verifyResetCode(token) {
        const user = await this.prisma.usuario.findFirst({
            where: {
                reset_token: token,
                reset_token_expires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException({ code: 'INVALID_CODE', message: 'Código inválido o expirado' });
        return { valid: true, message: 'Código válido' };
    }
    async resetPassword(dto) {
        const user = await this.prisma.usuario.findFirst({
            where: {
                reset_token: dto.token,
                reset_token_expires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException({ code: 'INVALID_CODE', message: 'Código inválido o expirado' });
        const newHash = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.usuario.update({
            where: { Id_Usuario: user.Id_Usuario },
            data: {
                password_hash: newHash,
                reset_token: null,
                reset_token_expires: null,
            },
        });
        return { message: 'Contraseña actualizada exitosamente' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map