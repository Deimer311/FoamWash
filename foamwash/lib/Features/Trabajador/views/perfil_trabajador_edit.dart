import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:http/http.dart' as http;
import 'package:foamwash/Features/Comun/widgets/fw_perfil_widgets.dart';

class PerfilTrabajadorEditScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String userId;
  const PerfilTrabajadorEditScreen({Key? key, required this.apiBaseUrl, required this.userId}) : super(key: key);
  @override
  State<PerfilTrabajadorEditScreen> createState() => _PerfilTrabajadorEditScreenState();
}

class _PerfilTrabajadorEditScreenState extends State<PerfilTrabajadorEditScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _nombre, _telefono, _direccion;
  String? _fotoUrl;

  Future<void> _cargar() async {
    final uri = Uri.parse('\${widget.apiBaseUrl}/usuarios/\${widget.userId}');
    final resp = await http.get(uri);
    if (resp.statusCode == 200) {
      final data = jsonDecode(resp.body);
      setState(() {
        _nombre = data['Nombre'];
        _telefono = data['Telefono'];
        _direccion = data['Direccion'];
        _fotoUrl = data['foto_perfil'];
      });
    }
  }

  Future<void> _guardar() async {
    final uri = Uri.parse('\${widget.apiBaseUrl}/usuarios/\${widget.userId}');
    final body = jsonEncode({
      'Nombre': _nombre,
      'Telefono': _telefono,
      'Direccion': _direccion,
    });
    await http.put(uri,
        headers: {'Content-Type': 'application/json'}, body: body);
    Navigator.pop(context);
  }

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text('Editar perfil trabajador')),
        body: _nombre == null
            ? const Center(child: CircularProgressIndicator())
            : Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: ListView(children: [
                    Center(
                      child: FWAvatar(
                        fotoUrl: fwFotoUrl(_fotoUrl, widget.apiBaseUrl),
                        fallbackIcon: Icons.person,
                        size: 120,
                      ),
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      initialValue: _nombre,
                      decoration: const InputDecoration(labelText: 'Nombre'),
                      onSaved: (v) => _nombre = v,
                    ),
                    TextFormField(
                      initialValue: _telefono,
                      decoration: const InputDecoration(labelText: 'Teléfono'),
                      onSaved: (v) => _telefono = v,
                    ),
                    TextFormField(
                      initialValue: _direccion,
                      decoration: const InputDecoration(labelText: 'Dirección'),
                      onSaved: (v) => _direccion = v,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                        onPressed: () {
                          if (_formKey.currentState!.validate()) {
                            _formKey.currentState!.save();
                            _guardar();
                          }
                        },
                        child: const Text('Guardar cambios')),
                  ]),
                ),
              ));
  }
}
