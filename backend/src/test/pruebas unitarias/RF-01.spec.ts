import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../auth/auth.controller';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, BadRequestException } from '@nestjs/common';

describe('RF-01: Registro de usuarios', () => {
  let controller: AuthController;

  const mockRes = {
    status: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as any;

  const mockAuthService = { register: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService,  useValue: mockAuthService },
        { provide: PrismaService, useValue: {} },
        { provide: JwtService,   useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // ─── CP-001 ───────────────────────────────────────────────────────────────
  it('CP-001: Verificar que el cliente pueda registrarse correctamente con información válida.', async () => {
    mockAuthService.register.mockResolvedValue({
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
      user: { Id_Usuario: 1, Nombre: 'Cliente Valido', Correo: 'cliente@test.com' },
    });

    const dto = {
      nombre: 'Cliente Valido',
      correo: 'cliente@test.com',
      password: 'Password123',
      telefono: '3001234567',
      direccion: 'Calle 1 # 2-3',
    } as any;

    await controller.register(dto, mockRes);

    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true }),
    );
  });

  // ─── CP-002 ───────────────────────────────────────────────────────────────
  it('CP-002: Verificar que el sistema no permita registrar un correo electrónico ya existente.', async () => {
    mockAuthService.register.mockRejectedValue(
      new ConflictException({ code: 'EMAIL_EXISTS', message: 'Este correo ya está registrado' }),
    );

    const dto = {
      nombre: 'Otro Usuario',
      correo: 'existente@test.com',
      password: 'Password123',
      telefono: '3009876543',
    } as any;

    await expect(controller.register(dto, mockRes)).rejects.toThrow(ConflictException);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  // ─── CP-003 ───────────────────────────────────────────────────────────────
  it('CP-003: Verificar que el sistema valide los campos obligatorios vacíos.', async () => {
    mockAuthService.register.mockRejectedValue(
      new BadRequestException('Los campos nombre, correo y contraseña son obligatorios'),
    );

    const dto = {
      nombre: '',
      correo: '',
      password: '',
    } as any;

    await expect(controller.register(dto, mockRes)).rejects.toThrow(BadRequestException);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  // ─── CP-004 ───────────────────────────────────────────────────────────────
  it('CP-004: Verificar que el sistema valide el formato de los datos ingresados.', async () => {
    mockAuthService.register.mockRejectedValue(
      new BadRequestException('Formato de correo inválido'),
    );

    const dto = {
      nombre: 'Usuario Formato',
      correo: 'correo-sin-arroba',
      password: '123',           // contraseña demasiado corta
      telefono: 'abc',           // teléfono no numérico
    } as any;

    await expect(controller.register(dto, mockRes)).rejects.toThrow(BadRequestException);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  // ─── CP-005 ───────────────────────────────────────────────────────────────
  it('CP-005: Verificar el comportamiento del sistema cuando ocurre un error de conexión con el servidor durante el registro.', async () => {
    mockAuthService.register.mockRejectedValue(
      new Error('ECONNREFUSED: No se pudo conectar con el servidor de base de datos'),
    );

    const dto = {
      nombre: 'Usuario Red',
      correo: 'red@test.com',
      password: 'Password123',
      telefono: '3001234567',
    } as any;

    await expect(controller.register(dto, mockRes)).rejects.toThrow(Error);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });
});
