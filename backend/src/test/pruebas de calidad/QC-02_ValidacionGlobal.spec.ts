import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../prisma/prisma.service';

describe('Calidad - Validación Global (QC-02)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Simular la misma configuración de main.ts para validación
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('1. Debe interceptar payloads inválidos y devolver 400 Bad Request', async () => {
    // Mandamos un body vacío al login, el cual requiere Correo y password
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({});
      
    expect(res.status).toBe(400);
    // NestJS por defecto devuelve un objeto JSON con error, statusCode, y un arreglo 'message'
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('error', 'Bad Request');
    expect(res.body).toHaveProperty('statusCode', 400);
    
    // Debe haber múltiples errores (uno para correo y otro para password)
    expect(Array.isArray(res.body.message)).toBe(true);
    expect(res.body.message.length).toBeGreaterThan(0);
  });

  it('2. Debe interceptar tipos de datos erróneos (ej. string en vez de número)', async () => {
    // Al intentar registrar con datos donde por ejemplo no pasamos campos obligatorios
    // (o el DTO de registro)
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: 'Test',
        correo: 'no-es-un-correo', // Fallará validación de email
        password: '12',            // Fallará validación de longitud (min 6)
        role: 'admin'
      });
      
    expect(res.status).toBe(400);
    expect(Array.isArray(res.body.message)).toBe(true);
    
    // Comprobar que en los mensajes de error vienen las validaciones esperadas
    const errorMessages = res.body.message.join(', ').toLowerCase();
    expect(errorMessages).toContain('correo no es válido'); // class-validator error
    expect(errorMessages).toContain('contraseña debe tener'); // class-validator error
  });
});
