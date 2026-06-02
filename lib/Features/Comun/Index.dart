// =============================================================================
// ARCHIVO  : index_screen.dart
// PROYECTO : FoamWash
// DESCRIPCIÓN: Vista principal — réplica exacta del diseño objetivo
// =============================================================================

import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/auth_login/login_screen.dart';
import 'package:foamwash/Features/auth_login/providers/auth_provider.dart';

// ─────────────────────────── PALETA ───────────────────────────
const _kBlue      = Color(0xFF1A56FF);
const _kBlueSoft  = Color(0xFF7EB8FF);
const _kWhite     = Colors.white;
const _kTextLight = Color(0xCCFFFFFF);
const _kTextMuted = Color(0x80FFFFFF);
const _kNavBg     = Color(0xD90A1437);
const _kFooterBg  = Color(0xBF05080D);
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

const _gallery = [
  _GalleryItem(assetPath: 'assets/imag1.jpg',   title: 'Lavado de muebles'),
  _GalleryItem(assetPath: 'assets/imag2.jpg',   title: 'Limpieza de sillas de comedor'),
  _GalleryItem(assetPath: 'assets/imag6.jpg',   title: 'Desinfección profunda'),
  _GalleryItem(assetPath: 'assets/imag4.jpg', title: 'Lavado de alfombras'),
  _GalleryItem(assetPath: 'assets/imag7.jpg',    title: 'Limpieza de Alfombras'),
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

          // Overlay azul oscuro — mismo que login_screen
          Positioned.fill(
            child: Container(
              color: const Color(0xCC071230),
            ),
          ),

          // Layout principal
          SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(context),

                // Cuerpo distribuido con Spacer para que respiren
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Spacer(flex: 3),
                      _buildHeroText(),
                      const Spacer(flex: 3),
                      _buildCTAButton(),
                      const Spacer(flex: 3),
                      _buildGallerySection(),
                      const Spacer(flex: 4),
                    ],
                  ),
                ),

                _buildFooter(),
              ],
            ),
          ),

          if (_showWaModal) _buildWaModal(),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  HEADER
  // ══════════════════════════════════════════════
  Widget _buildHeader(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        return Container(
          decoration: const BoxDecoration(
            color: _kNavBg,
            border: Border(
              bottom: BorderSide(color: Color(0x14FFFFFF), width: 1),
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Positioned(
                left: 0,
                child: Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.10),
                    border: Border.all(color: Colors.white.withOpacity(0.20)),
                  ),
                  child: const Icon(Icons.phone_rounded,
                      color: _kBlueSoft, size: 18),
                ),
              ),

              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'FoamWash',
                        style: TextStyle(
                          fontFamily: _kKanit,
                          color: _kWhite,
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5,
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(top: 2),
                        child: Text(
                          'LG',
                          style: TextStyle(
                            fontFamily: _kKanit,
                            color: _kBlueSoft,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  GestureDetector(
                    onTap: () {
                      if (auth.isAuthenticated) {
                        auth.logout();
                      } else {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      }
                    },
                    child: Text(
                      auth.isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión',
                      style: const TextStyle(
                        fontFamily: _kKanit,
                        color: _kWhite,
                        fontSize: 13,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ),
                ],
              ),

              if (auth.isAdmin)
                Positioned(
                  right: 0,
                  child: GestureDetector(
                    onTap: () =>
                        Navigator.pushNamed(context, '/admin_dashboard'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: _kBlue.withOpacity(0.3),
                        border: Border.all(color: _kBlueSoft, width: 1.5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Panel Admin',
                        style: TextStyle(
                          fontFamily: _kKanit,
                          color: _kWhite,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  // ══════════════════════════════════════════════
  //  TEXTO HERO
  // ══════════════════════════════════════════════
  Widget _buildHeroText() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'Expertos en limpieza de mobiliario',
            style: TextStyle(
              fontFamily: _kKanit,
              color: _kWhite,
              fontSize: 28,
              fontWeight: FontWeight.w800,
              height: 1.15,
            ),
          ),
          SizedBox(height: 10),
          Text(
            'Dejamos impecables tus sofás, colchones,\nsillas y alfombras sin salir de casa.',
            style: TextStyle(
              fontFamily: _kKanit,
              color: _kTextLight,
              fontSize: 15,
              fontWeight: FontWeight.w400,
              height: 1.55,
            ),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  BOTÓN CTA
  // ══════════════════════════════════════════════
  Widget _buildCTAButton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 15),
      child: GestureDetector(
        onTap: () {},
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 13),
          decoration: BoxDecoration(
            color: _kBlue,
            borderRadius: BorderRadius.circular(50),
            boxShadow: [
              BoxShadow(
                color: _kBlue.withOpacity(0.45),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: const Center(
            child: Text(
              'Ver servicios',
              style: TextStyle(
                fontFamily: _kKanit,
                color: _kWhite,
                fontSize: 30,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.2,
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  GALERÍA — imágenes locales, tú las agregas
  // ══════════════════════════════════════════════
  Widget _buildGallerySection() {
    final item = _gallery[_galleryIndex];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
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
                height: 200,
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
  Widget _buildFooter() {
    return Container(
      decoration: const BoxDecoration(
        color: _kFooterBg,
        border: Border(
          top: BorderSide(color: Color(0x14FFFFFF), width: 1),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      child: Row(
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
              const SizedBox(width: 10),
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
                color: _kTextMuted,
                fontSize: 10,
              ),
            ),
          ),
        ],
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