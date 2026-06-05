import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Api/api_constants.dart';
import '../models/empleado_model.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class EmpleadosProvider with ChangeNotifier {
  List<EmpleadoModel> _empleados = [];
  bool _isLoading = false;
  String? _error;

  List<EmpleadoModel> get empleados => _empleados;
  bool get isLoading => _isLoading;
  String? get error => _error;

  int get empleadosActivosCount =>
      _empleados.where((e) => e.estado == 'activo' || e.estado == null).length;

  Future<void> fetchEmpleados() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final cookieToken = await secureStorage.read('cookie_token');

      Map<String, String> headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      final response = await http.get(
        Uri.parse(ApiConstants.getEmpleadosEndpoint),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> decoded = json.decode(response.body);
        if (decoded['success'] == true) {
          final List<dynamic> data = decoded['data'];
          _empleados = data.map((item) => EmpleadoModel.fromJson(item)).toList();
        } else {
          _error = 'Error al cargar empleados';
        }
      } else {
        _error = 'Error de servidor: ${response.statusCode}';
      }
    } catch (e) {
      _error = 'Error de conexión: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> crearEmpleado({
    required String nombre,
    required String correo,
    required String telefono,
    required String password,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final cookieToken = await secureStorage.read('cookie_token');

      Map<String, String> headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      final response = await http.post(
        Uri.parse(ApiConstants.registerEndpoint),
        headers: headers,
        body: json.encode({
          'nombre': nombre,
          'correo': correo,
          'telefono': telefono,
          'password': password,
          'role': 'empleado',
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final decoded = json.decode(response.body);
        if (decoded['success'] == true) {
          await fetchEmpleados(); // Recargar la lista
          return true;
        } else {
          _error = decoded['message'] ?? 'Error al registrar empleado';
          return false;
        }
      } else {
        final decoded = json.decode(response.body);
        _error = decoded['message'] ?? 'Error: ${response.statusCode}';
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
