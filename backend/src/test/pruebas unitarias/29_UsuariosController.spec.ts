import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from '../../usuarios/usuarios.controller';
import { UsuariosService } from '../../usuarios/usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: jest.Mocked<UsuariosService>;

  const mockUsuariosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    createEmpleado: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    usuariosPorRol: jest.fn(),
    empleadosActivos: jest.fn(),
    historialCliente: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        { provide: UsuariosService, useValue: mockUsuariosService },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
    service = module.get(UsuariosService);
  });

  it('findAll - debe retornar usuarios', async () => {
    mockUsuariosService.findAll.mockResolvedValue([]);
    const res = await controller.findAll();
    expect(res).toEqual({ success: true, count: 0, data: [] });
  });

  it('findOne - debe retornar usuario', async () => {
    mockUsuariosService.findOne.mockResolvedValue({ Id_Usuario: 1 } as any);
    const res = await controller.findOne(1);
    expect(res).toEqual({ success: true, data: { Id_Usuario: 1 } });
  });

  it('createEmpleado - debe crear empleado', async () => {
    mockUsuariosService.createEmpleado.mockResolvedValue({ Id_Usuario: 1 } as any);
    const res = await controller.createEmpleado({} as any);
    expect(res).toEqual({ success: true, data: { Id_Usuario: 1 } });
  });

  it('update - debe actualizar usuario', async () => {
    mockUsuariosService.update.mockResolvedValue({ Id_Usuario: 1 } as any);
    const res = await controller.update(1, {} as any);
    expect(res).toEqual({ success: true, data: { Id_Usuario: 1 } });
  });

  it('softDelete - debe hacer softDelete', async () => {
    mockUsuariosService.softDelete.mockResolvedValue({ Id_Usuario: 1 } as any);
    const res = await controller.softDelete(1);
    expect(res).toEqual({ success: true, message: 'Usuario desactivado' });
  });

  it('usuariosPorRol - debe retornar', async () => {
    mockUsuariosService.usuariosPorRol.mockResolvedValue([]);
    const res = await controller.usuariosPorRol();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('empleadosActivos - debe retornar', async () => {
    mockUsuariosService.empleadosActivos.mockResolvedValue([]);
    const res = await controller.empleadosActivos();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('historialCliente - debe retornar', async () => {
    mockUsuariosService.historialCliente.mockResolvedValue([]);
    const res = await controller.historialCliente(1);
    expect(res).toEqual({ success: true, data: [] });
  });
});
