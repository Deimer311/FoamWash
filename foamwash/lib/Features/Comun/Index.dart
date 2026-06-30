// =============================================================================
// ARCHIVO  : index_screen.dart
// PROYECTO : FoamWash
// DESCRIPCIÓN: Vista principal — réplica exacta del diseño objetivo
// =============================================================================

import 'dart:async';
import 'dart:math' as math;
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/login_screen.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

// ─────────────────────────── PALETA ───────────────────────────
const _kBlue      = Color(0xFF1A56FF);
const _kBlueSoft  = Color(0xFF7EB8FF);
const _kWhite     = Colors.white;
const _kTextLight = Color(0xCCFFFFFF);
const _kTextMuted = Color(0x80FFFFFF);
const _kNavBg     = Color(0xD90A1437);
const _kFooterBg  = Color(0xBF050C23);
const _kFbBlue    = Color(0xFF1877F2);
const _kWaGreen   = Color(0xFF25D366);
const _kKanit     = 'Kanit';

// ─────────────────────── DATOS GALERÍA ────────────────────────
// Agrega tus imágenes en assets/gallery/ y declara el path aquí
class _GalleryItem {
  final String assetPath;
  final String title;
  const _GalleryItem({required this.assetPath, required this.title});
}

// Mismas 3 fotos, mismo orden y mismos títulos que RightSection.jsx (web)
const _gallery = [
  _GalleryItem(assetPath: 'assets/imag1.jpg', title: 'Lavado de muebles'),
  _GalleryItem(assetPath: 'assets/imag6.jpg', title: 'Lavado de colchones'),
  _GalleryItem(assetPath: 'assets/imag2.jpg', title: 'Limpieza sillas de comedor'),
];

// ──────────────────── DATOS HERO (igual a LeftSection.jsx) ────────────────────
class _HeroSlide {
  final String title;
  final String body;
  const _HeroSlide({required this.title, required this.body});
}

const _heroSlides = [
  _HeroSlide(
    title: 'Lavados González',
    body: 'Lavados y Limpieza profunda... Ofrecemos servicios de limpieza '
        'profunda, cuidando cada material con profesionalismo y delicadeza.',
  ),
  _HeroSlide(
    title: 'Visión',
    body: 'Queremos a corto plazo convertirnos en la empresa con mayor '
        'clientela en el ámbito de la limpieza, para el año 2026 aumentar '
        'nuestra clientela al doble de la que tenemos actualmente.',
  ),
  _HeroSlide(
    title: 'Misión',
    body: 'Nuestra misión es ser líderes en soluciones de limpieza para el '
        'hogar y la industria, con un enfoque en la calidad y la sostenibilidad.',
  ),
];

const _waNumber = '573144368571';
const _fbUrl    = 'https://www.facebook.com/share/1HhYNYTwtK/';

// =============================================================================
// WIDGET PRINCIPAL
// =============================================================================
class IndexScreen extends StatefulWidget {
  const IndexScreen({super.key});

  @override
  State<IndexScreen> createState() => _IndexScreenState();
}

class _IndexScreenState extends State<IndexScreen>
    with TickerProviderStateMixin {

  int    _galleryIndex = 0;
  Timer? _galleryTimer;
  late AnimationController _galleryAnim;
  late Animation<double>   _galleryFade;

  // Carrusel de texto hero (Lavados González / Visión / Misión) — igual a LeftSection.jsx
  int    _heroIndex = 0;
  Timer? _heroTimer;

  late AnimationController _shimmerAnim;

  bool  _showWaModal = false;
  final _msgController = TextEditingController();

  @override
  void initState() {
    super.initState();

    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    _galleryAnim = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _galleryFade =
        CurvedAnimation(parent: _galleryAnim, curve: Curves.easeInOut);
    _galleryAnim.forward();
    _galleryTimer =
        Timer.periodic(const Duration(seconds: 5), (_) => _nextGallery());

    _shimmerAnim =
        AnimationController(vsync: this, duration: const Duration(seconds: 4))
          ..repeat();

    // Mismo intervalo (7s) que LeftSection.jsx en la web
    _heroTimer = Timer.periodic(const Duration(seconds: 7), (_) {
      if (!mounted) return;
      setState(() => _heroIndex = (_heroIndex + 1) % _heroSlides.length);
    });
  }

  void _nextGallery() {
    _galleryAnim.reverse().then((_) {
      setState(() => _galleryIndex = (_galleryIndex + 1) % _gallery.length);
      _galleryAnim.forward();
    });
  }

  void _goToGallery(int i) {
    if (i == _galleryIndex) return;
    _galleryAnim.reverse().then((_) {
      setState(() => _galleryIndex = i);
      _galleryAnim.forward();
    });
  }

  @override
  void dispose() {
    _galleryTimer?.cancel();
    _heroTimer?.cancel();
    _galleryAnim.dispose();
    _shimmerAnim.dispose();
    _msgController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Fondo hero con imagen
          _HeroBackground(shimmer: _shimmerAnim),

          // Overlay — mismo degradado claro que .hero-overlay en la web
          // (azul claro arriba-izq → azul oscuro abajo-der), no un velo plano
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment(-1, -1),
                  end: Alignment(1, 1),
                  stops: [0.0, 0.5, 1.0],
                  colors: [
                    Color(0x407EB8FF), // rgba(126,184,255,0.25)
                    Color(0x267EB8FF), // rgba(126,184,255,0.15)
                    Color(0xB30A193C), // rgba(10,25,60,0.70)
                  ],
                ),
              ),
            ),
          ),

          // Layout principal
          Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildHeader(context),

              // Cuerpo: en vertical se apila y centra (con scroll de
              // respaldo); en horizontal usa las 3 columnas de la web.
              Expanded(
                child: OrientationBuilder(
                  builder: (context, orientation) {
                    final isLandscape = orientation == Orientation.landscape;
                    return LayoutBuilder(
                      builder: (context, constraints) {
                        return SingleChildScrollView(
                          physics: const BouncingScrollPhysics(),
                          padding: EdgeInsets.symmetric(
                            vertical: isLandscape ? 8 : 16,
                            horizontal: isLandscape ? 24 : 0,
                          ),
                          child: ConstrainedBox(
                            constraints: BoxConstraints(
                              minHeight: (constraints.maxHeight -
                                      (isLandscape ? 16 : 32))
                                  .clamp(0.0, double.infinity),
                            ),
                            child: isLandscape
                                ? _buildLandscapeContent()
                                : _buildPortraitContent(),
                          ),
                        );
                      },
                    );
                  },
                ),
              ),

              _buildFooter(context),
            ],
          ),

          if (_showWaModal) _buildWaModal(),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  CONTENIDO — VERTICAL (retrato)
  // ══════════════════════════════════════════════
  Widget _buildPortraitContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildHeroText(),
        const SizedBox(height: 28),
        _buildCTAButton(),
        const SizedBox(height: 28),
        _buildGallerySection(),
      ],
    );
  }

  // ══════════════════════════════════════════════
  //  CONTENIDO — HORIZONTAL (igual al grid de 3
  //  columnas de la web: texto | botón | galería)
  // ══════════════════════════════════════════════
  Widget _buildLandscapeContent() {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Columna izquierda — texto (igual a LeftSection.jsx)
          Expanded(
            flex: 2,
            child: Center(child: _buildHeroText(compact: true)),
          ),
          const SizedBox(width: 20),

          // Columna central — CTA (igual a CenterSection.jsx)
          Expanded(
            flex: 1,
            child: Center(child: _buildCTAButton()),
          ),
          const SizedBox(width: 20),

          // Columna derecha — galería (igual a RightSection.jsx)
          Expanded(
            flex: 2,
            child: Center(child: _buildGallerySection(compact: true)),
          ),
        ],
      ),
    );
  }
  // ══════════════════════════════════════════════
  //  HEADER
  // ══════════════════════════════════════════════
  Widget _buildHeader(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final horizontalPadding = screenWidth > 560 ? 48.0 : 20.0;
    final logoSize = screenWidth > 560 ? 28.0 : 22.0;
    final suffixSize = logoSize * 0.5;
    final topPadding = MediaQuery.of(context).padding.top;

    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        return ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 16.0, sigmaY: 16.0),
            child: Container(
              height: 72 + topPadding,
              decoration: const BoxDecoration(
                color: Color(0x660A1437), // Color translúcido de la web (40% opacidad)
                border: Border(
                  bottom: BorderSide(color: Color(0x14FFFFFF), width: 1), // rgba(255,255,255,0.08)
                ),
              ),
              padding: EdgeInsets.only(
                top: topPadding,
                left: horizontalPadding,
                right: horizontalPadding,
              ),
              child: Row(
                children: [
                  // CONTACT INFO (left aligned, fixed width on desktop/landscape to balance alignment)
                  SizedBox(
                    width: screenWidth > 560 ? 180 : 36,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white.withOpacity(0.10),
                            border: Border.all(color: Colors.white.withOpacity(0.15)),
                          ),
                          child: const Icon(Icons.phone_rounded,
                              color: _kBlueSoft, size: 16),
                        ),
                        if (screenWidth > 560) ...[
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              mainAxisSize: MainAxisSize.min,
                              children: const [
                                Text(
                                  'CONTÁCTANOS',
                                  style: TextStyle(
                                    fontFamily: _kKanit,
                                    color: Color(0x80FFFFFF),
                                    fontSize: 10,
                                    fontWeight: FontWeight.w400,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                                SizedBox(height: 1),
                                Text(
                                  '314 436 8571',
                                  style: TextStyle(
                                    fontFamily: _kKanit,
                                    color: _kBlueSoft,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  // LOGO CENTRADO — ocupa el espacio restante, igual al header web
                  Expanded(
                    child: Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'FoamWash',
                            style: TextStyle(
                              fontFamily: _kKanit,
                              color: _kWhite,
                              fontSize: logoSize,
                              fontWeight: FontWeight.w800,
                              letterSpacing: -0.5,
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.only(top: 2, left: 2),
                            child: Text(
                              'LG',
                              style: TextStyle(
                                fontFamily: _kKanit,
                                color: _kBlueSoft,
                                fontSize: suffixSize,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // ACCIONES — mismo botón cápsula que .login-btn en el header web
                  SizedBox(
                    width: screenWidth > 560 ? 180 : null,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (auth.isAdmin) ...[
                          _AdminBadge(
                            onTap: () =>
                                Navigator.pushNamed(context, '/admin_dashboard'),
                          ),
                          const SizedBox(width: 8),
                        ],
                        if (auth.isAuthenticated)
                          _HeaderActionButton(
                            label: 'Cerrar sesión',
                            onTap: () => auth.logout(),
                          )
                        else
                          _HeaderActionButton(
                            label: 'Iniciar sesión',
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) => const LoginScreen()),
                              );
                            },
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // ══════════════════════════════════════════════
  //  TEXTO HERO
  // ══════════════════════════════════════════════
  Widget _buildHeroText({bool compact = false}) {
    final slide = _heroSlides[_heroIndex];
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: compact ? 0 : 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 500),
            child: Column(
              key: ValueKey(_heroIndex),
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  slide.title,
                  style: TextStyle(
                    fontFamily: _kKanit,
                    color: _kWhite,
                    fontSize: compact ? 22 : 30,
                    fontWeight: FontWeight.w800,
                    height: 1.15,
                    letterSpacing: -0.5,
                  ),
                ),
                SizedBox(height: compact ? 8 : 10),
                Text(
                  slide.body,
                  style: TextStyle(
                    fontFamily: _kKanit,
                    color: _kTextLight,
                    fontSize: compact ? 13 : 14,
                    fontWeight: FontWeight.w400,
                    height: 1.55,
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: compact ? 12 : 14),

          // Dots — mismo estilo que .left-dot en el header web
          Row(
            children: List.generate(_heroSlides.length, (i) {
              final active = i == _heroIndex;
              return GestureDetector(
                onTap: () => setState(() => _heroIndex = i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.only(right: 6),
                  width: active ? 22 : 7,
                  height: 7,
                  decoration: BoxDecoration(
                    color: active ? _kBlueSoft : Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  BOTÓN CTA
  // ══════════════════════════════════════════════
  Widget _buildCTAButton() {
    return Center(
      child: GestureDetector(
        onTap: () => Navigator.pushNamed(context, '/cotizador'),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
          decoration: BoxDecoration(
            color: _kBlue,
            borderRadius: BorderRadius.circular(50),
            boxShadow: [
              BoxShadow(
                color: _kBlue.withOpacity(0.35),
                blurRadius: 18,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Text(
            'Ver servicios',
            style: TextStyle(
              fontFamily: _kKanit,
              color: _kWhite,
              fontSize: 15,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  GALERÍA — imágenes locales, tú las agregas
  // ══════════════════════════════════════════════
  Widget _buildGallerySection({bool compact = false}) {
    final item = _gallery[_galleryIndex];

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: compact ? 0 : 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
            onHorizontalDragEnd: (details) {
              if (details.primaryVelocity == null) return;
              if (details.primaryVelocity! < -200) {
                _goToGallery((_galleryIndex + 1) % _gallery.length);
              } else if (details.primaryVelocity! > 200) {
                _goToGallery(
                    (_galleryIndex - 1 + _gallery.length) % _gallery.length);
              }
            },
            onTap: () => _goToGallery((_galleryIndex + 1) % _gallery.length),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: SizedBox(
                height: compact ? 150 : 200,
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // ── PON TUS FOTOS EN assets/gallery/ ──
                    FadeTransition(
                      opacity: _galleryFade,
                      child: Image.asset(
                        item.assetPath,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          // Placeholder hasta que agregues tus imágenes
                          color: const Color(0xFF0D1B3E),
                          child: const Center(
                            child: Icon(
                              Icons.add_photo_alternate_outlined,
                              color: Colors.white24,
                              size: 48,
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Gradiente inferior
                    Positioned(
                      bottom: 0, left: 0, right: 0,
                      child: Container(
                        height: 90,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [Color(0xEE000000), Colors.transparent],
                          ),
                        ),
                      ),
                    ),

                    // Título
                    Positioned(
                      bottom: 14, left: 16,
                      child: FadeTransition(
                        opacity: _galleryFade,
                        child: Text(
                          item.title,
                          style: const TextStyle(
                            fontFamily: _kKanit,
                            color: _kWhite,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),

                    // Contador
                    Positioned(
                      top: 12, right: 14,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.50),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(
                          '${_galleryIndex + 1} / ${_gallery.length}',
                          style: const TextStyle(
                            fontFamily: _kKanit,
                            color: _kWhite,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Dots
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_gallery.length, (i) {
              final active = i == _galleryIndex;
              return GestureDetector(
                onTap: () => _goToGallery(i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: active ? 22 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active
                        ? _kWhite
                        : Colors.white.withOpacity(0.35),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  FOOTER
  // ══════════════════════════════════════════════
  Widget _buildFooter(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth <= 560;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    final childContent = isMobile
        ? Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _SocialButton(
                    color: _kFbBlue,
                    icon: Icons.facebook_rounded,
                    onTap: () {
                      // launchUrl(Uri.parse(_fbUrl));
                    },
                  ),
                  const SizedBox(width: 12),
                  _SocialButton(
                    color: _kWaGreen,
                    icon: Icons.chat_rounded,
                    onTap: () => setState(() => _showWaModal = true),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                '© 2025 Lavados González. Todos los derechos reservados.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: _kKanit,
                  color: Color(0x73FFFFFF), // rgba(255,255,255,0.45)
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                ),
              ),
            ],
          )
        : Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  _SocialButton(
                    color: _kFbBlue,
                    icon: Icons.facebook_rounded,
                    onTap: () {
                      // launchUrl(Uri.parse(_fbUrl));
                    },
                  ),
                  const SizedBox(width: 12),
                  _SocialButton(
                    color: _kWaGreen,
                    icon: Icons.chat_rounded,
                    onTap: () => setState(() => _showWaModal = true),
                  ),
                ],
              ),
              const Flexible(
                child: Text(
                  '© 2025 Lavados González. Todos los derechos reservados.',
                  textAlign: TextAlign.right,
                  style: TextStyle(
                    fontFamily: _kKanit,
                    color: Color(0x73FFFFFF), // rgba(255,255,255,0.45)
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
            ],
          );

    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12.0, sigmaY: 12.0),
        child: Container(
          decoration: const BoxDecoration(
            color: Color(0x66050C23), // Color translúcido de la web (40% opacidad)
            border: Border(
              top: BorderSide(color: Color(0x14FFFFFF), width: 1), // rgba(255,255,255,0.08)
            ),
          ),
          padding: EdgeInsets.only(
            left: isMobile ? 20.0 : 48.0,
            right: isMobile ? 20.0 : 48.0,
            top: isMobile ? 16.0 : 20.0,
            bottom: (isMobile ? 16.0 : 20.0) + bottomPadding,
          ),
          child: childContent,
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  MODAL WHATSAPP
  // ══════════════════════════════════════════════
  Widget _buildWaModal() {
    return GestureDetector(
      onTap: () => setState(() => _showWaModal = false),
      child: Container(
        color: Colors.black54,
        child: Center(
          child: GestureDetector(
            onTap: () {},
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 40,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.chat_rounded, color: _kWaGreen, size: 22),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Enviar mensaje por WhatsApp',
                          style: TextStyle(
                            fontFamily: _kKanit,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1A1A1A),
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () => setState(() => _showWaModal = false),
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Color(0xFFF0F0F0),
                          ),
                          child: const Icon(Icons.close,
                              size: 16, color: Color(0xFF666666)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _msgController,
                    maxLines: 4,
                    style: const TextStyle(
                        fontFamily: _kKanit,
                        fontSize: 14,
                        color: Color(0xFF1A1A1A)),
                    decoration: InputDecoration(
                      hintText: 'Escribe tu mensaje aquí...',
                      hintStyle: TextStyle(
                          color: Colors.grey[400],
                          fontFamily: _kKanit,
                          fontSize: 14),
                      contentPadding: const EdgeInsets.all(12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                            color: Color(0xFFE0E0E0), width: 1.5),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide:
                            const BorderSide(color: _kWaGreen, width: 1.5),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                            color: Color(0xFFE0E0E0), width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _showWaModal = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEBEBEB),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Center(
                              child: Text(
                                'Cancelar',
                                style: TextStyle(
                                  fontFamily: _kKanit,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 15,
                                  color: Color(0xFF333333),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: ValueListenableBuilder<TextEditingValue>(
                          valueListenable: _msgController,
                          builder: (_, val, __) {
                            final hasText = val.text.trim().isNotEmpty;
                            return GestureDetector(
                              onTap: hasText ? _sendWhatsApp : null,
                              child: Container(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(
                                  color: hasText
                                      ? _kWaGreen
                                      : const Color(0xFFCCCCCC),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Text(
                                    'Enviar',
                                    style: TextStyle(
                                      fontFamily: _kKanit,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 15,
                                      color: hasText
                                          ? Colors.white
                                          : const Color(0xFF888888),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _sendWhatsApp() {
    final msg = Uri.encodeComponent(_msgController.text.trim());
    // launchUrl(Uri.parse('https://wa.me/$_waNumber?text=$msg'));
    setState(() {
      _showWaModal = false;
      _msgController.clear();
    });
  }
}

// =============================================================================
// FONDO HERO
// =============================================================================
class _HeroBackground extends StatelessWidget {
  final AnimationController shimmer;
  const _HeroBackground({required this.shimmer});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: shimmer,
      builder: (_, __) {
        return Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/fondo.png',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) =>
                  Container(color: const Color(0xFF05080D)),
            ),
            Positioned(
              top: -120 + 80 * math.sin(shimmer.value * math.pi * 2),
              right: -80,
              child: Container(
                width: 300,
                height: 300,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [Color(0x2C7EB8FF), Colors.transparent],
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

// =============================================================================
// BOTÓN DE ACCIÓN DEL HEADER — mismo estilo cápsula que .login-btn (web)
// =============================================================================
class _HeaderActionButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _HeaderActionButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth <= 560;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 14 : 24,
          vertical: isMobile ? 7 : 9,
        ),
        decoration: BoxDecoration(
          color: Colors.transparent,
          border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontFamily: _kKanit,
            color: _kWhite,
            fontSize: isMobile ? 12 : 14,
            fontWeight: FontWeight.w500,
            letterSpacing: 0.3,
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// BADGE "ADMIN" — versión compacta del badge de escritorio
// =============================================================================
class _AdminBadge extends StatelessWidget {
  final VoidCallback onTap;

  const _AdminBadge({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: _kBlue.withOpacity(0.3),
          border: Border.all(color: _kBlueSoft, width: 1.2),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          'Admin',
          style: TextStyle(
            fontFamily: _kKanit,
            color: _kWhite,
            fontSize: 10,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// BOTÓN SOCIAL
// =============================================================================
class _SocialButton extends StatelessWidget {
  final Color color;
  final IconData icon;
  final VoidCallback onTap;

  const _SocialButton({
    required this.color,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        child: Icon(icon, color: Colors.white, size: 18),
      ),
    );
  }
}