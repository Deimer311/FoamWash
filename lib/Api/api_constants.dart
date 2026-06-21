class ApiConstants {
  // Obtenemos la URL del backend en tiempo de compilación para no dejarla hardcodeada.
  // Ejemplo: flutter run --dart-define=BACKEND_URL=https://api.foamwash.com/api
  static const String baseUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'http://192.168.1.40:5000/api',
  );





     










  // Endpoints de Autenticación
  static const String loginEndpoint = '$baseUrl/auth/login';
  static const String registerEndpoint = '$baseUrl/auth/register';

// Agrega aquí más endpoints a medida que tu proyecto crezca
  static const String getServicesEndpoint = '$baseUrl/servicios';
  static const String getReservasEndpoint = '$baseUrl/reservas';
  static const String getEmpleadosEndpoint = '$baseUrl/empleados';
  static const String getUsuariosEndpoint = '$baseUrl/usuarios';
  // Endpoint para guardar el token FCM del dispositivo en el backend
  static const String saveFcmTokenEndpoint = '$baseUrl/usuarios/fcm-token';
}