import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/Features/Services/data/models/voucher_model.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class SchedulingController {
  // Configuración de la URL de tu backend
  // Tomamos la URL base desde tu archivo centralizado de constantes
  final String apiUrl = ApiConstants.baseUrl; 

  Future<void> requestService(String serviceId) async {
    try {
      // print("Preparando solicitud para el servicio: $serviceId");
      
      // Ejemplo de cómo se vería la petición real:
      /*
      final response = await http.post(
        Uri.parse('$apiUrl/solicitudes'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'serviceId': serviceId,
          // 'userId': 'ID_DEL_USUARIO_ACTUAL',
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        print("Solicitud exitosa al backend");
      } else {
        print("Error en la solicitud: ${response.statusCode} - ${response.body}");
        throw Exception("Error al agendar el servicio");
      }
      */
      
      // Simulamos la espera de red para efectos de UI
      await Future.delayed(const Duration(seconds: 1));
      // print("Simulación: Solicitud exitosa.");
    } catch (e) {
      // print("Error en SchedulingController.requestService: $e");
      rethrow;
    }
  }

  Future<VoucherModel> requestMultipleServices({
    required List<String> serviceIds,
    required List<String> serviceNames,
    required double total,
    required String direccion,
    required String tamanoMuebles,
    required String fecha,
    required String hora,
  }) async {
    try {
      final prefs = await SharedPreferences.getInstance(); // for user_vouchers later
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final cookie = await secureStorage.read('cookie_token');
      
      final Map<String, String> headers = {
        'Content-Type': 'application/json',
      };
      
      if (token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
      if (cookie != null && cookie.isNotEmpty) {
        headers['Cookie'] = cookie;
      }
      
      // Realizamos la petición HTTP POST
      final response = await http.post(
        Uri.parse('$apiUrl/reservas'),
        headers: headers,
        body: jsonEncode({
          'servicios': serviceIds.map((id) => {'Id_Servicio': int.parse(id)}).toList(),
          'Informacion_adicional': 'Dirección: $direccion. Tamaño muebles: $tamanoMuebles',
          'fecha': fecha,
          'Hora': hora,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Generar ID único para el voucher
        final voucherId = 'FW-${DateTime.now().millisecondsSinceEpoch}';
        
        final voucher = VoucherModel(
          id: voucherId,
          serviceNames: serviceNames,
          total: total,
          date: fecha,
          time: hora,
          address: direccion,
        );

        // Guardar localmente
        final vouchersListStr = prefs.getStringList('user_vouchers') ?? [];
        vouchersListStr.add(jsonEncode(voucher.toJson()));
        await prefs.setStringList('user_vouchers', vouchersListStr);

        return voucher;
      } else {
        throw Exception("Error al agendar los servicios: ${response.body}");
      }
    } catch (e) {
      rethrow;
    }
  }
}
