// =============================================================================
// ARCHIVO  : perfil_cliente_edit.dart
// PROYECTO : FoamWash (versión móvil — Flutter)
// NOTA     : Replica el diseño de PerfilClienteEdi.jsx y usa el header premium unificado.
// =============================================================================

import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Cart/providers/cart_provider.dart';

class PerfilClienteEditScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;
  const PerfilClienteEditScreen({Key? key, required this.apiBaseUrl, required this.userId}) : super(key: key);

  @override
  State<PerfilClienteEditScreen> createState() => _PerfilClienteEditScreenState();
}

class _PerfilClienteEditScreenState extends State<PerfilClienteEditScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  final _nombreCtrl    = TextEditingController();
  final _correoCtrl    = TextEditingController();
  final _telefonoCtrl  = TextEditingController();
  final _direccionCtrl = TextEditingController();
  final _docCtrl       = TextEditingController();
  
  // Campos visuales de contraseña para emular la web
  final _passwordActualCtrl    = TextEditingController();
  final _passwordNuevaCtrl     = TextEditingController();
  final _passwordConfirmarCtrl = TextEditingController();

  String? _fotoUrl;
  bool _isLoading = true;
  bool _isSaving  = false;
  File? _imageFile;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  @override
  void dispose() {
    _nombreCtrl.dispose();
    _correoCtrl.dispose();
    _telefonoCtrl.dispose();
    _direccionCtrl.dispose();
    _docCtrl.dispose();
    _passwordActualCtrl.dispose();
    _passwordNuevaCtrl.dispose();
    _passwordConfirmarCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final uri = Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}');
      final resp = await http.get(
        uri, 
        headers: {
          'Authorization': 'Bearer $token',
          'ngrok-skip-browser-warning': 'true',
        },
      );
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body)['data'];
        if (data != null && mounted) {
          setState(() {
            _nombreCtrl.text    = data['Nombre']      ?? '';
            _correoCtrl.text    = data['Correo']      ?? '';
            _telefonoCtrl.text  = data['Telefono']    ?? '';
            _direccionCtrl.text = data['Direccion']   ?? '';
            _docCtrl.text       = data['N_Documento'] ?? '';
            _fotoUrl            = data['foto_perfil'];
          });
        }
      }
    } catch (e) {
      debugPrint('Error al cargar perfil cliente: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _pickImage() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (picked != null && mounted) {
      setState(() => _imageFile = File(picked.path));
    }
  }

  Future<void> _guardar() async {
    if (!_formKey.currentState!.validate()) return;
    
    // Validación visual de contraseñas si el usuario intenta escribirlas
    if (_passwordNuevaCtrl.text.isNotEmpty && 
        _passwordNuevaCtrl.text != _passwordConfirmarCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('❌ Las contraseñas nuevas no coinciden.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';

      // 1. Subir imagen si se seleccionó una nueva
      if (_imageFile != null) {
        final imgUri = Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}/foto');
        final request = http.MultipartRequest('POST', imgUri);
        request.headers['Authorization'] = 'Bearer $token';
        request.headers['ngrok-skip-browser-warning'] = 'true';
        request.files.add(await http.MultipartFile.fromPath('foto', _imageFile!.path));
        final imgResp = await request.send();
        if (imgResp.statusCode == 200 || imgResp.statusCode == 201) {
          final body = jsonDecode(await imgResp.stream.bytesToString());
          if (mounted) setState(() => _fotoUrl = body['data']?['foto_perfil']);
        }
      }

      // 2. Actualizar datos del perfil
      final uri = Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}');
      final resp = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({
          'Nombre':       _nombreCtrl.text.trim(),
          'Correo':       _correoCtrl.text.trim(),
          'Telefono':     _telefonoCtrl.text.trim(),
          'Direccion':    _direccionCtrl.text.trim(),
          'N_Documento':  _docCtrl.text.trim(),
        }),
      );

      if (mounted) {
        if (resp.statusCode == 200 || resp.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Perfil actualizado correctamente'),
              backgroundColor: Color(0xFF22C55E),
            ),
          );
          if (_fotoUrl != null) {
            context.read<AuthProvider>().updateUserFoto(_fotoUrl!);
          }
          Navigator.pop(context, true);
        } else {
          final err = jsonDecode(resp.body);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('❌ Error: ${err['message'] ?? 'No se pudo guardar'}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('❌ Error de red: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showConfirmLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text(
          '¿Cerrar sesión?',
          style: TextStyle(color: Colors.white, fontFamily: 'Kanit', fontWeight: FontWeight.bold),
        ),
        content: const Text(
          '¿Está seguro de que desea cerrar su sesión actual?',
          style: TextStyle(color: Color(0xFF94A3B8), fontFamily: 'Kanit'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: Colors.white54, fontFamily: 'Kanit')),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF6B6B),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(context); // Cerrar diálogo
              await context.read<AuthProvider>().logout();
              if (mounted) {
                Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
              }
            },
            child: const Text('Cerrar Sesión', style: TextStyle(fontFamily: 'Kanit', fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  String _buildFotoUrl(String? foto) {
    if (foto == null || foto.isEmpty) return '';
    if (foto.startsWith('http')) return foto;
    final base = ApiConstants.baseUrl.endsWith('/api')
        ? ApiConstants.baseUrl.substring(0, ApiConstants.baseUrl.length - 4)
        : ApiConstants.baseUrl;
    return '$base$foto';
  }

  @override
  Widget build(BuildContext context) {
    final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: FWColors.background,
      drawer: isLandscape ? null : _buildDrawer(auth),
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(isLandscape),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: FWColors.primaryBlue))
                  : SingleChildScrollView(
                      padding: isLandscape
                          ? const EdgeInsets.symmetric(horizontal: 40, vertical: 32)
                          : const EdgeInsets.all(16),
                      child: Form(
                        key: _formKey,
                        child: isLandscape
                            ? Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  _buildSidebarEditCard(isLandscape: true),
                                  const SizedBox(width: 28),
                                  Expanded(
                                    child: Column(
                                      children: [
                                        _buildEditarPerfilHeader(),
                                        const SizedBox(height: 20),
                                        _buildFotoPerfilCard(),
                                        const SizedBox(height: 20),
                                        _buildInfoPersonalCard(true),
                                        const SizedBox(height: 20),
                                        _buildCambiarPasswordCard(true),
                                        const SizedBox(height: 20),
                                        _buildButtonsCard(),
                                      ],
                                    ),
                                  ),
                                ],
                              )
                            : Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  _buildSidebarEditCard(isLandscape: false),
                                  const SizedBox(height: 20),
                                  _buildEditarPerfilHeader(),
                                  const SizedBox(height: 20),
                                  _buildFotoPerfilCard(),
                                  const SizedBox(height: 20),
                                  _buildInfoPersonalCard(false),
                                  const SizedBox(height: 20),
                                  _buildCambiarPasswordCard(false),
                                  const SizedBox(height: 20),
                                  _buildButtonsCard(),
                                ],
                              ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppBar(bool isLandscape) {
    return Container(
      height: 64,
      decoration: const BoxDecoration(
        color: Color(0xFF080C1E),
        border: Border(
          bottom: BorderSide(color: Color(0x1AFFFFFF), width: 1),
        ),
      ),
      padding: EdgeInsets.symmetric(horizontal: isLandscape ? 40 : 16),
      child: Row(
        children: [
          // Botón hamburguesa (solo en Portrait)
          if (!isLandscape) ...[
            IconButton(
              icon: const Icon(Icons.menu_rounded, color: Colors.white, size: 24),
              onPressed: () => _scaffoldKey.currentState?.openDrawer(),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
            const SizedBox(width: 12),
          ],

          // Logo e Identidad (FoamWashCL)
          GestureDetector(
            onTap: () => Navigator.pushReplacementNamed(context, '/home'),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                    ),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                  ),
                ),
                const SizedBox(width: 8),
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(
                        text: 'FoamWash',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                      ),
                      TextSpan(
                        text: 'CL',
                        style: TextStyle(
                          fontFamily: 'Kanit',
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0099FF),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Navegación central (solo en Landscape)
          if (isLandscape) ...[
            const Spacer(),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildNavButton(
                  icon: Icons.home_outlined,
                  label: 'Hogar',
                  isActive: false,
                  onTap: () => Navigator.pushReplacementNamed(context, '/home'),
                ),
                const SizedBox(width: 12),
                _buildNavButton(
                  icon: Icons.description_outlined,
                  label: 'Cotización',
                  isActive: false,
                  onTap: () => Navigator.pushNamed(context, '/cliente-cotizacion'),
                ),
                const SizedBox(width: 12),
                _buildNavButton(
                  icon: Icons.cleaning_services_outlined,
                  label: 'Agendar',
                  isActive: false,
                  onTap: () => Navigator.pushNamed(context, '/scheduling'),
                ),
              ],
            ),
          ],

          const Spacer(),

          // Sección Derecha: Carrito y Avatar con Menú Desplegable
          Row(
            children: [
              Consumer<CartProvider>(
                builder: (context, cart, child) {
                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white, size: 22),
                        onPressed: () => Navigator.pushNamed(context, '/cart'),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                      if (cart.itemCount > 0)
                        Positioned(
                          right: -6,
                          top: -6,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: Color(0xFF1E3A8A),
                              shape: BoxShape.circle,
                            ),
                            child: Text(
                              cart.itemCount.toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  );
                },
              ),
              const SizedBox(width: 16),

              // Avatar con PopupMenuButton Dropdown
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  final user = auth.user;
                  final fotoUrl = _buildFotoUrl(_fotoUrl ?? user?.fotoPerfil);

                  return PopupMenuButton<String>(
                    offset: const Offset(0, 48),
                    color: const Color(0xFA0A0E26), // rgba(10,14,38,0.97)
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: const BorderSide(color: Color(0x17FFFFFF), width: 1),
                    ),
                    elevation: 8,
                    onSelected: (value) {
                      if (value == 'perfil') {
                        // Ya estamos aquí, si viene de edit tal vez pop para volver a perfil
                        Navigator.pop(context);
                      } else if (value == 'agendamientos') {
                        Navigator.pushNamed(context, '/agendamientos');
                      } else if (value == 'cotizaciones') {
                        Navigator.pushNamed(context, '/mis_cotizaciones');
                      } else if (value == 'logout') {
                        _showConfirmLogoutDialog(context);
                      }
                    },
                    itemBuilder: (BuildContext context) => [
                      PopupMenuItem<String>(
                        enabled: false,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user?.nombre ?? 'Cliente',
                                style: const TextStyle(
                                  fontFamily: 'Kanit',
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              if (user?.correo != null) ...[
                                const SizedBox(height: 2),
                                Text(
                                  user!.correo,
                                  style: const TextStyle(
                                    fontFamily: 'Kanit',
                                    fontSize: 11,
                                    color: Colors.white54,
                                  ),
                                ),
                              ],
                              const SizedBox(height: 8),
                              const Divider(color: Color(0x12FFFFFF), height: 1),
                            ],
                          ),
                        ),
                      ),
                      _buildPopupItem(
                        value: 'perfil',
                        icon: Icons.person_outline_rounded,
                        label: 'Mi Perfil',
                        iconColor: const Color(0xFF0099FF),
                      ),
                      _buildPopupItem(
                        value: 'agendamientos',
                        icon: Icons.event_note_outlined,
                        label: 'Mis Agendamientos',
                        iconColor: const Color(0xFF0099FF),
                      ),
                      _buildPopupItem(
                        value: 'cotizaciones',
                        icon: Icons.description_outlined,
                        label: 'Mis Cotizaciones',
                        iconColor: const Color(0xFF0099FF),
                      ),
                      _buildPopupItem(
                        value: 'logout',
                        icon: Icons.logout_rounded,
                        label: 'Cerrar sesión',
                        iconColor: const Color(0xFFFF6B6B),
                        isLogout: true,
                      ),
                    ],
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: Colors.white.withOpacity(0.2),
                          width: 1.5,
                        ),
                      ),
                      child: FWAvatar(
                        fotoUrl: fotoUrl,
                        size: 32,
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildNavButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(7),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? const Color(0x2E0066FF) : Colors.transparent,
          borderRadius: BorderRadius.circular(7),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: Colors.white70, size: 14),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: 'Kanit',
                    fontSize: 13.5,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            if (isActive) ...[
              const SizedBox(height: 2),
              Container(
                width: 18,
                height: 2,
                decoration: BoxDecoration(
                  color: const Color(0xFF0099FF),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  PopupMenuItem<String> _buildPopupItem({
    required String value,
    required IconData icon,
    required String label,
    required Color iconColor,
    bool isLogout = false,
  }) {
    return PopupMenuItem<String>(
      value: value,
      height: 42,
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(7),
            ),
            child: Icon(icon, color: iconColor, size: 14),
          ),
          const SizedBox(width: 10),
          Text(
            label,
            style: TextStyle(
              fontFamily: 'Kanit',
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: isLogout ? const Color(0xFFFF6B6B) : Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(AuthProvider auth) {
    return Drawer(
      backgroundColor: const Color(0xFF080C1E),
      child: SafeArea(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: Color(0x1AFFFFFF), width: 1)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0066FF), Color(0xFF00B8FF)],
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.asset('assets/LogoFW.jpeg', fit: BoxFit.cover),
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'FoamWash',
                    style: TextStyle(
                      fontFamily: 'Kanit',
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildDrawerItem(
              icon: Icons.home_outlined,
              label: 'Inicio',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushReplacementNamed(context, '/home');
              },
            ),
            _buildDrawerItem(
              icon: Icons.description_outlined,
              label: 'Cotizar',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/cliente-cotizacion');
              },
            ),
            _buildDrawerItem(
              icon: Icons.cleaning_services_outlined,
              label: 'Agendar',
              isActive: false,
              onTap: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/scheduling');
              },
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Divider(color: Color(0x12FFFFFF)),
            ),
            if (auth.isAuthenticated) ...[
              _buildDrawerItem(
                icon: Icons.person_outline_rounded,
                label: 'Mi Perfil',
                isActive: true,
                onTap: () {
                  Navigator.pop(context);
                },
              ),
              _buildDrawerItem(
                icon: Icons.event_note_outlined,
                label: 'Mis Agendamientos',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/agendamientos');
                },
              ),
              _buildDrawerItem(
                icon: Icons.description_outlined,
                label: 'Mis Cotizaciones',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/mis_cotizaciones');
                },
              ),
              _buildDrawerItem(
                icon: Icons.logout_rounded,
                label: 'Cerrar Sesión',
                isActive: false,
                onTap: () {
                  Navigator.pop(context);
                  _showConfirmLogoutDialog(context);
                },
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      decoration: BoxDecoration(
        color: isActive ? const Color(0x1A0066FF) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        leading: Icon(icon, color: isActive ? const Color(0xFF0099FF) : Colors.white70, size: 20),
        title: Text(
          label,
          style: TextStyle(
            fontFamily: 'Kanit',
            fontSize: 14.5,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
            color: isActive ? const Color(0xFF0099FF) : Colors.white,
          ),
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildSidebarEditCard({required bool isLandscape}) {
    final fotoUrl = _imageFile != null ? '' : _buildFotoUrl(_fotoUrl);

    return Container(
      width: isLandscape ? 300 : double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 24),
      decoration: BoxDecoration(
        gradient: FWColors.sidebarGradient,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: FWColors.primaryBlue.withOpacity(0.28),
            blurRadius: 40,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: -50,
            right: -50,
            child: fwDecorativeCircle(180),
          ),
          Positioned(
            bottom: -40,
            left: -40,
            child: fwDecorativeCircle(120),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: _pickImage,
                child: Stack(
                  children: [
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withOpacity(0.15),
                        border: Border.all(color: Colors.white.withOpacity(0.5), width: 3),
                        boxShadow: const [
                          BoxShadow(color: Colors.black26, blurRadius: 16, offset: Offset(0, 8)),
                        ],
                      ),
                      child: ClipOval(
                        child: _imageFile != null
                            ? Image.file(_imageFile!, fit: BoxFit.cover)
                            : (fotoUrl.isNotEmpty
                                ? Image.network(
                                    fotoUrl,
                                    fit: BoxFit.cover,
                                    headers: const {'ngrok-skip-browser-warning': 'true'},
                                    errorBuilder: (_, __, ___) =>
                                        const Icon(Icons.person, size: 50, color: Colors.white),
                                  )
                                : const Icon(Icons.person, size: 50, color: Colors.white)),
                      ),
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: FWColors.primaryBlue,
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Clic en la foto para cambiarla',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.6),
                  fontSize: 11,
                  fontFamily: 'Kanit',
                ),
              ),
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  border: Border.all(color: Colors.white.withOpacity(0.22)),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'CLIENTE',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                    fontFamily: 'Kanit',
                  ),
                ),
              ),
              const SizedBox(height: 20),
              _buildSidebarInfoItem(Icons.person, _nombreCtrl.text.isNotEmpty ? _nombreCtrl.text : 'Sin nombre'),
              const SizedBox(height: 9),
              _buildSidebarInfoItem(Icons.email, _correoCtrl.text.isNotEmpty ? _correoCtrl.text : '—'),
              const SizedBox(height: 9),
              _buildSidebarInfoItem(Icons.phone, _telefonoCtrl.text.isNotEmpty ? _telefonoCtrl.text : '—'),
              const SizedBox(height: 9),
              _buildSidebarInfoItem(Icons.location_on, _direccionCtrl.text.isNotEmpty ? _direccionCtrl.text : '—'),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _pickImage,
                  icon: const Icon(Icons.camera_alt, color: Colors.white, size: 15),
                  label: Text(
                    fotoUrl.isNotEmpty || _imageFile != null ? 'Cambiar foto' : 'Subir foto',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      fontFamily: 'Kanit',
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: Colors.white.withOpacity(0.35), width: 1.5),
                    backgroundColor: Colors.white.withOpacity(0.15),
                    padding: const EdgeInsets.symmetric(vertical: 11),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarInfoItem(IconData icon, String value) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 13),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.12),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
        borderRadius: BorderRadius.circular(11),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.white.withOpacity(0.8)),
          const SizedBox(width: 9),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontFamily: 'Kanit',
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEditarPerfilHeader() {
    return FWDetailCard(
      icon: Icons.edit_outlined,
      title: 'Editar Perfil',
      spaceBetween: false,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            border: const Border(left: BorderSide(color: Color(0xFFF59E0B), width: 3)),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Color(0xFFD97706), size: 18),
              const SizedBox(width: 10),
              Expanded(
                child: const Text(
                  'El correo electrónico no puede modificarse desde aquí.',
                  style: TextStyle(
                    color: Color(0xFF92400E),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    fontFamily: 'Kanit',
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFotoPerfilCard() {
    return FWDetailCard(
      icon: Icons.camera_alt_outlined,
      title: 'Foto de Perfil',
      spaceBetween: false,
      children: [
        GestureDetector(
          onTap: _pickImage,
          child: CustomPaint(
            painter: DashedBorderPainter(),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 28, horizontal: 20),
              decoration: BoxDecoration(
                color: const Color(0xFFFAFBFF),
                borderRadius: BorderRadius.circular(14),
              ),
              child: _imageFile != null || _buildFotoUrl(_fotoUrl).isNotEmpty
                  ? Column(
                      children: [
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: FWColors.primaryBlue, width: 3),
                            boxShadow: [
                              BoxShadow(
                                color: FWColors.primaryBlue.withOpacity(0.2),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ClipOval(
                            child: _imageFile != null
                                ? Image.file(_imageFile!, fit: BoxFit.cover)
                                : Image.network(
                                    _buildFotoUrl(_fotoUrl),
                                    fit: BoxFit.cover,
                                    headers: const {'ngrok-skip-browser-warning': 'true'},
                                    errorBuilder: (_, __, ___) =>
                                        const Icon(Icons.person, size: 50, color: FWColors.primaryBlue),
                                  ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 7),
                          decoration: BoxDecoration(
                            gradient: FWColors.sidebarGradient,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text(
                            'Cambiar foto',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              fontFamily: 'Kanit',
                            ),
                          ),
                        ),
                      ],
                    )
                  : Column(
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              colors: [
                                FWColors.primaryBlue.withOpacity(0.1),
                                FWColors.primaryPurple.withOpacity(0.1),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                          ),
                          child: const Icon(Icons.cloud_upload_outlined, color: FWColors.primaryBlue, size: 28),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Elegir archivo',
                          style: TextStyle(
                            color: FWColors.primaryBlue,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            fontFamily: 'Kanit',
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'JPG, PNG, WEBP · máx. 5 MB',
                          style: TextStyle(
                            color: Color(0xFFBBBBBB),
                            fontSize: 12,
                            fontFamily: 'Kanit',
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoPersonalCard(bool isLandscape) {
    final fields = [
      _buildField(
        controller: _nombreCtrl,
        label: 'Nombre completo *',
        icon: Icons.person_outline,
        inputFormatters: [
          FilteringTextInputFormatter.allow(RegExp(r'[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]')),
        ],
        validator: (v) => (v == null || v.trim().isEmpty) ? 'El nombre es obligatorio' : null,
      ),
      _buildField(
        controller: _correoCtrl,
        label: 'Correo electrónico',
        icon: Icons.email_outlined,
        enabled: false,
      ),
      _buildField(
        controller: _telefonoCtrl,
        label: 'Teléfono',
        icon: Icons.phone_outlined,
        keyboardType: TextInputType.phone,
      ),
      _buildField(
        controller: _direccionCtrl,
        label: 'Dirección',
        icon: Icons.location_on_outlined,
      ),
      _buildField(
        controller: _docCtrl,
        label: 'N. de Documento',
        icon: Icons.badge_outlined,
        keyboardType: TextInputType.number,
      ),
    ];

    return FWDetailCard(
      icon: Icons.person_outline,
      title: 'Información Personal',
      spaceBetween: false,
      children: [
        if (isLandscape) ...[
          Row(
            children: [
              Expanded(child: fields[0]),
              const SizedBox(width: 18),
              Expanded(child: fields[1]),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: fields[2]),
              const SizedBox(width: 18),
              Expanded(child: fields[3]),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(child: fields[4]),
              const SizedBox(width: 18),
              const Spacer(),
            ],
          ),
        ] else ...[
          fields[0],
          const SizedBox(height: 14),
          fields[1],
          const SizedBox(height: 14),
          fields[2],
          const SizedBox(height: 14),
          fields[3],
          const SizedBox(height: 14),
          fields[4],
        ]
      ],
    );
  }

  Widget _buildCambiarPasswordCard(bool isLandscape) {
    final fields = [
      _buildField(
        controller: _passwordActualCtrl,
        label: 'Contraseña Actual',
        icon: Icons.lock_outline,
        obscureText: true,
      ),
      _buildField(
        controller: _passwordNuevaCtrl,
        label: 'Nueva Contraseña',
        icon: Icons.lock_outline,
        obscureText: true,
      ),
      _buildField(
        controller: _passwordConfirmarCtrl,
        label: 'Confirmar Contraseña',
        icon: Icons.lock_outline,
        obscureText: true,
      ),
    ];

    return FWDetailCard(
      icon: Icons.lock_outline,
      title: 'Cambiar Contraseña',
      spaceBetween: false,
      children: [
        const Text(
          'Deja estos campos vacíos si no deseas cambiar tu contraseña.',
          style: TextStyle(
            color: Color(0xFFBBBBBB),
            fontSize: 12,
            fontFamily: 'Kanit',
          ),
        ),
        const SizedBox(height: 16),
        if (isLandscape) ...[
          Row(
            children: [
              Expanded(child: fields[0]),
              const SizedBox(width: 18),
              Expanded(child: fields[1]),
              const SizedBox(width: 18),
              Expanded(child: fields[2]),
            ],
          ),
        ] else ...[
          fields[0],
          const SizedBox(height: 14),
          fields[1],
          const SizedBox(height: 14),
          fields[2],
        ]
      ],
    );
  }

  Widget _buildButtonsCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 12,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFE0E4EF), width: 1.5),
                backgroundColor: const Color(0xFFF4F5F9),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Cancelar',
                style: TextStyle(
                  color: Color(0xFF555555),
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  fontFamily: 'Kanit',
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _isSaving ? null : _guardar,
              style: ElevatedButton.styleFrom(
                backgroundColor: FWColors.primaryBlue,
                foregroundColor: Colors.white,
                elevation: 4,
                shadowColor: FWColors.primaryBlue.withOpacity(0.28),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSaving
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.save_outlined, size: 16, color: Colors.white),
                        SizedBox(width: 8),
                        Text(
                          'Guardar Cambios',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            fontFamily: 'Kanit',
                          ),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    bool enabled = true,
    bool obscureText = false,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Color(0xFF888888),
            letterSpacing: 0.5,
            fontFamily: 'Kanit',
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          enabled: enabled,
          obscureText: obscureText,
          inputFormatters: inputFormatters,
          style: TextStyle(
            fontSize: 14,
            color: enabled ? const Color(0xFF111111) : const Color(0xFF999999),
            fontWeight: FontWeight.w600,
            fontFamily: 'Kanit',
          ),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 20, color: FWColors.primaryBlue),
            filled: true,
            fillColor: enabled ? const Color(0xFFF8F9FF) : const Color(0xFFF4F5F9),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE0E4EF), width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE0E4EF), width: 1.5),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: FWColors.primaryBlue, width: 1.5),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFEAEDF5), width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}

// Painter para el borde dashed del dropzone
class DashedBorderPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double gap;
  final double dashLength;
  final double borderRadius;

  DashedBorderPainter({
    this.color = const Color(0xFFC7D2FE),
    this.strokeWidth = 2,
    this.gap = 4,
    this.dashLength = 6,
    this.borderRadius = 14,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    final path = Path()
      ..addRRect(RRect.fromRectAndRadius(
        Rect.fromLTWH(0, 0, size.width, size.height),
        Radius.circular(borderRadius),
      ));

    final dashPath = Path();
    var distance = 0.0;
    for (final metric in path.computeMetrics()) {
      while (distance < metric.length) {
        dashPath.addPath(
          metric.extractPath(distance, distance + dashLength),
          Offset.zero,
        );
        distance += dashLength + gap;
      }
    }
    canvas.drawPath(dashPath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
