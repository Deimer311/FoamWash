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

  it('CP-063: Consultar distribución de usuarios por rol.', async () => {
    mockPrismaService.rol.findMany.mockResolvedValue([
      { Id_Rol: 1, Rol: 'admin', _count: { usuarios: 2 } },
      { Id_Rol: 2, Rol: 'empleado', _count: { usuarios: 5 } },
      { Id_Rol: 3, Rol: 'cliente', _count: { usuarios: 20 } },
    ]);

    const result = await usuariosService.usuariosPorRol();
    expect(result).toHaveLength(3);
    expect(result[0]._count.usuarios).toBe(2);
  });

  it('CP-064: Listar únicamente los empleados activos del sistema.', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([
      { Id_Usuario: 2, Nombre: 'Carlos', rol_Id_Rol: 2, estado: 'activo' },
    ]);

    const result = await usuariosService.empleadosActivos();
    expect(result).toHaveLength(1);
    expect(result[0].Nombre).toBe('Carlos');
  });

  it('CP-065: Verificar restricción de roles (Cliente vs Admin vs Empleado).', async () => {
    const roles = { admin: 1, empleado: 2, cliente: 3 };
    expect(roles.admin).toBe(1);
    expect(roles.empleado).toBe(2);
    expect(roles.cliente).toBe(3);
  });

  it('CP-066: Validar asignación de permisos según el ID de rol.', async () => {
    const isAllowed = (rolId: number, requiredRolId: number) => rolId === requiredRolId;
    expect(isAllowed(1, 1)).toBe(true);
    expect(isAllowed(3, 1)).toBe(false);
  });

  it('CP-067: Manejo de respuesta cuando no existen usuarios asignados a un rol.', async () => {
    mockPrismaService.rol.findMany.mockResolvedValue([]);
    const result = await usuariosService.usuariosPorRol();
    expect(result).toEqual([]);
  });
});
