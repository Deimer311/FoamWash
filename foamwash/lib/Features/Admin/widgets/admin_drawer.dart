import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';

class AdminDrawer extends StatelessWidget {
  const AdminDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    const Color primaryDark = Color(0xFF15192C);
    const Color primaryBlue = Color(0xFF1A56FF);

    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;
    final userName = user?.nombre ?? 'Administrador';
    final userFoto = user?.fotoPerfil;

    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          // Header del Drawer
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 60, bottom: 30, left: 20),
            decoration: const BoxDecoration(
              color: primaryDark,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: Colors.white,
                  radius: 30,
                  backgroundImage: userFoto != null && userFoto.isNotEmpty
                      ? NetworkImage(userFoto.startsWith('http') 
                          ? userFoto 
                          : '${ApiConstants.baseUrl.replaceAll('/api', '')}$userFoto')
                      : null,
                  child: (userFoto == null || userFoto.isEmpty)
                      ? const Icon(Icons.person, color: primaryDark, size: 40)
                      : null,
                ),
                const SizedBox(height: 15),
                Text(
                  userName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),
          // Opciones del Menú
          _buildItem(
            context,
            icon: Icons.calendar_month,
            title: 'Agenda',
            route: '/admin_agenda',
          ),
          _buildItem(
            context,
            icon: Icons.people_alt_outlined,
            title: 'Empleados',
            route: '/admin_empleados',
          ),
          _buildItem(
            context,
            icon: Icons.manage_accounts_outlined,
            title: 'Usuarios',
            route: '/admin_usuarios',
          ),
          _buildItem(
            context,
            icon: Icons.cleaning_services_outlined,
            title: 'Servicios',
            route: '/admin_servicios',
          ),
          _buildItem(
            context,
            icon: Icons.analytics_outlined,
            title: 'Reportes',
            route: '/admin_reportes',
          ),
          _buildItem(
            context,
            icon: Icons.person_outline,
            title: 'Perfil',
            route: '/perfilAdmin',
          ),
          const Spacer(),
          const Divider(height: 1),
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 25, vertical: 5),
            leading: const Icon(Icons.logout, color: Colors.redAccent, size: 28),
            title: const Text(
              'Cerrar sesión',
              style: TextStyle(
                color: Colors.redAccent,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            onTap: () async {
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
              }
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildItem(BuildContext context, {required IconData icon, required String title, required String route}) {
    final bool isSelected = ModalRoute.of(context)?.settings.name == route;
    const Color primaryBlue = Color(0xFF1A56FF);

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 25, vertical: 5),
      leading: Icon(icon, color: primaryBlue, size: 28),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.black87,
        ),
      ),
      onTap: () {
        Navigator.pop(context);
        if (!isSelected) {
          Navigator.pushReplacementNamed(context, route);
        }
      },
    );
  }
}
