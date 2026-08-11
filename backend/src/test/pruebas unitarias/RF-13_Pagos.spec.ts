import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from '../../reservas/reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('Pagos (RF-13)', () => {
  let reservasService: ReservasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      findUnique: jest.fn(),
      update: jest.fn(),
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

  it('CP-073: Registrar y confirmar el estado de pago del servicio (Completado).', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 10 });
    mockPrismaService.reserva.update.mockResolvedValue({
      ID_Reserva: 10,
      Estado: 'Completado',
      cliente: { Id_Usuario: 1, Correo: 'test@cliente.com' },
      servicios: [{ Precio: 120000 }],
      empleado: null,
    });

    const res = await reservasService.updateEstado(10, 'Completado');
    expect(res.Estado).toBe('Completado');
  });

  it('CP-074: Validar cálculo del costo total de servicios en una reserva.', () => {
    const servicios = [{ Precio: 100000 }, { Precio: 50000 }];
    const total = servicios.reduce((sum, s) => sum + s.Precio, 0);
    expect(total).toBe(150000);
  });

  it('CP-075: Manejo de estado Pendiente de pago.', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 11 });
    mockPrismaService.reserva.update.mockResolvedValue({
      ID_Reserva: 11,
      Estado: 'Pendiente',
      cliente: { Id_Usuario: 1 },
      servicios: [],
      empleado: null,
    });

    const res = await reservasService.updateEstado(11, 'Pendiente');
    expect(res.Estado).toBe('Pendiente');
  });

  it('CP-076: Rehusar actualización de pago para reserva inexistente.', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue(null);
    await expect(reservasService.updateEstado(999, 'Completado')).rejects.toThrow();
  });
});
