import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

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

  it('CP-002: No debería permitir el login con credenciales incorrectas', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Credenciales inválidas'));
    await expect(controller.login({ correo: 'test@cliente.com', password: 'wrong' } as any, mockRes)).rejects.toThrow();
  });
});