import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { mkdirSync } from 'fs';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🔐 Seguridad
  app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

  // 🍪 Cookies
  app.use(cookieParser());

  // 🌐 CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // 📌 Prefijo global
  app.setGlobalPrefix('api');

  // ✅ Validaciones
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 📁 Crear carpeta uploads
  const uploadsDir = join(process.cwd(), 'uploads', 'perfiles');
  mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Carpeta uploads lista: ${uploadsDir}`);

  // 🖼️ Archivos estáticos
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // 📚 Swagger
  const config = new DocumentBuilder()
    .setTitle('FoamWash API')
    .setDescription('Documentación del backend FoamWash')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // ⚠️ IMPORTANTE (por el prefix 'api')
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 5000;
  await app.listen(PORT);

  console.log(`🚀 Backend: http://localhost:${PORT}/api`);
  console.log(`📚 Swagger: http://localhost:${PORT}/api/docs`);
}
bootstrap();