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

class PerfilAdminEditScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;
  const PerfilAdminEditScreen({Key? key, required this.apiBaseUrl, required this.userId}) : super(key: key);
  @override
  State<PerfilAdminEditScreen> createState() => _PerfilAdminEditScreenState();
}

class _PerfilAdminEditScreenState extends State<PerfilAdminEditScreen> {
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
      final cookieToken = await secureStorage.read('cookie_token');
      final uri = Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}');
      
      Map<String, String> headers = {
        'Authorization': 'Bearer $token',
        'ngrok-skip-browser-warning': 'true',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      final resp = await http.get(
        uri, 
        headers: headers,
      );

      if (resp.statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

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
      debugPrint('Error al cargar perfil admin: $e');
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
      final cookieToken = await secureStorage.read('cookie_token');

      // 1. Subir imagen si se seleccionó una nueva
      if (_imageFile != null) {
        final imgUri = Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}/foto');
        final request = http.MultipartRequest('POST', imgUri);
        request.headers['Authorization'] = 'Bearer $token';
        request.headers['ngrok-skip-browser-warning'] = 'true';
        if (cookieToken != null && cookieToken.isNotEmpty) {
          request.headers['Cookie'] = cookieToken;
        }
        request.files.add(await http.MultipartFile.fromPath('foto', _imageFile!.path));
        final imgResp = await request.send();
        if (imgResp.statusCode == 401) {
          if (mounted) {
            final auth = Provider.of<AuthProvider>(context, listen: false);
            auth.logout();
            Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
          }
          return;
        }
        if (imgResp.statusCode == 200 || imgResp.statusCode == 201) {
          final body = jsonDecode(await imgResp.stream.bytesToString());
          if (mounted) setState(() => _fotoUrl = body['data']?['foto_perfil']);
        }
      }

      // 2. Actualizar datos del perfil
      final uri = Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}');
      
      Map<String, String> headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
        'ngrok-skip-browser-warning': 'true',
      };
      if (cookieToken != null && cookieToken.isNotEmpty) {
        headers['Cookie'] = cookieToken;
      }

      final resp = await http.put(
        uri,
        headers: headers,
        body: jsonEncode({
          'Nombre':       _nombreCtrl.text.trim(),
          'Correo':       _correoCtrl.text.trim(),
          'Telefono':     _telefonoCtrl.text.trim(),
          'Direccion':    _direccionCtrl.text.trim(),
          'N_Documento':  _docCtrl.text.trim(),
        }),
      );

      if (resp.statusCode == 401) {
        if (mounted) {
          final auth = Provider.of<AuthProvider>(context, listen: false);
          auth.logout();
          Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
        }
        return;
      }

      if (mounted) {
        if (resp.statusCode == 200 || resp.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Perfil actualizado correctamente'),
              backgroundColor: Color(0xFF22C55E),
            ),
          );
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
        backgroundColor: const Color(0xFF080C1E),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Editar Perfil',
          style: TextStyle(
            fontFamily: 'Kanit',
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
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0066FF)))
          : SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: Center(
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 600),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE0E8F5)),
                  ),
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
                                  width: 100,
                                  height: 100,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: const Color(0xFF0066FF).withOpacity(0.08),
                                    border: Border.all(color: const Color(0xFF0066FF), width: 2.5),
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
                                                    const Icon(Icons.admin_panel_settings, size: 45, color: Color(0xFF0066FF)),
                                              )
                                            : const Icon(Icons.admin_panel_settings, size: 45, color: Color(0xFF0066FF))),
                                  ),
                                ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0066FF),
                                      shape: BoxShape.circle,
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                    child: const Icon(Icons.camera_alt, color: Colors.white, size: 14),
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
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(RegExp(r'[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]')),
                          ],
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
                          height: 48,
                          child: ElevatedButton(
                            onPressed: _isSaving ? null : _guardar,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0066FF),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: 0,
                            ),
                            child: _isSaving
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                  )
                                : const Text(
                                    'Guardar cambios',
                                    style: TextStyle(fontFamily: 'Kanit', fontSize: 15, fontWeight: FontWeight.bold),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
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
    List<TextInputFormatter>? inputFormatters,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: Color(0xFF8898B3),
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          validator: validator,
          style: const TextStyle(fontFamily: 'Kanit', fontSize: 14, color: Color(0xFF080C1E), fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 18, color: const Color(0xFF0066FF)),
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE0E8F5)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFFE0E8F5)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: Color(0xFF0066FF), width: 1.5),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          ),
        ),
      ],
    );
  }
}
