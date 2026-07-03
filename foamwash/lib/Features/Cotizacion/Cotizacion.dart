// =============================================================================
// ARCHIVO  : cotizacion_screen.dart
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Misma función que CotizacionPage.jsx — catálogo público de
//            servicios con buscador, carrito de cotización (persistido en
//            SharedPreferences, igual que cotizacionStorage.js), modal de
//            carrito, modal de confirmación en 4 etapas (resumen → fecha/hora
//            → confirmar → éxito) y prompt de login para invitados.
//            Sigue las mismas convenciones que tus otras vistas
//            (AppTheme, AuthProvider, ApiConstants).
// =============================================================================

import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/Features/Services/widgets/footer_widget.dart';

const String _imagenFallback = '/img/imag1.jpg';

// =============================================================================
// MODELO DE SERVICIO (mismos campos que SERVICIOS_FALLBACK del .jsx)
// =============================================================================
class CotizacionServicio {
  final int id;
  final String nombre;
  final double precio;
  final String imagenUrl;
  final String descripcion;
  final List<String> tamanos;
  final double? rating;
  final bool garantia;
  final bool ecologico;
  final bool popular;

  CotizacionServicio({
    required this.id,
    required this.nombre,
    required this.precio,
    required this.imagenUrl,
    required this.descripcion,
    this.tamanos = const [],
    this.rating,
    this.garantia = false,
    this.ecologico = false,
    this.popular = false,
  });

  factory CotizacionServicio.fromJson(Map<String, dynamic> json) {
    return CotizacionServicio(
      id: json['Id_Servicio'] ?? json['id'],
      nombre: json['Nombre_Servicio']?.toString() ?? json['nombre']?.toString() ?? 'Sin nombre',
      precio: double.tryParse((json['Precio'] ?? json['precio'] ?? 0).toString()) ?? 0,
      imagenUrl: json['imagen_url']?.toString() ?? _imagenFallback,
      descripcion: json['Descripcion']?.toString() ?? json['descripcion']?.toString() ?? '',
      tamanos: const ['Estándar'],
      rating: double.tryParse((json['rating'] ?? '').toString()),
      garantia: json['garantia'] == true,
      ecologico: json['ecologico'] == true,
      popular: json['popular'] == true,
    );
  }

  Map<String, dynamic> toCacheJson() => {
        'id': id,
        'nombre': nombre,
        'precio': precio,
        'imagenUrl': imagenUrl,
      };

  /// Catálogo de respaldo — idéntico al SERVICIOS_FALLBACK del .jsx, usado si
  /// la API no responde o no devuelve datos.
  static List<CotizacionServicio> fallback() => [
        CotizacionServicio(id: 1, nombre: 'Lavado de muebles', precio: 90000, imagenUrl: '/img/imag1.jpg', descripcion: 'Lavado profundo de sofás y sillas, eliminación de manchas y olores.', tamanos: const ['Pequeño', 'Mediano', 'Grande'], rating: 4.8, garantia: true, ecologico: true, popular: true),
        CotizacionServicio(id: 2, nombre: 'Lavado de alfombras', precio: 50000, imagenUrl: '/img/imag4.jpg', descripcion: 'Limpieza profunda para alfombras pequeñas y medianas.', tamanos: const ['Pequeña', 'Mediana', 'Grande'], rating: 4.9, garantia: true, ecologico: false, popular: false),
        CotizacionServicio(id: 3, nombre: 'Tapicería de carros', precio: 140000, imagenUrl: '/img/imag5.jpg', descripcion: 'Limpieza interior del vehículo: asientos, alfombras y paneles.', tamanos: const ['Sedan', 'SUV', 'Camioneta'], rating: 5.0, garantia: true, ecologico: true, popular: false),
        CotizacionServicio(id: 4, nombre: 'Lavado de cortinas', precio: 80000, imagenUrl: '/img/imag7.jpg', descripcion: 'Lavado y planchado ligero para cortinas y visillos.', tamanos: const ['Por metro', 'Juego completo'], rating: 4.7, garantia: false, ecologico: true, popular: false),
        CotizacionServicio(id: 5, nombre: 'Lavado de colchones', precio: 90000, imagenUrl: '/img/imag6.jpg', descripcion: 'Eliminación de ácaros y manchas, desodorización y secado rápido.', tamanos: const ['Sencillo', 'Semi-doble', 'Doble', 'Queen', 'King'], rating: 4.8, garantia: true, ecologico: true, popular: true),
        CotizacionServicio(id: 6, nombre: 'Mantenimiento y pulido de pisos', precio: 100000, imagenUrl: '/img/imag8.jpg', descripcion: 'Recuperar brillo, proteger la superficie y mejorar su apariencia.', tamanos: const ['Pequeño (hasta 50m²)', 'Mediano (50-100m²)', 'Grande (más de 100m²)'], rating: 4.6, garantia: true, ecologico: false, popular: false),
        CotizacionServicio(id: 7, nombre: 'Limpieza sillas de comedor', precio: 7000, imagenUrl: '/img/imag2.jpg', descripcion: 'Elimina manchas, suciedad y malos olores.', tamanos: const ['7.000 por silla', '10.000 por silla'], rating: 4.9, garantia: false, ecologico: true, popular: true),
        CotizacionServicio(id: 8, nombre: 'Limpieza de tapetes decorativos', precio: 60000, imagenUrl: '/img/imag3.jpg', descripcion: 'Remueve suciedad, polvo y manchas, devolviendo frescura y color.', tamanos: const ['Pequeño (hasta 50m²)', 'Mediano (50-100m²)', 'Grande (más de 100m²)'], rating: 4.7, garantia: true, ecologico: true, popular: false),
      ];
}

class CarritoItem {
  final CotizacionServicio servicio;
  int cantidad;
  CarritoItem({required this.servicio, this.cantidad = 1});
  double get subtotal => servicio.precio * cantidad;
}

// =============================================================================
// HELPERS
// =============================================================================
String _formatearMoneda(double v) {
  final s = v.toStringAsFixed(0);
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write('.');
    buf.write(s[i]);
  }
  return '\$$buf';
}

String _imagenCompleta(String path) {
  if (path.startsWith('http')) return path;
  if (path.startsWith('/img/')) return path; // Se manejará como asset
  final base = ApiConstants.baseUrl.replaceAll('/api', '');
  final separator = path.startsWith('/') ? '' : '/';
  return '$base$separator$path';
}

Widget _buildImageWidget(String path, {double? width, double? height, BoxFit fit = BoxFit.cover}) {
  if (path.trim().isEmpty) {
    return Icon(Icons.local_laundry_service, color: Colors.grey, size: width ?? 40);
  }
  if (path.startsWith('/img/')) {
    return Image.asset(
      'assets$path',
      width: width,
      height: height,
      fit: fit,
      errorBuilder: (_, __, ___) => Icon(Icons.image_not_supported, color: Colors.grey, size: width ?? 40),
    );
  }
  return Image.network(
    _imagenCompleta(path),
    width: width,
    height: height,
    fit: fit,
    headers: const {'ngrok-skip-browser-warning': 'true'},
    errorBuilder: (_, __, ___) => Icon(Icons.local_laundry_service, color: AppTheme.primaryBlue, size: width ?? 40),
  );
}

const List<String> _horariosDisponibles = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
];

const _mesesEs = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const _diasEs = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

String _formatearFechaLarga(DateTime f) {
  final dia = _diasEs[f.weekday - 1];
  return '$dia, ${f.day} de ${_mesesEs[f.month - 1]} de ${f.year}';
}

// =============================================================================
// PERSISTENCIA LOCAL DE LA COTIZACIÓN (equivalente a cotizacionStorage.js)
// =============================================================================
class CotizacionStorage {
  static const _kItems = 'cotizacion_local_items';
  static const _kTimestamp = 'cotizacion_local_ts';
  static const _vigenciaHoras = 24;

  static Future<void> guardar(List<CarritoItem> carrito) async {
    final prefs = await SharedPreferences.getInstance();
    final data = carrito
        .map((c) => {
              'id': c.servicio.id,
              'nombre': c.servicio.nombre,
              'precio': c.servicio.precio,
              'imagenUrl': c.servicio.imagenUrl,
              'cantidad': c.cantidad,
            })
        .toList();
    await prefs.setString(_kItems, json.encode(data));
    if (!prefs.containsKey(_kTimestamp)) {
      await prefs.setInt(_kTimestamp, DateTime.now().millisecondsSinceEpoch);
    }
  }

  static Future<List<Map<String, dynamic>>> leer() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kItems);
    if (raw == null) return [];
    try {
      final list = json.decode(raw) as List;
      return list.cast<Map<String, dynamic>>();
    } catch (_) {
      return [];
    }
  }

  static Future<void> limpiar() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_kItems);
    await prefs.remove(_kTimestamp);
  }

  /// Texto de tiempo restante antes de que expire la cotización local
  /// (ej. "23h 12m"), o null si no hay cotización guardada / ya expiró.
  static Future<String?> tiempoRestante() async {
    final prefs = await SharedPreferences.getInstance();
    final ts = prefs.getInt(_kTimestamp);
    if (ts == null) return null;
    final expira = DateTime.fromMillisecondsSinceEpoch(ts).add(const Duration(hours: _vigenciaHoras));
    final restante = expira.difference(DateTime.now());
    if (restante.isNegative) {
      await limpiar();
      return null;
    }
    final horas = restante.inHours;
    final minutos = restante.inMinutes % 60;
    return '${horas}h ${minutos}m';
  }

  /// Sincroniza la cotización local con el backend cuando el usuario inicia
  /// sesión. Ajusta el endpoint/payload al contrato real de tu API.
  static Future<bool> sincronizarConBD(String userId) async {
    final items = await leer();
    if (items.isEmpty) return true;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token') ?? '';

      final res = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/cotizaciones/sincronizar'),
        headers: {
          'Content-Type': 'application/json', 
          'ngrok-skip-browser-warning': 'true',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        body: json.encode({'userId': userId, 'items': items}),
      );
      return res.statusCode == 200 || res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }
}

// =============================================================================
// PANTALLA PRINCIPAL
// =============================================================================
class CotizacionScreen extends StatefulWidget {
  final VoidCallback? onBackToHome;
  final VoidCallback? onGoToServicios;
  final VoidCallback? onGoToLogin;

  const CotizacionScreen({
    Key? key,
    this.onBackToHome,
    this.onGoToServicios,
    this.onGoToLogin,
  }) : super(key: key);

  @override
  State<CotizacionScreen> createState() => _CotizacionScreenState();
}

class _CotizacionScreenState extends State<CotizacionScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<CotizacionServicio> _servicios = [];
  final List<CarritoItem> _carrito = [];
  bool _isLoading = true;
  String _searchTerm = '';
  String? _syncMsg;
  String? _tiempoExpira;
  Timer? _expiraTimer;

  double get _total => _carrito.fold(0, (s, i) => s + i.subtotal);
  int get _totalItems => _carrito.fold(0, (s, i) => s + i.cantidad);

  List<CotizacionServicio> get _filtrados {
    if (_searchTerm.trim().isEmpty) return _servicios;
    final q = _searchTerm.toLowerCase();
    return _servicios.where((s) => s.nombre.toLowerCase().contains(q) || s.descripcion.toLowerCase().contains(q)).toList();
  }

  @override
  void initState() {
    super.initState();
    _cargarServicios();
    _cargarCotizacionLocal();
    _expiraTimer = Timer.periodic(const Duration(minutes: 1), (_) => _actualizarTiempoExpira());

    // Si el usuario ya está autenticado al abrir la pantalla, intenta
    // sincronizar cualquier cotización guardada localmente.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = context.read<AuthProvider>();
      if (auth.isAuthenticated) _sincronizarSiHayPendientes();
    });
  }

  @override
  void dispose() {
    _expiraTimer?.cancel();
    super.dispose();
  }

  // ── Carga de catálogo (equivalente al useEffect de carga del .jsx) ──────
  Future<void> _cargarServicios() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/cotizaciones/servicios'),
        headers: {'ngrok-skip-browser-warning': 'true'},
      );
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        final data = (body['data'] as List?) ?? [];
        if (body['success'] == true && data.isNotEmpty) {
          _servicios = data.map((s) => CotizacionServicio.fromJson(s)).toList();
        } else {
          _servicios = CotizacionServicio.fallback();
        }
      } else {
        _servicios = CotizacionServicio.fallback();
      }
    } catch (_) {
      _servicios = CotizacionServicio.fallback();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _cargarCotizacionLocal() async {
    final guardados = await CotizacionStorage.leer();
    if (guardados.isEmpty) return;
    setState(() {
      _carrito.clear();
      for (final g in guardados) {
        final servicio = CotizacionServicio(
          id: g['id'],
          nombre: g['nombre'] ?? 'Servicio',
          precio: (g['precio'] as num?)?.toDouble() ?? 0,
          imagenUrl: g['imagenUrl'] ?? _imagenFallback,
          descripcion: '',
        );
        _carrito.add(CarritoItem(servicio: servicio, cantidad: g['cantidad'] ?? 1));
      }
    });
    _actualizarTiempoExpira();
  }

  Future<void> _actualizarTiempoExpira() async {
    final t = await CotizacionStorage.tiempoRestante();
    if (mounted) setState(() => _tiempoExpira = t);
  }

  Future<void> _persistirCarrito() async {
    if (_carrito.isNotEmpty) {
      await CotizacionStorage.guardar(_carrito);
      _actualizarTiempoExpira();
    }
  }

  Future<void> _sincronizarSiHayPendientes() async {
    final pendientes = await CotizacionStorage.leer();
    if (pendientes.isEmpty) return;
    final auth = context.read<AuthProvider>();
    setState(() => _syncMsg = '⏳ Guardando tu cotización previa...');
    final ok = await CotizacionStorage.sincronizarConBD(
  auth.user?.idUsuario.toString() ?? '',
);
    setState(() => _syncMsg = ok ? '✅ Servicios guardados en tu cuenta.' : '⚠️ No se pudo sincronizar la cotización.');
    Future.delayed(const Duration(seconds: 5), () {
      if (mounted) setState(() => _syncMsg = null);
    });
  }

  // ── Carrito ───────────────────────────────────────────────────────────────
  void _agregarAlCarrito(CotizacionServicio servicio) {
    setState(() {
      final existente = _carrito.where((c) => c.servicio.id == servicio.id).firstOrNull;
      if (existente != null) {
        existente.cantidad++;
      } else {
        _carrito.add(CarritoItem(servicio: servicio));
      }
    });
    _persistirCarrito();
  }

  void _actualizarCantidad(int servicioId, int nuevaCantidad) {
    setState(() {
      if (nuevaCantidad <= 0) {
        _carrito.removeWhere((c) => c.servicio.id == servicioId);
      } else {
        final item = _carrito.where((c) => c.servicio.id == servicioId).firstOrNull;
        if (item != null) item.cantidad = nuevaCantidad;
      }
    });
    _persistirCarrito();
  }

  Future<void> _limpiarCarrito() async {
    setState(() => _carrito.clear());
    await CotizacionStorage.limpiar();
  }

  // ── Flujo de agendamiento ────────────────────────────────────────────────
  void _abrirCarrito() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _CartSheet(
        carrito: _carrito,
        total: _total,
        onActualizarCantidad: _actualizarCantidad,
        onFinalizarCompra: () {
          Navigator.pop(context);
          _abrirConfirmacion();
        },
        onGuardarCotizacionRapida: () {
          Navigator.pop(context);
          _guardarRapido();
        },
      ),
    );
  }

  Future<void> _guardarRapido() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final strList = prefs.getStringList('mis_cotizaciones') ?? [];
      final list = strList.map((e) => jsonDecode(e) as Map<String, dynamic>).toList();

      final newQuotation = {
        'ID_Reserva': DateTime.now().millisecondsSinceEpoch.toString(),
        'creadoEn': DateTime.now().toIso8601String(),
        'expiraEn': DateTime.now().add(const Duration(hours: 48)).toIso8601String(),
        'servicios': _carrito.map((e) => {
          'ID_Servicio': e.servicio.id,
          'Nombre_Servicio': e.servicio.nombre,
          'cantidad': e.cantidad,
          'Precio': e.servicio.precio,
          'imagenUrl': e.servicio.imagenUrl,
        }).toList(),
        'total': _total,
        'fecha': null,
        'Hora': null,
        'direccion': '',
        'ciudad': '',
      };
      
      list.add(newQuotation);
      await prefs.setStringList('mis_cotizaciones', list.map((e) => jsonEncode(e)).toList());
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cotización guardada (válida por 48h)'), backgroundColor: AppTheme.successGreen),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error al guardar: $e'), backgroundColor: Colors.red),
      );
    }
  }

  void _abrirConfirmacion() {
    final auth = context.read<AuthProvider>();
    if (!auth.isAuthenticated) {
      _mostrarAuthPrompt();
      return;
    }
    showDialog(
      context: context,
      builder: (_) => _ConfirmationDialog(
        carrito: _carrito,
        total: _total,
        userId: auth.user?.idUsuario,
        onConfirmarPedido: () async {
          await _limpiarCarrito();
        },
      ),
    );
  }

  void _mostrarAuthPrompt() {
    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.white,
          elevation: 8,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                right: 12,
                top: 12,
                child: GestureDetector(
                  onTap: () => Navigator.pop(ctx),
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(
                      color: Color(0xFFF1F5F9),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.close_rounded,
                      color: Color(0xFF64748B),
                      size: 18,
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF3B82F6).withOpacity(0.3),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'FW',
                          style: TextStyle(
                            color: Colors.white,
                            fontFamily: 'Kanit',
                            fontWeight: FontWeight.w800,
                            fontSize: 24,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Debes iniciar sesión primero',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1E293B),
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Para solicitar un servicio crea una cuenta o inicia sesión.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                        color: Color(0xFF64748B),
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              Navigator.pushNamed(context, '/register');
                            },
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Color(0xFFE2E8F0), width: 1.5),
                              padding: const EdgeInsets.symmetric(vertical: 13),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Registrarse',
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              if (widget.onGoToLogin != null) {
                                widget.onGoToLogin!();
                              } else {
                                Navigator.pushNamed(context, '/login');
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF3B82F6),
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(vertical: 13),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Iniciar sesión',
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'No compartiremos tu información en este demo.',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF94A3B8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppTheme.backgroundWhite,
      drawer: _buildDrawer(),
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(isLandscape),
            if (_tiempoExpira != null && !auth.isAuthenticated) _buildBannerExpira(),
            if (_syncMsg != null) _buildSyncBanner(),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryBlue))
                  : _buildGrid(isLandscape),
            ),
          ],
        ),
      ),
      // Carrito flotante removido y movido al header para alinear con el diseño de agendamiento
      floatingActionButton: null,
    );
  }

  Widget _buildBannerExpira() {
    return Container(
      width: double.infinity,
      color: const Color(0xFFFFF8E1),
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Text(
        '⏰ Tu cotización está guardada temporalmente — expira en $_tiempoExpira. Inicia sesión para guardarla permanentemente.',
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 12, color: Color(0xFF795548), fontFamily: 'Kanit'),
      ),
    );
  }

  Widget _buildSyncBanner() {
    return Container(
      width: double.infinity,
      color: AppTheme.primaryBlue,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Text(
        _syncMsg!,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 12.5, color: Colors.white, fontWeight: FontWeight.w600, fontFamily: 'Kanit'),
      ),
    );
  }

  Widget _buildDrawer() {
    final auth = context.read<AuthProvider>();
    return Drawer(
      backgroundColor: const Color(0xFF080C1E),
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0x1AFFFFFF), width: 1)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'FoamWash',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildDrawerItem(
              icon: Icons.home_outlined,
              label: 'Inicio',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushReplacementNamed(context, '/home');
              },
            ),
            _buildDrawerItem(
              icon: Icons.description_outlined,
              label: 'Cotizar',
              isActive: true,
              onTap: () => Navigator.pop(context),
            ),
            _buildDrawerItem(
              icon: Icons.cleaning_services_outlined,
              label: 'Agendar',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                if (auth.isAuthenticated) {
                  Navigator.pushReplacementNamed(context, '/scheduling');
                } else {
                  Navigator.pushReplacementNamed(context, '/guest');
                }
              },
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Divider(color: Color(0x12FFFFFF)),
            ),
            if (auth.isAuthenticated) ...[
              _buildDrawerItem(
                icon: Icons.person_outline_rounded,
                label: 'Mi Perfil',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/perfilCliente');
                },
              ),
              _buildDrawerItem(
                icon: Icons.event_note_outlined,
                label: 'Mis Agendamientos',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/agendamientos');
                },
              ),
              _buildDrawerItem(
                icon: Icons.description_outlined,
                label: 'Mis Cotizaciones',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/mis_cotizaciones');
                },
              ),
              _buildDrawerItem(
                icon: Icons.logout_rounded,
                label: 'Cerrar Sesión',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  _showConfirmLogoutDialog(context);
                },
              ),
            ] else ...[
              _buildDrawerItem(
                icon: Icons.login_rounded,
                label: 'Iniciar Sesión',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/login');
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? const Color(0x2E0066FF) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: isActive ? const Color(0xFF0099FF) : Colors.white60,
          size: 20,
        ),
        title: Text(
          label,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? Colors.white : Colors.white70,
            fontSize: 14,
          ),
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        onTap: onTap,
      ),
    );
  }

  void _showConfirmLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          '¿Cerrar sesión?',
          style: TextStyle(color: Colors.white, fontFamily: 'Kanit', fontSize: 16),
        ),
        content: const Text(
          '¿Estás seguro de que deseas salir de tu cuenta?',
          style: TextStyle(color: Colors.white70, fontFamily: 'Kanit', fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () {
              Navigator.pop(context);
              context.read<AuthProvider>().logout();
              Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
            },
            child: const Text('Cerrar Sesión', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(bool isLandscape) {
    final auth = context.watch<AuthProvider>();
    return Container(
      height: 64,
      decoration: const BoxDecoration(
        color: Color(0xFF080C1E),
        border: Border(
          bottom: BorderSide(color: Color(0x1AFFFFFF), width: 1),
        ),
      ),
      padding: EdgeInsets.symmetric(horizontal: isLandscape ? 40 : 16),
      child: Row(
        children: [
          // Botón hamburguesa (solo en Portrait)
          if (!isLandscape) ...[
            IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
            const SizedBox(width: 12),
          ],

          // Logo e Identidad (FoamWashCL)
          GestureDetector(
            onTap: () => Navigator.pushReplacementNamed(context, '/home'),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                  ),
                ),
                const SizedBox(width: 8),
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(
                        text: 'FoamWash',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                      ),
                      TextSpan(
                        text: 'CL',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0099FF),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Navegación central (solo en Landscape)
          if (isLandscape) ...[
            const Spacer(),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildNavButton(
                  icon: Icons.home_outlined,
                  label: 'Hogar',
                  isActive: false,
                  onTap: () => Navigator.pushReplacementNamed(context, '/home'),
                ),
                const SizedBox(width: 12),
                _buildNavButton(
                  icon: Icons.description_outlined,
                  label: 'Cotización',
                  isActive: true,
                  onTap: () {},
                ),
                const SizedBox(width: 12),
                _buildNavButton(
                  icon: Icons.cleaning_services_outlined,
                  label: 'Agendar',
                  isActive: false,
                  onTap: () {
                    if (auth.isAuthenticated) {
                      Navigator.pushReplacementNamed(context, '/scheduling');
                    } else {
                      Navigator.pushReplacementNamed(context, '/guest');
                    }
                  },
                ),
              ],
            ),
          ],

          const Spacer(),

          // Sección Derecha: Carrito y Botón de sesión / Perfil
          Row(
            children: [
              // Botón de Carrito (estilo agendamiento)
              Stack(
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 22),
                    onPressed: _abrirCarrito,
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                  if (_totalItems > 0)
                    Positioned(
                      right: -6,
                      top: -6,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Color(0xFF1E3A8A),
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          _totalItems.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 16),
              
              if (auth.isAuthenticated) ...[
                // Avatar con PopupMenuButton Dropdown
                Builder(
                  builder: (context) {
                    final user = auth.user;
                    final fotoUrl = fwFotoUrl(
                      user?.fotoPerfil,
                      ApiConstants.baseUrl.replaceAll('/api', ''),
                    );

                    return PopupMenuButton<String>(
                      offset: const Offset(0, 48),
                      color: const Color(0xFA0A0E26), // rgba(10,14,38,0.97)
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                        side: const BorderSide(color: Color(0x17FFFFFF), width: 1),
                      ),
                      elevation: 8,
                      onSelected: (value) {
                        if (value == 'perfil') {
                          Navigator.pushNamed(context, '/perfilCliente');
                        } else if (value == 'agendamientos') {
                          Navigator.pushNamed(context, '/agendamientos');
                        } else if (value == 'cotizaciones') {
                          Navigator.pushNamed(context, '/mis_cotizaciones');
                        } else if (value == 'logout') {
                          _showConfirmLogoutDialog(context);
                        }
                      },
                      itemBuilder: (BuildContext context) => [
                        PopupMenuItem<String>(
                          enabled: false,
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user?.nombre ?? 'Cliente',
                                  style: const TextStyle(
                                    fontFamily: 'Kanit',
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                                if (user?.correo != null) ...[
                                  const SizedBox(height: 2),
                                  Text(
                                    user!.correo,
                                    style: const TextStyle(
                                      fontFamily: 'Kanit',
                                      fontSize: 11,
                                      color: Colors.white54,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 8),
                                const Divider(color: Color(0x12FFFFFF), height: 1),
                              ],
                            ),
                          ),
                        ),
                        _buildPopupItem(
                          value: 'perfil',
                          icon: Icons.person_outline_rounded,
                          label: 'Mi Perfil',
                          iconColor: const Color(0xFF0099FF),
                        ),
                        _buildPopupItem(
                          value: 'agendamientos',
                          icon: Icons.event_note_outlined,
                          label: 'Mis Agendamientos',
                          iconColor: const Color(0xFF0099FF),
                        ),
                        _buildPopupItem(
                          value: 'cotizaciones',
                          icon: Icons.description_outlined,
                          label: 'Mis Cotizaciones',
                          iconColor: const Color(0xFF0099FF),
                        ),
                        _buildPopupItem(
                          value: 'logout',
                          icon: Icons.logout_rounded,
                          label: 'Cerrar sesión',
                          iconColor: const Color(0xFFFF6B6B),
                          isLogout: true,
                        ),
                      ],
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: Colors.white.withOpacity(0.2),
                            width: 1.5,
                          ),
                        ),
                        child: FWAvatar(
                          fotoUrl: fotoUrl,
                          size: 32,
                        ),
                      ),
                    );
                  },
                ),
              ] else ...[
                if (isLandscape)
                  Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF1A56FF), Color(0xFF7C3AED)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF1A56FF).withOpacity(0.3),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pushNamed(context, '/login'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.login_rounded, size: 14),
                      label: const Text(
                        'Iniciar Sesión',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 13.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  )
                else
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/login'),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.06),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withOpacity(0.1),
                          width: 1.5,
                        ),
                      ),
                      child: const Icon(
                        Icons.person_rounded,
                        color: Colors.white70,
                        size: 20,
                      ),
                    ),
                  )
              ],
            ],
          )
        ],
      ),
    );
  }

  Widget _buildNavButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(7),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0x2E0066FF) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: Colors.white70, size: 14),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13.5,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            if (isActive) ...[
              const SizedBox(height: 2),
              Container(
                width: 18,
                height: 2,
                decoration: BoxDecoration(
                  color: const Color(0xFF0099FF),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  PopupMenuItem<String> _buildPopupItem({
    required String value,
    required IconData icon,
    required String label,
    required Color iconColor,
    bool isLogout = false,
  }) {
    return PopupMenuItem<String>(
      value: value,
      height: 42,
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(7),
            ),
            child: Icon(icon, color: iconColor, size: 14),
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isLogout ? const Color(0xFFFF6B6B) : Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 700),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: Colors.black.withOpacity(0.06), width: 1),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(20, 2, 6, 2),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: (val) {
                    setState(() {
                      _searchTerm = val;
                    });
                  },
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 14,
                    color: Color(0xFF333333),
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Buscar servicios: muebles, alfombras, colchones...',
                    hintStyle: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 13,
                      color: Color(0xFF94A3B8),
                    ),
                    border: InputBorder.none,
                    isDense: true,
                  ),
                ),
              ),
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [Color(0xFF1E3A8A), Color(0xFF1A56FF)],
                  ),
                ),
                child: const Icon(Icons.search_rounded, color: Colors.white, size: 18),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGrid(bool isLandscape) {
    final servicios = _filtrados;

    return RefreshIndicator(
      onRefresh: _cargarServicios,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: _buildSearchBar(),
          ),
          SliverToBoxAdapter(
            child: Container(
              color: AppTheme.backgroundWhite,
              padding: const EdgeInsets.fromLTRB(20, 28, 20, 20),
              child: Column(
                children: [
                  const Text(
                    'Nuestros Servicios',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.darkText,
                      letterSpacing: -0.5,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    alignment: WrapAlignment.center,
                    spacing: 0,
                    children: const [
                      Text(
                        'Profesionales certificados',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                      Text(' · ', style: TextStyle(fontSize: 12, color: AppTheme.greyText)),
                      Text(
                        'Productos ecológicos',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                      Text(' · ', style: TextStyle(fontSize: 12, color: AppTheme.greyText)),
                      Text(
                        'Garantía de satisfacción',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (servicios.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'No se encontraron servicios que coincidan con "$_searchTerm"',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Color(0xFF999999), fontFamily: 'Kanit'),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryBlue,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () => setState(() => _searchTerm = ''),
                        child: const Text('Limpiar búsqueda'),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else if (isLandscape)
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              sliver: SliverGrid(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 20,
                  mainAxisSpacing: 20,
                  childAspectRatio: ((MediaQuery.of(context).size.width - 60) / 2) / 495,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _ServiceCard(
                    servicio: servicios[index],
                    onAgregar: () => _agregarAlCarrito(servicios[index]),
                  ),
                  childCount: servicios.length,
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, index) => _ServiceCard(
                    servicio: servicios[index],
                    onAgregar: () => _agregarAlCarrito(servicios[index]),
                  ),
                  childCount: servicios.length,
                ),
              ),
            ),
          const SliverToBoxAdapter(
            child: AppFooter(),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// TARJETA DE SERVICIO — equivalente a CotizacionServiceCard.jsx
// =============================================================================
class _ServiceCard extends StatefulWidget {
  final CotizacionServicio servicio;
  final VoidCallback onAgregar;
  const _ServiceCard({required this.servicio, required this.onAgregar});

  @override
  State<_ServiceCard> createState() => _ServiceCardState();
}

class _ServiceCardState extends State<_ServiceCard> {
  bool _isAdding = false;
  bool _added = false;

  Future<_ServiceCardState> get state => Future.value(this);

  Future<void> _handleAgregar() async {
    setState(() => _isAdding = true);
    await Future.delayed(const Duration(milliseconds: 300));
    widget.onAgregar();
    setState(() {
      _isAdding = false;
      _added = true;
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _added = false);
    });
  }

  void _verImagenCompleta() {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.93),
      builder: (ctx) => GestureDetector(
        onTap: () => Navigator.pop(ctx),
        child: Stack(
          children: [
            Center(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _buildImageWidget(
                  widget.servicio.imagenUrl,
                  fit: BoxFit.contain,
                ),
              ),
            ),
            Positioned(
              top: 40,
              right: 20,
              child: Text(
                'Toca para cerrar',
                style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12, fontFamily: 'Kanit'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniBadge({required IconData icon, required String text, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.9),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 10),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 9,
              fontWeight: FontWeight.w700,
              fontFamily: 'Kanit',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPopularBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF9800), Color(0xFFFF5722)],
        ),
        borderRadius: BorderRadius.circular(6),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFFF5722).withOpacity(0.4),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: const [
          Icon(Icons.star_rounded, color: Colors.white, size: 10),
          SizedBox(width: 4),
          Text(
            'Popular',
            style: TextStyle(
              color: Colors.white,
              fontSize: 9,
              fontWeight: FontWeight.w800,
              fontFamily: 'Kanit',
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTag(String label, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: textColor,
          fontSize: 9.5,
          fontWeight: FontWeight.w600,
          fontFamily: 'Kanit',
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.servicio;
    final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;
    final double imageHeight = isLandscape ? 115.0 : 180.0;
    final double paddingBodyTop = isLandscape ? 12.0 : 20.0;
    final double spacingAfterDescription = isLandscape ? 8.0 : 14.0;
    final double spacingAfterMetadata = isLandscape ? 10.0 : 16.0;
    final double paddingPieTop = isLandscape ? 10.0 : 16.0;
    final double paddingPieBottom = isLandscape ? 12.0 : 20.0;

    return Container(
      margin: EdgeInsets.only(bottom: isLandscape ? 10 : 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.black.withOpacity(0.06), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Sección de Imagen con badges flotantes
          Stack(
            children: [
              GestureDetector(
                onTap: _verImagenCompleta,
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(17)),
                  child: SizedBox(
                    height: imageHeight,
                    width: double.infinity,
                    child: _buildImageWidget(
                      s.imagenUrl,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
              // Badges flotantes arriba a la izquierda (Eco, Garantía)
              Positioned(
                top: 12,
                left: 12,
                child: Row(
                  children: [
                    if (s.ecologico) ...[
                      _buildMiniBadge(
                        icon: Icons.eco_rounded,
                        text: 'Eco',
                        color: const Color(0xFF2E7D32),
                      ),
                      const SizedBox(width: 6),
                    ],
                    if (s.garantia)
                      _buildMiniBadge(
                        icon: Icons.shield_rounded,
                        text: 'Garantía',
                        color: const Color(0xFF1565C0),
                      ),
                  ],
                ),
              ),
              // Badge de Popular arriba a la derecha (condicional)
              if (s.popular)
                Positioned(
                  top: 12,
                  right: 12,
                  child: _buildPopularBadge(),
                ),
            ],
          ),
          
          // Cuerpo de la tarjeta
          Padding(
            padding: EdgeInsets.fromLTRB(20, paddingBodyTop, 20, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s.nombre,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF111111),
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  s.descripcion,
                  maxLines: isLandscape ? 2 : 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13.5,
                    color: Color(0xFF666666),
                    height: 1.6,
                  ),
                ),
                SizedBox(height: spacingAfterDescription),
                // Fila de metadatos (Calificación y Tags)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, color: Color(0xFFFFC107), size: 16),
                        const SizedBox(width: 4),
                        Text(
                          s.rating != null ? s.rating!.toStringAsFixed(1) : '4.8',
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF555555),
                          ),
                        ),
                        const SizedBox(width: 2),
                        const Text(
                          '(1.2k)',
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 12,
                            color: Color(0xFFBBBBBB),
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        if (s.ecologico) ...[
                          _buildTag('Eco', const Color(0xFF2E7D32), const Color(0xFFE8F5E9)),
                          const SizedBox(width: 5),
                        ],
                        if (s.garantia)
                          _buildTag('Garantía', const Color(0xFF1565C0), const Color(0xFFE3F2FD)),
                      ],
                    ),
                  ],
                ),
                SizedBox(height: spacingAfterMetadata),
              ],
            ),
          ),
          
          const Divider(color: Color(0xFFF0F0F0), height: 1),
          
          // Pie de la tarjeta (Precio y Botón CTA)
          Padding(
            padding: EdgeInsets.fromLTRB(20, paddingPieTop, 20, paddingPieBottom),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    const Text(
                      'DESDE ',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF999999),
                        letterSpacing: 0.5,
                      ),
                    ),
                    Text(
                      _formatearMoneda(s.precio),
                      style: const TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1E3A8A),
                        height: 1.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                // Botón Solicitar / Añadir al carrito
                Container(
                  width: double.infinity,
                  height: 46,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: _added
                          ? [const Color(0xFF2E7D32), const Color(0xFF4CAF50)]
                          : [const Color(0xFF1E3A8A), const Color(0xFF1A56FF)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: (_added ? const Color(0xFF2E7D32) : const Color(0xFF1E3A8A)).withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ElevatedButton.icon(
                    onPressed: _isAdding ? null : _handleAgregar,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    icon: Icon(_added ? Icons.check : Icons.add_shopping_cart_rounded, size: 16),
                    label: Text(
                      _isAdding ? 'Agregando...' : _added ? '¡Agregado!' : 'Agregar',
                      style: const TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// HOJA INFERIOR: CARRITO — equivalente a CartModal
// =============================================================================
class _CartSheet extends StatefulWidget {
  final List<CarritoItem> carrito;
  final double total;
  final void Function(int servicioId, int nuevaCantidad) onActualizarCantidad;
  final VoidCallback onFinalizarCompra;
  final VoidCallback onGuardarCotizacionRapida;

  const _CartSheet({
    required this.carrito,
    required this.total,
    required this.onActualizarCantidad,
    required this.onFinalizarCompra,
    required this.onGuardarCotizacionRapida,
  });

  @override
  State<_CartSheet> createState() => _CartSheetState();
}

class _CartSheetState extends State<_CartSheet> {
  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
                child: Row(
                  children: [
                    const Text('🛒 Mi Cotización', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const Spacer(),
                    IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: widget.carrito.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('🛒', style: TextStyle(fontSize: 44)),
                            const SizedBox(height: 10),
                            const Text('No hay servicios en tu cotización', style: TextStyle(color: Color(0xFF999999))),
                          ],
                        ),
                      )
                    : ListView.separated(
                        controller: scrollController,
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        itemCount: widget.carrito.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (context, i) {
                          final item = widget.carrito[i];
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: _buildImageWidget(
                                    item.servicio.imagenUrl,
                                    width: 56,
                                    height: 56,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item.servicio.nombre, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                                      Text('${_formatearMoneda(item.servicio.precio)} c/u', style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.w700, fontSize: 12.5)),
                                    ],
                                  ),
                                ),
                                Row(
                                  children: [
                                    _qtyButton('−', () => setState(() => widget.onActualizarCantidad(item.servicio.id, item.cantidad - 1))),
                                    SizedBox(width: 26, child: Text(item.cantidad.toString(), textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.w600))),
                                    _qtyButton('+', () => setState(() => widget.onActualizarCantidad(item.servicio.id, item.cantidad + 1)), filled: true),
                                  ],
                                ),
                                const SizedBox(width: 10),
                                SizedBox(width: 74, child: Text(_formatearMoneda(item.subtotal), textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13))),
                              ],
                            ),
                          );
                        },
                      ),
              ),
              if (widget.carrito.isNotEmpty)
                Container(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
                  decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFFEEEEEE)))),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                          Text(_formatearMoneda(widget.total), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue)),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                side: const BorderSide(color: AppTheme.primaryBlue),
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              ),
                              onPressed: widget.onGuardarCotizacionRapida,
                              child: const Text('💾 Guardar', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.primaryBlue)),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                              onPressed: widget.onFinalizarCompra,
                              child: const Text('Continuar →', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: Colors.white)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _qtyButton(String label, VoidCallback onTap, {bool filled = false}) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 26,
        height: 26,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: filled ? AppTheme.primaryBlue : const Color(0xFFF5F5F5),
          border: filled ? null : Border.all(color: const Color(0xFFDDDDDD)),
        ),
        child: Text(label, style: TextStyle(color: filled ? Colors.white : Colors.black, fontWeight: FontWeight.w700, fontSize: 15)),
      ),
    );
  }
}

// =============================================================================
// DIÁLOGO: CONFIRMACIÓN MULTI-ETAPA — 4 stages igual que ConfirmationModal.jsx
// Stage 0: Tamaño + Cantidad por ítem
// Stage 1: Fecha, Hora, Dirección, Ciudad, Teléfono, Observaciones
// Stage 2: Resumen final
// Stage 3: Éxito con ID Reserva + Empleado asignado
// =============================================================================
class _ConfirmationDialog extends StatefulWidget {
  final List<CarritoItem> carrito;
  final double total;
  final int? userId;
  final Future<void> Function() onConfirmarPedido;

  const _ConfirmationDialog({
    required this.carrito,
    required this.total,
    required this.onConfirmarPedido,
    this.userId,
  });

  @override
  State<_ConfirmationDialog> createState() => _ConfirmationDialogState();
}

class _ConfirmationDialogState extends State<_ConfirmationDialog> {
  int _stage = 0;

  // Stage 0 — tamaños seleccionados por servicio
  final Map<int, String> _tamanos = {};
  // Stage 1 — fecha/hora/datos de servicio
  DateTime? _fecha;
  String? _horario;
  final _ctrlDireccion    = TextEditingController();
  final _ctrlCiudad       = TextEditingController();
  final _ctrlTelefono     = TextEditingController();
  final _ctrlObservaciones = TextEditingController();
  // Stage 3 — resultado reserva
  String? _pedidoId;
  String? _empleadoAsignado;
  String _errorGuardar = '';
  bool   _confirmando  = false;
  bool   _fueGuardadaLocalmente = false;

  @override
  void dispose() {
    _ctrlDireccion.dispose();
    _ctrlCiudad.dispose();
    _ctrlTelefono.dispose();
    _ctrlObservaciones.dispose();
    super.dispose();
  }

  String get _titulo {
    switch (_stage) {
      case 0:  return '📋 Selecciona los detalles';
      case 1:  return '📅 Datos del servicio';
      case 2:  return '✅ Confirmar pedido';
      default: return '🎉 ¡Pedido confirmado!';
    }
  }

  // ── Avanzar / validar ───────────────────────────────────────────────────────
  void _continuar() {
    if (_stage == 0) {
      // Validar que todos los ítems tengan tamaño seleccionado
      final falta = widget.carrito.any(
        (c) => c.servicio.tamanos.isNotEmpty && !_tamanos.containsKey(c.servicio.id),
      );
      if (falta) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Por favor selecciona el tamaño de todos los servicios')),
        );
        return;
      }
    }
    if (_stage == 1) {
      if (_ctrlDireccion.text.trim().isEmpty || _fecha == null || _horario == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Completa la dirección, fecha y horario')),
        );
        return;
      }
    }
    setState(() {
      _errorGuardar = '';
      _stage++;
    });
  }

  Future<void> _elegirFecha() async {
    final hoy = DateTime.now();
    final sel = await showDatePicker(
      context: context,
      initialDate: hoy,
      firstDate: hoy,
      lastDate: hoy.add(const Duration(days: 90)),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: AppTheme.primaryBlue),
        ),
        child: child!,
      ),
    );
    if (sel != null) setState(() => _fecha = sel);
  }

  // ── Llamada real a la API — igual que handleConfirmar en CotizacionesCliente.jsx ──
  Future<void> _confirmar() async {
    setState(() { _confirmando = true; _errorGuardar = ''; _fueGuardadaLocalmente = false; });
    try {
      final token = await SecureStorageService().read('token') ?? '';

      // 1. Crear reserva
      final infoAdicional =
          'Dirección: ${_ctrlDireccion.text.trim()}'
          '${_ctrlCiudad.text.trim().isNotEmpty ? ', ${_ctrlCiudad.text.trim()}' : ''}'
          '. Tel: ${_ctrlTelefono.text.trim()}';

      final serviciosList = widget.carrito.map((c) => {
        'Id_Servicio': c.servicio.id,
        'cantidad': c.cantidad,
        'tamano': _tamanos[c.servicio.id] ?? 'Estándar',
      }).toList();

      final fechaStr = '${_fecha!.year}-${_fecha!.month.toString().padLeft(2,'0')}-${_fecha!.day.toString().padLeft(2,'0')}';

      final resReserva = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/reservas'),
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'Id_Usuario':            widget.userId,
          'fecha':                 fechaStr,
          'Hora':                  _horario,
          'Informacion_adicional': infoAdicional,
          'observaciones':         _ctrlObservaciones.text.trim().isEmpty
                                       ? null
                                       : _ctrlObservaciones.text.trim(),
          'servicios':             serviciosList,
        }),
      );

      final bodyReserva = json.decode(resReserva.body) as Map<String, dynamic>;
      if (resReserva.statusCode != 200 && resReserva.statusCode != 201) {
        throw Exception(bodyReserva['message'] ?? 'Error al crear reserva');
      }
      final reservaData = bodyReserva['data'] as Map<String, dynamic>? ?? {};

      // 2. Guardar cotizaciones individuales
      if (widget.userId != null) {
        for (final c in widget.carrito) {
          try {
            await http.post(
              Uri.parse('${ApiConstants.baseUrl}/cotizaciones'),
              headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                if (token.isNotEmpty) 'Authorization': 'Bearer $token',
              },
              body: json.encode({
                'Id_usuario':      widget.userId,
                'Id_servicio':     c.servicio.id,
                'Precio_cotizado': c.subtotal,
                'Cantidad':        c.cantidad,
                'Tamaño':          _tamanos[c.servicio.id] ?? 'Estándar',
              }),
            );
          } catch (_) {}
        }
      }

      // 3. Limpiar carrito local y avanzar a éxito
      await widget.onConfirmarPedido();
      setState(() {
        _pedidoId        = 'PED-${reservaData['ID_Reserva'] ?? reservaData['id'] ?? '—'}';
        _empleadoAsignado = reservaData['empleado_asignado']?.toString();
        _confirmando     = false;
        _stage           = 3;
      });
    } catch (e) {
      setState(() {
        final errorMsg = e.toString().replaceAll('Exception: ', '');
        _errorGuardar = errorMsg.isNotEmpty ? errorMsg : 'Hubo un error al guardar tu pedido. Intenta de nuevo.';
        _confirmando  = false;
      });
    }
  }

  Future<void> _guardarCotizacionLocal() async {
    setState(() { _confirmando = true; _errorGuardar = ''; _fueGuardadaLocalmente = true; });
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<String> currentCotizaciones = prefs.getStringList('mis_cotizaciones') ?? [];
      
      final fechaStr = '${_fecha!.year}-${_fecha!.month.toString().padLeft(2,'0')}-${_fecha!.day.toString().padLeft(2,'0')}';
      
      final nuevaCotizacion = {
        'ID_Reserva': DateTime.now().millisecondsSinceEpoch.toString().substring(5),
        'fecha': fechaStr,
        'Hora': _horario,
        'Estado': 'Guardado Local',
        'creadoEn': DateTime.now().toIso8601String(),
        'expiraEn': DateTime.now().add(const Duration(hours: 48)).toIso8601String(),
        'servicios': widget.carrito.map((c) => {
          'Id_Servicio': c.servicio.id,
          'Nombre_Servicio': c.servicio.nombre,
          'cantidad': c.cantidad,
          'Precio': c.subtotal,
          'tamano': _tamanos[c.servicio.id] ?? 'Estándar',
        }).toList(),
      };

      currentCotizaciones.add(jsonEncode(nuevaCotizacion));
      await prefs.setStringList('mis_cotizaciones', currentCotizaciones);

      await widget.onConfirmarPedido();
      
      setState(() {
        _pedidoId = 'COT-${nuevaCotizacion['ID_Reserva']}';
        _stage = 3;
        _confirmando = false;
      });
    } catch (e) {
      setState(() {
        _errorGuardar = 'Hubo un error al guardar tu cotización. Intenta de nuevo.';
        _confirmando = false;
      });
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 32),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: 520,
          maxHeight: MediaQuery.of(context).size.height * 0.85,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Header ──
            _buildDialogHeader(),
            // ── Indicador de etapas ──
            if (_stage < 3) _buildStepIndicator(),
            const Divider(height: 1),
            // ── Contenido ──
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: _buildStageContent(),
              ),
            ),
            const Divider(height: 1),
            // ── Footer de acciones ──
            _buildDialogFooter(),
          ],
        ),
      ),
    );
  }

  Widget _buildDialogHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 18, 12, 10),
      child: Row(
        children: [
          Expanded(
            child: Text(
              _titulo,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
            ),
          ),
          if (_stage < 3)
            IconButton(
              icon: const Icon(Icons.close, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
        ],
      ),
    );
  }

  Widget _buildStepIndicator() {
    const steps = ['Detalles', 'Datos', 'Confirmar'];
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 12),
      child: Row(
        children: List.generate(steps.length, (i) {
          final active   = i == _stage;
          final done     = i < _stage;
          return Expanded(
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: done
                              ? AppTheme.successGreen
                              : active
                                  ? AppTheme.primaryBlue
                                  : const Color(0xFFEEEEEE),
                        ),
                        child: Center(
                          child: done
                              ? const Icon(Icons.check, color: Colors.white, size: 14)
                              : Text(
                                  '${i + 1}',
                                  style: TextStyle(
                                    color: active ? Colors.white : const Color(0xFF999999),
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        steps[i],
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: active ? FontWeight.w700 : FontWeight.w400,
                          color: active ? AppTheme.primaryBlue : const Color(0xFF999999),
                        ),
                      ),
                    ],
                  ),
                ),
                if (i < steps.length - 1)
                  Expanded(
                    child: Container(
                      height: 2,
                      margin: const EdgeInsets.only(bottom: 20),
                      color: i < _stage ? AppTheme.primaryBlue : const Color(0xFFEEEEEE),
                    ),
                  ),
              ],
            ),
          );
        }),
      ),
    );
  }

  Widget _buildDialogFooter() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      child: Wrap(
        alignment: WrapAlignment.end,
        spacing: 10,
        runSpacing: 10,
        children: [
          if (_stage > 0 && _stage < 3)
            OutlinedButton(
              onPressed: () => setState(() => _stage--),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFDDDDDD)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              ),
              child: const Text('← Volver', style: TextStyle(color: Color(0xFF555555))),
            ),
          if (_stage < 2)
            ElevatedButton(
              onPressed: _continuar,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              ),
              child: Text(
                _stage == 0 ? 'Agendar servicio →' : 'Continuar →',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ),
          if (_stage == 2) ...[
            OutlinedButton(
              onPressed: _confirmando ? null : _guardarCotizacionLocal,
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.primaryBlue),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              ),
              child: const Text('💾 Guardar cotización', style: TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.w700)),
            ),
            ElevatedButton(
              onPressed: _confirmando ? null : _confirmar,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF223BFF),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
              ),
              child: _confirmando
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                    )
                  : const Text('✓ Agendar servicio', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
          ],
          if (_stage == 3)
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
              ),
              child: const Text('¡Listo!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
            ),
        ],
      ),
    );
  }

  // ── Contenido por etapa ───────────────────────────────────────────────────
  Widget _buildStageContent() {
    switch (_stage) {
      // ── Stage 0: Tamaño + cantidad ────────────────────────────────────────
      case 0:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Completa el tamaño de cada servicio para generar la cotización',
              style: TextStyle(color: Color(0xFF888888), fontSize: 13),
            ),
            const SizedBox(height: 16),
            ...widget.carrito.map((item) => _buildItemDetalle(item)),
          ],
        );

      // ── Stage 1: Fecha/Hora + datos del domicilio ─────────────────────────
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_errorGuardar.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF0F0),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFFFCCCC)),
                ),
                child: Text('⚠️ $_errorGuardar', style: const TextStyle(color: Color(0xFFCC0000), fontSize: 13)),
              ),
            // Dirección
            _buildLabel('Dirección *'),
            _buildTextField(_ctrlDireccion, 'Calle 123 #45-67'),
            const SizedBox(height: 14),
            // Ciudad + Teléfono en fila
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Ciudad'),
                      _buildTextField(_ctrlCiudad, 'Bogotá'),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('Teléfono'),
                      _buildTextField(_ctrlTelefono, '300 123 4567', type: TextInputType.phone),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            // Fecha
            _buildLabel('Fecha del servicio *'),
            const SizedBox(height: 6),
            InkWell(
              onTap: _elegirFecha,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  border: Border.all(
                    color: _fecha != null ? AppTheme.primaryBlue : const Color(0xFFE0E0E0),
                    width: _fecha != null ? 1.8 : 1.5,
                  ),
                  borderRadius: BorderRadius.circular(10),
                  color: _fecha != null ? const Color(0xFFF0F4FF) : Colors.white,
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 16,
                      color: _fecha != null ? AppTheme.primaryBlue : const Color(0xFF999999),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      _fecha != null ? _formatearFechaLarga(_fecha!) : 'Seleccionar fecha',
                      style: TextStyle(
                        color: _fecha != null ? const Color(0xFF111111) : const Color(0xFF999999),
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),
            // Hora
            _buildLabel('Hora preferida *'),
            const SizedBox(height: 6),
            DropdownButtonFormField<String>(
              value: _horario,
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 1.5),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 1.5),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppTheme.primaryBlue, width: 1.8),
                ),
              ),
              hint: const Text('Seleccionar'),
              items: _horariosDisponibles.where((h) {
                if (_fecha == null) return true;
                final hoy = DateTime.now();
                if (_fecha!.year == hoy.year && _fecha!.month == hoy.month && _fecha!.day == hoy.day) {
                  // Si es hoy, solo mostrar horas que no han pasado (dando 1 hora de margen)
                  final horaInt = int.parse(h.split(':')[0]);
                  return horaInt > hoy.hour;
                }
                return true;
              }).map((h) {
                final hora = int.tryParse(h.split(':').first) ?? 0;
                return DropdownMenuItem(
                  value: h,
                  child: Text('$h ${hora < 12 ? 'AM' : 'PM'}'),
                );
              }).toList(),
              onChanged: (v) => setState(() => _horario = v),
            ),
            const SizedBox(height: 14),
            // Observaciones
            _buildLabel('Observaciones (opcional)'),
            const SizedBox(height: 6),
            TextField(
              controller: _ctrlObservaciones,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Mascotas, instrucciones especiales, acceso…',
                hintStyle: const TextStyle(color: Color(0xFFAAAAAA), fontSize: 13),
                contentPadding: const EdgeInsets.all(14),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 1.5),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 1.5),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppTheme.primaryBlue, width: 1.8),
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Total
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F4FF),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total estimado', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  Text(
                    _formatearMoneda(widget.total),
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppTheme.primaryBlue),
                  ),
                ],
              ),
            ),
          ],
        );

      // ── Stage 2: Resumen final antes de confirmar ─────────────────────────
      case 2:
        return Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: const Color(0xFFF8F9FF),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE0E6FF)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Detalles del pedido',
                style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF223BFF), fontSize: 15),
              ),
              const SizedBox(height: 14),
              ...widget.carrito.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  '• ${item.servicio.nombre} × ${item.cantidad}'
                  '${_tamanos.containsKey(item.servicio.id) ? ' [${_tamanos[item.servicio.id]}]' : ''}'
                  ' — ${_formatearMoneda(item.subtotal)}',
                  style: const TextStyle(fontSize: 13),
                ),
              )),
              const Divider(height: 20),
              _buildResumenRow(Icons.location_on_outlined, 'Dirección', _ctrlDireccion.text.trim()),
              if (_ctrlCiudad.text.trim().isNotEmpty)
                _buildResumenRow(Icons.location_city_outlined, 'Ciudad', _ctrlCiudad.text.trim()),
              if (_ctrlTelefono.text.trim().isNotEmpty)
                _buildResumenRow(Icons.phone_outlined, 'Teléfono', _ctrlTelefono.text.trim()),
              _buildResumenRow(
                Icons.calendar_today_outlined,
                'Fecha',
                _fecha != null ? _formatearFechaLarga(_fecha!) : '—',
              ),
              _buildResumenRow(Icons.access_time_outlined, 'Hora', _horario ?? '—'),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF1A4BFF), Color(0xFF7C3AED)]),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15, color: Colors.white)),
                    Text(
                      _formatearMoneda(widget.total),
                      style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: Colors.white),
                    ),
                  ],
                ),
              ),
              if (_errorGuardar.isNotEmpty) ...
                [
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF0F0),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFFFCCCC)),
                    ),
                    child: Text('⚠️ $_errorGuardar', style: const TextStyle(color: Color(0xFFCC0000), fontSize: 13)),
                  ),
                ],
            ],
          ),
        );

      // ── Stage 3: Éxito ────────────────────────────────────────────────────
      default:
        return Column(
          children: [
            const SizedBox(height: 8),
            const Text('🎉', style: TextStyle(fontSize: 60)),
            const SizedBox(height: 14),
            const Text(
              '¡Pedido confirmado!',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Color(0xFF223BFF)),
            ),
            if (_pedidoId != null) ...
              [
                const SizedBox(height: 6),
                Text('ID: $_pedidoId', style: const TextStyle(fontSize: 13, color: Color(0xFF666666))),
              ],
            const SizedBox(height: 20),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFFF8F9FF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE0E6FF)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildResumenRow(
                    Icons.calendar_today,
                    'Fecha',
                    _fecha != null ? _formatearFechaLarga(_fecha!) : '—',
                  ),
                  _buildResumenRow(Icons.access_time, 'Hora', _horario ?? '—'),
                  _buildResumenRow(Icons.location_on, 'Dirección', _ctrlDireccion.text.trim()),
                  if (_empleadoAsignado != null && _empleadoAsignado!.isNotEmpty)
                    _buildResumenRow(Icons.person_outline, 'Técnico', _empleadoAsignado!),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text(
              _fueGuardadaLocalmente 
                ? 'Tu cotización ha sido guardada localmente por 48 horas.'
                : 'Te contactaremos pronto para confirmar los detalles del servicio.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: Color(0xFF888888), fontSize: 13),
            ),
          ],
        );
    }
  }

  // ── Helpers de UI ─────────────────────────────────────────────────────────
  Widget _buildItemDetalle(CarritoItem item) {
    final s = item.servicio;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEEEEEE)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${s.nombre} (×${item.cantidad})',
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
          ),
          const SizedBox(height: 10),
          // Selector de tamaño
          if (s.tamanos.isNotEmpty) ...
            [
              const Text('Tamaño *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF555555))),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _tamanos[s.id],
                decoration: InputDecoration(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  isDense: true,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: Color(0xFFE0E0E0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide: const BorderSide(color: AppTheme.primaryBlue, width: 1.8),
                  ),
                ),
                hint: const Text('Seleccionar tamaño', style: TextStyle(fontSize: 13)),
                items: s.tamanos.map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (v) => setState(() => _tamanos[s.id] = v!),
              ),
            ],
          const SizedBox(height: 8),
          // Subtotal
          Text(
            _formatearMoneda(item.subtotal),
            style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.primaryBlue, fontSize: 15),
          ),
        ],
      ),
    );
  }

  Widget _buildLabel(String label) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF333333))),
  );

  Widget _buildTextField(
    TextEditingController ctrl,
    String hint, {
    TextInputType type = TextInputType.text,
  }) =>
      TextField(
        controller: ctrl,
        keyboardType: type,
        style: const TextStyle(fontSize: 14),
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Color(0xFFAAAAAA), fontSize: 13),
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 1.5),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 1.5),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: AppTheme.primaryBlue, width: 1.8),
          ),
        ),
      );

  Widget _buildResumenRow(IconData icon, String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: AppTheme.primaryBlue),
        const SizedBox(width: 8),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: const TextStyle(color: Color(0xFF333333), fontSize: 13),
              children: [
                TextSpan(text: '$label: ', style: const TextStyle(fontWeight: FontWeight.w600)),
                TextSpan(text: value),
              ],
            ),
          ),
        ),
      ],
    ),
  );
}