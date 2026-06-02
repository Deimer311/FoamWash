import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/Api/api_constants.dart';
import '../widgets/admin_drawer.dart';
import 'package:foamwash/core/utils/security_utils.dart';

class AdminAgendaView extends StatefulWidget {
  const AdminAgendaView({super.key});

  @override
  State<AdminAgendaView> createState() => _AdminAgendaViewState();
}

class _AdminAgendaViewState extends State<AdminAgendaView> {
  String _currentView = 'hoy'; // hoy, semana, mes
  List<dynamic> _reservas = [];
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
      if (r['Estado'] == 'Cancelado') return false; // Filtramos canceladas por ahora
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
        final clienteNombre = r['cliente']?['Nombre'] ?? 'cliente de prueba';
        final clienteTelf = r['cliente']?['Telefono'] ?? '3123038407';
        final clienteDir = r['cliente']?['Direccion'] ?? 'Dirección desconocida';
        final estado = r['Estado'] ?? 'Pendiente';
        final horaStr = r['Hora'] != null ? r['Hora'].toString().split('T').last.substring(0, 5) : '--:--';

        // Obtener iniciales para el avatar
        String initials = 'CP';
        if (clienteNombre.isNotEmpty && clienteNombre != 'cliente de prueba') {
          List<String> parts = clienteNombre.trim().split(' ');
          if (parts.length > 1) {
            initials = '${parts[0][0]}${parts[1][0]}'.toUpperCase();
          } else {
            initials = clienteNombre.substring(0, 2 > clienteNombre.length ? clienteNombre.length : 2).toUpperCase();
          }
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
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border(left: BorderSide(color: textPill, width: 4)),
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
              const SizedBox(width: 14),
              // Detalles
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
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
                        ),
                        Text(
                          horaStr,
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontWeight: FontWeight.w800,
                            color: _primary,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Dir: $clienteDir',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: Colors.blueGrey.shade600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Tel: $clienteTelf',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                        color: Colors.blueGrey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
