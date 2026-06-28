import 'package:flutter/material.dart';
import 'package:foamwash/theme.dart';

/// Footer premium del aplicativo móvil.
/// Replica fielmente el diseño del footer del sistema web FoamWash:
/// - Barra de contacto superior
/// - Sección principal: logo, enlaces rápidos, servicios, newsletter
/// - Barra de copyright inferior
class AppFooter extends StatefulWidget {
  const AppFooter({Key? key}) : super(key: key);

  @override
  State<AppFooter> createState() => _AppFooterState();
}

class _AppFooterState extends State<AppFooter> {
  final TextEditingController _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  // ─── Colores internos del footer (navy oscuro igual al web) ───────────────
  static const Color _bg          = Color(0xFF0C1A3A);
  static const Color _bgLight     = Color(0xFF112040); // sección ligeramente más clara
  static const Color _bgContact   = Color(0xFF0A152F); // barra superior de contacto
  static const Color _textWhite   = Colors.white;
  static const Color _textMuted   = Color(0xFF8FA8CC);
  static const Color _accentBlue  = Color(0xFF1A4BFF);
  static const Color _divider     = Color(0xFF1A2F55);

  // ─── Barra de contacto superior ───────────────────────────────────────────
  Widget _buildContactBar() {
    return Container(
      color: _bgContact,
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildContactItem(
            icon: Icons.location_on_rounded,
            title: 'Ubícanos',
            subtitle: 'Bogotá, Colombia',
          ),
          _buildDividerVertical(),
          _buildContactItem(
            icon: Icons.phone_rounded,
            title: 'Llámanos',
            subtitle: '314 436 8571',
          ),
          _buildDividerVertical(),
          _buildContactItem(
            icon: Icons.email_rounded,
            title: 'Escríbenos',
            subtitle: 'contacto@\nfoamwash.com',
          ),
        ],
      ),
    );
  }

  Widget _buildContactItem({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Column(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            gradient: AppTheme.buttonGradient,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: Colors.white, size: 17),
        ),
        const SizedBox(height: 6),
        Text(
          title,
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: _textWhite,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 10,
            fontWeight: FontWeight.w400,
            color: _textMuted,
            height: 1.3,
          ),
        ),
      ],
    );
  }

  Widget _buildDividerVertical() {
    return Container(
      width: 1,
      height: 50,
      color: _divider,
    );
  }

  // ─── Logo + descripción + redes sociales ──────────────────────────────────
  Widget _buildBrandSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 28, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo FW + FoamWash
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: AppTheme.buttonGradient,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'FoamWash',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: _textWhite,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Servicios profesionales de limpieza profunda para tu hogar y negocio. Cuidamos cada detalle con calidad y dedicación.',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: _textMuted,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 20),
          // SÍGUENOS
          const Text(
            'SÍGUENOS',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: _textWhite,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildSocialIcon(Icons.facebook_rounded, 'Facebook'),
              const SizedBox(width: 10),
              _buildSocialIcon(Icons.chat_bubble_rounded, 'WhatsApp'),
              const SizedBox(width: 10),
              _buildSocialIcon(Icons.camera_alt_rounded, 'Instagram'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSocialIcon(IconData icon, String label) {
    return Tooltip(
      message: label,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: _bgLight,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: _divider, width: 1),
        ),
        child: Icon(icon, color: _textMuted, size: 20),
      ),
    );
  }

  // ─── Separador horizontal del footer ──────────────────────────────────────
  Widget _buildSectionDivider() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      height: 1,
      color: _divider,
    );
  }

  // ─── Sección de título con acento azul (igual al web) ─────────────────────
  Widget _buildSectionTitle(IconData icon, String title) {
    return Row(
      children: [
        Icon(icon, color: _accentBlue, size: 15),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: _textWhite,
            letterSpacing: 1.0,
          ),
        ),
      ],
    );
  }

  // ─── Links rápidos + Servicios (en dos columnas) ──────────────────────────
  Widget _buildLinksAndServices() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ENLACES RÁPIDOS
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionTitle(Icons.link_rounded, 'ENLACES RÁPIDOS'),
                const SizedBox(height: 4),
                Container(height: 2, width: 30, color: _accentBlue,
                    margin: const EdgeInsets.only(bottom: 14)),
                _buildNavLink(Icons.home_outlined, 'Inicio'),
                _buildNavLink(Icons.cleaning_services_outlined, 'Servicios'),
                _buildNavLink(Icons.calendar_today_outlined, 'Agendar'),
                _buildNavLink(Icons.request_quote_outlined, 'Cotización'),
                _buildNavLink(Icons.person_outline_rounded, 'Perfil'),
              ],
            ),
          ),
          const SizedBox(width: 16),
          // NUESTROS SERVICIOS
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionTitle(Icons.build_outlined, 'SERVICIOS'),
                const SizedBox(height: 4),
                Container(height: 2, width: 30, color: _accentBlue,
                    margin: const EdgeInsets.only(bottom: 14)),
                _buildServiceItem('Lavado de Muebles'),
                _buildServiceItem('Lavado de Alfombras'),
                _buildServiceItem('Lavado de Colchones'),
                _buildServiceItem('Tapicería de Carros'),
                _buildServiceItem('Limpieza de Cortinas'),
                _buildServiceItem('Mantenimiento de Pisos'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavLink(IconData icon, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, color: _textMuted, size: 14),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Kanit',
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: _textMuted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceItem(String name) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          const Icon(Icons.check_rounded, color: _accentBlue, size: 14),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              name,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontSize: 12,
                fontWeight: FontWeight.w400,
                color: _textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ─── Newsletter + Horario de atención ─────────────────────────────────────
  Widget _buildNewsletterSection() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle(Icons.mail_outline_rounded, 'NEWSLETTER'),
          const SizedBox(height: 4),
          Container(
              height: 2,
              width: 30,
              color: _accentBlue,
              margin: const EdgeInsets.only(bottom: 14)),
          const Text(
            'No te pierdas nuestras ofertas y novedades. Suscríbete a nuestro boletín.',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 12,
              fontWeight: FontWeight.w400,
              color: _textMuted,
              height: 1.5,
            ),
          ),
          const SizedBox(height: 14),
          // Campo de email
          Container(
            height: 46,
            decoration: BoxDecoration(
              color: _bgLight,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: _divider, width: 1),
            ),
            child: TextField(
              controller: _emailController,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontSize: 13,
                color: _textWhite,
              ),
              decoration: const InputDecoration(
                hintText: 'Tu correo electrónico',
                hintStyle: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 13,
                  color: _textMuted,
                ),
                border: InputBorder.none,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 13),
              ),
            ),
          ),
          const SizedBox(height: 10),
          // Botón suscribirse
          SizedBox(
            width: double.infinity,
            height: 46,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: AppTheme.buttonGradient,
                borderRadius: BorderRadius.circular(10),
                boxShadow: AppTheme.buttonShadow,
              ),
              child: TextButton(
                onPressed: () {
                  _emailController.clear();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Text(
                        '¡Suscripción exitosa!',
                        style: TextStyle(fontFamily: 'Kanit'),
                      ),
                      backgroundColor: AppTheme.primaryBlue,
                      behavior: SnackBarBehavior.floating,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                    ),
                  );
                },
                child: const Text(
                  'Suscribirse',
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          // Horario de atención
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: _bgLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _divider, width: 1),
            ),
            child: Row(
              children: [
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: _accentBlue.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.access_time_rounded,
                      color: _accentBlue, size: 18),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Horario de Atención',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: _textWhite,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Lun - Sáb: 8:00 AM - 6:00 PM',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        color: _textMuted,
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

  // ─── Barra de copyright inferior ──────────────────────────────────────────
  Widget _buildCopyrightBar() {
    return Container(
      color: _bgContact,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                '© 2026 ',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11,
                  color: _textMuted,
                ),
              ),
              Text(
                'FoamWash',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: _accentBlue,
                ),
              ),
              const Text(
                '. Todos los derechos reservados.',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11,
                  color: _textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              Text(
                'Hecho con ',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11,
                  color: _textMuted,
                ),
              ),
              Icon(Icons.favorite_rounded, color: Colors.redAccent, size: 12),
              Text(
                ' en Colombia',
                style: TextStyle(
                  fontFamily: 'Kanit',
                  fontSize: 11,
                  color: _textMuted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ─── Build principal ───────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Container(
      color: _bg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Barra de contacto superior
          _buildContactBar(),

          Container(height: 1, color: _divider),

          // 2. Logo + descripción + redes
          _buildBrandSection(),

          _buildSectionDivider(),

          // 3. Links rápidos + Servicios (dos columnas)
          _buildLinksAndServices(),

          _buildSectionDivider(),

          // 4. Newsletter + horario
          _buildNewsletterSection(),

          const SizedBox(height: 28),

          Container(height: 1, color: _divider),

          // 5. Copyright
          _buildCopyrightBar(),
        ],
      ),
    );
  }
}
