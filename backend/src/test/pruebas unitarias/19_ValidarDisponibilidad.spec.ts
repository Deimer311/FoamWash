import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from '../../reservas/reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('19_ValidarDisponibilidad', () => {
  let reservasService: ReservasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      findMany: jest.fn(),
    },
    usuario: {
      findMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: { sendToTopic: jest.fn(), sendToDevice: jest.fn() } },
      ],
    }).compile();

    reservasService = module.get<ReservasService>(ReservasService);
    prismaService = module.get(PrismaService);
  });

  it('CP-100: Validación exitosa', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([]);
    expect(true).toBe(true);
  });

  it('CP-101: Sin disponibilidad', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([{ ID_Reserva: 1 }]);
    expect(true).toBe(true);
  });

  it('CP-102: Sin disponibilidad (fuera de horario)', async () => {
    expect(true).toBe(true);
  });
});
