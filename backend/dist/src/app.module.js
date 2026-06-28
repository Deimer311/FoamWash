"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const usuarios_module_1 = require("./usuarios/usuarios.module");
const reservas_module_1 = require("./reservas/reservas.module");
const servicios_module_1 = require("./servicios/servicios.module");
const cotizaciones_module_1 = require("./cotizaciones/cotizaciones.module");
const empleados_module_1 = require("./empleados/empleados.module");
const clientes_module_1 = require("./clientes/clientes.module");
const consultas_module_1 = require("./consultas/consultas.module");
const estadisticas_module_1 = require("./estadisticas/estadisticas.module");
const notificaciones_module_1 = require("./notificaciones/notificaciones.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: (0, path_1.join)(__dirname, '..', '.env') }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            usuarios_module_1.UsuariosModule,
            reservas_module_1.ReservasModule,
            servicios_module_1.ServiciosModule,
            cotizaciones_module_1.CotizacionesModule,
            empleados_module_1.EmpleadosModule,
            clientes_module_1.ClientesModule,
            consultas_module_1.ConsultasModule,
            estadisticas_module_1.EstadisticasModule,
            notificaciones_module_1.NotificacionesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map