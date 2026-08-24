import { Test, TestingModule } from '@nestjs/testing';
import { ConsultasService } from '../../consultas/consultas.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ConsultasService', () => {
  let consultasService: ConsultasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    rol: { findMany: jest.fn() },
    servicio: { findMany: jest.fn() },
    usuario: { findMany: jest.fn() },
    reserva: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    consultasService = module.get<ConsultasService>(ConsultasService);
    prismaService = module.get(PrismaService);
  });

  it('debe estar definido', () => {
    expect(consultasService).toBeDefined();
  });

  it('1. usuariosPorRol() - debe retornar conteo por rol', async () => {
    mockPrismaService.rol.findMany.mockResolvedValue([{ Rol: 'admin', _count: { usuarios: 2 } }]);
    const res = await consultasService.usuariosPorRol();
    expect(res).toEqual([{ Rol: 'admin', _count: { usuarios: 2 } }]);
    expect(mockPrismaService.rol.findMany).toHaveBeenCalledTimes(1);
  });

  it('2. serviciosDisponibles() - debe retornar servicios', async () => {
    mockPrismaService.servicio.findMany.mockResolvedValue([{ Id_Servicio: 1 }]);
    const res = await consultasService.serviciosDisponibles();
    expect(res).toEqual([{ Id_Servicio: 1 }]);
  });

  it('3. serviciosPorCliente() - debe retornar clientes y sus servicios', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([{ Id_Usuario: 1 }]);
    const res = await consultasService.serviciosPorCliente();
    expect(res).toEqual([{ Id_Usuario: 1 }]);
  });

  it('4. agendaEmpleado() - debe retornar agenda del empleado', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([{ ID_Reserva: 1 }]);
    const res = await consultasService.agendaEmpleado(1);
    expect(res).toEqual([{ ID_Reserva: 1 }]);
  });

  it('5. clientesSemana() - debe retornar reservas de la semana', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([{ ID_Reserva: 2 }]);
    const res = await consultasService.clientesSemana();
    expect(res).toEqual([{ ID_Reserva: 2 }]);
  });

  it('6. reservasPorServicio() - debe retornar reservas por servicio', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([{ ID_Reserva: 3 }]);
    const res = await consultasService.reservasPorServicio();
    expect(res).toEqual([{ ID_Reserva: 3 }]);
  });

  it('7. reservasPorCliente() - debe retornar conteo de reservas por cliente', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([{ Id_Usuario: 1 }]);
    const res = await consultasService.reservasPorCliente();
    expect(res).toEqual([{ Id_Usuario: 1 }]);
  });

  it('8. empleadosServiciosMes() - debe retornar servicios por empleado', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([{ Id_Usuario: 2 }]);
    const res = await consultasService.empleadosServiciosMes();
    expect(res).toEqual([{ Id_Usuario: 2 }]);
  });

  it('9. empleadosSinServicios() - debe retornar empleados sin servicios', async () => {
    mockPrismaService.usuario.findMany.mockResolvedValue([{ Id_Usuario: 2 }]);
    const res = await consultasService.empleadosSinServicios();
    expect(res).toEqual([{ Id_Usuario: 2 }]);
  });

  it('10. agendaSemanalCompleta() - debe retornar agenda semanal de empleados', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([{ ID_Reserva: 1 }]);
    const res = await consultasService.agendaSemanalCompleta();
    expect(res).toEqual([{ ID_Reserva: 1 }]);
  });

  it('11. todas() - debe retornar todos los resultados', async () => {
    mockPrismaService.rol.findMany.mockResolvedValue([]);
    mockPrismaService.servicio.findMany.mockResolvedValue([]);
    mockPrismaService.usuario.findMany.mockResolvedValue([]);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);

    const res = await consultasService.todas();
    expect(res).toHaveProperty('consulta1_usuariosPorRol');
    expect(res).toHaveProperty('consulta2_serviciosDisponibles');
    expect(res).toHaveProperty('consulta3_serviciosPorCliente');
    expect(res).toHaveProperty('consulta5_clientesSemana');
    expect(res).toHaveProperty('consulta6_reservasPorServicio');
    expect(res).toHaveProperty('consulta7_reservasPorCliente');
    expect(res).toHaveProperty('consulta9_empleadosSinServicios');
  });
});
