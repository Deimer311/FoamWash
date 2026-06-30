import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Api/api_constants.dart';
import '../widgets/admin_drawer.dart';
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

  // Helper properties
  static const Color _primary = Color(0xFF1A56FF);
  static const Color _primaryDark = Color(0xFF0A1435);
  static const Color _bgField = Color(0xFFF4F7FF);
  static const Color _textColor = Color(0xFF1A2540);

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
    final auth = context.read<AuthProvider>();
    if (!auth.isAdmin) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Navigator.pushReplacementNamed(context, '/home');
      });
    }
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

      final response = await http.get(
        Uri.parse(ApiConstants.getReservasEndpoint),
        headers: headers,
      );

      final responseEmpleados = await http.get(
        Uri.parse(ApiConstants.getEmpleadosEndpoint),
        headers: headers,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        final dataEmp = responseEmpleados.statusCode == 200 || responseEmpleados.statusCode == 201
            ? json.decode(responseEmpleados.body)['data'] ?? []
            : [];
        setState(() {
          _reservas = data['data'] ?? data;
          _empleados = dataEmp;
          _isLoading = false;
        });
      } else {
        setState(() {
          _error = 'Error al cargar las reservas. Código: ${response.statusCode}';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error de conexión: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bgField,
      endDrawer: AdminDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: _primaryDark,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const AdminDashboardView()),
            (route) => false,
          ),
        ),
        title: const Text(
          'Agenda de Reservas',
          style: TextStyle(fontFamily: 'Kanit', fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
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
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: _primary))
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: Colors.red)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchData,
                        child: const Text('Reintentar'),
                      )
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchData,
                  child: Column(
                    children: [
                      _buildStatusFilter(),
                      _buildViewToggle(),
                      Expanded(
                        child: _buildReservasList(),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildViewToggle() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
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
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(
        children: filters.map((f) {
          final isActive = _statusFilter == f;
          return Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(f, style: TextStyle(fontFamily: 'Kanit', color: isActive ? Colors.white : _textColor)),
              selected: isActive,
              selectedColor: _primary,
              backgroundColor: Colors.white,
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
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                fontFamily: 'Kanit',
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? Colors.white : Colors.blueGrey.shade600,
                fontSize: 15,
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
      // TODO: Logica real para filtrar semana y mes cuando el endpoint responda fechas especificas
      return true;
    }).toList();

    if (filtered.isEmpty) {
      return const Center(
        child: Text(
          'No hay reservas para esta vista.',
          style: TextStyle(fontFamily: 'Kanit', color: Colors.blueGrey, fontSize: 16),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
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
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0F4FF),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFFD6E4FF), width: 1.5),
                        ),
                        child: Center(
                          child: Text(
                            initials,
                            style: const TextStyle(
                              fontFamily: 'Kanit',
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
                                fontFamily: 'Kanit',
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: _textColor,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                const Icon(Icons.access_time_rounded, size: 13, color: Colors.blueGrey),
                                const SizedBox(width: 4),
                                Text(
                                  '$horaStr${fechaStr.isNotEmpty ? '  •  $fechaStr' : ''}',
                                  style: const TextStyle(
                                    fontFamily: 'Kanit',
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: _primary,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
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
                                fontFamily: 'Kanit',
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: pillText,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 14, color: Colors.blueGrey.withOpacity(0.7)),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          clienteDir,
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 12,
                            color: Colors.blueGrey,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Icon(Icons.phone_outlined, size: 14, color: Colors.blueGrey.withOpacity(0.7)),
                      const SizedBox(width: 4),
                      Text(
                        clienteTelf,
                        style: const TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 12,
                          color: Colors.blueGrey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
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
    final clienteNombre = reserva['cliente']?['Nombre'] ?? 'cliente de prueba';

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
                      color: const Color(0xFF1A56FF),
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
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.blueGrey,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              serviceName,
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 14,
                                color: Colors.blueGrey,
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
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.blueGrey,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Text(
                              clienteNombre,
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 14,
                                color: Colors.blueGrey,
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
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.blueGrey,
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
                                borderSide: const BorderSide(color: Color(0xFF1A56FF)),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                            items: [
                              const DropdownMenuItem<int?>(
                                value: null,
                                child: Text('Sin asignar', style: TextStyle(fontFamily: 'Kanit')),
                              ),
                              ..._empleados.map((emp) {
                                return DropdownMenuItem<int?>(
                                  value: emp['Id_Usuario'] as int?,
                                  child: Text(emp['Nombre'] ?? 'Empleado sin nombre', style: const TextStyle(fontFamily: 'Kanit')),
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
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.blueGrey,
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
                                      fontSize: 14,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  const Icon(Icons.calendar_today, color: Colors.blueGrey, size: 20),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'HORA',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.blueGrey,
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
                                      fontSize: 14,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  const Icon(Icons.access_time, color: Colors.blueGrey, size: 20),
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
                                      color: Colors.blueGrey,
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
                                      : const Icon(Icons.save, size: 18),
                                  label: const Text(
                                    'Guardar',
                                    style: TextStyle(
                                      fontFamily: 'Kanit',
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    backgroundColor: const Color(0xFF1A56FF),
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