import 'package:equatable/equatable.dart';

/// Clase base para todos los errores/fallos de la aplicación.
/// Extiende de Equatable para poder comparar si dos errores son iguales.
abstract class Failure extends Equatable {
  final String message;

  const Failure([this.message = '']);

  @override
  List<Object> get props => [message];
}

/// Representa un error que ocurre al comunicarse con el backend (API).
/// errores 404 o 500.
class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Error del servidor']);
}

/// Representa un error cuando no hay conexión a internet en el dispositivo móvil.
/// Se dispara de forma preventiva antes de hacer una petición si no hay red.
class ConnectionFailure extends Failure {
  const ConnectionFailure([super.message = 'Sin conexión a internet']);
}

/// Representa un error al intentar leer o guardar datos locales del dispositivo.
/// Ejemplos: Error leyendo el Token de SharedPreferences, o problemas con SQLite.
class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Error de caché']);
}
