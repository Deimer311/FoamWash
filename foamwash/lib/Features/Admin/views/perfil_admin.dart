// =============================================================================
// ARCHIVO  : perfil_admin.dart
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Replica PerfilAdmin.jsx / PerfilAdmin.css.
// =============================================================================

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Features/Admin/views/perfil_admin_edit.dart';

// =============================================================================
// MODELO
// =============================================================================
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

// =============================================================================
// PANTALLA PRINCIPAL
// =============================================================================
class PerfilAdminScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;

  final Future<void> Function()? onEditarPerfil;
  final VoidCallback? onLogout;
  final VoidCallback? onBackToHome;
  final VoidCallback? onDashboard; // tap en el badge "Acceso Total"

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

  @override
  void initState() {
    super.initState();
    _cargarPerfil();
  }

  Future<void> _cargarPerfil() async {
    setState(() => _isLoading = true);
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final res = await http.get(
        Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}'),
        headers: {
          'Authorization': 'Bearer $token',
          'ngrok-skip-browser-warning': 'true',
        },
      );
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
        title: const Text('Cerrar sesión'),
        content: const Text('¿Estás seguro de que deseas cerrar sesión?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancelar')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              widget.onLogout?.call();
            },
            child: const Text('Cerrar sesión'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: FWColors.background,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E1330),
        elevation: 0,
        leading: widget.onBackToHome != null
            ? IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: widget.onBackToHome,
              )
            : null,
        title: Row(
          children: const [
            Text('FoamWash',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
            SizedBox(width: 4),
            Text('ADMIN',
                style: TextStyle(color: FWColors.primaryPurple, fontWeight: FontWeight.w800, fontSize: 12)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            tooltip: 'Cerrar sesión',
            onPressed: _confirmarCerrarSesion,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: Text('Cargando perfil...',
                  style: TextStyle(color: FWColors.primaryBlue, fontSize: 16)),
            )
          : RefreshIndicator(
              onRefresh: _cargarPerfil,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildSidebar(),
                    const SizedBox(height: 20),
                    FWAnimatedCard(visible: _visible[0], child: _buildCardInfoAdmin()),
                    const SizedBox(height: 20),
                    FWAnimatedCard(visible: _visible[1], child: _buildCardPermisos()),
                  ],
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
            color: FWColors.primaryBlue.withValues(alpha: 0.28),
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
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.22)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'ADMINISTRADOR',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5),
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
                    color: Colors.white.withValues(alpha: 0.14),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Text('🔑 ', style: TextStyle(fontSize: 14)),
                      Text(
                        'Acceso Total',
                        style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600),
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
                    // Navegar a la pantalla de edición y recargar si hubo cambios
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
                    foregroundColor: FWColors.primaryBlue,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 4,
                  ),
                  child: const Text('Editar Perfil', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
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
      icon: Icons.person,
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
      icon: Icons.key,
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
        border: Border.all(color: Colors.black.withValues(alpha: 0.04)),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: FWColors.primaryBlue.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(child: Text(permiso.icono, style: const TextStyle(fontSize: 18))),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(permiso.titulo, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                const SizedBox(height: 2),
                Text(permiso.desc, style: const TextStyle(fontSize: 11, color: FWColors.textMuted)),
              ],
            ),
          ),
          const Icon(Icons.check, size: 18, color: Color(0xFF16A34A)),
        ],
      ),
    );
  }
}
