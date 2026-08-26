import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { fakerES as faker } from '@faker-js/faker';

const mockAdmin = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 10 }) + 'A1!'
};

const mockClient = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 10 }) + 'A1!'
};

import { setupTestEnvironment, registerAndLoginAdmin, registerAndLoginClient } from '../test-utils';

describe('Usuarios (Integracion)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokenAdmin: string;
  let tokenCliente: string;
  let adminId: number;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    prisma = env.prisma;

    // Limpiar BD
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockAdmin.correo, mockClient.correo] } }
    });

    const admin = await registerAndLoginAdmin(app, mockAdmin);
    tokenAdmin = admin.token;
    adminId = admin.id;

    const cliente = await registerAndLoginClient(app, mockClient);
    tokenCliente = cliente.token;
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockAdmin.correo, mockClient.correo] } }
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('1. Debe obtener la lista de todos los usuarios si es administrador', async () => {
    const res = await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('2. Debe rechazar la solicitud si un cliente intenta ver todos los usuarios', async () => {
    const res = await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${tokenCliente}`);
      
    expect(res.status).toBe(403);
  });

  it('3. Debe permitir actualizar los datos de su propio perfil', async () => {
    const res = await request(app.getHttpServer())
      .put(`/usuarios/${adminId}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        Nombre: 'Admin Editado'
      });
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.Nombre).toBe('Admin Editado');
  });

  it('4. Debe obtener métricas de usuarios por rol (admin)', async () => {
    const res = await request(app.getHttpServer())
      .get('/usuarios/analytics/usuarios-por-rol')
      .set('Authorization', `Bearer ${tokenAdmin}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
