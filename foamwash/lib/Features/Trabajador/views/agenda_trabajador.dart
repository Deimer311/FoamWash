import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../widgets/trabajador_drawer.dart';
import 'package:foamwash/Api/api_constants.dart';
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

  // ── Animación ─────────────────────────────────────────────
  late AnimationController _animController;
  late Animation<double> _fadeIn;

  // ── Paleta ────────────────────────────────────────────────
  static const Color _primary = Color(0xFF1A56FF);
  static const Color _primaryDark = Color(0xFF0A1435);
  static const Color _bgPage = Color(0xFFF4F7FF);
  static const Color _cardBg = Colors.white;
  static const Color _textDark = Color(0xFF1A2540);
  static const Color _textMuted = Color(0xFF8896AB);
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
          SnackBar(content: Text('Error al actualizar estado'), backgroundColor: Colors.red),
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

  @override
  Widget build(BuildContext context) {
    final today = _formatFechaEspanol(DateTime.now());

    return Scaffold(
      backgroundColor: _bgPage,
      endDrawer: const TrabajadorDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: _primaryDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [_primary, Color(0xFF3B82F6)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Center(
                child: Text(
                  'FW',
                  style: TextStyle(
                    fontFamily: _font,
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'FoamWash',
              style: TextStyle(
                fontFamily: _font,
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w800,
              ),
            ),
            Text(
              ' EM',
              style: TextStyle(
                fontFamily: _font,
                color: Colors.white.withOpacity(0.5),
                fontSize: 10,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu, color: Colors.white, size: 28),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeIn,
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: _primary))
              : _error != null
                  ? _buildError()
                  : RefreshIndicator(
                      onRefresh: _fetchData,
                      color: _primary,
                      child: CustomScrollView(
                        slivers: [
                          SliverToBoxAdapter(child: _buildHeader(today)),
                          SliverToBoxAdapter(child: _buildSearchBar()),
                          SliverToBoxAdapter(child: _buildStatsCards()),
                          SliverToBoxAdapter(child: _buildSectionTitle()),
                          _filteredList.isEmpty
                              ? SliverFillRemaining(child: _buildEmpty())
                              : SliverPadding(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 20),
                                  sliver: SliverList(
                                    delegate: SliverChildBuilderDelegate(
                                      (context, index) => _buildServiceCard(
                                          _filteredList[index]),
                                      childCount: _filteredList.length,
                                    ),
                                  ),
                                ),
                          const SliverToBoxAdapter(
                              child: SizedBox(height: 24)),
                        ],
                      ),
                    ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  HEADER
  // ══════════════════════════════════════════════════════════
  Widget _buildHeader(String today) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'PANEL DE TRABAJO',
                  style: TextStyle(
                    fontFamily: _font,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: _primary,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Mis Órdenes',
                  style: TextStyle(
                    fontFamily: _font,
                    fontSize: 26,
                    fontWeight: FontWeight.w900,
                    color: _textDark,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: _cardBg,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE0E4EF)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.calendar_today_rounded,
                    color: _textMuted, size: 14),
                const SizedBox(width: 6),
                Text(
                  today,
                  style: const TextStyle(
                    fontFamily: _font,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: _textDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  BARRA DE BÚSQUEDA
  // ══════════════════════════════════════════════════════════
  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Container(
        decoration: BoxDecoration(
          color: _cardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE0E4EF)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: TextField(
          controller: _searchController,
          style: const TextStyle(
            fontFamily: _font,
            fontSize: 14,
            color: _textDark,
          ),
          decoration: InputDecoration(
            hintText: 'Buscar por cliente, servicio o dirección..',
            hintStyle: TextStyle(
              fontFamily: _font,
              fontSize: 14,
              color: _textMuted.withOpacity(0.6),
            ),
            prefixIcon:
                Icon(Icons.search, color: _textMuted.withOpacity(0.5), size: 22),
            border: InputBorder.none,
            contentPadding:
                const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  TARJETAS DE ESTADÍSTICAS
  // ══════════════════════════════════════════════════════════
  Widget _buildStatsCards() {
    final stats = [
      _StatData(
        icon: Icons.wb_sunny_rounded,
        label: 'HOY',
        value: _countHoy,
        color: _primary,
        gradient: const [Color(0xFFEEF2FF), Color(0xFFE0E7FF)],
      ),
      _StatData(
        icon: Icons.calendar_today_rounded,
        label: 'ESTA SEMANA',
        value: _countSemana,
        color: const Color(0xFF6366F1),
        gradient: const [Color(0xFFF5F3FF), Color(0xFFEDE9FE)],
      ),
      _StatData(
        icon: Icons.calendar_month_rounded,
        label: 'ESTE MES',
        value: _countMes,
        color: const Color(0xFFEC4899),
        gradient: const [Color(0xFFFDF2F8), Color(0xFFFCE7F3)],
      ),
      _StatData(
        icon: Icons.check_circle_rounded,
        label: 'COMPLETADOS',
        value: _countCompletados,
        color: const Color(0xFF22C55E),
        gradient: const [Color(0xFFF0FDF4), Color(0xFFDCFCE7)],
      ),
      _StatData(
        icon: Icons.access_time_rounded,
        label: 'PENDIENTES',
        value: _countPendientes,
        color: const Color(0xFFF59E0B),
        gradient: const [Color(0xFFFFFBEB), Color(0xFFFEF3C7)],
      ),
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: SizedBox(
        height: 120,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: stats.length,
          separatorBuilder: (_, __) => const SizedBox(width: 10),
          itemBuilder: (context, index) {
            final s = stats[index];
            final isActive = _activeFilter == index;

            return GestureDetector(
              onTap: () => setState(() => _activeFilter = index),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 250),
                width: 140,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: s.gradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: isActive
                        ? s.color.withOpacity(0.5)
                        : Colors.transparent,
                    width: 2,
                  ),
                  boxShadow: isActive
                      ? [
                          BoxShadow(
                            color: s.color.withOpacity(0.15),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          ),
                        ]
                      : [],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: s.color.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(s.icon, color: s.color, size: 18),
                    ),
                    const Spacer(),
                    Text(
                      s.value.toString(),
                      style: TextStyle(
                        fontFamily: _font,
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: _textDark,
                      ),
                    ),
                    Text(
                      s.label,
                      style: TextStyle(
                        fontFamily: _font,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _textMuted,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  TÍTULO DE SECCIÓN
  // ══════════════════════════════════════════════════════════
  Widget _buildSectionTitle() {
    final labels = ['SERVICIOS DE HOY', 'SERVICIOS DE LA SEMANA', 'SERVICIOS DEL MES', 'COMPLETADOS', 'PENDIENTES'];
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
      child: Row(
        children: [
          Text(
            labels[_activeFilter],
            style: const TextStyle(
              fontFamily: _font,
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: _textMuted,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: _primary,
              borderRadius: BorderRadius.circular(10),
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
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════
  //  TARJETA DE SERVICIO
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

    // Colores por estado
    Color pillBg, pillText, borderColor;
    IconData pillIcon;
    if (estado == 'Completado' || estado == 'Finalizado') {
      pillBg = const Color(0xFFDCFCE7);
      pillText = const Color(0xFF15803D);
      borderColor = const Color(0xFF22C55E);
      pillIcon = Icons.check_circle_rounded;
    } else if (estado == 'Cancelado' || estado == 'Cancelada') {
      pillBg = const Color(0xFFFEF2F2);
      pillText = const Color(0xFFE11D48);
      borderColor = const Color(0xFFE11D48);
      pillIcon = Icons.cancel_rounded;
    } else if (estado == 'En proceso' || estado == 'En Proceso') {
      pillBg = const Color(0xFFEFF6FF);
      pillText = const Color(0xFF1A56FF);
      borderColor = const Color(0xFF1A56FF);
      pillIcon = Icons.autorenew_rounded;
    } else {
      pillBg = const Color(0xFFFFF7ED);
      pillText = const Color(0xFFC2410C);
      borderColor = const Color(0xFFF59E0B);
      pillIcon = Icons.access_time_rounded;
    }

    return InkWell(
      onTap: () => _showEstadoModal(reserva),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: _cardBg,
          borderRadius: BorderRadius.circular(16),
          border: Border(left: BorderSide(color: borderColor, width: 4)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Fila superior: avatar + nombre + hora + estado
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F4FF),
                    shape: BoxShape.circle,
                    border:
                        Border.all(color: const Color(0xFFD6E4FF), width: 1.5),
                  ),
                  child: Center(
                    child: Text(
                      initials,
                      style: const TextStyle(
                        fontFamily: _font,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: _primary,
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
                          fontSize: 17,
                          fontWeight: FontWeight.w800,
                          color: _textDark,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.access_time_rounded,
                              size: 13, color: _textMuted),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              '$horaStr${_activeFilter != 0 ? '  •  $fechaStr' : ''}',
                              style: TextStyle(
                                fontFamily: _font,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
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
                // Pill de estado
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: pillBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(pillIcon, size: 13, color: pillText),
                      const SizedBox(width: 4),
                      Text(
                        estado,
                        style: TextStyle(
                          fontFamily: _font,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: pillText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            // Dirección y teléfono
            Row(
              children: [
                Icon(Icons.location_on_outlined,
                    size: 14, color: _textMuted.withOpacity(0.7)),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    clienteDir,
                    style: TextStyle(
                      fontFamily: _font,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: _textDark.withOpacity(0.8),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 12),
                Icon(Icons.phone_outlined,
                    size: 14, color: _textMuted.withOpacity(0.7)),
                const SizedBox(width: 4),
                Text(
                  clienteTelf,
                  style: TextStyle(
                    fontFamily: _font,
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: _textDark.withOpacity(0.8),
                  ),
                ),
              ],
            ),
            // Servicios
            if (servicios.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: servicios
                    .map<Widget>((s) => Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            s['Nombre_Servicio'] ?? '',
                            style: TextStyle(
                              fontFamily: _font,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: _textDark.withOpacity(0.8),
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ],
          ],
        ),
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
      backgroundColor: Colors.white,
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
                  width: 40, height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE0E4EF),
                    borderRadius: BorderRadius.circular(4)
                  ),
                ),
              ),
              const Text('Modificar Estado de Orden', 
                style: TextStyle(fontFamily: _font, fontSize: 18, fontWeight: FontWeight.bold, color: _textDark)),
              const SizedBox(height: 16),
              Text('Servicio: $serviciosNombres', style: const TextStyle(fontFamily: _font, fontSize: 14, color: _textDark)),
              const SizedBox(height: 4),
              Text('Cliente: $clienteNombre', style: const TextStyle(fontFamily: _font, fontSize: 14, color: _textDark)),
              const SizedBox(height: 24),
              const Text('Nuevo Estado:', style: TextStyle(fontFamily: _font, fontSize: 13, fontWeight: FontWeight.w600, color: _textMuted)),
              const SizedBox(height: 12),
              // Opciones
              _buildEstadoOption(id, 'Pendiente', Icons.access_time_rounded, const Color(0xFFF59E0B), estadoActual),
              _buildEstadoOption(id, 'Confirmado', Icons.thumb_up_rounded, const Color(0xFF06B6D4), estadoActual),
              _buildEstadoOption(id, 'En Camino', Icons.directions_car_rounded, const Color(0xFF8B5CF6), estadoActual),
              _buildEstadoOption(id, 'En Proceso', Icons.autorenew_rounded, const Color(0xFF1A56FF), estadoActual),
              _buildEstadoOption(id, 'Completado', Icons.check_circle_rounded, const Color(0xFF22C55E), estadoActual),
              _buildEstadoOption(id, 'Cancelado', Icons.cancel_rounded, const Color(0xFFE11D48), estadoActual),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
      }
    );
  }

  Widget _buildEstadoOption(int id, String estado, IconData icon, Color color, String estadoActual) {
    final isSelected = estado.toLowerCase() == estadoActual.toLowerCase();
    return InkWell(
      onTap: () {
        Navigator.pop(context);
        _actualizarEstado(id, estado);
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: isSelected ? color : const Color(0xFFE0E4EF)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Text(
              estado,
              style: TextStyle(
                fontFamily: _font,
                fontSize: 15,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? color : _textDark,
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
          Icon(Icons.cleaning_services_outlined,
              size: 56, color: _textMuted.withOpacity(0.3)),
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
              fontSize: 13,
              color: _textMuted,
            ),
          ),
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
            Icon(Icons.wifi_off_rounded,
                size: 48, color: _textMuted.withOpacity(0.4)),
            const SizedBox(height: 16),
            Text(
              _error ?? 'Error desconocido',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: _font,
                fontSize: 14,
                color: _textMuted,
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
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Cerrar sesión',
          style: TextStyle(fontFamily: _font, fontWeight: FontWeight.w700),
        ),
        content: const Text(
          '¿Deseas cerrar tu sesión?',
          style: TextStyle(fontFamily: _font),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar',
                style: TextStyle(fontFamily: _font, color: _textMuted)),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final secureStorage = SecureStorageService();
              await secureStorage.clearAll();
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              if (mounted) {
                Navigator.pushNamedAndRemoveUntil(
                    context, '/home', (route) => false);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: _primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Cerrar sesión',
                style: TextStyle(fontFamily: _font)),
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