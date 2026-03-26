"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const cookieParser = require("cookie-parser");
const helmet_1 = require("helmet");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(cookieParser());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
    const config = new swagger_1.DocumentBuilder()
        .setTitle('FoamWash API')
        .setDescription('Documentación de todos los endpoints del backend FoamWash')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
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
//# sourceMappingURL=main.js.map