import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/Autenticacion/data/data_sources/auth_remote_data_source.dart';
import 'package:foamwash/Features/Autenticacion/data/models/user_model.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Api/api_constants.dart';

class AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final SecureStorageService secureStorageService;

  AuthRepository({
    required this.remoteDataSource,
    required this.secureStorageService,
  });

  /// Maneja el flujo de login: Petición -> Almacenamiento local -> Retorno de Modelo
  Future<UserModel> login(String email, String password) async {
    final result = await remoteDataSource.login(email, password);
    
    final data = result['data'];
    final headers = result['headers'];
    
    // La API devuelve 'access_token', no 'token'
    final String token = data['access_token'] ?? '';
    
    // El usuario viene dentro de 'data' (no 'user')
    final Map<String, dynamic> userData = data['data'] ?? {};

    // Guardar tokens y cookies confidenciales de forma segura
    await secureStorageService.write('token', token);
    
    final rawCookie = headers['set-cookie'];
    if (rawCookie != null) {
      await secureStorageService.write('cookie_token', rawCookie);
    }

    // Guardar información no confidencial de persistencia en SharedPreferences (Persistencia)
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('userEmail', email);
    await prefs.setString('userRole', userData['rol'] ?? '');
    await prefs.setInt('userId', userData['id'] ?? 0);
    await prefs.setString('userFoto', userData['foto_perfil'] ?? '');
    await prefs.setBool('isLogged', true);

    // Construimos el UserModel con los campos que devuelve la API
    final user = UserModel(
      idUsuario: userData['id'] ?? 0,
      nombre: userData['nombre'] ?? '',
      correo: userData['correo'] ?? email,
      rolId: null,
      fotoPerfil: userData['foto_perfil'],
    );

    // Enviar el token FCM al backend automáticamente tras el login
    await _sendFcmTokenToBackend(
      authToken: token,
      userId: user.idUsuario,
    );

    return user;
  }

  /// Envía el token FCM guardado en SecureStorage al backend para
  /// asociarlo con el usuario autenticado.
  Future<void> _sendFcmTokenToBackend({
    required String authToken,
    required int userId,
  }) async {
    try {
      final fcmToken = await secureStorageService.read('fcm_token');
      if (fcmToken == null || fcmToken.isEmpty) return;

      await http.post(
        Uri.parse(ApiConstants.saveFcmTokenEndpoint),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $authToken',
        },
        body: jsonEncode({
          'usuario_id': userId,
          'fcm_token': fcmToken,
        }),
      );
    } catch (e) {
      // No interrumpir el login si falla el envío del token FCM
      print('[FCM] Error al enviar token al backend: $e');
    }
  }

  Future<void> logout() async {
    // Limpiar almacenamiento cifrado
    await secureStorageService.clearAll();

    // Limpiar preferencias generales
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }

  /// Maneja el registro de un nuevo usuario
  Future<void> register({
    required String email,
    required String nombre,
    required String telefono,
    required String direccion,
    required String password,
  }) async {
    await remoteDataSource.register(
      email: email,
      nombre: nombre,
      telefono: telefono,
      direccion: direccion,
      password: password,
    );
  }
}
