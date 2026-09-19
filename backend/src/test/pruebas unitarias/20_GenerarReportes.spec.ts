import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasService } from '../../estadisticas/estadisticas.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('20_GenerarReportes', () => {
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

  it('CP-103: Generación Y Visualizacion Exitoza de los Graficos Administrativos', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(10);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);
    mockPrismaService.servicio.count.mockResolvedValue(5);
    const result = await estadisticasService.getDashboard();
    expect(result.Total_Reservas).toBe(10);
  });

  it('CP-104: Generación Y Visualizacion Exitoza de los Graficos Administrativos', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(5);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);
    mockPrismaService.servicio.count.mockResolvedValue(5);
    const result = await estadisticasService.getDashboard('mensual');
    expect(result.Total_Reservas).toBe(5);
  });

  it('CP-105: Generación exitosa de los reportes en el sistema', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 1, Estado: 'Completado', servicios: [{ Precio: 50000 }] },
    ]);
    const result = await estadisticasService.getDashboard();
    expect(result).toBeDefined();
  });
});
