import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';
import { fakerES as faker } from '@faker-js/faker';

const mockUser = {
  nombre: faker.person.fullName(),
  correo: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 10 }) + 'aA1', // Asegurar que pase reglas
  telefono: faker.phone.number()
};

describe('Autenticacion (Integracion)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookies: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    
    // Limpiar BD por si acaso se reutiliza BD (con faker es menos probable chocar)
    await prisma.usuario.deleteMany({ where: { Correo: mockUser.correo } });

    await prisma.rol.upsert({ where: { Id_Rol: 3 }, update: { Rol: 'cliente' }, create: { Id_Rol: 3, Rol: 'cliente' } });
  });

  afterAll(async () => {
    // Limpieza final
    await prisma.usuario.deleteMany({ where: { Correo: mockUser.correo } });
    await prisma.$disconnect();
    await app.close();
  });

  it('1. Debe registrar un nuevo usuario y devolver tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: mockUser.nombre,
        correo: mockUser.correo,
        password: mockUser.password,
        telefono: mockUser.telefono
      });
    
    if (res.status !== 201) {
      console.log('Error 500 Body:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.access_token).toBeDefined();
    
    // Verificar que se haya creado en DB
    const userInDb = await prisma.usuario.findFirst({
      where: { Correo: mockUser.correo }
    });
    expect(userInDb).toBeDefined();
    expect(userInDb?.Nombre).toBe(mockUser.nombre);
  });

  it('2. No debe permitir registrar un usuario con un correo ya existente', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: 'Otro Usuario',
        correo: mockUser.correo, // Mismo correo
        password: mockUser.password
      });
    
    expect(res.status).not.toBe(201); // Bad request / Conflict
  });

  it('3. Debe fallar el login con credenciales incorrectas', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        correo: mockUser.correo,
        password: 'password_incorrecto'
      });
    
    expect(res.status).toBe(401);
  });

  it('4. Debe iniciar sesión exitosamente con credenciales correctas', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        correo: mockUser.correo,
        password: mockUser.password
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.access_token).toBeDefined();

    // Guardar cookie para la siguiente prueba (si usa cookies)
    const setCookieHeader = res.headers['set-cookie'];
    if (setCookieHeader) {
      cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    }
  });

  it('5. Debe obtener perfil del usuario en sesión', async () => {
    // Re-login para extraer el access_token y enviarlo como Bearer (ya que no todas las configs de supertest manejan cookies fácil)
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        correo: mockUser.correo,
        password: mockUser.password
      });

    const token = loginRes.body.access_token;

    const req = request(app.getHttpServer()).get('/auth/me');
    if (cookies.length > 0) {
      req.set('Cookie', cookies);
    }
    
    // Enviar también como Bearer por si acaso
    const res = await req.set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.Correo).toBe(mockUser.correo);
  });

});
