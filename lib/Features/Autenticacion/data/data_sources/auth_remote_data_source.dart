import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:foamwash/Api/api_constants.dart';

class AuthRemoteDataSource {
  final http.Client client;

  AuthRemoteDataSource({http.Client? client}) : client = client ?? http.Client();

  /// Realiza la petición de login al servidor.
  /// Retorna un Map con la respuesta decodificada si es exitosa.
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await client.post(
        Uri.parse(ApiConstants.loginEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'correo': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final decoded = json.decode(response.body);
        // Incluimos los headers para poder extraer cookies si es necesario en el repo
        return {
          'data': decoded,
          'headers': response.headers,
        };
      } else {
        throw Exception('Error de autenticación: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error de red: $e');
    }
  }

  /// Realiza la petición de registro al servidor.
  Future<Map<String, dynamic>> register({
    required String email,
    required String nombre,
    required String telefono,
    required String direccion,
    required String password,
  }) async {
    try {
      final response = await client.post(
        Uri.parse(ApiConstants.registerEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'correo': email,
          'nombre': nombre,
          'telefono': telefono,
          'direccion': direccion,
          'password': password,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Error al registrar usuario');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
