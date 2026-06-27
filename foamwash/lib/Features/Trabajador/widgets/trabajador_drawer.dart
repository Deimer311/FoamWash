import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

class TrabajadorDrawer extends StatelessWidget {
  const TrabajadorDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    const Color primaryDark = Color(0xFF15192C);
    const Color primaryBlue = Color(0xFF1A56FF);

    return Drawer(
      backgroundColor: Colors.white,
      child: Column(
        children: [
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
                  'Trabajador',
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
          _buildItem(
            context,
            icon: Icons.calendar_month,
            title: 'Agenda',
            route: '/agenda_trabajador', // Ruta supuesta, validar después
          ),
          _buildItem(
            context,
            icon: Icons.person,
            title: 'Perfil',
            route: '/perfilTrabajador',
          ),
          const Spacer(),
          const Divider(height: 1, color: Color(0xFFE2E8F0)),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text(
              'Cerrar sesión',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
            ),
            onTap: () async {
              final auth = Provider.of<AuthProvider>(context, listen: false);
              await auth.logout();
              Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildItem(BuildContext context, {required IconData icon, required String title, required String route}) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF1A2540)),
      title: Text(
        title,
        style: const TextStyle(
          color: Color(0xFF1A2540),
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      onTap: () {
        Navigator.pop(context);
        Navigator.pushReplacementNamed(context, route);
      },
    );
  }
}
