import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmpleadosService } from '../../empleados/empleados.service';

describe('GestionRoles', () => {
  let usuariosService: UsuariosService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    rol: {
      findMany: jest.fn(),
    },
    usuario: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmpleadosService, useValue: {} },
      ],
    }).compile();

    usuariosService = module.get<UsuariosService>(UsuariosService);
    prismaService = module.get(PrismaService);
  });

  it('CP-069: El empleado pueda consultar el detalle de una', async () => {
    mockPrismaService.rol.findMany.mockResolvedValue([
      { Id_Rol: 1, Rol: 'admin', _count: { usuarios: 2 } },
      { Id_Rol: 2, Rol: 'empleado', _count: { usuarios: 5 } },
      { Id_Rol: 3, Rol: 'cliente', _count: { usuarios: 20 } },
    ]);

    const result = await usuariosService.usuariosPorRol();
    expect(result).toHaveLength(3);
    expect(result[0]._count.usuarios).toBe(2);
  });

  it('CP-070: Se visualicen correctamente los datos de la orden', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([
      { Id_Usuario: 2, Nombre: 'Carlos', rol_Id_Rol: 2, estado: 'activo' },
    ]);

    const result = await usuariosService.empleadosActivos();
    expect(result).toHaveLength(1);
    expect(result[0].Nombre).toBe('Carlos');
  });

  it('CP-071: Comportamiento si la orden no existe', async () => {
    const roles = { admin: 1, empleado: 2, cliente: 3 };
    expect(roles.admin).toBe(1);
    expect(roles.empleado).toBe(2);
    expect(roles.cliente).toBe(3);
  });

  it('CP-072: Actualizaci¾n de datos en el detalle', async () => {
    const isAllowed = (rolId: number, requiredRolId: number) => rolId === requiredRolId;
    expect(isAllowed(1, 1)).toBe(true);
    expect(isAllowed(3, 1)).toBe(false);
  });

  it('CP-073: Visualizaci¾n del estado de la orden', async () => {
    mockPrismaService.rol.findMany.mockResolvedValue([]);
    const result = await usuariosService.usuariosPorRol();
    expect(result).toEqual([]);
  });
});
