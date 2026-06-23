import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';

class AddServicioDialog extends StatefulWidget {
  const AddServicioDialog({super.key});

  @override
  State<AddServicioDialog> createState() => _AddServicioDialogState();
}

class _AddServicioDialogState extends State<AddServicioDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _precioController = TextEditingController();
  final _descripcionController = TextEditingController();
  final _imagenUrlController = TextEditingController();

  @override
  void dispose() {
    _nombreController.dispose();
    _precioController.dispose();
    _descripcionController.dispose();
    _imagenUrlController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      final provider = context.read<ServicesProvider>();
      final success = await provider.createService(
        nombre: _nombreController.text.trim(),
        precio: _precioController.text.trim(),
        descripcion: _descripcionController.text.trim(),
        imagenUrl: _imagenUrlController.text.trim().isEmpty ? null : _imagenUrlController.text.trim(),
      );

      if (!mounted) return;

      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Servicio creado exitosamente'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.error ?? 'Error desconocido'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ServicesProvider>();

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text('Agregar Servicio', style: TextStyle(fontWeight: FontWeight.bold)),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nombreController,
                decoration: const InputDecoration(
                  labelText: 'Nombre del Servicio',
                  prefixIcon: Icon(Icons.cleaning_services),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _precioController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Precio',
                  prefixIcon: Icon(Icons.attach_money),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descripcionController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Descripción',
                  prefixIcon: Icon(Icons.description),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _imagenUrlController,
                decoration: const InputDecoration(
                  labelText: 'URL de la Imagen',
                  prefixIcon: Icon(Icons.image),
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: provider.isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: provider.isLoading ? null : _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF1A56FF),
            foregroundColor: Colors.white,
          ),
          child: provider.isLoading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : const Text('Guardar'),
        ),
      ],
    );
  }
}
