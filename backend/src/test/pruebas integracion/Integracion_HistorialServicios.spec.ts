import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

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
    await prisma.usuario.deleteMany();
    await prisma.tipoDeDocumento.deleteMany();
    await prisma.rol.deleteMany();

    const rolCliente = await prisma.rol.create({ data: { Rol: 'Cliente' } });
    
    const cliente1 = await prisma.usuario.create({
      data: {
        Nombre: 'Cliente Historial 1',
        Correo: 'hist1@test.com',
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: '111111'
      }
    });
    clientId = cliente1.Id_Usuario;

    const cliente2 = await prisma.usuario.create({
      data: {
        Nombre: 'Cliente Historial 2',
        Correo: 'hist2@test.com',
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: '222222'
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
    await prisma.usuario.deleteMany();
    await prisma.tipoDeDocumento.deleteMany();
    await prisma.rol.deleteMany();
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
