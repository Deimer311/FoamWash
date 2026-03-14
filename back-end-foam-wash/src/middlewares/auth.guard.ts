import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES } from '../constants/roles';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. EXTRACCIÓN DEL TOKEN (Cookies o Headers)
    let token = request.cookies?.accessToken;

    if (!token && request.headers.authorization) {
      const [type, tokenValue] = request.headers.authorization.split(' ');
      if (type === 'Bearer') {
        token = tokenValue;
      }
    }

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        error: { code: 'NO_TOKEN', message: 'No se encontró el token de acceso' },
      });
    }

    try {
      // 2. VERIFICACIÓN (Usa la variable de entorno o 'michel02' de respaldo)
      const secret = process.env.JWT_SECRET || 'michel02';
      const decoded: any = jwt.verify(token, secret);

      // 3. BUSCAR USUARIO EN DB (Asegúrate que el modelo sea 'usuario' en Prisma)
      const user = await (this.prisma as any).usuario.findFirst({
        where: { Id_Usuario: decoded.id },
      });

      if (!user) {
        throw new UnauthorizedException({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Usuario no existe' },
        });
      }

      // 4. INYECTAR DATOS EN LA PETICIÓN
      request['user'] = {
        id: user.Id_Usuario,
        email: user.Correo,
        role: decoded.role,
        nombre: user.Nombre,
        isAdmin: decoded.role === ROLES.ADMIN,
      };

      // 5. CONTROL DE ROLES (@Roles)
      const allowedRoles = this.reflector.get<string[]>('roles', context.getHandler());
      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        throw new ForbiddenException({
          success: false,
          error: { code: 'FORBIDDEN', message: 'No tienes permisos' },
        });
      }

      return true;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException({
          success: false,
          error: { code: 'TOKEN_EXPIRED', message: 'Sesión expirada' },
        });
      }
      throw new UnauthorizedException({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token no válido' },
      });
    }
  }
}