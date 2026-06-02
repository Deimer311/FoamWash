import 'package:flutter/material.dart';
import 'package:foamwash/Features/Services/data/models/service_model.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Services/controllers/scheduling_controller.dart';

// Componente visual reutilizable para la presentacion de servicios.
// Rediseñado para replicar el estilo premium del sistema web:
// imagen superior, badges flotantes, tipografia Kanit, gradiente azul→morado,
// chips de tamaño, jerarquía visual y efectos de elevacion.
// Integra condicionales de acceso basados en el rol (Guest vs Autenticado).
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

class _ServiceCardState extends State<ServiceCard>
    with SingleTickerProviderStateMixin {
  bool isLoading = false;
  bool _isPressed = false;
  late AnimationController _animController;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    // Animacion de escala suave al tocar la card (hover-like effect)
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );
    _scaleAnim = Tween<double>(begin: 1.0, end: 0.975).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  void _handleSolicitar() async {
    if (widget.isGuest) {
      // Mostrar dialogo de advertencia para usuarios sin sesion.
      showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: const Text(
              'Acción requerida',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontWeight: FontWeight.w700,
                fontSize: 18,
                color: AppTheme.darkText,
              ),
            ),
            content: const Text(
              'Debes iniciar sesión para agendar un servicio.',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontWeight: FontWeight.w400,
                color: AppTheme.subtitleText,
              ),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/register');
                },
                child: const Text(
                  'Registrarse',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    color: AppTheme.subtitleText,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Container(
                decoration: BoxDecoration(
                  gradient: AppTheme.buttonGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/login');
                  },
                  child: const Text(
                    'Iniciar Sesión',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
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
        await widget.controller!
            .requestService(widget.service.idServicio.toString());
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                'Solicitud enviada exitosamente',
                style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.w500),
              ),
              backgroundColor: AppTheme.primaryBlue,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                'Error al procesar la solicitud',
                style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.w500),
              ),
              backgroundColor: Colors.redAccent,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      } finally {
        if (mounted) setState(() => isLoading = false);
      }
    }
  }

  // ─── Badge flotante sobre la imagen (Eco / Garantía) ──────────────────────
  Widget _buildFloatingBadge({
    required String text,
    required Color textColor,
    required Color bgColor,
    required Color borderColor,
    IconData? icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppTheme.radiusBadge),
        border: Border.all(color: borderColor.withOpacity(0.3), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: textColor),
            const SizedBox(width: 3),
          ],
          Text(
            text,
            style: AppTheme.badgeText.copyWith(color: textColor),
          ),
        ],
      ),
    );
  }

  // ─── Chip de tamaño disponible ─────────────────────────────────────────────
  Widget _buildSizeChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: AppTheme.chipBg,
        borderRadius: BorderRadius.circular(AppTheme.radiusChip),
        border: Border.all(color: AppTheme.chipBorder, width: 1),
      ),
      child: Text(label, style: AppTheme.chipLabel),
    );
  }

  // ─── Imagen superior con overlay de gradiente y badges flotantes ───────────
  Widget _buildImageSection() {
    final imageUrl = widget.service.imagenUrl ?? '';
    final hasNetworkImage = imageUrl.startsWith('http');

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(
        top: Radius.circular(AppTheme.radiusCard),
      ),
      child: Stack(
        children: [
          // Imagen principal
          SizedBox(
            height: 190,
            width: double.infinity,
            child: hasNetworkImage
                ? Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _buildImageFallback(),
                  )
                : Image.asset(
                    'assets/fondo.png',
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _buildImageFallback(),
                  ),
          ),

          // Gradiente sutil en la parte inferior de la imagen
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 60,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.12),
                  ],
                ),
              ),
            ),
          ),

          // Badges flotantes en la esquina superior izquierda
          Positioned(
            top: 12,
            left: 12,
            child: Row(
              children: [
                _buildFloatingBadge(
                  text: 'Eco',
                  textColor: AppTheme.tagEcoGreen,
                  bgColor: AppTheme.tagEcoBg,
                  borderColor: AppTheme.tagEcoGreen,
                  icon: Icons.eco_outlined,
                ),
                const SizedBox(width: 6),
                _buildFloatingBadge(
                  text: 'Garantía',
                  textColor: AppTheme.tagGuaranteeBlue,
                  bgColor: Colors.white,
                  borderColor: AppTheme.tagGuaranteeBlue,
                  icon: Icons.verified_outlined,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageFallback() {
    return Container(
      height: 190,
      color: const Color(0xFFEEF2FF),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cleaning_services_outlined,
                size: 48, color: AppTheme.primaryBlue.withOpacity(0.4)),
            const SizedBox(height: 8),
            Text(
              'FoamWash',
              style: TextStyle(
                fontFamily: 'Kanit',
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppTheme.primaryBlue.withOpacity(0.5),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Sección de nombre y descripción ──────────────────────────────────────
  Widget _buildInfoSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.service.nombreServicio,
          style: AppTheme.serviceName,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 6),
        Text(
          widget.service.descripcion,
          style: AppTheme.serviceDescription,
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
        ),
      ],
    );
  }

  // ─── Fila de rating + badges inline ───────────────────────────────────────
  Widget _buildRatingRow() {
    return Row(
      children: [
        // Estrella y rating
        Icon(Icons.star_rounded, color: AppTheme.starYellow, size: 17),
        const SizedBox(width: 4),
        Text('4.8', style: AppTheme.ratingText),
        const SizedBox(width: 3),
        Text('(4.8k)', style: AppTheme.ratingCount),

        const Spacer(),

        // Tags inline (versión compacta, sin bordes)
        _buildInlineTag('Eco', AppTheme.tagEcoGreen, AppTheme.tagEcoBg),
        const SizedBox(width: 6),
        _buildInlineTag('Garantía', AppTheme.tagGuaranteeBlue,
            AppTheme.tagGuaranteeBg),
      ],
    );
  }

  Widget _buildInlineTag(String text, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(AppTheme.radiusBadge),
      ),
      child: Text(
        text,
        style: AppTheme.badgeText.copyWith(color: textColor),
      ),
    );
  }

  // ─── Sección de precio ─────────────────────────────────────────────────────
  Widget _buildPriceSection() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 5.0),
          child: Text('DESDE', style: AppTheme.priceLabel),
        ),
        const SizedBox(width: 8),
        Text(
          '\$${widget.service.precio}',
          style: AppTheme.priceValue,
        ),
      ],
    );
  }

  // ─── Botón con degradado azul → morado ────────────────────────────────────
  Widget _buildGradientButton() {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        _handleSolicitar();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedScale(
        scale: _isPressed ? 0.97 : 1.0,
        duration: const Duration(milliseconds: 120),
        child: Container(
          height: 52,
          width: double.infinity,
          decoration: BoxDecoration(
            gradient: isLoading
                ? LinearGradient(
                    colors: [
                      AppTheme.primaryBlue.withOpacity(0.6),
                      AppTheme.gradientPurple.withOpacity(0.6),
                    ],
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                  )
                : AppTheme.buttonGradient,
            borderRadius: BorderRadius.circular(AppTheme.radiusButton),
            boxShadow: isLoading ? [] : AppTheme.buttonShadow,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isLoading)
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              else
                const Icon(
                  Icons.shopping_cart_outlined,
                  color: Colors.white,
                  size: 20,
                ),
              const SizedBox(width: 8),
              Text(
                isLoading ? 'Procesando...' : 'Solicitar',
                style: AppTheme.buttonLabel,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ─── Chips de tamaños disponibles ─────────────────────────────────────────
  Widget _buildSizesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Divider(color: AppTheme.dividerColor, thickness: 1, height: 1),
        const SizedBox(height: 14),
        Text('TAMAÑOS DISPONIBLES', style: AppTheme.sectionLabel),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: const [
            // Chips estáticos de referencia (igual al web)
            _SizeChipStatic('Estándar'),
            _SizeChipStatic('Grande'),
            _SizeChipStatic('XL'),
          ],
        ),
      ],
    );
  }

  // ─── Build principal ───────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scaleAnim,
      child: Container(
        margin: const EdgeInsets.only(bottom: 24),
        decoration: BoxDecoration(
          color: AppTheme.cardWhite,
          borderRadius: BorderRadius.circular(AppTheme.radiusCard),
          boxShadow: AppTheme.cardShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Imagen con badges flotantes
            _buildImageSection(),

            // 2. Contenido de la card
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Nombre + descripción
                  _buildInfoSection(),

                  const SizedBox(height: 14),

                  // Rating + tags inline
                  _buildRatingRow(),

                  const SizedBox(height: 18),

                  // Separador sutil
                  Divider(
                      color: AppTheme.dividerColor, thickness: 1, height: 1),

                  const SizedBox(height: 16),

                  // Precio
                  _buildPriceSection(),

                  const SizedBox(height: 14),

                  // Botón degradado
                  _buildGradientButton(),

                  const SizedBox(height: 18),

                  // Tamaños disponibles
                  _buildSizesSection(),

                  const SizedBox(height: 18),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Chip estático de tamaño (sin estado).
class _SizeChipStatic extends StatelessWidget {
  final String label;
  const _SizeChipStatic(this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: AppTheme.chipBg,
        borderRadius: BorderRadius.circular(AppTheme.radiusChip),
        border: Border.all(color: AppTheme.chipBorder, width: 1),
      ),
      child: Text(label, style: AppTheme.chipLabel),
    );
  }
}
