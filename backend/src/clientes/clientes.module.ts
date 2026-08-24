import { RolesGuard } from '../common/guards/roles.guard';
// src/clientes/clientes.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';


@Module({
  imports: [MulterModule.register({ dest: './uploads' })],
  controllers: [ClientesController],
  providers: [ClientesService, RolesGuard],
})
export class ClientesModule {}
