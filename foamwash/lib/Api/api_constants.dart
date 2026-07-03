class ApiConstants {
  // Obtenemos la URL del backend en tiempo de compilación para no dejarla hardcodeada.
  // Ejemplo: flutter run --dart-define=BACKEND_URL=https://api.foamwash.com/api
  static const String baseUrl = String.fromEnvironment(
    'BACKEND_URL',
    defaultValue: 'http://192.168.40.41:5000/api',
    // defaultValue: 'https://unturned-deskbound-magnitude.ngrok-free.dev/api',
  );
  // Endpoints de Autenticación
  static const String loginEndpoint = '$baseUrl/auth/login';
  static const String registerEndpoint = '$baseUrl/auth/register';

  // ── NUEVO — Recuperación de contraseña ──────────────────────────────────
  static const String forgotPasswordEndpoint = '$baseUrl/auth/request-password-reset';
  static const String verifyResetCodeEndpoint = '$baseUrl/auth/verify-reset-code';
  static const String resetPasswordEndpoint = '$baseUrl/auth/reset-password';

// Agrega aquí más endpoints a medida que tu proyecto crezca
  static const String getServicesEndpoint = '$baseUrl/servicios';
  static const String getReservasEndpoint = '$baseUrl/reservas';
  static const String getEmpleadosEndpoint = '$baseUrl/empleados';
  static const String getUsuariosEndpoint = '$baseUrl/usuarios';
  // Endpoint para guardar el token FCM del dispositivo en el backend
  static const String saveFcmTokenEndpoint = '$baseUrl/usuarios/fcm-token';
}