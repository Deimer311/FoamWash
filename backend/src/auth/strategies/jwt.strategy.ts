// src/auth/strategies/jwt.strategy.ts
// ============================================================
// Reemplaza la parte de jwt.verify() en auth.middleware.js
// ============================================================
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extraer token de la COOKIE (igual que antes: req.cookies.accessToken)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }

  // Este método se ejecuta después de verificar el JWT
  // Equivale al bloque "verificar usuario en BD" de auth.middleware.js
  async validate(request: Request, payload: any) {
    const token = request?.cookies?.accessToken;

    const user = await this.prisma.usuario.findFirst({
      where: {
        Id_Usuario: payload.id,
        estado: 'activo',
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado o inactivo',
      });
    }

    // Verificar que el token coincida con el almacenado en BD
    if (user.access_token !== token) {
      throw new UnauthorizedException({
        code: 'TOKEN_MISMATCH',
        message: 'Token inválido o sesión cerrada',
      });
    }

    // Lo que retorna aquí se convierte en req.user
    return {
      id: user.Id_Usuario,
      email: user.Correo,
      role: payload.role,
      nombre: user.Nombre,
    };
  }
}
