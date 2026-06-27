import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:foamwash/Features/Services/data/models/service_model.dart';
import '../widgets/admin_drawer.dart';
import '../widgets/add_servicio_dialog.dart';
import '../widgets/edit_servicio_dialog.dart';
import 'package:foamwash/core/utils/security_utils.dart';
import 'package:foamwash/Api/api_constants.dart';

class AdminServiciosView extends StatefulWidget {
  const AdminServiciosView({super.key});

  @override
  State<AdminServiciosView> createState() => _AdminServiciosViewState();
}

class _AdminServiciosViewState extends State<AdminServiciosView> {
  @override
  void initState() {
    super.initState();
    SecurityUtils.secureScreen();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ServicesProvider>().fetchServices();
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
      builder: (context) => const AddServicioDialog(),
    );
  }

  void _confirmarEliminar(ServiceModel servicio) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: Text('¿Estás seguro de que deseas eliminar el servicio "${servicio.nombreServicio}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () async {
              final servicesProvider = context.read<ServicesProvider>();
              final scaffoldMessenger = ScaffoldMessenger.of(context);
              final navigator = Navigator.of(context);
              
              final success = await servicesProvider.deleteService(servicio.idServicio);
              
              if (mounted) {
                navigator.pop();
                if (success) {
                  scaffoldMessenger.showSnackBar(
                    const SnackBar(content: Text('Servicio eliminado exitosamente'), backgroundColor: Colors.green),
                  );
                } else {
                  scaffoldMessenger.showSnackBar(
                    const SnackBar(content: Text('Error al eliminar servicio'), backgroundColor: Colors.red),
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

  void _mostrarDialogoEditar(ServiceModel servicio) {
    showDialog(
      context: context,
      builder: (context) => EditServicioDialog(servicio: servicio),
    );
  }

  String _formatearPrecio(String precioStr) {
    try {
      final double valor = double.parse(precioStr);
      // Formatea a entero si no tiene decimales significativos
      if (valor == valor.toInt()) {
        final String revStr = valor.toInt().toString().split('').reversed.join('');
        final List<String> segments = [];
        for (int i = 0; i < revStr.length; i += 3) {
          int end = i + 3;
          if (end > revStr.length) end = revStr.length;
          segments.add(revStr.substring(i, end));
        }
        return segments.join('.').split('').reversed.join('');
      }
      return precioStr;
    } catch (e) {
      return precioStr;
    }
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
      body: Consumer<ServicesProvider>(
        builder: (context, provider, child) {
          return Column(
            children: [
              const SizedBox(height: 30),
              const Text(
                'Servicios',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.w900,
                  color: primaryDark,
                ),
              ),
              const Text(
                'Gestiona el catálogo de servicios',
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
                  'Agregar Servicio',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
              const SizedBox(height: 30),
              Expanded(
                child: provider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : provider.error != null
                        ? Center(child: Text(provider.error!))
                        : provider.services.isEmpty
                            ? const Center(child: Text('No hay servicios registrados.'))
                            : ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemCount: provider.services.length,
                                itemBuilder: (context, index) {
                                  final servicio = provider.services[index];
                                  return _buildServiceCard(servicio);
                                },
                              ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildServiceCard(ServiceModel servicio) {

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Imagen superior con bordes redondeados arriba
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(25)),
            child: SizedBox(
              height: 190,
              width: double.infinity,
              child: Builder(builder: (context) {
                final raw = servicio.imagenUrl ?? '';
                String imageUrl = raw;
                if (raw.isNotEmpty && !raw.startsWith('http')) {
                  final base = ApiConstants.baseUrl.endsWith('/api')
                      ? ApiConstants.baseUrl.substring(0, ApiConstants.baseUrl.length - 4)
                      : ApiConstants.baseUrl;
                  imageUrl = '$base$raw';
                }
                if (imageUrl.startsWith('http')) {
                  return Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                  );
                }
                return Image.asset(
                  'assets/fondo.png',
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _buildImagePlaceholder(),
                );
              }),
            ),
          ),
          // Contenido de texto y botones
          Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        servicio.nombreServicio,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF15192C),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '\$${_formatearPrecio(servicio.precio)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF007BFF),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Row(
                  children: [
                    // Botón Editar
                    GestureDetector(
                      onTap: () => _mostrarDialogoEditar(servicio),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F0FE),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFD2E3FC), width: 1),
                        ),
                        child: const Icon(Icons.edit_outlined, color: Color(0xFF1A73E8), size: 22),
                      ),
                    ),
                    const SizedBox(width: 10),
                    // Botón Eliminar
                    GestureDetector(
                      onTap: () => _confirmarEliminar(servicio),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFCE8E6),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFFAD2CF), width: 1),
                        ),
                        child: const Icon(Icons.delete_outline_outlined, color: Color(0xFFD93025), size: 22),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      color: const Color(0xFFEEF2FF),
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cleaning_services_outlined, size: 48, color: Colors.blueAccent),
            SizedBox(height: 8),
            Text(
              'FoamWash',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.blueAccent,
              ),
            ),
          ],
        ),
      ),
    );
  }
}