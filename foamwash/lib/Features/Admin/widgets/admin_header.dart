import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';

class AdminHeader extends StatelessWidget implements PreferredSizeWidget {
  final String activeTab;
  const AdminHeader({super.key, required this.activeTab});

  @override
  Size get preferredSize => const Size.fromHeight(64.0);

  String _getIniciales(String name) {
    if (name.isEmpty) return 'AD';
    final parts = name.trim().split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return 'AD';
    if (parts.length == 1) {
      final w = parts[0];
      return w.length >= 2 ? w.substring(0, 2).toUpperCase() : w.toUpperCase();
    }
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  PopupMenuItem<String> _buildPopupItem(String value, IconData icon, String text, Color iconColor) {
    return PopupMenuItem<String>(
      value: value,
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(7),
            ),
            child: Icon(icon, color: iconColor, size: 14),
          ),
          const SizedBox(width: 10),
          Text(
            text,
            style: const TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.of(context).size.width;
    final bool isDesktop = width >= 900;

    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final userName = user?.nombre ?? 'Administrador';
    final userEmail = user?.correo ?? '';
    final userFoto = user?.fotoPerfil;

    const Color darkBg = Color(0xFF080C1E);
    const Color accentBlue = Color(0xFF0066FF);

    return AppBar(
      automaticallyImplyLeading: false,
      backgroundColor: darkBg,
      elevation: 0,
      toolbarHeight: 64.0,
      titleSpacing: 0,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.0),
        child: Container(
          color: Colors.white.withOpacity(0.08),
          height: 1.0,
        ),
      ),
      title: Padding(
        padding: EdgeInsets.only(left: isDesktop ? 20.0 : 10.0),
        child: Row(
          children: [
            if (!isDesktop) ...[
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
                icon: const Icon(
                  Icons.menu_rounded,
                  color: Colors.white,
                  size: 24,
                ),
                onPressed: () {
                  Scaffold.of(context).openDrawer();
                },
              ),
              const SizedBox(width: 12),
            ],
            GestureDetector(
              onTap: () {
                if (activeTab != 'panel') {
                  Navigator.pushReplacementNamed(context, '/admin_dashboard');
                }
              },
              child: Row(
                children: [
                  Container(
                    width: isDesktop ? 32 : 28,
                    height: isDesktop ? 32 : 28,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3B82F6), Color(0xFF2563EB)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: const [
                        BoxShadow(
                          color: Colors.black26,
                          blurRadius: 4,
                          offset: Offset(0, 1),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.asset(
                        'assets/LogoFW.jpeg',
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => Center(
                          child: Text(
                            'FW',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: isDesktop ? 12 : 10,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  RichText(
                    text: TextSpan(
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: isDesktop ? 18 : 15,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.3,
                      ),
                      children: [
                        const TextSpan(text: 'FoamWash'),
                        TextSpan(
                          text: ' AD',
                          style: TextStyle(
                            color: const Color(0xFF0099FF),
                            fontSize: isDesktop ? 11 : 9,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (isDesktop) ...[
              const SizedBox(width: 24),
              _buildDesktopNavBtn(
                context,
                isActive: activeTab == 'panel',
                icon: Icons.grid_view_rounded,
                label: 'Panel',
                route: '/admin_dashboard',
              ),
              const SizedBox(width: 4),
              _buildDesktopNavBtn(
                context,
                isActive: activeTab == 'agenda',
                icon: Icons.calendar_today_rounded,
                label: 'Agenda',
                route: '/admin_agenda',
              ),
              const SizedBox(width: 4),
              _buildGestionDropdown(
                context,
                ['empleados', 'usuarios', 'servicios'].contains(activeTab),
              ),
              const SizedBox(width: 4),
              _buildDesktopNavBtn(
                context,
                isActive: activeTab == 'reportes',
                icon: Icons.bar_chart_rounded,
                label: 'Reportes',
                route: '/admin_reportes',
              ),
            ],
          ],
        ),
      ),
      actions: [
        Padding(
          padding: EdgeInsets.only(right: isDesktop ? 20.0 : 10.0),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Notification Bell
              Container(
                width: isDesktop ? 34 : 30,
                height: isDesktop ? 34 : 30,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: Colors.white.withOpacity(0.09),
                    width: 1,
                  ),
                ),
                child: IconButton(
                  padding: EdgeInsets.zero,
                  icon: Icon(
                    Icons.notifications_none_rounded,
                    color: Colors.white60,
                    size: isDesktop ? 18 : 16,
                  ),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('No hay nuevas notificaciones.'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),
              ),
              SizedBox(width: isDesktop ? 10 : 6),

              // Avatar / Profile dropdown
              PopupMenuButton<String>(
                offset: const Offset(0, 48),
                color: const Color(0xFF0A0E26),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                  side: BorderSide(
                    color: Colors.white.withOpacity(0.09),
                    width: 1,
                  ),
                ),
                onSelected: (value) async {
                  if (value == 'perfil') {
                    Navigator.pushReplacementNamed(context, '/perfilAdmin');
                  } else if (value == 'dashboard') {
                    Navigator.pushReplacementNamed(context, '/admin_dashboard');
                  } else if (value == 'logout') {
                    final logoutAuth = Provider.of<AuthProvider>(context, listen: false);
                    await logoutAuth.logout();
                    if (context.mounted) {
                      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
                    }
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem<String>(
                    enabled: false,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          userName,
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          userEmail,
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 11,
                            color: Colors.white.withOpacity(0.4),
                          ),
                        ),
                        const SizedBox(height: 6),
                      ],
                    ),
                  ),
                  const PopupMenuDivider(height: 1),
                  _buildPopupItem('perfil', Icons.person_outline_rounded, 'Mi perfil', const Color(0xFF00B8FF)),
                  _buildPopupItem('dashboard', Icons.pie_chart_outline_rounded, 'Dashboard', const Color(0xFF00B8FF)),
                  const PopupMenuDivider(height: 1),
                  _buildPopupItem('logout', Icons.logout_rounded, 'Cerrar sesión', const Color(0xFFFF6B6B)),
                ],
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: isDesktop ? 10 : 6,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(50),
                    border: Border.all(
                      color: Colors.white.withOpacity(0.1),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: isDesktop ? 13 : 11,
                        backgroundColor: accentBlue.withOpacity(0.12),
                        backgroundImage: userFoto != null && userFoto.isNotEmpty
                            ? NetworkImage(userFoto.startsWith('http')
                                ? userFoto
                                : '${ApiConstants.baseUrl.replaceAll('/api', '')}$userFoto')
                            : null,
                        child: (userFoto == null || userFoto.isEmpty)
                            ? Text(
                                _getIniciales(userName),
                                style: TextStyle(
                                  fontFamily: 'Kanit',
                                  fontSize: isDesktop ? 9 : 8,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              )
                            : null,
                      ),
                      if (isDesktop) ...[
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              userName,
                              style: const TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                            ),
                            const Text(
                              'Admin',
                              style: TextStyle(
                                fontFamily: 'Kanit',
                                fontSize: 9,
                                fontWeight: FontWeight.w600,
                                color: Color(0xFF0099FF),
                              ),
                            ),
                          ],
                        ),
                      ]
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDesktopNavBtn(
    BuildContext context, {
    required bool isActive,
    required IconData icon,
    required String label,
    required String route,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isActive ? const Color(0xFF0066FF).withOpacity(0.18) : Colors.transparent,
        borderRadius: BorderRadius.circular(7),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(7),
        onTap: () {
          if (!isActive) {
            Navigator.pushReplacementNamed(context, route);
          }
        },
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                color: isActive ? Colors.white : Colors.white.withOpacity(0.55),
                size: 14,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13.5,
                  fontWeight: FontWeight.w500,
                  color: isActive ? Colors.white : Colors.white.withOpacity(0.55),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGestionDropdown(BuildContext context, bool isSelected) {
    return PopupMenuButton<String>(
      offset: const Offset(0, 48),
      color: const Color(0xFF0A0E26),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: Colors.white.withOpacity(0.09),
          width: 1,
        ),
      ),
      onSelected: (value) {
        if (value == 'empleados') Navigator.pushReplacementNamed(context, '/admin_empleados');
        if (value == 'usuarios') Navigator.pushReplacementNamed(context, '/admin_usuarios');
        if (value == 'servicios') Navigator.pushReplacementNamed(context, '/admin_servicios');
      },
      itemBuilder: (context) => [
        _buildPopupItem('empleados', Icons.badge_outlined, 'Empleados', const Color(0xFF00B8FF)),
        _buildPopupItem('usuarios', Icons.key_outlined, 'Usuarios', const Color(0xFF00B8FF)),
        const PopupMenuDivider(height: 1),
        _buildPopupItem('servicios', Icons.cleaning_services_outlined, 'Servicios', const Color(0xFF00B8FF)),
      ],
      child: Container(
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0066FF).withOpacity(0.18) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.people_outline_rounded,
              color: isSelected ? Colors.white : Colors.white.withOpacity(0.55),
              size: 14,
            ),
            const SizedBox(width: 6),
            Text(
              'Gestión',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 13.5,
                fontWeight: FontWeight.w500,
                color: isSelected ? Colors.white : Colors.white.withOpacity(0.55),
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              color: isSelected ? Colors.white : Colors.white.withOpacity(0.35),
              size: 14,
            ),
          ],
        ),
      ),
    );
  }
}
