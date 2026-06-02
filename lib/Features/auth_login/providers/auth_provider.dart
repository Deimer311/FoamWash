import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/auth_login/data/repositories/auth_repository.dart';
import 'package:foamwash/Features/auth_login/data/models/user_model.dart';

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

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      await _repository.logout();
      _isAuthenticated = false;
      _userEmail = null;
      _user = null;
      notifyListeners();
    } catch (e) {
      print('Error al cerrar sesión: $e');
    }
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
    final token = await _repository.secureStorageService.read('token');
    final prefs = await SharedPreferences.getInstance();
    _isAuthenticated = token != null && token.isNotEmpty;
    _userEmail = prefs.getString('userEmail');
    _userRole = prefs.getString('userRole') ?? '';
    notifyListeners();
  }
}
