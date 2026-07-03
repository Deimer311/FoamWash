import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';

class TrabajadorDrawer extends StatelessWidget {
  final String activeTab; // 'agenda' o 'perfil'

  const TrabajadorDrawer({
    super.key,
    required this.activeTab,
  });

  String _getIniciales(String? name) {
    if (name == null || name.trim().isEmpty) return 'EM';
    final parts = name.trim().split(' ');
    if (parts.length > 1) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.substring(0, name.length > 2 ? 2 : name.length).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final userName = user?.nombre ?? 'Trabajador';
    final userEmail = user?.correo ?? '';
    final userFoto = user?.fotoPerfil;
    final initials = _getIniciales(userName);

    final fotoUrl = userFoto != null && userFoto.isNotEmpty
        ? (userFoto.startsWith('http')
            ? userFoto
            : '${ApiConstants.baseUrl.replaceAll('/api', '')}$userFoto')
        : null;

    const Color primaryDark = Color(0xFF080C1E);
    const Color cardBg = Color(0xFF0F172A);
    const Color activeBg = Color(0xFF0066FF);

    return Drawer(
      backgroundColor: primaryDark,
      child: Column(
        children: [
          // ── DRAWER HEADER ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 60, bottom: 28, left: 24, right: 24),
            decoration: const BoxDecoration(
              color: primaryDark,
              border: Border(
                bottom: BorderSide(color: Color(0x1A94A3B8), width: 1),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Logo row
                Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(6),
                        image: const DecorationImage(
                          image: AssetImage('assets/LogoFW.jpeg'),
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'FoamWash',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 2),
                    const Text(
                      'EM',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF28A745),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                // Avatar, name & email
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF0066FF).withOpacity(0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          )
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: fotoUrl != null
                            ? Image.network(
                                fotoUrl,
                                fit: BoxFit.cover,
                                headers: const {'ngrok-skip-browser-warning': 'true'},
                                errorBuilder: (_, __, ___) => Center(
                                  child: Text(
                                    initials,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      fontFamily: 'Kanit',
                                    ),
                                  ),
                                ),
                              )
                            : Center(
                                child: Text(
                                  initials,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                    fontFamily: 'Kanit',
                                  ),
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            userName,
                            style: const TextStyle(
                              fontFamily: 'Kanit',
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            userEmail,
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              color: Colors.white.withOpacity(0.45),
                              fontSize: 12,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
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

          // ── DRAWER ITEMS ──
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildDrawerItem(
                  context,
                  icon: Icons.calendar_today_rounded,
                  title: 'Agenda',
                  route: '/empleado_agenda',
                  isActive: activeTab == 'agenda',
                  activeBg: activeBg,
                  cardBg: cardBg,
                ),
                const SizedBox(height: 8),
                _buildDrawerItem(
                  context,
                  icon: Icons.person_outline_rounded,
                  title: 'Perfil',
                  route: '/perfilTrabajador',
                  isActive: activeTab == 'perfil',
                  activeBg: activeBg,
                  cardBg: cardBg,
                ),
              ],
            ),
          ),

          // ── LOGOUT SECTION ──
          const Divider(height: 1, color: Color(0x1A94A3B8)),
          Container(
            padding: const EdgeInsets.all(16),
            child: ListTile(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              tileColor: const Color(0xFFFF5050).withOpacity(0.08),
              leading: const Icon(Icons.logout_rounded, color: Color(0xFFFF5050)),
              title: const Text(
                'Cerrar sesión',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  color: Color(0xFFFF5050),
                  fontWeight: FontWeight.w700,
                  fontSize: 14.5,
                ),
              ),
              onTap: () {
                _showLogoutConfirmationDialog(context);
              },
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildDrawerItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String route,
    required bool isActive,
    required Color activeBg,
    required Color cardBg,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isActive ? activeBg.withOpacity(0.15) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: isActive
            ? Border.all(color: activeBg.withOpacity(0.4), width: 1)
            : null,
      ),
      child: ListTile(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        leading: Icon(
          icon,
          color: isActive ? Colors.white : Colors.white.withOpacity(0.55),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontFamily: 'Kanit',
            color: isActive ? Colors.white : Colors.white.withOpacity(0.55),
            fontSize: 14.5,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
        onTap: () {
          Navigator.pop(context); // Cerrar Drawer
          if (!isActive) {
            Navigator.pushReplacementNamed(context, route);
          }
        },
      ),
    );
  }

  void _showLogoutConfirmationDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: Colors.white.withOpacity(0.09), width: 1),
        ),
        title: const Text(
          'Cerrar sesión',
          style: TextStyle(
            fontFamily: 'Kanit',
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        content: const Text(
          '¿Estás seguro de que deseas cerrar sesión?',
          style: TextStyle(
            fontFamily: 'Kanit',
            color: Color(0xFF94A3B8),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text(
              'Cancelar',
              style: TextStyle(
                fontFamily: 'Kanit',
                color: Color(0xFF94A3B8),
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              final auth = Provider.of<AuthProvider>(context, listen: false);
              Navigator.pop(ctx); // Close dialog
              await auth.logout();
              if (context.mounted) {
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF5050),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            child: const Text(
              'Cerrar sesión',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
