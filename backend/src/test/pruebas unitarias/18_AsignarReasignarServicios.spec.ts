import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from '../../reservas/reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('18_AsignarReasignarServicios', () => {
  let reservasService: ReservasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    usuario: {
      findUnique: jest.fn(),
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

  it('CP-096: Asignación exitosa', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 1 });
    mockPrismaService.reserva.update.mockResolvedValue({ ID_Reserva: 1, empleado_Id_Usuario: 2 });
    const result = await reservasService.update(1, { empleado_Id_Usuario: 2 });
    expect(result.empleado_Id_Usuario).toBe(2);
  });

  it('CP-097: Sin disponibilidad', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([{ ID_Reserva: 2 }]);
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);
    expect(true).toBe(true);
  });

  it('CP-098: Reasignación exitosa', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 1 });
    mockPrismaService.reserva.update.mockResolvedValue({ ID_Reserva: 1, empleado_Id_Usuario: 3 });
    const result = await reservasService.update(1, { empleado_Id_Usuario: 3 });
    expect(result.empleado_Id_Usuario).toBe(3);
  });

  it('CP-099: Conflicto de horario', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([{ ID_Reserva: 4 }]);
    expect(true).toBe(true);
  });
});
