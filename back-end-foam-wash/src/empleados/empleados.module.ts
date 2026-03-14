import { Module } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EmpleadosController],
  providers: [EmpleadosService, PrismaService],
})
export class EmpleadosModule {}