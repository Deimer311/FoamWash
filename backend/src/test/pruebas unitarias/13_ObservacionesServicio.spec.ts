import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from '../../reservas/reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('13_ObservacionesServicio', () => {
  let reservasService: ReservasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: { sendToTopic: jest.fn() } },
      ],
    }).compile();

    reservasService = module.get<ReservasService>(ReservasService);
    prismaService = module.get(PrismaService);
  });

  it('CP-080: El trabajador puede registrar correctamente las observaciones de', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 1 });
    mockPrismaService.reserva.update.mockResolvedValue({
      ID_Reserva: 1,
      observacion: { Observaciones: 'Vehículo muy sucio' },
    });
    const result: any = await reservasService.update(1, { Estado: 'Completado', Informacion_adicional: 'Vehículo muy sucio' });
    expect(result.observacion.Observaciones).toBe('Vehículo muy sucio');
  });

  it('CP-081: El trabajador puede registrar en blanco las observaciones,', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 2 });
    mockPrismaService.reserva.update.mockResolvedValue({
      ID_Reserva: 2,
      observacion: { Observaciones: '' },
    });
    const result: any = await reservasService.update(2, { Estado: 'Completado', Informacion_adicional: '' });
    expect(result.observacion.Observaciones).toBe('');
  });

  it('CP-082: El administrador puede ver las observaciones que dejo', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({
      ID_Reserva: 3,
      observacion: { Observaciones: 'Detalle en el capó' },
    });
    const result: any = await reservasService.findOne(3);
    expect(result.observacion.Observaciones).toBe('Detalle en el capó');
  });
});
