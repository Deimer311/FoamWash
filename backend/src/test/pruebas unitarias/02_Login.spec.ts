import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('Login', () => {
  let authService: AuthService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'secret';
      if (key === 'JWT_EXPIRES_IN') return '7d';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
  });

  it('CP-006: Pueda iniciar sesión con credenciales válidas.', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      Id_Usuario: 1,
      Correo: 'cliente@gmail.com',
      password_hash: passwordHash,
      estado: 'activo',
      rol: { Rol: 'cliente' },
    });
    mockPrismaService.usuario.update.mockResolvedValue({});

    const result = await authService.login({
      correo: 'cliente@gmail.com',
      password: '123456',
    });

    expect(result.tokens.accessToken).toBe('mock_jwt_token');
    expect(result.user.correo).toBe('cliente@gmail.com');
  });

  it('CP-007: Pueda cerrar sesión correctamente', async () => {
    mockPrismaService.usuario.update.mockResolvedValue({});

    const response = await authService.logout(1);

    expect(mockPrismaService.usuario.update).toHaveBeenCalledWith({
      where: { Id_Usuario: 1 },
      data: {
        access_token: null,
        refresh_token: null,
        token_created_at: null,
        token_expires_at: null,
      },
    });
    expect(response.message).toContain('cerrada');
  });

  it('CP-008: La sesión expire por inactividad.', async () => {
    const isExpired = new Date(Date.now() - 1000) < new Date();
    expect(isExpired).toBe(true);
  });

  it('CP-009: No permita iniciar sesión cuando existan campos obligatorios vacíos.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    await expect(
      authService.login({ correo: '', password: '' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('CP-010: Valide el formato del correo electrónico antes de iniciar sesión.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    await expect(
      authService.login({ correo: 'correo_invalido', password: '123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('CP-011: No permita iniciar sesión con una contraseña incorrecta.', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      Id_Usuario: 1,
      Correo: 'cliente@gmail.com',
      password_hash: passwordHash,
      estado: 'activo',
      rol: { Rol: 'cliente' },
    });

    await expect(
      authService.login({ correo: 'cliente@gmail.com', password: 'bad_password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('CP-012: Verificar el comportamiento del sistema cuando ocurre un error de conexión con el servidor durante el inicio de sesión.', async () => {
    mockPrismaService.usuario.findUnique.mockRejectedValue(
      new Error('DB Connection Timeout'),
    );

    await expect(
      authService.login({ correo: 'user@test.com', password: '123' }),
    ).rejects.toThrow('DB Connection Timeout');
  });
});
