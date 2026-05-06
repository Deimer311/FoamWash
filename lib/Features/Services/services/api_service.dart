import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/Comun/service_model.dart';
import 'package:foamwash/Api/api_constants.dart';

class ApiService {
  // Realiza una peticion HTTP GET al endpoint de servicios del Backend.
  // Mapea la respuesta JSON anidada bajo la clave 'data' hacia objetos ServiceModel.
  Future<List<ServiceModel>> fetchServices() async {
    try {
      final response = await http.get(Uri.parse(ApiConstants.getServicesEndpoint));
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> decodedBody = json.decode(response.body);
        if (decodedBody['success'] == true && decodedBody['data'] != null) {
          final List<dynamic> data = decodedBody['data'];
          return data.map((item) => ServiceModel.fromJson(item)).toList();
        } else {
          throw Exception('Formato inesperado del servidor');
        }
      } else {
        throw Exception('Error al cargar servicios desde el servidor: ${response.statusCode}');
      }
    } catch (e) {
      print('Excepción en fetchServices: $e');
      throw Exception('Error de red: $e');
    }
  }

  // Purga el estado de sesion del usuario en el dispositivo.
  // Elimina cualquier token de autenticacion persistido para forzar un re-login.
  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();
    } catch (e) {
      print('Error al limpiar SharedPreferences: $e');
    }
  }
}
