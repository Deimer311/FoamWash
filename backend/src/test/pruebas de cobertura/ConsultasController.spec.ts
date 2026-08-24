import { Test, TestingModule } from '@nestjs/testing';
import { ConsultasController } from '../../consultas/consultas.controller';
import { ConsultasService } from '../../consultas/consultas.service';

describe('ConsultasController', () => {
  let controller: ConsultasController;
  let service: jest.Mocked<ConsultasService>;

  const mockConsultasService = {
    usuariosPorRol: jest.fn(),
    serviciosDisponibles: jest.fn(),
    serviciosPorCliente: jest.fn(),
    agendaEmpleado: jest.fn(),
    clientesSemana: jest.fn(),
    reservasPorServicio: jest.fn(),
    reservasPorCliente: jest.fn(),
    empleadosServiciosMes: jest.fn(),
    empleadosSinServicios: jest.fn(),
    agendaSemanalCompleta: jest.fn(),
    todas: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsultasController],
      providers: [
        { provide: ConsultasService, useValue: mockConsultasService },
      ],
    }).compile();

    controller = module.get<ConsultasController>(ConsultasController);
    service = module.get(ConsultasService);
  });

  it('c1 - usuariosPorRol', async () => {
    mockConsultasService.usuariosPorRol.mockResolvedValue([]);
    const res = await controller.c1();
    expect(res).toEqual({ success: true, consulta: 1, data: [] });
  });

  it('c2 - serviciosDisponibles', async () => {
    mockConsultasService.serviciosDisponibles.mockResolvedValue([]);
    const res = await controller.c2();
    expect(res).toEqual({ success: true, consulta: 2, data: [] });
  });

  it('c3 - serviciosPorCliente', async () => {
    mockConsultasService.serviciosPorCliente.mockResolvedValue([]);
    const res = await controller.c3();
    expect(res).toEqual({ success: true, consulta: 3, data: [] });
  });

  it('c4 - agendaEmpleado', async () => {
    mockConsultasService.agendaEmpleado.mockResolvedValue([]);
    const res = await controller.c4(1);
    expect(res).toEqual({ success: true, consulta: 4, data: [] });
  });

  it('c5 - clientesSemana', async () => {
    mockConsultasService.clientesSemana.mockResolvedValue([]);
    const res = await controller.c5();
    expect(res).toEqual({ success: true, consulta: 5, data: [] });
  });

  it('c6 - reservasPorServicio', async () => {
    mockConsultasService.reservasPorServicio.mockResolvedValue([]);
    const res = await controller.c6();
    expect(res).toEqual({ success: true, consulta: 6, data: [] });
  });

  it('c7 - reservasPorCliente', async () => {
    mockConsultasService.reservasPorCliente.mockResolvedValue([]);
    const res = await controller.c7();
    expect(res).toEqual({ success: true, consulta: 7, data: [] });
  });

  it('c8 - empleadosServiciosMes', async () => {
    mockConsultasService.empleadosServiciosMes.mockResolvedValue([]);
    const res = await controller.c8();
    expect(res).toEqual({ success: true, consulta: 8, data: [] });
  });

  it('c9 - empleadosSinServicios', async () => {
    mockConsultasService.empleadosSinServicios.mockResolvedValue([]);
    const res = await controller.c9();
    expect(res).toEqual({ success: true, consulta: 9, data: [] });
  });

  it('c10 - agendaSemanalCompleta', async () => {
    mockConsultasService.agendaSemanalCompleta.mockResolvedValue([]);
    const res = await controller.c10();
    expect(res).toEqual({ success: true, consulta: 10, data: [] });
  });

  it('todas - todas las consultas', async () => {
    mockConsultasService.todas.mockResolvedValue([]);
    const res = await controller.todas();
    expect(res).toEqual({ success: true, data: [] });
  });
});
