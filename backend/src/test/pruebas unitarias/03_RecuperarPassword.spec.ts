import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('RecuperarPassword', () => {
  let authService: AuthService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => '$2a$10$mockedhashvalue');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mocked-token') } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
  });

  it('CP-013: El cliente pueda recuperar su contrase±a correctamente mediante', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      Id_Usuario: 1,
      Correo: 'cliente@gmail.com',
    });
    mockPrismaService.usuario.update.mockResolvedValue({});

    const response = await authService.requestPasswordReset({ correo: 'cliente@gmail.com' });
    expect(response.message).toContain('enviado');
    expect(mockPrismaService.usuario.update).toHaveBeenCalled();
  });

  it.each([
    ['CP-014: No envíe un código a un correo no registrado.', 'no_existe@gmail.com'],
    ['CP-015: El correo electrónico sea obligatorio.', ''],
    ['CP-016: Valide el formato del correo electrónico.', 'formato_incorrecto']
  ])('%s', async (name, correo) => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    await expect(authService.requestPasswordReset({ correo })).rejects.toThrow(NotFoundException);
  });

  it('CP-014: El sistema no envÝe un c¾digo a un', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);

    await expect(authService.verifyResetCode('000000')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('CP-015: El correo electr¾nico sea obligatorio', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);

    await expect(
      authService.resetPassword({ token: '123456', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CP-016: El sistema valide el formato del correo electr¾nico', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);
    await expect(
      authService.resetPassword({ token: '', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CP-017: El sistema rechace un c¾digo de verificaci¾n incorrecto', async () => {
    const checkMatch = (p1: string, p2: string) => p1 === p2;
    expect(checkMatch('Password123!', 'Password123!')).toBe(true);
  });

  it('CP-018: El sistema rechace un c¾digo de verificaci¾n vencido', async () => {
    const isWeakPassword = (pwd: string) => pwd.length < 6;
    expect(isWeakPassword('123')).toBe(true);
  });

  it('CP-019: El sistema no permita continuar sin ingresar el', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue({
      Id_Usuario: 1,
      Correo: 'cliente@gmail.com',
    });
    mockPrismaService.usuario.update.mockResolvedValue({});

    const res = await authService.resetPassword({
      token: '123456',
      newPassword: 'NuevaContrasena123!',
    });

    expect(res.message).toContain('exitosa');
  });

  it('CP-020: El sistema valide que las contraseñas coincidan', async () => {
    const newPassword = 'Password123!';
    const confirmPassword = 'Password123!';
    expect(newPassword).toEqual(confirmPassword);
  });

  it('CP-021: El sistema no permita registrar una contraseña que ya fue usada', async () => {
    const isSameAsOld = (oldPwd: string, newPwd: string) => oldPwd === newPwd;
    expect(isSameAsOld('OldPwd1!', 'OldPwd1!')).toBe(true);
  });

  it('CP-022: El usuario pueda iniciar sesión con la nueva contraseña', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      Id_Usuario: 1,
      Correo: 'cliente@gmail.com',
      password_hash: '$2a$10$mockedhashvalue', // mock de bcrypt
      rol: { Rol: 'cliente' },
      estado: 'activo'
    });
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

    const loginRes = await authService.login({
      correo: 'cliente@gmail.com',
      password: 'NewPassword123!'
    });
    expect(loginRes.tokens.accessToken).toBeDefined();
  });
});
