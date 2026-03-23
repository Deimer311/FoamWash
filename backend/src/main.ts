// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Seguridad ────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));

  // ── Cookie Parser ────────────────────────────────────────
  app.use(cookieParser());

  // ── CORS ─────────────────────────────────────────────────
  app.enableCors({
    origin: [
      'https://foamwashlg.netlify.app',
      'http://localhost:3000',
    ],
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

  // ── Swagger ───────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('FoamWash API')
    .setDescription('Documentación de todos los endpoints del backend FoamWash')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  console.log('='.repeat(60));
  console.log(`🚀 Foam Wash NestJS corriendo`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Docs: http://localhost:${PORT}/docs`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Iniciado: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
}

bootstrap();