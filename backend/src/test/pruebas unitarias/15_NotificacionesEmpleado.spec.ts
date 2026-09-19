import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('15_NotificacionesEmpleado', () => {
  let notificacionesService: NotificacionesService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    notificacion: {
      create: jest.fn(),
      findMany: jest.fn(),
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
        { provide: NotificationsService, useValue: { sendToTopic: jest.fn(), sendToDevice: jest.fn() } },
      ],
    }).compile();

    notificacionesService = module.get<NotificacionesService>(NotificacionesService);
    prismaService = module.get(PrismaService);
  });

  it('CP-085: Notificación por asignación', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 2 });
    mockPrismaService.notificacion.create.mockResolvedValue({
      id_notificaciones: 1,
      descripcion_notificacion: 'Nuevo servicio asignado',
    });
    const result = await notificacionesService.crear({
      usuario_Id_Usuario: 2,
      descripcion_notificacion: 'Nuevo servicio asignado'
    });
    expect(result.descripcion_notificacion).toContain('asignado');
  });

  it('CP-086: Notificación por reasignación', async () => {
    mockPrismaService.usuario.findUnique.mockResolvedValue({ Id_Usuario: 2 });
    mockPrismaService.notificacion.create.mockResolvedValue({
      id_notificaciones: 2,
      descripcion_notificacion: 'Servicio reasignado',
    });
    const result = await notificacionesService.crear({
      usuario_Id_Usuario: 2,
      descripcion_notificacion: 'Servicio reasignado'
    });
    expect(result.descripcion_notificacion).toContain('reasignado');
  });
});
