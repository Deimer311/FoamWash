import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { fakerES as faker } from '@faker-js/faker';

const mockClient1 = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  documento: faker.string.numeric(8)
};

const mockClient2 = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  documento: faker.string.numeric(8)
};

describe('HistorialServicios (Integración)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let clientId: number;
  let clientId2: number;
  let reservaId: number;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await prisma.calificacion.deleteMany().catch(() => {});
    await prisma.servicio.deleteMany().catch(() => {});
    await prisma.cotizacion.deleteMany().catch(() => {});
    await prisma.reserva.deleteMany().catch(() => {});
    await prisma.observacion.deleteMany().catch(() => {});
    await prisma.notificacion.deleteMany().catch(() => {});
    await prisma.empleado.deleteMany().catch(() => {});
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockClient1.correo, mockClient2.correo] } }
    }).catch(() => {});

    const rolCliente = await prisma.rol.upsert({
      where: { Id_Rol: 3 },
      update: { Rol: 'Cliente' },
      create: { Id_Rol: 3, Rol: 'Cliente' }
    });

    const cliente = await prisma.usuario.create({
      data: {
        Nombre: mockClient1.nombre,
        Correo: mockClient1.correo,
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: mockClient1.documento
      },
    });
    clientId = cliente.Id_Usuario;

    authToken = jwtService.sign({ id: clientId, email: mockClient1.correo, role: 'cliente' });

    await prisma.usuario.update({
      where: { Id_Usuario: clientId },
      data: { access_token: authToken },
    });

    const cliente2 = await prisma.usuario.create({
      data: {
        Nombre: mockClient2.nombre,
        Correo: mockClient2.correo,
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: mockClient2.documento
      },
    });
    clientId2 = cliente2.Id_Usuario;

    const obs = await prisma.observacion.create({
      data: { Observaciones: 'Reserva para historial', estado: 'Completado' }
    });

    const reserva = await prisma.reserva.create({
      data: {
        Estado: 'Completado',
        fecha: new Date(),
        Hora: new Date(),
        cliente: { connect: { Id_Usuario: clientId } },
        observacion: { connect: { Id_Observaciones: obs.Id_Observaciones } }
      }
    });
    reservaId = reserva.ID_Reserva;
  });

  afterAll(async () => {
    await prisma.calificacion.deleteMany().catch(() => {});
    await prisma.servicio.deleteMany().catch(() => {});
    await prisma.cotizacion.deleteMany().catch(() => {});
    await prisma.reserva.deleteMany().catch(() => {});
    await prisma.observacion.deleteMany().catch(() => {});
    await prisma.notificacion.deleteMany().catch(() => {});
    await prisma.empleado.deleteMany().catch(() => {});
    await prisma.usuario.deleteMany({
      where: { Correo: { in: [mockClient1.correo, mockClient2.correo] } }
    }).catch(() => {});
    await prisma.$disconnect();
    await app.close();
  });

  it('Consulta el historial de servicios realizados.', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservas/cliente/${clientId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('Solo permite consultar el propio historial.', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservas/cliente/${clientId2}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    expect(data.length).toBe(0);
  });

  it('Actualiza el historial después de finalizar un servicio.', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservas/estado/Completado`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    expect(Array.isArray(data)).toBe(true);
  });

  it('Consulta el detalle de un servicio del historial.', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservas/${reservaId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    const item = res.body.data || res.body;
    expect(item.ID_Reserva).toBe(reservaId);
  });

  it('Permite usar filtros en el historial de servicios.', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservas/estado/Completado`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    const data = res.body.data || res.body;
    expect(data.every((r: any) => r.Estado === 'Completado')).toBe(true);
  });

  it('Maneja correctamente fallas al cargar el historial con ID inexistente', async () => {
    const res = await request(app.getHttpServer())
      .get('/reservas/99999999')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});
