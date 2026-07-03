import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../widgets/trabajador_drawer.dart';
import '../widgets/trabajador_header.dart';
import '../widgets/trabajador_footer.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

// Nombres en español para días y meses
const _diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const _meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

String _formatFechaEspanol(DateTime date) {
  final dia = _diasSemana[date.weekday - 1];
  final mes = _meses[date.month - 1];
  return '$dia, ${date.day} de $mes';
}

String _formatFechaCorta(String isoDate) {
  try {
    final date = DateTime.parse(isoDate);
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}';
  } catch (_) {
    return '';
  }
}

class EmpleadoAgendaView extends StatefulWidget {
  const EmpleadoAgendaView({super.key});

  @override
  State<EmpleadoAgendaView> createState() => _EmpleadoAgendaViewState();
}

class _EmpleadoAgendaViewState extends State<EmpleadoAgendaView>
    with SingleTickerProviderStateMixin {
  // ── Datos ──────────────────────────────────────────────────
  List<dynamic> _serviciosHoy = [];
  List<dynamic> _serviciosSemana = [];
  List<dynamic> _serviciosMes = [];
  bool _isLoading = true;
  String? _error;
  int _userId = 0;
  String _userName = '';

  // ── Filtro activo ─────────────────────────────────────────
  int _activeFilter = 0; // 0=HOY, 1=SEMANA, 2=MES, 3=COMPLETADOS, 4=PENDIENTES
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  bool _scrolled = false;

  // ── Animación ─────────────────────────────────────────────
  late AnimationController _animController;
  late Animation<double> _fadeIn;

  // ── Paleta ────────────────────────────────────────────────
  static const Color _primary = Color(0xFF0066FF); // Azul web
  static const Color _bgPage = Color(0xFFF0F2F7); // Fondo agenda web
  static const Color _cardBg = Colors.white;
  static const Color _textDark = Color(0xFF080C1E); // Oscuro web
  static const Color _textMuted = Color(0xFF64748B); // Muted web
  static const String _font = 'Kanit';

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeIn = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();

    _searchController.addListener(() {
      setState(() => _searchQuery = _searchController.text.trim().toLowerCase());
    });

    _loadUserAndFetch();
  }

  @override
  void dispose() {
    _animController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadUserAndFetch() async {
    final prefs = await SharedPreferences.getInstance();
    _userId = prefs.getInt('userId') ?? 0;
    _userName = prefs.getString('userName') ?? 'Empleado';
    await _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final cookieToken = await secureStorage.read('cookie_token');

      Map<String, String> headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      // Llamar tres endpoints en paralelo
      final results = await Future.wait([
        http.get(
          Uri.parse('${ApiConstants.getEmpleadosEndpoint}/$_userId/servicios-hoy'),
          headers: headers,
        ),
        http.get(
          Uri.parse('${ApiConstants.getEmpleadosEndpoint}/$_userId/agenda-semanal'),
          headers: headers,
        ),
        http.get(
          Uri.parse('${ApiConstants.getEmpleadosEndpoint}/$_userId/agenda-mensual'),
          headers: headers,
        ),
      ]);

      final resHoy = results[0];
      final resSemana = results[1];
      final resMes = results[2];

      if (resHoy.statusCode == 200 || resHoy.statusCode == 201) {
        final dataHoy = json.decode(resHoy.body);
        _serviciosHoy = dataHoy['data'] ?? [];
      }

      if (resSemana.statusCode == 200 || resSemana.statusCode == 201) {
        final dataSemana = json.decode(resSemana.body);
        _serviciosSemana = dataSemana['data'] ?? [];
      }

      if (resMes.statusCode == 200 || resMes.statusCode == 201) {
        final dataMes = json.decode(resMes.body);
        _serviciosMes = dataMes['data'] ?? [];
      }

      setState(() => _isLoading = false);
    } catch (e) {
      setState(() {
        _error = 'Error de conexión: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _actualizarEstado(int reservaId, String nuevoEstado) async {
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';

      final url = Uri.parse('${ApiConstants.baseUrl}/reservas/$reservaId/estado');
      final res = await http.patch(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({'estado': nuevoEstado}),
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Estado actualizado'), backgroundColor: Colors.green),
        );
        _fetchData(); // Recargar datos
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Error al actualizar estado'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error de red: $e'), backgroundColor: Colors.red),
      );
    }
  }

  // ── Cálculo de estadísticas ───────────────────────────────
  int get _countHoy => _serviciosHoy.length;

  int get _countSemana => _serviciosSemana.length;

  int get _countMes => _serviciosMes.length;

  int get _countCompletados => _serviciosMes
      .where((r) =>
          r['Estado'] == 'Completado' || r['Estado'] == 'Finalizado')
      .length;

  int get _countPendientes => _serviciosMes
      .where((r) => r['Estado'] != 'Completado' && r['Estado'] != 'Finalizado' && r['Estado'] != 'Cancelado')
      .length;

  // ── Lista filtrada ────────────────────────────────────────
  List<dynamic> get _filteredList {
    List<dynamic> base;
    switch (_activeFilter) {
      case 0:
        base = _serviciosHoy;
        break;
      case 1:
        base = _serviciosSemana;
        break;
      case 2:
        base = _serviciosMes;
        break;
      case 3:
        base = _serviciosMes
            .where((r) =>
                r['Estado'] == 'Completado' || r['Estado'] == 'Finalizado')
            .toList();
        break;
      case 4:
        base = _serviciosMes
            .where((r) => r['Estado'] != 'Completado' && r['Estado'] != 'Finalizado' && r['Estado'] != 'Cancelado')
            .toList();
        break;
      default:
        base = _serviciosHoy;
    }

    if (_searchQuery.isEmpty) return base;

    return base.where((r) {
      final clienteNombre =
          (r['cliente']?['Nombre'] ?? '').toString().toLowerCase();
      final clienteDir =
          (r['cliente']?['Direccion'] ?? '').toString().toLowerCase();
      final servicios = (r['servicios'] as List?)
              ?.map((s) => (s['Nombre_Servicio'] ?? '').toString().toLowerCase())
              .join(' ') ??
          '';
      return clienteNombre.contains(_searchQuery) ||
          clienteDir.contains(_searchQuery) ||
          servicios.contains(_searchQuery);
    }).toList();
  }

  Map<String, int> get _kpiSnapshot => {
        'serviciosHoy': _countHoy,
        'serviciosSemana': _countSemana,
        'completados': _countCompletados,
        'pendientes': _countPendientes,
      };

  @override
  Widget build(BuildContext context) {
    final today = _formatFechaEspanol(DateTime.now());
    final width = MediaQuery.of(context).size.width;
    final isWide = width >= 800;

    return Scaffold(
      backgroundColor: _bgPage,
      drawer: const TrabajadorDrawer(activeTab: 'agenda'),
      appBar: TrabajadorHeader(
        activeTab: 'agenda',
        scrolled: _scrolled,
        onGoAgenda: () {
          // Scroll to top or do nothing since we are on Agenda
        },
        onGoPerfil: () {
          Navigator.pushReplacementNamed(context, '/perfilTrabajador');
        },
        onLogout: _showLogoutDialog,
      ),
      body: SafeArea(
        child: NotificationListener<ScrollNotification>(
          onNotification: (notification) {
            if (notification is ScrollUpdateNotification) {
              final isScrolled = notification.metrics.pixels > 10;
              if (isScrolled != _scrolled) {
                setState(() => _scrolled = isScrolled);
              }
            }
            return false;
          },
          child: FadeTransition(
            opacity: _fadeIn,
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: _primary))
                : _error != null
                    ? _buildError()
                    : RefreshIndicator(
                        onRefresh: _fetchData,
                        color: _primary,
                        child: CustomScrollView(
                          slivers: [
                            // ── TOP STRIP DE GRADIENTE (WEB STYLE) ──
                            SliverToBoxAdapter(
                              child: Container(
                                height: 3,
                                decoration: const BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [Color(0xFF0066FF), Color(0xFF7C3AED), Color(0xFF10B981)],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  ),
                                ),
                              ),
                            ),

                            // ── HERO HEADER ──
                            SliverToBoxAdapter(child: _buildHeader(today, isWide)),

                            // ── BARRA DE BÚSQUEDA Y FILTROS ──
                            SliverToBoxAdapter(
                              child: Center(
                                child: Container(
                                  constraints: const BoxConstraints(maxWidth: 1200),
                                  child: _buildSearchBar(isWide),
                                ),
                              ),
                            ),
                            SliverToBoxAdapter(
                              child: Center(
                                child: Container(
                                  constraints: const BoxConstraints(maxWidth: 1200),
                                  child: _buildStatsCards(isWide),
                                ),
                              ),
                            ),

                            // ── TÍTULO DE SECCIÓN ──
                            SliverToBoxAdapter(
                              child: Center(
                                child: Container(
                                  constraints: const BoxConstraints(maxWidth: 1200),
                                  child: _buildSectionTitle(),
                                ),
                              ),
                            ),

                            // ── LISTA/GRID DE ÓRDENES ──
                            _filteredList.isEmpty
                                ? SliverFillRemaining(hasScrollBody: false, child: _buildEmpty())
                                : SliverPadding(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: isWide ? 40 : 20,
                                    ),
                                    sliver: SliverToBoxAdapter(
                                      child: Center(
                                        child: Container(
                                          constraints: const BoxConstraints(maxWidth: 1200),
                                          child: isWide
                                              ? GridView.builder(
                                                  shrinkWrap: true,
                                                  physics: const NeverScrollableScrollPhysics(),
                                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                                    crossAxisCount: 2,
                                                    crossAxisSpacing: 20,
                                                    mainAxisSpacing: 20,
                                                    mainAxisExtent: 260,
                                                  ),
                                                  itemCount: _filteredList.length,
                                                  itemBuilder: (context, index) =>
                                                      _buildServiceCard(_filteredList[index]),
                                                )
                                              : ListView.builder(
                                                  shrinkWrap: true,
                                                  physics: const NeverScrollableScrollPhysics(),
                                                  itemCount: _filteredList.length,
                                                  itemBuilder: (context, index) =>
                                                      _buildServiceCard(_filteredList[index]),
                                                ),
                                        ),
                                      ),
                                    ),
                                  ),

                            const SliverToBoxAdapter(child: SizedBox(height: 48)),

                            // ── FOOTER DEL TRABAJADOR ──
                            SliverToBoxAdapter(
                              child: TrabajadorFooter(
                                onGoAgenda: () {},
                                onGoPerfil: () {
                                  Navigator.pushReplacementNamed(context, '/perfilTrabajador');
                                },
                                kpiSnapshot: _kpiSnapshot,
                              ),
                            ),
                          ],
                        ),
                      ),
          ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  HERO HEADER
  // ══════════════════════════════════════════════════════════
  Widget _buildHeader(String today, bool isWide) {
    return Center(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 1200),
        padding: EdgeInsets.fromLTRB(isWide ? 40 : 20, 32, isWide ? 40 : 20, 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'PANEL DE TRABAJO',
                    style: TextStyle(
                      fontFamily: _font,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: _primary,
                      letterSpacing: 1.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Mis Órdenes',
                    style: TextStyle(
                      fontFamily: _font,
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: _textDark,
                      letterSpacing: -0.6,
                    ),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: _cardBg,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.calendar_today_rounded, color: _primary, size: 14),
                  const SizedBox(width: 8),
                  Text(
                    today,
                    style: const TextStyle(
                      fontFamily: _font,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: _textDark,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  BARRA DE BÚSQUEDA
  // ══════════════════════════════════════════════════════════
  Widget _buildSearchBar(bool isWide) {
    return Padding(
      padding: EdgeInsets.fromLTRB(isWide ? 40 : 20, 16, isWide ? 40 : 20, 0),
      child: Container(
        decoration: BoxDecoration(
          color: _cardBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: TextField(
          controller: _searchController,
          style: const TextStyle(
            fontFamily: _font,
            fontSize: 14.5,
            color: _textDark,
            fontWeight: FontWeight.w500,
          ),
          decoration: InputDecoration(
            hintText: 'Buscar por cliente, servicio o dirección...',
            hintStyle: TextStyle(
              fontFamily: _font,
              fontSize: 14,
              color: _textMuted.withOpacity(0.65),
              fontWeight: FontWeight.w400,
            ),
            prefixIcon: Icon(Icons.search_rounded, color: _textMuted.withOpacity(0.6), size: 22),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 16, horizontal: 18),
          ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  TARJETAS DE FILTROS (MÉTRICAS WEB STYLE)
  // ══════════════════════════════════════════════════════════
  Widget _buildStatsCards(bool isWide) {
    final stats = [
      _StatData(
        icon: Icons.wb_sunny_rounded,
        label: 'Hoy',
        value: _countHoy,
        color: const Color(0xFF3B82F6),
        gradient: const [Color(0xFFEEF2FF), Color(0xFFE0E7FF)],
      ),
      _StatData(
        icon: Icons.calendar_today_rounded,
        label: 'Esta Semana',
        value: _countSemana,
        color: const Color(0xFF8B5CF6),
        gradient: const [Color(0xFFF5F3FF), Color(0xFFEDE9FE)],
      ),
      _StatData(
        icon: Icons.calendar_month_rounded,
        label: 'Este Mes',
        value: _countMes,
        color: const Color(0xFFEC4899),
        gradient: const [Color(0xFFFDF2F8), Color(0xFFFCE7F3)],
      ),
      _StatData(
        icon: Icons.check_circle_rounded,
        label: 'Completados',
        value: _countCompletados,
        color: const Color(0xFF10B981),
        gradient: const [Color(0xFFF0FDF4), Color(0xFFDCFCE7)],
      ),
      _StatData(
        icon: Icons.access_time_rounded,
        label: 'Pendientes',
        value: _countPendientes,
        color: const Color(0xFFF59E0B),
        gradient: const [Color(0xFFFFFBEB), Color(0xFFFEF3C7)],
      ),
    ];

    if (isWide) {
      // 5 Columnas en Desktop/Horizontal
      return Padding(
        padding: const EdgeInsets.fromLTRB(40, 20, 40, 0),
        child: Row(
          children: List.generate(stats.length, (index) {
            return Expanded(
              child: Container(
                margin: EdgeInsets.only(
                  right: index == stats.length - 1 ? 0 : 16,
                ),
                child: _buildFilterCard(stats[index], index),
              ),
            );
          }),
        ),
      );
    } else {
      // Grid 2x2 + 1 en Portrait Móvil
      return Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(child: _buildFilterCard(stats[0], 0)),
                const SizedBox(width: 12),
                Expanded(child: _buildFilterCard(stats[1], 1)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildFilterCard(stats[2], 2)),
                const SizedBox(width: 12),
                Expanded(child: _buildFilterCard(stats[3], 3)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _buildFilterCard(stats[4], 4)),
                const SizedBox(width: 12),
                const Spacer(),
              ],
            ),
          ],
        ),
      );
    }
  }

  Widget _buildFilterCard(_StatData s, int index) {
    final isActive = _activeFilter == index;

    return GestureDetector(
      onTap: () => setState(() => _activeFilter = index),
      child: MouseRegion(
        cursor: SystemMouseCursors.click,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: isActive ? Colors.white : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isActive ? s.color : const Color(0xFFE2E8F0),
              width: isActive ? 2 : 1,
            ),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: s.color.withOpacity(0.08),
                      blurRadius: 16,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 6,
                      offset: const Offset(0, 3),
                    ),
                  ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: s.color.withOpacity(0.09),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(s.icon, color: s.color, size: 18),
                  ),
                  if (isActive)
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: s.color,
                        shape: BoxShape.circle,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                s.value.toString(),
                style: const TextStyle(
                  fontFamily: _font,
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: _textDark,
                  height: 1.1,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                s.label,
                style: const TextStyle(
                  fontFamily: _font,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: _textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  TÍTULO DE SECCIÓN
  // ══════════════════════════════════════════════════════════
  Widget _buildSectionTitle() {
    final labels = ['SERVICIOS DE HOY', 'SERVICIOS DE LA SEMANA', 'SERVICIOS DEL MES', 'COMPLETADOS', 'PENDIENTES'];
    final width = MediaQuery.of(context).size.width;
    final isWide = width >= 800;

    return Padding(
      padding: EdgeInsets.fromLTRB(isWide ? 40 : 20, 32, isWide ? 40 : 20, 16),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 1,
              color: const Color(0xFFE2E8F0),
            ),
          ),
          const SizedBox(width: 14),
          Text(
            labels[_activeFilter],
            style: const TextStyle(
              fontFamily: _font,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: _textMuted,
              letterSpacing: 1,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: _primary,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _filteredList.length.toString(),
              style: const TextStyle(
                fontFamily: _font,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Container(
              height: 1,
              color: const Color(0xFFE2E8F0),
            ),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  TARJETA DE SERVICIO (WEB CARD STYLE)
  // ══════════════════════════════════════════════════════════
  Widget _buildServiceCard(dynamic reserva) {
    final cliente = reserva['cliente'] ?? {};
    final clienteNombre = cliente['Nombre'] ?? 'Sin nombre';
    final clienteTelf = cliente['Telefono'] ?? 'Sin teléfono';
    final clienteDir = cliente['Direccion'] ?? 'Sin dirección';
    final estado = reserva['Estado'] ?? 'Pendiente';
    final horaStr = reserva['Hora'] != null
        ? reserva['Hora'].toString().split('T').last.substring(0, 5)
        : '--:--';
    final servicios = (reserva['servicios'] as List?) ?? [];
    final fechaStr = reserva['fecha'] != null
        ? _formatFechaCorta(reserva['fecha'].toString())
        : '';

    // Iniciales
    String initials = '??';
    if (clienteNombre.isNotEmpty && clienteNombre != 'Sin nombre') {
      final parts = clienteNombre.trim().split(' ');
      if (parts.length > 1) {
        initials = '${parts[0][0]}${parts[1][0]}'.toUpperCase();
      } else {
        initials = clienteNombre
            .substring(0, 2 > clienteNombre.length ? clienteNombre.length : 2)
            .toUpperCase();
      }
    }

    // Colores por estado (Web style)
    Color accentColor;
    Color pillBg;
    Color pillText;

    if (estado == 'Completado' || estado == 'Finalizado') {
      accentColor = const Color(0xFF10B981); // Emerald green
      pillBg = const Color(0xFF10B981).withOpacity(0.09);
      pillText = const Color(0xFF059669);
    } else if (estado == 'Cancelado' || estado == 'Cancelada') {
      accentColor = const Color(0xFFEF4444); // Red
      pillBg = const Color(0xFFEF4444).withOpacity(0.09);
      pillText = const Color(0xFFDC2626);
    } else if (estado == 'En proceso' || estado == 'En Proceso') {
      accentColor = const Color(0xFF3B82F6); // Blue
      pillBg = const Color(0xFF3B82F6).withOpacity(0.09);
      pillText = const Color(0xFF2563EB);
    } else {
      accentColor = const Color(0xFFF59E0B); // Orange/Amber
      pillBg = const Color(0xFFF59E0B).withOpacity(0.09);
      pillText = const Color(0xFFD97706);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: _cardBg,
        borderRadius: BorderRadius.circular(16),
        border: Border(
          top: BorderSide(color: accentColor, width: 4), // Border superior web style
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Fila superior: avatar + nombre + estado
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFFE2E8F0), width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      initials,
                      style: const TextStyle(
                        fontFamily: _font,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: _textMuted,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        clienteNombre,
                        style: const TextStyle(
                          fontFamily: _font,
                          fontSize: 16.5,
                          fontWeight: FontWeight.w800,
                          color: _textDark,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          const Icon(Icons.access_time_rounded, size: 12.5, color: _primary),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              '$horaStr${_activeFilter != 0 ? '  •  $fechaStr' : ''}',
                              style: const TextStyle(
                                fontFamily: _font,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: _primary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Pill de estado con punto interno
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: pillBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: pillText,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        estado,
                        style: TextStyle(
                          fontFamily: _font,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: pillText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 14),

            // Servicios asignados
            if (servicios.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0066FF).withOpacity(0.06),
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.home_repair_service_outlined, size: 14, color: Color(0xFF0052CC)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        servicios.map((s) => s['Nombre_Servicio'] ?? '').join(', '),
                        style: const TextStyle(
                          fontFamily: _font,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0052CC),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

            const SizedBox(height: 12),

            // Dirección y teléfono
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(9),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.location_on_rounded, size: 14, color: _primary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      clienteDir,
                      style: const TextStyle(
                        fontFamily: _font,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: _textDark,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 1,
                    height: 14,
                    color: const Color(0xFFCBD5E1),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.phone_rounded, size: 14, color: _primary),
                  const SizedBox(width: 4),
                  Text(
                    clienteTelf,
                    style: const TextStyle(
                      fontFamily: _font,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: _textDark,
                    ),
                  ),
                ],
              ),
            ),

            // Selector de estado (Si no está completado ni cancelado)
            if (estado != 'Completado' && estado != 'Finalizado' && estado != 'Cancelado') ...[
              const SizedBox(height: 12),
              GestureDetector(
                onTap: () => _showEstadoModal(reserva),
                child: Container(
                  height: 42,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.edit_road_rounded, size: 14, color: _textMuted.withOpacity(0.7)),
                          const SizedBox(width: 8),
                          Text(
                            'Estado: $estado',
                            style: const TextStyle(
                              fontFamily: _font,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: _textDark,
                            ),
                          ),
                        ],
                      ),
                      const Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: _textMuted),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showEstadoModal(dynamic reserva) {
    final id = reserva['ID_Reserva'];
    if (id == null) return;

    final cliente = reserva['cliente'] ?? {};
    final clienteNombre = cliente['Nombre'] ?? 'Sin nombre';
    final serviciosList = (reserva['servicios'] as List?) ?? [];
    final serviciosNombres = serviciosList.isEmpty
        ? 'Sin servicio asignado'
        : serviciosList.map((s) => s['Nombre_Servicio'] ?? '').join(', ');

    final estadoActual = reserva['Estado'] ?? 'Pendiente';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A), // Modal oscuro premium
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext context) {
        return SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Handle
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      margin: const EdgeInsets.only(bottom: 24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                  const Text(
                    'Modificar Estado de Orden',
                    style: TextStyle(
                      fontFamily: _font,
                      fontSize: 19,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Servicio: $serviciosNombres',
                    style: TextStyle(
                      fontFamily: _font,
                      fontSize: 13.5,
                      color: Colors.white.withOpacity(0.7),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Cliente: $clienteNombre',
                    style: TextStyle(
                      fontFamily: _font,
                      fontSize: 13.5,
                      color: Colors.white.withOpacity(0.7),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'NUEVO ESTADO',
                    style: TextStyle(
                      fontFamily: _font,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: _primary,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(height: 12),
                  // Opciones
                  _buildEstadoOption(id, 'Pendiente', Icons.access_time_rounded, const Color(0xFFF59E0B), estadoActual),
                  _buildEstadoOption(id, 'Confirmado', Icons.thumb_up_rounded, const Color(0xFF06B6D4), estadoActual),
                  _buildEstadoOption(id, 'En Camino', Icons.directions_car_rounded, const Color(0xFF8B5CF6), estadoActual),
                  _buildEstadoOption(id, 'En Proceso', Icons.autorenew_rounded, const Color(0xFF3B82F6), estadoActual),
                  _buildEstadoOption(id, 'Completado', Icons.check_circle_rounded, const Color(0xFF10B981), estadoActual),
                  _buildEstadoOption(id, 'Cancelado', Icons.cancel_rounded, const Color(0xFFEF4444), estadoActual),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildEstadoOption(int id, String estado, IconData icon, Color color, String estadoActual) {
    final isSelected = estado.toLowerCase() == estadoActual.toLowerCase();
    return InkWell(
      onTap: () {
        Navigator.pop(context);
        _actualizarEstado(id, estado);
      },
      borderRadius: BorderRadius.circular(12),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.12) : Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : Colors.white.withOpacity(0.08),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Text(
              estado,
              style: TextStyle(
                fontFamily: _font,
                fontSize: 14.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? color : Colors.white.withOpacity(0.9),
              ),
            ),
            const Spacer(),
            if (isSelected) Icon(Icons.check, color: color, size: 20),
          ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  ESTADO VACÍO
  // ══════════════════════════════════════════════════════════
  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 48),
          Icon(Icons.cleaning_services_outlined, size: 56, color: _textMuted.withOpacity(0.3)),
          const SizedBox(height: 16),
          const Text(
            'Sin servicios aquí',
            style: TextStyle(
              fontFamily: _font,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: _textDark,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'No hay servicios registrados para esta vista',
            style: TextStyle(
              fontFamily: _font,
              fontSize: 13.5,
              color: _textMuted.withOpacity(0.8),
            ),
          ),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  ERROR
  // ══════════════════════════════════════════════════════════
  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.wifi_off_rounded, size: 48, color: _textMuted.withOpacity(0.4)),
            const SizedBox(height: 16),
            Text(
              _error ?? 'Error desconocido',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: _font,
                fontSize: 14.5,
                color: _textMuted.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _fetchData,
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Reintentar'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  DIÁLOGO DE CIERRE DE SESIÓN
  // ══════════════════════════════════════════════════════════
  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withOpacity(0.09), width: 1),
        ),
        title: const Text(
          'Cerrar sesión',
          style: TextStyle(
            fontFamily: _font,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        content: const Text(
          '¿Deseas cerrar tu sesión?',
          style: TextStyle(
            fontFamily: _font,
            color: Color(0xFF94A3B8),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar',
                style: TextStyle(fontFamily: _font, color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            onPressed: () async {
              final auth = Provider.of<AuthProvider>(context, listen: false);
              Navigator.pop(ctx);
              await auth.logout();
              if (context.mounted) {
                Navigator.pushNamedAndRemoveUntil(
                    context, '/home', (route) => false);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF5050),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text('Cerrar sesión',
                style: TextStyle(fontFamily: _font, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

// ══════════════════════════════════════════════════════════
//  MODELO DE ESTADÍSTICAS
// ══════════════════════════════════════════════════════════
class _StatData {
  final IconData icon;
  final String label;
  final int value;
  final Color color;
  final List<Color> gradient;

  const _StatData({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    required this.gradient,
  });
}