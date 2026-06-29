import 'dart:async';
import 'package:flutter/painting.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../network/connectivity_service.dart';
import '../network/api_client.dart';
import 'in_memory_cache.dart';
import 'hive_cache.dart';
import 'cache_exception.dart';

/// Orquestador de la estrategia de caché Cache-First.
class CacheService {
  final InMemoryCache inMemoryCache;
  final HiveCache hiveCache;
  final ConnectivityService connectivityService;
  final ApiClient apiClient;

  Timer? _purgeTimer;

  CacheService({
    required this.inMemoryCache,
    required this.hiveCache,
    required this.connectivityService,
    required this.apiClient,
  });

  /// Inicia el proceso en segundo plano para limpiar caché expirado cada X minutos.
  void schedulePurge({Duration interval = const Duration(minutes: 15)}) {
    _purgeTimer?.cancel();
    _purgeTimer = Timer.periodic(interval, (_) async {
      inMemoryCache.purgeExpired();
      await hiveCache.purgeExpired();
    });
  }

  /// Estrategia Cache-First:
  /// 1. Memoria
  /// 2. Disco
  /// 3. Red -> Guarda en Memoria y Disco
  Future<T> getOrFetch<T>({
    required String key,
    required Future<T> Function() fetcher,
    required Map<String, dynamic> Function(T) serialize,
    required T Function(Map<String, dynamic>) deserialize,
    Duration memoryTtl = const Duration(minutes: 10),
    Duration diskTtl = const Duration(hours: 24),
    bool forceRefresh = false,
  }) async {
    
    // Si no forzamos refresco, buscamos en memoria
    if (!forceRefresh) {
      final memData = inMemoryCache.get<T>(key);
      if (memData != null) {
        return memData;
      }

      // Buscamos en disco
      final diskData = hiveCache.get(key);
      if (diskData != null) {
        try {
          final parsed = deserialize(diskData);
          // Promovemos a memoria
          inMemoryCache.set<T>(key, parsed, memoryTtl);
          return parsed;
        } catch (e) {
          // Fallo al deserializar, ignoramos y buscamos en red
        }
      }
    }

    // Buscamos en red
    final hasNetwork = await connectivityService.isAnyNetworkAvailable;
    if (!hasNetwork) {
      throw const NetworkUnavailableException();
    }

    try {
      final data = await fetcher();
      
      // Guardamos en memoria y disco
      inMemoryCache.set<T>(key, data, memoryTtl);
      await hiveCache.set(key, serialize(data), diskTtl);
      
      return data;
    } catch (e) {
      // Si falla la red, lanzamos error
      throw CacheException('Error fetching data: $e');
    }
  }

  /// Invalida una clave específica en memoria y disco.
  Future<void> invalidate(String key) async {
    inMemoryCache.remove(key);
    await hiveCache.delete(key);
  }

  /// Invalida todas las claves que comiencen con el prefijo dado.
  Future<void> invalidateByPrefix(String prefix) async {
    inMemoryCache.invalidateByPrefix(prefix);
    await hiveCache.invalidateByPrefix(prefix);
  }

  /// Borra TODO el caché de memoria, disco, HTTP e imágenes.
  Future<void> clearAll() async {
    inMemoryCache.clear();
    await hiveCache.clearAll();
    await apiClient.clearAll();
    await clearImageCache();
  }

  /// Purga manualmente las entradas expiradas.
  Future<void> purgeExpired() async {
    inMemoryCache.purgeExpired();
    await hiveCache.purgeExpired();
  }

  /// Borra una imagen del caché usando su URL.
  static Future<void> invalidateImage(String url) async {
    await CachedNetworkImage.evictFromCache(url);
  }

  /// Borra todas las imágenes del caché.
  static Future<void> clearImageCache() async {
    // CachedNetworkImage usa flutter_cache_manager por defecto.
    // Aunque no tenemos el manager directamente, al limpiar el caché general de imágenes se vacía.
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();
  }

  void dispose() {
    _purgeTimer?.cancel();
  }
}
