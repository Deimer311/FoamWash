import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/Autenticacion/data/repositories/auth_repository.dart';
import 'package:foamwash/Features/Autenticacion/data/models/user_model.dart';
import 'package:foamwash/core/services/fcm_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _repository;
  
  bool _isAuthenticated = false;
  String? _userEmail;
  String _userRole = '';
  UserModel? _user;

  AuthProvider({required AuthRepository repository}) : _repository = repository;

  bool get isAuthenticated => _isAuthenticated;
  String? get userEmail => _userEmail;
  String get userRole => _userRole;
  UserModel? get user => _user;
  bool get isAdmin => _userEmail == 'admin@gmail.com' || _userRole == 'admin';

  /// Lógica de inicio de sesión utilizando el Repositorio
  Future<void> login(String email, String password) async {
    try {
      final userModel = await _repository.login(email, password);
      
      _user = userModel;
      _isAuthenticated = true;
      _userEmail = email;

      // Leer el rol guardado por el repositorio
      final prefs = await SharedPreferences.getInstance();
      _userRole = prefs.getString('userRole') ?? '';

      // Suscribirse a temas FCM según rol y userId
      await FCMService.subscribeToRoleTopics(_userRole, userModel.idUsuario);

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      // Desuscribirse de temas FCM antes de limpiar almacenamiento
      final prefs = await SharedPreferences.getInstance();
      final role = prefs.getString('userRole') ?? '';
      final userId = prefs.getInt('userId') ?? 0;
      try {
        await FCMService.unsubscribeFromRoleTopics(role, userId);
      } catch (e) {
        print('FCM unsubscribe failed during logout: $e');
      }
    } catch (e) {
      print('Error reading prefs during logout: $e');
    }

    try {
      await _repository.logout();
    } catch (e) {
      print('Repository logout failed: $e');
    }

    _isAuthenticated = false;
    _userEmail = null;
    _user = null;
    _userRole = '';
    notifyListeners();
  }

  /// Registro de un nuevo usuario
  Future<void> register({
    required String email,
    required String nombre,
    required String telefono,
    required String direccion,
    required String password,
  }) async {
    try {
      await _repository.register(
        email: email,
        nombre: nombre,
        telefono: telefono,
        direccion: direccion,
        password: password,
      );
    } catch (e) {
      rethrow;
    }
  }

  // Verifica el estado inicial basándose en la existencia de un token seguro
  Future<void> checkAuthStatus() async {
    try {
      final token = await _repository.secureStorageService.read('token');
      final prefs = await SharedPreferences.getInstance();
      _isAuthenticated = token != null && token.isNotEmpty;
      _userEmail = prefs.getString('userEmail');
      _userRole = prefs.getString('userRole') ?? '';
      final userId = prefs.getInt('userId') ?? 0;
      final userFoto = prefs.getString('userFoto');

      if (_isAuthenticated) {
        _user = UserModel(
          idUsuario: userId,
          nombre: '',
          correo: _userEmail ?? '',
          rolId: null,
          fotoPerfil: (userFoto != null && userFoto.isNotEmpty) ? userFoto : null,
        );
        // Auto-suscripción en reinicios si la sesión sigue activa
        try {
          await FCMService.subscribeToRoleTopics(_userRole, userId);
        } catch (e) {
          print('FCM subscribe failed: $e');
        }
      }
    } catch (e) {
      print('Error checking auth status: $e');
      _isAuthenticated = false;
    }

    notifyListeners();
  }

  /// Actualiza la foto de perfil en el estado actual y memoria caché
  Future<void> updateUserFoto(String newFotoUrl) async {
    if (_user != null) {
      _user = UserModel(
        idUsuario: _user!.idUsuario,
        nombre: _user!.nombre,
        correo: _user!.correo,
        telefono: _user!.telefono,
        nDocumento: _user!.nDocumento,
        direccion: _user!.direccion,
        rolId: _user!.rolId,
        fotoPerfil: newFotoUrl,
      );
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('userFoto', newFotoUrl);
      notifyListeners();
    }
  }
}
