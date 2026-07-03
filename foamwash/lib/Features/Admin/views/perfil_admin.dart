import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Features/Admin/views/perfil_admin_edit.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/admin_header.dart';
import '../widgets/admin_footer.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

class AdminPerfil {
  final String? nombre;
  final String? tipoDocumento;
  final String? numeroDocumento;
  final String? correo;
  final String? telefono;
  final String? fotoPerfil;
  final DateTime? fechaRegistro;

  AdminPerfil({
    this.nombre,
    this.tipoDocumento,
    this.numeroDocumento,
    this.correo,
    this.telefono,
    this.fotoPerfil,
    this.fechaRegistro,
  });

  factory AdminPerfil.fromJson(Map<String, dynamic> json) {
    DateTime? parseFecha(dynamic v) {
      if (v == null) return null;
      return DateTime.tryParse(v.toString());
    }
    return AdminPerfil(
      nombre: json['Nombre']?.toString(),
      tipoDocumento: json['tipo_de_documento']?['nombre_del_documento']?.toString(),
      numeroDocumento: json['N_Documento']?.toString(),
      correo: json['Correo']?.toString(),
      telefono: json['Telefono']?.toString(),
      fotoPerfil: json['foto_perfil']?.toString(),
      fechaRegistro: parseFecha(json['fecha_registro']),
    );
  }
}

class _Permiso {
  final String icono;
  final String titulo;
  final String desc;
  const _Permiso(this.icono, this.titulo, this.desc);
}

const List<_Permiso> _permisos = [
  _Permiso('👥', 'Gestión de Usuarios', 'Crear, editar y eliminar usuarios'),
  _Permiso('👨‍💼', 'Gestión de Empleados', 'Administrar personal y horarios'),
  _Permiso('💰', 'Acceso Financiero', 'Ver y gestionar finanzas'),
  _Permiso('📊', 'Reportes Avanzados', 'Generar y exportar reportes'),
  _Permiso('⚙️', 'Configuración Sistema', 'Modificar parámetros del sistema'),
  _Permiso('🔒', 'Seguridad y Auditoría', 'Acceso a logs y auditorías'),
];

class PerfilAdminScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;

  final Future<void> Function()? onEditarPerfil;
  final VoidCallback? onLogout;
  final VoidCallback? onBackToHome;
  final VoidCallback? onDashboard;

  const PerfilAdminScreen({
    super.key,
    required this.apiBaseUrl,
    required this.userId,
    this.onEditarPerfil,
    this.onLogout,
    this.onBackToHome,
    this.onDashboard,
  });

  @override
  State<PerfilAdminScreen> createState() => _PerfilAdminScreenState();
}

class _PerfilAdminScreenState extends State<PerfilAdminScreen> {
  AdminPerfil? _perfil;
  bool _isLoading = true;
  final List<bool> _visible = [false, false];

  // Footer stats state
  int _ordeneHoy = 0;
  int _ordensPendientes = 0;
  int _empleadosActivos = 0;
  String _ingresosMes = '\$0';

  @override
  void initState() {
    super.initState();
    _cargarPerfil();
    _fetchFooterStats();
  }

  Future<void> _fetchFooterStats() async {
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final cookieToken = await secureStorage.read('cookie_token');
      final baseUrl = ApiConstants.baseUrl;
      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      final results = await Future.wait([
        http.get(Uri.parse('$baseUrl/reservas'), headers: headers),
        http.get(Uri.parse('$baseUrl/empleados'), headers: headers),
      ]);

      if (results[0].statusCode == 401 || results[1].statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      if (results[0].statusCode == 200 && results[1].statusCode == 200) {
        final resData = jsonDecode(results[0].body);
        final List reservas = resData['data'] ?? (resData is List ? resData : []);
        final now = DateTime.now();

        // 1. Ordene hoy
        final todayCount = reservas.where((r) {
          final fStr = r['fecha'];
          if (fStr == null) return false;
          final d = DateTime.tryParse(fStr);
          return d != null && d.day == now.day && d.month == now.month && d.year == now.year;
        }).length;

        // 2. Pendientes
        final pendingCount = reservas.where((r) => r['Estado'] == 'Pendiente').length;

        // 3. Empleados activos
        final empData = jsonDecode(results[1].body);
        final List emps = empData['data'] ?? [];
        final activeCount = emps.where((e) => e['estado'] == 'activo').length;

        // 4. Ingresos mes
        double totalIngresos = 0.0;
        for (var r in reservas) {
          final fStr = r['fecha'];
          if (fStr != null) {
            final d = DateTime.tryParse(fStr);
            if (d != null && d.month == now.month && d.year == now.year) {
              if (r['Estado'] == 'Completado' || r['Estado'] == 'Finalizado' || r['Estado'] == 'Completada') {
                if (r['servicios'] != null) {
                  for (var s in r['servicios']) {
                    totalIngresos += double.tryParse((s['Precio'] ?? 0).toString()) ?? 0.0;
                  }
                }
              }
            }
          }
        }
        final format = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

        if (mounted) {
          setState(() {
            _ordeneHoy = todayCount;
            _ordensPendientes = pendingCount;
            _empleadosActivos = activeCount;
            _ingresosMes = format.format(totalIngresos);
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching footer stats in perfil: $e');
    }
  }

  Future<void> _cargarPerfil() async {
    setState(() => _isLoading = true);
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final cookieToken = await secureStorage.read('cookie_token');
      
      String safeUserId = widget.userId;
      if (safeUserId.isEmpty) {
        safeUserId = await secureStorage.read('userId') ?? '0';
      }

      if (safeUserId == '0' || safeUserId.isEmpty) {
        throw Exception('ID de usuario no disponible para cargar el perfil.');
      }

      Map<String, String> headers = {
        'Authorization': 'Bearer $token',
        'ngrok-skip-browser-warning': 'true',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      final res = await http.get(
        Uri.parse('${widget.apiBaseUrl}/api/usuarios/$safeUserId'),
        headers: headers,
      );

      if (res.statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true) {
          _perfil = AdminPerfil.fromJson(body['data']);
        }
      }
    } catch (e) {
      debugPrint('Error al cargar perfil admin: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
        fwAnimarEntrada(_visible, setState, mounted: () => mounted);
      }
    }
  }

  void _confirmarCerrarSesion() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cerrar sesión', style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, color: Color(0xFF080C1E))),
        content: const Text('¿Estás seguro de que deseas cerrar sesión?', style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF64748B))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar', style: TextStyle(color: Color(0xFF8898B3), fontWeight: FontWeight.w600))),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              widget.onLogout?.call();
            },
            child: const Text('Cerrar sesión', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final bool isDesktop = width >= 900;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        Navigator.pushNamedAndRemoveUntil(context, '/admin_dashboard', (route) => false);
      },
      child: Scaffold(
        backgroundColor: const Color(0xFFF4F7FF),
        drawer: const AdminDrawer(),
        appBar: const AdminHeader(activeTab: 'perfil'),
        body: _isLoading
            ? const Center(
                child: CircularProgressIndicator(color: Color(0xFF0066FF)),
              )
            : RefreshIndicator(
                color: const Color(0xFF0066FF),
                onRefresh: _cargarPerfil,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    children: [
                      Center(
                        child: Container(
                          constraints: const BoxConstraints(maxWidth: 1260),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Title header
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        Container(
                                          width: 38,
                                          height: 38,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF0066FF).withOpacity(0.08),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: const Icon(Icons.person_outline_rounded, color: Color(0xFF0066FF), size: 20),
                                        ),
                                        const SizedBox(width: 12),
                                        const Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Mi Perfil',
                                                style: TextStyle(
                                                  fontFamily: 'Kanit',
                                                  fontSize: 22,
                                                  fontWeight: FontWeight.w800,
                                                  color: Color(0xFF080C1E),
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              Text(
                                                'Información administrativa de la cuenta',
                                                style: TextStyle(
                                                  fontFamily: 'Kanit',
                                                  fontSize: 12.5,
                                                  color: Color(0xFF8898B3),
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  ElevatedButton.icon(
                                    onPressed: _confirmarCerrarSesion,
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFFEF4444).withOpacity(0.08),
                                      foregroundColor: const Color(0xFFEF4444),
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      elevation: 0,
                                    ),
                                    icon: const Icon(Icons.logout_rounded, size: 16),
                                    label: const Text(
                                      'Salir',
                                      style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 24),

                              // Responsive Layout
                              if (isDesktop)
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(flex: 4, child: _buildSidebar()),
                                    const SizedBox(width: 24),
                                    Expanded(
                                      flex: 8,
                                      child: Column(
                                        children: [
                                          FWAnimatedCard(visible: _visible[0], child: _buildCardInfoAdmin()),
                                          const SizedBox(height: 20),
                                          FWAnimatedCard(visible: _visible[1], child: _buildCardPermisos()),
                                        ],
                                      ),
                                    ),
                                  ],
                                )
                              else ...[
                                _buildSidebar(),
                                const SizedBox(height: 20),
                                FWAnimatedCard(visible: _visible[0], child: _buildCardInfoAdmin()),
                                const SizedBox(height: 20),
                                FWAnimatedCard(visible: _visible[1], child: _buildCardPermisos()),
                              ],
                            ],
                          ),
                        ),
                      ),

                      // Footer
                      AdminFooter(
                        ordeneHoy: _ordeneHoy,
                        ordensPendientes: _ordensPendientes,
                        empleadosActivos: _empleadosActivos,
                        ingresosMes: _ingresosMes,
                      ),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildSidebar() {
    final fotoUrl = fwFotoUrl(_perfil?.fotoPerfil, widget.apiBaseUrl);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 24),
      decoration: BoxDecoration(
        gradient: FWColors.sidebarGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: FWColors.primaryBlue.withOpacity(0.28),
            blurRadius: 30,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(top: -50, right: -50, child: fwDecorativeCircle(160)),
          Positioned(bottom: -30, left: -30, child: fwDecorativeCircle(100)),
          Column(
            children: [
              FWAvatar(fotoUrl: fotoUrl, size: 100),
              const SizedBox(height: 16),
              Text(
                _perfil?.nombre ?? 'Administrador',
                style: const TextStyle(fontFamily: 'Kanit', color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
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
                  'ADMINISTRADOR',
                  style: TextStyle(fontFamily: 'Kanit', color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                ),
              ),
              const SizedBox(height: 20),
              InkWell(
                borderRadius: BorderRadius.circular(14),
                onTap: widget.onDashboard,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.14),
                    border: Border.all(color: Colors.white.withOpacity(0.18)),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('🔑 ', style: TextStyle(fontSize: 14)),
                      Text(
                        'Acceso Total',
                        style: TextStyle(fontFamily: 'Kanit', color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    final updated = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PerfilAdminEditScreen(
                          apiBaseUrl: widget.apiBaseUrl,
                          userId: widget.userId,
                        ),
                      ),
                    );
                    if (updated == true) _cargarPerfil();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF0066FF),
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: const Text('Editar Perfil', style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCardInfoAdmin() {
    return FWDetailCard(
      icon: Icons.person_outline_rounded,
      title: 'Información del Administrador',
      children: [
        FWInfoField(label: 'Nombre Completo', value: _perfil?.nombre),
        const FWInfoField(label: 'Cargo', value: 'Administrador General'),
        FWInfoField(label: 'Tipo de Documento', value: _perfil?.tipoDocumento),
        FWInfoField(label: 'Número de Documento', value: _perfil?.numeroDocumento),
        FWInfoField(label: 'Email Corporativo', value: _perfil?.correo),
        FWInfoField(label: 'Teléfono', value: _perfil?.telefono),
        const FWInfoField(label: 'Departamento', value: 'Administración'),
        FWInfoField(label: 'Miembro Desde', value: fwFormatFecha(_perfil?.fechaRegistro)),
      ],
    );
  }

  Widget _buildCardPermisos() {
    return FWDetailCard(
      icon: Icons.key_rounded,
      title: 'Permisos y Accesos',
      spaceBetween: false,
      children: [
        ..._permisos.map((p) => _PermisoRow(permiso: p)),
      ],
    );
  }
}

class _PermisoRow extends StatelessWidget {
  final _Permiso permiso;
  const _PermisoRow({required this.permiso});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: FWColors.infoBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black.withOpacity(0.04)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: const Color(0xFF0066FF).withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Text(permiso.icono, style: const TextStyle(fontSize: 18))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(permiso.titulo, style: const TextStyle(fontFamily: 'Kanit', fontSize: 13, fontWeight: FontWeight.bold)),
                const SizedBox(height: 2),
                Text(permiso.desc, style: const TextStyle(fontFamily: 'Kanit', fontSize: 11, color: Color(0xFF8898B3))),
              ],
            ),
          ),
          const Icon(Icons.check, size: 18, color: Color(0xFF16A34A)),
        ],
      ),
    );
  }
}
