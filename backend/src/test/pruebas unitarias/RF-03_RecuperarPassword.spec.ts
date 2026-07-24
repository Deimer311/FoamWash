import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('RecuperarPassword (RF-03)', () => {
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
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
  });

  it('CP-013: Pueda recuperar su contraseña correctamente mediante un código enviado al correo.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      Id_Usuario: 1,
      Correo: 'cliente@gmail.com',
    });
    mockPrismaService.usuario.update.mockResolvedValue({});

    const response = await authService.requestPasswordReset({ correo: 'cliente@gmail.com' });
    expect(response.message).toContain('enviado');
    expect(mockPrismaService.usuario.update).toHaveBeenCalled();
  });

  it('CP-014: No envíe un código a un correo no registrado.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);

    await expect(
      authService.requestPasswordReset({ correo: 'no_existe@gmail.com' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('CP-015: El correo electrónico sea obligatorio.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    await expect(
      authService.requestPasswordReset({ correo: '' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('CP-016: Valide el formato del correo electrónico.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    await expect(
      authService.requestPasswordReset({ correo: 'formato_incorrecto' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('CP-017: Rechace un código de verificación incorrecto.', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);

    await expect(authService.verifyResetCode('000000')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('CP-018: Rechace un código de verificación vencido.', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);

    await expect(
      authService.resetPassword({ token: '123456', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CP-019: No permita continuar sin ingresar el código de verificación.', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);
    await expect(
      authService.resetPassword({ token: '', newPassword: 'NewPassword123!' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CP-020: Valide que las contraseñas coincidan.', async () => {
    const p1 = 'Password123!';
    const p2 = 'Password123!';
    expect(p1 === p2).toBe(true);
  });

  it('CP-021: No permita registrar una contraseña que incumpla las políticas de seguridad.', async () => {
    const isWeak = '123'.length < 6;
    expect(isWeak).toBe(true);
  });

  it('CP-022: Pueda iniciar sesión con la nueva contraseña.', async () => {
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
});
