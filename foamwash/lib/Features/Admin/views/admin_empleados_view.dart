import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/empleados_provider.dart';
import '../widgets/empleado_flip_card.dart';
import '../widgets/add_empleado_dialog.dart';
import '../widgets/admin_drawer.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';

class AdminEmpleadosView extends StatefulWidget {
  const AdminEmpleadosView({super.key});

  @override
  State<AdminEmpleadosView> createState() => _AdminEmpleadosViewState();
}

class _AdminEmpleadosViewState extends State<AdminEmpleadosView> {
  @override
  void initState() {
    super.initState();
    SecurityUtils.secureScreen();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<EmpleadosProvider>().fetchEmpleados();
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
      builder: (context) => const AddEmpleadoDialog(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      endDrawer: AdminDrawer(),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: const Color(0xFF15192C),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(builder: (_) => const AdminDashboardView()),
            (route) => false,
          ),
        ),
        title: RichText(
          text: const TextSpan(
            children: [
              TextSpan(
                text: 'FoamWash',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                  color: Colors.white,
                ),
              ),
              TextSpan(
                text: 'AD',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                  color: Colors.blue,
                ),
              ),
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
            backgroundColor: Colors.grey,
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Consumer<EmpleadosProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              const SizedBox(height: 24),
              const Text(
                'Empleados',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF15192C),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                '${provider.empleadosActivosCount} colaborador activo · Haz clic en la tarjeta para girarla',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _mostrarDialogoAgregar,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1A56FF),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                icon: const Icon(Icons.add, size: 16),
                label: const Text(
                  'Agregar Empleado',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : provider.error != null
                        ? Center(child: Text(provider.error!, style: const TextStyle(color: Colors.red)))
                        : GridView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.65,
                              crossAxisSpacing: 20,
                              mainAxisSpacing: 20,
                            ),
                            itemCount: provider.empleados.length,
                            itemBuilder: (context, index) {
                              final empleado = provider.empleados[index];
                              return EmpleadoFlipCard(empleado: empleado);
                            },
                          ),
              ),
            ],
          );
        },
      ),
    );
  }
}