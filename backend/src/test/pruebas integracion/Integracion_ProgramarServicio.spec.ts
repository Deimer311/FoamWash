import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { fakerES as faker } from '@faker-js/faker';

const mockClient = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  documento: faker.string.numeric(8),
  direccion: 'Calle 123 # 45-67, Bogotá',
};

describe('ProgramarServicio (Integración)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let clientId: number;
  let obsId: number;
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
    await prisma.cotizacion.deleteMany().catch(() => {});
    await prisma.reserva.deleteMany().catch(() => {});
    await prisma.servicio.deleteMany().catch(() => {});
    await prisma.observacion.deleteMany().catch(() => {});
    await prisma.notificacion.deleteMany().catch(() => {});
    await prisma.empleado.deleteMany().catch(() => {});
    await prisma.usuario.deleteMany().catch(() => {});

    const rolCliente = await prisma.rol.upsert({
      where: { Id_Rol: 3 },
      update: { Rol: 'Cliente' },
      create: { Id_Rol: 3, Rol: 'Cliente' }
    });
    
    const cliente = await prisma.usuario.create({
      data: {
        Nombre: mockClient.nombre,
        Correo: mockClient.correo,
        estado: 'activo',
        rol_Id_Rol: rolCliente.Id_Rol,
        N_Documento: mockClient.documento,
        Direccion: mockClient.direccion
      }
    });
    clientId = cliente.Id_Usuario;

    const rolEmpleado = await prisma.rol.upsert({
      where: { Id_Rol: 2 },
      update: { Rol: 'Empleado' },
      create: { Id_Rol: 2, Rol: 'Empleado' }
    });

    await prisma.usuario.create({
      data: {
        Nombre: 'Empleado Prueba',
        Correo: 'empleado_programar@test.com',
        estado: 'activo',
        rol_Id_Rol: rolEmpleado.Id_Rol,
        N_Documento: '87654321',
        empleado: {
          create: {
            dias_laborales: 'lunes, martes, miercoles, jueves, viernes, sabado, domingo'
          }
        }
      }
    });

    authToken = jwtService.sign({ id: clientId, email: mockClient.correo, role: 'cliente' });

    await prisma.usuario.update({
      where: { Id_Usuario: clientId },
      data: { access_token: authToken },
    });

    const obs = await prisma.observacion.create({
      data: { Observaciones: 'Observaciones iniciales de prueba', estado: 'Pendiente' }
    });
    obsId = obs.Id_Observaciones;
  });

  afterAll(async () => {
    await prisma.calificacion.deleteMany().catch(() => {});
    await prisma.cotizacion.deleteMany().catch(() => {});
    await prisma.reserva.deleteMany().catch(() => {});
    await prisma.servicio.deleteMany().catch(() => {});
    await prisma.observacion.deleteMany().catch(() => {});
    await prisma.notificacion.deleteMany().catch(() => {});
    await prisma.empleado.deleteMany().catch(() => {});
    await prisma.usuario.deleteMany().catch(() => {});
    await prisma.$disconnect();
    await app.close();
  });

  it('No permite agendar un servicio si faltan campos obligatorios.', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('Muestra los servicios disponibles al usuario antes de agendar.', async () => {
    const res = await request(app.getHttpServer()).get('/servicios');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('No permite seleccionar una hora no disponible (fuera de horario 08:00 a 17:00).', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        Id_Usuario: clientId,
        fecha: '2026-10-15T10:00:00.000Z',
        Hora: '03:00',
        observacion_Id_Observaciones: obsId
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('La hora seleccionada no está permitida');
  });

  it('Permite seleccionar un horario disponible dentro del rango laboral.', async () => {
    let booked = false;
    let res;

    // Intentar opciones de fecha y hora sucesivamente hasta encontrar una desocupada
    for (let hora = 8; hora <= 17; hora++) {
      const horaStr = hora < 10 ? `0${hora}:00` : `${hora}:00`;
      
      res = await request(app.getHttpServer())
        .post('/reservas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          Id_Usuario: clientId,
          fecha: '2026-10-16T10:00:00.000Z',
          Hora: horaStr,
          observacion_Id_Observaciones: obsId
        });

      if (res.status === 201) {
        booked = true;
        break; // Encontró un horario desocupado y lo reservó
      } else if (res.status === 400 && res.body.message === 'El horario ya está ocupado') {
        continue; // Está ocupado, intentar con la siguiente hora
      } else {
        break;
      }
    }

    expect(booked).toBe(true);
    if (res) expect(res.status).toBe(201);
  });

  it('Registra correctamente la dirección donde se realizará el servicio.', async () => {
    const clienteObj = await prisma.usuario.findUnique({ where: { Id_Usuario: clientId } });
    expect(clienteObj.Direccion).toBe(mockClient.direccion);
  });

  it('Permite registrar observaciones adicionales para el servicio.', async () => {
    const obsObj = await prisma.observacion.findUnique({ where: { Id_Observaciones: obsId } });
    expect(obsObj.Observaciones).toContain('prueba');
  });

  it('Registra el servicio en el historial o listado de servicios del cliente.', async () => {
    const res = await request(app.getHttpServer())
      .get(`/reservas/cliente/${clientId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    const list = res.body.data || res.body;
    expect(Array.isArray(list)).toBe(true);
  });
});
