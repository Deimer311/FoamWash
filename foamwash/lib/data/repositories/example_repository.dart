import '../../core/cache/cache_service.dart';

/// Modelo de ejemplo
class ExampleUser {
  final int id;
  final String name;

  ExampleUser({required this.id, required this.name});

  factory ExampleUser.fromJson(Map<String, dynamic> json) {
    return ExampleUser(id: json['id'], name: json['name']);
  }

  Map<String, dynamic> toJson() {
    return {'id': id, 'name': name};
  }
}

/// Repositorio de ejemplo demostrando el uso del CacheService.
class ExampleRepository {
  final CacheService cacheService;

  ExampleRepository({required this.cacheService});

  /// Obtiene la lista de usuarios. Usa la estrategia Cache-First.
  /// Si [forceRefresh] es true, ignora el caché en memoria y disco.
  Future<List<ExampleUser>> getUsers({bool forceRefresh = false}) async {
    return await cacheService.getOrFetch<List<ExampleUser>>(
      key: 'users_list',
      forceRefresh: forceRefresh,
      memoryTtl: const Duration(minutes: 10), // Configurable: 10 min en RAM
      diskTtl: const Duration(hours: 1),     // Configurable: 1 hora en Disco
      
      // La función que hace la petición real si no hay caché
      fetcher: () async {
        // En la vida real usarías: 
        // final response = await cacheService.apiClient.dio.get('/users');
        // return (response.data as List).map((e) => ExampleUser.fromJson(e)).toList();
        
        await Future.delayed(const Duration(seconds: 1)); // Simulación de latencia
        final dummyData = [
          {'id': 1, 'name': 'Juan Pérez'},
          {'id': 2, 'name': 'Ana Gómez'},
        ];
        return dummyData.map((e) => ExampleUser.fromJson(e)).toList();
      },
      
      // Cómo convertir tu objeto a un Map para guardarlo en Hive (Disco)
      serialize: (users) {
        return {'items': users.map((u) => u.toJson()).toList()};
      },
      
      // Cómo reconstruir tu objeto desde un Map sacado de Hive (Disco)
      deserialize: (data) {
        final items = data['items'] as List<dynamic>;
        return items.map((e) => ExampleUser.fromJson(Map<String, dynamic>.from(e))).toList();
      },
    );
  }

  /// Invalida específicamente la lista de usuarios.
  Future<void> invalidateUsers() async {
    await cacheService.invalidate('users_list');
  }

  /// Invalida cualquier recurso de usuario por ID si fuera necesario
  Future<void> invalidateUserById(int id) async {
    await cacheService.invalidate('user_$id');
  }

  /// Invalida todo lo que empiece por 'user_'
  Future<void> invalidateAllUserResources() async {
    await cacheService.invalidateByPrefix('user_');
  }
}
