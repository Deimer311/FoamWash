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
  constructor(private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      // Extraer token de la COOKIE o del Header Authorization
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken ?? null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET || 'fallback-secret',
      passReqToCallback: true,
    });
  }

  // Este método se ejecuta después de verificar el JWT
  // Equivale al bloque "verificar usuario en BD" de auth.middleware.js
  async validate(request: Request, payload: any) {
    let token = request?.cookies?.accessToken;
    
    // Si no hay cookie, intentar extraer del header Authorization
    if (!token && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    const user = await this.prisma.usuario.findFirst({
      where: {
        Id_Usuario: payload.id,
        estado: 'activo',
      },
      include: { rol: true }, // Incluir rol para obtener el nombre
    });

    if (!user) {
      console.log('JWT_VALIDATE_ERROR: User not found or inactive. Payload:', payload);
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado o inactivo',
      });
    }

    // Verificar que el token coincida con el almacenado en BD
    if (user.access_token !== token) {
      console.log('JWT_VALIDATE_ERROR: Token mismatch', { dbToken: user.access_token, requestToken: token });
      throw new UnauthorizedException({
        code: 'TOKEN_MISMATCH',
        message: 'Token inválido o sesión cerrada',
      });
    }

    // Lo que retorna aquí se convierte en req.user
    const userRole = user.rol?.Rol?.toLowerCase() || payload.role || 'cliente';
    
    return {
      id: user.Id_Usuario,
      email: user.Correo,
      role: userRole,
      nombre: user.Nombre,
    };
  }
}
