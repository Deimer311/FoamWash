import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/admin_header.dart';
import '../widgets/admin_footer.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

class AdminReportesView extends StatefulWidget {
  final VoidCallback? onGoDashboard;
  final VoidCallback? onGoAgenda;
  final VoidCallback? onGoEmpleados;
  final VoidCallback? onGoReportes;
  final VoidCallback? onGoPerfil;
  final VoidCallback? onLogout;

  const AdminReportesView({
    super.key,
    this.onGoDashboard,
    this.onGoAgenda,
    this.onGoEmpleados,
    this.onGoReportes,
    this.onGoPerfil,
    this.onLogout,
  });

  @override
  State<AdminReportesView> createState() => _AdminReportesViewState();
}

class _AdminReportesViewState extends State<AdminReportesView> {
  String _periodoActivo = 'mensual';
  bool _loading = false;

  Map<String, dynamic> _estadisticas = {
    'serviciosRealizados': 0,
    'ingresosTotal': 0.0,
    'clientesAtendidos': 0,
    'satisfaccion': 0.0,
  };
  List<Map<String, dynamic>> _ventasPorMes = [];
  List<Map<String, dynamic>> _serviciosPorTipo = [];
  List<Map<String, dynamic>> _rendimientoEmpleados = [];

  List<dynamic> _reservas = [];
  List<dynamic> _empleadosListForStats = [];

  @override
  void initState() {
    super.initState();
    SecurityUtils.secureScreen();
    _fetchData();
  }

  @override
  void dispose() {
    SecurityUtils.clearSecureScreen();
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() => _loading = true);
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
        http.get(Uri.parse('$baseUrl/estadisticas?periodo=$_periodoActivo'), headers: headers),
        http.get(Uri.parse('$baseUrl/empleados/productividad/general'), headers: headers),
        http.get(Uri.parse('$baseUrl/servicios/analytics/mas-solicitados'), headers: headers),
        http.get(Uri.parse('$baseUrl/reservas'), headers: headers),
      ]);

      if (results[0].statusCode == 401 || results[1].statusCode == 401 || results[2].statusCode == 401 || results[3].statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      final List<Color> colorsList = [
        const Color(0xFF0066FF),
        const Color(0xFF00C853),
        const Color(0xFFFF9800),
        const Color(0xFFEF4444),
        const Color(0xFF7C3AED),
      ];

      Map<String, dynamic> newEstadisticas = {
        'serviciosRealizados': 0,
        'ingresosTotal': 0.0,
        'clientesAtendidos': 0,
        'satisfaccion': 95.0,
      };
      List<Map<String, dynamic>> newRendimiento = [];
      List<Map<String, dynamic>> newServicios = [];
      List<Map<String, dynamic>> newVentas = [];
      List<dynamic> localReservasList = [];

      if (results[1].statusCode == 200 || results[1].statusCode == 201) {
        final prodData = jsonDecode(results[1].body);
        final list = prodData['data'] as List? ?? [];
        newRendimiento = list.map((e) {
          final count = e['_count']?['reservasComoEmpleado'] ?? 0;
          return {
            'nombre': e['Nombre'] ?? 'Empleado',
            'servicios': count,
            'satisfaccion': 90.0 + (count * 0.1),
          };
        }).toList();
      }

      if (results[3].statusCode == 200 || results[3].statusCode == 201) {
        final resData = jsonDecode(results[3].body);
        localReservasList = resData['data'] ?? (resData is List ? resData : []);
        
        final now = DateTime.now();
        DateTime startDate = now;
        String groupBy = 'month';

        if (_periodoActivo == 'semanal') {
          startDate = now.subtract(const Duration(days: 7));
          groupBy = 'day';
        } else if (_periodoActivo == 'mensual') {
          startDate = DateTime(now.year, now.month, 1);
          groupBy = 'week';
        } else if (_periodoActivo == 'trimestral') {
          startDate = DateTime(now.year, now.month - 3, now.day);
          groupBy = 'month';
        } else if (_periodoActivo == 'semestral') {
          startDate = DateTime(now.year, now.month - 6, now.day);
          groupBy = 'month';
        } else if (_periodoActivo == 'anual') {
          startDate = DateTime(now.year - 1, now.month, now.day);
          groupBy = 'month';
        }
        int realizados = 0;
        double totalIngresosLocal = 0.0;
        Set<int> clientesUnicos = {};

        Map<String, double> ingresosPorPeriodo = {};
        Map<String, int> serviciosSolicitados = {};
        
        for (var res in localReservasList) {
          final fechaStr = res['fecha'];
          if (fechaStr == null) continue;
          final d = DateTime.tryParse(fechaStr);
          if (d != null && (d.isAfter(startDate) || d.isAtSameMomentAs(startDate))) {
            if (res['cliente'] != null) {
              final clientId = res['cliente']['Id_Usuario'] ?? res['cliente']['id'] ?? res['cliente']['ID_Usuario'];
              if (clientId != null) {
                clientesUnicos.add(clientId);
              }
            }
            if (res['Estado'] != 'Cancelado' && res['Estado'] != 'Cancelada') {
              if (res['servicios'] != null) {
                for (var s in res['servicios']) {
                  final nom = s['Nombre_Servicio'] ?? 'Servicio';
                  serviciosSolicitados[nom] = (serviciosSolicitados[nom] ?? 0) + 1;
                }
              }
            }
            
            if (res['Estado'] != 'Completado' && res['Estado'] != 'Finalizado' && res['Estado'] != 'Completada') continue;
            
            realizados++;
            double sumaServicios = 0.0;
            if (res['servicios'] != null) {
              for (var s in res['servicios']) {
                sumaServicios += double.tryParse((s['Precio'] ?? 0).toString()) ?? 0.0;
              }
            }
            totalIngresosLocal += sumaServicios;
            
            String key;
            if (groupBy == 'day') {
              key = "${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}";
            } else if (groupBy == 'week') {
              final firstDayOfWeek = d.subtract(Duration(days: d.weekday - 1));
              key = "Sem. ${firstDayOfWeek.day}/${firstDayOfWeek.month}";
            } else {
              key = "${d.year}-${d.month.toString().padLeft(2, '0')}";
            }
            ingresosPorPeriodo[key] = (ingresosPorPeriodo[key] ?? 0) + sumaServicios;
          }
        }
        
        newEstadisticas = {
          'serviciosRealizados': realizados,
          'ingresosTotal': totalIngresosLocal,
          'clientesAtendidos': clientesUnicos.length,
          'satisfaccion': 95.0,
        };
        
        int sIdx = 0;
        newServicios = serviciosSolicitados.entries.map((e) {
          final color = colorsList[sIdx % colorsList.length];
          sIdx++;
          return {
            'nombre': e.key,
            'cantidad': e.value,
            'color': color,
          };
        }).toList();
        newServicios.sort((a, b) => (b['cantidad'] as int).compareTo(a['cantidad'] as int));
        
        newVentas = ingresosPorPeriodo.entries.map((e) {
          return {'periodo': e.key, 'valor': e.value};
        }).toList();
        newVentas.sort((a, b) => (a['periodo'] as String).compareTo(b['periodo'] as String));
      }

      // Fetch active employees count for footer
      List<dynamic> localEmpsList = [];
      final responseEmpleados = await http.get(Uri.parse('$baseUrl/empleados'), headers: headers);
      if (responseEmpleados.statusCode == 200 || responseEmpleados.statusCode == 201) {
        final empData = jsonDecode(responseEmpleados.body);
        localEmpsList = empData['data'] ?? [];
      }

      if (mounted) {
        setState(() {
          _estadisticas = newEstadisticas;
          _rendimientoEmpleados = newRendimiento;
          _serviciosPorTipo = newServicios;
          _ventasPorMes = newVentas;
          _reservas = localReservasList;
          _empleadosListForStats = localEmpsList;
        });
      }
    } catch (e) {
      debugPrint('Error fetching report data: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  double _getIngresosTotalesForFooter() {
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

  int _getPendientesForFooter() {
    return _reservas.where((r) => r['Estado'] == 'Pendiente').length;
  }

  int _getOrdeneHoyCountForFooter() {
    final now = DateTime.now();
    return _reservas.where((r) {
      final fechaStr = r['fecha'];
      if (fechaStr == null) return false;
      final d = DateTime.tryParse(fechaStr);
      return d != null && d.day == now.day && d.month == now.month && d.year == now.year;
    }).length;
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final bool isDesktop = width >= 900;
    final currencyFormat = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FF),
      drawer: const AdminDrawer(),
      appBar: const AdminHeader(activeTab: 'reportes'),
      body: SingleChildScrollView(
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
                    // --- Header ---
                    Row(
                      children: [
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: const Color(0xFF0066FF).withOpacity(0.08),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(
                            Icons.bar_chart_rounded,
                            color: Color(0xFF0066FF),
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Reportes y Análisis',
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF080C1E),
                              ),
                            ),
                            Text(
                              'Visualiza el rendimiento de tu empresa',
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 12.5,
                                color: Color(0xFF8898B3),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // --- Filtros de Período ---
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Container(
                        padding: const EdgeInsets.all(5),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xFFE0E8F5)),
                        ),
                        child: Row(
                          children: ['semanal', 'mensual', 'trimestral', 'semestral', 'anual'].map((p) {
                            final isSelected = _periodoActivo == p;
                            return GestureDetector(
                              onTap: () {
                                if (!isSelected) {
                                  setState(() => _periodoActivo = p);
                                  _fetchData();
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  gradient: isSelected
                                      ? const LinearGradient(
                                          colors: [Color(0xFF0066FF), Color(0xFF0052CC)],
                                        )
                                      : null,
                                ),
                                child: Text(
                                  p.capitalizeFirst,
                                  style: TextStyle(
                                    fontFamily: 'Kanit',
                                    color: isSelected ? Colors.white : const Color(0xFF8898B3),
                                    fontWeight: FontWeight.bold,
                                    fontSize: 12.5,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // --- Body ---
                    if (_loading)
                      const Center(
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: 64.0),
                          child: CircularProgressIndicator(color: Color(0xFF0066FF)),
                        ),
                      )
                    else ...[
                      // --- KPI Grid ---
                      GridView.count(
                        physics: const NeverScrollableScrollPhysics(),
                        shrinkWrap: true,
                        crossAxisCount: width >= 1100 ? 4 : (width >= 600 ? 2 : 1),
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        childAspectRatio: width >= 1100 ? 1.4 : (width >= 600 ? 1.6 : 2.2),
                        children: [
                          _buildKpiCard(
                            icon: Icons.bar_chart_rounded,
                            iconColor: const Color(0xFF0066FF),
                            bgColor: const Color(0x1A0066FF),
                            trend: 12,
                            value: _estadisticas['serviciosRealizados'].toString(),
                            label: 'Servicios Realizados',
                          ),
                          _buildKpiCard(
                            icon: Icons.attach_money_rounded,
                            iconColor: const Color(0xFF00C853),
                            bgColor: const Color(0x1A00C853),
                            trend: 18,
                            value: currencyFormat.format(_estadisticas['ingresosTotal']),
                            label: 'Ingresos Totales',
                          ),
                          _buildKpiCard(
                            icon: Icons.people_outline_rounded,
                            iconColor: const Color(0xFFFF9800),
                            bgColor: const Color(0x1AFF9800),
                            trend: 8,
                            value: _estadisticas['clientesAtendidos'].toString(),
                            label: 'Clientes Atendidos',
                          ),
                          _buildKpiCard(
                            icon: Icons.star_outline_rounded,
                            iconColor: const Color(0xFF7C3AED),
                            bgColor: const Color(0x1A7C3AED),
                            trend: 2,
                            value: "${(_estadisticas['satisfaccion'] as double).toStringAsFixed(0)}%",
                            label: 'Satisfacción del Cliente',
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // --- Chart of Revenue ---
                      _buildSectionCard(
                        title: 'Ingresos ${_periodoActivo == 'semanal' ? 'Semanales' : _periodoActivo == 'mensual' ? 'Mensuales' : _periodoActivo == 'trimestral' ? 'Trimestrales' : _periodoActivo == 'semestral' ? 'Semestrales' : 'Anuales'}',
                        child: _ventasPorMes.isEmpty
                            ? const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(40),
                                  child: Text(
                                    'Sin datos para este período',
                                    style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3)),
                                  ),
                                ),
                              )
                            : Container(
                                height: 220,
                                padding: const EdgeInsets.only(top: 16),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: _ventasPorMes.map((item) {
                                    final double maxVenta = _ventasPorMes.map((v) => v['valor'] as double).reduce((a, b) => a > b ? a : b);
                                    final double h = maxVenta > 0 ? ((item['valor'] as double) / maxVenta) * 160 : 4;
                                    return Expanded(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.end,
                                        children: [
                                          Text(
                                            '\$${((item['valor'] as double) / 1000).toStringAsFixed(0)}k',
                                            style: const TextStyle(
                                              fontFamily: 'Kanit',
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                              color: Color(0xFF0066FF),
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Container(
                                            height: h < 4 ? 4 : h,
                                            margin: const EdgeInsets.symmetric(horizontal: 4),
                                            decoration: BoxDecoration(
                                              borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                                              gradient: const LinearGradient(
                                                begin: Alignment.topCenter,
                                                end: Alignment.bottomCenter,
                                                colors: [Color(0xDB00B8FF), Color(0xDB0066FF)],
                                              ),
                                              boxShadow: [
                                                BoxShadow(
                                                  color: const Color(0xFF0066FF).withOpacity(0.2),
                                                  blurRadius: 4,
                                                  offset: const Offset(0, -2),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            item['periodo'].toString(),
                                            style: const TextStyle(
                                              fontFamily: 'Kanit',
                                              fontSize: 9.5,
                                              color: Color(0xFF8898B3),
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ],
                                      ),
                                    );
                                  }).toList(),
                                ),
                              ),
                      ),
                      const SizedBox(height: 20),

                      // --- Split: Servicios & Rendimiento ---
                      if (isDesktop)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: _buildServiciosSection()),
                            const SizedBox(width: 24),
                            Expanded(child: _buildRendimientoSection()),
                          ],
                        )
                      else ...[
                        _buildServiciosSection(),
                        const SizedBox(height: 20),
                        _buildRendimientoSection(),
                      ],
                    ],
                  ],
                ),
              ),
            ),

            // Footer
            AdminFooter(
              ordeneHoy: _getOrdeneHoyCountForFooter(),
              ordensPendientes: _getPendientesForFooter(),
              empleadosActivos: _empleadosListForStats.where((e) => e['estado'] == 'activo').length,
              ingresosMes: currencyFormat.format(_getIngresosTotalesForFooter()),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _generarPDF,
        backgroundColor: const Color(0xFF0066FF),
        icon: const Icon(Icons.picture_as_pdf, color: Colors.white, size: 18),
        label: const Text('Exportar', style: TextStyle(fontFamily: 'Kanit', color: Colors.white, fontWeight: FontWeight.bold)),
        elevation: 4,
      ),
    );
  }

  Widget _buildServiciosSection() {
    return _buildSectionCard(
      title: 'Servicios por Tipo',
      child: _serviciosPorTipo.isEmpty
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: Text(
                  'Sin datos disponibles',
                  style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3)),
                ),
              ),
            )
          : Column(
              children: _serviciosPorTipo.map((s) {
                final int maxServicio = _serviciosPorTipo.map((serv) => serv['cantidad'] as int).reduce((a, b) => a > b ? a : b);
                final double pct = maxServicio > 0 ? ((s['cantidad'] as int) / maxServicio) : 0.02;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 9.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            s['nombre'],
                            style: const TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 13.5,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF080C1E),
                            ),
                          ),
                          Text(
                            s['cantidad'].toString(),
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 13.5,
                              fontWeight: FontWeight.bold,
                              color: s['color'],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 7),
                      Container(
                        width: double.infinity,
                        height: 8,
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0F4F8),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: pct < 0.02 ? 0.02 : pct,
                          child: Container(
                            decoration: BoxDecoration(
                              color: s['color'],
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
    );
  }

  Widget _buildRendimientoSection() {
    return _buildSectionCard(
      title: 'Rendimiento de Empleados',
      padding: EdgeInsets.zero,
      child: _rendimientoEmpleados.isEmpty
          ? const Center(
              child: Padding(
                padding: EdgeInsets.all(40),
                child: Text(
                  'Sin datos de empleados',
                  style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3)),
                ),
              ),
            )
          : Table(
              columnWidths: const {
                0: FlexColumnWidth(2.2),
                1: FlexColumnWidth(1.2),
                2: FlexColumnWidth(1.0),
              },
              children: [
                TableRow(
                  decoration: const BoxDecoration(
                    color: Color(0xFFF4F7FF),
                  ),
                  children: const [
                    Padding(
                      padding: EdgeInsets.all(12),
                      child: Text(
                        'EMPLEADO',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF8898B3),
                        ),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.all(12),
                      child: Text(
                        'SERVICIOS',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF8898B3),
                        ),
                      ),
                    ),
                    Padding(
                      padding: EdgeInsets.all(12),
                      child: Text(
                        'SATISF.',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF8898B3),
                        ),
                      ),
                    ),
                  ],
                ),
                ..._rendimientoEmpleados.map((emp) {
                  return TableRow(
                    decoration: const BoxDecoration(
                      border: Border(bottom: BorderSide(color: Color(0xFFE0E8F5))),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        child: Text(
                          emp['nombre'],
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
                            color: Color(0xFF080C1E),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        child: UnconstrainedBox(
                          alignment: Alignment.centerLeft,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0066FF).withOpacity(0.08),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              emp['servicios'].toString(),
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF0066FF),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        child: Text(
                          "${(emp['satisfaccion'] as double).toStringAsFixed(1)}%",
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 13,
                            color: Color(0xFF8898B3),
                          ),
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ],
            ),
    );
  }

  Future<void> _generarPDF() async {
    final pdf = pw.Document();
    
    final primaryColor = PdfColor.fromHex('#0066FF');
    final secondaryColor = PdfColor.fromHex('#080C1E');
    final grayColor = PdfColor.fromHex('#8898B3');
    final bgLight = PdfColor.fromHex('#F4F7FF');

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(40),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              // Header
              pw.Container(
                padding: const pw.EdgeInsets.only(bottom: 20),
                decoration: pw.BoxDecoration(
                  border: pw.Border(bottom: pw.BorderSide(color: primaryColor, width: 2)),
                ),
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('FOAMWASH', style: pw.TextStyle(color: primaryColor, fontSize: 28, fontWeight: pw.FontWeight.bold)),
                        pw.Text('REPORTE ANALÍTICO', style: pw.TextStyle(color: secondaryColor, fontSize: 16, letterSpacing: 1.2)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('Periodo:', style: pw.TextStyle(color: grayColor, fontSize: 10)),
                        pw.Text(_periodoActivo.toUpperCase(), style: pw.TextStyle(color: secondaryColor, fontSize: 14, fontWeight: pw.FontWeight.bold)),
                        pw.SizedBox(height: 4),
                        pw.Text('Fecha de emisión: ${DateFormat('dd/MM/yyyy').format(DateTime.now())}', style: pw.TextStyle(color: grayColor, fontSize: 10)),
                      ],
                    ),
                  ],
                ),
              ),
              pw.SizedBox(height: 30),

              // KPIs
              pw.Text('RESUMEN DE RESULTADOS', style: pw.TextStyle(color: secondaryColor, fontSize: 14, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 15),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  _buildPdfKpi('SERVICIOS', '${_estadisticas['serviciosRealizados']}', bgLight, primaryColor),
                  _buildPdfKpi('INGRESOS', '\$${_estadisticas['ingresosTotal'].toStringAsFixed(0)}', bgLight, PdfColor.fromHex('#00C853')),
                  _buildPdfKpi('CLIENTES', '${_estadisticas['clientesAtendidos']}', bgLight, PdfColor.fromHex('#FF9800')),
                ],
              ),
              pw.SizedBox(height: 40),

              // Ingresos Breakdown
              pw.Text('DESGLOSE DE INGRESOS', style: pw.TextStyle(color: secondaryColor, fontSize: 14, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 15),
              pw.TableHelper.fromTextArray(
                context: context,
                border: const pw.TableBorder(
                  bottom: pw.BorderSide(color: PdfColors.grey300, width: 0.5),
                  horizontalInside: pw.BorderSide(color: PdfColors.grey300, width: 0.5),
                ),
                headerDecoration: pw.BoxDecoration(color: primaryColor),
                headerStyle: pw.TextStyle(color: PdfColors.white, fontWeight: pw.FontWeight.bold, fontSize: 11),
                cellStyle: const pw.TextStyle(fontSize: 11),
                cellAlignment: pw.Alignment.centerLeft,
                headerPadding: const pw.EdgeInsets.all(8),
                cellPadding: const pw.EdgeInsets.all(8),
                data: <List<String>>[
                  <String>['PERIODO', 'INGRESOS GENERADOS'],
                  ..._ventasPorMes.map((v) => [v['periodo'].toString(), '\$${v['valor'].toStringAsFixed(2)}']),
                ],
              ),
              pw.SizedBox(height: 40),

              // Servicios Populares
              pw.Text('SERVICIOS MÁS SOLICITADOS', style: pw.TextStyle(color: secondaryColor, fontSize: 14, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 15),
              ..._serviciosPorTipo.map((s) => pw.Container(
                    margin: const pw.EdgeInsets.only(bottom: 8),
                    padding: const pw.EdgeInsets.all(10),
                    decoration: pw.BoxDecoration(
                      color: bgLight,
                      borderRadius: const pw.BorderRadius.all(pw.Radius.circular(6)),
                    ),
                    child: pw.Row(
                      mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                      children: [
                        pw.Text('${s['nombre']}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: secondaryColor)),
                        pw.Text('${s['cantidad']} solicitudes', style: pw.TextStyle(color: primaryColor, fontWeight: pw.FontWeight.bold)),
                      ],
                    ),
                  )).toList(),
            ],
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'Reporte_FoamWash_$_periodoActivo.pdf',
    );
  }

  pw.Widget _buildPdfKpi(String title, String value, PdfColor bg, PdfColor accent) {
    return pw.Container(
      width: 150,
      padding: const pw.EdgeInsets.all(15),
      decoration: pw.BoxDecoration(
        color: bg,
        borderRadius: const pw.BorderRadius.all(pw.Radius.circular(10)),
        border: pw.Border.all(color: PdfColors.grey300, width: 0.5),
      ),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(title, style: pw.TextStyle(color: PdfColor.fromHex('#8898B3'), fontSize: 10, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 8),
          pw.Text(value, style: pw.TextStyle(color: accent, fontSize: 18, fontWeight: pw.FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildKpiCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required int trend,
    required String value,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.01),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: iconColor, size: 20),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.trending_up_rounded,
                      color: Color(0xFF15803D),
                      size: 11,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      '+$trend%',
                      style: const TextStyle(
                        fontFamily: 'Kanit',
                        color: Color(0xFF15803D),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              value,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Color(0xFF080C1E),
                letterSpacing: -0.5,
              ),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Kanit',
              fontSize: 11.5,
              color: Color(0xFF8898B3),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required Widget child,
    EdgeInsetsGeometry padding = const EdgeInsets.all(22),
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.01),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: Color(0xFFE0E8F5))),
              gradient: LinearGradient(
                colors: [Color(0x040066FF), Color(0x0400B8FF)],
              ),
            ),
            child: Text(
              title,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF080C1E),
              ),
            ),
          ),
          Padding(padding: padding, child: child),
        ],
      ),
    );
  }
}

extension StringExtension on String {
  String get capitalizeFirst => "${this[0].toUpperCase()}${substring(1)}";
}
