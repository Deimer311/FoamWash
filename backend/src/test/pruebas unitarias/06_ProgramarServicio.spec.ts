import { Test, TestingModule } from '@nestjs/testing';
import { ReservasService } from '../../reservas/reservas.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProgramarServicio', () => {
  let reservasService: ReservasService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    reserva: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    usuario: {
      findMany: jest.fn(),
    },
    servicio: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    sendToTopic: jest.fn().mockResolvedValue('msg_id_123'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservasService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    reservasService = module.get<ReservasService>(ReservasService);
    prismaService = module.get(PrismaService);
  });

  it('CP-035: Agendamiento de cita exitoso en horario válido.', async () => {
    const fechaFutura = '2028-10-15';
    mockPrismaService.usuario.findMany.mockResolvedValue([
      {
        Id_Usuario: 2,
        Nombre: 'Empleado 1',
        empleado: [{ dias_laborales: 'domingo, lunes, martes, miercoles, jueves, viernes, sabado' }]
      }
    ]);
    mockPrismaService.reserva.findMany.mockResolvedValue([]);
    mockPrismaService.servicio.findMany.mockResolvedValue([{ Id_Servicio: 1, Precio: 100000 }]);
    mockPrismaService.reserva.create.mockResolvedValue({
      ID_Reserva: 101,
      Estado: 'Pendiente',
      fecha: new Date(fechaFutura),
      cliente: { Nombre: 'Juan', Correo: 'juan@test.com' },
      empleado: { Nombre: 'Carlos' },
      servicios: [{ Id_Servicio: 1 }],
    });

    const result = await reservasService.create({
      Id_Usuario: 1,
      fecha: fechaFutura,
      Hora: '10:00',
      servicios: [{ Id_Servicio: 1 }],
    });

    expect(result.success).toBe(true);
    expect(result.data.ID_Reserva).toBe(101);
  });

  it('CP-036: Rechazar reserva fuera del horario laboral (08:00 a 17:00).', async () => {
    await expect(
      reservasService.create({
        Id_Usuario: 1,
        fecha: '2028-10-15',
        Hora: '06:00',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CP-037: Rechazar reserva en el pasado.', async () => {
    await expect(
      reservasService.create({
        Id_Usuario: 1,
        fecha: '2020-01-01',
        Hora: '10:00',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('CP-038: Consultar reservas existentes por estado.', async () => {
    mockPrismaService.reserva.findMany.mockResolvedValue([
      { ID_Reserva: 1, Estado: 'Confirmado' },
    ]);

    const result = await reservasService.findByEstado('Confirmado');
    expect(result).toHaveLength(1);
    expect(result[0].Estado).toBe('Confirmado');
  });

  it('CP-039: Actualización del estado de la reserva.', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 1 });
    mockPrismaService.reserva.update.mockResolvedValue({
      ID_Reserva: 1,
      Estado: 'En Camino',
      fecha: new Date(),
      Hora: new Date(),
      cliente: { Id_Usuario: 5, Correo: 'cliente@test.com' },
      servicios: [],
      empleado: null,
    });

    const updated = await reservasService.updateEstado(1, 'En Camino');
    expect(updated.Estado).toBe('En Camino');
  });

  it('CP-040: Cancelar reserva con motivo.', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 1 });
    mockPrismaService.reserva.update.mockResolvedValue({
      ID_Reserva: 1,
      Estado: 'Cancelado',
      fecha: new Date(),
      cliente: { Correo: 'test@cliente.com' },
      empleado: null,
    });

    const res = await reservasService.cancelarReserva(1, 'Problema personal');
    expect(res.Estado).toBe('Cancelado');
  });

  it('CP-041: Lanzar 404 al consultar reserva inexistente.', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue(null);
    await expect(reservasService.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('CP-042: Eliminar reserva correctamente.', async () => {
    mockPrismaService.reserva.findUnique.mockResolvedValue({ ID_Reserva: 1 });
    mockPrismaService.reserva.delete.mockResolvedValue({ ID_Reserva: 1 });

    const deleted = await reservasService.remove(1);
    expect(deleted.ID_Reserva).toBe(1);
  });
});
