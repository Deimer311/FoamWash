import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';

class TrabajadorHeader extends StatelessWidget implements PreferredSizeWidget {
  final String activeTab; // 'agenda' o 'perfil'
  final bool scrolled;
  final VoidCallback? onGoAgenda;
  final VoidCallback? onGoPerfil;
  final VoidCallback? onLogout;

  const TrabajadorHeader({
    super.key,
    required this.activeTab,
    this.scrolled = false,
    this.onGoAgenda,
    this.onGoPerfil,
    this.onLogout,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

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

    final width = MediaQuery.of(context).size.width;
    final isWide = width >= 800;

    // Colores del header web
    final headerBg = scrolled
        ? const Color(0xFF060919).withOpacity(0.97)
        : const Color(0xFF080C1E).withOpacity(0.92);

    final borderBottomColor = scrolled
        ? const Color(0xFFFFFFFF).withOpacity(0.09)
        : const Color(0xFFFFFFFF).withOpacity(0.06);

    return AppBar(
      automaticallyImplyLeading: false,
      backgroundColor: headerBg,
      elevation: 0,
      toolbarHeight: 64.0,
      titleSpacing: 0,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.0),
        child: Container(
          color: borderBottomColor,
          height: 1.0,
        ),
      ),
      title: Padding(
        padding: EdgeInsets.symmetric(horizontal: isWide ? 40 : 20),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // ── LADO IZQUIERDO: MENU Y LOGO (MÓVIL / ESCRITORIO) ──
            Row(
              children: [
                if (!isWide) ...[
                  Builder(
                    builder: (context) => IconButton(
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
                  ),
                  const SizedBox(width: 12),
                ],
                GestureDetector(
                  onTap: onGoAgenda,
                  child: MouseRegion(
                    cursor: SystemMouseCursors.click,
                    child: Row(
                      children: [
                        Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(8),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF0066FF).withOpacity(0.35),
                                blurRadius: 10,
                                offset: const Offset(0, 2),
                              )
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset(
                              'assets/LogoFW.jpeg',
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Center(
                                child: Text(
                                  'FW',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
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
                        const SizedBox(width: 2),
                        const Text(
                          'EM',
                          style: TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 9,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF28A745),
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            // ── LADO DERECHO: NAV & AVATAR (Wide Screen vs Mobile) ──
            if (isWide) ...[
              Row(
                children: [
                  _buildNavButton(
                    label: 'Agenda',
                    icon: Icons.calendar_today_rounded,
                    isActive: activeTab == 'agenda',
                    onTap: onGoAgenda,
                  ),
                  const SizedBox(width: 16),
                  _buildAvatarDropdown(
                    fotoUrl: fotoUrl,
                    initials: initials,
                    userName: userName,
                    userEmail: userEmail,
                    context: context,
                  ),
                ],
              ),
            ] else ...[
              GestureDetector(
                onTap: onGoPerfil,
                child: _buildAvatarCircle(fotoUrl, initials, size: 30),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildNavButton({
    required String label,
    required IconData icon,
    required bool isActive,
    VoidCallback? onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(7),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: isActive
                ? const Color(0xFF0066FF).withOpacity(0.18)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.center,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    icon,
                    size: 13,
                    color: isActive
                        ? Colors.white
                        : Colors.white.withOpacity(0.55),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 13.5,
                      fontWeight: FontWeight.w500,
                      color: isActive
                          ? Colors.white
                          : Colors.white.withOpacity(0.55),
                    ),
                  ),
                ],
              ),
              if (isActive)
                Positioned(
                  bottom: -8,
                  child: Container(
                    width: 18,
                    height: 2,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0099FF),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatarCircle(String? fotoUrl, String initials, {double size = 30}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0066FF).withOpacity(0.35),
            blurRadius: 8,
            offset: const Offset(0, 2),
          )
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(size / 2),
        child: fotoUrl != null
            ? Image.network(
                fotoUrl,
                fit: BoxFit.cover,
                headers: const {'ngrok-skip-browser-warning': 'true'},
                errorBuilder: (_, __, ___) => Center(
                  child: Text(
                    initials,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: size * 0.36,
                      fontWeight: FontWeight.w700,
                      fontFamily: 'Kanit',
                    ),
                  ),
                ),
              )
            : Center(
                child: Text(
                  initials,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: size * 0.36,
                    fontWeight: FontWeight.w700,
                    fontFamily: 'Kanit',
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildAvatarDropdown({
    required String? fotoUrl,
    required String initials,
    required String userName,
    required String userEmail,
    required BuildContext context,
  }) {
    return Theme(
      data: Theme.of(context).copyWith(
        cardColor: const Color(0xFF0A0E26), // Fondo oscuro dropdown
      ),
      child: PopupMenuButton<int>(
        offset: const Offset(0, 48),
        elevation: 16,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
          side: BorderSide(
            color: Colors.white.withOpacity(0.09),
            width: 1,
          ),
        ),
        child: MouseRegion(
          cursor: SystemMouseCursors.click,
          child: Container(
            padding: const EdgeInsets.fromLTRB(4, 4, 10, 4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.06),
              border: Border.all(
                color: Colors.white.withOpacity(0.1),
                width: 1,
              ),
              borderRadius: BorderRadius.circular(50),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildAvatarCircle(fotoUrl, initials, size: 30),
                const SizedBox(width: 8),
                Icon(
                  Icons.person_outline,
                  size: 14,
                  color: Colors.white.withOpacity(0.6),
                ),
              ],
            ),
          ),
        ),
        onSelected: (val) {
          if (val == 1) {
            onGoPerfil?.call();
          } else if (val == 2) {
            onLogout?.call();
          }
        },
        itemBuilder: (context) => [
          // Header con info de usuario
          PopupMenuItem<int>(
            enabled: false,
            child: Container(
              width: 220,
              padding: const EdgeInsets.symmetric(vertical: 8),
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
                  const SizedBox(height: 2),
                  Text(
                    userEmail,
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.4),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Divider(
                    color: Colors.white.withOpacity(0.07),
                    height: 1,
                  ),
                ],
              ),
            ),
          ),
          // Mi perfil
          PopupMenuItem<int>(
            value: 1,
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0066FF).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(7),
                  ),
                  child: const Icon(
                    Icons.person_rounded,
                    size: 14,
                    color: Color(0xFF0099FF),
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'Mi perfil',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          // Cerrar sesión
          PopupMenuItem<int>(
            value: 2,
            child: Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF5050).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(7),
                  ),
                  child: const Icon(
                    Icons.logout_rounded,
                    size: 14,
                    color: Color(0xFFFF5050),
                  ),
                ),
                const SizedBox(width: 10),
                const Text(
                  'Cerrar sesión',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: Color(0xFFFF5050),
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
