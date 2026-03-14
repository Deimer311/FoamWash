import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { ROLES } from '../constants/roles';

@Injectable()
export class RoleHelpersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    if (request.user) {
      // Inyectamos los helpers en el objeto user
      request.user.isAdmin = request.user.role === ROLES.ADMIN;
      request.user.isTrabajador = request.user.role === ROLES.TRABAJADOR;
      request.user.isCliente = request.user.role === ROLES.CLIENTE;
    }
    return next.handle();
  }
}