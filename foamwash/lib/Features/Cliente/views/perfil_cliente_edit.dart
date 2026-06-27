import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';

class PerfilClienteEditScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;
  const PerfilClienteEditScreen({Key? key, required this.apiBaseUrl, required this.userId}) : super(key: key);
  @override
  State<PerfilClienteEditScreen> createState() => _PerfilClienteEditScreenState();
}

class _PerfilClienteEditScreenState extends State<PerfilClienteEditScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreCtrl    = TextEditingController();
  final _correoCtrl    = TextEditingController();
  final _telefonoCtrl  = TextEditingController();
  final _direccionCtrl = TextEditingController();
  final _docCtrl       = TextEditingController();
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
          // Actualizar caché global
          if (_fotoUrl != null) {
            context.read<AuthProvider>().updateUserFoto(_fotoUrl!);
          }
          // Regresar y señalar que hubo cambios para que la pantalla anterior se refresque
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
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A1435),
        foregroundColor: Colors.white,
        title: const Text(
          'Editar Perfil',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF1A56FF)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // --- Avatar ---
                    Center(
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Stack(
                          children: [
                            Container(
                              width: 110,
                              height: 110,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: const Color(0xFFE8EFFF),
                                border: Border.all(color: const Color(0xFF1A56FF), width: 3),
                              ),
                              child: ClipOval(
                                child: _imageFile != null
                                    ? Image.file(_imageFile!, fit: BoxFit.cover)
                                    : (_buildFotoUrl(_fotoUrl).isNotEmpty
                                        ? Image.network(
                                            _buildFotoUrl(_fotoUrl),
                                            fit: BoxFit.cover,
                                            headers: const {'ngrok-skip-browser-warning': 'true'},
                                            errorBuilder: (_, __, ___) =>
                                                const Icon(Icons.person, size: 50, color: Color(0xFF1A56FF)),
                                          )
                                        : const Icon(Icons.person, size: 50, color: Color(0xFF1A56FF))),
                              ),
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1A56FF),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: Colors.white, width: 2),
                                ),
                                child: const Icon(Icons.camera_alt, color: Colors.white, size: 16),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 28),

                    // --- Campos ---
                    _buildField(
                      controller: _nombreCtrl,
                      label: 'Nombre completo',
                      icon: Icons.person_outline,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'El nombre es obligatorio' : null,
                    ),
                    const SizedBox(height: 14),
                    _buildField(
                      controller: _correoCtrl,
                      label: 'Correo electrónico',
                      icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'El correo es obligatorio' : null,
                    ),
                    const SizedBox(height: 14),
                    _buildField(
                      controller: _telefonoCtrl,
                      label: 'Teléfono',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 14),
                    _buildField(
                      controller: _direccionCtrl,
                      label: 'Dirección',
                      icon: Icons.location_on_outlined,
                    ),
                    const SizedBox(height: 14),
                    _buildField(
                      controller: _docCtrl,
                      label: 'N. de Documento',
                      icon: Icons.badge_outlined,
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 32),

                    // --- Botón guardar ---
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _guardar,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1A56FF),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                              )
                            : const Text(
                                'Guardar cambios',
                                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Color(0xFF8896AB),
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          style: const TextStyle(fontSize: 15, color: Color(0xFF0A1435), fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 20, color: const Color(0xFF1A56FF)),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE0E4EF)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE0E4EF)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF1A56FF), width: 2),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}
