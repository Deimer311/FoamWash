import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/Features/Cart/views/checkout_step2_view.dart';

class CheckoutStep1View extends StatefulWidget {
  const CheckoutStep1View({Key? key}) : super(key: key);

  @override
  State<CheckoutStep1View> createState() => _CheckoutStep1ViewState();
}

class _CheckoutStep1ViewState extends State<CheckoutStep1View> {
  final TextEditingController _direccionController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _direccionController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_formKey.currentState!.validate()) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => CheckoutStep2View(
            direccion: _direccionController.text.trim(),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final nombre = auth.user?.nombre ?? 'Usuario';
    final correo = auth.userEmail ?? 'correo@ejemplo.com';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Datos del Cliente'),
        backgroundColor: AppTheme.appBarDark,
        foregroundColor: Colors.white,
      ),
      backgroundColor: AppTheme.backgroundWhite,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Confirma tus datos',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              TextFormField(
                initialValue: nombre,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: 'Nombre',
                  border: OutlineInputBorder(),
                  filled: true,
                  fillColor: Colors.black12,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                initialValue: correo,
                readOnly: true,
                decoration: const InputDecoration(
                  labelText: 'Correo',
                  border: OutlineInputBorder(),
                  filled: true,
                  fillColor: Colors.black12,
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _direccionController,
                decoration: const InputDecoration(
                  labelText: 'Dirección del Servicio *',
                  border: OutlineInputBorder(),
                  hintText: 'Ej. Calle Falsa 123, Depto 4B',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Por favor ingresa tu dirección';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 30),
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _nextStep,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text('Siguiente', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
