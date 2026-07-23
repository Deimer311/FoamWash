import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosService } from '../../empleados/empleados.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AgendaEmpleados (RF-10)', () => {
  let empleadosService: EmpleadosService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    usuario: {
      findMany: jest.fn(),
    },
    calificacion: {
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

  it('CP-058: Consultar reservas asignadas para el día de hoy.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 10, empleado_Id_Usuario: 2, fecha: new Date(), Estado: 'Pendiente' },
    ]);

    const result = await empleadosService.getReservasHoy(2);
    expect(result).toHaveLength(1);
    expect(result[0].empleado_Id_Usuario).toBe(2);
  });

  it('CP-059: Consultar la agenda semanal del empleado.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 10, fecha: new Date() },
      { ID_Reserva: 11, fecha: new Date() },
    ]);

    const result = await empleadosService.getReservasSemana(2);
    expect(result).toHaveLength(2);
  });

  it('CP-060: Consultar la agenda mensual del empleado.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 15, fecha: new Date() },
    ]);

    const result = await empleadosService.getReservasMes(2);
    expect(result).toHaveLength(1);
  });

  it('CP-061: Consultar los servicios pendientes del empleado.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 20, Estado: 'En Proceso' },
    ]);

    const result = await empleadosService.getPendientes(2);
    expect(result[0].Estado).toBe('En Proceso');
  });

  it('CP-062: Consultar métricas de desempeño del empleado.', async () => {
    mockPrismaService.reserva.count.mockResolvedValue(5);
    mockPrismaService.calificacion.findMany.mockResolvedValue([
      { puntaje: 5, comentario: 'Excelente' },
      { puntaje: 4, comentario: 'Muy bueno' },
    ]);

    const desempeno = await empleadosService.getDesempeno(2);
    expect(desempeno.servicios_mes).toBe(5);
    expect(desempeno.calificacion_promedio).toBe(4.5);
    expect(desempeno.total_calificaciones).toBe(2);
  });
});
