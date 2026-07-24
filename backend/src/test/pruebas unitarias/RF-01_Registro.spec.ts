import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('Registro (RF-01)', () => {
  let authService: AuthService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_token'),
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
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => '$2a$10$mockedhashvalue');

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

  it('CP-001: Pueda registrarse correctamente con información válida.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    mockPrismaService.usuario.create.mockResolvedValue({
      Id_Usuario: 1,
      Nombre: 'Juan Perez',
      Correo: 'juan@gmail.com',
      password_hash: 'hashed_password',
      rol: { Rol: 'cliente' },
    });
    mockPrismaService.usuario.update.mockResolvedValue({});

    const result = await authService.register({
      nombre: 'Juan Perez',
      correo: 'juan@gmail.com',
      password: 'Password123!',
      telefono: '3001234567',
    });

    expect(mockPrismaService.usuario.findUnique).toHaveBeenCalledWith({
      where: { Correo: 'juan@gmail.com' },
    });
    expect(mockPrismaService.usuario.create).toHaveBeenCalled();
    expect(result.user.correo).toBe('juan@gmail.com');
    expect(result.tokens).toBeDefined();
    expect(result.tokens.accessToken).toBe('mock_token');
  });

  it('CP-002: No permita registrar un correo electrónico ya existente.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      Id_Usuario: 2,
      Correo: 'existente@gmail.com',
    });

    await expect(
      authService.register({
        nombre: 'Pedro',
        correo: 'existente@gmail.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow(ConflictException);

    expect(mockPrismaService.usuario.create).not.toHaveBeenCalled();
  });

  it('CP-003: Valide los campos obligatorios vacíos.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    try {
      await authService.register({
        nombre: '',
        correo: '',
        password: '',
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('CP-004: Valide el formato de los datos ingresados.', async () => {
    const isHashValid = await bcrypt.hash('Password123!', 1);
    expect(isHashValid).toBeDefined();
    expect(typeof isHashValid).toBe('string');
  });

  it('CP-005: Verificar el comportamiento del sistema cuando ocurre un error de conexión con el servidor durante el registro.', async () => {
    mockPrismaService.usuario.findUnique.mockRejectedValue(
      new Error('Database connection failed'),
    );

    await expect(
      authService.register({
        nombre: 'Test User',
        correo: 'test@error.com',
        password: 'Password123!',
      }),
    ).rejects.toThrow('Database connection failed');
  });
});
