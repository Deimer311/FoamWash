// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() hace que PrismaService esté disponible en TODOS los módulos
// sin necesidad de importarlo en cada uno
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
