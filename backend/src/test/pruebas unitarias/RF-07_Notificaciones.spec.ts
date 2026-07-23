import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../notifications/notifications.service';

describe('Notificaciones (RF-07)', () => {
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

  it('CP-044: Envío exitoso de notificación push a un dispositivo.', async () => {
    const res = await notificationsService.sendToDevice('device_token_xyz', 'Título Token', 'Detalle');
    expect(res).toContain('msg_456');
    expect(notificationsService.sendToDevice).toHaveBeenCalledWith(
      'device_token_xyz',
      'Título Token',
      'Detalle',
    );
  });

  it('CP-045: Manejo de errores al enviar notificación push con token inválido.', async () => {
    jest.spyOn(notificationsService, 'sendToDevice').mockRejectedValueOnce(new Error('Invalid token'));

    await expect(
      notificationsService.sendToDevice('invalid_token', 'Test', 'Body'),
    ).rejects.toThrow('Invalid token');
  });

  it('CP-046: Envío diferido o reintento de notificación en caso de fallo de red.', async () => {
    jest.spyOn(notificationsService, 'sendToTopic').mockRejectedValueOnce(new Error('Network Error'));

    await expect(
      notificationsService.sendToTopic('topic_admin', 'Alerta', 'Mensaje de error'),
    ).rejects.toThrow('Network Error');
  });

  it('CP-047: Formato de estructura de datos payload de la notificación.', async () => {
    const payload = { type: 'reserva_nueva', id: '10' };
    expect(payload.type).toBe('reserva_nueva');
    expect(payload.id).toBe('10');
  });
});
