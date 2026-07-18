
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { AuthController } from '../src/auth/auth.controller';

describe('RF-01: Ingresar al sistema como cliente', () => {
    let controller: AuthController;
    const mockRes = { status: jest.fn().mockReturnThis(), cookie: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as any;
    const mockAuthService = { login: jest.fn() };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [{ provide: AuthService, useValue: mockAuthService }, { provide: PrismaService, useValue: {} }, { provide: JwtService, useValue: {} }],
        }).compile();
        controller = module.get<AuthController>(AuthController);
    });

    it('CP-001: Debería permitir el login con credenciales correctas', async () => {
        mockAuthService.login.mockResolvedValue({ tokens: { accessToken: 'token', refreshToken: 'refresh' }, user: { Nombre: 'Cliente Test' } });
        await controller.login({ correo: 'test@cliente.com', password: 'password123' } as any, mockRes);
        expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('CP-002: Verificar que el sistema no permita registrar un correo electrónico ya existente.', async () => {
        mockAuthService.login.mockRejectedValue(new Error('correo ya registrado'));
        await expect(controller.login({ correo: 'test@cliente.com', password: 'wrong' } as any, mockRes)).rejects.toThrow();
    });

    it('CP-003: Verificar que el sistema valide los campos obligatorios vacíos.', async () => {
        mockAuthService.login.mockRejectedValue(new NotFoundException('error al iniciar sesion por campos vacíos'));
        await expect(controller.login({ correo: 'nonexistent@cliente.com', password: 'password123' } as any, mockRes)).rejects.toThrow(NotFoundException);
    });

    it('CP-004: Verificar que el sistema valide el formato de los datos ingresados', async () => {
        mockAuthService.login.mockRejectedValue(new ConflictException('error al iniciar sesion por formato incorrecto'));
        await expect(controller.login({ correo: 'invalid-email', password: 'password123' } as any, mockRes)).rejects.toThrow(ConflictException);
    });

    it('CP-005: Verificar el comportamiento del sistema cuando ocurre un error de conexión con el servidor durante el registro.', async () => {
        mockAuthService.login.mockRejectedValue(new ConflictException('error de conexión con el servidor'));
        await expect(controller.login({ correo: 'test@cliente.com', password: 'password123' } as any, mockRes)).rejects.toThrow(ConflictException);

    });
});
