import { Test, TestingModule } from '@nestjs/testing';
import { EstadisticasService } from '../../estadisticas/estadisticas.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('22_ExportarDatos', () => {
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

  it('CP-108: Generación exitosa de los reportes en el sistema', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 1, Estado: 'Completado', servicios: [{ Precio: 50000 }] },
    ]);
    const result = await estadisticasService.getDashboard();
    expect(result).toBeDefined();
  });
});
