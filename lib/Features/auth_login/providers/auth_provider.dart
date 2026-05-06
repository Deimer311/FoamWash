import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _userEmail;

  bool get isAuthenticated => _isAuthenticated;
  String? get userEmail => _userEmail;
  bool get isAdmin => _userEmail == 'admin@gmail.com';

  // Lógica de inicio de sesión real debe integrarse aquí
  Future<void> login(String email, String password) async {
    // Aquí iría tu código de login HTTP...
    // Simulación:
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isLogged', true);
    await prefs.setString('userEmail', email);
    
    _isAuthenticated = true;
    _userEmail = email;
    notifyListeners();
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
      _isAuthenticated = false;
      _userEmail = null;
      notifyListeners();
    } catch (e) {
      print('Error al limpiar SharedPreferences: $e');
    }
  }

  // Verifica el estado inicial
  Future<void> checkAuthStatus() async {
    final prefs = await SharedPreferences.getInstance();
    _isAuthenticated = prefs.getBool('isLogged') ?? false;
    _userEmail = prefs.getString('userEmail');
    notifyListeners();
  }
}
