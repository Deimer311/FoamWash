// =============================================================================
// ARCHIVO  : perfil_trabajador.dart
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Replica PerfilTrabajador.jsx.
// =============================================================================

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Features/Trabajador/views/perfil_trabajador_edit.dart';
import 'package:foamwash/Features/Trabajador/views/agenda_trabajador.dart';
import 'package:logger/logger.dart';

final _logger = Logger(
  printer: PrettyPrinter(methodCount: 0),
  level: Level.debug,
);

// =============================================================================
// MODELOS
// =============================================================================
class TrabajadorPerfil {
  final String? nombre;
  final String? tipoDocumento;
  final String? numeroDocumento;
  final DateTime? fechaNacimiento;
  final String? cargo;
  final String? correo;
  final String? telefono;
  final String? direccion;
  final DateTime? fechaIngreso;
  final String? fotoPerfil;
  final String? rolBadge;
  final String? diasLaborales;
  final String? horario;
  final List<String> especialidades;
  final List<CertificacionItem> certificaciones;

  TrabajadorPerfil({
    this.nombre,
    this.tipoDocumento,
    this.numeroDocumento,
    this.fechaNacimiento,
    this.cargo,
    this.correo,
    this.telefono,
    this.direccion,
    this.fechaIngreso,
    this.fotoPerfil,
    this.rolBadge,
    this.diasLaborales,
    this.horario,
    this.especialidades = const [],
    this.certificaciones = const [],
  });

  factory TrabajadorPerfil.fromJson(Map<String, dynamic> json) {
    DateTime? parseFecha(dynamic v) => v == null ? null : DateTime.tryParse(v.toString());

    List<String> parseEspecialidades(dynamic raw) {
      if (raw == null) return [];
      if (raw is List) return raw.map((e) => e.toString()).toList();
      return raw.toString().split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
    }

    List<CertificacionItem> parseCertificaciones(dynamic raw) {
      if (raw == null) return [];
      if (raw is List) {
        return raw
            .map((c) => c is Map
                ? CertificacionItem(nombre: c['nombre']?.toString() ?? '', vence: c['vence']?.toString())
                : CertificacionItem(nombre: c.toString()))
            .toList();
      }
      return raw.toString().split(',').map((c) => CertificacionItem(nombre: c.trim())).toList();
    }

    return TrabajadorPerfil(
      nombre: json['Nombre']?.toString(),
      tipoDocumento: json['tipo_de_documento']?['nombre_del_documento']?.toString(),
      numeroDocumento: json['N_Documento']?.toString(),
      fechaNacimiento: parseFecha(json['fecha_nacimiento']),
      cargo: json['cargo']?.toString(),
      correo: json['Correo']?.toString(),
      telefono: json['Telefono']?.toString(),
      direccion: json['Direccion']?.toString(),
      fechaIngreso: parseFecha(json['fecha_ingreso']),
      fotoPerfil: json['foto_perfil']?.toString(),
      rolBadge: json['rol']?['Rol']?.toString() ?? json['cargo']?.toString(),
      diasLaborales: json['dias_laborales']?.toString(),
      horario: json['horario']?.toString(),
      especialidades: parseEspecialidades(json['especialidades']),
      certificaciones: parseCertificaciones(json['certificaciones']),
    );
  }
}

class DesempenoMes {
  final double? calificacionPromedio;
  final int? serviciosMes;
  final int? comentarios;

  DesempenoMes({this.calificacionPromedio, this.serviciosMes, this.comentarios});

  factory DesempenoMes.fromJson(Map<String, dynamic> json) {
    return DesempenoMes(
      calificacionPromedio: (json['calificacion_promedio'] as num?)?.toDouble(),
      serviciosMes: json['servicios_mes'] as int?,
      comentarios: json['comentarios'] as int?,
    );
  }
}

class ReservaHoy {
  final String hora;
  final String servicio;
  final String direccionCliente;
  final String nombreCliente;
  final String estado;

  ReservaHoy({
    required this.hora,
    required this.servicio,
    required this.direccionCliente,
    required this.nombreCliente,
    required this.estado,
  });

  factory ReservaHoy.fromJson(Map<String, dynamic> json) {
    final servicios = json['servicios'] as List?;
    return ReservaHoy(
      hora: json['Hora']?.toString() ?? '',
      servicio: (servicios != null && servicios.isNotEmpty)
          ? (servicios.first['Nombre_Servicio']?.toString() ?? 'Servicio')
          : 'Servicio',
      direccionCliente: json['cliente']?['Direccion']?.toString() ?? '',
      nombreCliente: json['cliente']?['Nombre']?.toString() ?? '',
      estado: json['Estado']?.toString() ?? '',
    );
  }
}

class CertificacionItem {
  final String nombre;
  final String? vence;
  CertificacionItem({required this.nombre, this.vence});
}

// =============================================================================
// PANTALLA PRINCIPAL
// =============================================================================
class PerfilTrabajadorScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;

  final Future<void> Function()? onEditarPerfil;
  final VoidCallback? onLogout;
  final VoidCallback? onBackToHome;

  const PerfilTrabajadorScreen({
    super.key,
    required this.apiBaseUrl,
    required this.userId,
    this.onEditarPerfil,
    this.onLogout,
    this.onBackToHome,
  });

  @override
  State<PerfilTrabajadorScreen> createState() => _PerfilTrabajadorScreenState();
}

class _PerfilTrabajadorScreenState extends State<PerfilTrabajadorScreen> {
  TrabajadorPerfil? _perfil;
  DesempenoMes? _desempeno;
  List<ReservaHoy> _reservasHoy = [];
  bool _isLoading = true;
  String? _error;

  final List<bool> _visible = [false, false, false, false, false, false];

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  Future<void> _cargarDatos() async {
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

      final headers = {
        'Authorization': 'Bearer $token',
        'ngrok-skip-browser-warning': 'true',
      };
      final base = widget.apiBaseUrl;
      final results = await Future.wait([
        http.get(Uri.parse('$base/api/empleados/mi-perfil'), headers: headers),
        http.get(Uri.parse('$base/api/empleados/mi-desempeno'), headers: headers),
        http.get(Uri.parse('$base/api/empleados/mis-servicios-hoy'), headers: headers),
      ]);

      final perfilBody = json.decode(results[0].body);
      if (perfilBody['success'] == true && perfilBody['data'] != null) {
        _perfil = TrabajadorPerfil.fromJson(perfilBody['data']);
      }

      final desempenoBody = json.decode(results[1].body);
      if (desempenoBody['success'] == true && desempenoBody['data'] != null) {
        _desempeno = DesempenoMes.fromJson(desempenoBody['data']);
      }

      final reservasBody = json.decode(results[2].body);
      if (reservasBody['success'] == true) {
        _reservasHoy = ((reservasBody['data'] as List?) ?? [])
            .map((r) => ReservaHoy.fromJson(r))
            .toList();
      }
    } catch (e) {
      _error = 'No se pudo cargar la información del perfil. Verifica la conexión con el servidor.';
      _logger.e('Error al cargar el perfil del trabajador', error: e);
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

  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        Navigator.pushNamedAndRemoveUntil(context, '/empleado_agenda', (route) => false);
      },
      child: Scaffold(
        backgroundColor: FWColors.background,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0E1330),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            Navigator.pushNamedAndRemoveUntil(
              context,
              '/empleado_agenda',
              (route) => false,
            );
          },
        ),
        title: Row(
          children: const [
            Text('FoamWash', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
            SizedBox(width: 4),
            Text('STAFF', style: TextStyle(color: FWColors.primaryBlue, fontWeight: FontWeight.w800, fontSize: 12)),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.logout, color: Colors.white), tooltip: 'Cerrar sesión', onPressed: _confirmarCerrarSesion),
        ],
      ),
      body: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Text('⏳ Cargando perfil...', style: TextStyle(color: FWColors.primaryBlue, fontSize: 16)),
      );
    }
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Text('❌ $_error', textAlign: TextAlign.center, style: const TextStyle(color: Color(0xFFE53935), fontSize: 16)),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _cargarDatos,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildSidebar(),
            const SizedBox(height: 20),
            FWAnimatedCard(visible: _visible[0], child: _buildCardInfoPersonal()),
            const SizedBox(height: 20),
            FWAnimatedCard(visible: _visible[1], child: _buildCardHorarioHoy()),
            const SizedBox(height: 20),
            FWAnimatedCard(visible: _visible[2], child: _buildCardDesempeno()),
            const SizedBox(height: 20),
            FWAnimatedCard(visible: _visible[3], child: _buildCardHorarioLaboral()),
            if (_perfil != null && _perfil!.especialidades.isNotEmpty) ...[
              const SizedBox(height: 20),
              FWAnimatedCard(visible: _visible[4], child: _buildCardEspecialidades()),
            ],
            const SizedBox(height: 20),
            FWAnimatedCard(visible: _visible[5], child: _buildCardCertificaciones()),
          ],
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
        boxShadow: [BoxShadow(color: FWColors.primaryBlue.withValues(alpha: 0.28), blurRadius: 30, offset: const Offset(0, 12))],
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
                _perfil?.nombre ?? '—',
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700),
                textAlign: TextAlign.center,
              ),
              if (_perfil?.rolBadge != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.22)),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _perfil!.rolBadge!.toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1),
                  ),
                ),
              ],
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(color: Color(0xFF4ADE80), shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 6),
                  const Text('Disponible', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  _StatSidebar(valor: _desempeno?.serviciosMes?.toString(), etiqueta: 'Este Mes', mensajeVacio: 'Sin datos'),
                  const SizedBox(width: 10),
                  _StatSidebar(
                    valor: _desempeno?.calificacionPromedio?.toStringAsFixed(1),
                    etiqueta: 'Calificación',
                    mensajeVacio: 'Sin datos',
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const _StatSidebar(valor: null, etiqueta: 'Puntualidad', mensajeVacio: 'N/D'),
                  const SizedBox(width: 10),
                  _StatSidebar(valor: _desempeno?.comentarios?.toString(), etiqueta: 'Comentarios', mensajeVacio: 'Sin datos'),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    // Navegar directamente y recargar si hubo cambios
                    final updated = await Navigator.push<bool>(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PerfilTrabajadorEditScreen(
                          apiBaseUrl: widget.apiBaseUrl,
                          userId: widget.userId,
                        ),
                      ),
                    );
                    if (updated == true) _cargarDatos();
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

  Widget _buildCardInfoPersonal() {
    return FWDetailCard(
      icon: Icons.person,
      title: 'Información Personal',
      children: [
        FWCampoInfo(label: 'Nombre Completo', value: _perfil?.nombre, mensajeVacio: 'No existe un nombre registrado para este usuario.'),
        FWCampoInfo(label: 'Tipo de Documento', value: _perfil?.tipoDocumento, mensajeVacio: 'No existe un tipo de documento registrado para este usuario.'),
        FWCampoInfo(label: 'Número de Documento', value: _perfil?.numeroDocumento, mensajeVacio: 'No existe un número de documento registrado para este usuario.'),
        FWCampoInfo(label: 'Fecha de Nacimiento', value: _perfil?.fechaNacimiento != null ? fwFormatFecha(_perfil?.fechaNacimiento) : null, mensajeVacio: 'La fecha de nacimiento aún no ha sido registrada.'),
        FWCampoInfo(label: 'Cargo', value: _perfil?.cargo, mensajeVacio: 'No hay cargo registrado para este empleado.'),
        FWCampoInfo(label: 'Correo', value: _perfil?.correo, mensajeVacio: 'No existe un correo registrado para este usuario.'),
        FWCampoInfo(label: 'Teléfono', value: _perfil?.telefono, mensajeVacio: 'No existe un teléfono registrado para este usuario.'),
        FWCampoInfo(label: 'Dirección', value: _perfil?.direccion, mensajeVacio: 'No existe una dirección registrada para este usuario.'),
        FWCampoInfo(label: 'Fecha de Ingreso', value: _perfil?.fechaIngreso != null ? fwFormatFecha(_perfil?.fechaIngreso) : null, mensajeVacio: 'La fecha de ingreso aún no ha sido registrada.'),
      ],
    );
  }

  Widget _buildCardHorarioHoy() {
    return FWDetailCard(
      icon: Icons.calendar_today,
      title: 'Horario de Hoy',
      spaceBetween: false,
      children: [
        if (_reservasHoy.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 28),
            child: Center(
              child: Text('No hay servicios programados para hoy.', style: TextStyle(color: Color(0xFFBBBBBB), fontSize: 14)),
            ),
          )
        else
          ..._reservasHoy.map((r) => _ScheduleRow(reserva: r)),
      ],
    );
  }

  Widget _buildCardDesempeno() {
    return FWDetailCard(
      icon: Icons.bar_chart,
      title: 'Desempeño del Mes',
      spaceBetween: false,
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            mainAxisExtent: 160,
          ),
          itemCount: 4,
          itemBuilder: (context, index) {
            switch(index) {
              case 0: return _PerfCard(icono: '⭐', valor: _desempeno?.calificacionPromedio?.toStringAsFixed(1), etiqueta: 'Calificación Promedio', mensajeVacio: 'Este trabajador aún no tiene calificaciones.');
              case 1: return _PerfCard(icono: '✅', valor: _desempeno?.serviciosMes?.toString(), etiqueta: 'Servicios Completados', mensajeVacio: 'No hay servicios completados durante este mes.');
              case 2: return const _PerfCard(icono: '⏱️', valor: null, etiqueta: 'Puntualidad', mensajeVacio: 'No disponible: el sistema no registra la hora real de inicio.');
              case 3: return _PerfCard(icono: '💬', valor: _desempeno?.comentarios?.toString(), etiqueta: 'Comentarios', mensajeVacio: 'No existen comentarios registrados.');
              default: return const SizedBox();
            }
          },
        ),
      ],
    );
  }

  Widget _buildCardHorarioLaboral() {
    return FWDetailCard(
      icon: Icons.access_time,
      title: 'Horario Laboral',
      children: [
        FWCampoInfo(label: 'Días Laborales', value: _perfil?.diasLaborales, mensajeVacio: 'No hay días laborales registrados.'),
        FWCampoInfo(label: 'Horario', value: _perfil?.horario, mensajeVacio: 'No hay horario registrado.'),
      ],
    );
  }

  Widget _buildCardEspecialidades() {
    return FWDetailCard(
      icon: Icons.star,
      title: 'Especialidades',
      spaceBetween: false,
      children: (_perfil?.especialidades ?? [])
          .map((e) => _CertRow(icon: Icons.work_outline, titulo: e))
          .toList(),
    );
  }

  Widget _buildCardCertificaciones() {
    final certs = _perfil?.certificaciones ?? [];
    return FWDetailCard(
      icon: Icons.workspace_premium,
      title: 'Certificaciones y Capacitaciones',
      spaceBetween: false,
      children: [
        if (certs.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 28),
            child: Center(
              child: Text(
                'No hay certificaciones registradas. Edita tu perfil para agregar.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFFBBBBBB), fontSize: 14),
              ),
            ),
          )
        else
          ...certs.map((c) => _CertRow(icon: Icons.description_outlined, titulo: c.nombre, subtitulo: c.vence != null ? 'Vence: ${c.vence}' : null)),
      ],
    );
  }
}

class _StatSidebar extends StatelessWidget {
  final String? valor;
  final String etiqueta;
  final String mensajeVacio;

  const _StatSidebar({required this.valor, required this.etiqueta, required this.mensajeVacio});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.12),
          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                valor ?? mensajeVacio,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: valor != null ? 22 : 11,
                  fontWeight: FontWeight.w800,
                  fontStyle: valor != null ? FontStyle.normal : FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 4),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                etiqueta.toUpperCase(),
                style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w500, letterSpacing: 0.4),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PerfCard extends StatelessWidget {
  final String icono;
  final String? valor;
  final String etiqueta;
  final String mensajeVacio;

  const _PerfCard({required this.icono, required this.valor, required this.etiqueta, required this.mensajeVacio});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: FWColors.infoBg, borderRadius: BorderRadius.circular(14)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(icono, style: const TextStyle(fontSize: 22)),
          const SizedBox(height: 4),
          Expanded(
            child: Center(
              child: Text(
                valor ?? mensajeVacio,
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: valor != null
                    ? const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: FWColors.textDark)
                    : const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF), fontStyle: FontStyle.italic),
              ),
            ),
          ),
          const SizedBox(height: 4),
          Text(etiqueta, textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: FWColors.textMuted, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _ScheduleRow extends StatelessWidget {
  final ReservaHoy reserva;
  const _ScheduleRow({required this.reserva});

  bool get _enProceso => reserva.estado == 'En Proceso';

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
            width: 36,
            height: 36,
            decoration: BoxDecoration(color: FWColors.primaryBlue.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.work_outline, size: 16, color: FWColors.primaryBlue),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${reserva.hora} — ${reserva.servicio}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text('${reserva.direccionCliente} · Cliente: ${reserva.nombreCliente}', style: const TextStyle(fontSize: 11, color: FWColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: _enProceso ? const Color(0xFFDCFCE7) : const Color(0xFFFEF9C3),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              reserva.estado,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _enProceso ? const Color(0xFF15803D) : const Color(0xFFA16207)),
            ),
          ),
        ],
      ),
    );
  }
}

class _CertRow extends StatelessWidget {
  final IconData icon;
  final String titulo;
  final String? subtitulo;
  const _CertRow({required this.icon, required this.titulo, this.subtitulo});

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
            width: 32,
            height: 32,
            decoration: BoxDecoration(color: FWColors.primaryBlue.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(9)),
            child: Icon(icon, size: 14, color: FWColors.primaryBlue),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(titulo, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                if (subtitulo != null) Text(subtitulo!, style: const TextStyle(fontSize: 11, color: FWColors.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
