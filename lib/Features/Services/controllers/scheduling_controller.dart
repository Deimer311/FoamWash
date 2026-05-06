import 'package:foamwash/Api/api_constants.dart';

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
}
