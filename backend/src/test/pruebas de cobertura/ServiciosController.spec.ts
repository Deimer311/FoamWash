import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosController } from '../../servicios/servicios.controller';
import { ServiciosService } from '../../servicios/servicios.service';

describe('ServiciosController', () => {
  let controller: ServiciosController;
  let service: jest.Mocked<ServiciosService>;

  const mockServiciosService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    masSolicitados: jest.fn(),
    programadosHoy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServiciosController],
      providers: [
        { provide: ServiciosService, useValue: mockServiciosService },
      ],
    }).compile();

    controller = module.get<ServiciosController>(ServiciosController);
    service = module.get(ServiciosService);
  });

  it('findAll - debe retornar servicios', async () => {
    mockServiciosService.findAll.mockResolvedValue([]);
    const res = await controller.findAll();
    expect(res).toEqual({ success: true, count: 0, data: [] });
  });

  it('masSolicitados - debe retornar servicios mas solicitados', async () => {
    mockServiciosService.masSolicitados.mockResolvedValue([]);
    const res = await controller.masSolicitados();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('programadosHoy - debe retornar programados', async () => {
    mockServiciosService.programadosHoy.mockResolvedValue([]);
    const res = await controller.programadosHoy();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('findOne - debe retornar un servicio', async () => {
    mockServiciosService.findOne.mockResolvedValue({ Id_Servicio: 1 } as any);
    const res = await controller.findOne(1);
    expect(res).toEqual({ success: true, data: { Id_Servicio: 1 } });
  });

  it('create - debe crear servicio', async () => {
    mockServiciosService.create.mockResolvedValue({ Id_Servicio: 1 } as any);
    const res = await controller.create({} as any);
    expect(res).toEqual({ success: true, message: 'Servicio creado exitosamente', data: { Id_Servicio: 1 } });
  });

  it('update - debe actualizar servicio', async () => {
    mockServiciosService.update.mockResolvedValue({ Id_Servicio: 1 } as any);
    const res = await controller.update(1, {} as any);
    expect(res).toEqual({ success: true, message: 'Servicio actualizado exitosamente', data: { Id_Servicio: 1 } });
  });

  it('remove - debe eliminar servicio', async () => {
    mockServiciosService.remove.mockResolvedValue({ Id_Servicio: 1 } as any);
    const res = await controller.remove(1);
    expect(res).toEqual({ success: true, message: 'Servicio eliminado exitosamente' });
  });
});
