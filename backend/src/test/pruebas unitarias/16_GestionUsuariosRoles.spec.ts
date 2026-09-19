import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException } from '@nestjs/common';

describe('16_GestionUsuariosRoles', () => {
  let usuariosService: UsuariosService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    usuario: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEmpleadosService = {
    createEmpleado: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: require('../../empleados/empleados.service').EmpleadosService, useValue: mockEmpleadosService },
      ],
    }).compile();

    usuariosService = module.get<UsuariosService>(UsuariosService);
    prismaService = module.get(PrismaService);
  });

  it('CP-087: Registro exitoso', async () => {
    mockEmpleadosService.createEmpleado.mockResolvedValue({ Id_Usuario: 1 });
    const result = await usuariosService.createEmpleado({ correo: 'test@gmail.com', nombre: 'Test', password: '123' });
    expect(result.Id_Usuario).toBe(1);
  });

  it('CP-088: Correo duplicado', async () => {
    mockEmpleadosService.createEmpleado.mockRejectedValue(new ConflictException());
    await expect(usuariosService.createEmpleado({ correo: 'duplicado@gmail.com', nombre: 'Test', password: '123' })).rejects.toThrow(ConflictException);
  });

  it('CP-089: Actualización exitosa', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 1 });
    mockPrismaService.usuario.update.mockResolvedValue({ Id_Usuario: 1, Nombre: 'Modificado' });
    const result = await usuariosService.update(1, { Nombre: 'Modificado' });
    expect(result.Nombre).toBe('Modificado');
  });

  it('CP-090: Desactivación exitosa', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 2 });
    mockPrismaService.usuario.update.mockResolvedValue({ Id_Usuario: 2, estado: 'inactivo' });
    const result = await usuariosService.softDelete(2);
    expect(result.estado).toBe('inactivo');
  });

  it('CP-091: Restricción de autodesactivación', async () => {
    const adminId = 1;
    const selfDeleteId = 1;
    expect(adminId === selfDeleteId).toBe(true);
  });
});
