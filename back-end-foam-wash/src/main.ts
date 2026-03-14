// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  
  // 1. Prefijo global para que coincida con tu frontend (/api/...)
  app.setGlobalPrefix('api');

  // 2. Configuración de CORS para permitir que el Frontend se conecte
  app.enableCors({
    origin: 'http://localhost:5173', // La URL de tu frontend con Vite
    credentials: true,               // Necesario para que funcionen las cookies/JWT
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 3. Puerto 5000 para coincidir con tu api.js
  await app.listen(5000);
}
bootstrap();