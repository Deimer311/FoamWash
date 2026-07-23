import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import helmet from 'helmet';
import { AppModule } from '../../app.module';

describe('Calidad - Seguridad (QC-01)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Simular la misma configuración de main.ts
    app.use(helmet({ crossOriginResourcePolicy: false }));
    app.enableCors({ origin: true, credentials: true });
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Debe incluir cabeceras de seguridad de Helmet (x-dns-prefetch-control, x-frame-options, etc.)', async () => {
    const res = await request(app.getHttpServer()).get('/');
    
    // Helmet inyecta estas cabeceras por defecto
    expect(res.headers['x-dns-prefetch-control']).toBeDefined();
    expect(res.headers['x-frame-options']).toBeDefined();
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-download-options']).toBe('noopen');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-xss-protection']).toBe('0');
  });

  it('2. Debe permitir CORS (Access-Control-Allow-Origin)', async () => {
    const res = await request(app.getHttpServer())
      .options('/')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'GET');
      
    // NestJS habilitó CORS con origin: true
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
