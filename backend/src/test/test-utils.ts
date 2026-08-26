import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

export async function setupTestEnvironment() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();

  const prisma = app.get<PrismaService>(PrismaService);

  // Setup de datos base
  await prisma.rol.upsert({ where: { Id_Rol: 1 }, update: { Rol: 'admin' }, create: { Id_Rol: 1, Rol: 'admin' } });
  await prisma.rol.upsert({ where: { Id_Rol: 2 }, update: { Rol: 'trabajador' }, create: { Id_Rol: 2, Rol: 'trabajador' } });
  await prisma.rol.upsert({ where: { Id_Rol: 3 }, update: { Rol: 'cliente' }, create: { Id_Rol: 3, Rol: 'cliente' } });

  return { app, prisma };
}

export async function registerAndLoginAdmin(app: INestApplication, mockAdmin: any) {
  const resAdmin = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      nombre: mockAdmin.nombre,
      correo: mockAdmin.correo,
      password: mockAdmin.password,
      role: 'admin'
    });
  return {
    token: resAdmin.body.access_token,
    id: resAdmin.body.data.id
  };
}

export async function registerAndLoginClient(app: INestApplication, mockClient: any) {
  const resCliente = await request(app.getHttpServer())
    .post('/auth/register')
    .send({
      nombre: mockClient.nombre,
      correo: mockClient.correo,
      password: mockClient.password,
      role: 'cliente'
    });
  return {
    token: resCliente.body.access_token,
    id: resCliente.body.data.id
  };
}
