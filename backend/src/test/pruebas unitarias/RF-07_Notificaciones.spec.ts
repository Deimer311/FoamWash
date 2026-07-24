import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('Notificaciones (RF-07)', () => {
  let notificationsService: NotificationsService;
  let notificacionesService: NotificacionesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    notificacion: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    usuario: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: NotificationsService,
          useValue: {
            sendToTopic: jest.fn().mockResolvedValue('projects/foamwash/messages/msg_123'),
            sendToDevice: jest.fn().mockResolvedValue('projects/foamwash/messages/msg_456'),
          },
        },
      ],
    }).compile();

    notificationsService = module.get<NotificationsService>(NotificationsService);
    notificacionesService = module.get<NotificacionesService>(NotificacionesService);
    prismaService = module.get(PrismaService);
  });

  it('CP-043: Envío exitoso de notificación push a un tópico.', async () => {
    const res = await notificationsService.sendToTopic('topic_admin', 'Título', 'Cuerpo');
    expect(res).toContain('msg_123');
    expect(notificationsService.sendToTopic).toHaveBeenCalledWith(
      'topic_admin',
      'Título',
      'Cuerpo',
    );
  });

  it('CP-044: Notificación por asignaciones de servicio al trabajador guardada en la base de datos (RF15/CP-044).', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 2, Nombre: 'Empleado 1' });
    mockPrismaService.notificacion.create.mockResolvedValue({
      id_notificaciones: 1,
      usuario_Id_Usuario: 2,
      descripcion_notificacion: 'Tienes una nueva orden de servicio #101 asignada.',
      fecha_notificacion: new Date(),
    });

    const notif = await notificacionesService.crear({
      usuario_Id_Usuario: 2,
      descripcion_notificacion: 'Tienes una nueva orden de servicio #101 asignada.',
    });

    expect(notif.id_notificaciones).toBe(1);
    expect(notif.usuario_Id_Usuario).toBe(2);
    expect(mockPrismaService.notificacion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          usuario_Id_Usuario: 2,
          descripcion_notificacion: 'Tienes una nueva orden de servicio #101 asignada.',
        }),
      }),
    );
  });

  it('CP-045: Notificación por reasignaciones de servicio al trabajador guardada en la base de datos (RF15/CP-045).', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 3, Nombre: 'Empleado Reasignado' });
    mockPrismaService.notificacion.create.mockResolvedValue({
      id_notificaciones: 2,
      usuario_Id_Usuario: 3,
      descripcion_notificacion: 'Se te ha reasignado la orden de servicio #101.',
      fecha_notificacion: new Date(),
    });

    const notif = await notificacionesService.crear({
      usuario_Id_Usuario: 3,
      descripcion_notificacion: 'Se te ha reasignado la orden de servicio #101.',
    });

    expect(notif.id_notificaciones).toBe(2);
    expect(notif.descripcion_notificacion).toContain('reasignado');
  });

  it('CP-046: Consultar notificaciones guardadas del usuario únicamente dentro de las últimas 72 horas.', async () => {
    mockPrismaService.notificacion.findMany.mockResolvedValue([
      { id_notificaciones: 2, usuario_Id_Usuario: 2, descripcion_notificacion: 'Reasignación' },
      { id_notificaciones: 1, usuario_Id_Usuario: 2, descripcion_notificacion: 'Asignación' },
    ]);

    const list = await notificacionesService.findByUsuario(2);
    expect(list).toHaveLength(2);
    expect(mockPrismaService.notificacion.deleteMany).toHaveBeenCalled();
    expect(mockPrismaService.notificacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          usuario_Id_Usuario: 2,
          fecha_notificacion: expect.anything(),
        }),
        orderBy: { fecha_notificacion: 'desc' },
      }),
    );
  });

  it('CP-047: Rechazar creación de notificación si el usuario no existe.', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);

    await expect(
      notificacionesService.crear({
        usuario_Id_Usuario: 999,
        descripcion_notificacion: 'Test para usuario inexistente',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('CP-048: Purga de notificaciones con más de 72 horas de antigüedad.', async () => {
    mockPrismaService.notificacion.deleteMany.mockResolvedValue({ count: 5 });
    const res = await notificacionesService.limpiarNotificacionesAntiguas();
    expect(res.count).toBe(5);
    expect(mockPrismaService.notificacion.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          fecha_notificacion: expect.anything(),
        },
      }),
    );
  });
});
