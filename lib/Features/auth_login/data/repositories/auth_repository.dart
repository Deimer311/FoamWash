import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/auth_login/data/data_sources/auth_remote_data_source.dart';
import 'package:foamwash/Features/auth_login/data/models/user_model.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

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
    await prefs.setBool('isLogged', true);

    // Construimos el UserModel con los campos que devuelve la API
    return UserModel(
      idUsuario: userData['id'] ?? 0,
      nombre: userData['nombre'] ?? '',
      correo: userData['correo'] ?? email,
      rolId: null,
      fotoPerfil: userData['foto_perfil'],
    );
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
