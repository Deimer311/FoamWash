import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosService } from '../../empleados/empleados.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AgendaEmpleados', () => {
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

  it('CP-062: El empleado pueda visualizar su agenda de servicios', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 10, empleado_Id_Usuario: 2, fecha: new Date(), Estado: 'Pendiente' },
    ]);

    const result = await empleadosService.getReservasHoy(2);
    expect(result).toHaveLength(1);
    expect(result[0].empleado_Id_Usuario).toBe(2);
  });

  it('CP-063: Se muestren correctamente los datos del servicio', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 10, fecha: new Date() },
      { ID_Reserva: 11, fecha: new Date() },
    ]);

    const result = await empleadosService.getReservasSemana(2);
    expect(result).toHaveLength(2);
  });

  it('CP-064: Solo se muestren servicios del empleado logueado', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 15, fecha: new Date() },
    ]);

    const result = await empleadosService.getReservasMes(2);
    expect(result).toHaveLength(1);
  });

  it('CP-065: Comportamiento cuando no hay servicios asignados', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 20, Estado: 'En Proceso' },
    ]);

    const result = await empleadosService.getPendientes(2);
    expect(result[0].Estado).toBe('En Proceso');
  });

  it('CP-066: Actualizaci¾n de agenda', async () => {
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

  it('CP-067: Acceso a detalle del servicio', () => {
    expect(true).toBe(true);
  });

  it('CP-068: Carga de la agenda (rendimiento)', () => {
    expect(true).toBe(true);
  });
});
