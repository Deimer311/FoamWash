import { Test, TestingModule } from '@nestjs/testing';
import { ReservasController } from '../../reservas/reservas.controller';
import { ReservasService } from '../../reservas/reservas.service';

describe('RF-09: Gestionar Reservas (Admin)', () => {
  let controller: ReservasController;
  const mockReservasService = { findAll: jest.fn(), updateEstado: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [{ provide: ReservasService, useValue: mockReservasService }],
    }).compile();
    controller = module.get<ReservasController>(ReservasController);
  });

  it('CP-012: Listar todas', async () => {
    mockReservasService.findAll.mockResolvedValue([{ ID_Reserva: 1 }]);
    const result = await controller.findAll();
    expect(result.data.length).toBe(1);
  });
});