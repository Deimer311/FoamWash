import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';

/// Implementación de Caché en Disco usando Hive.
class HiveCache {
  static const String _boxName = 'app_cache_box';
  Box? _box;

  /// Inicializa Hive y abre la caja principal. Debe llamarse en el main().
  Future<void> init() async {
    await Hive.initFlutter();
    _box = await Hive.openBox(_boxName);
  }

  /// Retorna los datos cacheados si existen y no han expirado.
  Map<String, dynamic>? get(String key) {
    _ensureInitialized();
    final dataString = _box!.get(key) as String?;
    if (dataString == null) return null;

    try {
      final decoded = jsonDecode(dataString) as Map<String, dynamic>;
      final expiresAtStr = decoded['expiresAt'] as String?;
      if (expiresAtStr != null) {
        final expiresAt = DateTime.parse(expiresAtStr);
        if (DateTime.now().isAfter(expiresAt)) {
          delete(key);
          return null;
        }
      }
      return decoded['data'] as Map<String, dynamic>?;
    } catch (e) {
      // Error al parsear, asumimos datos corruptos
      delete(key);
      return null;
    }
  }

  /// Guarda datos en el disco con un tiempo de expiración (TTL).
  Future<void> set(String key, Map<String, dynamic> data, Duration ttl) async {
    _ensureInitialized();
    final expiresAt = DateTime.now().add(ttl);
    final wrapper = {
      'data': data,
      'expiresAt': expiresAt.toIso8601String(),
    };
    await _box!.put(key, jsonEncode(wrapper));
  }

  /// Elimina una entrada específica.
  Future<void> delete(String key) async {
    _ensureInitialized();
    await _box!.delete(key);
  }

  /// Elimina todas las entradas que comiencen con el prefijo indicado.
  Future<void> invalidateByPrefix(String prefix) async {
    _ensureInitialized();
    final keysToDelete = _box!.keys.where((k) => k.toString().startsWith(prefix)).toList();
    await _box!.deleteAll(keysToDelete);
  }

  /// Borra todo el caché en disco.
  Future<void> clearAll() async {
    _ensureInitialized();
    await _box!.clear();
  }

  /// Recorre y elimina todas las entradas expiradas.
  Future<void> purgeExpired() async {
    _ensureInitialized();
    final keysToDelete = <dynamic>[];
    
    for (var key in _box!.keys) {
      final dataString = _box!.get(key) as String?;
      if (dataString != null) {
        try {
          final decoded = jsonDecode(dataString);
          final expiresAtStr = decoded['expiresAt'] as String?;
          if (expiresAtStr != null) {
            final expiresAt = DateTime.parse(expiresAtStr);
            if (DateTime.now().isAfter(expiresAt)) {
              keysToDelete.add(key);
            }
          }
        } catch (_) {
          keysToDelete.add(key);
        }
      }
    }
    
    if (keysToDelete.isNotEmpty) {
      await _box!.deleteAll(keysToDelete);
    }
  }

  void _ensureInitialized() {
    if (_box == null || !_box!.isOpen) {
      throw StateError('HiveCache no ha sido inicializado. Llama a init() primero.');
    }
  }
}
