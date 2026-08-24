import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from '../../reservas/reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('HistorialServicios', () => {
  let reservasService: ReservasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      findMany: jest.fn(),
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

  it('CP-048: Pueda consultar el historial de servicios realizados por cliente.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 1, Id_Usuario: 10, Estado: 'Completado', fecha: new Date() },
      { ID_Reserva: 2, Id_Usuario: 10, Estado: 'Cancelado', fecha: new Date() },
    ]);

    const result = await reservasService.findByCliente(10);

    expect(result).toHaveLength(2);
    expect(result[0].Id_Usuario).toBe(10);
    expect(mockPrismaService.reserva.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { Id_Usuario: 10 } }),
    );
  });

  it('CP-049: Solo consulte su propio historial.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([]);

    const result = await reservasService.findByCliente(999);
    expect(result).toHaveLength(0);
  });

  it('CP-050: Validar orden descendente del historial por fecha.', async () => {
    const d1 = new Date('2026-05-01');
    const d2 = new Date('2026-06-01');
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 2, fecha: d2 },
      { ID_Reserva: 1, fecha: d1 },
    ]);

    const result = await reservasService.findByCliente(10);
    expect(result[0].fecha.getTime()).toBeGreaterThan(result[1].fecha.getTime());
  });

  it('CP-051: Validar detalle completo de un servicio en el historial.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      {
        ID_Reserva: 1,
        Estado: 'Completado',
        servicios: [{ Nombre_Servicio: 'Lavado Poltrona' }],
        observacion: { Observaciones: 'Excelente servicio' },
        empleado: { Nombre: 'Empleado Test' },
      },
    ]);

    const result = await reservasService.findByCliente(10);
    expect(result[0].servicios[0].Nombre_Servicio).toBe('Lavado Poltrona');
    expect(result[0].empleado.Nombre).toBe('Empleado Test');
  });

  it('CP-052: Manejo de errores al cargar el historial.', async () => {
    mockPrismaService.reserva.findMany.mockRejectedValue(new Error('DB Error'));

    await expect(reservasService.findByCliente(10)).rejects.toThrow('DB Error');
  });
});
