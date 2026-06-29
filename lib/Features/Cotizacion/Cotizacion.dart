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
  return '${ApiConstants.baseUrl}$path';
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
      final res = await http.post(
        Uri.parse('${ApiConstants.baseUrl}/cotizaciones/sincronizar'),
        headers: {'Content-Type': 'application/json'},
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
      final res = await http.get(Uri.parse('${ApiConstants.baseUrl}/cotizaciones/servicios'));
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
      ),
    );
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
        onConfirmarPedido: () async {
          await CotizacionStorage.sincronizarConBD(
  auth.user?.idUsuario.toString() ?? '',
);
          await _limpiarCarrito();
        },
      ),
    );
  }

  void _mostrarAuthPrompt() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(gradient: AppTheme.buttonGradient, borderRadius: BorderRadius.circular(14)),
              child: const Center(child: Text('FW', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 20))),
            ),
            const SizedBox(height: 12),
            const Text('Inicia sesión para agendar', textAlign: TextAlign.center, style: TextStyle(fontSize: 17)),
          ],
        ),
        content: const Text(
          'Tu cotización se guardará automáticamente cuando ingreses.',
          textAlign: TextAlign.center,
          style: TextStyle(color: AppTheme.greyText),
        ),
        actionsAlignment: MainAxisAlignment.center,
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue),
            onPressed: () {
              Navigator.pop(ctx);
              if (widget.onGoToLogin != null) {
                widget.onGoToLogin!();
              } else {
                Navigator.pushNamed(context, '/login');
              }
            },
            child: const Text('Iniciar Sesión'),
          ),
        ],
      ),
    );
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: AppTheme.backgroundWhite,
      appBar: AppBar(
        backgroundColor: AppTheme.appBarDark,
        elevation: 0,
        titleSpacing: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: widget.onBackToHome ?? () => Navigator.pushReplacementNamed(context, '/home'),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(gradient: AppTheme.buttonGradient, borderRadius: BorderRadius.circular(6)),
              child: const Center(child: Text('FW', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w800))),
            ),
            const SizedBox(width: 6),
            const Text('Cotización', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
          ],
        ),
        actions: [
          IconButton(
            onPressed: widget.onGoToServicios,
            icon: const Icon(Icons.event_available, size: 20, color: Colors.white70),
            tooltip: 'Agendar',
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(minWidth: 40),
          ),
          if (!auth.isAuthenticated)
            IconButton(
              onPressed: () => widget.onGoToLogin != null ? widget.onGoToLogin!() : Navigator.pushNamed(context, '/login'),
              icon: const Icon(Icons.login, size: 20, color: Colors.white),
              tooltip: 'Entrar',
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(minWidth: 40),
            ),
          const SizedBox(width: 4),
        ],
      ),
      body: Stack(
        children: [
          _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryBlue))
              : Column(
                  children: [
                    if (_tiempoExpira != null && !auth.isAuthenticated) _buildBannerExpira(),
                    if (_syncMsg != null) _buildSyncBanner(),
                    _buildSearchBar(),
                    Expanded(child: _buildGrid()),
                  ],
                ),
          // ── Botón flotante de carrito ──
          Positioned(
            bottom: 20,
            right: 20,
            child: GestureDetector(
              onTap: _abrirCarrito,
              child: Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  gradient: AppTheme.buttonGradient,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: AppTheme.primaryBlue.withOpacity(0.4), blurRadius: 16, offset: const Offset(0, 6))],
                ),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    const Center(child: Text('🛒', style: TextStyle(fontSize: 24))),
                    if (_totalItems > 0)
                      Positioned(
                        top: -4,
                        right: -4,
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: BoxDecoration(color: const Color(0xFFFF3D71), shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                          child: Center(
                            child: Text(_totalItems.toString(), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
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
        style: const TextStyle(fontSize: 12, color: Color(0xFF795548)),
      ),
    );
  }

  Widget _buildSyncBanner() {
    return Container(
      width: double.infinity,
      color: AppTheme.primaryBlue,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Text(_syncMsg!, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12.5, color: Colors.white, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 6),
      child: TextField(
        onChanged: (v) => setState(() => _searchTerm = v),
        decoration: InputDecoration(
          hintText: 'Buscar servicios (lavado muebles, carros...)',
          hintStyle: const TextStyle(color: AppTheme.greyText, fontSize: 13.5),
          suffixIcon: const Icon(Icons.search, color: AppTheme.greyText),
          filled: true,
          fillColor: const Color(0xFFF8FAFF),
          contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 20),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(40), borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(40), borderSide: BorderSide(color: Colors.grey.shade200, width: 1.5)),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(40), borderSide: const BorderSide(color: AppTheme.primaryBlue, width: 1.8)),
        ),
      ),
    );
  }

  Widget _buildGrid() {
    final servicios = _filtrados;

    return RefreshIndicator(
      onRefresh: _cargarServicios,
      child: CustomScrollView(
        slivers: [
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(20, 24, 20, 8),
              child: Column(
                children: [
                  Text('Nuestros Servicios', textAlign: TextAlign.center, style: TextStyle(fontFamily: 'Kanit', fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.darkText, letterSpacing: -0.4)),
                  SizedBox(height: 6),
                  Text('Profesionales certificados · Productos ecológicos · Garantía', textAlign: TextAlign.center, style: TextStyle(fontSize: 11.5, color: Color(0xFF8890AA))),
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
                      Text('No se encontraron servicios que coincidan con "$_searchTerm"', textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFF999999))),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                        onPressed: () => setState(() => _searchTerm = ''),
                        child: const Text('Limpiar búsqueda'),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
              sliver: SliverList(
                delegate: SliverChildBuilderDelegate(
                  (context, i) => Padding(
                    padding: const EdgeInsets.only(bottom: 18),
                    child: _ServiceCard(servicio: servicios[i], onAgregar: () => _agregarAlCarrito(servicios[i])),
                  ),
                  childCount: servicios.length,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

extension _FirstOrNull<T> on Iterable<T> {
  T? get firstOrNull => isEmpty ? null : first;
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
                child: Image.network(
                  _imagenCompleta(widget.servicio.imagenUrl),
                  fit: BoxFit.contain,
                  errorBuilder: (_, __, ___) => const Icon(Icons.image_not_supported, color: Colors.white54, size: 64),
                ),
              ),
            ),
            Positioned(
              top: 40,
              right: 20,
              child: Text('Toca para cerrar', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.servicio;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withOpacity(0.06)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── Imagen + badges ──
          GestureDetector(
            onTap: _verImagenCompleta,
            child: SizedBox(
              height: 150,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(
                    _imagenCompleta(s.imagenUrl),
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(color: const Color(0xFFEFF1FA), child: const Icon(Icons.local_laundry_service, color: AppTheme.primaryBlue, size: 40)),
                  ),
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Row(
                      children: [
                        if (s.ecologico) _miniBadge('🌿 Eco'),
                        if (s.garantia) ...[const SizedBox(width: 5), _miniBadge('✓ Garantía')],
                      ],
                    ),
                  ),
                  if (s.popular)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFFFF9800), Color(0xFFFF6D00)]), borderRadius: BorderRadius.circular(20)),
                        child: const Text('✨ POPULAR', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.4)),
                      ),
                    ),
                ],
              ),
            ),
          ),
          // ── Cuerpo ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(s.nombre, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF111111)), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 4),
                Text(s.descripcion, style: const TextStyle(fontSize: 12, color: Color(0xFF666666), height: 1.4), maxLines: 2, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 8),
                Row(
                  children: [
                    if (s.rating != null) ...[
                      const Text('★', style: TextStyle(color: Color(0xFFFFC107), fontSize: 13)),
                      const SizedBox(width: 3),
                      Text(s.rating!.toStringAsFixed(1), style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                    ],
                    const Spacer(),
                    if (s.ecologico) _tagChip('Eco', const Color(0xFFE8F5E9), const Color(0xFF2E7D32)),
                    if (s.garantia) ...[const SizedBox(width: 4), _tagChip('Garantía', const Color(0xFFE3F2FD), const Color(0xFF1565C0))],
                  ],
                ),
              ],
            ),
          ),
          // ── Footer: precio + botón ──
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    const Text('Desde ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF999999))),
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(colors: [Color(0xFF1A56FF), Color(0xFF7C3AED)]).createShader(bounds),
                      child: Text(_formatearMoneda(s.precio), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isAdding ? null : _handleAgregar,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _added ? const Color(0xFF16A34A) : AppTheme.primaryBlue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 11),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(_added ? Icons.check : Icons.shopping_cart_outlined, size: 16),
                        const SizedBox(width: 6),
                        Text(_isAdding ? 'Agregando...' : _added ? '¡Agregado!' : 'Agregar', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      ],
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

  Widget _miniBadge(String text) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
        decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.white.withOpacity(0.15))),
        child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w600)),
      );

  Widget _tagChip(String text, Color bg, Color fg) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
        child: Text(text, style: TextStyle(color: fg, fontSize: 9, fontWeight: FontWeight.w600)),
      );
}

// =============================================================================
// HOJA INFERIOR: CARRITO — equivalente a CartModal
// =============================================================================
class _CartSheet extends StatefulWidget {
  final List<CarritoItem> carrito;
  final double total;
  final void Function(int servicioId, int nuevaCantidad) onActualizarCantidad;
  final VoidCallback onFinalizarCompra;

  const _CartSheet({
    required this.carrito,
    required this.total,
    required this.onActualizarCantidad,
    required this.onFinalizarCompra,
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
                    ? const Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text('🛒', style: TextStyle(fontSize: 44)),
                            SizedBox(height: 10),
                            Text('No hay servicios en tu cotización', style: TextStyle(color: Color(0xFF999999))),
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
                                  child: Image.network(
                                    _imagenCompleta(item.servicio.imagenUrl),
                                    width: 56,
                                    height: 56,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(width: 56, height: 56, color: const Color(0xFFEFF1FA), child: const Icon(Icons.local_laundry_service, color: AppTheme.primaryBlue)),
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
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                          onPressed: widget.onFinalizarCompra,
                          child: const Text('Continuar con el agendamiento →', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: Colors.white)),
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
// DIÁLOGO: CONFIRMACIÓN MULTI-ETAPA — equivalente a ConfirmationModal
// =============================================================================
class _ConfirmationDialog extends StatefulWidget {
  final List<CarritoItem> carrito;
  final double total;
  final Future<void> Function() onConfirmarPedido;

  const _ConfirmationDialog({required this.carrito, required this.total, required this.onConfirmarPedido});

  @override
  State<_ConfirmationDialog> createState() => _ConfirmationDialogState();
}

class _ConfirmationDialogState extends State<_ConfirmationDialog> {
  int _stage = 0;
  DateTime? _fecha;
  String? _horario;
  bool _confirmando = false;

  String get _titulo {
    switch (_stage) {
      case 0:
        return '📋 Resumen de Cotización';
      case 1:
        return '📅 Selecciona Fecha y Hora';
      case 2:
        return '✅ Confirmar Pedido';
      default:
        return '🎉 ¡Pedido Confirmado!';
    }
  }

  Future<void> _elegirFecha() async {
    final hoy = DateTime.now();
    final seleccionada = await showDatePicker(
      context: context,
      initialDate: hoy,
      firstDate: hoy,
      lastDate: hoy.add(const Duration(days: 90)),
    );
    if (seleccionada != null) setState(() => _fecha = seleccionada);
  }

  void _continuar() {
    if (_stage == 1 && (_fecha == null || _horario == null)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor selecciona fecha y horario')));
      return;
    }
    setState(() => _stage++);
  }

  Future<void> _confirmar() async {
    setState(() => _confirmando = true);
    await widget.onConfirmarPedido();
    setState(() {
      _confirmando = false;
      _stage = 3;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 560),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 18, 12, 12),
              child: Row(
                children: [
                  Expanded(child: Text(_titulo, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700))),
                  if (_stage < 3) IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(child: Padding(padding: const EdgeInsets.all(20), child: _buildStageContent())),
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (_stage > 0 && _stage < 3)
                    TextButton(onPressed: () => setState(() => _stage--), child: const Text('← Volver')),
                  const SizedBox(width: 8),
                  if (_stage < 2)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue),
                      onPressed: _continuar,
                      child: const Text('Continuar →', style: TextStyle(color: Colors.white)),
                    ),
                  if (_stage == 2)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF223BFF)),
                      onPressed: _confirmando ? null : _confirmar,
                      child: _confirmando
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('✅ Confirmar Pedido', style: TextStyle(color: Colors.white)),
                    ),
                  if (_stage == 3)
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue),
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Cerrar', style: TextStyle(color: Colors.white)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStageContent() {
    switch (_stage) {
      case 0:
        return SingleChildScrollView(
          child: Column(
            children: [
              ...widget.carrito.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text('${item.servicio.nombre} × ${item.cantidad}')),
                        Text(_formatearMoneda(item.subtotal), style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.primaryBlue)),
                      ],
                    ),
                  )),
              const Divider(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                  Text(_formatearMoneda(widget.total), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue)),
                ],
              ),
            ],
          ),
        );
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Fecha del servicio *', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            InkWell(
              onTap: _elegirFecha,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE0E0E0), width: 2), borderRadius: BorderRadius.circular(10)),
                child: Text(_fecha != null ? _formatearFechaLarga(_fecha!) : 'Seleccionar fecha', style: TextStyle(color: _fecha != null ? Colors.black : const Color(0xFF999999))),
              ),
            ),
            const SizedBox(height: 18),
            const Text('Horario *', style: TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: _horario,
              decoration: InputDecoration(
                contentPadding: const EdgeInsets.all(14),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFFE0E0E0), width: 2)),
              ),
              hint: const Text('Seleccionar horario'),
              items: _horariosDisponibles.map((h) => DropdownMenuItem(value: h, child: Text(h))).toList(),
              onChanged: (v) => setState(() => _horario = v),
            ),
          ],
        );
      case 2:
        return SingleChildScrollView(
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: const Color(0xFFF8F9FF), borderRadius: BorderRadius.circular(12)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Detalles del pedido', style: TextStyle(fontWeight: FontWeight.w700, color: Color(0xFF223BFF), fontSize: 15)),
                const SizedBox(height: 14),
                ...widget.carrito.map((item) => Text('• ${item.servicio.nombre} × ${item.cantidad} — ${_formatearMoneda(item.subtotal)}')),
                const SizedBox(height: 12),
                Text('Fecha: ${_fecha != null ? _formatearFechaLarga(_fecha!) : '—'}', style: const TextStyle(fontWeight: FontWeight.w600)),
                Text('Horario: ${_horario ?? '—'}', style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 10),
                Text('Total: ${_formatearMoneda(widget.total)}', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue)),
              ],
            ),
          ),
        );
      default:
        return const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('🎉', style: TextStyle(fontSize: 56)),
              SizedBox(height: 14),
              Text('¡Cotización guardada!', style: TextStyle(color: Color(0xFF223BFF), fontWeight: FontWeight.w700, fontSize: 17)),
              SizedBox(height: 8),
              Text('Te contactaremos pronto para confirmar los detalles del servicio.', textAlign: TextAlign.center, style: TextStyle(color: Color(0xFF666666))),
            ],
          ),
        );
    }
  }
}