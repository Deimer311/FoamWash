// src/empleados/empleados.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { EmpleadosController } from './empleados.controller';
import { EmpleadosService } from './empleados.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [EmpleadosController],
  providers: [EmpleadosService, RolesGuard],
})
export class EmpleadosModule {}
