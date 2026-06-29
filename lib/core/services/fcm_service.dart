import 'dart:convert';
import 'dart:developer' as developer;
import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
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

  static GlobalKey<NavigatorState>? navigatorKey;

  /// Inicializa los servicios de Firebase Cloud Messaging y las notificaciones locales.
  static Future<void> initialize(GlobalKey<NavigatorState> navKey) async {
    navigatorKey = navKey;

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
        if (response.payload != null && response.payload!.isNotEmpty) {
          try {
            final Map<String, dynamic> data = jsonDecode(response.payload!);
            _handleNotificationRoute(data);
          } catch (e) {
            developer.log('Error al decodificar payload de notificación local: $e');
          }
        }
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
          payload: jsonEncode(message.data),
        );
      }
    });

    // 5. Configurar el escuchador cuando se abre la app desde una notificación (en segundo plano)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      developer.log('Se abrió la aplicación desde una notificación FCM: ${message.data}');
      _handleNotificationRoute(message.data);
    });

    // 6. Configurar la notificación inicial si la app se abrió desde un estado terminado
    FirebaseMessaging.instance.getInitialMessage().then((RemoteMessage? message) {
      if (message != null) {
        developer.log('La app se abrió desde un estado terminado vía FCM: ${message.data}');
        Future.delayed(const Duration(milliseconds: 500), () {
          _handleNotificationRoute(message.data);
        });
      }
    });
  }

  /// Maneja la redirección de pantallas basada en el payload de la notificación.
  static void _handleNotificationRoute(Map<String, dynamic> data) {
    if (navigatorKey == null) {
      developer.log('navigatorKey es nulo. No se puede realizar la redirección.');
      return;
    }

    final type = data['type'];
    developer.log('Procesando navegación para notificación de tipo: $type');

    switch (type) {
      case 'reporte_semanal':
        navigatorKey!.currentState?.pushNamed('/admin_reportes');
        break;
      case 'nueva_reserva':
      case 'reserva_cancelada':
        _redirectBasedOnRole('/admin_agenda', '/scheduling');
        break;
      case 'nuevo_servicio':
        navigatorKey!.currentState?.pushNamed('/scheduling');
        break;
      default:
        // Por defecto redirigir al Home o dejar en la vista actual si no se reconoce
        navigatorKey!.currentState?.pushNamed('/home');
        break;
    }
  }

  /// Redirige al usuario a una pantalla u otra dependiendo de su rol almacenado.
  static Future<void> _redirectBasedOnRole(String adminRoute, String defaultRoute) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final role = prefs.getString('userRole') ?? '';
      if (role.toLowerCase().trim() == 'admin') {
        navigatorKey!.currentState?.pushNamed(adminRoute);
      } else {
        navigatorKey!.currentState?.pushNamed(defaultRoute);
      }
    } catch (e) {
      developer.log('Error al obtener rol para redirección: $e');
      navigatorKey!.currentState?.pushNamed(defaultRoute);
    }
  }

  /// Se suscribe a los temas correspondientes del rol e ID del usuario al iniciar sesión o abrir la app.
  static Future<void> subscribeToRoleTopics(String role, int userId) async {
    try {
      // Suscribirse a temas generales basados en el rol
      if (role.isNotEmpty) {
        final cleanRole = role.toLowerCase().trim();
        await _messaging.subscribeToTopic('topic_$cleanRole');
        developer.log('Suscrito exitosamente al tema: topic_$cleanRole');
      }

      // Suscribirse a tema privado del usuario
      if (userId > 0) {
        await _messaging.subscribeToTopic('user_$userId');
        developer.log('Suscrito exitosamente al tema privado: user_$userId');
      }
    } catch (e) {
      developer.log('Error al suscribirse a temas por rol: $e');
    }
  }

  /// Se desuscribe de los temas del rol e ID del usuario al cerrar sesión.
  static Future<void> unsubscribeFromRoleTopics(String role, int userId) async {
    try {
      if (role.isNotEmpty) {
        final cleanRole = role.toLowerCase().trim();
        await _messaging.unsubscribeFromTopic('topic_$cleanRole');
        developer.log('Desuscrito exitosamente del tema: topic_$cleanRole');
      }

      if (userId > 0) {
        await _messaging.unsubscribeFromTopic('user_$userId');
        developer.log('Desuscrito exitosamente del tema privado: user_$userId');
      }
    } catch (e) {
      developer.log('Error al desuscribirse de temas por rol: $e');
    }
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
