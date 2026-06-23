// lib/Features/Admin/views/empleados_crud.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:http/http.dart' as http;

class EmpleadosCrudScreen extends StatefulWidget {
  final String apiBaseUrl;
  const EmpleadosCrudScreen({Key? key, required this.apiBaseUrl}) : super(key: key);
  @override
  State<EmpleadosCrudScreen> createState() => _EmpleadosCrudScreenState();
}

class _EmpleadosCrudScreenState extends State<EmpleadosCrudScreen> {
  List<dynamic> _empleados = [];

  Future<void> _cargar() async {
    final uri = Uri.parse('\${widget.apiBaseUrl}/empleados');
    final resp = await http.get(uri);
    if (resp.statusCode == 200) {
      setState(() => _empleados = jsonDecode(resp.body));
    }
  }

  Future<void> _eliminar(String id) async {
    await http.delete(Uri.parse('\${widget.apiBaseUrl}/empleados/$id'));
    _cargar();
  }

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  void _abrirForm({Map<String, dynamic>? empleado}) {
    Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => _EmpleadoFormScreen(apiBaseUrl: widget.apiBaseUrl, empleado: empleado)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Empleados')),
        floatingActionButton: FloatingActionButton(
          onPressed: () => _abrirForm(),
          child: const Icon(Icons.add),
        ),
        body: _empleados.isEmpty
            ? const Center(child: Text('No hay empleados.'))
            : ListView.builder(
                itemCount: _empleados.length,
                itemBuilder: (_, i) {
                  final e = _empleados[i];
                  return ListTile(
                    title: Text(e['nombre'] ?? ''),
                    subtitle: Text(e['cargo'] ?? ''),
                    trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(icon: const Icon(Icons.edit), onPressed: () => _abrirForm(empleado: e)),
                      IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () => _eliminar(e['id'].toString())),
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
  String? _nombre, _cargo, _telefono;

  Future<void> _guardar() async {
    final payload = {'nombre': _nombre, 'cargo': _cargo, 'telefono': _telefono};
    if (widget.empleado == null) {
      await http.post(Uri.parse('\${widget.apiBaseUrl}/empleados'), headers: {'Content-Type': 'application/json'}, body: jsonEncode(payload));
    } else {
      await http.put(Uri.parse('\${widget.apiBaseUrl}/empleados/${widget.empleado!['id']}'), headers: {'Content-Type': 'application/json'}, body: jsonEncode(payload));
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final e = widget.empleado;
    return Scaffold(
        appBar: AppBar(title: Text(e == null ? 'Nuevo empleado' : 'Editar empleado')),
        body: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: ListView(children: [
              TextFormField(initialValue: e?['nombre'], decoration: const InputDecoration(labelText: 'Nombre'), onSaved: (v) => _nombre = v),
              TextFormField(initialValue: e?['cargo'], decoration: const InputDecoration(labelText: 'Cargo'), onSaved: (v) => _cargo = v),
              TextFormField(initialValue: e?['telefono'], decoration: const InputDecoration(labelText: 'Teléfono'), onSaved: (v) => _telefono = v),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: () { if (_formKey.currentState!.validate()) { _formKey.currentState!.save(); _guardar(); } }, child: const Text('Guardar')),
            ]),
          ),
        ));
  }
}
