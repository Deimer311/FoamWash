import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';

/// Servicio encargado de detectar si hay red disponible.
/// Valida tanto internet público como red local (LAN) usando Sockets reales.
class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  
  /// IP o Hostname del servidor local (LAN). Ej: '192.168.1.5'
  final String localLanHost;
  
  /// Puerto del servidor local. Ej: 5000
  final int localLanPort;

  ConnectivityService({
    required this.localLanHost,
    this.localLanPort = 5000,
  });

  /// Verifica si hay conexión real a internet.
  Future<bool> get isOnline async {
    final connectivityResult = await _connectivity.checkConnectivity();
    // En las versiones recientes de connectivity_plus retorna List<ConnectivityResult>
    // pero manejamos la lógica general comprobando si está vacío o si contiene .none
    if (connectivityResult.contains(ConnectivityResult.none)) return false;

    try {
      // Intenta resolver google.com
      final result = await InternetAddress.lookup('google.com');
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } on SocketException catch (_) {
      return false;
    }
  }

  /// Verifica si hay conexión a la red local (LAN).
  Future<bool> get isLanAvailable async {
    final connectivityResult = await _connectivity.checkConnectivity();
    if (connectivityResult.contains(ConnectivityResult.none)) return false;

    try {
      // Intenta conectar al socket local
      final socket = await Socket.connect(localLanHost, localLanPort, timeout: const Duration(seconds: 2));
      socket.destroy();
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Retorna true si hay internet O si la LAN está disponible.
  Future<bool> get isAnyNetworkAvailable async {
    final online = await isOnline;
    if (online) return true;
    
    return await isLanAvailable;
  }
}
