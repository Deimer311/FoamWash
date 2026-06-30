import 'package:flutter/material.dart';
import 'package:foamwash/Features/Autenticacion/register_screen.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController emailController    = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  bool _obscurePassword = true;
  bool _isLoading       = false;
  String _message       = '';
  bool _isError         = false;

  late AnimationController _animController;
  late Animation<double>   _fadeIn;

  // ── Paleta FoamWash (idéntica al web) ────────────────────────────────────
  static const Color _blue       = Color(0xFF1A56FF);
  static const Color _blueDark   = Color(0xFF0A1435);

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
    passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    final email = emailController.text.trim();
    final password = passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() { _message = 'Por favor completa todos los campos.'; _isError = true; });
      return;
    }
    setState(() { _isLoading = true; _message = ''; });
    
    try {
      // Usamos el AuthProvider que ahora maneja el Repositorio y Data Source
      await context.read<AuthProvider>().login(email, password);
      
      if (!mounted) return;
      setState(() => _isLoading = false);

      // Redirección basada en el rol del usuario
      final role = context.read<AuthProvider>().userRole;
      if (email == 'admin@gmail.com' || role == 'admin') {
        Navigator.pushNamedAndRemoveUntil(context, '/admin_dashboard', (route) => false);
      } else if (role == 'trabajador' || role == 'empleado') {
        Navigator.pushNamedAndRemoveUntil(context, '/empleado_agenda', (route) => false);
      } else {
        Navigator.pushNamedAndRemoveUntil(context, '/scheduling', (route) => false);
      }
    } catch (e) {
      if (!mounted) return;
      setState(() { 
        _isLoading = false; 
        _message = 'Credenciales incorrectas o error de conexión.'; 
        _isError = true; 
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F4FF),
      body: Stack(
        children: [
          // ── Fondo: imagen + overlay (igual que login.css) ──────────────
          Positioned.fill(
            child: Image.asset(
              'assets/fondo.png',
              fit: BoxFit.cover,
            ),
          ),
          // Overlay azul oscuro para dar protagonismo a los contenedores
          Positioned.fill(
            child: Container(
              color: const Color(0xCC071230), // azul muy oscuro, ~80% opacidad
            ),
          ),

          // ── Contenido principal ────────────────────────────────────────
          SafeArea(
            child: FadeTransition(
              opacity: _fadeIn,
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: MediaQuery.of(context).size.height,
                ),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      const SizedBox(height: 36),

                    // Logo FoamWash
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

                    // ── Tarjeta principal (card-wrapper web) ───────────────
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
                          BoxShadow(
                            color: Colors.white.withValues(alpha: 0.07),
                            blurRadius: 0,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [

                            // ── Formulario (form-side) ─────────────────────
                            Padding(
                              padding: const EdgeInsets.fromLTRB(28, 32, 28, 28),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Título con gradiente — igual que .title en login.css
                                  ShaderMask(
                                    shaderCallback: (bounds) => const LinearGradient(
                                      colors: [_blueDark, _blue],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ).createShader(bounds),
                                    child: const Text(
                                      'Iniciar sesión',
                                      style: TextStyle(
                                        fontFamily: 'Kanit',
                                        fontSize: 26,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.white,
                                        letterSpacing: -0.3,
                                      ),
                                    ),
                                  ),

                                  const SizedBox(height: 22),

                                  // Mensaje de error / éxito
                                  if (_message.isNotEmpty) ...[
                                    _MessageBanner(message: _message, isError: _isError),
                                    const SizedBox(height: 14),
                                  ],

                                  // Email
                                  _InputField(
                                    controller: emailController,
                                    hint: 'Correo electrónico',
                                    icon: Icons.email_outlined,
                                    keyboardType: TextInputType.emailAddress,
                                  ),
                                  const SizedBox(height: 14),

                                  // Contraseña
                                  _InputField(
                                    controller: passwordController,
                                    hint: 'Contraseña',
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

                                  // ¿Olvidaste tu contraseña?
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: TextButton(
                                      onPressed: () {},
                                      style: TextButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        minimumSize: Size.zero,
                                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                      ),
                                      child: const Text(
                                        '¿Olvidaste tu contraseña?',
                                        style: TextStyle(
                                          fontFamily: 'Kanit',
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: _blue,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 8),

                                  // Botón Iniciar sesión
                                  _SubmitButton(
                                    label: 'Iniciar sesión',
                                    isLoading: _isLoading,
                                    onPressed: _login,
                                  ),
                                ],
                              ),
                            ),

                            // ── Franja toggle (toggle-side azul) ──────────
                            _ToggleBanner(
                              title: '¡Hola amig@!',
                              subtitle: 'Si no tienes una cuenta\npuedes crear una nueva',
                              buttonLabel: 'Registrar',
                              onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => const RegisterScreen()),
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
        ),
        ],
      ),
    );
  }
}

// =============================================================================
// WIDGETS REUTILIZABLES
// =============================================================================

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  final bool obscure;
  final Widget? suffix;
  final TextInputType? keyboardType;

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
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      style: const TextStyle(
        fontFamily: 'Kanit',
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: Color(0xFF111111),
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(
          fontFamily: 'Kanit',
          color: Color(0xFFAABBCC),
          fontSize: 14,
        ),
        prefixIcon: Icon(icon, color: const Color(0xFF1A56FF), size: 20),
        suffixIcon: suffix != null
            ? Padding(padding: const EdgeInsets.only(right: 12), child: suffix)
            : null,
        suffixIconConstraints: const BoxConstraints(minWidth: 0, minHeight: 0),
        filled: true,
        fillColor: _bgField,
        contentPadding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
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

/// Banner inferior azul con título, subtítulo y botón blanco
/// Equivale al "toggle-side" del diseño web
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