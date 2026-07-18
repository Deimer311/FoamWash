import { Test, TestingModule } from '@nestjs/testing';
import { ReservasController } from '../../reservas/reservas.controller';
import { ReservasService } from '../../reservas/reservas.service';

describe('RF-07: Visualizar Agendamientos', () => {
  let controller: ReservasController;
  const mockReservasService = { findByCliente: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [{ provide: ReservasService, useValue: mockReservasService }],
    }).compile();
    controller = module.get<ReservasController>(ReservasController);
  });

  it('CP-010: Debería listar las reservas del cliente logueado', async () => {
    mockReservasService.findByCliente.mockResolvedValue([{ ID_Reserva: 1 }]);
    const result = await controller.findByCliente(1);
    expect(result.data).toHaveLength(1);
  });
});