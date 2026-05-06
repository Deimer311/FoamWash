import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/auth_login/data/data_sources/auth_remote_data_source.dart';
import 'package:foamwash/Features/auth_login/data/models/user_model.dart';

class AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepository({required this.remoteDataSource});

  /// Maneja el flujo de login: Petición -> Almacenamiento local -> Retorno de Modelo
  Future<UserModel> login(String email, String password) async {
    final result = await remoteDataSource.login(email, password);
    
    final data = result['data'];
    final headers = result['headers'];
    
    // La API devuelve 'access_token', no 'token'
    final String token = data['access_token'] ?? '';
    
    // El usuario viene dentro de 'data' (no 'user')
    final Map<String, dynamic> userData = data['data'] ?? {};

    // Guardar información en SharedPreferences (Persistencia)
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    await prefs.setString('userEmail', email);
    await prefs.setString('userRole', userData['rol'] ?? '');
    await prefs.setBool('isLogged', true);

    // Guardar cookie si existe (importante en tu backend para evitar 401)
    final rawCookie = headers['set-cookie'];
    if (rawCookie != null) {
      await prefs.setString('cookie_token', rawCookie);
    }

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
