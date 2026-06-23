import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Api/api_constants.dart';
import 'package:http/http.dart' as http;

class CotizadorScreen extends StatefulWidget {
  const CotizadorScreen({Key? key}) : super(key: key);
  @override
  State<CotizadorScreen> createState() => _CotizadorScreenState();
}

class _CotizadorScreenState extends State<CotizadorScreen> {
  final _formKey = GlobalKey<FormState>();
  String _servicio = '';
  int _cantidad = 1;
  double? _precio;

  Future<void> _calcular() async {
    final uri = Uri.parse('${ApiConstants.baseUrl}/servicios?nombre=$_servicio');
    final resp = await http.get(uri);
    if (resp.statusCode == 200) {
      final data = jsonDecode(resp.body) as List;
      if (data.isNotEmpty) {
        final precioBase = (data[0]['precio'] as num).toDouble();
        setState(() => _precio = precioBase * _cantidad);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      appBar: AppBar(title: const Text('Cotizador')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(children: [
            TextFormField(
              decoration: const InputDecoration(labelText: 'Servicio'),
              onSaved: (v) => _servicio = v ?? '',
              validator: (v) => v == null || v.isEmpty ? 'Obligatorio' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Cantidad'),
              keyboardType: TextInputType.number,
              initialValue: '1',
              onSaved: (v) => _cantidad = int.tryParse(v ?? '1') ?? 1,
              validator: (v) => (int.tryParse(v ?? '') ?? 0) > 0 ? null : 'Debe ser > 0',
            ),
            const SizedBox(height: 20),
            ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    _formKey.currentState!.save();
                    _calcular();
                  }
                },
                child: const Text('Calcular')),
            const SizedBox(height: 20),
            if (_precio != null)
              Text('Total: \${_precio!.toStringAsFixed(2)}',
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
            const Spacer(),
            ElevatedButton(
                onPressed: () {
                  if (!auth.isAuthenticated) {
                    Navigator.pushNamed(context, '/login');
                    return;
                  }
                  // TODO: crear reserva mediante POST /reservas
                },
                child: const Text('Agendar servicio')),
          ]),
        ),
      ),
    );
  }
}
