import { SetMetadata } from '@nestjs/common';
import { ROLES } from '../constants/roles';

// Decorador para roles específicos (restrictTo)
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Decorador para jerarquía mínima (requireMinimumRole)
export const MinRole = (role: string) => SetMetadata('minRole', role);

// Decorador para permitir al dueño (allowOwnerOrAdmin)
export const AllowOwner = () => SetMetadata('allowOwner', true);