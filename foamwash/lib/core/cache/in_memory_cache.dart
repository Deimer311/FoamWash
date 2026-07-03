import 'dart:collection';

class _CacheEntry<T> {
  final T value;
  final DateTime expiresAt;
  DateTime lastAccessed;

  _CacheEntry({
    required this.value,
    required this.expiresAt,
  }) : lastAccessed = DateTime.now();

  bool get isExpired => DateTime.now().isAfter(expiresAt);
}

/// Implementación genérica de Caché en Memoria (RAM) con política LRU y soporte de TTL.
class InMemoryCache {
  final int maxSize;
  final LinkedHashMap<String, _CacheEntry<dynamic>> _cache = LinkedHashMap();

  InMemoryCache({this.maxSize = 100});

  /// Retorna el valor si existe y no ha expirado. Si expiró, lo borra y retorna null.
  T? get<T>(String key) {
    if (!_cache.containsKey(key)) return null;

    final entry = _cache[key]!;
    
    if (entry.isExpired) {
      _cache.remove(key);
      return null;
    }

    // Actualizamos el acceso para la política LRU
    entry.lastAccessed = DateTime.now();
    _cache.remove(key);
    _cache[key] = entry; // Mueve al final (más reciente)

    return entry.value as T;
  }

  /// Guarda un valor en caché con un tiempo de expiración (TTL).
  void set<T>(String key, T value, Duration ttl) {
    if (_cache.length >= maxSize && !_cache.containsKey(key)) {
      _evictLRU();
    }

    final expiresAt = DateTime.now().add(ttl);
    _cache[key] = _CacheEntry<T>(value: value, expiresAt: expiresAt);
  }

  /// Borra una entrada específica.
  void remove(String key) {
    _cache.remove(key);
  }

  /// Borra todas las entradas que comiencen con el prefijo indicado.
  void invalidateByPrefix(String prefix) {
    _cache.removeWhere((key, _) => key.startsWith(prefix));
  }

  /// Vacía todo el caché de memoria.
  void clear() {
    _cache.clear();
  }

  /// Elimina todas las entradas que ya han expirado.
  void purgeExpired() {
    _cache.removeWhere((_, entry) => entry.isExpired);
  }

  /// Elimina la entrada menos usada recientemente (LRU).
  void _evictLRU() {
    // LinkedHashMap mantiene el orden de inserción.
    // El primer elemento es el más antiguo insertado/accedido.
    if (_cache.isNotEmpty) {
      final firstKey = _cache.keys.first;
      _cache.remove(firstKey);
    }
  }
}
