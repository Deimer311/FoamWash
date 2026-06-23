import 'package:dio/dio.dart';
import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';
import 'package:dio_cache_interceptor_hive_store/dio_cache_interceptor_hive_store.dart';
import 'package:path_provider/path_provider.dart';

/// Cliente HTTP configurado con Dio y caché persistente.
class ApiClient {
  late final Dio dio;
  late final CacheOptions _cacheOptions;
  late final CacheStore _cacheStore;
  bool _isInitialized = false;

  /// Inicializa el cliente Dio y el interceptor de caché.
  /// Debe llamarse antes de usar el cliente.
  Future<void> init({required String baseUrl}) async {
    if (_isInitialized) return;

    final dir = await getApplicationDocumentsDirectory();
    
    _cacheStore = HiveCacheStore(
      dir.path,
      hiveBoxName: 'dio_http_cache',
    );

    _cacheOptions = CacheOptions(
      store: _cacheStore,
      policy: CachePolicy.refreshForceCache, // Siempre intenta red, si falla usa caché
      hitCacheOnErrorExcept: [401, 403, 404], // No usa caché si el error es Auth o Not Found
      maxStale: const Duration(days: 7), // Tiempo máximo de caché obsoleto
      priority: CachePriority.normal,
      keyBuilder: CacheOptions.defaultCacheKeyBuilder,
      allowPostMethod: false,
    );

    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
    ));

    dio.interceptors.add(DioCacheInterceptor(options: _cacheOptions));
    _isInitialized = true;
  }

  /// Retorna un `Options` configurado para forzar el refresco de red
  /// e ignorar el caché temporalmente en una petición.
  Options forceRefreshOptions() {
    _ensureInitialized();
    return _cacheOptions.copyWith(policy: CachePolicy.refresh).toOptions();
  }

  /// Borra el caché específico de una URL.
  Future<void> invalidateUrl(String url) async {
    _ensureInitialized();
    final key = _cacheOptions.keyBuilder(RequestOptions(path: url));
    await _cacheStore.delete(key);
  }

  /// Borra TODO el caché HTTP.
  Future<void> clearAll() async {
    _ensureInitialized();
    await _cacheStore.clean();
  }

  void _ensureInitialized() {
    if (!_isInitialized) {
      throw StateError('ApiClient no inicializado. Llama a init() primero.');
    }
  }
}
