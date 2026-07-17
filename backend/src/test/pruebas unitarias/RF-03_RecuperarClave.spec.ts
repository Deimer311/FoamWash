import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('RF-03: Recuperación de contraseña', () => {
  let controller: AuthController;
  const mockAuthService = { requestPasswordReset: jest.fn(), resetPassword: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }, { provide: PrismaService, useValue: {} }, { provide: JwtService, useValue: {} }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('CP-005: Solicitar código de reseteo', async () => {
    mockAuthService.requestPasswordReset.mockResolvedValue({ message: 'Código enviado' });
    const result = await controller.requestPasswordReset({ correo: 'test@correo.com' });
    expect(result.message).toBe('Código enviado');
  });
});