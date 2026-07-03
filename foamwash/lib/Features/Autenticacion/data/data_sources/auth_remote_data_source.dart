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
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
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
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
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

  // ===========================================================================
  // RECUPERACIÓN DE CONTRASEÑA (NUEVO)
  // Mismo patrón que login/register: POST JSON, 200/201 = éxito, decodifica
  // 'message' del body en caso de error para mostrarlo al usuario.
  // ===========================================================================

  /// PASO 1: Solicita el envío de un código de recuperación al correo dado.
  Future<Map<String, dynamic>> requestPasswordReset(String email) async {
    try {
      final response = await client.post(
        Uri.parse(ApiConstants.forgotPasswordEndpoint),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({'correo': email}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Error al enviar el código');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  /// PASO 2: Verifica el código de 6 dígitos enviado al correo.
  /// NOTA: el backend (VerifyResetCodeDto) solo espera el campo `token`
  /// (el código de 6 dígitos se valida como token, sin correo asociado).
  Future<Map<String, dynamic>> verifyResetCode(String email, String code) async {
    try {
      final response = await client.post(
        Uri.parse(ApiConstants.verifyResetCodeEndpoint),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({'token': code}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Código inválido o expirado');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }

  /// PASO 3: Cambia la contraseña usando el código (token) ya verificado.
  /// NOTA: el backend (ResetPasswordDto) espera `token` y `newPassword`,
  /// sin campo de correo.
  Future<Map<String, dynamic>> resetPassword(
    String email,
    String code,
    String newPassword,
  ) async {
    try {
      final response = await client.post(
        Uri.parse(ApiConstants.resetPasswordEndpoint),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({
          'token': code,
          'newPassword': newPassword,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final errorData = json.decode(response.body);
        throw Exception(errorData['message'] ?? 'Error al cambiar la contraseña');
      }
    } catch (e) {
      throw Exception('Error de conexión: $e');
    }
  }
}
