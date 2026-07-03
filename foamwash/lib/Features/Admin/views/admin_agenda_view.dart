import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:foamwash/Api/api_constants.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/admin_header.dart';
import '../widgets/admin_footer.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

String _formatFechaCorta(String isoDate) {
  try {
    final date = DateTime.parse(isoDate);
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}';
  } catch (_) {
    return '';
  }
}

class AdminAgendaView extends StatefulWidget {
  const AdminAgendaView({super.key});

  @override
  State<AdminAgendaView> createState() => _AdminAgendaViewState();
}

class _AdminAgendaViewState extends State<AdminAgendaView> {
  String _currentView = 'hoy'; // hoy, semana, mes
  String _statusFilter = 'Todos'; // Todos, Pendiente, Aceptado, En Camino, En Proceso, Completado, Cancelado
  List<dynamic> _reservas = [];
  List<dynamic> _empleados = [];
  bool _isLoading = true;
  String? _error;

  static const Color _primary = Color(0xFF0066FF);
  static const Color _bgField = Color(0xFFF4F7FF);
  static const Color _textColor = Color(0xFF080C1E);

  @override
  void initState() {
    super.initState();
    SecurityUtils.secureScreen();
    _checkAccess();
    _fetchData();
  }

  @override
  void dispose() {
    SecurityUtils.clearSecureScreen();
    super.dispose();
  }

  Future<void> _checkAccess() async {
    final secureStorage = SecureStorageService();
    final email = await secureStorage.read('userEmail');
    final role = await secureStorage.read('userRole');
    if (email != 'admin@gmail.com' && (role == null || role.toLowerCase() != 'admin')) {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
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

      final response = await http.get(
        Uri.parse(ApiConstants.getReservasEndpoint),
        headers: headers,
      );

      final responseEmpleados = await http.get(
        Uri.parse(ApiConstants.getEmpleadosEndpoint),
        headers: headers,
      );

      if (response.statusCode == 401 || responseEmpleados.statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final dataEmp = responseEmpleados.statusCode == 200 || responseEmpleados.statusCode == 201
            ? json.decode(responseEmpleados.body)['data'] ?? []
            : [];
        if (mounted) {
          setState(() {
            _reservas = data['data'] ?? data;
            _empleados = dataEmp;
            _isLoading = false;
          });
        }
      } else {
        if (mounted) {
          setState(() {
            _error = 'Error al cargar las reservas. Código: ${response.statusCode}';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Error de conexión: $e';
          _isLoading = false;
        });
      }
    }
  }

  double _getIngresosTotales() {
    final now = DateTime.now();
    double total = 0.0;
    for (var r in _reservas) {
      final fechaStr = r['fecha'];
      if (fechaStr != null) {
        final d = DateTime.tryParse(fechaStr);
        if (d != null && d.month == now.month && d.year == now.year) {
          if (r['Estado'] == 'Completado' || r['Estado'] == 'Finalizado' || r['Estado'] == 'Completada') {
            if (r['servicios'] != null) {
              for (var s in r['servicios']) {
                total += double.tryParse((s['Precio'] ?? 0).toString()) ?? 0.0;
              }
            }
          }
        }
      }
    }
    return total;
  }

  int _getPendientes() {
    return _reservas.where((r) => r['Estado'] == 'Pendiente').length;
  }

  int _getOrdeneHoyCount() {
    final now = DateTime.now();
    return _reservas.where((r) {
      final fechaStr = r['fecha'];
      if (fechaStr == null) return false;
      final d = DateTime.tryParse(fechaStr);
      return d != null && d.day == now.day && d.month == now.month && d.year == now.year;
    }).length;
  }

  String _getInitials(String name) {
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'CL';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[parts.length - 1][0]}'.toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final bool isDesktop = width >= 900;
    final currencyFormat = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

    return Scaffold(
      backgroundColor: _bgField,
      drawer: const AdminDrawer(),
      appBar: const AdminHeader(activeTab: 'agenda'),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _primary))
          : _error != null
              ? Center(
                  child: Container(
                    margin: const EdgeInsets.all(24),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFF6B6B).withOpacity(0.2)),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline_rounded, color: Color(0xFFFF6B6B), size: 48),
                        const SizedBox(height: 16),
                        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(fontFamily: 'Kanit', color: _textColor)),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _fetchData,
                          style: ElevatedButton.styleFrom(backgroundColor: _primary),
                          child: const Text('Reintentar', style: TextStyle(color: Colors.white)),
                        )
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  color: _primary,
                  onRefresh: _fetchData,
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
                                // Title block
                                _buildTitleHeader(),
                                const SizedBox(height: 24),

                                // Controls Card (Filters & Toggles)
                                _buildControlsCard(),
                                const SizedBox(height: 20),

                                // List of bookings
                                _buildReservasList(),
                              ],
                            ),
                          ),
                        ),

                        // Footer
                        AdminFooter(
                          ordeneHoy: _getOrdeneHoyCount(),
                          ordensPendientes: _getPendientes(),
                          empleadosActivos: _empleados.where((e) => e['estado'] == 'activo').length,
                          ingresosMes: currencyFormat.format(_getIngresosTotales()),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildTitleHeader() {
    return Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: _primary.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.calendar_today_rounded, color: _primary, size: 18),
        ),
        const SizedBox(width: 12),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Agenda de Reservas',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: _textColor,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                'Gestión y asignación de órdenes de servicio',
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
    );
  }

  Widget _buildControlsCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.01),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'FILTRAR POR ESTADO',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Color(0xFF8898B3),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          _buildStatusFilter(),
          const SizedBox(height: 16),
          const Text(
            'PERÍODO DE VISTA',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Color(0xFF8898B3),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          _buildViewToggle(),
        ],
      ),
    );
  }

  Widget _buildViewToggle() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F7FF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE0E8F5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildToggleBtn('Hoy', 'hoy'),
          _buildToggleBtn('Semana', 'semana'),
          _buildToggleBtn('Mes', 'mes'),
        ],
      ),
    );
  }

  Widget _buildStatusFilter() {
    final filters = ['Todos', 'Pendiente', 'En Proceso', 'Completado', 'Cancelado'];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: filters.map((f) {
          final isActive = _statusFilter == f;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(
                f,
                style: TextStyle(
                  fontFamily: 'Kanit',
                  color: isActive ? Colors.white : const Color(0xFF64748B),
                  fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                  fontSize: 12.5,
                ),
              ),
              selected: isActive,
              selectedColor: _primary,
              backgroundColor: const Color(0xFFF8FAFF),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(
                  color: isActive ? Colors.transparent : const Color(0xFFE0E8F5),
                  width: 1,
                ),
              ),
              showCheckmark: false,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              onSelected: (selected) {
                if (selected) {
                  setState(() => _statusFilter = f);
                }
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildToggleBtn(String label, String value) {
    final isActive = _currentView == value;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _currentView = value;
          });
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isActive ? _primary : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: _primary.withOpacity(0.2),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    )
                  ]
                : [],
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Kanit',
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
                color: isActive ? Colors.white : const Color(0xFF64748B),
                fontSize: 13.5,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildReservasList() {
    final now = DateTime.now();
    final todayStr = now.toIso8601String().split('T')[0];

    final filtered = _reservas.where((r) {
      if (_statusFilter != 'Todos' && r['Estado'] != _statusFilter) return false;
      final fechaStr = r['fecha']?.toString().split('T')[0];
      if (_currentView == 'hoy') {
        return fechaStr == todayStr;
      }
      return true;
    }).toList();

    if (filtered.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 48),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFE0E8F5)),
        ),
        child: const Center(
          child: Text(
            'No hay reservas para esta vista.',
            style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3), fontSize: 14),
          ),
        ),
      );
    }

    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: filtered.length,
      itemBuilder: (context, index) {
        final r = filtered[index];
        final cliente = r['cliente'] ?? {};
        final clienteNombre = cliente['Nombre'] ?? 'Sin nombre';
        final clienteTelf = cliente['Telefono'] ?? 'Sin teléfono';
        final clienteDir = cliente['Direccion'] ?? 'Sin dirección';
        final estado = r['Estado'] ?? 'Pendiente';
        final horaStr = r['Hora'] != null
            ? r['Hora'].toString().split('T').last.substring(0, 5)
            : '--:--';
        final servicios = (r['servicios'] as List?) ?? [];
        final fechaStr = r['fecha'] != null
            ? _formatFechaCorta(r['fecha'].toString())
            : '';

        Color pillBg, pillText, borderColor;
        IconData pillIcon;
        if (estado == 'Completado' || estado == 'Finalizado' || estado == 'Completada') {
          pillBg = const Color(0xFFDCFCE7);
          pillText = const Color(0xFF15803D);
          borderColor = const Color(0xFF22C55E);
          pillIcon = Icons.check_circle_rounded;
        } else if (estado == 'Cancelado' || estado == 'Cancelada') {
          pillBg = const Color(0xFFFEF2F2);
          pillText = const Color(0xFFE11D48);
          borderColor = const Color(0xFFEF4444);
          pillIcon = Icons.cancel_rounded;
        } else if (estado == 'En proceso' || estado == 'En Proceso') {
          pillBg = const Color(0xFFE6F0FF);
          pillText = const Color(0xFF0052CC);
          borderColor = const Color(0xFF0066FF);
          pillIcon = Icons.autorenew_rounded;
        } else {
          pillBg = const Color(0xFFFFF7ED);
          pillText = const Color(0xFFC2410C);
          borderColor = const Color(0xFFF59E0B);
          pillIcon = Icons.access_time_rounded;
        }

        return GestureDetector(
          onTap: () => _showEditOrderDialog(r),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border(left: BorderSide(color: borderColor, width: 4)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.01),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              const Color(0xFF00B8FF).withOpacity(0.15),
                              const Color(0xFF0066FF).withOpacity(0.15),
                            ],
                          ),
                          shape: BoxShape.circle,
                        ),
                        child: Center(
                          child: Text(
                            _getInitials(clienteNombre),
                            style: const TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF0052CC),
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
                                fontFamily: 'Kanit',
                                fontSize: 14.5,
                                fontWeight: FontWeight.w800,
                                color: _textColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                const Icon(Icons.access_time_rounded, size: 12, color: Color(0xFF8898B3)),
                                const SizedBox(width: 4),
                                Text(
                                  '$horaStr${fechaStr.isNotEmpty ? '  •  $fechaStr' : ''}',
                                  style: const TextStyle(
                                    fontFamily: 'Kanit',
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: _primary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: pillBg,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(pillIcon, size: 11, color: pillText),
                            const SizedBox(width: 4),
                            Text(
                              estado,
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: pillText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 13, color: Color(0xFF8898B3)),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          clienteDir,
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 11.5,
                            color: Color(0xFF64748B),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Icon(Icons.phone_outlined, size: 13, color: Color(0xFF8898B3)),
                      const SizedBox(width: 4),
                      Text(
                        clienteTelf,
                        style: const TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 11.5,
                          color: Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    children: [
                      if (servicios.isNotEmpty)
                        ...servicios.map<Widget>((s) => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                s['Nombre_Servicio'] ?? '',
                                style: const TextStyle(
                                  fontFamily: 'Kanit',
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: Color(0xFF64748B),
                                ),
                              ),
                            )).toList()
                      else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFF1F2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Sin servicio',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFE11D48),
                            ),
                          ),
                        ),
                      if (r['empleado']?['Nombre'] != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEEF2FF),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Asignado: ${r['empleado']['Nombre']}',
                            style: const TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF4F46E5),
                            ),
                          ),
                        )
                      else
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Sin asignar',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFD97706),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  String _formatTimeOfDay(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
    final period = time.period == DayPeriod.am ? 'a.m.' : 'p.m.';
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute $period';
  }

  void _showEditOrderDialog(dynamic reserva) {
    final services = (reserva['servicios'] as List?) ?? [];
    final serviceName = services.isNotEmpty
        ? services.map((s) => s['Nombre_Servicio']).join(', ')
        : 'Sin servicio';
    final clienteNombre = reserva['cliente']?['Nombre'] ?? 'Cliente';

    DateTime selectedDate = DateTime.now();
    if (reserva['fecha'] != null) {
      try {
        selectedDate = DateTime.parse(reserva['fecha'].toString());
      } catch (_) {}
    }

    TimeOfDay selectedTime = const TimeOfDay(hour: 10, minute: 0);
    if (reserva['Hora'] != null) {
      try {
        final dateTime = DateTime.parse(reserva['Hora'].toString());
        selectedTime = TimeOfDay(hour: dateTime.hour, minute: dateTime.minute);
      } catch (_) {}
    }

    int? selectedEmpleadoId = reserva['empleado_Id_Usuario'] ?? reserva['empleado']?['Id_Usuario'];
    if (selectedEmpleadoId != null && !_empleados.any((emp) => emp['Id_Usuario'] == selectedEmpleadoId)) {
      selectedEmpleadoId = null;
    }

    bool isUpdating = false;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return Dialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              clipBehavior: Clip.antiAlias,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 450),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      color: _primary,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Editar Orden',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => Navigator.pop(context),
                            child: const Icon(Icons.close, color: Colors.white, size: 22),
                          ),
                        ],
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'SERVICIO',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF8898B3),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF4F7FF),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              serviceName,
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 13.5,
                                color: Color(0xFF64748B),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'El servicio no se puede modificar',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'CLIENTE',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF8898B3),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF4F7FF),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              clienteNombre,
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 13.5,
                                color: Color(0xFF64748B),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'El cliente no se puede modificar',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              color: Colors.grey,
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'EMPLEADO ASIGNADO',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF8898B3),
                            ),
                          ),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<int?>(
                            value: selectedEmpleadoId,
                            decoration: InputDecoration(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10),
                                borderSide: const BorderSide(color: _primary, width: 1.5),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            items: [
                              const DropdownMenuItem<int?>(
                                value: null,
                                child: Text('Sin asignar', style: TextStyle(fontFamily: 'Kanit', fontSize: 13.5)),
                              ),
                              ..._empleados.map((emp) {
                                return DropdownMenuItem<int?>(
                                  value: emp['Id_Usuario'] as int?,
                                  child: Text(emp['Nombre'] ?? 'Empleado sin nombre', style: const TextStyle(fontFamily: 'Kanit', fontSize: 13.5)),
                                );
                              }).toList(),
                            ],
                            onChanged: (val) {
                              setDialogState(() {
                                selectedEmpleadoId = val;
                              });
                            },
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'FECHA',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF8898B3),
                            ),
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () async {
                              final DateTime? date = await showDatePicker(
                                context: context,
                                initialDate: selectedDate,
                                firstDate: DateTime(2020),
                                lastDate: DateTime(2030),
                              );
                              if (date != null) {
                                setDialogState(() {
                                  selectedDate = date;
                                });
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${selectedDate.day.toString().padLeft(2, '0')}/${selectedDate.month.toString().padLeft(2, '0')}/${selectedDate.year}',
                                    style: const TextStyle(
                                      fontFamily: 'Kanit',
                                      fontSize: 13.5,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  const Icon(Icons.calendar_today, color: Color(0xFF8898B3), size: 18),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'HORA',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF8898B3),
                            ),
                          ),
                          const SizedBox(height: 6),
                          GestureDetector(
                            onTap: () async {
                              final TimeOfDay? time = await showTimePicker(
                                context: context,
                                initialTime: selectedTime,
                              );
                              if (time != null) {
                                setDialogState(() {
                                  selectedTime = time;
                                });
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _formatTimeOfDay(selectedTime),
                                    style: const TextStyle(
                                      fontFamily: 'Kanit',
                                      fontSize: 13.5,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  const Icon(Icons.access_time, color: Color(0xFF8898B3), size: 18),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: isUpdating ? null : () => Navigator.pop(context),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    side: const BorderSide(color: Color(0xFFE2E8F0)),
                                  ),
                                  child: const Text(
                                    'Cancelar',
                                    style: TextStyle(
                                      fontFamily: 'Kanit',
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF8898B3),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: ElevatedButton.icon(
                                  onPressed: isUpdating
                                      ? null
                                      : () async {
                                          setDialogState(() {
                                            isUpdating = true;
                                          });
                                          await _updateReservation(
                                            reservaId: reserva['ID_Reserva'] as int,
                                            empleadoId: selectedEmpleadoId,
                                            date: selectedDate,
                                            time: selectedTime,
                                          );
                                          if (mounted) {
                                            Navigator.pop(context);
                                            _fetchData();
                                          }
                                        },
                                  icon: isUpdating
                                      ? const SizedBox(
                                          width: 16,
                                          height: 16,
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : const Icon(Icons.save, size: 16),
                                  label: const Text(
                                    'Guardar',
                                    style: TextStyle(
                                      fontFamily: 'Kanit',
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    backgroundColor: _primary,
                                    foregroundColor: Colors.white,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    elevation: 0,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _updateReservation({
    required int reservaId,
    required int? empleadoId,
    required DateTime date,
    required TimeOfDay time,
  }) async {
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

      final dateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      final timeStr = '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}:00';
      final formattedFecha = '${dateStr}T00:00:00.000Z';
      final formattedHora = '${dateStr}T${timeStr}.000Z';

      final body = {
        'empleado_Id_Usuario': empleadoId,
        'fecha': formattedFecha,
        'Hora': formattedHora,
      };

      final response = await http.put(
        Uri.parse('${ApiConstants.getReservasEndpoint}/$reservaId'),
        headers: headers,
        body: json.encode(body),
      );

      if (response.statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      if (response.statusCode != 200 && response.statusCode != 201) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al guardar: ${response.statusCode}')),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error de conexión: $e')),
      );
    }
  }
}