"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientesModule = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const clientes_controller_1 = require("./clientes.controller");
const clientes_service_1 = require("./clientes.service");
const roles_guard_1 = require("../common/guards/roles.guard");
let ClientesModule = class ClientesModule {
};
exports.ClientesModule = ClientesModule;
exports.ClientesModule = ClientesModule = __decorate([
    (0, common_1.Module)({
        imports: [platform_express_1.MulterModule.register({ dest: './uploads' })],
        controllers: [clientes_controller_1.ClientesController],
        providers: [clientes_service_1.ClientesService, roles_guard_1.RolesGuard],
    })
], ClientesModule);
//# sourceMappingURL=clientes.module.js.map