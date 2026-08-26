import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import * as path from 'node:path';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  onModuleInit() {
    try {
      if (getApps().length === 0) {
        const keyPath = path.resolve(process.cwd(), 'firebase-key.json');
        initializeApp({
          credential: cert(keyPath),
        });
        this.logger.log('Firebase Admin inicializado correctamente.');
      }
    } catch (error) {
      this.logger.error('Error al inicializar Firebase Admin', error);
    }
  }

  /**
   * Enviar notificación a un dispositivo específico usando su token de FCM
   */
  async sendToDevice(token: string, title: string, body: string, data?: any) {
    try {
      const message = {
        notification: { title, body },
        data: data || {},
        token: token,
      };
      const response = await getMessaging().send(message);
      this.logger.log(`Notificación enviada a dispositivo: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error enviando notificación a dispositivo:`, error);
      throw error;
    }
  }

  /**
   * Enviar notificación a un tema específico (ej: topic_admin, user_15)
   */
  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    try {
      const message = {
        notification: { title, body },
        data: data || {},
        topic: topic,
      };
      const response = await getMessaging().send(message);
      this.logger.log(`Notificación enviada al tema ${topic}: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error enviando notificación al tema ${topic}:`, error);
      throw error;
    }
  }
}
