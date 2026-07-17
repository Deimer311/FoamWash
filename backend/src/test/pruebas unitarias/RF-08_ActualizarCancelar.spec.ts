import { Test, TestingModule } from '@nestjs/testing';
import { ReservasController } from '../../reservas/reservas.controller';
import { ReservasService } from '../../reservas/reservas.service';

describe('RF-08: Actualizar/Cancelar Reserva por Cliente', () => {
  let controller: ReservasController;
  const mockReservasService = { cancelarReserva: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [{ provide: ReservasService, useValue: mockReservasService }],
    }).compile();
    controller = module.get<ReservasController>(ReservasController);
  });

  it('CP-011: Debería permitir cancelar', async () => {
    mockReservasService.cancelarReserva.mockResolvedValue({ ID_Reserva: 1, Estado: 'Cancelado' });
    const result = await controller.cancelarReserva(1, 'No asisto');
    expect(result.success).toBe(true);
  });
});