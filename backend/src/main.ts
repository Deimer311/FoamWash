// src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── Seguridad ────────────────────────────────────────────
  // crossOriginResourcePolicy: false permite servir imágenes estáticas
  // a frontends en otros orígenes (necesario para las fotos de perfil)
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  // ── Cookie Parser ────────────────────────────────────────
  app.use(cookieParser());

  // ── CORS ─────────────────────────────────────────────────
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Prefijo global ────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Validación global ─────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // ── Carpeta uploads ───────────────────────────────────────
  // Se crea automáticamente si no existe (importante en Docker / primer deploy)
  const uploadsDirPerfiles = join(process.cwd(), 'uploads', 'perfiles');
  mkdirSync(uploadsDirPerfiles, { recursive: true });
  
  const uploadsDirServicios = join(process.cwd(), 'uploads', 'servicios');
  mkdirSync(uploadsDirServicios, { recursive: true });
  
  console.log(`📁 Carpetas uploads listas`);

  // ── Archivos estáticos ────────────────────────────────────
  // Sirve /uploads/perfiles/foto.jpg como GET /uploads/perfiles/foto.jpg
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // ── Swagger ───────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('FoamWash API')
    .setDescription('Documentación de todos los endpoints del backend FoamWash')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('Auth', 'Endpoints de autenticación y gestión de usuarios')
    .addTag('Clientes', 'Gestión de perfiles de clientes')
    .addTag('Reservas', 'Gestión de reservas de servicios')
    .addTag('Servicios', 'Gestión de servicios disponibles')
    .addTag('Cotizaciones', 'Gestión de cotizaciones')
    .addTag('Empleados', 'Gestión de empleados')
    .addTag('Consultas', 'Consultas y reportes')
    .addTag('Estadísticas', 'Estadísticas del sistema')
    .addTag('Notificaciones', 'Gestión de notificaciones')
    .addTag('Usuarios', 'Gestión general de usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Con el prefijo global 'api', Swagger debe montarse en 'api/docs'
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  console.log('='.repeat(60));
  console.log(`🚀 Foam Wash NestJS corriendo`);
  console.log(`   URL:     http://localhost:${PORT}/api`);
  console.log(`   Docs:    http://localhost:${PORT}/api/docs`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Iniciado: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
}

bootstrap();