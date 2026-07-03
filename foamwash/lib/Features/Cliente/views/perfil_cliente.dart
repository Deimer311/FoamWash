// =============================================================================
// ARCHIVO  : perfil_cliente.dart
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Replica el diseño de PerfilCliente.jsx y usa el header premium unificado.
// =============================================================================

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Autenticacion/login_screen.dart';
import 'package:foamwash/Features/Cart/providers/cart_provider.dart';

// =============================================================================
// MODELO DE DATOS
// =============================================================================
class ClientePerfil {
  final String? nombre;
  final String? tipoDocumento;
  final String? numeroDocumento;
  final String? correo;
  final String? telefono;
  final String? direccion;
  final String? fotoPerfil;
  final DateTime? miembroDesde;
  final DateTime? ultimoAcceso;
  final int totalReservas;
  final int completadas;
  final int pendientes;
  final String calificacionPromedio;

  ClientePerfil({
    this.nombre,
    this.tipoDocumento,
    this.numeroDocumento,
    this.correo,
    this.telefono,
    this.direccion,
    this.fotoPerfil,
    this.miembroDesde,
    this.ultimoAcceso,
    this.totalReservas = 0,
    this.completadas = 0,
    this.pendientes = 0,
    this.calificacionPromedio = '—',
  });

  factory ClientePerfil.fromJson(Map<String, dynamic> json) {
    DateTime? parseFecha(dynamic v) {
      if (v == null) return null;
      return DateTime.tryParse(v.toString());
    }

    final stats = json['stats'] is Map ? json['stats'] : {};

    return ClientePerfil(
      nombre: json['Nombre']?.toString(),
      tipoDocumento: json['tipo_de_documento']?['nombre_del_documento']?.toString(),
      numeroDocumento: json['N_Documento']?.toString(),
      correo: json['Correo']?.toString(),
      telefono: json['Telefono']?.toString(),
      direccion: json['Direccion']?.toString(),
      fotoPerfil: json['foto_perfil']?.toString(),
      miembroDesde: parseFecha(json['created_at'] ?? json['fecha_registro']),
      ultimoAcceso: parseFecha(json['ultimo_acceso'] ?? json['last_login']),
      totalReservas: stats['total_reservas'] ?? 0,
      completadas: stats['completadas'] ?? 0,
      pendientes: stats['pendientes'] ?? 0,
      calificacionPromedio: stats['calificacion_promedio']?.toString() ?? '—',
    );
  }
}

class ActividadItem {
  final String icono;
  final String titulo;
  final String fecha;
  final String estado; // 'completado' | 'pendiente' | 'cancelado'

  ActividadItem({
    required this.icono,
    required this.titulo,
    required this.fecha,
    required this.estado,
  });
}

// =============================================================================
// PANTALLA PRINCIPAL
// =============================================================================
class PerfilClienteScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;
  final Future<void> Function()? onEditarPerfil;
  final VoidCallback? onLogout;
  final VoidCallback? onBackToHome;
  final VoidCallback? onCotizacion;

  const PerfilClienteScreen({
    super.key,
    required this.apiBaseUrl,
    required this.userId,
    this.onEditarPerfil,
    this.onLogout,
    this.onBackToHome,
    this.onCotizacion,
  });

  @override
  State<PerfilClienteScreen> createState() => _PerfilClienteScreenState();
}

class _PerfilClienteScreenState extends State<PerfilClienteScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  ClientePerfil? _perfil;
  List<ActividadItem> _actividad = [];
  bool _isLoading = true;
  String? _error;

  final List<bool> _visible = [false, false, false];

  @override
  void initState() {
    super.initState();
    _cargarPerfil();
  }

  Future<void> _cargarPerfil() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final secureStorage = SecureStorageService();
      final prefs = await SharedPreferences.getInstance();
      final token = await secureStorage.read('token') ?? '';

      String safeUserId = widget.userId;
      if (safeUserId.isEmpty) {
        safeUserId = (prefs.getInt('userId') ?? 0).toString();
      }

      if (safeUserId == '0' || safeUserId.isEmpty) {
        throw Exception('ID de usuario no disponible para cargar el perfil.');
      }

      final res = await http.get(
        Uri.parse('${widget.apiBaseUrl}/api/usuarios/$safeUserId'),
        headers: {
          'Authorization': 'Bearer $token',
          'ngrok-skip-browser-warning': 'true',
        },
      );
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true) {
          _perfil = ClientePerfil.fromJson(body['data']);
          final data = body['data'];
          if (data != null && data['reservasComoCliente'] != null) {
            final list = data['reservasComoCliente'] as List;
            _actividad = list.map((item) {
              final servicios = item['servicios'] as List? ?? [];
              final nombres = servicios.map((s) => s['Nombre_Servicio']).join(', ');
              final fecha = item['fecha'] != null 
                  ? DateTime.parse(item['fecha']).toIso8601String().split('T')[0]
                  : 'Sin fecha';
              final estado = item['Estado']?.toString().toLowerCase() ?? 'pendiente';
              return ActividadItem(
                icono: '🧼',
                titulo: nombres.isEmpty ? 'Servicio' : nombres,
                fecha: fecha,
                estado: estado,
              );
            }).toList();
          }
        }
      }
    } catch (e) {
      _error = 'No se pudo cargar el perfil. Intenta de nuevo.';
      print('❌ Error al cargar perfil cliente: $e');
    } finally {
      setState(() => _isLoading = false);
      fwAnimarEntrada(_visible, setState, mounted: () => mounted);
    }
  }

  void _showConfirmLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          '¿Cerrar sesión?',
          style: TextStyle(color: Colors.white, fontFamily: 'Kanit', fontWeight: FontWeight.bold),
        ),
        content: const Text(
          '¿Está seguro de que desea cerrar su sesión actual?',
          style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'Kanit'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white54, fontFamily: 'Kanit')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(context); // Cerrar diálogo
              if (widget.onLogout != null) {
                widget.onLogout!.call();
              } else {
                await context.read<AuthProvider>().logout();
                if (mounted) {
                  Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                }
              }
            },
            child: const Text('Cerrar Sesión', style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;
    final auth = context.watch<AuthProvider>();

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
      },
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor: FWColors.background,
        drawer: isLandscape ? null : _buildDrawer(auth),
        body: SafeArea(
          child: Column(
            children: [
              _buildAppBar(isLandscape),
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: Text(
                          'Cargando perfil...',
                          style: TextStyle(color: FWColors.primaryBlue, fontSize: 16, fontFamily: 'Kanit'),
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _cargarPerfil,
                        child: SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: isLandscape
                              ? const EdgeInsets.symmetric(horizontal: 40, vertical: 32)
                              : const EdgeInsets.all(16),
                          child: isLandscape
                              ? Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    _buildSidebarProfileCard(isLandscape: true),
                                    const SizedBox(width: 28),
                                    Expanded(
                                      child: Column(
                                        children: [
                                          FWAnimatedCard(
                                            visible: _visible[0],
                                            child: _buildCardInfoPersonal(true),
                                          ),
                                          const SizedBox(height: 20),
                                          FWAnimatedCard(
                                            visible: _visible[1],
                                            child: _buildCardContacto(true),
                                          ),
                                          const SizedBox(height: 20),
                                          FWAnimatedCard(
                                            visible: _visible[2],
                                            child: _buildCardActividad(),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                )
                              : Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    _buildSidebarProfileCard(isLandscape: false),
                                    const SizedBox(height: 20),
                                    FWAnimatedCard(
                                      visible: _visible[0],
                                      child: _buildCardInfoPersonal(false),
                                    ),
                                    const SizedBox(height: 20),
                                    FWAnimatedCard(
                                      visible: _visible[1],
                                      child: _buildCardContacto(false),
                                    ),
                                    const SizedBox(height: 20),
                                    FWAnimatedCard(
                                      visible: _visible[2],
                                      child: _buildCardActividad(),
                                    ),
                                  ],
                                ),
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAppBar(bool isLandscape) {
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
                  isActive: false,
                  onTap: () => Navigator.pushNamed(context, '/cliente-cotizacion'),
                ),
                const SizedBox(width: 12),
                _buildNavButton(
                  icon: Icons.cleaning_services_outlined,
                  label: 'Agendar',
                  isActive: false,
                  onTap: () => Navigator.pushNamed(context, '/scheduling'),
                ),
              ],
            ),
          ],

          const Spacer(),

          // Sección Derecha: Carrito y Avatar con Menú Desplegable
          Row(
            children: [
              Consumer<CartProvider>(
                builder: (context, cart, child) {
                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 22),
                        onPressed: () => Navigator.pushNamed(context, '/cart'),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      if (cart.itemCount > 0)
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
                              cart.itemCount.toString(),
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
                  );
                },
              ),
              const SizedBox(width: 16),

              // Avatar con PopupMenuButton Dropdown
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  final user = auth.user;
                  final fotoUrl = fwFotoUrl(
                    user?.fotoPerfil,
                    widget.apiBaseUrl,
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
                        // Ya estamos aquí
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
            ],
          ),
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

  Widget _buildDrawer(AuthProvider auth) {
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
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/cliente-cotizacion');
              },
            ),
            _buildDrawerItem(
              icon: Icons.cleaning_services_outlined,
              label: 'Agendar',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/scheduling');
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
                isActive: true,
                onTap: () {
                  Navigator.pop(context);
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
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      decoration: BoxDecoration(
        color: isActive ? const Color(0x1A0066FF) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(icon, color: isActive ? const Color(0xFF0099FF) : Colors.white70, size: 20),
        title: Text(
          label,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 14.5,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
            color: isActive ? const Color(0xFF0099FF) : Colors.white,
          ),
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildSidebarProfileCard({required bool isLandscape}) {
    final fotoUrl = fwFotoUrl(_perfil?.fotoPerfil, widget.apiBaseUrl);

    return Container(
      width: isLandscape ? 300 : double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 28),
      decoration: BoxDecoration(
        gradient: FWColors.sidebarGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: FWColors.primaryBlue.withOpacity(0.28),
            blurRadius: 40,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -60,
            right: -60,
            child: fwDecorativeCircle(200),
          ),
          Positioned(
            bottom: -40,
            left: -40,
            child: fwDecorativeCircle(130),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              FWAvatar(fotoUrl: fotoUrl, size: 110),
              const SizedBox(height: 20),
              Text(
                _perfil?.nombre ?? 'Sin nombre',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'Kanit',
                  letterSpacing: -0.2,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  border: Border.all(color: Colors.white.withOpacity(0.22)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'CLIENTE',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                    fontFamily: 'Kanit',
                  ),
                ),
              ),
              const SizedBox(height: 28),
              Column(
                children: [
                  Row(
                    children: [
                      Expanded(child: _buildStatItem(_perfil?.totalReservas.toString() ?? '0', 'Servicios')),
                      const SizedBox(width: 10),
                      Expanded(child: _buildStatItem(_perfil?.completadas.toString() ?? '0', 'Completados')),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _buildStatItem(_perfil?.pendientes.toString() ?? '0', 'Pendientes')),
                      const SizedBox(width: 10),
                      Expanded(child: _buildStatItem(_perfil?.calificacionPromedio ?? '—', 'Calificación')),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    if (widget.onEditarPerfil != null) {
                      await widget.onEditarPerfil!();
                      _cargarPerfil();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: FWColors.primaryBlue,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                    shadowColor: Colors.black.withOpacity(0.15),
                  ),
                  child: const Text(
                    'Editar Perfil',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      fontFamily: 'Kanit',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String number, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.12),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            number,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w800,
              fontFamily: 'Kanit',
              height: 1.1,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              color: Colors.white.withOpacity(0.78),
              fontSize: 10,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
              fontFamily: 'Kanit',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCardInfoPersonal(bool isLandscape) {
    final fields = [
      FWInfoField(label: 'Nombre Completo', value: _perfil?.nombre),
      FWInfoField(label: 'Tipo de Documento', value: _perfil?.tipoDocumento),
      FWInfoField(label: 'Número de Documento', value: _perfil?.numeroDocumento),
      FWInfoField(label: 'Miembro desde', value: fwFormatFecha(_perfil?.miembroDesde)),
    ];

    return FWDetailCard(
      icon: Icons.person,
      title: 'Información Personal',
      spaceBetween: false,
      children: [
        if (isLandscape) ...[
          Row(
            children: [
              Expanded(child: fields[0]),
              const SizedBox(width: 18),
              Expanded(child: fields[1]),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(child: fields[2]),
              const SizedBox(width: 18),
              Expanded(child: fields[3]),
            ],
          ),
        ] else ...[
          fields[0],
          const SizedBox(height: 14),
          fields[1],
          const SizedBox(height: 14),
          fields[2],
          const SizedBox(height: 14),
          fields[3],
        ]
      ],
    );
  }

  Widget _buildCardContacto(bool isLandscape) {
    final fields = [
      FWInfoField(label: 'Correo Electrónico', value: _perfil?.correo),
      FWInfoField(label: 'Teléfono', value: _perfil?.telefono),
      FWInfoField(label: 'Dirección', value: _perfil?.direccion),
      FWInfoField(label: 'Último Acceso', value: fwFormatFecha(_perfil?.ultimoAcceso)),
    ];

    return FWDetailCard(
      icon: Icons.phone,
      title: 'Información de Contacto',
      spaceBetween: false,
      children: [
        if (isLandscape) ...[
          Row(
            children: [
              Expanded(child: fields[0]),
              const SizedBox(width: 18),
              Expanded(child: fields[1]),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            children: [
              Expanded(child: fields[2]),
              const SizedBox(width: 18),
              Expanded(child: fields[3]),
            ],
          ),
        ] else ...[
          fields[0],
          const SizedBox(height: 14),
          fields[1],
          const SizedBox(height: 14),
          fields[2],
          const SizedBox(height: 14),
          fields[3],
        ]
      ],
    );
  }

  Widget _buildCardActividad() {
    return FWDetailCard(
      icon: Icons.assignment_outlined,
      title: 'Actividad Reciente',
      spaceBetween: false,
      children: [
        if (_actividad.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 28),
            child: Center(
              child: Text(
                'No hay actividad reciente',
                style: TextStyle(color: FWColors.textMuted, fontSize: 14, fontFamily: 'Kanit'),
              ),
            ),
          )
        else
          ..._actividad.map((a) => _ActivityRow(item: a)),
      ],
    );
  }
}

class _ActivityRow extends StatelessWidget {
  final ActividadItem item;
  const _ActivityRow({required this.item});

  Color get _statusBg {
    switch (item.estado) {
      case 'completado':
        return const Color(0xFFDCFCE7);
      case 'pendiente':
        return const Color(0xFFFEF9C3);
      case 'cancelado':
        return const Color(0xFFFEE2E2);
      default:
        return const Color(0xFFEFEFEF);
    }
  }

  Color get _statusText {
    switch (item.estado) {
      case 'completado':
        return const Color(0xFF15803D);
      case 'pendiente':
        return const Color(0xFFA16207);
      case 'cancelado':
        return const Color(0xFFB91C1C);
      default:
        return const Color(0xFF555555);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F9FF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFEEF0F8)),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              gradient: FWColors.sidebarGradient,
              borderRadius: BorderRadius.circular(11),
            ),
            child: Center(
              child: Text(item.icono, style: const TextStyle(fontSize: 18)),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.titulo,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, fontFamily: 'Kanit'),
                ),
                const SizedBox(height: 2),
                Text(
                  item.fecha,
                  style: const TextStyle(fontSize: 12, color: FWColors.textMuted, fontFamily: 'Kanit'),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: _statusBg,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              item.estado.toUpperCase(),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: _statusText,
                fontFamily: 'Kanit',
              ),
            ),
          ),
        ],
      ),
    );
  }
}
