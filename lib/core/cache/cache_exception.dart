/// Excepción base para errores relacionados con el caché.
class CacheException implements Exception {
  final String message;
  const CacheException(this.message);

  @override
  String toString() => 'CacheException: $message';
}

/// Se lanza cuando se intenta obtener un dato de caché y no existe o ha expirado.
class CacheMissException extends CacheException {
  const CacheMissException([String message = 'Cache miss']) : super(message);
}

/// Se lanza cuando se intenta realizar una petición de red y no hay conexión.
class NetworkUnavailableException implements Exception {
  final String message;
  const NetworkUnavailableException([this.message = 'No network available']);

  @override
  String toString() => 'NetworkUnavailableException: $message';
}
