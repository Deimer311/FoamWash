import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { fakerES as faker } from '@faker-js/faker';

const mockUser = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 10 }) + 'A1!',
  telefono: faker.phone.number()
};

describe('Cotizaciones (Integracion)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    
    // Limpiar BD
    await prisma.cotizacion.deleteMany();
    await prisma.servicio.deleteMany();
    await prisma.usuario.deleteMany({ where: { Correo: mockUser.correo } });

    // Setup de datos base
    await prisma.rol.upsert({
      where: { Id_Rol: 3 },
      update: { Rol: 'Cliente' },
      create: { Id_Rol: 3, Rol: 'Cliente' }
    });
    
    // Registrar y hacer login para obtener el token
    const resReg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: mockUser.nombre,
        correo: mockUser.correo,
        password: mockUser.password,
        role: 'Cliente'
      });
      
    token = resReg.body.access_token;
    userId = resReg.body.data.id;

    // Crear un par de servicios para cotizar
    await prisma.servicio.createMany({
      data: [
        { Nombre_Servicio: faker.commerce.productName(), descripcion: faker.commerce.productDescription(), Precio: 20000, estado: 'activo' },
        { Nombre_Servicio: faker.commerce.productName(), descripcion: faker.commerce.productDescription(), Precio: 35000, estado: 'activo' }
      ]
    });
  });

  afterAll(async () => {
    await prisma.cotizacion.deleteMany();
    await prisma.servicio.deleteMany();
    await prisma.usuario.deleteMany({ where: { Correo: mockUser.correo } });
    await prisma.$disconnect();
    await app.close();
  });

  it('1. Debe obtener la lista de servicios para cotizar (público)', async () => {
    const res = await request(app.getHttpServer()).get('/cotizaciones/servicios');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('2. Debe crear una cotización exitosamente', async () => {
    const servicios = await prisma.servicio.findMany();
    
    const res = await request(app.getHttpServer())
      .post('/cotizaciones')
      .set('Authorization', `Bearer ${token}`)
      .send({
        Precio_cotizado: 55000,
        Cantidad: 1,
        Id_servicio: servicios[0].Id_Servicio
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    
    const cotizacionDb = await prisma.cotizacion.findFirst({
      where: { Id_usuario: userId }
    });
    expect(cotizacionDb).toBeDefined();
    expect(Number(cotizacionDb?.Precio_cotizado)).toBe(55000);
  });

  it('3. Debe obtener el listado de cotizaciones', async () => {
    const res = await request(app.getHttpServer())
      .get('/cotizaciones')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('4. Debe fallar si se intenta crear cotización sin estar logueado', async () => {
    const res = await request(app.getHttpServer())
      .post('/cotizaciones')
      .send({
        Total: 10000,
        servicios: [1]
      });
      
    expect(res.status).toBe(401);
  });
});
