import 'package:flutter/material.dart';
import 'package:foamwash/Features/Comun/service_model.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Services/controllers/scheduling_controller.dart';

// Componente visual reutilizable para la presentacion de servicios.
// Integra condicionales de acceso basados en el rol (Guest vs Autenticado).
// Modula el acceso a metodos POST del SchedulingController dependiendo del estado de la sesion.
class ServiceCard extends StatefulWidget {
  final ServiceModel service;
  final bool isGuest;
  final SchedulingController? controller;

  const ServiceCard({
    Key? key,
    required this.service,
    this.isGuest = false,
    this.controller,
  }) : super(key: key);

  @override
  State<ServiceCard> createState() => _ServiceCardState();
}

class _ServiceCardState extends State<ServiceCard> {
  bool isLoading = false;

  void _handleSolicitar() async {
    if (widget.isGuest) {
      // Mostrar dialogo de advertencia para usuarios sin sesion.
      showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: const Text('Accion requerida'),
            content: const Text('Debes iniciar sesion para agendar un servicio.'),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Cierra el dialogo modal
                  Navigator.pushNamed(context, '/register');
                },
                child: const Text('Registrarse'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  Navigator.pop(context); // Cierra el dialogo modal
                  Navigator.pushNamed(context, '/login');
                },
                child: const Text('Iniciar Sesion'),
              ),
            ],
          );
        },
      );
    } else {
      // Procesa la solicitud HTTP POST hacia el Backend (usuario autenticado).
      if (widget.controller == null) return;

      setState(() => isLoading = true);
      try {
        await widget.controller!.requestService(widget.service.idServicio.toString());
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Solicitud enviada exitosamente'),
              backgroundColor: AppTheme.primaryBlue,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Error al procesar la solicitud'),
              backgroundColor: Colors.redAccent,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() => isLoading = false);
        }
      }
    }
  }

  Widget _buildImagePlaceholder() {
    return Container(
      height: 180,
      color: Colors.grey[200],
      child: const Icon(Icons.cleaning_services, size: 50, color: Colors.grey),
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = widget.service.imagenUrl ?? '';
    final hasNetworkImage = imageUrl.startsWith('http');

    return Card(
      elevation: 3,
      shadowColor: Colors.black12,
      margin: const EdgeInsets.only(bottom: 24),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      color: AppTheme.cardWhite,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Imagen del servicio
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            child: hasNetworkImage
                ? Image.network(
                    imageUrl,
                    height: 180,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(),
                  )
                : Image.asset(
                    'assets/fondo.png',
                    height: 180,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => _buildImagePlaceholder(),
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                Text(
                  widget.service.nombreServicio,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.darkText,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                Text(
                  widget.service.descripcion,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppTheme.greyText,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.star, color: Colors.amber, size: 16),
                    const SizedBox(width: 4),
                    const Text(
                      '4.8 (1.2k)',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.darkText,
                      ),
                    ),
                    const Spacer(),
                    _buildTag('Eco', AppTheme.tagEcoGreen),
                    const SizedBox(width: 8),
                    _buildTag('Garantía', AppTheme.tagGuaranteeBlue),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(bottom: 4.0),
                      child: Text(
                        'DESDE ',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.greyText,
                        ),
                      ),
                    ),
                    Text(
                      '\$${widget.service.precio}',
                      style: const TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primaryBlue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton.icon(
                    onPressed: isLoading ? null : _handleSolicitar,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryBlue,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: AppTheme.primaryBlue.withOpacity(0.6),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 0,
                    ),
                    icon: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Icon(Icons.shopping_cart_outlined, size: 20),
                    label: Text(
                      isLoading ? 'Procesando...' : 'Solicitar',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
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
