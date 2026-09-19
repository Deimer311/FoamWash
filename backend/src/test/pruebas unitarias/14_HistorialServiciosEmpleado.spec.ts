import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosService } from '../../empleados/empleados.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('14_HistorialServiciosEmpleado', () => {
  let empleadosService: EmpleadosService;
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
        EmpleadosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    empleadosService = module.get<EmpleadosService>(EmpleadosService);
    prismaService = module.get(PrismaService);
  });

  it('CP-083: Historial exitoso', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 1, Estado: 'Completado' },
    ]);
    const result = await empleadosService.getReservasMes(1);
    expect(result.length).toBeGreaterThan(0);
  });

  it('CP-084: Sin registros', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([]);
    const result = await empleadosService.getReservasMes(1);
    expect(result.length).toBe(0);
  });
});
