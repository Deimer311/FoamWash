import { Test, TestingModule } from '@nestjs/testing';
import { ReservasController } from '../../reservas/reservas.controller';
import { ReservasService } from '../../reservas/reservas.service';

describe('RF-06: Agendar Servicio', () => {
  let controller: ReservasController;
  const mockReservasService = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservasController],
      providers: [{ provide: ReservasService, useValue: mockReservasService }],
    }).compile();
    controller = module.get<ReservasController>(ReservasController);
  });

  it('CP-009: Debería crear una reserva', async () => {
    const payload = { fecha: '2024-12-01', Hora: '10:00', servicios: [{ Id_Servicio: 1 }] };
    mockReservasService.create.mockResolvedValue({ ID_Reserva: 1, ...payload });
    const result: any = await controller.create({ user: { id: 1 } }, payload);
    expect(result.success).toBe(true);
  });
});