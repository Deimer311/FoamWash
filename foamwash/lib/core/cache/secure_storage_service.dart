import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage(
          aOptions: AndroidOptions(
            encryptedSharedPreferences: true,
          ),
        );

  /// Escribe un valor de forma segura en el almacenamiento cifrado
  Future<void> write(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
    } catch (e) {
      print('Error al escribir en SecureStorage: $e');
      rethrow;
    }
  }

  /// Lee un valor de forma segura del almacenamiento cifrado
  Future<String?> read(String key) async {
    try {
      return await _storage.read(key: key);
    } catch (e) {
      print('Error al leer de SecureStorage: $e');
      return null;
    }
  }

  /// Borra un valor específico del almacenamiento cifrado
  Future<void> delete(String key) async {
    try {
      await _storage.delete(key: key);
    } catch (e) {
      print('Error al borrar de SecureStorage: $e');
      rethrow;
    }
  }

  /// Elimina todos los registros seguros guardados
  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
    } catch (e) {
      print('Error al limpiar todo SecureStorage: $e');
      rethrow;
    }
  }
}
