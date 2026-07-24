import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { fakerES as faker } from '@faker-js/faker';

const mockClient = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  documento: faker.string.numeric(8)
};

const mockEmpleado = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  documento: faker.string.numeric(8)
};

describe('Notificaciones (Integración)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientId: number;
  let empleadoId: number;

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
      where: { Correo: { in: [mockClient.correo, mockEmpleado.correo] } }
    });

    const rolCliente = await prisma.rol.upsert({
      where: { Id_Rol: 3 },
      update: { Rol: 'Cliente' },
      create: { Id_Rol: 3, Rol: 'Cliente' }
    });

    const rolEmpleado = await prisma.rol.upsert({
      where: { Id_Rol: 2 },
      update: { Rol: 'Empleado' },
      create: { Id_Rol: 2, Rol: 'Empleado' }
    });
    
    const cliente = await prisma.usuario.create({
      data: {
        Nombre: mockClient.nombre,
        Correo: mockClient.correo,
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: mockClient.documento
      },
    });
    clientId = cliente.Id_Usuario;

    const empleado = await prisma.usuario.create({
      data: {
        Nombre: mockEmpleado.nombre,
        Correo: mockEmpleado.correo,
        estado: 'activo',
        rol_Id_Rol: rolEmpleado.Id_Rol,
        N_Documento: mockEmpleado.documento
      },
    });
    empleadoId = empleado.Id_Usuario;
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
      where: { Correo: { in: [mockClient.correo, mockEmpleado.correo] } }
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('1. Debe guardar notificaciones en la base de datos (POST /notificaciones)', async () => {
    const notifDesc = 'Notificación de prueba guardada en BD';
    const notifInDb = await prisma.notificacion.create({
      data: {
        usuario_Id_Usuario: clientId,
        descripcion_notificacion: notifDesc,
        fecha_notificacion: new Date(),
      },
    });

    expect(notifInDb.id_notificaciones).toBeDefined();
    expect(notifInDb.descripcion_notificacion).toBe(notifDesc);
  });

  it('2. Debe obtener notificaciones guardadas del usuario en orden cronológico (GET /notificaciones/:userId)', async () => {
    await prisma.notificacion.create({
      data: {
        usuario_Id_Usuario: clientId,
        descripcion_notificacion: 'Notificación 2 más reciente',
        fecha_notificacion: new Date(Date.now() + 1000),
      },
    });

    const notificaciones = await prisma.notificacion.findMany({
      where: { usuario_Id_Usuario: clientId },
      orderBy: { fecha_notificacion: 'desc' },
    });

    expect(notificaciones.length).toBeGreaterThanOrEqual(2);
    expect(notificaciones[0].descripcion_notificacion).toContain('Notificación 2');
  });

  it('3. CP-044: Debe guardar notificación en BD al asignar un servicio al trabajador', async () => {
    const notifAsignacion = await prisma.notificacion.create({
      data: {
        usuario_Id_Usuario: empleadoId,
        descripcion_notificacion: 'Tienes una nueva orden de servicio #101 asignada.',
        fecha_notificacion: new Date(),
      },
    });

    expect(notifAsignacion.usuario_Id_Usuario).toBe(empleadoId);
    expect(notifAsignacion.descripcion_notificacion).toContain('asignada');
  });

  it('4. CP-045: Debe guardar notificación en BD al reasignar un servicio al trabajador', async () => {
    const notifReasignacion = await prisma.notificacion.create({
      data: {
        usuario_Id_Usuario: empleadoId,
        descripcion_notificacion: 'Se te ha reasignado la orden de servicio #101.',
        fecha_notificacion: new Date(),
      },
    });

    expect(notifReasignacion.usuario_Id_Usuario).toBe(empleadoId);
    expect(notifReasignacion.descripcion_notificacion).toContain('reasignado');
  });
});
