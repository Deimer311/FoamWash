import 'package:flutter/material.dart';

/// Sistema de diseño unificado FoamWash.
/// Replica exactamente la identidad visual del sistema web premium.
class AppTheme {
  AppTheme._();

  // ─── Paleta de colores principal ──────────────────────────────────────────
  static const Color backgroundWhite  = Color(0xFFF0F4FF);
  static const Color appBarDark        = Color(0xFF0C1A3A);  // Navy idéntico al web
  static const Color cardWhite         = Colors.white;

  // Azul primario idéntico al web
  static const Color primaryBlue       = Color(0xFF1A4BFF);
  static const Color primaryBlueDark   = Color(0xFF1338CC);

  // Morado del degradado del botón
  static const Color gradientPurple    = Color(0xFF7C3AED);

  // Textos
  static const Color darkText          = Color(0xFF0F172A);
  static const Color subtitleText      = Color(0xFF475569);
  static const Color greyText          = Color(0xFF94A3B8);
  static const Color priceBlue         = Color(0xFF1A4BFF);

  // Badges / Tags  (coincide exactamente con el web)
  static const Color tagEcoGreen       = Color(0xFF16A34A);
  static const Color tagEcoBg          = Color(0xFFDCFCE7);
  static const Color tagGuaranteeBlue  = Color(0xFF1A4BFF);
  static const Color tagGuaranteeBg    = Color(0xFFEFF6FF);
  static const Color chipBg            = Color(0xFFF1F5F9);
  static const Color chipText          = Color(0xFF64748B);
  static const Color chipBorder        = Color(0xFFCBD5E1);

  // Rating
  static const Color starYellow        = Color(0xFFF59E0B);

  // Separador sutil
  static const Color dividerColor      = Color(0xFFF1F5F9);

  // ─── Gradiente del botón Solicitar ────────────────────────────────────────
  static const LinearGradient buttonGradient = LinearGradient(
    colors: [primaryBlue, gradientPurple],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  // ─── Sombras premium ──────────────────────────────────────────────────────
  static List<BoxShadow> get cardShadow => [
    BoxShadow(
      color: const Color(0xFF1A4BFF).withOpacity(0.08),
      blurRadius: 24,
      offset: const Offset(0, 8),
      spreadRadius: 0,
    ),
    BoxShadow(
      color: Colors.black.withOpacity(0.04),
      blurRadius: 8,
      offset: const Offset(0, 2),
      spreadRadius: 0,
    ),
  ];

  static List<BoxShadow> get buttonShadow => [
    BoxShadow(
      color: primaryBlue.withOpacity(0.35),
      blurRadius: 16,
      offset: const Offset(0, 6),
      spreadRadius: 0,
    ),
  ];

  // ─── Border radius ────────────────────────────────────────────────────────
  static const double radiusCard   = 20.0;
  static const double radiusButton = 14.0;
  static const double radiusBadge  = 20.0;
  static const double radiusChip   = 10.0;

  // ─── Tipografía Kanit ─────────────────────────────────────────────────────
  static const String fontFamily = 'Kanit';

  static TextStyle get serviceName => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 18,
    fontWeight: FontWeight.w700,   // Bold
    color: darkText,
    height: 1.2,
    letterSpacing: -0.2,
  );

  static TextStyle get serviceDescription => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 13,
    fontWeight: FontWeight.w400,   // Regular
    color: subtitleText,
    height: 1.5,
  );

  static TextStyle get priceLabel => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 10,
    fontWeight: FontWeight.w600,   // SemiBold
    color: greyText,
    letterSpacing: 1.0,
  );

  static TextStyle get priceValue => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 28,
    fontWeight: FontWeight.w800,   // ExtraBold
    color: priceBlue,
    height: 1.0,
  );

  static TextStyle get buttonLabel => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 16,
    fontWeight: FontWeight.w600,   // SemiBold
    color: Colors.white,
    letterSpacing: 0.3,
  );

  static TextStyle get badgeText => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 11,
    fontWeight: FontWeight.w500,   // Medium
    height: 1.0,
  );

  static TextStyle get ratingText => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,   // Medium
    color: darkText,
  );

  static TextStyle get ratingCount => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: greyText,
  );

  static TextStyle get sectionLabel => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 10,
    fontWeight: FontWeight.w600,
    color: greyText,
    letterSpacing: 1.2,
  );

  static TextStyle get chipLabel => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: chipText,
  );

  static TextStyle get appBarTitle => const TextStyle(
    fontFamily: fontFamily,
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: Colors.white,
    letterSpacing: 0.3,
  );

  // ─── ThemeData global ────────────────────────────────────────────────────
  static ThemeData get lightTheme => ThemeData(
    fontFamily: fontFamily,
    scaffoldBackgroundColor: backgroundWhite,
    colorScheme: ColorScheme.fromSeed(
      seedColor: primaryBlue,
      brightness: Brightness.light,
    ),
    useMaterial3: true,
  );
}