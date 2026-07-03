// lib/Features/Admin/views/usuarios_crud.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:http/http.dart' as http;

class UsuariosCrudScreen extends StatefulWidget {
  final String apiBaseUrl;
  const UsuariosCrudScreen({Key? key, required this.apiBaseUrl}) : super(key: key);
  @override
  State<UsuariosCrudScreen> createState() => _UsuariosCrudScreenState();
}

class _UsuariosCrudScreenState extends State<UsuariosCrudScreen> {
  List<dynamic> _usuarios = [];

  Future<void> _cargar() async {
    final uri = Uri.parse('\${widget.apiBaseUrl}/usuarios');
    final resp = await http.get(uri);
    if (resp.statusCode == 200) {
      setState(() => _usuarios = jsonDecode(resp.body));
    }
  }

  Future<void> _eliminar(String id) async {
    await http.delete(Uri.parse('\${widget.apiBaseUrl}/usuarios/$id'));
    _cargar();
  }

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  void _abrirForm({Map<String, dynamic>? usuario}) {
    Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => _UsuarioFormScreen(apiBaseUrl: widget.apiBaseUrl, usuario: usuario)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Usuarios')),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _abrirForm(),
          child: const Icon(Icons.add),
        ),
        body: _usuarios.isEmpty
            ? const Center(child: Text('No hay usuarios.'))
            : ListView.builder(
                itemCount: _usuarios.length,
                itemBuilder: (_, i) {
                  final u = _usuarios[i];
                  return ListTile(
                    title: Text(u['nombre'] ?? ''),
                    subtitle: Text(u['correo'] ?? ''),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(icon: const Icon(Icons.edit), onPressed: () => _abrirForm(usuario: u)),
                      IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () => _eliminar(u['idUsuario'].toString())),
                    ]),
                  );
                }));
  }
}

class _UsuarioFormScreen extends StatefulWidget {
  final String apiBaseUrl;
  final Map<String, dynamic>? usuario;
  const _UsuarioFormScreen({Key? key, required this.apiBaseUrl, this.usuario}) : super(key: key);
  @override
  State<_UsuarioFormScreen> createState() => _UsuarioFormScreenState();
}

class _UsuarioFormScreenState extends State<_UsuarioFormScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _nombre, _correo, _telefono, _direccion, _rolId;

  Future<void> _guardar() async {
    final payload = {
      'Nombre': _nombre,
      'Correo': _correo,
      'Telefono': _telefono,
      'Direccion': _direccion,
      'rol_Id_Rol': int.tryParse(_rolId ?? '0') ?? 0,
    };
    if (widget.usuario == null) {
      await http.post(Uri.parse('\${widget.apiBaseUrl}/usuarios'), headers: {'Content-Type': 'application/json'}, body: jsonEncode(payload));
    } else {
      await http.put(Uri.parse('\${widget.apiBaseUrl}/usuarios/${widget.usuario!['idUsuario']}'), headers: {'Content-Type': 'application/json'}, body: jsonEncode(payload));
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final u = widget.usuario;
    return Scaffold(
        appBar: AppBar(title: Text(u == null ? 'Nuevo usuario' : 'Editar usuario')),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: ListView(children: [
              TextFormField(initialValue: u?['nombre'], decoration: const InputDecoration(labelText: 'Nombre'), onSaved: (v) => _nombre = v),
              TextFormField(initialValue: u?['correo'], decoration: const InputDecoration(labelText: 'Correo'), onSaved: (v) => _correo = v),
              TextFormField(initialValue: u?['telefono'], decoration: const InputDecoration(labelText: 'Teléfono'), onSaved: (v) => _telefono = v),
              TextFormField(initialValue: u?['direccion'], decoration: const InputDecoration(labelText: 'Dirección'), onSaved: (v) => _direccion = v),
              TextFormField(initialValue: u?['rol_Id_Rol']?.toString(), decoration: const InputDecoration(labelText: 'Rol ID'), onSaved: (v) => _rolId = v, keyboardType: TextInputType.number),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: () { if (_formKey.currentState!.validate()) { _formKey.currentState!.save(); _guardar(); } }, child: const Text('Guardar')),
            ]),
          ),
        ));
  }
}
