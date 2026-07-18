import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('RF-02: Registrar nuevo cliente', () => {
  let controller: AuthController;
  const mockRes = { status: jest.fn().mockReturnThis(), cookie: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as any;
  const mockAuthService = { register: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }, { provide: PrismaService, useValue: {} }, { provide: JwtService, useValue: {} }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('CP-003: Debería registrar un usuario válido', async () => {
    const newUser = { nombre: 'Nuevo', correo: 'nuevo@correo.com', password: '123' };
    mockAuthService.register.mockResolvedValue({ tokens: { accessToken: 'token' }, user: { id: 1, ...newUser } });
    await controller.register(newUser as any, mockRes);
    expect(mockAuthService.register).toHaveBeenCalled();
  });
});