import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:mocktail/mocktail.dart';

// 1. Crear un Mock usando mocktail para simular FlutterSecureStorage
class MockFlutterSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  late SecureStorageService secureStorageService;
  late MockFlutterSecureStorage mockStorage;

  setUp(() {
    // 2. Inicializar el mock antes de cada prueba
    mockStorage = MockFlutterSecureStorage();
    
    // 3. Inyectar el mock en el constructor de nuestro servicio
    secureStorageService = SecureStorageService(storage: mockStorage);
  });

  group('SecureStorageService Tests', () {
    const key = 'test_key';
    const value = 'test_value';

    test('write debe llamar a _storage.write()', () async {
      // Arrange: Preparar la respuesta simulada
      when(() => mockStorage.write(key: key, value: value))
          .thenAnswer((_) async => {}); // Retorna un Future vacío ya que es un método void

      // Act: Ejecutar el método del servicio
      await secureStorageService.write(key, value);

      // Assert: Verificar que _storage.write se llamó exactamente 1 vez con los argumentos correctos
      verify(() => mockStorage.write(key: key, value: value)).called(1);
    });

    test('read debe retornar el valor esperado cuando existe', () async {
      // Arrange
      when(() => mockStorage.read(key: key)).thenAnswer((_) async => value);

      // Act
      final result = await secureStorageService.read(key);

      // Assert
      expect(result, value);
      verify(() => mockStorage.read(key: key)).called(1);
    });

    test('read debe retornar null cuando atrapa una excepción', () async {
      // Arrange
      when(() => mockStorage.read(key: key))
          .thenThrow(Exception('Simulando un error al leer'));

      // Act
      final result = await secureStorageService.read(key);

      // Assert
      expect(result, isNull); // El servicio atrapa el error y retorna null
      verify(() => mockStorage.read(key: key)).called(1);
    });

    test('delete debe llamar a _storage.delete()', () async {
      // Arrange
      when(() => mockStorage.delete(key: key)).thenAnswer((_) async => {});

      // Act
      await secureStorageService.delete(key);

      // Assert
      verify(() => mockStorage.delete(key: key)).called(1);
    });

    test('clearAll debe llamar a _storage.deleteAll()', () async {
      // Arrange
      when(() => mockStorage.deleteAll()).thenAnswer((_) async => {});

      // Act
      await secureStorageService.clearAll();

      // Assert
      verify(() => mockStorage.deleteAll()).called(1);
    });
  });
}
