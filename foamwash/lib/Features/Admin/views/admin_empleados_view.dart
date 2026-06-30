import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/empleados_provider.dart';
import '../widgets/empleado_flip_card.dart';
import '../widgets/add_empleado_dialog.dart';
import '../widgets/admin_drawer.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/Features/Admin/views/admin_dashboard_view.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';

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

  void _confirmarEliminar(int id, String nombre) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: Text('¿Estás seguro de que deseas eliminar al empleado "$nombre"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final provider = context.read<EmpleadosProvider>();
              final success = await provider.eliminarEmpleado(id);
              if (mounted) {
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Empleado eliminado'), backgroundColor: Colors.green),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(provider.error ?? 'Error al eliminar'), backgroundColor: Colors.red),
                  );
                }
              }
            },
            child: const Text('Eliminar', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _mostrarDialogoEditar(dynamic empleado) {
    final nombreController = TextEditingController(text: empleado.nombre);
    final telefonoController = TextEditingController(text: empleado.telefono ?? '');
    final formKey = GlobalKey<FormState>();
    bool isSaving = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setStateDialog) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Editar Empleado', style: TextStyle(fontWeight: FontWeight.bold)),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nombreController,
                  decoration: const InputDecoration(labelText: 'Nombre Completo', prefixIcon: Icon(Icons.person)),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: telefonoController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Teléfono', prefixIcon: Icon(Icons.phone)),
                  validator: (v) => v == null || v.isEmpty ? 'Requerido' : null,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSaving ? null : () => Navigator.pop(ctx),
              child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A56FF), foregroundColor: Colors.white),
              onPressed: isSaving ? null : () async {
                if (formKey.currentState!.validate()) {
                  setStateDialog(() => isSaving = true);
                  final provider = context.read<EmpleadosProvider>();
                  final success = await provider.editarEmpleado(
                    id: empleado.id,
                    nombre: nombreController.text.trim(),
                    telefono: telefonoController.text.trim(),
                  );
                  if (mounted) {
                    if (ctx.mounted) Navigator.pop(ctx);
                    if (context.mounted) {
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Empleado actualizado'), backgroundColor: Colors.green));
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(provider.error ?? 'Error al editar'), backgroundColor: Colors.red));
                      }
                    }
                  }
                }
              },
              child: isSaving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Text('Guardar'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final userFoto = auth.user?.fotoPerfil;

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
              TextSpan(text: 'FoamWash', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 20, color: Colors.white)),
              TextSpan(text: 'AD', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.blue)),
            ],
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          Builder(
            builder: (context) => IconButton(icon: const Icon(Icons.menu, size: 30), onPressed: () => Scaffold.of(context).openEndDrawer()),
          ),
          const SizedBox(width: 8),
          CircleAvatar(
            backgroundColor: const Color(0xFFD9D9D9),
            radius: 16,
            backgroundImage: userFoto != null && userFoto.isNotEmpty
                ? NetworkImage(userFoto.startsWith('http')
                    ? userFoto
                    : '${ApiConstants.baseUrl.replaceAll('/api', '')}$userFoto')
                : null,
            child: (userFoto == null || userFoto.isEmpty)
                ? const Icon(Icons.person, color: Colors.white, size: 24)
                : null,
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: Consumer<EmpleadosProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              const SizedBox(height: 24),
              const Text('Empleados', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF15192C))),
              const SizedBox(height: 4),
              Text('${provider.empleadosActivosCount} colaborador activo · Haz clic en la tarjeta para girarla', style: const TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _mostrarDialogoAgregar,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1A56FF),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                icon: const Icon(Icons.add, size: 16),
                label: const Text('Agregar Empleado', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : provider.error != null
                        ? Center(child: Text(provider.error!, style: const TextStyle(color: Colors.red)))
                        : ListView.separated(
                            padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                            itemCount: provider.empleados.length,
                            separatorBuilder: (context, index) => const SizedBox(height: 24),
                            itemBuilder: (context, index) {
                              final empleado = provider.empleados[index];
                              return SizedBox(
                                height: 260,
                                child: EmpleadoFlipCard(
                                  empleado: empleado,
                                  onEdit: () => _mostrarDialogoEditar(empleado),
                                  onDelete: () => _confirmarEliminar(empleado.id, empleado.nombre),
                                ),
                              );
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