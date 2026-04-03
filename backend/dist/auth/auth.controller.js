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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./dto/auth.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const cookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge,
});
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto, res) {
        const result = await this.authService.register(dto);
        res.cookie('accessToken', result.tokens.accessToken, cookieOptions(15 * 60 * 1000));
        res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
        return res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            access_token: result.tokens.accessToken,
            refresh_token: result.tokens.refreshToken,
            data: result.user,
        });
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        res.cookie('accessToken', result.tokens.accessToken, cookieOptions(15 * 60 * 1000));
        res.cookie('refreshToken', result.tokens.refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000));
        return res.status(200).json({
            success: true,
            message: 'Login exitoso',
            access_token: result.tokens.accessToken,
            refresh_token: result.tokens.refreshToken,
            data: result.user,
        });
    }
    async logout(req, res) {
        const user = req.user;
        await this.authService.logout(user.id);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.json({ success: true, message: 'Sesión cerrada' });
    }
    async getMe(req) {
        const user = req.user;
        const data = await this.authService.getMe(user.id);
        return { success: true, data };
    }
    async requestPasswordReset(dto) {
        const result = await this.authService.requestPasswordReset(dto);
        return { success: true, ...result };
    }
    async verifyResetCode(dto) {
        const result = await this.authService.verifyResetCode(dto.token);
        return { success: true, ...result };
    }
    async resetPassword(dto) {
        const result = await this.authService.resetPassword(dto);
        return { success: true, ...result };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('request-password-reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RequestPasswordResetDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)('verify-reset-code'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyResetCodeDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyResetCode", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map