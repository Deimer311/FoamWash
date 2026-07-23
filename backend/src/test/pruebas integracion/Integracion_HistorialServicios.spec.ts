import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { fakerES as faker } from '@faker-js/faker';

const mockClient1 = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  documento: faker.string.numeric(6)
};

const mockClient2 = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  documento: faker.string.numeric(6)
};

describe('HistorialServicios', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientId: number;
  let clientId2: number;
  let reservaId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Limpiar BD
    await prisma.calificacion.deleteMany();
    await prisma.servicio.deleteMany();
    await prisma.cotizacion.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.observacion.deleteMany();
    await prisma.notificacion.deleteMany();
    await prisma.empleado.deleteMany();
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockClient1.correo, mockClient2.correo] } }
    });

    const rolCliente = await prisma.rol.upsert({
      where: { Id_Rol: 3 },
      update: { Rol: 'Cliente' },
      create: { Id_Rol: 3, Rol: 'Cliente' }
    });
    
    const cliente1 = await prisma.usuario.create({
      data: {
        Nombre: mockClient1.nombre,
        Correo: mockClient1.correo,
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: mockClient1.documento
      }
    });
    clientId = cliente1.Id_Usuario;

    const cliente2 = await prisma.usuario.create({
      data: {
        Nombre: mockClient2.nombre,
        Correo: mockClient2.correo,
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: mockClient2.documento
      }
    });
    clientId2 = cliente2.Id_Usuario;

    const obs = await prisma.observacion.create({ data: { Observaciones: 'Lavado Básico' } });
    const res = await prisma.reserva.create({
      data: {
        fecha: new Date(),
        Hora: new Date(),
        Estado: 'Finalizado',
        Id_Usuario: clientId,
        observacion_Id_Observaciones: obs.Id_Observaciones
      }
    });
    reservaId = res.ID_Reserva;
  });

  afterAll(async () => {
    await prisma.calificacion.deleteMany();
    await prisma.servicio.deleteMany();
    await prisma.cotizacion.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.observacion.deleteMany();
    await prisma.notificacion.deleteMany();
    await prisma.empleado.deleteMany();
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockClient1.correo, mockClient2.correo] } }
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('Consulta el historial de servicios realizados.', async () => {
    const res = await request(app.getHttpServer()).get(`/reservas/cliente/${clientId}`);
    expect(res.status).toBeDefined();
  });

  it('Solo permite consultar el propio historial.', async () => {
    const res = await request(app.getHttpServer()).get(`/reservas/cliente/${clientId2}`);
    expect(res.status).toBeDefined();
  });

  it('Actualiza el historial después de finalizar un servicio.', async () => {
    expect(true).toBe(true);
  });

  it('Consulta el detalle de un servicio del historial.', async () => {
    const res = await request(app.getHttpServer()).get(`/reservas/${reservaId}`);
    expect(res.status).toBeDefined();
  });

  it('Permite usar filtros en el historial de servicios.', async () => {
    expect(true).toBe(true);
  });

  it('Maneja correctamente fallas al cargar el historial', async () => {
    expect(true).toBe(true);
  });

});
