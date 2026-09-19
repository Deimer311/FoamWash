import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasService } from '../../estadisticas/estadisticas.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('21_VisualizarEstadisticas', () => {
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

  it('CP-106: Visualizacion Exitoza de los Estadisticos del sistema', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(10);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);
    mockPrismaService.servicio.count.mockResolvedValue(5);
    const result = await estadisticasService.getDashboard();
    expect(result.Total_Reservas).toBe(10);
  });

  it('CP-107: Visualizar los Graficos en el Sistema Donde se', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 1, Estado: 'Completado', servicios: [{ Precio: 50000 }] },
    ]);
    const result = await estadisticasService.getDashboard();
    expect(result).toBeDefined();
  });
});
