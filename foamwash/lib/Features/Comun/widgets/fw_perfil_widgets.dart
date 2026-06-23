// =============================================================================
// ARCHIVO  : fw_perfil_widgets.dart
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Piezas de diseño compartidas entre PerfilCliente, PerfilTrabajador
//            y PerfilAdmin (mismo estándar visual que los .css originales).
// =============================================================================

import 'package:flutter/material.dart';

// =============================================================================
// COLORES Y CONSTANTES DE DISEÑO
// =============================================================================
class FWColors {
  static const Color primaryBlue = Color(0xFF1A56FF);
  static const Color primaryPurple = Color(0xFF7C3AED);
  static const Color background = Color(0xFFF6F7FB);
  static const Color textDark = Color(0xFF0A1435);
  static const Color textMuted = Color(0xFF999999);
  static const Color infoBg = Color(0xFFF6F7FB);

  static const LinearGradient sidebarGradient = LinearGradient(
    colors: [primaryBlue, primaryPurple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

// =============================================================================
// HELPERS DE FECHA Y FOTO
// =============================================================================
const fwMeses = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

String fwFormatFecha(DateTime? fecha) {
  if (fecha == null) return '—';
  return '${fecha.day} de ${fwMeses[fecha.month - 1]} de ${fecha.year}';
}

String fwFotoUrl(String? foto, String apiBaseUrl) {
  if (foto == null || foto.isEmpty) return '';
  if (foto.startsWith('http')) return foto;
  return '$apiBaseUrl$foto';
}

// =============================================================================
// CÍRCULOS DECORATIVOS DEL HEADER/SIDEBAR
// =============================================================================
Widget fwDecorativeCircle(double size) {
  return Container(
    width: size,
    height: size,
    decoration: BoxDecoration(
      shape: BoxShape.circle,
      color: Colors.white.withValues(alpha: 0.07),
    ),
  );
}

/// Foto de perfil circular con fallback a icono.
class FWAvatar extends StatelessWidget {
  final String fotoUrl;
  final IconData fallbackIcon;
  final double size;

  const FWAvatar({
    super.key,
    required this.fotoUrl,
    this.fallbackIcon = Icons.person,
    this.size = 100,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withValues(alpha: 0.15),
        border: Border.all(color: Colors.white.withValues(alpha: 0.5), width: 3),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 16, offset: Offset(0, 8)),
        ],
      ),
      child: ClipOval(
        child: fotoUrl.isNotEmpty
            ? Image.network(
                fotoUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    Icon(fallbackIcon, size: size * 0.45, color: Colors.white),
              )
            : Icon(fallbackIcon, size: size * 0.45, color: Colors.white),
      ),
    );
  }
}

/// Tarjeta blanca redondeada equivalente a .detail-card
class FWDetailCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final List<Widget> children;
  final bool spaceBetween;

  const FWDetailCard({
    super.key,
    required this.icon,
    required this.title,
    required this.children,
    this.spaceBetween = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.black.withValues(alpha: 0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: FWColors.sidebarGradient,
                  borderRadius: BorderRadius.circular(9),
                ),
                child: Icon(icon, size: 16, color: Colors.white),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: FWColors.textDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          if (spaceBetween)
            Column(
              children: children
                  .map((c) => Padding(padding: const EdgeInsets.only(bottom: 14), child: c))
                  .toList(),
            )
          else
            Column(children: children),
        ],
      ),
    );
  }
}

/// Campo simple equivalente a .info-item (sin mensaje de vacío personalizado)
class FWInfoField extends StatelessWidget {
  final String label;
  final String? value;

  const FWInfoField({super.key, required this.label, this.value});

  @override
  Widget build(BuildContext context) {
    final tieneValor = value != null && value!.trim().isNotEmpty && value != '—';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: FWColors.textMuted,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: FWColors.infoBg,
            borderRadius: BorderRadius.circular(9),
            border: const Border(left: BorderSide(color: FWColors.primaryBlue, width: 3)),
          ),
          child: Text(
            tieneValor ? value! : '—',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF111111)),
          ),
        ),
      ],
    );
  }
}

/// Campo con mensaje descriptivo cuando el dato no existe en la BD
class FWCampoInfo extends StatelessWidget {
  final String label;
  final String? value;
  final String mensajeVacio;

  const FWCampoInfo({
    super.key,
    required this.label,
    required this.mensajeVacio,
    this.value,
  });

  @override
  Widget build(BuildContext context) {
    final tieneValor = value != null && value!.trim().isNotEmpty;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: FWColors.textMuted,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: FWColors.infoBg,
            borderRadius: BorderRadius.circular(9),
            border: const Border(left: BorderSide(color: FWColors.primaryBlue, width: 3)),
          ),
          child: Text(
            tieneValor ? value! : mensajeVacio,
            style: tieneValor
                ? const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF111111))
                : const TextStyle(fontSize: 12.5, fontStyle: FontStyle.italic, color: Color(0xFF9CA3AF)),
          ),
        ),
      ],
    );
  }
}

/// Wrapper que anima la entrada de cada tarjeta
class FWAnimatedCard extends StatelessWidget {
  final bool visible;
  final Widget child;
  const FWAnimatedCard({super.key, required this.visible, required this.child});

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: visible ? 1 : 0,
      duration: const Duration(milliseconds: 400),
      child: AnimatedSlide(
        offset: visible ? Offset.zero : const Offset(0, 0.05),
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOut,
        child: child,
      ),
    );
  }
}

/// Mixin-helper para animar N tarjetas en cascada
void fwAnimarEntrada(List<bool> visible, void Function(void Function()) setState, {bool Function()? mounted}) {
  for (var i = 0; i < visible.length; i++) {
    Future.delayed(Duration(milliseconds: i * 120), () {
      if (mounted == null || mounted()) {
        setState(() => visible[i] = true);
      }
    });
  }
}
