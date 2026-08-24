import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const mockAuthService = {
    logout: jest.fn(),
    requestPasswordReset: jest.fn(),
    verifyResetCode: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  it('logout - debe cerrar sesion y limpiar cookies', async () => {
    mockAuthService.logout.mockResolvedValue(true);
    const mockReq = { user: { id: 1 } } as any;
    const mockRes = {
      clearCookie: jest.fn(),
      json: jest.fn().mockImplementation((val) => val),
    } as any;

    const res = await controller.logout(mockReq, mockRes);
    expect(mockAuthService.logout).toHaveBeenCalledWith(1);
    expect(mockRes.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(mockRes.clearCookie).toHaveBeenCalledWith('refreshToken');
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Sesión cerrada' });
    expect(res).toEqual({ success: true, message: 'Sesión cerrada' });
  });

  it('requestPasswordReset - debe llamar al servicio', async () => {
    mockAuthService.requestPasswordReset.mockResolvedValue({ message: 'OK' } as any);
    const res = await controller.requestPasswordReset({ correo: 'test@test.com' });
    expect(res).toEqual({ success: true, message: 'OK' });
  });

  it('verifyResetCode - debe llamar al servicio', async () => {
    mockAuthService.verifyResetCode.mockResolvedValue({ valid: true } as any);
    const res = await controller.verifyResetCode({ token: '123' });
    expect(res).toEqual({ success: true, valid: true });
  });

  it('resetPassword - debe llamar al servicio', async () => {
    mockAuthService.resetPassword.mockResolvedValue({ message: 'OK' } as any);
    const res = await controller.resetPassword({ token: '123', newPassword: '456' });
    expect(res).toEqual({ success: true, message: 'OK' });
  });
});
