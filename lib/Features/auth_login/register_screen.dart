import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:foamwash/Features/auth_login/login_screen.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

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

  // ── Paleta FoamWash ──────────────────────────────────────────────────────
  static const Color _blue      = Color(0xFF1A56FF);
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
    // Validaciones
    if (emailController.text.isEmpty ||
        fullNameController.text.isEmpty ||
        phoneController.text.isEmpty ||
        passwordController.text.isEmpty) {
      setState(() { _message = 'Por favor completa los campos obligatorios.'; _isError = true; });
      return;
    }
    final phone = phoneController.text.trim();
    if (phone.length != 10 || !RegExp(r'^\d+$').hasMatch(phone)) {
      setState(() { _message = 'El teléfono debe tener exactamente 10 dígitos.'; _isError = true; });
      return;
    }
    if (passwordController.text.length < 6) {
      setState(() { _message = 'La contraseña debe tener al menos 6 caracteres.'; _isError = true; });
      return;
    }

    setState(() { _isLoading = true; _message = ''; });

    try {
      final response = await http.post(
        Uri.parse(ApiConstants.registerEndpoint),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'correo':    emailController.text.trim(),
          'nombre':    fullNameController.text.trim(),
          'telefono':  phone,
          'direccion': addressController.text.trim().isEmpty
              ? 'Sin dirección especificada'
              : addressController.text.trim(),
          'password':  passwordController.text,
        }),
      );
      if (!mounted) return;
      setState(() => _isLoading = false);
      if (response.statusCode == 200 || response.statusCode == 201) {
        setState(() { _message = '¡Usuario registrado correctamente!'; _isError = false; });
      } else {
        setState(() { _message = 'Error al registrar. Intenta de nuevo.'; _isError = true; });
      }
    } catch (_) {
      if (!mounted) return;
      setState(() { _isLoading = false; _message = 'Error de conexión. Verifica tu red.'; _isError = true; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4FF),
      body: Stack(
        children: [
          // ── Fondo: imagen + overlay ────────────────────────────────────
          Positioned.fill(
            child: Image.asset(
              'assets/fondo.png',
              fit: BoxFit.cover,
            ),
          ),
          Positioned.fill(
            child: Container(
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
          ),
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(-0.7, -0.5),
                  radius: 0.8,
                  colors: [Color(0x2E1A56FF), Colors.transparent],
                ),
              ),
            ),
          ),

          // ── Contenido ─────────────────────────────────────────────────
          SafeArea(
            child: FadeTransition(
              opacity: _fadeIn,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  children: [
                    const SizedBox(height: 36),

                    // Logo
                    const Text(
                      'FoamWash',
                      style: TextStyle(
                        fontFamily: 'Kanit',
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 0.5,
                        shadows: [
                          Shadow(
                            color: Color(0x667EB8FF),
                            blurRadius: 20,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // ── Tarjeta ────────────────────────────────────────
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.97),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.45),
                            blurRadius: 64,
                            offset: const Offset(0, 24),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Formulario
                            Padding(
                              padding: const EdgeInsets.fromLTRB(28, 32, 28, 24),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
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

                                  // Correo electrónico
                                  _InputField(
                                    controller: emailController,
                                    hint: 'Correo electrónico *',
                                    icon: Icons.email_outlined,
                                    keyboardType: TextInputType.emailAddress,
                                  ),
                                  const SizedBox(height: 12),

                                  // Nombre completo
                                  _InputField(
                                    controller: fullNameController,
                                    hint: 'Nombre completo *',
                                    icon: Icons.person_outline,
                                    keyboardType: TextInputType.name,
                                  ),
                                  const SizedBox(height: 12),

                                  // Teléfono
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

                                  // Dirección (opcional)
                                  _InputField(
                                    controller: addressController,
                                    hint: 'Dirección (opcional)',
                                    icon: Icons.location_on_outlined,
                                    keyboardType: TextInputType.streetAddress,
                                  ),
                                  const SizedBox(height: 12),

                                  // Contraseña
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
                              ),
                            ),

                            // Banner toggle — "¿Ya tienes cuenta?"
                            _ToggleBanner(
                              title: '¡Bienvenido de nuevo!',
                              subtitle: 'Si ya tienes una cuenta\npuedes iniciar sesión',
                              buttonLabel: 'Iniciar sesión',
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const LoginScreen()),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 36),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// WIDGETS REUTILIZABLES (duplicados aquí por independencia de archivos)
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
        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
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
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
          child: isLoading
              ? const SizedBox(
            height: 20,
            width: 20,
            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
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

class _ToggleBanner extends StatelessWidget {
  final String title;
  final String subtitle;
  final String buttonLabel;
  final VoidCallback onTap;

  const _ToggleBanner({
    required this.title,
    required this.subtitle,
    required this.buttonLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 22),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1A56FF), Color(0xFF3B82F6)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.3,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: Colors.white.withValues(alpha: 0.9),
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: const Color(0xFF1A56FF),
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
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