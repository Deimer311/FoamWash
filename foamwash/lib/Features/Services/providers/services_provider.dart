import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Services/data/models/service_model.dart';
import 'package:foamwash/Features/Services/services/api_service.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class ServicesProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<ServiceModel> _services = [];
  bool _isLoading = false;
  String? _error;

  List<ServiceModel> get services => _services;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchServices() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _services = await _apiService.fetchServices();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<int?> createService({
    required String nombre,
    required String precio,
    required String descripcion,
    String? imagenUrl,
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
      if (cookieToken != null) headers['Cookie'] = cookieToken;

      final response = await http.post(
        Uri.parse(ApiConstants.getServicesEndpoint),
        headers: headers,
        body: json.encode({
          'Nombre_Servicio': nombre,
          'Precio': precio,
          'descripcion': descripcion,
          'imagen_url': imagenUrl ?? '',
          'estado': 'activo',
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final id = data['data']['Id_Servicio'];
        await fetchServices();
        return id;
      } else {
        final data = json.decode(response.body);
        _error = data['message'] ?? 'Error al crear servicio';
        return null;
      }
    } catch (e) {
      _error = 'Error de conexión: $e';
      return null;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> uploadServiceImage(int id, String filePath) async {
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final request = http.MultipartRequest(
        'POST',
        Uri.parse('${ApiConstants.getServicesEndpoint}/$id/imagen'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.files.add(await http.MultipartFile.fromPath('imagen', filePath));
      
      final streamedResponse = await request.send();
      if (streamedResponse.statusCode == 200 || streamedResponse.statusCode == 201) {
        await fetchServices();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateService(
    int id, {
    required String nombre,
    required String precio,
    required String descripcion,
    String? imagenUrl,
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
      if (cookieToken != null) headers['Cookie'] = cookieToken;

      final response = await http.put(
        Uri.parse('${ApiConstants.getServicesEndpoint}/$id'),
        headers: headers,
        body: json.encode({
          'Nombre_Servicio': nombre,
          'Precio': precio,
          'descripcion': descripcion,
          'imagen_url': imagenUrl ?? '',
          'estado': 'activo',
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchServices();
        return true;
      } else {
        final data = json.decode(response.body);
        _error = data['message'] ?? 'Error al actualizar servicio';
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

  Future<bool> deleteService(int id) async {
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
      if (cookieToken != null) headers['Cookie'] = cookieToken;

      final response = await http.delete(
        Uri.parse('${ApiConstants.getServicesEndpoint}/$id'),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        await fetchServices();
        return true;
      } else {
        final data = json.decode(response.body);
        _error = data['message'] ?? 'Error al eliminar servicio';
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
