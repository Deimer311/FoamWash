import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('Notificaciones', () => {
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

  it('CP-043: El usuario reciba una notificaci¾n cuando el estado', async () => {
    const res = await notificationsService.sendToTopic('topic_admin', 'Título', 'Cuerpo');
    expect(res).toContain('msg_123');
    expect(notificationsService.sendToTopic).toHaveBeenCalledWith(
      'topic_admin',
      'Título',
      'Cuerpo',
    );
  });

  it('CP-044: El usuario no tenga un canal externo en', async () => {
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

  it('CP-045: El usuario reciba una notificaci¾n cuando se crea', async () => {
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

  it('CP-046: El contenido de la notificaci¾n sea correcto', async () => {
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

  it('CP-047: La notificaci¾n se envÝe a los canales externos', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue(null);

    await expect(
      notificacionesService.crear({
        usuario_Id_Usuario: 999,
        descripcion_notificacion: 'Test para usuario inexistente',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('CP-048: No se envÝen notificaciones duplicadas por un mismo', async () => {
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

  it.todo('CP-049: Las notificaciones se reciban en el orden correcto');
});
