import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';

class PerfilTrabajadorEditScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;
  const PerfilTrabajadorEditScreen({Key? key, required this.apiBaseUrl, required this.userId}) : super(key: key);
  @override
  State<PerfilTrabajadorEditScreen> createState() => _PerfilTrabajadorEditScreenState();
}

class _PerfilTrabajadorEditScreenState extends State<PerfilTrabajadorEditScreen> {
  final _formKey = GlobalKey<FormState>();

  // Controllers para datos del usuario
  final _nombreCtrl       = TextEditingController();
  final _correoCtrl       = TextEditingController();
  final _telefonoCtrl     = TextEditingController();
  final _direccionCtrl    = TextEditingController();
  final _docCtrl          = TextEditingController();

  // Controllers para datos del empleado
  final _cargoCtrl         = TextEditingController();
  final _diasCtrl          = TextEditingController();
  final _horarioCtrl       = TextEditingController();
  final _certCtrl          = TextEditingController();
  final _fechaNacCtrl      = TextEditingController();

  String? _fechaIngreso;
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
    _cargoCtrl.dispose();
    _diasCtrl.dispose();
    _horarioCtrl.dispose();
    _certCtrl.dispose();
    _fechaNacCtrl.dispose();
    super.dispose();
  }

  Future<void> _cargar() async {
    try {
      final secureStorage = SecureStorageService();
      final token = await secureStorage.read('token') ?? '';
      final resp = await http.get(
        Uri.parse('${widget.apiBaseUrl}/api/empleados/${widget.userId}/perfil'),
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
            _cargoCtrl.text     = data['cargo']        ?? '';
            _diasCtrl.text      = data['dias_laborales'] ?? '';
            _horarioCtrl.text   = data['horario']      ?? '';

            if (data['certificaciones'] != null) {
              if (data['certificaciones'] is List) {
                _certCtrl.text = (data['certificaciones'] as List)
                    .map((e) => e is Map ? e['nombre'] : e.toString())
                    .join(', ');
              } else {
                _certCtrl.text = data['certificaciones'].toString();
              }
            }

            if (data['fecha_nacimiento'] != null) {
              _fechaNacCtrl.text = DateTime.parse(data['fecha_nacimiento']).toIso8601String().split('T')[0];
            }
            if (data['fecha_ingreso'] != null) {
              _fechaIngreso = DateTime.parse(data['fecha_ingreso']).toIso8601String().split('T')[0];
            }
          });
        }
      }
    } catch (e) {
      debugPrint('Error al cargar perfil trabajador: $e');
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

      // 1. Subir imagen si se seleccionó nueva
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

      // 2. Actualizar datos del perfil + datos de empleado
      final uri = Uri.parse('${widget.apiBaseUrl}/api/usuarios/${widget.userId}');
      final resp = await http.put(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({
          'Nombre':        _nombreCtrl.text.trim(),
          'Correo':        _correoCtrl.text.trim(),
          'Telefono':      _telefonoCtrl.text.trim(),
          'Direccion':     _direccionCtrl.text.trim(),
          'N_Documento':   _docCtrl.text.trim(),
          'cargo':         _cargoCtrl.text.trim(),
          'dias_laborales':_diasCtrl.text.trim(),
          'horario':       _horarioCtrl.text.trim(),
          'certificaciones': _certCtrl.text.trim(),
          if (_fechaNacCtrl.text.trim().isNotEmpty)
            'fecha_nacimiento': _fechaNacCtrl.text.trim(),
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
          Navigator.pop(context, true); // true = hubo cambios, refrescar pantalla anterior
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
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(3),
          child: Container(
            height: 3,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF0066FF), Color(0xFF7C3AED), Color(0xFF10B981)],
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
              ),
            ),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF0066FF)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // ── Avatar ─────────────────────────────────────
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
                                border: Border.all(color: const Color(0xFF0066FF), width: 3),
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
                                                const Icon(Icons.badge, size: 50, color: Color(0xFF0066FF)),
                                          )
                                        : const Icon(Icons.badge, size: 50, color: Color(0xFF0066FF))),
                              ),
                            ),
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0066FF),
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
                    if (_fechaIngreso != null) ...[
                      const SizedBox(height: 8),
                      Center(
                        child: Text(
                          'Ingresó el: $_fechaIngreso',
                          style: const TextStyle(
                            fontFamily: 'Kanit',
                            fontSize: 12,
                            color: Color(0xFF8896AB),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 28),

                    // ── Datos Personales ───────────────────────────
                    _sectionTitle('Datos Personales', Icons.person_rounded),
                    const SizedBox(height: 12),
                    _buildField(controller: _nombreCtrl,    label: 'Nombre completo',  icon: Icons.person_outline,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Obligatorio' : null),
                    const SizedBox(height: 12),
                    _buildField(controller: _correoCtrl,    label: 'Correo electrónico',  icon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Obligatorio' : null),
                    const SizedBox(height: 12),
                    _buildField(controller: _telefonoCtrl,  label: 'Teléfono',          icon: Icons.phone_outlined, keyboardType: TextInputType.phone),
                    const SizedBox(height: 12),
                    _buildField(controller: _direccionCtrl, label: 'Dirección',         icon: Icons.location_on_outlined),
                    const SizedBox(height: 12),
                    _buildField(controller: _docCtrl,       label: 'N. de Documento',   icon: Icons.badge_outlined,  keyboardType: TextInputType.number),
                    const SizedBox(height: 24),

                    // ── Datos Laborales ────────────────────────────
                    _sectionTitle('Datos Laborales', Icons.work_rounded),
                    const SizedBox(height: 12),
                    _buildField(controller: _cargoCtrl,  label: 'Cargo',   icon: Icons.work_outline),
                    const SizedBox(height: 12),
                    _buildField(controller: _diasCtrl,   label: 'Días Laborales',  icon: Icons.calendar_today_outlined,
                      hint: 'Ej: lunes, martes, miercoles'),
                    const SizedBox(height: 12),
                    _buildField(controller: _horarioCtrl, label: 'Horario', icon: Icons.schedule_outlined,
                      hint: 'Ej: 08:00 AM - 05:00 PM'),
                    const SizedBox(height: 12),
                    _buildField(controller: _fechaNacCtrl, label: 'Fecha de Nacimiento', icon: Icons.cake_outlined,
                      hint: 'YYYY-MM-DD', keyboardType: TextInputType.datetime),
                    const SizedBox(height: 24),

                    // ── Certificaciones ────────────────────────────
                    _sectionTitle('Certificaciones', Icons.verified_outlined),
                    const SizedBox(height: 12),
                    _buildField(controller: _certCtrl, label: 'Certificaciones', icon: Icons.military_tech_outlined,
                      hint: 'Ej: Lavado Premium, Detallado', maxLines: 3),
                    const SizedBox(height: 32),

                    // ── Botón Guardar ──────────────────────────────
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : _guardar,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0066FF),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          elevation: 0,
                        ),
                        child: _isSaving
                            ? const SizedBox(
                                width: 22, height: 22,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                              )
                            : const Text('Guardar cambios',
                                style: TextStyle(fontFamily: 'Kanit', fontSize: 16, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _sectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Container(
          width: 32, height: 32,
          decoration: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF0066FF), Color(0xFF7C3AED)]),
            borderRadius: BorderRadius.circular(9),
          ),
          child: Icon(icon, size: 16, color: Colors.white),
        ),
        const SizedBox(width: 10),
        Text(title,
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF080C1E),
          )),
      ],
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
    String? hint,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontFamily: 'Kanit',
            fontSize: 10.5, fontWeight: FontWeight.w700,
            color: Color(0xFF8896AB), letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          validator: validator,
          maxLines: maxLines,
          style: const TextStyle(fontFamily: 'Kanit', fontSize: 15, color: Color(0xFF080C1E), fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(fontFamily: 'Kanit', color: Color(0xFFB0BAC9), fontSize: 13),
            prefixIcon: Icon(icon, size: 20, color: const Color(0xFF0066FF)),
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
              borderSide: const BorderSide(color: Color(0xFF0066FF), width: 2),
            ),
            errorBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.red),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}
