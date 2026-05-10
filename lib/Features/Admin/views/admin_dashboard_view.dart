import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/Features/auth_login/login_screen.dart';
import '../widgets/admin_drawer.dart';

class AdminDashboardView extends StatefulWidget {
  const AdminDashboardView({super.key});

  @override
  State<AdminDashboardView> createState() => _AdminDashboardViewState();
}

class _AdminDashboardViewState extends State<AdminDashboardView> {
  List<dynamic> _reservas = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _checkAccess();
    _fetchData();
  }

  Future<void> _checkAccess() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString('userEmail');
    if (email != 'admin@gmail.com') {
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/home');
    }
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token') ?? '';
      final cookieToken = prefs.getString('cookie_token');

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

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        setState(() {
          _reservas = data['data'] ?? data;
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

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('cookie_token');
    if (!mounted) return;
    Navigator.pushReplacementNamed(context, '/login');
  }

  // Helper properties
  static const Color _primary = Color(0xFF1A56FF);
  static const Color _primaryDark = Color(0xFF0A1435);
  static const Color _bgField = Color(0xFFF4F7FF);
  static const Color _textColor = Color(0xFF1A2540);

  // Funciones de calculo para el Panel de Control
  int _getTotalClientes() {
    final clientes = _reservas.map((r) => r['cliente']?['Id_Usuario']).where((id) => id != null).toSet();
    return clientes.length > 0 ? clientes.length : 27; // Dato simulado si no hay suficientes
  }
  
  int _getPendientes() {
    return _reservas.where((r) => r['Estado'] == 'Pendiente').length;
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
              child: const CircleAvatar(
                backgroundColor: Color(0xFFD9D9D9),
                radius: 18,
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
                        _buildSectionHeader('Últimas reservas', Icons.calendar_today, onAction: () {}),
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
    return GridView.count(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      crossAxisCount: 2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      childAspectRatio: 1.8,
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
          value: '${_reservas.length}',
          label: 'Total reservas',
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
          value: '\$ 2.060.000',
          label: 'Ingresos totales',
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
              Text(
                value,
                style: const TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: _primary,
                  height: 1.1,
                ),
              ),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Colors.blueGrey.shade500,
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

        return Container(
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
                      '$clienteNombre - 1970-', // "1970-" placeholder igual a la imagen
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
        );
      },
    );
  }

  Widget _buildEmpleadosList() {
    // Usamos datos simulados basados en la imagen ya que el endpoint es para reservas
    // En una iteracion futura, podriamos mezclar esto con `getEmpleadosEndpoint`
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
        children: [
          // Empleado 1
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Indicador azul a la izquierda
                Container(
                  width: 3,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _primary,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 12),
                // Avatar con puntito verde
                Stack(
                  children: [
                    const CircleAvatar(
                      radius: 20,
                      backgroundColor: Colors.blueGrey,
                      backgroundImage: AssetImage('assets/fondo.png'), // Placeholder
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
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'trabajador prueba 1',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: _textColor,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Icon(Icons.phone, size: 12, color: Colors.blueGrey.shade400),
                          const SizedBox(width: 4),
                          Text(
                            '3212568787',
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
                // Pastilla
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
          ),
        ],
      ),
    );
  }
}
