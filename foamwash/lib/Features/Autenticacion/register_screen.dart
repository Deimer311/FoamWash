import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:foamwash/Features/Autenticacion/login_screen.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController emailController    = TextEditingController();
  final TextEditingController fullNameController = TextEditingController();
  final TextEditingController phoneController    = TextEditingController();
  final TextEditingController addressController  = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading       = false;
  String _message       = '';
  bool _isError         = false;

  late AnimationController _animController;
  late Animation<double>   _fadeIn;

  // ── Paleta FoamWash (idéntica a la web — login.css) ──────────────────────
  static const Color _blue      = Color(0xFF1A56FF);
  static const Color _blueLight = Color(0xFF3B82F6);
  static const Color _blueDark  = Color(0xFF0A1435);

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 700));
    _fadeIn = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    emailController.dispose();
    fullNameController.dispose();
    phoneController.dispose();
    addressController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> _register() async {
    // Validaciones (sin cambios de lógica respecto al original)
    if (emailController.text.isEmpty ||
        fullNameController.text.isEmpty ||
        phoneController.text.isEmpty ||
        passwordController.text.isEmpty) {
      setState(() {
        _message = 'Por favor completa los campos obligatorios.';
        _isError = true;
      });
      return;
    }
    final phone = phoneController.text.trim();
    if (phone.length != 10 || !RegExp(r'^\d+$').hasMatch(phone)) {
      setState(() {
        _message = 'El teléfono debe tener exactamente 10 dígitos.';
        _isError = true;
      });
      return;
    }
    if (passwordController.text.length < 6) {
      setState(() {
        _message = 'La contraseña debe tener al menos 6 caracteres.';
        _isError = true;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _message = '';
    });

    try {
      await context.read<AuthProvider>().register(
            email: emailController.text.trim(),
            nombre: fullNameController.text.trim(),
            telefono: phone,
            direccion: addressController.text.trim().isEmpty
                ? 'Sin dirección especificada'
                : addressController.text.trim(),
            password: passwordController.text,
          );

      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _message = '¡Usuario registrado correctamente!';
        _isError = false;
      });

      // Opcional: Navegar al login después de un registro exitoso
      // Future.delayed(Duration(seconds: 2), () => Navigator.pop(context));
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _message = 'Error al registrar: $e';
        _isError = true;
      });
    }
  }

  // FoamWash título → Index (mismo comportamiento que LoginScreen)
  void _goToIndex() {
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  void _goToLogin() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLandscape =
        MediaQuery.of(context).orientation == Orientation.landscape;

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      body: Stack(
        children: [
          Positioned.fill(
            child: Image.asset('assets/fondo.png', fit: BoxFit.cover),
          ),
          SafeArea(
            child: FadeTransition(
              opacity: _fadeIn,
              child: isLandscape
                  ? _buildLandscape(context)
                  : _buildPortrait(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLogo() {
    return GestureDetector(
      onTap: _goToIndex,
      behavior: HitTestBehavior.opaque,
      child: const Text(
        'FoamWash',
        style: TextStyle(
          fontFamily: 'Kanit',
          fontSize: 36,
          fontWeight: FontWeight.w900,
          color: Colors.white,
          letterSpacing: 0.5,
          shadows: [
            Shadow(color: Color(0x99000000), blurRadius: 16),
            Shadow(color: Color(0x667EB8FF), blurRadius: 20),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // PORTRAIT — banner azul (¡Bienvenido de nuevo!) arriba, formulario abajo
  // ===========================================================================
  Widget _buildPortrait(BuildContext context) {
    return ConstrainedBox(
      constraints:
          BoxConstraints(minHeight: MediaQuery.of(context).size.height),
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          children: [
            const SizedBox(height: 36),
            _buildLogo(),
            const SizedBox(height: 32),
            Container(
              decoration: _cardDecoration(),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _ToggleBanner(
                      title: '¡Bienvenido de nuevo!',
                      subtitle:
                          'Si ya tienes una cuenta\npuedes iniciar sesión',
                      buttonLabel: 'Iniciar sesión',
                      background: const LinearGradient(
                        colors: [_blue, _blueLight],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      textColor: Colors.white,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(24),
                        topRight: Radius.circular(24),
                      ),
                      onTap: _goToLogin,
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(28, 32, 28, 28),
                      child: _buildFormFields(),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 36),
          ],
        ),
      ),
    );
  }

  // ===========================================================================
  // LANDSCAPE — dos columnas: formulario izquierda / banner azul derecha
  // ===========================================================================
  Widget _buildLandscape(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final cardWidth  = size.width  > 860 ? 840.0 : size.width * 0.92;
    final cardHeight = size.height > 600 ? 540.0 : size.height * 0.92;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildLogo(),
            const SizedBox(height: 18),
            Container(
              width: cardWidth,
              height: cardHeight,
              decoration: _cardDecoration(),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: Container(
                        color: Colors.white.withOpacity(0.97),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 36, vertical: 20),
                        child: Center(
                          child: SingleChildScrollView(
                            child: _buildFormFields(),
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: _ToggleBanner(
                        title: '¡Bienvenido de nuevo!',
                        subtitle:
                            'Si ya tienes una cuenta\npuedes iniciar sesión',
                        buttonLabel: 'Iniciar sesión',
                        background: const LinearGradient(
                          colors: [_blue, _blueLight],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        textColor: Colors.white,
                        borderRadius: BorderRadius.zero,
                        onTap: _goToLogin,
                        fillHeight: true,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white.withOpacity(0.97),
      borderRadius: BorderRadius.circular(24),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.45),
          blurRadius: 64,
          offset: const Offset(0, 24),
        ),
      ],
    );
  }

  Widget _buildFormFields() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        ShaderMask(
          shaderCallback: (bounds) => const LinearGradient(
            colors: [_blueDark, _blue],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ).createShader(bounds),
          child: const Text(
            'Regístrate',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 26,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.3,
            ),
          ),
        ),
        const SizedBox(height: 20),
        if (_message.isNotEmpty) ...[
          _MessageBanner(message: _message, isError: _isError),
          const SizedBox(height: 14),
        ],
        _InputField(
          controller: emailController,
          hint: 'Correo electrónico *',
          icon: Icons.email_outlined,
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: 12),
        _InputField(
          controller: fullNameController,
          hint: 'Nombre completo *',
          icon: Icons.person_outline,
          keyboardType: TextInputType.name,
        ),
        const SizedBox(height: 12),
        _InputField(
          controller: phoneController,
          hint: 'Teléfono (10 dígitos) *',
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(10),
          ],
        ),
        const SizedBox(height: 12),
        _InputField(
          controller: addressController,
          hint: 'Dirección (opcional)',
          icon: Icons.location_on_outlined,
          keyboardType: TextInputType.streetAddress,
        ),
        const SizedBox(height: 12),
        _InputField(
          controller: passwordController,
          hint: 'Contraseña (mín. 6 caracteres) *',
          icon: Icons.lock_outline,
          obscure: _obscurePassword,
          suffix: GestureDetector(
            onTap: () => setState(() => _obscurePassword = !_obscurePassword),
            child: Icon(
              _obscurePassword
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined,
              color: const Color(0xFFAABBCC),
              size: 20,
            ),
          ),
        ),
        const SizedBox(height: 20),
        _SubmitButton(
          label: 'Registrar',
          isLoading: _isLoading,
          onPressed: _register,
        ),
      ],
    );
  }
}

// =============================================================================
// WIDGETS REUTILIZABLES (idénticos en espíritu a login_screen.dart)
// =============================================================================

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final bool obscure;
  final Widget? suffix;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;

  static const Color _blue      = Color(0xFF1A56FF);
  static const Color _bgField   = Color(0xFFF8F9FF);
  static const Color _borderCol = Color(0xFFE0E4EF);

  const _InputField({
    required this.controller,
    required this.hint,
    required this.icon,
    this.obscure = false,
    this.suffix,
    this.keyboardType,
    this.inputFormatters,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      inputFormatters: inputFormatters,
      style: const TextStyle(
        fontFamily: 'Kanit',
        fontSize: 13,
        fontWeight: FontWeight.w400,
        color: Color(0xFF111111),
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(
          fontFamily: 'Kanit',
          color: Color(0xFFAABBCC),
          fontSize: 13,
        ),
        prefixIcon: Icon(icon, color: _blue, size: 20),
        suffixIcon: suffix != null
            ? Padding(padding: const EdgeInsets.only(right: 12), child: suffix)
            : null,
        suffixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        filled: true,
        fillColor: _bgField,
        contentPadding:
            const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _borderCol, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _borderCol, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _blue, width: 1.5),
        ),
      ),
    );
  }
}

class _SubmitButton extends StatelessWidget {
  final String label;
  final bool isLoading;
  final VoidCallback onPressed;

  const _SubmitButton({
    required this.label,
    required this.isLoading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: isLoading
              ? null
              : const LinearGradient(
                  colors: [Color(0xFF1A56FF), Color(0xFF3B82F6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          color: isLoading ? const Color(0xFF6B8CFF) : null,
          borderRadius: BorderRadius.circular(12),
          boxShadow: isLoading
              ? []
              : [
                  const BoxShadow(
                    color: Color(0x591A56FF),
                    blurRadius: 16,
                    offset: Offset(0, 4),
                  ),
                ],
        ),
        child: ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            foregroundColor: Colors.white,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                      color: Colors.white, strokeWidth: 2.5),
                )
              : Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.2,
                  ),
                ),
        ),
      ),
    );
  }
}

class _MessageBanner extends StatelessWidget {
  final String message;
  final bool isError;

  const _MessageBanner({required this.message, required this.isError});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
      decoration: BoxDecoration(
        color: isError ? const Color(0xFFFEF2F2) : const Color(0xFFDCFCE7),
        borderRadius: BorderRadius.circular(10),
        border: Border(
          left: BorderSide(
            color: isError ? const Color(0xFFEF4444) : const Color(0xFF22C55E),
            width: 3,
          ),
        ),
      ),
      child: Text(
        message,
        style: TextStyle(
          fontFamily: 'Kanit',
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: isError ? const Color(0xFFB91C1C) : const Color(0xFF15803D),
        ),
      ),
    );
  }
}

/// Idéntico a _ToggleBanner de login_screen.dart — duplicado intencional
/// para mantener ambos archivos independientes (sin crear un archivo
/// compartido nuevo, ya que no fue solicitado y podría romper imports
/// existentes en otros lugares del proyecto).
class _ToggleBanner extends StatelessWidget {
  final String title;
  final String subtitle;
  final String buttonLabel;
  final Gradient? background;
  final Color? solidColor;
  final Color textColor;
  final BorderRadius borderRadius;
  final VoidCallback onTap;
  final bool fillHeight;
  final Border? border;

  const _ToggleBanner({
    required this.title,
    required this.subtitle,
    required this.buttonLabel,
    this.background,
    this.solidColor,
    required this.textColor,
    required this.borderRadius,
    required this.onTap,
    this.fillHeight = false,
    this.border,
  });

  static const Color _blue = Color(0xFF1A56FF);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      decoration: BoxDecoration(
        gradient: background,
        color: background == null ? (solidColor ?? Colors.white) : null,
        borderRadius: borderRadius,
        border: border,
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisSize: fillHeight ? MainAxisSize.max : MainAxisSize.min,
        children: [
          Text(
            title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: textColor,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 14,
              fontWeight: FontWeight.w400,
              color: textColor.withOpacity(0.9),
              height: 1.5,
            ),
          ),
          const SizedBox(height: 22),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: _blue,
              elevation: 4,
              shadowColor: Colors.black.withOpacity(0.15),
              padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(50),
              ),
            ),
            child: Text(
              buttonLabel,
              style: const TextStyle(
                fontFamily: 'Kanit',
                fontWeight: FontWeight.w700,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}