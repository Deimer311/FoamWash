import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import '../providers/empleados_provider.dart';
import '../widgets/empleado_flip_card.dart';
import '../widgets/add_empleado_dialog.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/admin_header.dart';
import '../widgets/admin_footer.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class AdminEmpleadosView extends StatefulWidget {
  const AdminEmpleadosView({super.key});

  @override
  State<AdminEmpleadosView> createState() => _AdminEmpleadosViewState();
}

class _AdminEmpleadosViewState extends State<AdminEmpleadosView> {
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
      context.read<EmpleadosProvider>().fetchEmpleados();
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
      debugPrint('Error fetching footer stats in empleados: $e');
    }
  }

  void _mostrarDialogoAgregar() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AddEmpleadoDialog(),
    );
  }

  void _confirmarEliminar(int id, String nombre) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          'Confirmar eliminación',
          style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, color: Color(0xFF080C1E)),
        ),
        content: Text(
          '¿Estás seguro de que deseas eliminar al empleado "$nombre"?',
          style: const TextStyle(fontFamily: 'Kanit', color: Color(0xFF64748B)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: Color(0xFF8898B3), fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final provider = context.read<EmpleadosProvider>();
              final success = await provider.eliminarEmpleado(id);
              if (mounted) {
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Empleado eliminado'), backgroundColor: Colors.green),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(provider.error ?? 'Error al eliminar'), backgroundColor: Colors.red),
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

  void _mostrarDialogoEditar(dynamic empleado) {
    final nombreController = TextEditingController(text: empleado.nombre);
    final telefonoController = TextEditingController(text: empleado.telefono ?? '');
    final formKey = GlobalKey<FormState>();
    bool isSaving = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setStateDialog) => AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text(
            'Editar Empleado',
            style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold, color: Color(0xFF080C1E)),
          ),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nombreController,
                  style: const TextStyle(fontFamily: 'Kanit', fontSize: 14),
                  decoration: InputDecoration(
                    labelText: 'Nombre Completo',
                    labelStyle: const TextStyle(fontFamily: 'Kanit'),
                    prefixIcon: const Icon(Icons.person, size: 18),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: telefonoController,
                  style: const TextStyle(fontFamily: 'Kanit', fontSize: 14),
                  keyboardType: TextInputType.phone,
                  decoration: InputDecoration(
                    labelText: 'Teléfono',
                    labelStyle: const TextStyle(fontFamily: 'Kanit'),
                    prefixIcon: const Icon(Icons.phone, size: 18),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSaving ? null : () => Navigator.pop(ctx),
              child: const Text('Cancelar', style: TextStyle(color: Color(0xFF8898B3), fontFamily: 'Kanit', fontWeight: FontWeight.w600)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0066FF),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                elevation: 0,
              ),
              onPressed: isSaving
                  ? null
                  : () async {
                      if (formKey.currentState!.validate()) {
                        setStateDialog(() => isSaving = true);
                        final provider = context.read<EmpleadosProvider>();
                        final success = await provider.editarEmpleado(
                          id: empleado.id,
                          nombre: nombreController.text.trim(),
                          telefono: telefonoController.text.trim(),
                        );
                        if (mounted) {
                          if (ctx.mounted) Navigator.pop(ctx);
                          if (context.mounted) {
                            if (success) {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Empleado actualizado'), backgroundColor: Colors.green));
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.error ?? 'Error al editar'), backgroundColor: Colors.red));
                            }
                          }
                        }
                      }
                    },
              child: isSaving
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Guardar', style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<EmpleadosProvider>(context);
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
                                child: const Icon(Icons.badge_outlined, color: primaryBlue, size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Empleados',
                                      style: TextStyle(
                                        fontFamily: 'Kanit',
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF080C1E),
                                      ),
                                    ),
                                    Text(
                                      'Gestiona tus colaboradores activos',
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

                    // Grid or List of employees
                    Consumer<EmpleadosProvider>(
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
                        if (provider.empleados.isEmpty) {
                          return const Padding(
                            padding: EdgeInsets.all(48.0),
                            child: Center(
                              child: Text(
                                'No hay empleados registrados.',
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
                            mainAxisExtent: 260,
                          ),
                          itemCount: provider.empleados.length,
                          itemBuilder: (context, index) {
                            final empleado = provider.empleados[index];
                            return EmpleadoFlipCard(
                              empleado: empleado,
                              onEdit: () => _mostrarDialogoEditar(empleado),
                              onDelete: () => _confirmarEliminar(empleado.id, empleado.nombre),
                            );
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
}