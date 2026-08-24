import { Test, TestingModule } from '@nestjs/testing';
import { EmpleadosController } from '../../empleados/empleados.controller';
import { EmpleadosService } from '../../empleados/empleados.service';

describe('EmpleadosController', () => {
  let controller: EmpleadosController;
  let service: jest.Mocked<EmpleadosService>;

  const mockEmpleadosService = {
    findAll: jest.fn(),
    createEmpleado: jest.fn(),
    getSinServicios: jest.fn(),
    getServiciosFinalizados: jest.fn(),
    getProductividadGeneral: jest.fn(),
    getPerfilCompleto: jest.fn(),
    getDesempeno: jest.fn(),
    getReservasHoy: jest.fn(),
    getReservasSemana: jest.fn(),
    getReservasMes: jest.fn(),
    getHistorial: jest.fn(),
    getCompletados: jest.fn(),
    getPendientes: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmpleadosController],
      providers: [
        { provide: EmpleadosService, useValue: mockEmpleadosService },
      ],
    }).compile();

    controller = module.get<EmpleadosController>(EmpleadosController);
    service = module.get(EmpleadosService);
  });

  it('findAll - debe retornar lista de empleados', async () => {
    mockEmpleadosService.findAll.mockResolvedValue([{ Id_Usuario: 1 }]);
    const res = await controller.findAll();
    expect(res).toEqual({ success: true, data: [{ Id_Usuario: 1 }] });
  });

  it('create - debe crear empleado', async () => {
    mockEmpleadosService.createEmpleado.mockResolvedValue({ Id_Usuario: 2 });
    const res = await controller.create({ nombre: 'Test' });
    expect(res).toEqual({ success: true, data: { Id_Usuario: 2 } });
  });

  it('sinServicios - debe retornar empleados sin servicios', async () => {
    mockEmpleadosService.getSinServicios.mockResolvedValue([]);
    const res = await controller.sinServicios();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('serviciosFinalizados - debe retornar servicios finalizados', async () => {
    mockEmpleadosService.getServiciosFinalizados.mockResolvedValue([]);
    const res = await controller.serviciosFinalizados();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('productividadGeneral - debe retornar productividad general', async () => {
    mockEmpleadosService.getProductividadGeneral.mockResolvedValue([]);
    const res = await controller.productividadGeneral();
    expect(res).toEqual({ success: true, data: [] });
  });

  it('miPerfilCompleto - debe retornar perfil autenticado', async () => {
    mockEmpleadosService.getPerfilCompleto.mockResolvedValue({ Id_Usuario: 1 });
    const res = await controller.miPerfilCompleto({ user: { id: 1 } });
    expect(res).toEqual({ success: true, data: { Id_Usuario: 1 } });
  });

  it('miDesempeno - debe retornar desempeño autenticado', async () => {
    mockEmpleadosService.getDesempeno.mockResolvedValue({ total: 5 });
    const res = await controller.miDesempeno({ user: { id: 1 } });
    expect(res).toEqual({ success: true, data: { total: 5 } });
  });

  it('misServiciosHoy - debe retornar servicios hoy autenticado', async () => {
    mockEmpleadosService.getReservasHoy.mockResolvedValue([]);
    const res = await controller.misServiciosHoy({ user: { id: 1 } });
    expect(res).toEqual({ success: true, data: [] });
  });

  it('perfilCompleto - debe retornar perfil por id', async () => {
    mockEmpleadosService.getPerfilCompleto.mockResolvedValue({ Id_Usuario: 2 });
    const res = await controller.perfilCompleto(2);
    expect(res).toEqual({ success: true, data: { Id_Usuario: 2 } });
  });

  it('desempeno - debe retornar desempeno por id', async () => {
    mockEmpleadosService.getDesempeno.mockResolvedValue({ total: 10 });
    const res = await controller.desempeno(2);
    expect(res).toEqual({ success: true, data: { total: 10 } });
  });

  it('serviciosHoy - debe retornar servicios de hoy por id', async () => {
    mockEmpleadosService.getReservasHoy.mockResolvedValue([{ id: 1 }]);
    const res = await controller.serviciosHoy(2);
    expect(res).toEqual({ success: true, data: [{ id: 1 }], total: 1 });
  });

  it('agendaSemanal - debe retornar agenda semanal', async () => {
    mockEmpleadosService.getReservasSemana.mockResolvedValue([]);
    const res = await controller.agendaSemanal(2);
    expect(res).toEqual({ success: true, data: [], total: 0 });
  });

  it('agendaMensual - debe retornar agenda mensual', async () => {
    mockEmpleadosService.getReservasMes.mockResolvedValue([]);
    const res = await controller.agendaMensual(2);
    expect(res).toEqual({ success: true, data: [], total: 0 });
  });

  it('historial - debe retornar historial de servicios', async () => {
    mockEmpleadosService.getHistorial.mockResolvedValue([]);
    const res = await controller.historial(2);
    expect(res).toEqual({ success: true, data: [], total: 0 });
  });

  it('completados - debe retornar completados', async () => {
    mockEmpleadosService.getCompletados.mockResolvedValue([]);
    const res = await controller.completados(2);
    expect(res).toEqual({ success: true, data: [], total: 0 });
  });

  it('pendientes - debe retornar pendientes', async () => {
    mockEmpleadosService.getPendientes.mockResolvedValue([]);
    const res = await controller.pendientes(2);
    expect(res).toEqual({ success: true, data: [], total: 0 });
  });
});
