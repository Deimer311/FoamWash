// src/prisma/prisma.service.ts
// ============================================================
// Reemplaza src/db.js y src/config/database.js
// En vez de pool.query(), usamos this.prisma.modelo.metodo()
// ============================================================
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma conectado a MySQL exitosamente');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
