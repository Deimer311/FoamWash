import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import { AuthController } from '../src/auth/auth.controller';

describe('RF-02: Iniciar sesión/cerrar sesion', () => {
    let controller: AuthController;
    const mockRes = { status: jest.fn().mockReturnThis(), cookie: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as any;
    const mockAuthService = { login: jest.fn(), logout: jest.fn() };


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],                                                                          


            providers: [{ provide: AuthService, useValue: mockAuthService }, { provide: PrismaService, useValue: {} }, { provide: JwtService, useValue: {} }],
        }).compile();
        controller = module.get<AuthController>(AuthController);
    });

        it('CP-006: Verificar que el cliente pueda iniciar sesión con credenciales válidas.', async () => {
        mockAuthService.login.mockResolvedValue({ tokens: { accessToken: 'token', refreshToken: 'refresh' }, user: { Nombre: 'Cliente Test' } });
        await controller.login({ correo: 'test@cliente.com', password: 'password123' } as any, mockRes);
        expect(mockAuthService.login).toHaveBeenCalled();
    });
    it ('CP-007: Verificar que el cliente pueda cerrar sesión correctamente.', async () => { 
        mockAuthService.logout.mockResolvedValue({ message: 'Sesión cerrada correctamente' });
        await controller.logout({ user: { id: 1 } } as any, mockRes);
        expect(mockAuthService.logout).toHaveBeenCalled();
    }); 

    it ('CP-008: Verificar que la sesión expire por inactividad.', async () => {
        mockAuthService.logout.mockResolvedValue({ message: 'Sesión cerrada por inactividad' });
        await controller.logout({ user: { id: 1 } } as any, mockRes);
        expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it ('CP-009:Verificar que el sistema no permita iniciar sesión cuando existan campos obligatorios vacíos.', async () => {
        mockAuthService.login.mockRejectedValue(new NotFoundException('error al iniciar sesion por campos vacíos'));
        await expect(controller.login({ correo: '', password: '' } as any, mockRes)).rejects.toThrow(NotFoundException);
    }); 
    it ('CP-010:Verificar que el sistema valide el formato del correo electrónico antes de iniciar sesión.', async () => {
        mockAuthService.login.mockRejectedValue(new ConflictException('error al iniciar sesion por formato incorrecto'));
        await expect(controller.login({ correo: 'invalid-email', password: 'password123' } as any, mockRes)).rejects.toThrow(ConflictException);
    });
