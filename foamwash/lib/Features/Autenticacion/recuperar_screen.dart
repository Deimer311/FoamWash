import 'package:flutter/material.dart';
import 'package:foamwash/Features/Autenticacion/login_screen.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:foamwash/Features/Autenticacion/data/repositories/auth_repository.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

class RecuperarScreen extends StatefulWidget {
  const RecuperarScreen({super.key});

  @override
  State<RecuperarScreen> createState() => _RecuperarScreenState();
}

class _RecuperarScreenState extends State<RecuperarScreen>
    with SingleTickerProviderStateMixin {
  // ── Paleta FoamWash (idéntica a recuperar_estilos.css :root) ─────────────
  static const Color _primary      = Color(0xFF1A56FF);
  static const Color _primaryDark  = Color(0xFF1240CC);
  static const Color _secondary    = Color(0xFF7C3AED);
  static const Color _textDark     = Color(0xFF0A1435);
  static const Color _textMedium   = Color(0xFF555555);
  static const Color _textLight    = Color(0xFF999999);
  static const Color _errorRed     = Color(0xFFEF4444);
  static const Color _successGreen = Color(0xFF16A34A);
  static const Color _border       = Color(0xFFE0E4EF);

  int _step = 1;

  final TextEditingController emailController           = TextEditingController();
  final TextEditingController codeController             = TextEditingController();
  final TextEditingController newPasswordController      = TextEditingController();
  final TextEditingController confirmPasswordController  = TextEditingController();

  String _error   = '';
  String _success = '';
  bool _isLoading  = false;

  late AnimationController _animController;
  late Animation<double> _fadeIn;

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
    codeController.dispose();
    newPasswordController.dispose();
    confirmPasswordController.dispose();
    super.dispose();
  }

  // ───────────────────────────────────────────────────────────────────────
  // PASO 1: Solicitar código al backend
  // ───────────────────────────────────────────────────────────────────────
  Future<void> _handleSendCode() async {
    setState(() {
      _error = '';
      _success = '';
      _isLoading = true;
    });

    final email = emailController.text.trim();

    if (email.isEmpty) {
      setState(() {
        _error = 'Por favor ingresa tu correo';
        _isLoading = false;
      });
      return;
    }

    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    if (!emailRegex.hasMatch(email)) {
      setState(() {
        _error = 'Por favor ingresa un correo válido';
        _isLoading = false;
      });
      return;
    }

    try {
      final repository = context.read<AuthProvider>().repository;
      await repository.requestPasswordReset(email);

      if (!mounted) return;
      setState(() => _success = 'Código enviado a $email');
      await Future.delayed(const Duration(milliseconds: 1500));
      if (!mounted) return;
      setState(() {
        _step = 2;
        _success = '';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // PASO 2: Verificar código con el backend
  // ───────────────────────────────────────────────────────────────────────
  Future<void> _handleVerifyCode() async {
    setState(() {
      _error = '';
      _success = '';
      _isLoading = true;
    });

    final code = codeController.text.trim();

    if (code.isEmpty) {
      setState(() {
        _error = 'Por favor ingresa el código';
        _isLoading = false;
      });
      return;
    }

    if (code.length != 6) {
      setState(() {
        _error = 'El código debe tener 6 dígitos';
        _isLoading = false;
      });
      return;
    }

    try {
      final repository = context.read<AuthProvider>().repository;
      await repository.verifyResetCode(emailController.text.trim(), code);

      if (!mounted) return;
      setState(() => _success = '¡Código verificado correctamente!');
      await Future.delayed(const Duration(milliseconds: 1000));
      if (!mounted) return;
      setState(() {
        _step = 3;
        _success = '';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // PASO 3: Cambiar contraseña en el backend
  // ───────────────────────────────────────────────────────────────────────
  Future<void> _handleChangePassword() async {
    setState(() {
      _error = '';
      _success = '';
      _isLoading = true;
    });

    final newPassword = newPasswordController.text;
    final confirmPassword = confirmPasswordController.text;

    if (newPassword.isEmpty || confirmPassword.isEmpty) {
      setState(() {
        _error = 'Por favor completa todos los campos';
        _isLoading = false;
      });
      return;
    }

    if (newPassword != confirmPassword) {
      setState(() {
        _error = 'Las contraseñas no coinciden';
        _isLoading = false;
      });
      return;
    }

    if (newPassword.length < 6) {
      setState(() {
        _error = 'La contraseña debe tener al menos 6 caracteres';
        _isLoading = false;
      });
      return;
    }

    try {
      final repository = context.read<AuthProvider>().repository;
      await repository.resetPassword(
        emailController.text.trim(),
        codeController.text.trim(),
        newPassword,
      );

      if (!mounted) return;
      setState(() => _success = '¡Contraseña cambiada exitosamente!');
      await Future.delayed(const Duration(milliseconds: 1500));
      if (!mounted) return;
      _goToLogin();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _handleUseOtherEmail() {
    setState(() {
      _step = 1;
      emailController.clear();
      codeController.clear();
      _error = '';
      _success = '';
      _isLoading = false;
    });
  }

  void _goToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  void _goToIndex() {
    Navigator.of(context).popUntil((route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    final isLandscape =
        MediaQuery.of(context).orientation == Orientation.landscape;

    return Scaffold(
      backgroundColor: const Color(0xFFF6F7FB),
      body: Stack(
        children: [
          // Fondo + overlay oscuro semitransparente con blur,
          // igual que .recuperar-background::before en recuperar_estilos.css
          Positioned.fill(
            child: Image.asset('assets/fondo.png', fit: BoxFit.cover),
          ),
          Positioned.fill(
            child: Container(color: const Color(0x8C08102E)),
          ),

          SafeArea(
            child: FadeTransition(
              opacity: _fadeIn,
              child: Center(
                child: SingleChildScrollView(
                  padding: EdgeInsets.symmetric(
                    horizontal: isLandscape ? 40 : 24,
                    vertical: 24,
                  ),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 460),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Logo — lleva al Index
                        GestureDetector(
                          onTap: _goToIndex,
                          behavior: HitTestBehavior.opaque,
                          child: const Text(
                            'FoamWash',
                            style: TextStyle(
                              fontFamily: 'Kanit',
                              fontSize: 32,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.5,
                              shadows: [
                                Shadow(
                                  color: Color(0x4D000000),
                                  blurRadius: 12,
                                  offset: Offset(0, 2),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),

                        // Card principal
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.fromLTRB(28, 32, 28, 28),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.22),
                                blurRadius: 64,
                                offset: const Offset(0, 24),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              _buildStepIndicator(),
                              const SizedBox(height: 28),
                              if (_step == 1) _buildStep1(),
                              if (_step == 2) _buildStep2(),
                              if (_step == 3) _buildStep3(),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ===========================================================================
  // INDICADOR DE PASOS — 1 Correo · 2 Código · 3 Nueva Contraseña
  // ===========================================================================
  Widget _buildStepIndicator() {
    return Row(
      children: [
        Expanded(child: _stepCircle(1, 'Correo')),
        _stepLine(),
        Expanded(child: _stepCircle(2, 'Código')),
        _stepLine(),
        Expanded(child: _stepCircle(3, 'Nueva\nContraseña')),
      ],
    );
  }

  Widget _stepCircle(int number, String label) {
    final isActive = _step >= number;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 40,
          height: 40,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: isActive
                ? const LinearGradient(colors: [_primary, _secondary])
                : null,
            color: isActive ? null : const Color(0xFFF0F2FF),
            border: isActive
                ? null
                : Border.all(color: _border, width: 2),
            boxShadow: isActive
                ? [
                    BoxShadow(
                      color: _primary.withOpacity(0.35),
                      blurRadius: 14,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : null,
          ),
          child: Text(
            '$number',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontWeight: FontWeight.w700,
              fontSize: 15,
              color: isActive ? Colors.white : _textLight,
            ),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 11,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? _primary : _textLight,
            letterSpacing: 0.2,
          ),
        ),
      ],
    );
  }

  Widget _stepLine() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 22),
      child: Container(
        width: 24,
        height: 2,
        color: _border,
      ),
    );
  }

  // ===========================================================================
  // PASO 1 — Ingresar correo
  // ===========================================================================
  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Text(
          'Recuperar contraseña',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: _textDark,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Ingresa tu correo electrónico y te enviaremos\nun código para restablecer tu contraseña',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 14,
            color: _textMedium,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 22),
        _buildInput(
          controller: emailController,
          hint: 'Correo electrónico',
          keyboardType: TextInputType.emailAddress,
          enabled: !_isLoading,
        ),
        if (_error.isNotEmpty) _buildErrorBanner(_error),
        if (_success.isNotEmpty) _buildSuccessBanner(_success),
        const SizedBox(height: 6),
        TextButton(
          onPressed: _isLoading ? null : _goToLogin,
          child: const Text(
            '← Volver al inicio de sesión',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _primary,
            ),
          ),
        ),
        const SizedBox(height: 6),
        _buildSubmitButton(
          label: _isLoading ? '📧 Enviando...' : 'Enviar código',
          onPressed: _isLoading ? null : _handleSendCode,
        ),
      ],
    );
  }

  // ===========================================================================
  // PASO 2 — Ingresar código (OTP de 6 dígitos)
  // ===========================================================================
  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Text(
          'Ingresa tu código',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: _textDark,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 8),
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: const TextStyle(
              fontFamily: 'Kanit',
              fontSize: 14,
              color: _textMedium,
              height: 1.5,
            ),
            children: [
              const TextSpan(text: 'Ingresa el código de 6 dígitos enviado a '),
              TextSpan(
                text: emailController.text.trim(),
                style: const TextStyle(
                  color: _primary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 22),
        TextField(
          controller: codeController,
          textAlign: TextAlign.center,
          keyboardType: TextInputType.number,
          maxLength: 6,
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: _primary,
            letterSpacing: 8,
          ),
          decoration: InputDecoration(
            counterText: '',
            hintText: '000000',
            hintStyle: const TextStyle(
              fontFamily: 'Kanit',
              fontSize: 26,
              letterSpacing: 8,
              color: Color(0xFFC7D2FE),
            ),
            filled: true,
            fillColor: const Color(0xFFF0F4FF),
            contentPadding:
                const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFC7D2FE), width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFC7D2FE), width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: _primary, width: 1.5),
            ),
          ),
        ),
        if (_error.isNotEmpty) _buildErrorBanner(_error),
        if (_success.isNotEmpty) _buildSuccessBanner(_success),
        const SizedBox(height: 6),
        TextButton(
          onPressed: _handleUseOtherEmail,
          child: const Text(
            '← Usar otro correo',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _primary,
            ),
          ),
        ),
        const SizedBox(height: 6),
        _buildSubmitButton(
          label: _isLoading ? 'Verificando...' : 'Verificar código',
          onPressed: _isLoading ? null : _handleVerifyCode,
        ),
      ],
    );
  }

  // ===========================================================================
  // PASO 3 — Nueva contraseña
  // ===========================================================================
  Widget _buildStep3() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const Text(
          'Nueva contraseña',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: _textDark,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Ingresa tu nueva contraseña y confírmala\n(Mínimo 6 caracteres)',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 14,
            color: _textMedium,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 22),
        _buildInput(
          controller: newPasswordController,
          hint: 'Nueva contraseña',
          obscure: true,
          enabled: !_isLoading,
        ),
        const SizedBox(height: 12),
        _buildInput(
          controller: confirmPasswordController,
          hint: 'Confirmar contraseña',
          obscure: true,
          enabled: !_isLoading,
        ),
        if (_error.isNotEmpty) _buildErrorBanner(_error),
        if (_success.isNotEmpty) _buildSuccessBanner(_success),
        const SizedBox(height: 6),
        TextButton(
          onPressed: _handleUseOtherEmail,
          child: const Text(
            '← Usar otro correo',
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _primary,
            ),
          ),
        ),
        const SizedBox(height: 6),
        _buildSubmitButton(
          label: _isLoading ? 'Cambiando...' : 'Cambiar contraseña',
          onPressed: _isLoading ? null : _handleChangePassword,
        ),
      ],
    );
  }

  // ===========================================================================
  // ELEMENTOS COMPARTIDOS — input, botón, banners de error/éxito
  // ===========================================================================
  Widget _buildInput({
    required TextEditingController controller,
    required String hint,
    bool obscure = false,
    TextInputType? keyboardType,
    bool enabled = true,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      enabled: enabled,
      style: const TextStyle(
        fontFamily: 'Kanit',
        fontSize: 14,
        color: _textDark,
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(
          fontFamily: 'Kanit',
          color: Color(0xFFBBBBBB),
          fontSize: 14,
        ),
        filled: true,
        fillColor: const Color(0xFFF8F9FF),
        contentPadding:
            const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _border, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _border, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: _primary, width: 1.5),
        ),
      ),
    );
  }

  Widget _buildErrorBanner(String message) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
        decoration: BoxDecoration(
          color: const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(10),
          border: const Border(left: BorderSide(color: _errorRed, width: 3)),
        ),
        child: Text(
          '❌ $message',
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: _errorRed,
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessBanner(String message) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
        decoration: BoxDecoration(
          color: const Color(0xFFEFFAF1),
          borderRadius: BorderRadius.circular(10),
          border:
              const Border(left: BorderSide(color: _successGreen, width: 3)),
        ),
        child: Text(
          '✅ $message',
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: _successGreen,
          ),
        ),
      ),
    );
  }

  Widget _buildSubmitButton({
    required String label,
    required VoidCallback? onPressed,
  }) {
    final isDisabled = onPressed == null;
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: isDisabled
              ? const LinearGradient(colors: [Color(0xFF9BA8C0), Color(0xFFBCC0CC)])
              : const LinearGradient(colors: [_primary, _secondary]),
          borderRadius: BorderRadius.circular(12),
          boxShadow: isDisabled
              ? []
              : [
                  BoxShadow(
                    color: _primary.withOpacity(0.3),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
        ),
        child: ElevatedButton(
          onPressed: onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            foregroundColor: Colors.white,
            disabledForegroundColor: Colors.white,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: 'Kanit',
              fontSize: 15,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }
}