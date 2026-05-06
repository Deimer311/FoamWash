class ApiConstants {
  // NOTA: Usa '10.0.2.2' en lugar de la IP si pruebas en emulador Android
  // Si pruebas en un dispositivo físico, usa la IP de tu computadora (ej: '192.168.80.28')
  static const String baseUrl = 'http://192.168.137.81:5000/api';

  // Endpoints de Autenticación
  static const String loginEndpoint = '$baseUrl/auth/login';
  static const String registerEndpoint = '$baseUrl/auth/register';

// Agrega aquí más endpoints a medida que tu proyecto crezca
  static const String getServicesEndpoint = '$baseUrl/servicios';
  static const String getReservasEndpoint = '$baseUrl/reservas';
  static const String getEmpleadosEndpoint = '$baseUrl/empleados';
}