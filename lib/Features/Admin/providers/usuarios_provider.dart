import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Api/api_constants.dart';

class UsuariosProvider extends ChangeNotifier {
  List<dynamic> _usuarios = [];
  bool _isLoading = false;
  String? _error;

  List<dynamic> get usuarios => _usuarios;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchUsuarios() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      final cookieToken = prefs.getString('cookie_token');

      Map<String, String> headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      final response = await http.get(
        Uri.parse(ApiConstants.getUsuariosEndpoint),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final decodedData = json.decode(response.body);
        _usuarios = decodedData['data'] ?? [];
      } else {
        _error = 'Error al cargar usuarios: ${response.statusCode}';
      }
    } catch (e) {
      _error = 'Error de conexión: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> deleteUsuario(int id) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      final cookieToken = prefs.getString('cookie_token');

      Map<String, String> headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      if (cookieToken != null) headers['Cookie'] = cookieToken;

      final response = await http.delete(
        Uri.parse('${ApiConstants.getUsuariosEndpoint}/$id'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        await fetchUsuarios(); // Recargar la lista
      }
    } catch (e) {
      print('Error al eliminar usuario: $e');
    }
  }

  Future<bool> crearUsuario({
    required String nombre,
    required String correo,
    required String password,
    String? telefono,
    String? direccion,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse(ApiConstants.registerEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'nombre': nombre,
          'correo': correo,
          'password': password,
          'telefono': telefono,
          'direccion': direccion,
        }),
      );

      if (response.statusCode == 201 || response.statusCode == 200) {
        await fetchUsuarios();
        return true;
      } else {
        final data = json.decode(response.body);
        if (data['message'] is List) {
          _error = (data['message'] as List).join(', ');
        } else {
          _error = data['message'] ?? 'Error al crear usuario';
        }
        return false;
      }
    } catch (e) {
      _error = 'Error de conexión: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
