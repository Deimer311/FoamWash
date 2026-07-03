import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Autenticacion/login_screen.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/admin_header.dart';
import '../widgets/admin_footer.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class AdminDashboardView extends StatefulWidget {
  const AdminDashboardView({super.key});

  @override
  State<AdminDashboardView> createState() => _AdminDashboardViewState();
}

class _AdminDashboardViewState extends State<AdminDashboardView> with SingleTickerProviderStateMixin {
  List<dynamic> _reservas = [];
  List<dynamic> _empleados = [];
  int _totalClientesInDB = 0;
  bool _isLoading = true;
  String? _error;

  late AnimationController _statusDotController;
  late Animation<double> _statusDotAnimation;

  @override
  void initState() {
    super.initState();
    SecurityUtils.secureScreen();

    _statusDotController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _statusDotAnimation = Tween<double>(begin: 2.0, end: 7.0).animate(
      CurvedAnimation(parent: _statusDotController, curve: Curves.easeInOut),
    );

    _checkAccess();
    _fetchData();
  }

  @override
  void dispose() {
    SecurityUtils.clearSecureScreen();
    _statusDotController.dispose();
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
    if (_isLoading != true || _error != null) {
      setState(() {
        _isLoading = true;
        _error = null;
      });
    }

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

      final responseUsuarios = await http.get(
        Uri.parse(ApiConstants.getUsuariosEndpoint),
        headers: headers,
      );

      if (response.statusCode == 401 || responseEmpleados.statusCode == 401 || responseUsuarios.statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        List<dynamic> emps = [];
        if (responseEmpleados.statusCode == 200 || responseEmpleados.statusCode == 201) {
          final dataEmps = json.decode(responseEmpleados.body);
          emps = dataEmps['data'] ?? dataEmps;
        }

        int countClientes = 0;
        if (responseUsuarios.statusCode == 200 || responseUsuarios.statusCode == 201) {
          final dataUsers = json.decode(responseUsuarios.body);
          final List usersList = dataUsers['data'] ?? dataUsers;
          for (var u in usersList) {
            final rolData = u['rol'];
            if (rolData != null && rolData is Map) {
              final String nombreRol = (rolData['Rol'] ?? '').toString().toLowerCase();
              if (nombreRol == 'cliente' || u['rol_Id_Rol'] == 3 || u['rol_id_Rol'] == 3) {
                countClientes++;
              }
            } else if (u['rol_Id_Rol'] == 3 || u['rol_id_Rol'] == 3) {
               countClientes++;
            }
          }
        }

        if (mounted) {
          setState(() {
            _reservas = data['data'] ?? data;
            _empleados = emps;
            _totalClientesInDB = countClientes;
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

  // Calculation helpers
  int _getTotalClientes() => _totalClientesInDB;
  
  int _getPendientes() {
    return _reservas.where((r) => r['Estado'] == 'Pendiente').length;
  }

  int _getReservasDelMes() {
    final now = DateTime.now();
    return _reservas.where((r) {
      final fechaStr = r['fecha'];
      if (fechaStr == null) return false;
      final d = DateTime.tryParse(fechaStr);
      return d != null && d.month == now.month && d.year == now.year;
    }).length;
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
      backgroundColor: const Color(0xFFF4F7FF),
      drawer: const AdminDrawer(),
      appBar: const AdminHeader(activeTab: 'panel'),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: Color(0xFF0066FF),
              ),
            )
          : _error != null
              ? Center(
                  child: Container(
                    margin: const EdgeInsets.all(24),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFFF6B6B).withOpacity(0.2)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline_rounded, color: Color(0xFFFF6B6B), size: 48),
                        const SizedBox(height: 16),
                        Text(
                          _error!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _fetchData,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0066FF),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                          child: const Text(
                            'Reintentar',
                            style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.w600, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  color: const Color(0xFF0066FF),
                  onRefresh: _fetchData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      children: [
                        // Centered content box
                        Center(
                          child: Container(
                            constraints: const BoxConstraints(maxWidth: 1260),
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Page Header Title
                                _buildPageHeader(isDesktop),
                                const SizedBox(height: 24),

                                // KPI grid section
                                _buildResponsiveKpiGrid(width, currencyFormat),
                                const SizedBox(height: 24),

                                // Main Split: Reservas + Empleados
                                if (isDesktop)
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Expanded(child: _buildReservasCard()),
                                      const SizedBox(width: 24),
                                      Expanded(child: _buildEmpleadosCard()),
                                    ],
                                  )
                                else ...[
                                  _buildReservasCard(),
                                  const SizedBox(height: 24),
                                  _buildEmpleadosCard(),
                                ],
                                const SizedBox(height: 24),

                                // Quick Actions Card
                                _buildQuickActionsGrid(isDesktop),
                              ],
                            ),
                          ),
                        ),

                        // Render the AdminFooter at the very bottom
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

  Widget _buildPageHeader(bool isDesktop) {
    return Row(
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
                child: const Icon(Icons.grid_view_rounded, color: Color(0xFF0066FF), size: 18),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Panel de Control',
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
                      'Visión general del negocio en tiempo real',
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
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedBuilder(
              animation: _statusDotAnimation,
              builder: (context, child) {
                return Container(
                  width: 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: const Color(0xFF00C853),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00C853).withOpacity(0.6),
                        blurRadius: _statusDotAnimation.value,
                        spreadRadius: _statusDotAnimation.value / 2,
                      )
                    ],
                  ),
                );
              },
            ),
            const SizedBox(width: 8),
            const Text(
              'Sistema activo',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 12,
                color: Color(0xFF8898B3),
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildResponsiveKpiGrid(double width, NumberFormat format) {
    int cols = 1;
    if (width >= 1100) {
      cols = 4;
    } else if (width >= 600) {
      cols = 2;
    }

    final double aspect = cols == 4 ? 1.4 : (cols == 2 ? 1.6 : 3.0);

    return GridView.count(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      crossAxisCount: cols,
      crossAxisSpacing: 14,
      mainAxisSpacing: 14,
      childAspectRatio: aspect,
      children: [
        _buildKpiCard(
          icon: Icons.people_outline_rounded,
          value: '${_getTotalClientes()}',
          label: 'Total clientes',
          trend: 12,
        ),
        _buildKpiCard(
          icon: Icons.receipt_long_rounded,
          value: '${_reservas.length}',
          label: 'Total reservas',
          trend: 8,
        ),
        _buildKpiCard(
          icon: Icons.access_time_rounded,
          value: '${_getPendientes()}',
          label: 'Pendientes',
          trend: -3,
        ),
        _buildKpiCard(
          icon: Icons.attach_money_rounded,
          value: format.format(_getIngresosTotales()),
          label: 'Ingresos totales',
          trend: 18,
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required IconData icon,
    required String value,
    required String label,
    required int trend,
  }) {
    final bool isPositive = trend > 0;
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF00B8FF).withOpacity(0.12),
                  const Color(0xFF0066FF).withOpacity(0.12),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: const Color(0xFF0066FF), size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    value,
                    style: const TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0052CC),
                    ),
                  ),
                ),
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFF8898B3),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: BoxDecoration(
              color: isPositive ? const Color(0xFF00C853).withOpacity(0.1) : const Color(0xFFEF4444).withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isPositive ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                  color: isPositive ? const Color(0xFF007A33) : const Color(0xFFB91C1C),
                  size: 11,
                ),
                const SizedBox(width: 2),
                Text(
                  '${trend.abs()}%',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    color: isPositive ? const Color(0xFF007A33) : const Color(0xFFB91C1C),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReservasCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5)),
      ),
      child: Column(
        children: [
          // Head
          Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.calendar_today_rounded, color: Color(0xFF0066FF), size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'Últimas reservas',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF080C1E),
                      ),
                    ),
                  ],
                ),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE0E8F5)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: Size.zero,
                  ),
                  onPressed: () => Navigator.pushReplacementNamed(context, '/admin_agenda'),
                  child: const Text(
                    'Ver todas →',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF0066FF),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Color(0xFFE0E8F5), height: 1),

          // Body list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: _reservas.isEmpty
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 36),
                    child: Center(
                      child: Text(
                        'No hay reservas registradas',
                        style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3), fontSize: 13),
                      ),
                    ),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _reservas.length > 8 ? 8 : _reservas.length,
                    separatorBuilder: (context, index) => const Divider(color: Color(0xFFF1F5F9), height: 1),
                    itemBuilder: (context, index) {
                      final r = _reservas[index];
                      final clienteNombre = r['cliente']?['Nombre'] ?? 'Cliente';
                      final estado = r['Estado'] ?? 'Pendiente';
                      final servicios = (r['servicios'] as List?) ?? [];
                      final servicioNombre = servicios.isNotEmpty
                          ? servicios.map((s) => s['Nombre_Servicio'] ?? 'Servicio').join(', ')
                          : 'Sin servicio';
                      final hora = r['Hora'] != null ? r['Hora'].toString().substring(0, 5) : '--:--';

                      Color bgPill = const Color(0xFFFFF7ED);
                      Color textPill = const Color(0xFFC2410C);
                      if (estado == 'Cancelado' || estado == 'Cancelada') {
                        bgPill = const Color(0xFFFEF2F2);
                        textPill = const Color(0xFFE11D48);
                      } else if (estado == 'Completado' || estado == 'Finalizado' || estado == 'Completada') {
                        bgPill = const Color(0xFFDCFCE7);
                        textPill = const Color(0xFF15803D);
                      } else if (estado == 'En proceso' || estado == 'En Proceso') {
                        bgPill = const Color(0xFFE6F0FF);
                        textPill = const Color(0xFF0052CC);
                      }

                      return InkWell(
                        onTap: () => _showEstadoModalAdmin(r),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      const Color(0xFF00B8FF).withOpacity(0.18),
                                      const Color(0xFF0066FF).withOpacity(0.18),
                                    ],
                                  ),
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    _getInitials(clienteNombre),
                                    style: const TextStyle(
                                      fontFamily: 'Kanit',
                                      fontSize: 12,
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
                                      servicioNombre,
                                      style: const TextStyle(
                                        fontFamily: 'Kanit',
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: Color(0xFF080C1E),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      '$clienteNombre · $hora',
                                      style: const TextStyle(
                                        fontFamily: 'Kanit',
                                        fontSize: 11.5,
                                        color: Color(0xFF8898B3),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: bgPill,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  estado,
                                  style: TextStyle(
                                    fontFamily: 'Kanit',
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: textPill,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildEmpleadosCard() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5)),
      ),
      child: Column(
        children: [
          // Head
          Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.people_outline_rounded, color: Color(0xFF0066FF), size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'Empleados activos',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF080C1E),
                      ),
                    ),
                  ],
                ),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE0E8F5)),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    minimumSize: Size.zero,
                  ),
                  onPressed: () => Navigator.pushReplacementNamed(context, '/admin_empleados'),
                  child: const Text(
                    'Gestionar →',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF0066FF),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(color: Color(0xFFE0E8F5), height: 1),

          // Body list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: _empleados.isEmpty
                ? const Padding(
                    padding: EdgeInsets.symmetric(vertical: 36),
                    child: Center(
                      child: Text(
                        'No hay empleados registrados',
                        style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3), fontSize: 13),
                      ),
                    ),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _empleados.length > 5 ? 5 : _empleados.length,
                    separatorBuilder: (context, index) => const Divider(color: Color(0xFFF1F5F9), height: 1),
                    itemBuilder: (context, index) {
                      final emp = _empleados[index];
                      final name = emp['Nombre'] ?? 'Empleado';
                      final phone = emp['Telefono'] ?? '—';
                      final foto = emp['foto_perfil'];
                      final isOnline = emp['estado'] == 'activo';

                      final API_BASE = ApiConstants.baseUrl.replaceAll('/api', '');
                      final bool hasFoto = foto != null && foto.isNotEmpty;
                      final fotoUrl = hasFoto
                          ? (foto.startsWith('http') ? foto : '$API_BASE$foto')
                          : '';

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        child: Row(
                          children: [
                            Stack(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: const Color(0xFF0066FF).withOpacity(0.1),
                                  backgroundImage: hasFoto ? NetworkImage(fotoUrl) : null,
                                  child: !hasFoto
                                      ? Text(
                                          _getInitials(name),
                                          style: const TextStyle(
                                            fontFamily: 'Kanit',
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: Color(0xFF0052CC),
                                          ),
                                        )
                                      : null,
                                ),
                                if (isOnline)
                                  Positioned(
                                    bottom: 0,
                                    right: 0,
                                    child: Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF00C853),
                                        shape: BoxShape.circle,
                                        border: Border.all(color: Colors.white, width: 1.8),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    name,
                                    style: const TextStyle(
                                      fontFamily: 'Kanit',
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF080C1E),
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    children: [
                                      const Icon(Icons.phone_rounded, size: 11, color: Color(0xFF8898B3)),
                                      const SizedBox(width: 4),
                                      Text(
                                        phone,
                                        style: const TextStyle(
                                          fontFamily: 'Kanit',
                                          fontSize: 11.5,
                                          color: Color(0xFF8898B3),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: isOnline ? const Color(0xFFDCFCE7) : const Color(0xFFF1F5F9),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                isOnline ? 'Activo' : 'Inactivo',
                                style: TextStyle(
                                  fontFamily: 'Kanit',
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isOnline ? const Color(0xFF15803D) : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildQuickActionsGrid(bool isDesktop) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5)),
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.bolt_rounded, color: Color(0xFF0066FF), size: 18),
              SizedBox(width: 8),
              Text(
                'Acciones rápidas',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF080C1E),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.count(
            physics: const NeverScrollableScrollPhysics(),
            shrinkWrap: true,
            crossAxisCount: isDesktop ? 4 : 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: isDesktop ? 2.8 : 2.2,
            children: [
              _buildQAButton('Ver agenda', Icons.calendar_today_rounded, '/admin_agenda'),
              _buildQAButton('Empleados', Icons.people_outline_rounded, '/admin_empleados'),
              _buildQAButton('Ver reportes', Icons.bar_chart_rounded, '/admin_reportes'),
              _buildQAButton('Mi perfil', Icons.person_outline_rounded, '/perfilAdmin'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQAButton(String label, IconData icon, String route) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: Color(0xFFE0E8F5)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        backgroundColor: const Color(0xFFF8FAFF),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        alignment: Alignment.centerLeft,
      ),
      onPressed: () {
        Navigator.pushReplacementNamed(context, route);
      },
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF0066FF), size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF080C1E),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  void _showTodasLasReservas() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: Color(0xFFF8FAFC),
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              const SizedBox(height: 12),
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              const Text('Todas las Reservas', style: TextStyle(fontFamily: 'Kanit', fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _reservas.length,
                  itemBuilder: (context, index) {
                    final r = _reservas[index];
                    final cliente = r['cliente']?['Nombre'] ?? 'Desconocido';
                    final estado = r['Estado'] ?? 'Pendiente';
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: ListTile(
                        onTap: () {
                          Navigator.pop(context);
                          _showEstadoModalAdmin(r);
                        },
                        title: Text(cliente, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text(estado),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _showEstadoModalAdmin(dynamic reserva) async {
    final id = reserva['ID_Reserva'];
    final cliente = reserva['cliente']?['Nombre'] ?? 'Desconocido';
    
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Orden #$id', style: const TextStyle(fontFamily: 'Kanit', fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Cliente: $cliente', style: const TextStyle(fontSize: 16)),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0066FF),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  _actualizarEstadoAdmin(id, 'En Proceso');
                },
                child: const Text('Mover a En Proceso'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00C853),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  _actualizarEstadoAdmin(id, 'Completado');
                },
                child: const Text('Mover a Completado'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEF4444),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  _mostrarMotivoCancelacion(id);
                },
                child: const Text('Cancelar Reserva'),
              ),
              const SizedBox(height: 24),
            ],
          ),
        );
      }
    );
  }

  Future<void> _actualizarEstadoAdmin(int id, String nuevoEstado) async {
    try {
      final token = await SecureStorageService().read('token') ?? '';
      final url = Uri.parse('${ApiConstants.baseUrl}/reservas/$id/estado');
      final res = await http.patch(
        url,
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: json.encode({'estado': nuevoEstado}),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        _fetchData();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Estado actualizado')));
      }
    } catch (e) {
      debugPrint('Error: $e');
    }
  }

  Future<void> _mostrarMotivoCancelacion(int id) async {
    final TextEditingController motivoCtrl = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text(
            'Motivo de Cancelación',
            style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, color: Color(0xFF080C1E)),
          ),
          content: TextField(
            controller: motivoCtrl,
            decoration: InputDecoration(
              hintText: 'Ingrese el motivo...',
              hintStyle: const TextStyle(color: Color(0xFF8898B3)),
              filled: true,
              fillColor: const Color(0xFFF4F7FF),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide.none,
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: Color(0xFF0066FF), width: 1.5),
              ),
            ),
            maxLines: 3,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Volver', style: TextStyle(color: Color(0xFF8898B3), fontWeight: FontWeight.w600)),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _cancelarReservaAdmin(id, motivoCtrl.text);
              },
              child: const Text('Confirmar Cancelación', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w700)),
            ),
          ],
        );
      },
    );
  }

  Future<void> _cancelarReservaAdmin(int id, String motivo) async {
    try {
      final token = await SecureStorageService().read('token') ?? '';
      final url = Uri.parse('${ApiConstants.baseUrl}/reservas/$id/cancelar');
      final res = await http.delete(
        url,
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
        body: json.encode({'motivo': motivo}),
      );
      if (res.statusCode == 200 || res.statusCode == 201) {
        _fetchData();
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Reserva cancelada y correo enviado')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al cancelar la reserva')));
      }
    } catch (e) {
      debugPrint('Error: $e');
    }
  }
}