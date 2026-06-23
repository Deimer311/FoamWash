  // src/auth/auth.service.ts
  import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import * as bcrypt from 'bcryptjs';
  import { PrismaService } from '../prisma/prisma.service';
  import {
    RegisterDto,
    LoginDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
  } from './dto/auth.dto';
  import { sendResetCode } from '../common/utils/email.util';

  @Injectable()
  export class AuthService {
    constructor(
      private prisma: PrismaService,
      private jwtService: JwtService,
      private config: ConfigService,
    ) {}

    // ── GENERAR PAR DE TOKENS ─────────────────────────────────────────────────
    private generateTokenPair(payload: { id: number; email: string; role: string }) {
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

    // ── REGISTER ──────────────────────────────────────────────────────────────
    async register(dto: RegisterDto) {
      const { nombre, correo, password, telefono, direccion, tipoDocumentoId, role } = dto;

      const existing = await this.prisma.usuario.findUnique({ where: { Correo: correo } });
      if (existing) {
        throw new ConflictException({ code: 'EMAIL_EXISTS', message: 'Este correo ya está registrado' });
      }

      let rolId = 3; // cliente por defecto
      if (role === 'admin') rolId = 1;
      else if (role === 'empleado') rolId = 2;

      const password_hash = await bcrypt.hash(password, 12);

      // CORRECCIÓN: usar tipo_de_documento_id_tipo_de_documento (nombre real en DB)
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
        include: { rol: true }, // 'rol' sigue igual
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

    // ── LOGIN ─────────────────────────────────────────────────────────────────
    async login(dto: LoginDto) {
      const { correo, password } = dto;

      const user = await this.prisma.usuario.findUnique({
        where: { Correo: correo },
        include: { rol: true }, // 'rol' sigue igual
      });

      if (!user) {
        throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' });
      }

      if (user.estado !== 'activo') {
        throw new UnauthorizedException({ code: 'USER_INACTIVE', message: 'Usuario inactivo' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        throw new UnauthorizedException({ code: 'INVALID_CREDENTIALS', message: 'Credenciales inválidas' });
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

    // ── LOGOUT ────────────────────────────────────────────────────────────────
    async logout(userId: number) {
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

    // ── GET ME ────────────────────────────────────────────────────────────────
    async getMe(userId: number) {
      const user = await this.prisma.usuario.findUnique({
        where: { Id_Usuario: userId },
        // CORRECCIÓN: tipoDocumento → tipo_de_documento
        include: { rol: true, tipo_de_documento: true },
      });

      if (!user) throw new NotFoundException('Usuario no encontrado');

      const { password_hash, reset_token, reset_token_expires, access_token, refresh_token, ...safeUser } = user;

      return safeUser;
    }

    // ── REQUEST PASSWORD RESET ────────────────────────────────────────────────
    async requestPasswordReset(dto: RequestPasswordResetDto) {
      const user = await this.prisma.usuario.findUnique({ where: { Correo: dto.correo } });
      if (!user) throw new NotFoundException('No existe usuario con ese correo');

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await this.prisma.usuario.update({
        where: { Correo: dto.correo },
        data: { reset_token: resetCode, reset_token_expires: expiresAt },
      });

      await sendResetCode(dto.correo, resetCode);

      return { message: 'Código de recuperación enviado al correo' };
    }

    // ── VERIFY RESET CODE ─────────────────────────────────────────────────────
    async verifyResetCode(token: string) {
      const user = await this.prisma.usuario.findFirst({
        where: {
          reset_token: token,
          reset_token_expires: { gt: new Date() },
        },
      });

      if (!user) throw new BadRequestException({ code: 'INVALID_CODE', message: 'Código inválido o expirado' });

      return { valid: true, message: 'Código válido' };
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────────
    async resetPassword(dto: ResetPasswordDto) {
      const user = await this.prisma.usuario.findFirst({
        where: {
          reset_token: dto.token,
          reset_token_expires: { gt: new Date() },
        },
      });

      if (!user) throw new BadRequestException({ code: 'INVALID_CODE', message: 'Código inválido o expirado' });

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
  }