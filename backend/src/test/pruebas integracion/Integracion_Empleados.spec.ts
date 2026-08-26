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

const mockEmpleado = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 10 }) + 'A1!'
};

import { setupTestEnvironment, registerAndLoginAdmin } from '../test-utils';

describe('Empleados (Integracion)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokenAdmin: string;
  let adminId: number;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    app = env.app;
    prisma = env.prisma;
    
    // Limpiar BD
    await prisma.empleado.deleteMany();
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockAdmin.correo, mockEmpleado.correo] } }
    });

    const admin = await registerAndLoginAdmin(app, mockAdmin);
    tokenAdmin = admin.token;
    adminId = admin.id;
    
    // Registrar Empleado de prueba
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: mockEmpleado.nombre,
        correo: mockEmpleado.correo,
        password: mockEmpleado.password,
        role: 'empleado'
      });
  });

  afterAll(async () => {
    await prisma.empleado.deleteMany();
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockAdmin.correo, mockEmpleado.correo] } }
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('1. Debe obtener la lista de todos los empleados', async () => {
    const res = await request(app.getHttpServer())
      .get('/empleados')
      .set('Authorization', `Bearer ${tokenAdmin}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Debería retornar array vacío o con los empleados según cómo maneje la lógica de registro (si inserta en tabla empleado)
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('2. Debe obtener métricas de productividad general', async () => {
    const res = await request(app.getHttpServer())
      .get('/empleados/productividad/general')
      .set('Authorization', `Bearer ${tokenAdmin}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

});
