import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from '../../reservas/reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('17_AdministrarOrdenesServicio', () => {
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

  it('CP-092: Aprobación exitosa', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 1 });
    mockPrismaService.reserva.update.mockResolvedValue({ ID_Reserva: 1, Estado: 'Aprobado' });
    const result = await reservasService.update(1, { Estado: 'Aprobado' });
    expect(result.Estado).toBe('Aprobado');
  });

  it('CP-093: Rechazo con motivo', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 2 });
    mockPrismaService.reserva.update.mockResolvedValue({ ID_Reserva: 2, Estado: 'Cancelado', Informacion_adicional: 'Motivo rechazo' });
    const result = await reservasService.update(2, { Estado: 'Cancelado', Informacion_adicional: 'Motivo rechazo' });
    expect(result.Estado).toBe('Cancelado');
  });

  it('CP-094: Cancelación exitosa', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({
      ID_Reserva: 3,
      Estado: 'Pendiente',
      cliente: { Correo: 'test@test.com' }
    });
    mockPrismaService.reserva.update.mockResolvedValue({ ID_Reserva: 3, Estado: 'Cancelado' });
    const result = await reservasService.cancelarReserva(3, 'Cancelado');
    expect(result.Estado).toBe('Cancelado');
  });

  it('CP-095: Orden inexistente', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue(null);
    await expect(reservasService.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
