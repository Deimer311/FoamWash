import 'dart:developer' as developer;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class FCMService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotificationsPlugin =
      FlutterLocalNotificationsPlugin();

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'high_importance_channel',
    'Notificaciones Importantes',
    description: 'Este canal se usa para notificaciones importantes del servicio.',
    importance: Importance.max,
  );

  /// Inicializa los servicios de Firebase Cloud Messaging y las notificaciones locales.
  static Future<void> initialize() async {
    // 1. Solicitar permisos de notificación
    await requestPermission();

    // 2. Configurar notificaciones locales para Android
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    // Configuración para iOS
    const DarwinInitializationSettings initializationSettingsDarwin =
        DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsDarwin,
    );

    await _localNotificationsPlugin.initialize(
      settings: initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        // Manejar el clic en la notificación local si la app está en primer plano
        developer.log('Clic en notificación local: ${response.payload}');
      },
    );

    // Crear el canal de alta importancia en Android
    final androidPlugin = _localNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();
    if (androidPlugin != null) {
      await androidPlugin.createNotificationChannel(_channel);
    }

    // 3. Obtener el Token de FCM
    await getToken();

    // 4. Configurar el escuchador en Primer Plano (Foreground)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      developer.log('Mensaje recibido en primer plano: ${message.messageId}');
      
      final RemoteNotification? notification = message.notification;
      final AndroidNotification? android = message.notification?.android;

      // Si la app está en primer plano, mostramos la notificación manualmente
      if (notification != null && android != null) {
        _localNotificationsPlugin.show(
          id: notification.hashCode,
          title: notification.title,
          body: notification.body,
          notificationDetails: NotificationDetails(
            android: AndroidNotificationDetails(
              _channel.id,
              _channel.name,
              channelDescription: _channel.description,
              icon: android.smallIcon ?? '@mipmap/ic_launcher',
              importance: Importance.max,
              priority: Priority.high,
            ),
          ),
          payload: message.data.toString(),
        );
      }
    });

    // 5. Configurar el escuchador cuando se abre la app desde una notificación (en segundo plano)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      developer.log('Se abrió la aplicación desde una notificación FCM: ${message.data}');
      // Aquí puedes agregar lógica para navegar a una pantalla específica, ej. reservas
    });
  }

  /// Solicita permisos de notificación al usuario.
  static Future<void> requestPermission() async {
    final NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    developer.log('Estado de la autorización de permisos: ${settings.authorizationStatus}');
  }

  /// Obtiene el Token del dispositivo actual y lo guarda en Secure Storage.
  static Future<String?> getToken() async {
    try {
      final String? token = await _messaging.getToken();
      developer.log('FCM Token del dispositivo: $token');
      
      if (token != null) {
        final secureStorage = SecureStorageService();
        await secureStorage.write('fcm_token', token);
      }
      return token;
    } catch (e) {
      developer.log('Error al obtener el token de FCM: $e');
      return null;
    }
  }

  /// Permite suscribirse a un tema específico.
  static Future<void> subscribeToTopic(String topic) async {
    try {
      await _messaging.subscribeToTopic(topic);
      developer.log('Suscrito exitosamente al tema: $topic');
    } catch (e) {
      developer.log('Error al suscribirse al tema $topic: $e');
    }
  }

  /// Permite desuscribirse de un tema.
  static Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _messaging.unsubscribeFromTopic(topic);
      developer.log('Desuscrito exitosamente del tema: $topic');
    } catch (e) {
      developer.log('Error al desuscribirse del tema $topic: $e');
    }
  }
}
