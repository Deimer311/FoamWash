import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/Services/data/models/service_model.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/admin_header.dart';
import '../widgets/admin_footer.dart';
import '../widgets/add_servicio_dialog.dart';
import '../widgets/edit_servicio_dialog.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class AdminServiciosView extends StatefulWidget {
  const AdminServiciosView({super.key});

  @override
  State<AdminServiciosView> createState() => _AdminServiciosViewState();
}

class _AdminServiciosViewState extends State<AdminServiciosView> {
  // Footer stats state
  int _ordeneHoy = 0;
  int _ordensPendientes = 0;
  int _empleadosActivos = 0;
  String _ingresosMes = '\$0';
  bool _statsLoading = true;

  @override
  void initState() {
    super.initState();
    SecurityUtils.secureScreen();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ServicesProvider>().fetchServices();
    });
    _fetchFooterStats();
  }

  @override
  void dispose() {
    SecurityUtils.clearSecureScreen();
    super.dispose();
  }

  Future<void> _fetchFooterStats() async {
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
        http.get(Uri.parse('$baseUrl/reservas'), headers: headers),
        http.get(Uri.parse('$baseUrl/empleados'), headers: headers),
        http.get(Uri.parse('$baseUrl/estadisticas'), headers: headers),
      ]);

      if (results[0].statusCode == 401 || results[1].statusCode == 401 || results[2].statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      if (results[0].statusCode == 200 && results[1].statusCode == 200) {
        final resData = jsonDecode(results[0].body);
        final List reservas = resData['data'] ?? (resData is List ? resData : []);
        final now = DateTime.now();

        // 1. Ordene hoy
        final todayCount = reservas.where((r) {
          final fStr = r['fecha'];
          if (fStr == null) return false;
          final d = DateTime.tryParse(fStr);
          return d != null && d.day == now.day && d.month == now.month && d.year == now.year;
        }).length;

        // 2. Pendientes
        final pendingCount = reservas.where((r) => r['Estado'] == 'Pendiente').length;

        // 3. Empleados activos
        final empData = jsonDecode(results[1].body);
        final List emps = empData['data'] ?? [];
        final activeCount = emps.where((e) => e['estado'] == 'activo').length;

        // 4. Ingresos mes
        double totalIngresos = 0.0;
        for (var r in reservas) {
          final fStr = r['fecha'];
          if (fStr != null) {
            final d = DateTime.tryParse(fStr);
            if (d != null && d.month == now.month && d.year == now.year) {
              if (r['Estado'] == 'Completado' || r['Estado'] == 'Finalizado' || r['Estado'] == 'Completada') {
                if (r['servicios'] != null) {
                  for (var s in r['servicios']) {
                    totalIngresos += double.tryParse((s['Precio'] ?? 0).toString()) ?? 0.0;
                  }
                }
              }
            }
          }
        }
        final format = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

        if (mounted) {
          setState(() {
            _ordeneHoy = todayCount;
            _ordensPendientes = pendingCount;
            _empleadosActivos = activeCount;
            _ingresosMes = format.format(totalIngresos);
            _statsLoading = false;
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching footer stats in servicios: $e');
    }
  }

  void _mostrarDialogoAgregar() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AddServicioDialog(),
    );
  }

  void _confirmarEliminar(ServiceModel servicio) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Confirmar eliminación',
          style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, color: Color(0xFF080C1E)),
        ),
        content: Text(
          '¿Estás seguro de que deseas eliminar el servicio "${servicio.nombreServicio}"?',
          style: const TextStyle(fontFamily: 'Kanit', color: Color(0xFF64748B)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Color(0xFF8898B3), fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () async {
              final servicesProvider = context.read<ServicesProvider>();
              final scaffoldMessenger = ScaffoldMessenger.of(context);
              final navigator = Navigator.of(context);
              
              final success = await servicesProvider.deleteService(servicio.idServicio);
              
              if (mounted) {
                navigator.pop();
                if (success) {
                  scaffoldMessenger.showSnackBar(
                    const SnackBar(content: Text('Servicio eliminado exitosamente'), backgroundColor: Colors.green),
                  );
                } else {
                  scaffoldMessenger.showSnackBar(
                    const SnackBar(content: Text('Error al eliminar servicio'), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: const Text('Eliminar', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _mostrarDialogoEditar(ServiceModel servicio) {
    showDialog(
      context: context,
      builder: (context) => EditServicioDialog(servicio: servicio),
    );
  }

  String _formatearPrecio(String precioStr) {
    try {
      final double valor = double.parse(precioStr);
      if (valor == valor.toInt()) {
        final String revStr = valor.toInt().toString().split('').reversed.join('');
        final List<String> segments = [];
        for (int i = 0; i < revStr.length; i += 3) {
          int end = i + 3;
          if (end > revStr.length) end = revStr.length;
          segments.add(revStr.substring(i, end));
        }
        return segments.join('.').split('').reversed.join('');
      }
      return precioStr;
    } catch (e) {
      return precioStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ServicesProvider>(context);
    if (provider.error != null && provider.error!.contains('401')) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        final auth = Provider.of<AuthProvider>(context, listen: false);
        auth.logout();
        Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
      });
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final double width = MediaQuery.of(context).size.width;
    final bool isDesktop = width >= 900;
    const Color primaryBlue = Color(0xFF0066FF);

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FF),
      drawer: const AdminDrawer(),
      appBar: const AdminHeader(activeTab: 'gestion'),
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
                    // Header title block
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: primaryBlue.withOpacity(0.08),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.cleaning_services_outlined, color: primaryBlue, size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Servicios',
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
                                      'Gestiona el catálogo de servicios',
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
                        ElevatedButton.icon(
                          onPressed: _mostrarDialogoAgregar,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text(
                            'Agregar',
                            style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Grid or List of services
                    Consumer<ServicesProvider>(
                      builder: (context, provider, child) {
                        if (provider.isLoading) {
                          return const Padding(
                            padding: EdgeInsets.all(64.0),
                            child: Center(child: CircularProgressIndicator(color: primaryBlue)),
                          );
                        }
                        if (provider.error != null) {
                          return Padding(
                            padding: const EdgeInsets.all(32.0),
                            child: Center(
                              child: Text(
                                provider.error!,
                                style: const TextStyle(fontFamily: 'Kanit', color: Color(0xFFEF4444)),
                              ),
                            ),
                          );
                        }
                        if (provider.services.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.all(48.0),
                            child: Center(
                              child: Text(
                                'No hay servicios registrados.',
                                style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3)),
                              ),
                            ),
                          );
                        }

                        return GridView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: width >= 1100 ? 3 : (width >= 600 ? 2 : 1),
                            crossAxisSpacing: 20,
                            mainAxisSpacing: 20,
                            mainAxisExtent: 310,
                          ),
                          itemCount: provider.services.length,
                          itemBuilder: (context, index) {
                            final servicio = provider.services[index];
                            return _buildServiceCard(servicio);
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            // Footer
            AdminFooter(
              ordeneHoy: _ordeneHoy,
              ordensPendientes: _ordensPendientes,
              empleadosActivos: _empleadosActivos,
              ingresosMes: _ingresosMes,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceCard(ServiceModel servicio) {
    const Color primaryBlue = Color(0xFF0066FF);

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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Upper image
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(17)),
            child: SizedBox(
              height: 160,
              width: double.infinity,
              child: Builder(builder: (context) {
                final raw = servicio.imagenUrl ?? '';
                String imageUrl = raw;
                if (raw.isNotEmpty && !raw.startsWith('http')) {
                  final base = ApiConstants.baseUrl.endsWith('/api')
                      ? ApiConstants.baseUrl.substring(0, ApiConstants.baseUrl.length - 4)
                      : ApiConstants.baseUrl;
                  imageUrl = '$base$raw';
                }
                if (imageUrl.startsWith('http')) {
                  return Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                  );
                }
                return Image.asset(
                  'assets/fondo.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                );
              }),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        servicio.nombreServicio,
                        style: const TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 14.5,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF080C1E),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '\$${_formatearPrecio(servicio.precio)}',
                        style: const TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: primaryBlue,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Row(
                  children: [
                    // Edit button
                    GestureDetector(
                      onTap: () => _mostrarDialogoEditar(servicio),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0066FF).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.edit_outlined, color: primaryBlue, size: 18),
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Delete button
                    GestureDetector(
                      onTap: () => _confirmarEliminar(servicio),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.08),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.delete_outline_outlined, color: Color(0xFFEF4444), size: 18),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      color: const Color(0xFF0066FF).withOpacity(0.05),
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cleaning_services_outlined, size: 38, color: Color(0xFF0066FF)),
            SizedBox(height: 6),
            Text(
              'FoamWash',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0066FF),
              ),
            ),
          ],
        ),
      ),
    );
  }
}