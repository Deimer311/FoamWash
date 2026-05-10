import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/auth_login/providers/auth_provider.dart';

class AdminDrawer extends StatelessWidget {
  const AdminDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    const Color primaryDark = Color(0xFF15192C);
    const Color primaryBlue = Color(0xFF1A56FF);

    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
          // Header del Drawer (Inspirado en la imagen del usuario)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(top: 60, bottom: 30, left: 20),
            decoration: const BoxDecoration(
              color: primaryDark,
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  backgroundColor: Colors.white,
                  radius: 30,
                  child: Icon(Icons.person, color: primaryDark, size: 40),
                ),
                SizedBox(height: 15),
                Text(
                  'Administrador',
                  style: TextStyle(
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
