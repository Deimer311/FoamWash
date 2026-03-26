// src/auth/guards/jwt-auth.guard.ts
// ============================================================
// Reemplaza el middleware authenticateToken
// Uso: @UseGuards(JwtAuthGuard) en cualquier controller o método
// ============================================================
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          code: 'TOKEN_EXPIRED',
          message: 'Token expirado',
        });
      }
      throw new UnauthorizedException({
        code: 'NO_TOKEN',
        message: 'No autenticado',
      });
    }
    return user;
  }
}
