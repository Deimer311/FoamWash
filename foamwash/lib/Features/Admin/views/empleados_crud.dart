// lib/Features/Admin/views/empleados_crud.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/core/cache/secure_storage_service.dart';

class EmpleadosCrudScreen extends StatefulWidget {
  final String apiBaseUrl;
  const EmpleadosCrudScreen({Key? key, required this.apiBaseUrl}) : super(key: key);
  @override
  State<EmpleadosCrudScreen> createState() => _EmpleadosCrudScreenState();
}

class _EmpleadosCrudScreenState extends State<EmpleadosCrudScreen> {
  List<dynamic> _empleados = [];
  bool _isLoading = true;

  Future<void> _cargar() async {
    setState(() => _isLoading = true);
    try {
      final token = await SecureStorageService().read('token');
      final uri = Uri.parse('${widget.apiBaseUrl}/empleados');
      final resp = await http.get(uri, headers: {
        'Authorization': 'Bearer $token'
      });
      if (resp.statusCode == 200) {
        final json = jsonDecode(resp.body);
        if (json['success'] == true) {
          setState(() => _empleados = json['data'] ?? []);
        }
      }
    } catch (e) {
      debugPrint('Error cargando empleados: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _eliminar(String id) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Eliminar empleado'),
        content: const Text('¿Estás seguro de que deseas eliminar este empleado?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Eliminar', style: TextStyle(color: Colors.red))),
        ],
      ),
    );

    if (confirmar != true) return;

    try {
      final token = await SecureStorageService().read('token');
      await http.delete(
        Uri.parse('${widget.apiBaseUrl}/usuarios/$id'),
        headers: {'Authorization': 'Bearer $token'}
      );
      _cargar();
    } catch (e) {
      debugPrint('Error eliminando empleado: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  void _abrirForm({Map<String, dynamic>? empleado}) async {
    await Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => _EmpleadoFormScreen(apiBaseUrl: widget.apiBaseUrl, empleado: empleado)));
    _cargar(); // Recargar al volver
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Empleados')),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _abrirForm(),
          child: const Icon(Icons.add),
        ),
        body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _empleados.isEmpty
            ? const Center(child: Text('No hay empleados.'))
            : ListView.builder(
                itemCount: _empleados.length,
                itemBuilder: (_, i) {
                  final e = _empleados[i];
                  final id = e['Id_Usuario']?.toString() ?? '';
                  final nombre = e['Nombre'] ?? '';
                  final telefono = e['Telefono'] ?? '';
                  
                  String cargo = '';
                  if (e['empleado'] != null) {
                    if (e['empleado'] is List && (e['empleado'] as List).isNotEmpty) {
                      cargo = e['empleado'][0]['cargo'] ?? '';
                    } else if (e['empleado'] is Map) {
                      cargo = e['empleado']['cargo'] ?? '';
                    }
                  }

                  final mappedData = {
                    'id': id,
                    'nombre': nombre,
                    'cargo': cargo,
                    'telefono': telefono,
                  };

                  return ListTile(
                    title: Text(nombre),
                    subtitle: Text(cargo.isNotEmpty ? cargo : 'Sin cargo'),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(icon: const Icon(Icons.edit, color: Colors.blue), onPressed: () => _abrirForm(empleado: mappedData)),
                      IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () => _eliminar(id)),
                    ]),
                  );
                }));
  }
}

class _EmpleadoFormScreen extends StatefulWidget {
  final String apiBaseUrl;
  final Map<String, dynamic>? empleado;
  const _EmpleadoFormScreen({Key? key, required this.apiBaseUrl, this.empleado}) : super(key: key);
  @override
  State<_EmpleadoFormScreen> createState() => _EmpleadoFormScreenState();
}

class _EmpleadoFormScreenState extends State<_EmpleadoFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _nombre, _cargo, _telefono, _correo, _password;
  bool _isSaving = false;

  Future<void> _guardar() async {
    setState(() => _isSaving = true);
    try {
      final token = await SecureStorageService().read('token');
      
      if (widget.empleado == null) {
        // Crear: Primero registrar el usuario
        final regPayload = {
          'nombre': _nombre,
          'correo': _correo,
          'password': _password,
          'telefono': _telefono,
          'role': 'empleado'
        };
        final res = await http.post(
          Uri.parse('${widget.apiBaseUrl}/auth/register'), 
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'}, 
          body: jsonEncode(regPayload)
        );
        
        if (res.statusCode == 201) {
          final json = jsonDecode(res.body);
          final newUserId = json['data']['Id_Usuario'];
          
          // Si hay cargo, hacemos update
          if (_cargo != null && _cargo!.isNotEmpty && newUserId != null) {
            await http.put(
              Uri.parse('${widget.apiBaseUrl}/usuarios/$newUserId'),
              headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'},
              body: jsonEncode({'cargo': _cargo})
            );
          }
        } else {
          debugPrint('Error creando: ${res.body}');
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Error al crear empleado')));
        }
      } else {
        // Editar: PUT /api/usuarios/:id
        final payload = {
          'Nombre': _nombre, 
          'Telefono': _telefono, 
          'cargo': _cargo
        };
        await http.put(
          Uri.parse('${widget.apiBaseUrl}/usuarios/${widget.empleado!['id']}'), 
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer $token'}, 
          body: jsonEncode(payload)
        );
      }
      if (mounted) Navigator.pop(context);
    } catch (e) {
      debugPrint('Error guardando: $e');
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.empleado;
    final isNew = e == null;

    return Scaffold(
        appBar: AppBar(title: Text(isNew ? 'Nuevo empleado' : 'Editar empleado')),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: ListView(children: [
              TextFormField(
                initialValue: e?['nombre'], 
                decoration: const InputDecoration(labelText: 'Nombre *'), 
                validator: (v) => v!.isEmpty ? 'Requerido' : null,
                onSaved: (v) => _nombre = v
              ),
              if (isNew) ...[
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Correo electrónico *'), 
                  validator: (v) => v!.isEmpty || !v.contains('@') ? 'Correo válido requerido' : null,
                  onSaved: (v) => _correo = v,
                  keyboardType: TextInputType.emailAddress,
                ),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Contraseña *'), 
                  obscureText: true,
                  validator: (v) => v!.length < 6 ? 'Mínimo 6 caracteres' : null,
                  onSaved: (v) => _password = v
                ),
              ],
              TextFormField(
                initialValue: e?['cargo'], 
                decoration: const InputDecoration(labelText: 'Cargo'), 
                onSaved: (v) => _cargo = v
              ),
              TextFormField(
                initialValue: e?['telefono'], 
                decoration: const InputDecoration(labelText: 'Teléfono'), 
                onSaved: (v) => _telefono = v,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isSaving ? null : () { 
                  if (_formKey.currentState!.validate()) { 
                    _formKey.currentState!.save(); 
                    _guardar(); 
                  } 
                }, 
                child: _isSaving ? const CircularProgressIndicator(color: Colors.white) : const Text('Guardar')
              ),
            ]),
          ),
        ));
  }
}
