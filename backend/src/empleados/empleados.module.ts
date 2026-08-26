import { RolesGuard } from '../common/guards/roles.guard';
// src/empleados/empleados.module.ts
// src/empleados/empleados.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EmpleadosController } from './empleados.controller';
import { EmpleadosService } from './empleados.service';


@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [EmpleadosController],
  providers: [EmpleadosService, RolesGuard],
  exports: [EmpleadosService],
})
export class EmpleadosModule {}
