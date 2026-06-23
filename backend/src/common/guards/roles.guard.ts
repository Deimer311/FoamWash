// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario, no permitir
    if (!user) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Usuario no autenticado',
      });
    }

    // Verificar que el rol del usuario está en los roles requeridos
    const userRole = user.role?.toLowerCase?.() || user.role;
    
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: `No tienes permisos. Rol requerido: ${requiredRoles.join(', ')}, tu rol: ${userRole}`,
      });
    }

    return true;
  }
}
