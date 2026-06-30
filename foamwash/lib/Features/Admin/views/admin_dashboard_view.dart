import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Autenticacion/login_screen.dart';
import '../widgets/admin_drawer.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class AdminDashboardView extends StatefulWidget {
  const AdminDashboardView({super.key});

  @override
  State<AdminDashboardView> createState() => _AdminDashboardViewState();
}

class _AdminDashboardViewState extends State<AdminDashboardView> {
  List<dynamic> _reservas = [];
  List<dynamic> _empleados = [];
  int _totalClientesInDB = 0;
  bool _isLoading = true;
  String? _error;

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

      // Preparar los headers. Si existe una cookie guardada del login, se inyecta aqui para evitar el Error 401
      Map<String, String> headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      };
      
      if (cookieToken != null && cookieToken.isNotEmpty) {
        // Enviar la cookie cruda que extrajimos del login
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
            // El backend retorna { rol: { Rol: 'cliente' } }
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

  Future<void> _logout() async {
    final secureStorage = SecureStorageService();
    await secureStorage.clearAll();
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (!mounted) return;
    Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
  }

  // Helper properties
  static const Color _primary = Color(0xFF1A56FF);
  static const Color _primaryDark = Color(0xFF0A1435);
  static const Color _bgField = Color(0xFFF4F7FF);
  static const Color _textColor = Color(0xFF1A2540);

  // Funciones de calculo para el Panel de Control
  int _getTotalClientes() {
    return _totalClientesInDB;
  }
  
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
          if (r['Estado'] == 'Completado' || r['Estado'] == 'Finalizado') {
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

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final userFoto = auth.user?.fotoPerfil;

    return Scaffold(
      backgroundColor: _bgField,
      endDrawer: AdminDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: _primaryDark,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            style: TextStyle(fontFamily: 'Kanit', fontSize: 22, fontWeight: FontWeight.w900),
            children: [
              TextSpan(text: 'FoamWash', style: TextStyle(color: Colors.white)),
              TextSpan(text: ' AD', style: TextStyle(color: _primary, fontSize: 16, fontWeight: FontWeight.w900)),
            ],
          ),
        ),
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu, color: Colors.white, size: 28),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 16, left: 8),
            child: GestureDetector(
              onTap: _logout,
              child: CircleAvatar(
                backgroundColor: const Color(0xFFD9D9D9),
                radius: 18,
                backgroundImage: userFoto != null && userFoto.isNotEmpty
                    ? NetworkImage(userFoto.startsWith('http')
                        ? userFoto
                        : '${ApiConstants.baseUrl.replaceAll('/api', '')}$userFoto')
                    : null,
                child: (userFoto == null || userFoto.isEmpty)
                    ? const Icon(Icons.person, color: Colors.white, size: 24)
                    : null,
              ),
            ),
          )
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
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Text(
                          'Panel de control',
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            color: _textColor,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Visión general del negocio en tiempo real',
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            color: Colors.blueGrey.shade600,
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        // ── KPI CARDS ──
                        _buildKpiGrid(),
                        
                        const SizedBox(height: 32),
                        
                        // ── ÚLTIMAS RESERVAS ──
                        _buildSectionHeader('Últimas reservas', Icons.calendar_today, onAction: () => _showTodasLasReservas()),
                        const SizedBox(height: 12),
                        _buildReservasList(),
                        
                        const SizedBox(height: 32),
                        
                        // ── EMPLEADOS ACTIVOS ──
                        _buildSectionHeader('Empleados activos', Icons.people_outline, onAction: () => Navigator.pushNamed(context, '/admin_empleados')),
                        const SizedBox(height: 12),
                        _buildEmpleadosList(),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, {VoidCallback? onAction}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: _primary, size: 20),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: _textColor,
              ),
            ),
          ],
        ),
        if (onAction != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(
              foregroundColor: Colors.blueGrey.shade700,
              padding: EdgeInsets.zero,
              minimumSize: const Size(50, 30),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Row(
              children: [
                Text('Ver todas', style: TextStyle(fontFamily: 'Kanit', fontSize: 13, fontWeight: FontWeight.w600)),
                SizedBox(width: 4),
                Icon(Icons.arrow_forward, size: 14),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildKpiGrid() {
    final currencyFormat = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);
    final isSmall = MediaQuery.of(context).size.width < 400;
    return GridView.count(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: isSmall ? 1.1 : 1.4,
      children: [
        _buildKpiCard(
          icon: Icons.people_outline,
          value: '${_getTotalClientes()}',
          label: 'Total clientes',
          badgeText: '+12%',
          badgeColor: const Color(0xFFDCFCE7),
          badgeTextColor: const Color(0xFF15803D),
        ),
        _buildKpiCard(
          icon: Icons.receipt_long,
          value: '${_getReservasDelMes()}',
          label: 'Reservas del mes',
          badgeText: '+8%',
          badgeColor: const Color(0xFFDCFCE7),
          badgeTextColor: const Color(0xFF15803D),
        ),
        _buildKpiCard(
          icon: Icons.access_time,
          value: '${_getPendientes()}',
          label: 'Pendientes',
          badgeText: '-3%',
          badgeColor: const Color(0xFFFFE4E6),
          badgeTextColor: const Color(0xFFE11D48),
        ),
        _buildKpiCard(
          icon: Icons.attach_money,
          value: currencyFormat.format(_getIngresosTotales()),
          label: 'Ingresos del mes',
          badgeText: '',
          badgeColor: Colors.transparent,
          badgeTextColor: Colors.transparent,
        ),
      ],
    );
  }

  Widget _buildKpiCard({
    required IconData icon,
    required String value,
    required String label,
    required String badgeText,
    required Color badgeColor,
    required Color badgeTextColor,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      padding: const EdgeInsets.all(12),
      child: Stack(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: _primaryLight, size: 22),
              const SizedBox(height: 6),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  value,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: _primary,
                    height: 1.1,
                  ),
                ),
              ),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  label,
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: Colors.blueGrey.shade500,
                  ),
                ),
              ),
            ],
          ),
          if (badgeText.isNotEmpty)
            Positioned(
              top: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: badgeTextColor,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  static const Color _primaryLight = Color(0xFF6B8CFF);

  Widget _buildReservasList() {
    if (_reservas.isEmpty) {
      return const Center(
        child: Text('No hay reservas disponibles.', style: TextStyle(fontFamily: 'Kanit', color: Colors.grey)),
      );
    }
    
    return ListView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      itemCount: _reservas.length > 7 ? 7 : _reservas.length, // Mostrar maximo 7 como en la imagen
      itemBuilder: (context, index) {
        final r = _reservas[index];
        final clienteNombre = r['cliente']?['Nombre'] ?? 'cliente de prueba';
        final clienteTelf = r['cliente']?['Telefono'] ?? '3123038407';
        final clienteDir = r['cliente']?['Direccion'] ?? 'Dirección desconocida';
        final estado = r['Estado'] ?? 'Pendiente';
        final servicios = (r['servicios'] as List?) ?? [];
        final servicioNombre = servicios.isNotEmpty
            ? servicios.map((s) => s['Nombre_Servicio'] ?? 'Servicio').join(', ')
            : 'Sin servicio';

        // Obtener iniciales para el avatar
        String initials = 'CP';
        if (clienteNombre.isNotEmpty && clienteNombre != 'cliente de prueba') {
          List<String> parts = clienteNombre.trim().split(' ');
          if (parts.length > 1) {
            initials = '${parts[0][0]}${parts[1][0]}'.toUpperCase();
          } else {
            initials = clienteNombre.substring(0, 2 > clienteNombre.length ? clienteNombre.length : 2).toUpperCase();
          }
        } else if (clienteNombre == 'cliente de prueba') {
          initials = 'CP'; // Placeholder from image
        }

        // Estilos de la pastilla
        Color bgPill, textPill;
        if (estado == 'Cancelado' || estado == 'Cancelada') {
          bgPill = const Color(0xFFFEF2F2);
          textPill = const Color(0xFFE11D48);
        } else if (estado == 'Pendiente') {
          bgPill = const Color(0xFFFFF7ED);
          textPill = const Color(0xFFC2410C);
        } else {
          bgPill = const Color(0xFFDCFCE7);
          textPill = const Color(0xFF15803D);
        }

        return InkWell(
          onTap: () => _showEstadoModalAdmin(r),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.02),
                blurRadius: 8,
                offset: const Offset(0, 2),
              )
            ],
          ),
          child: Row(
            children: [
              // Avatar
              Container(
                width: 40,
                height: 40,
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
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: _primary,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              // Detalles
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Dir: $clienteDir. Tel: $clienteTelf',
                      style: const TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: _textColor,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$clienteNombre - $servicioNombre',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        color: Colors.blueGrey.shade400,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              // Pastilla Estado
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: bgPill,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  estado,
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: textPill,
                  ),
                ),
              ),
            ],
          ),
        ),
        );
      },
    );
  }

  Widget _buildEmpleadosList() {
    if (_empleados.isEmpty) {
      return const Center(child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Text('No hay empleados registrados.', style: TextStyle(fontFamily: 'Kanit', color: Colors.grey)),
      ));
    }
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: Column(
        children: _empleados.take(5).map((e) {
          final nombre = e['Nombre'] ?? 'Desconocido';
          final telefono = e['Telefono'] ?? 'Sin teléfono';
          
          return Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 3,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _primary,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 12),
                Stack(
                  children: [
                    const CircleAvatar(
                      radius: 20,
                      backgroundColor: Colors.blueGrey,
                      child: Icon(Icons.person, color: Colors.white),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.greenAccent.shade400,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        nombre,
                        style: const TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: _textColor,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.phone, size: 12, color: Colors.blueGrey.shade400),
                          const SizedBox(width: 4),
                          Text(
                            telefono,
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                              color: Colors.blueGrey.shade400,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDCFCE7),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text(
                    'Activo',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF15803D),
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
                onPressed: () {
                  Navigator.pop(context);
                  _actualizarEstadoAdmin(id, 'En Proceso');
                },
                child: const Text('Mover a En Proceso'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _actualizarEstadoAdmin(id, 'Completado');
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                child: const Text('Mover a Completado'),
              ),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  _mostrarMotivoCancelacion(id);
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
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
          title: const Text('Motivo de Cancelación'),
          content: TextField(
            controller: motivoCtrl,
            decoration: const InputDecoration(hintText: 'Ingrese el motivo...'),
            maxLines: 3,
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Volver')),
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _cancelarReservaAdmin(id, motivoCtrl.text);
              },
              child: const Text('Confirmar Cancelación', style: TextStyle(color: Colors.red)),
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