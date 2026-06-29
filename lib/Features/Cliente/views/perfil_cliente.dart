// =============================================================================
// ARCHIVO  : perfil_cliente.dart
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Replica el diseño de PerfilCliente.jsx.
// =============================================================================

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';

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
  });

  factory ClientePerfil.fromJson(Map<String, dynamic> json) {
    DateTime? parseFecha(dynamic v) {
      if (v == null) return null;
      return DateTime.tryParse(v.toString());
    }

    return ClientePerfil(
      nombre: json['Nombre']?.toString(),
      tipoDocumento: json['tipo_de_documento']?['nombre_del_documento']?.toString(),
      numeroDocumento: json['N_Documento']?.toString(),
      correo: json['Correo']?.toString(),
      telefono: json['Telefono']?.toString(),
      direccion: json['Direccion']?.toString(),
      fotoPerfil: json['foto_perfil']?.toString(),
      miembroDesde: parseFecha(json['created_at'] ?? json['fecha_registro']),
      ultimoAcceso: parseFecha(json['ultimo_acceso']),
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
  final VoidCallback? onEditarPerfil;
  final VoidCallback? onLogout;
  final VoidCallback? onBackToHome;

  const PerfilClienteScreen({
    super.key,
    required this.apiBaseUrl,
    required this.userId,
    this.onEditarPerfil,
    this.onLogout,
    this.onBackToHome,
  });

  @override
  State<PerfilClienteScreen> createState() => _PerfilClienteScreenState();
}

class _PerfilClienteScreenState extends State<PerfilClienteScreen> {
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
      final res = await http.get(
        Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}'),
      );
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true) {
          _perfil = ClientePerfil.fromJson(body['data']);
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

  void _confirmarCerrarSesion() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cerrar sesión'),
        content: const Text('¿Estás seguro de que deseas cerrar sesión?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar'),
          ),
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
      appBar: _buildAppBar(),
      body: _isLoading
          ? const Center(
              child: Text(
                'Cargando perfil...',
                style: TextStyle(color: FWColors.primaryBlue, fontSize: 16),
              ),
            )
          : RefreshIndicator(
              onRefresh: _cargarPerfil,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildHeaderGradiente(),
                    const SizedBox(height: 20),
                    FWAnimatedCard(
                      visible: _visible[0],
                      child: _buildCardInfoPersonal(),
                    ),
                    const SizedBox(height: 20),
                    FWAnimatedCard(
                      visible: _visible[1],
                      child: _buildCardContacto(),
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
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFF0E1330),
      elevation: 0,
      automaticallyImplyLeading: widget.onBackToHome != null,
      leading: widget.onBackToHome != null
          ? IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: widget.onBackToHome,
            )
          : null,
      title: Row(
        children: const [
          Text(
            'FoamWash',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
          SizedBox(width: 4),
          Text(
            'CL',
            style: TextStyle(
              color: FWColors.primaryBlue,
              fontWeight: FontWeight.w800,
              fontSize: 12,
            ),
          ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.logout, color: Colors.white),
          tooltip: 'Cerrar sesión',
          onPressed: _confirmarCerrarSesion,
        ),
      ],
    );
  }

  Widget _buildHeaderGradiente() {
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
          Positioned(
            top: -50,
            right: -50,
            child: fwDecorativeCircle(160),
          ),
          Positioned(
            bottom: -30,
            left: -30,
            child: fwDecorativeCircle(100),
          ),
          Column(
            children: [
              FWAvatar(fotoUrl: fotoUrl, size: 100),
              const SizedBox(height: 16),
              Text(
                _perfil?.nombre ?? 'Cliente',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
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
                  'CLIENTE',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: widget.onEditarPerfil,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: FWColors.primaryBlue,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                  ),
                  child: const Text(
                    'Editar Perfil',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCardInfoPersonal() {
    return FWDetailCard(
      icon: Icons.person,
      title: 'Información Personal',
      children: [
        FWInfoField(label: 'Nombre Completo', value: _perfil?.nombre),
        FWInfoField(label: 'Tipo de Documento', value: _perfil?.tipoDocumento),
        FWInfoField(label: 'Número de Documento', value: _perfil?.numeroDocumento),
        FWInfoField(label: 'Miembro desde', value: fwFormatFecha(_perfil?.miembroDesde)),
      ],
    );
  }

  Widget _buildCardContacto() {
    return FWDetailCard(
      icon: Icons.phone,
      title: 'Información de Contacto',
      children: [
        FWInfoField(label: 'Correo Electrónico', value: _perfil?.correo),
        FWInfoField(label: 'Teléfono', value: _perfil?.telefono),
        FWInfoField(label: 'Dirección', value: _perfil?.direccion),
        FWInfoField(label: 'Último Acceso', value: fwFormatFecha(_perfil?.ultimoAcceso)),
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
                style: TextStyle(color: FWColors.textMuted, fontSize: 14),
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
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  item.fecha,
                  style: const TextStyle(fontSize: 12, color: FWColors.textMuted),
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
              item.estado,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: _statusText,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
