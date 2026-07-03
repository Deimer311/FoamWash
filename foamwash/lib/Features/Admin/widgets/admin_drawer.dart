import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';

class AdminDrawer extends StatefulWidget {
  const AdminDrawer({super.key});

  @override
  State<AdminDrawer> createState() => _AdminDrawerState();
}

class _AdminDrawerState extends State<AdminDrawer> {
  bool _isGestionExpanded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final currentRoute = ModalRoute.of(context)?.settings.name;
    if (currentRoute == '/admin_empleados' ||
        currentRoute == '/admin_usuarios' ||
        currentRoute == '/admin_servicios') {
      _isGestionExpanded = true;
    }
  }

  String _getIniciales(String name) {
    if (name.isEmpty) return 'AD';
    return name.trim().split(' ').map((p) => p.isNotEmpty ? p[0] : '').join('').toUpperCase().substring(0, 2);
  }

  @override
  Widget build(BuildContext context) {
    const Color darkBg = Color(0xFF080C1E);
    const Color itemBgActive = Color(0xFF1E293B);
    const Color accentBlue = Color(0xFF0066FF);
    const Color textMuted = Color(0xFF8898B3);

    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final userName = user?.nombre ?? 'Administrador';
    final userEmail = user?.correo ?? '';
    final userFoto = user?.fotoPerfil;

    final currentRoute = ModalRoute.of(context)?.settings.name;

    return Drawer(
      backgroundColor: darkBg,
      child: SafeArea(
        child: Column(
          children: [
            // Drawer Header (Branding & User Profile)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFF1E293B), width: 1),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black26,
                              blurRadius: 8,
                              offset: Offset(0, 2),
                            )
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.asset(
                            'assets/LogoFW.jpeg',
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => const Center(
                              child: Text(
                                'FW',
                                style: TextStyle(
                                  fontFamily: 'Kanit',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'FoamWash',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.3,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0066FF).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: const Color(0xFF0066FF).withOpacity(0.25),
                                width: 1,
                              ),
                            ),
                            child: const Text(
                              'ADMIN PANEL',
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 9,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0099FF),
                                letterSpacing: 0.8,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: accentBlue.withOpacity(0.12),
                        backgroundImage: userFoto != null && userFoto.isNotEmpty
                            ? NetworkImage(userFoto.startsWith('http')
                                ? userFoto
                                : '${ApiConstants.baseUrl.replaceAll('/api', '')}$userFoto')
                            : null,
                        child: (userFoto == null || userFoto.isEmpty)
                            ? Text(
                                _getIniciales(userName),
                                style: const TextStyle(
                                  fontFamily: 'Kanit',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              userName,
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const Text(
                              'Administrador',
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: accentBlue,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Navigation Options
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  _buildMainItem(
                    icon: Icons.grid_view_rounded,
                    title: 'Panel',
                    route: '/admin_dashboard',
                    isSelected: currentRoute == '/admin_dashboard',
                  ),
                  _buildMainItem(
                    icon: Icons.calendar_today_rounded,
                    title: 'Agenda',
                    route: '/admin_agenda',
                    isSelected: currentRoute == '/admin_agenda',
                  ),

                  // Gestión Collapsible Item
                  _buildGestionCollapsible(currentRoute),

                  _buildMainItem(
                    icon: Icons.bar_chart_rounded,
                    title: 'Reportes',
                    route: '/admin_reportes',
                    isSelected: currentRoute == '/admin_reportes',
                  ),
                  
                  _buildMainItem(
                    icon: Icons.person_outline_rounded,
                    title: 'Mi Perfil',
                    route: '/perfilAdmin',
                    isSelected: currentRoute == '/perfilAdmin',
                  ),
                ],
              ),
            ),

            // Logout Action
            const Divider(color: Color(0xFF1E293B), height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                tileColor: const Color(0xFFEF4444).withOpacity(0.08),
                leading: const Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 20),
                title: const Text(
                  'Cerrar sesión',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFEF4444),
                  ),
                ),
                onTap: () async {
                  await auth.logout();
                  if (context.mounted) {
                    Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMainItem({
    required IconData icon,
    required String title,
    required String route,
    required bool isSelected,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFF1E293B) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        leading: Icon(
          icon,
          color: isSelected ? Colors.white : const Color(0xFF8898B3),
          size: 20,
        ),
        title: Text(
          title,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFF8898B3),
          ),
        ),
        trailing: isSelected
            ? Container(
                width: 4,
                height: 16,
                decoration: BoxDecoration(
                  color: const Color(0xFF0066FF),
                  borderRadius: BorderRadius.circular(2),
                ),
              )
            : null,
        onTap: () {
          Navigator.pop(context);
          if (!isSelected) {
            Navigator.pushReplacementNamed(context, route);
          }
        },
      ),
    );
  }

  Widget _buildGestionCollapsible(String? currentRoute) {
    final isChildSelected = currentRoute == '/admin_empleados' ||
        currentRoute == '/admin_usuarios' ||
        currentRoute == '/admin_servicios';

    final textMuted = const Color(0xFF8898B3);
    final accentBlue = const Color(0xFF0066FF);

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      decoration: BoxDecoration(
        color: isChildSelected ? const Color(0xFF1E293B).withOpacity(0.3) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          ListTile(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            leading: Icon(
              Icons.people_outline_rounded,
              color: isChildSelected ? Colors.white : textMuted,
              size: 20,
            ),
            title: Text(
              'Gestión',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 14,
                fontWeight: isChildSelected ? FontWeight.w600 : FontWeight.w500,
                color: isChildSelected ? Colors.white : textMuted,
              ),
            ),
            trailing: Icon(
              _isGestionExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
              color: isChildSelected ? Colors.white : textMuted,
              size: 18,
            ),
            onTap: () {
              setState(() {
                _isGestionExpanded = !_isGestionExpanded;
              });
            },
          ),
          if (_isGestionExpanded)
            Padding(
              padding: const EdgeInsets.only(left: 16, bottom: 8, right: 8),
              child: Column(
                children: [
                  _buildSubItem(
                    icon: Icons.badge_outlined,
                    title: 'Empleados',
                    route: '/admin_empleados',
                    isSelected: currentRoute == '/admin_empleados',
                  ),
                  _buildSubItem(
                    icon: Icons.key_outlined,
                    title: 'Usuarios',
                    route: '/admin_usuarios',
                    isSelected: currentRoute == '/admin_usuarios',
                  ),
                  _buildSubItem(
                    icon: Icons.cleaning_services_outlined,
                    title: 'Servicios',
                    route: '/admin_servicios',
                    isSelected: currentRoute == '/admin_servicios',
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSubItem({
    required IconData icon,
    required String title,
    required String route,
    required bool isSelected,
  }) {
    return Container(
      margin: const EdgeInsets.only(top: 4),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFF0066FF).withOpacity(0.15) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        visualDensity: VisualDensity.compact,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        leading: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF0066FF).withOpacity(0.2) : const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            color: isSelected ? const Color(0xFF00B8FF) : const Color(0xFF8898B3),
            size: 14,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected ? Colors.white : const Color(0xFF8898B3),
          ),
        ),
        onTap: () {
          Navigator.pop(context);
          if (!isSelected) {
            Navigator.pushReplacementNamed(context, route);
          }
        },
      ),
    );
  }
}
