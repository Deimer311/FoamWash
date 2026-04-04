  // src/auth/strategies/jwt.strategy.ts
  // ============================================================
  // Estrategia JWT dual: lee el token tanto de la COOKIE (web)
  // como del HEADER Authorization: Bearer <token> (app móvil Capacitor)
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
        // ── Extractor dual de token ────────────────────────────
        // Intenta extraer el token de dos fuentes en orden:
        // 1. Cookie "accessToken" → usado por la app web (navegador)
        // 2. Header "Authorization: Bearer <token>" → usado por app móvil Capacitor
        // Si ninguno tiene token, retorna null y el guard lanza 401
        jwtFromRequest: ExtractJwt.fromExtractors([

          // Fuente 1: Cookie HttpOnly (web browser / Netlify)
          (request: Request) => {
            return request?.cookies?.accessToken ?? null;
          },

          // Fuente 2: Authorization header (app móvil Capacitor / Postman)
          ExtractJwt.fromAuthHeaderAsBearerToken(),
        ]),

        ignoreExpiration: false,
        secretOrKey: configService.get<string>('JWT_SECRET'),

        // Necesitamos pasar el request completo al método validate()
        // para poder leer el token y compararlo con el almacenado en BD
        passReqToCallback: true,
      });
    }

    // ── Validación del usuario ─────────────────────────────────
    // Este método se ejecuta DESPUÉS de que Passport verifica la firma del JWT
    // Aquí verificamos que el usuario existe y que el token coincide con el de la BD
    async validate(request: Request, payload: any) {

      // Intentar obtener el token desde la cookie (web)
      // Si no hay cookie, buscar en el header Authorization (móvil)
      const tokenFromCookie = request?.cookies?.accessToken;
      const tokenFromHeader = request?.headers?.authorization?.replace('Bearer ', '');

      // Usar el que esté disponible — primero cookie, luego header
      const token = tokenFromCookie || tokenFromHeader;

      // Buscar el usuario en la BD: debe existir y estar activo
      const user = await this.prisma.usuario.findFirst({
        where: {
          Id_Usuario: payload.id,
          estado: 'activo',
        },
      });

      // Si el usuario no existe o está inactivo, rechazar
      if (!user) {
        throw new UnauthorizedException({
          code: 'USER_NOT_FOUND',
          message: 'Usuario no encontrado o inactivo',
        });
      }

      // Verificar que el token recibido coincida con el almacenado en BD
      // Esto invalida sesiones anteriores cuando el usuario cierra sesión
      if (user.access_token !== token) {
        throw new UnauthorizedException({
          code: 'TOKEN_MISMATCH',
          message: 'Token inválido o sesión cerrada',
        });
      }

      // Lo que retorna aquí se convierte en req.user
      // Accesible en los controllers como: const user = (req as any).user
      return {
        id: user.Id_Usuario,
        email: user.Correo,
        role: payload.role,
        nombre: user.Nombre,
      };
    }
  }