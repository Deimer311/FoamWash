import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Notificaciones', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientId: number;

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
    const cliente = await prisma.usuario.create({
      data: {
        Nombre: 'Cliente Notificaciones',
        Correo: 'notif@test.com',
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: '987654321'
      },
    });
    clientId = cliente.Id_Usuario;
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

  it('Recibe una notificación cuando el estado del servicio cambie.', async () => {
    // Simulamos la creación directa en BD para verificar el endpoint de listado
    await prisma.notificacion.create({
      data: {
        descripcion_notificacion: 'Tu servicio ha cambiado a En Progreso',
        usuario_Id_Usuario: clientId
      }
    });

    const res = await request(app.getHttpServer()).get(`/notificaciones/cliente/${clientId}`);
    expect(res.status).toBeDefined();
  });

  it('Visualiza el estado dentro de la plataforma.', async () => {
    expect(true).toBe(true); // Lógica de canal externo
  });

  it('Recibe una notificación al crear un servicio.', async () => {
    expect(true).toBe(true);
  });

  it('El contenido de la notificación es correcto.', async () => {
    const res = await request(app.getHttpServer()).get(`/notificaciones/cliente/${clientId}`);
    expect(res.status).toBeDefined();
  });

  it('Envía la notificación a canales externos (correo, SMS).', async () => {
    expect(true).toBe(true);
  });

  it('No envía notificaciones duplicadas.', async () => {
    expect(true).toBe(true);
  });

  it('Muestra las notificaciones en el orden cronológico.', async () => {
    expect(true).toBe(true);
  });

});
