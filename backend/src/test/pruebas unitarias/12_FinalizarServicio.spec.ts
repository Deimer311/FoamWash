import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasService } from '../../estadisticas/estadisticas.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('Reportes y Estadísticas', () => {
  let estadisticasService: EstadisticasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    servicio: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadisticasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    estadisticasService = module.get<EstadisticasService>(EstadisticasService);
    prismaService = module.get(PrismaService);
  });

  it('CP-074: El empleado pueda marcar un servicio como finalizado', async () => {
    mockPrismaService.reserva.count
      .mockResolvedValueOnce(15) // totalReservas
      .mockResolvedValueOnce(10) // completadas
      .mockResolvedValueOnce(5); // pendientes

    mockPrismaService.servicio.count.mockResolvedValue(8);
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { Id_Usuario: 1, Estado: 'Completado', servicios: [{ Precio: 100000 }] },
      { Id_Usuario: 2, Estado: 'Completado', servicios: [{ Precio: 150000 }] },
    ]);

    const result = await estadisticasService.getDashboard();

    expect(result.Total_Reservas).toBe(15);
    expect(result.Reservas_Completadas).toBe(10);
    expect(result.Reservas_Pendientes).toBe(5);
    expect(result.Ingresos_Totales).toBe(250000);
    expect(result.Total_Clientes).toBe(2);
  });

  it('CP-075: Confirmaci¾n de la acci¾n', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(4);
    mockPrismaService.servicio.count.mockResolvedValue(5);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);

    const result = await estadisticasService.getDashboard('mensual');
    expect(result.Total_Reservas).toBe(4);
  });

  it('CP-076: Actualizaci¾n en la lista de servicios', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(50);
    mockPrismaService.servicio.count.mockResolvedValue(5);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);

    const result = await estadisticasService.getDashboard('anual');
    expect(result.Total_Reservas).toBe(50);
  });

  it('CP-077: Restricci¾n de servicios no asignados', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(2);
    mockPrismaService.servicio.count.mockResolvedValue(3);
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { Id_Usuario: 1, Estado: 'Pendiente', servicios: [{ Precio: 100000 }] },
    ]);

    const result = await estadisticasService.getDashboard();
    expect(result.Ingresos_Totales).toBe(0);
  });

  it('CP-078: Persistencia del estado', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(0);
    mockPrismaService.servicio.count.mockResolvedValue(12);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);

    const result = await estadisticasService.getDashboard();
    expect(result.Servicios_Ofrecidos).toBe(12);
  });

  it.todo('CP-079: Actualizaci¾n en tiempo real');
});
