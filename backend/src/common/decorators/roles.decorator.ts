// src/common/decorators/roles.decorator.ts
// ============================================================
// Reemplaza middlewares/roles.middleware.js
// Uso: @Roles('admin', 'empleado') en methods del controller
// ============================================================
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
