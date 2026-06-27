import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import '../widgets/admin_drawer.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

// Eliminada clase ApiMock, ahora usamos http real.
import 'package:http/http.dart' as http;
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

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

  // Estados locales basados en tu React original
  Map<String, dynamic> _estadisticas = {
    'serviciosRealizados': 0,
    'ingresosTotal': 0.0,
    'clientesAtendidos': 0,
    'satisfaccion': 0.0,
  };
  List<Map<String, dynamic>> _ventasPorMes = [];
  List<Map<String, dynamic>> _serviciosPorTipo = [];
  List<Map<String, dynamic>> _rendimientoEmpleados = [];

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
    setState(() => _loading = true);
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final baseUrl = ApiConstants.baseUrl;
      final headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };

      final results = await Future.wait([
        http.get(Uri.parse('$baseUrl/estadisticas?periodo=$_periodoActivo'), headers: headers),
        http.get(Uri.parse('$baseUrl/empleados/productividad/general'), headers: headers),
        http.get(Uri.parse('$baseUrl/servicios/analytics/mas-solicitados'), headers: headers),
        http.get(Uri.parse('$baseUrl/reservas'), headers: headers),
      ]);

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

      if (results[0].statusCode == 200 || results[0].statusCode == 201) {
        final estData = jsonDecode(results[0].body);
        // El endpoint /estadisticas devuelve el objeto directo (sin wrapper data)
        newEstadisticas = {
          'serviciosRealizados': estData['Reservas_Completadas'] ?? estData['data']?['Reservas_Completadas'] ?? 0,
          'ingresosTotal': double.tryParse((estData['Ingresos_Totales'] ?? estData['data']?['Ingresos_Totales'] ?? 0).toString()) ?? 0.0,
          'clientesAtendidos': estData['Total_Clientes'] ?? estData['data']?['Total_Clientes'] ?? 0,
          'satisfaccion': 95.0,
        };
      }

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

      if (results[2].statusCode == 200 || results[2].statusCode == 201) {
        final servData = jsonDecode(results[2].body);
        // El endpoint puede devolver una lista directa o {data: [...]}
        final rawList = servData is List ? servData : (servData['data'] as List? ?? []);
        int idx = 0;
        newServicios = rawList.map((serv) {
          final count = serv['reserva'] is List ? (serv['reserva'] as List).length : 0;
          final color = colorsList[idx % colorsList.length];
          idx++;
          return {
            'nombre': serv['Nombre_Servicio'] ?? 'Servicio',
            'cantidad': count,
            'color': color,
          };
        }).toList();
      }

      if (results[3].statusCode == 200 || results[3].statusCode == 201) {
        final resData = jsonDecode(results[3].body);
        // findAll() devuelve { success, data: [...] }
        final List reservas = resData['data'] ?? (resData is List ? resData : []);
        
        final now = DateTime.now();
        DateTime startDate = now;
        String groupBy = 'month';

        if (_periodoActivo == 'semanal') {
          startDate = now.subtract(const Duration(days: 7));
          groupBy = 'day';
        } else if (_periodoActivo == 'mensual') {
          startDate = DateTime(now.year, now.month - 1, now.day);
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

        Map<String, double> ingresosPorPeriodo = {};
        for (var res in reservas) {
          final fechaStr = res['fecha'];
          if (fechaStr == null) continue;
          final d = DateTime.tryParse(fechaStr);
          if (d != null && (d.isAfter(startDate) || d.isAtSameMomentAs(startDate))) {
            if (res['Estado'] != 'Completado' && res['Estado'] != 'Finalizado') continue;
            String key;
            if (groupBy == 'day') {
              key = "${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}";
            } else if (groupBy == 'week') {
              final firstDayOfWeek = d.subtract(Duration(days: d.weekday - 1));
              key = "${firstDayOfWeek.year}-${firstDayOfWeek.month.toString().padLeft(2, '0')}-${firstDayOfWeek.day.toString().padLeft(2, '0')}";
            } else {
              key = "${d.year}-${d.month.toString().padLeft(2, '0')}";
            }
            
            double precio = 0.0;
            if (res['servicios'] != null) {
              for (var s in res['servicios']) {
                precio += double.tryParse((s['Precio'] ?? 0).toString()) ?? 0.0;
              }
            }
            ingresosPorPeriodo[key] = (ingresosPorPeriodo[key] ?? 0.0) + precio;
          }
        }
        newVentas = ingresosPorPeriodo.entries.map((e) {
          return {'periodo': e.key, 'valor': e.value};
        }).toList();
        newVentas.sort((a, b) => (a['periodo'] as String).compareTo(b['periodo'] as String));
      }

      setState(() {
        _estadisticas = newEstadisticas;
        _rendimientoEmpleados = newRendimiento;
        _serviciosPorTipo = newServicios;
        _ventasPorMes = newVentas;
      });
    } catch (e) {
      debugPrint('Error fetching report data: $e');
      setState(() {
        _estadisticas = {
          'serviciosRealizados': 0,
          'ingresosTotal': 0.0,
          'clientesAtendidos': 0,
          'satisfaccion': 0.0,
        };
        _ventasPorMes = [];
        _serviciosPorTipo = [];
        _rendimientoEmpleados = [];
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(
      locale: 'es_CO',
      symbol: '\$',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF0F4F8),
      endDrawer: AdminDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: const Color(0xFF0A1435), // Match _primaryDark
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: const Text(
          'Reportes',
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // --- Header ---
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE6F2FF),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.bar_chart,
                      color: Color(0xFF0066FF),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'Reportes y Análisis',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1A2540),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          'Visualiza el rendimiento de tu empresa',
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF8898b3),
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
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
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE0E8F5)),
                  ),
                  child: Row(
                    children: ['semanal', 'mensual', 'trimestral', 'semestral', 'anual'].map(
                      (p) {
                        final isSelected = _periodoActivo == p;
                        return GestureDetector(
                          onTap: () {
                            if (!isSelected) {
                              setState(() => _periodoActivo = p);
                              _fetchData();
                            }
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 20,
                              vertical: 10,
                            ),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                              gradient: isSelected
                                  ? const LinearGradient(
                                      colors: [
                                        Color(0xFF0066FF),
                                        Color(0xFF0052CC),
                                      ],
                                    )
                                  : null,
                            ),
                            child: Text(
                              p,
                              style: TextStyle(
                                color: isSelected
                                    ? Colors.white
                                    : const Color(0xFF8898b3),
                                fontWeight: FontWeight.bold,
                                fontSize: 13.5,
                              ),
                            ),
                          ),
                        );
                      },
                    ).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // --- Body / Loading ---
              if (_loading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 64.0),
                    child: CircularProgressIndicator(color: Color(0xFF0066FF)),
                  ),
                )
              else ...[
                // --- KPI Grid Layout (Usa Wrap para simular CSS Grid adaptativo) ---
                Wrap(
                  spacing: 14,
                  runSpacing: 14,
                  children: [
                    _buildKpiCard(
                      icon: Icons.bar_chart,
                      iconColor: const Color(0xFF0066FF),
                      bgColor: const Color(0x1A0066FF),
                      trend: 12,
                      value: _estadisticas['serviciosRealizados'].toString(),
                      label: 'Servicios Realizados',
                    ),
                    _buildKpiCard(
                      icon: Icons.attach_money,
                      iconColor: const Color(0xFF00C853),
                      bgColor: const Color(0x1A00C853),
                      trend: 18,
                      value: currencyFormat.format(
                        _estadisticas['ingresosTotal'],
                      ),
                      label: 'Ingresos Totales',
                    ),
                    _buildKpiCard(
                      icon: Icons.people,
                      iconColor: const Color(0xFFF59E0B),
                      bgColor: const Color(0x1AF59E0B),
                      trend: 8,
                      value: _estadisticas['clientesAtendidos'].toString(),
                      label: 'Clientes Atendidos',
                    ),
                    _buildKpiCard(
                      icon: Icons.star,
                      iconColor: const Color(0xFF7C3AED),
                      bgColor: const Color(0x1A7C3AED),
                      trend: 2,
                      value:
                          "${(_estadisticas['satisfaccion'] as double).toStringAsFixed(0)}%",
                      label: 'Satisfacción del Cliente',
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // --- Gráfico de Ingresos por Periodo ---
                _buildSectionCard(
                  title:
                      'Ingresos ${_periodoActivo == 'semanal'
                          ? 'Semanales'
                          : _periodoActivo == 'mensual'
                          ? 'Mensuales'
                          : _periodoActivo == 'trimestral'
                          ? 'Trimestrales'
                          : _periodoActivo == 'semestral'
                          ? 'Semestrales'
                          : 'Anuales'}',
                  child: _ventasPorMes.isEmpty
                      ? const Center(
                          child: Padding(
                            padding: EdgeInsets.all(40),
                            child: Text(
                              'Sin datos para este período',
                              style: TextStyle(color: Color(0xFF8898b3)),
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
                              final double maxVenta = _ventasPorMes
                                  .map((v) => v['valor'] as double)
                                  .reduce((a, b) => a > b ? a : b);
                              final double h = maxVenta > 0
                                  ? ((item['valor'] as double) / maxVenta) * 160
                                  : 4;
                              return Expanded(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  children: [
                                    Text(
                                      '\$${((item['valor'] as double) / 1000).toStringAsFixed(0)}k',
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF0066FF),
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      height: h < 4 ? 4 : h,
                                      margin: const EdgeInsets.symmetric(
                                        horizontal: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        borderRadius:
                                            const BorderRadius.vertical(
                                              top: Radius.circular(6),
                                            ),
                                        gradient: const LinearGradient(
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                          colors: [
                                            Color(0xDB00B8FF),
                                            Color(0xDB0066FF),
                                          ],
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(
                                              0xFF0066FF,
                                            ).withOpacity(0.2),
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
                                        fontSize: 10,
                                        color: Color(0xFF8898b3),
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

                // --- Servicios por Tipo ---
                _buildSectionCard(
                  title: 'Servicios por Tipo',
                  child: _serviciosPorTipo.isEmpty
                      ? const Center(
                          child: Padding(
                            padding: EdgeInsets.all(40),
                            child: Text(
                              'Sin datos disponibles',
                              style: TextStyle(color: Color(0xFF8898b3)),
                            ),
                          ),
                        )
                      : Column(
                          children: _serviciosPorTipo.map((s) {
                            final int maxServicio = _serviciosPorTipo
                                .map((serv) => serv['cantidad'] as int)
                                .reduce((a, b) => a > b ? a : b);
                            final double pct = maxServicio > 0
                                ? ((s['cantidad'] as int) / maxServicio)
                                : 0.02;
                            return Padding(
                              padding: const EdgeInsets.symmetric(
                                vertical: 9.0,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        s['nombre'],
                                        style: const TextStyle(
                                          fontSize: 13.5,
                                          fontWeight: FontWeight.w600,
                                          color: Color(0xFF1A2540),
                                        ),
                                      ),
                                      Text(
                                        s['cantidad'].toString(),
                                        style: TextStyle(
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
                                    height: 10,
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
                                          borderRadius: BorderRadius.circular(
                                            6,
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                ),
                const SizedBox(height: 20),

                // --- Tabla de Rendimiento de Empleados ---
                _buildSectionCard(
                  title: 'Rendimiento de Empleados',
                  padding: EdgeInsets.zero,
                  child: _rendimientoEmpleados.isEmpty
                      ? const Center(
                          child: Padding(
                            padding: EdgeInsets.all(40),
                            child: Text(
                              'Sin datos de empleados',
                              style: TextStyle(color: Color(0xFF8898b3)),
                            ),
                          ),
                        )
                      : Table(
                          columnWidths: const {
                            0: FlexColumnWidth(2),
                            1: FlexColumnWidth(1.5),
                            2: FlexColumnWidth(1),
                          },
                          children: [
                            TableRow(
                              decoration: const BoxDecoration(
                                color: Color(0xFFF0F4F8),
                              ),
                              children: const [
                                Padding(
                                  padding: EdgeInsets.all(12),
                                  child: Text(
                                    'EMPLEADO',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF8898b3),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: EdgeInsets.all(12),
                                  child: Text(
                                    'SERVICIOS',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF8898b3),
                                    ),
                                  ),
                                ),
                                Padding(
                                  padding: EdgeInsets.all(12),
                                  child: Text(
                                    'SATISF.',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF8898b3),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            ..._rendimientoEmpleados.map((emp) {
                              return TableRow(
                                decoration: const BoxDecoration(
                                  border: Border(
                                    bottom: BorderSide(
                                      color: Color(0xFFE0E8F5),
                                    ),
                                  ),
                                ),
                                children: [
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 14,
                                    ),
                                    child: Text(
                                      emp['nombre'],
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1A2540),
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 14,
                                    ),
                                    child: UnconstrainedBox(
                                      alignment: Alignment.centerLeft,
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 3,
                                        ),
                                        decoration: BoxDecoration(
                                          color: const Color(0x1A0066FF),
                                          borderRadius: BorderRadius.circular(
                                            20,
                                          ),
                                        ),
                                        child: Text(
                                          emp['servicios'].toString(),
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF0066FF),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 14,
                                    ),
                                    child: Text(
                                      "${(emp['satisfaccion'] as double).toStringAsFixed(1)}%",
                                      style: const TextStyle(
                                        color: Color(0xFF8898b3),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            }).toList(),
                          ],
                        ),
                ),
              ],
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _generarPDF,
        backgroundColor: const Color(0xFF0066FF),
        icon: const Icon(Icons.picture_as_pdf, color: Colors.white),
        label: const Text('Exportar', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Future<void> _generarPDF() async {
    final pdf = pw.Document();
    
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Header(level: 0, child: pw.Text('Reporte FoamWash - $_periodoActivo'.toUpperCase())),
              pw.SizedBox(height: 20),
              pw.Text('Estadisticas Principales', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 18)),
              pw.SizedBox(height: 10),
              pw.Text('Servicios Realizados: ${_estadisticas['serviciosRealizados']}'),
              pw.Text('Ingresos Totales: \$${_estadisticas['ingresosTotal'].toStringAsFixed(0)}'),
              pw.Text('Clientes Atendidos: ${_estadisticas['clientesAtendidos']}'),
              pw.SizedBox(height: 20),
              pw.Text('Desglose de Ingresos', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 18)),
              pw.SizedBox(height: 10),
              ..._ventasPorMes.map((v) => pw.Text('${v['label']}: \$${v['valor'].toStringAsFixed(0)}')).toList(),
              pw.SizedBox(height: 20),
              pw.Text('Servicios mas solicitados', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 18)),
              pw.SizedBox(height: 10),
              ..._serviciosPorTipo.map((s) => pw.Text('${s['Nombre_Servicio']}: ${s['cantidad']} solicitudes')).toList(),
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

  // --- Helper Widget: Tarjetas de KPI ---
  Widget _buildKpiCard({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required int trend,
    required String value,
    required String label,
  }) {
    final double width =
        (MediaQuery.of(context).size.width - 54) /
        2; // Ajuste dinámico de 2 columnas en teléfonos
    return Container(
      width: width,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE0E8F5)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x120A1E50),
            blurRadius: 10,
            offset: Offset(0, 2),
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
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: bgColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 22),
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
                      Icons.trending_up,
                      color: Color(0xFF15803D),
                      size: 12,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      '+$trend%',
                      style: const TextStyle(
                        color: Color(0xFF15803D),
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Color(0xFF1A2540),
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFF8898b3),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  // --- Helper Widget: Contenedores de Secciones (Gráficos/Tabla) ---
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
        boxShadow: const [
          BoxShadow(
            color: Color(0x120A1E50),
            blurRadius: 10,
            offset: Offset(0, 2),
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
                colors: [Color(0x080066FF), Color(0x0800B8FF)],
              ),
            ),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1A2540),
              ),
            ),
          ),
          Padding(padding: padding, child: child),
        ],
      ),
    );
  }
}

// Extensión simple para capitalizar textos en los botones
extension StringExtension on String {
  String get capitalizeFirst => "${this[0].toUpperCase()}${substring(1)}";
}
