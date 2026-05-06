// =============================================================================
// ARCHIVO  : index_screen.dart
// PROYECTO : FoamWash
// DESCRIPCIÓN: Vista principal del home — Rediseño minimalista mobile-first
//              inspirado en el mockup web (Header.jsx + MainContent.jsx)
// =============================================================================

import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/auth_login/login_screen.dart';
import 'package:foamwash/Features/auth_login/providers/auth_provider.dart';

// ─────────────────────────── PALETA ───────────────────────────
const _kBlue       = Color(0xFF1A56FF);
const _kBlueDark   = Color(0xFF0E40D9);
const _kBlueSoft   = Color(0xFF7EB8FF);
const _kOverlay    = Color(0x80000000);
const _kWhite      = Colors.white;
const _kTextLight  = Color(0xCCFFFFFF);
const _kTextMuted  = Color(0x80FFFFFF);
const _kNavBg      = Color(0xD90A1437);   // rgba(10,20,55,0.85)
const _kFooterBg   = Color(0xBF05080D);   // rgba(5,12,35,0.75)
const _kFbBlue     = Color(0xFF1877F2);
const _kWaGreen    = Color(0xFF25D366);
const _kKanit      = 'Kanit';

// ─────────────────────── DATOS SLIDES ─────────────────────────
class _SlideData {
  final String title;
  final String body;
  const _SlideData({required this.title, required this.body});
}

const _slides = [
  _SlideData(
    title: 'Lavados González',
    body: 'Lavados y Limpieza profunda... Ofrecemos servicios de limpieza profunda, cuidando cada material con profesionalismo y delicadeza.',
  ),
  _SlideData(
    title: 'Visión',
    body: 'Queremos convertirnos en la empresa con mayor clientela en limpieza. Para 2026 aumentar nuestra clientela al doble de la actual.',
  ),
  _SlideData(
    title: 'Misión',
    body: 'Ser líderes en soluciones de limpieza para el hogar y la industria, con enfoque en la calidad y la sostenibilidad.',
  ),
];

// ─────────────────────── DATOS GALERÍA ────────────────────────
class _GalleryItem {
  final String imageUrl;
  final String title;
  const _GalleryItem({required this.imageUrl, required this.title});
}

const _gallery = [
  _GalleryItem(
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    title: 'Lavado de muebles',
  ),
  _GalleryItem(
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=600',
    title: 'Lavado de colchones',
  ),
  _GalleryItem(
    imageUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600',
    title: 'Limpieza sillas de comedor',
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

  // ── Slides de texto ──
  int   _slideIndex = 0;
  Timer? _slideTimer;
  late AnimationController _slideAnim;
  late Animation<double>   _slideFade;
  late Animation<Offset>   _slideOffset;

  // ── Galería ──
  int   _galleryIndex = 0;
  Timer? _galleryTimer;
  late AnimationController _galleryAnim;
  late Animation<double>   _galleryFade;

  // ── Shimmer de fondo ──
  late AnimationController _shimmerAnim;

  // ── Modal WhatsApp ──
  bool   _showWaModal = false;
  final  _msgController = TextEditingController();

  @override
  void initState() {
    super.initState();

    // Slide texto
    _slideAnim = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _slideFade   = CurvedAnimation(parent: _slideAnim, curve: Curves.easeOut);
    _slideOffset = Tween<Offset>(begin: const Offset(0, 0.12), end: Offset.zero)
        .animate(CurvedAnimation(parent: _slideAnim, curve: Curves.easeOut));
    _slideAnim.forward();
    _slideTimer =
        Timer.periodic(const Duration(seconds: 7), (_) => _nextSlide());

    // Galería
    _galleryAnim = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 700));
    _galleryFade =
        CurvedAnimation(parent: _galleryAnim, curve: Curves.easeInOut);
    _galleryAnim.forward();
    _galleryTimer =
        Timer.periodic(const Duration(seconds: 5), (_) => _nextGallery());

    // Shimmer
    _shimmerAnim =
        AnimationController(vsync: this, duration: const Duration(seconds: 4))
          ..repeat();
  }

  void _nextSlide() {
    _slideAnim.reverse().then((_) {
      setState(() => _slideIndex = (_slideIndex + 1) % _slides.length);
      _slideAnim.forward();
    });
  }

  void _goToSlide(int i) {
    if (i == _slideIndex) return;
    _slideAnim.reverse().then((_) {
      setState(() => _slideIndex = i);
      _slideAnim.forward();
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
    _slideTimer?.cancel();
    _galleryTimer?.cancel();
    _slideAnim.dispose();
    _galleryAnim.dispose();
    _shimmerAnim.dispose();
    _msgController.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // ── Fondo hero ──
          _HeroBackground(shimmer: _shimmerAnim),

          // ── Overlay oscuro ──
          Container(color: _kOverlay),

          // ── Overlay azulado (igual que en la web) ──
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0x407EB8FF),
                  Color(0x267EB8FF),
                  Color(0xB20A193C),
                ],
                stops: [0.0, 0.5, 1.0],
              ),
            ),
          ),

          // ── Layout fijo: header | centro | footer ──
          SafeArea(
            child: Column(
              children: [
                _buildHeader(context),
                Expanded(
                  child: Center(
                    child: _buildHeroContent(),
                  ),
                ),
                _buildFooter(),
              ],
            ),
          ),

          // ── Modal WhatsApp ──
          if (_showWaModal) _buildWaModal(),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  HEADER  —  logo centrado + login a la derecha
  // ══════════════════════════════════════════════
  Widget _buildHeader(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        return Container(
          height: 64,
          decoration: const BoxDecoration(
            color: _kNavBg,
            border: Border(
              bottom: BorderSide(color: Color(0x14FFFFFF), width: 1),
            ),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              // Logo centrado
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
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
                  Text(
                    'LG',
                    style: TextStyle(
                      fontFamily: _kKanit,
                      color: _kBlueSoft,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),

              // Icono teléfono a la izquierda
              Positioned(
                left: 16,
                child: Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withOpacity(0.10),
                    border: Border.all(color: Colors.white.withOpacity(0.15)),
                  ),
                  child: Icon(Icons.phone_rounded, color: _kBlueSoft, size: 16),
                ),
              ),

              // Botones a la derecha
              Positioned(
                right: 16,
                child: Row(
                  children: [
                    if (auth.isAdmin)
                      GestureDetector(
                        onTap: () => Navigator.pushNamed(context, '/admin_dashboard'),
                        child: Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
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
                    GestureDetector(
                      onTap: () {
                        if (auth.isAuthenticated) {
                          auth.logout();
                        } else {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => LoginScreen()),
                          );
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                        decoration: BoxDecoration(
                          border: Border.all(
                              color: Colors.white.withOpacity(0.4), width: 1.5),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          auth.isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión',
                          style: TextStyle(
                            fontFamily: _kKanit,
                            color: _kWhite,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.3,
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
      },
    );
  }

  // ══════════════════════════════════════════════
  //  HERO CONTENT  —  texto + dots + botón CTA
  // ══════════════════════════════════════════════
  Widget _buildHeroContent() {
    return const _CTAButton();
  }

  // ══════════════════════════════════════════════
  //  GALERÍA
  // ══════════════════════════════════════════════
  Widget _buildGallerySection() {
    final item = _gallery[_galleryIndex];
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Label "GALERÍA"
          Row(
            children: [
              Container(
                width: 3,
                height: 14,
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  color: _kBlueSoft,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Text(
                'GALERÍA',
                style: TextStyle(
                  fontFamily: _kKanit,
                  color: _kBlueSoft,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Imagen principal
          GestureDetector(
            onTap: () {
              final next = (_galleryIndex + 1) % _gallery.length;
              _goToGallery(next);
            },
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: SizedBox(
                height: 200,
                width: double.infinity,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    FadeTransition(
                      opacity: _galleryFade,
                      child: Image.network(
                        item.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: Colors.grey[850],
                          child: const Center(
                              child: Icon(Icons.image,
                                  color: Colors.white38, size: 40)),
                        ),
                      ),
                    ),
                    // Gradiente inferior
                    Positioned(
                      bottom: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        height: 90,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.bottomCenter,
                            end: Alignment.topCenter,
                            colors: [Color(0xCC000000), Colors.transparent],
                          ),
                        ),
                      ),
                    ),
                    // Título
                    Positioned(
                      bottom: 14,
                      left: 16,
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
                    // Contador
                    Positioned(
                      top: 10,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 9, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_galleryIndex + 1} / ${_gallery.length}',
                          style: const TextStyle(
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
          const SizedBox(height: 10),

          // Dots galería
          Center(
            child: Row(
              mainAxisSize: MainAxisSize.min,
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
          ),

          const SizedBox(height: 10),

          // Miniaturas
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_gallery.length, (i) {
              final active = i == _galleryIndex;
              return GestureDetector(
                onTap: () => _goToGallery(i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: 88,
                  height: 54,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: active ? _kBlueSoft : Colors.transparent,
                      width: 2.5,
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Opacity(
                      opacity: active ? 1.0 : 0.5,
                      child: Image.network(
                        _gallery[i].imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: Colors.grey[800],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════
  //  FOOTER  —  redes sociales + copyright
  // ══════════════════════════════════════════════
  Widget _buildFooter() {
    return Container(
      decoration: const BoxDecoration(
        color: _kFooterBg,
        border: Border(
          top: BorderSide(color: Color(0x14FFFFFF), width: 1),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Botones sociales
          Row(
            children: [
              // Facebook
              _SocialButton(
                color: _kFbBlue,
                icon: Icons.facebook_rounded,
                onTap: () {
                  // Abrir Facebook — usa url_launcher en producción
                },
              ),
              const SizedBox(width: 10),

              // WhatsApp
              _SocialButton(
                color: _kWaGreen,
                svgPath: 'whatsapp',
                onTap: () => setState(() => _showWaModal = true),
              ),
            ],
          ),

          // Copyright
          Flexible(
            child: Text(
              '© 2025 Lavados González. Todos los derechos reservados.',
              textAlign: TextAlign.right,
              style: const TextStyle(
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
            onTap: () {}, // evitar cierre al tocar dentro
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
                  // Header modal
                  Row(
                    children: [
                      Icon(Icons.chat_rounded,
                          color: _kWaGreen, size: 22),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Enviar mensaje por WhatsApp',
                          style: const TextStyle(
                            fontFamily: _kKanit,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1A1A1A),
                          ),
                        ),
                      ),
                      GestureDetector(
                        onTap: () =>
                            setState(() => _showWaModal = false),
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: const Color(0xFFF0F0F0),
                          ),
                          child: const Icon(Icons.close,
                              size: 16, color: Color(0xFF666666)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Textarea
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
                        borderSide: const BorderSide(
                            color: _kWaGreen, width: 1.5),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                            color: Color(0xFFE0E0E0), width: 1.5),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Acciones
                  Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () =>
                              setState(() => _showWaModal = false),
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
    // En producción: usar url_launcher
    // launchUrl(Uri.parse('https://wa.me/$_waNumber?text=$msg'));
    setState(() {
      _showWaModal = false;
      _msgController.clear();
    });
  }
}

// =============================================================================
// WIDGET: Fondo Hero con efecto shimmer azul
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
            // Imagen principal
            Image.asset(
              'assets/fondo.png',
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Image.network(
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900',
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    Container(color: Colors.black),
              ),
            ),
            // Shimmer azul sutil (top-right)
            Positioned(
              top: -120 + 80 * math.sin(shimmer.value * math.pi * 2),
              right: -80,
              child: Container(
                width: 300,
                height: 300,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      Color(0x2C7EB8FF),
                      Colors.transparent,
                    ],
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
// WIDGETS AUXILIARES (Faltantes en la copia previa)
// =============================================================================

class _CTAButton extends StatelessWidget {
  const _CTAButton();

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {},
      child: const Text('Comenzar'),
    );
  }
}

class _SocialButton extends StatelessWidget {
  final Color color;
  final IconData? icon;
  final String? svgPath;
  final VoidCallback onTap;

  const _SocialButton({
    required this.color,
    this.icon,
    this.svgPath,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon ?? Icons.link, color: color),
      onPressed: onTap,
    );
  }
}