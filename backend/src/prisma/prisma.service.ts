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
    if (process.env.DATABASE_URL?.includes('test.db') || process.env.NODE_ENV === 'test') {
      console.log('✅ Prisma conectado a SQLite (Pruebas) exitosamente');
    } else {
      console.log('✅ Prisma conectado a MySQL exitosamente');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
