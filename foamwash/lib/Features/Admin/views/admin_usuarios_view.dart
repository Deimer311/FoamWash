import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/usuarios_provider.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/add_usuario_dialog.dart';
import '../widgets/edit_usuario_dialog.dart';
import 'package:foamwash/core/utils/security_utils.dart';

class AdminUsuariosView extends StatefulWidget {
  const AdminUsuariosView({super.key});

  @override
  State<AdminUsuariosView> createState() => _AdminUsuariosViewState();
}

class _AdminUsuariosViewState extends State<AdminUsuariosView> {
  @override
  void initState() {
    super.initState();
    SecurityUtils.secureScreen();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<UsuariosProvider>().fetchUsuarios();
    });
  }

  @override
  void dispose() {
    SecurityUtils.clearSecureScreen();
    super.dispose();
  }

  void _mostrarDialogoAgregar() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AddUsuarioDialog(),
    );
  }

  void _confirmarEliminar(dynamic user) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: Text('¿Estás seguro de que deseas eliminar a ${user['Nombre']}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () {
              context.read<UsuariosProvider>().deleteUsuario(user['Id_Usuario']);
              Navigator.pop(context);
            },
            child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _mostrarDialogoEditar(dynamic user) {
    showDialog(
      context: context,
      builder: (context) => EditUsuarioDialog(usuario: user),
    );
  }

  @override
  Widget build(BuildContext context) {
    const Color primaryDark = Color(0xFF15192C);
    const Color primaryBlue = Color(0xFF007BFF);

    return Scaffold(
      backgroundColor: Colors.white,
      endDrawer: const AdminDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: primaryDark,
        elevation: 0,
        title: RichText(
          text: const TextSpan(
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
            children: [
              TextSpan(text: 'FoamWash', style: TextStyle(color: Colors.white)),
              TextSpan(text: ' AD', style: TextStyle(color: Colors.blue, fontSize: 16)),
            ],
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          Builder(
            builder: (context) => IconButton(
              icon: const Icon(Icons.menu, size: 30),
              onPressed: () => Scaffold.of(context).openEndDrawer(),
            ),
          ),
          const SizedBox(width: 8),
          const CircleAvatar(
            radius: 16,
            backgroundColor: Color(0xFFD9D9D9),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Consumer<UsuariosProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              const SizedBox(height: 30),
              const Text(
                'Usuarios',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: primaryDark,
                ),
              ),
              const Text(
                'Gestiona las cuentas registradas',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.blueGrey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _mostrarDialogoAgregar,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                icon: const Icon(Icons.add, size: 18),
                label: const Text(
                  'Agregar Usuario',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
              const SizedBox(height: 30),
              Expanded(
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : provider.error != null
                        ? Center(child: Text(provider.error!))
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: provider.usuarios.length,
                            itemBuilder: (context, index) {
                              final user = provider.usuarios[index];
                              return _buildUserCard(user, index + 1);
                            },
                          ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildUserCard(dynamic user, int index) {
    const Color primaryBlue = Color(0xFF007BFF);

    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: primaryBlue,
            radius: 18,
            child: Text(
              '$index',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      '#${user['Id_Usuario'] ?? index}',
                      style: const TextStyle(fontSize: 10, color: Colors.grey),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        user['Nombre'] ?? 'Sin nombre',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1A56FF),
                        ),
                        overflow: TextOverflow.ellipsis,
                        maxLines: 1,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Text(
                      user['Telefono'] ?? 'Sin tel',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                Text(
                  user['Correo'] ?? '',
                  style: const TextStyle(fontSize: 10, color: Colors.blueGrey),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit_note, color: Colors.blueAccent),
            onPressed: () => _mostrarDialogoEditar(user),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
            onPressed: () => _confirmarEliminar(user),
          ),
        ],
      ),
    );
  }
}