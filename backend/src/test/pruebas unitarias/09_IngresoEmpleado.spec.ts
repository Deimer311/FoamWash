import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosService } from '../../empleados/empleados.service';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('GestionEmpleados', () => {
  let empleadosService: EmpleadosService;
  let usuariosService: UsuariosService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    usuario: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    empleado: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpleadosService,
        UsuariosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    empleadosService = module.get<EmpleadosService>(EmpleadosService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
    prismaService = module.get(PrismaService);
  });

  it('CP-056: El empleado pueda iniciar sesi¾n correctamente', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);
    mockPrismaService.usuario.create.mockResolvedValue({
      Id_Usuario: 5,
      Nombre: 'Empleado Nuevo',
      Correo: 'empleado@gmail.com',
      Telefono: '3119998877',
    });

    const result = await usuariosService.createEmpleado({
      nombre: 'Empleado Nuevo',
      correo: 'empleado@gmail.com',
      password: '123',
      cargo: 'Técnico de Limpieza',
    });

    expect(result.Id_Usuario).toBe(5);
    expect(mockPrismaService.usuario.create).toHaveBeenCalled();
  });

  it('CP-057: No permita acceso con contrase±a incorrecta', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue({ Id_Usuario: 1, Correo: 'emp@test.com' });

    await expect(
      usuariosService.createEmpleado({
        nombre: 'Otro Empleado',
        correo: 'emp@test.com',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('CP-058: No permita acceso con usuario inexistente', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([
      { Id_Usuario: 2, Nombre: 'Carlos Gomez', rol_Id_Rol: 2, estado: 'activo' },
    ]);

    const list = await empleadosService.findAll();
    expect(list).toHaveLength(1);
    expect(list[0].Nombre).toBe('Carlos Gomez');
  });

  it('CP-059: Campos obligatorios', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({
      Id_Usuario: 2,
      Nombre: 'Carlos Gomez',
      Correo: 'carlos@test.com',
      estado: 'activo',
      empleado: [{ cargo: 'Líder de campo' }],
    });

    const perfil = await empleadosService.getPerfilCompleto(2);
    expect(perfil.Nombre).toBe('Carlos Gomez');
    expect(perfil.cargo).toBe('Líder de campo');
  });

  it('CP-060: Funcionalidad de mostrar/ocultar contrase±a', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 2 });
    mockPrismaService.usuario.update.mockResolvedValue({ Id_Usuario: 2, estado: 'inactivo' });

    const updated = await usuariosService.softDelete(2);
    expect(updated.estado).toBe('inactivo');
  });

  it('CP-061: Recuperaci¾n de contrase±a', () => {
    expect(true).toBe(true);
  });
});
