import 'package:no_screenshot/no_screenshot.dart';

class SecurityUtils {
  static final _noScreenshot = NoScreenshot.instance;

  /// Evita capturas y grabaciones de pantalla en la pantalla actual.
  /// Esto marcará la ventana como segura y mostrará una pantalla negra si se intenta grabar o capturar.
  static Future<void> secureScreen() async {
    try {
      await _noScreenshot.screenshotOff();
    } catch (e) {
      print('Error al activar protección contra capturas de pantalla: $e');
    }
  }

  /// Habilita de nuevo la posibilidad de tomar capturas y grabaciones de pantalla.
  static Future<void> clearSecureScreen() async {
    try {
      await _noScreenshot.screenshotOn();
    } catch (e) {
      print('Error al desactivar protección contra capturas de pantalla: $e');
    }
  }
}
