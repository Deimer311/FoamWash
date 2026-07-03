import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import '../providers/usuarios_provider.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/admin_header.dart';
import '../widgets/admin_footer.dart';
import '../widgets/add_usuario_dialog.dart';
import '../widgets/edit_usuario_dialog.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class AdminUsuariosView extends StatefulWidget {
  const AdminUsuariosView({super.key});

  @override
  State<AdminUsuariosView> createState() => _AdminUsuariosViewState();
}

class _AdminUsuariosViewState extends State<AdminUsuariosView> {
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
      context.read<UsuariosProvider>().fetchUsuarios();
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
      debugPrint('Error fetching footer stats in usuarios: $e');
    }
  }

  void _mostrarDialogoAgregar() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AddUsuarioDialog(),
    );
  }

  void _confirmarEliminar(dynamic user) {
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
          '¿Estás seguro de que deseas eliminar a ${user['Nombre']}?',
          style: const TextStyle(fontFamily: 'Kanit', color: Color(0xFF64748B)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Color(0xFF8898B3), fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () {
              context.read<UsuariosProvider>().deleteUsuario(user['Id_Usuario']);
              Navigator.pop(context);
            },
            child: const Text('Eliminar', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  void _mostrarDialogoEditar(dynamic user) {
    showDialog(
      context: context,
      builder: (context) => EditUsuarioDialog(usuario: user),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UsuariosProvider>(context);
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
                                child: const Icon(Icons.people_outline_rounded, color: primaryBlue, size: 20),
                              ),
                              const SizedBox(width: 12),
                              const Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Usuarios',
                                      style: TextStyle(
                                        fontFamily: 'Kanit',
                                        fontSize: 22,
                                        fontWeight: FontWeight.w800,
                                        color: Color(0xFF080C1E),
                                      ),
                                    ),
                                    Text(
                                      'Gestiona las cuentas registradas',
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

                    // Table card of users list
                    Container(
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
                      child: Consumer<UsuariosProvider>(
                        builder: (context, provider, child) {
                          if (provider.isLoading) {
                            return const Padding(
                              padding: EdgeInsets.all(48.0),
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
                          if (provider.usuarios.isEmpty) {
                            return const Padding(
                              padding: EdgeInsets.all(48.0),
                              child: Center(
                                child: Text(
                                  'No hay usuarios registrados.',
                                  style: TextStyle(fontFamily: 'Kanit', color: Color(0xFF8898B3)),
                                ),
                              ),
                            );
                          }

                          return ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            itemCount: provider.usuarios.length,
                            separatorBuilder: (context, index) => const Divider(color: Color(0xFFF1F5F9), height: 1),
                            itemBuilder: (context, index) {
                              final user = provider.usuarios[index];
                              final String nombre = user['Nombre'] ?? 'Sin nombre';
                              final String correo = user['Correo'] ?? 'Sin correo';
                              final String telefono = user['Telefono'] ?? 'Sin teléfono';
                              final int id = user['Id_Usuario'] ?? (index + 1);

                              return Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: primaryBlue.withOpacity(0.08),
                                      radius: 18,
                                      child: Text(
                                        '${index + 1}',
                                        style: const TextStyle(
                                          fontFamily: 'Kanit',
                                          color: primaryBlue,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12.5,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            children: [
                                              Text(
                                                '#$id',
                                                style: const TextStyle(
                                                  fontFamily: 'Kanit',
                                                  fontSize: 11,
                                                  color: Color(0xFF8898B3),
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Expanded(
                                                child: Text(
                                                  nombre,
                                                  style: const TextStyle(
                                                    fontFamily: 'Kanit',
                                                    fontSize: 13.5,
                                                    fontWeight: FontWeight.bold,
                                                    color: Color(0xFF080C1E),
                                                  ),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '$correo  ·  $telefono',
                                            style: const TextStyle(
                                              fontFamily: 'Kanit',
                                              fontSize: 11.5,
                                              color: Color(0xFF64748B),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.edit_note_rounded, color: primaryBlue, size: 22),
                                          onPressed: () => _mostrarDialogoEditar(user),
                                          tooltip: 'Editar',
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline_rounded, color: Color(0xFFEF4444), size: 22),
                                          onPressed: () => _confirmarEliminar(user),
                                          tooltip: 'Eliminar',
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              );
                            },
                          );
                        },
                      ),
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