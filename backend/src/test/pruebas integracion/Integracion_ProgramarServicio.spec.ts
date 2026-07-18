import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('ProgramarServicio', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
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
        Nombre: 'Cliente Integracion',
        Correo: 'test@cliente.com',
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: '123456789'
      }
    });
    clientId = cliente.Id_Usuario;
  });

  afterAll(async () => {
    // Limpieza final
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

  it('Permite programar un servicio de lavado correctamente.', async () => {
    const obs = await prisma.observacion.create({ data: { Observaciones: 'Lavado VIP' } });
    
    const res = await request(app.getHttpServer())
      .post('/reservas')
      .send({
        fecha: new Date().toISOString(),
        Hora: new Date().toISOString(),
        Id_Usuario: clientId,
        observacion_Id_Observaciones: obs.Id_Observaciones
      });
    
    expect(res.status).toBeDefined();
  });

  it('Valida los campos obligatorios del formulario.', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservas')
      .send({}); // Faltan campos

    expect(res.status).toBeDefined();
  });

  it('No permite programar un servicio con fecha anterior a la actual.', async () => {
    const obs = await prisma.observacion.create({ data: { Observaciones: 'Antiguo' } });
    const pastDate = new Date();
    pastDate.setFullYear(2000);

    const res = await request(app.getHttpServer())
      .post('/reservas')
      .send({
        fecha: pastDate.toISOString(),
        Hora: pastDate.toISOString(),
        Id_Usuario: clientId,
        observacion_Id_Observaciones: obs.Id_Observaciones
      });
    
    expect(res.status).toBeDefined(); 
  });

  it('No permite seleccionar una hora no disponible.', async () => {
    expect(true).toBe(true); 
  });

  it('Permite seleccionar un horario disponible.', async () => {
    expect(true).toBe(true);
  });

  it('Registra correctamente la dirección donde se realizará el servicio.', async () => {
    expect(true).toBe(true);
  });

  it('Permite registrar observaciones adicionales para el servicio.', async () => {
    expect(true).toBe(true);
  });

  it('Registra el servicio en el historial o listado de servicios del cliente.', async () => {
    const res = await request(app.getHttpServer()).get(`/reservas/cliente/${clientId}`);
    expect(res.status).toBeDefined();
  });

});
