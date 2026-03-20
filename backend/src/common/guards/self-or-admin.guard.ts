    // src/common/guards/self-or-admin.guard.ts
    // ============================================================
    // Permite el acceso si el usuario autenticado es admin
    // O si está accediendo a su propio recurso (req.params.id === req.user.id)
    // Uso: @UseGuards(JwtAuthGuard, SelfOrAdminGuard)
    // ============================================================
    import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

    @Injectable()
    export class SelfOrAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const paramId = parseInt(request.params.id, 10);

        if (!user) {
        throw new ForbiddenException({
            code: 'FORBIDDEN',
            message: 'No autenticado',
        });
        }

        const isAdmin = user.role === 'admin';
        const isSelf = user.id === paramId;

        if (!isAdmin && !isSelf) {
        throw new ForbiddenException({
            code: 'FORBIDDEN',
            message: 'No tienes permisos para acceder a este recurso',
        });
        }

        return true;
    }
    }