// src/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { RolesGuard } from '../common/guards/roles.guard';

import { EmpleadosModule } from '../empleados/empleados.module';

@Module({
  imports: [EmpleadosModule],
  controllers: [UsuariosController],
  providers: [UsuariosService, RolesGuard],
})
export class UsuariosModule {}
