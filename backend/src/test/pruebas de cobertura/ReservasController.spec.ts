import { Test, TestingModule } from '@nestjs/testing';
import { ReservasController } from '../../reservas/reservas.controller';
import { ReservasService } from '../../reservas/reservas.service';

describe('ReservasController', () => {
  let controller: ReservasController;
  let service: jest.Mocked<ReservasService>;

  const mockReservasService = {
    findAll: jest.fn(),
    findByEstado: jest.fn(),
    findByCliente: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateEstado: jest.fn(),
    cancelarReserva: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [
        { provide: ReservasService, useValue: mockReservasService },
      ],
    }).compile();

    controller = module.get<ReservasController>(ReservasController);
    service = module.get(ReservasService);
  });

  it('findAll - debe retornar reservas', async () => {
    mockReservasService.findAll.mockResolvedValue([]);
    const res = await controller.findAll();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('findByEstado - debe retornar reservas', async () => {
    mockReservasService.findByEstado.mockResolvedValue([]);
    const res = await controller.findByEstado('Activa');
    expect(res).toEqual({ success: true, data: [] });
  });

  it('findByCliente - debe retornar reservas', async () => {
    mockReservasService.findByCliente.mockResolvedValue([]);
    const res = await controller.findByCliente(1);
    expect(res).toEqual({ success: true, data: [] });
  });

  it('findOne - debe retornar una reserva', async () => {
    mockReservasService.findOne.mockResolvedValue({ ID_Reserva: 1 } as any);
    const res = await controller.findOne(1);
    expect(res).toEqual({ success: true, data: { ID_Reserva: 1 } });
  });

  it('create - debe crear reserva', async () => {
    mockReservasService.create.mockResolvedValue({ ID_Reserva: 1 } as any);
    const res = await controller.create({ user: { id: 1 } } as any, {} as any);
    expect(res).toEqual({ success: true, message: 'Reserva creada exitosamente', data: { ID_Reserva: 1 } });
  });

  it('update - debe actualizar reserva', async () => {
    mockReservasService.update.mockResolvedValue({ ID_Reserva: 1 } as any);
    const res = await controller.update(1, {} as any);
    expect(res).toEqual({ success: true, message: 'Reserva actualizada exitosamente', data: { ID_Reserva: 1 } });
  });

  it('updateEstado - debe actualizar estado', async () => {
    mockReservasService.updateEstado.mockResolvedValue({ ID_Reserva: 1 } as any);
    const res = await controller.updateEstado(1, 'Activa');
    expect(res).toEqual({ success: true, message: 'Estado actualizado', data: { ID_Reserva: 1 } });
  });

  it('cancelarReserva - debe cancelar', async () => {
    mockReservasService.cancelarReserva.mockResolvedValue({ ID_Reserva: 1 } as any);
    const res = await controller.cancelarReserva(1, 'motivo');
    expect(res).toEqual({ success: true, message: 'Reserva cancelada y correo enviado', data: { ID_Reserva: 1 } });
  });

  it('remove - debe eliminar', async () => {
    mockReservasService.remove.mockResolvedValue({ ID_Reserva: 1 } as any);
    const res = await controller.remove(1);
    expect(res).toEqual({ success: true, message: 'Reserva eliminada exitosamente' });
  });
});
