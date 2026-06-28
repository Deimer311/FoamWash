"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const fs_1 = require("fs");
const cookieParser = require("cookie-parser");
const helmet_1 = require("helmet");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: false,
    }));
    app.use(cookieParser());
    app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads', 'perfiles');
    (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
    console.log(`📁 Carpeta uploads lista: ${uploadsDir}`);
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads',
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FoamWash API')
        .setDescription('Documentación de todos los endpoints del backend FoamWash')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
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
//# sourceMappingURL=main.js.map