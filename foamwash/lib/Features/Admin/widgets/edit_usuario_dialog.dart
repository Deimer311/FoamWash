import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/usuarios_provider.dart';

class EditUsuarioDialog extends StatefulWidget {
  final dynamic usuario;
  const EditUsuarioDialog({super.key, required this.usuario});

  @override
  State<EditUsuarioDialog> createState() => _EditUsuarioDialogState();
}

class _EditUsuarioDialogState extends State<EditUsuarioDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nombreController;
  late TextEditingController _telefonoController;
  late TextEditingController _direccionController;
  late TextEditingController _nDocumentoController;

  @override
  void initState() {
    super.initState();
    _nombreController = TextEditingController(text: widget.usuario['Nombre']);
    _telefonoController = TextEditingController(text: widget.usuario['Telefono']);
    _direccionController = TextEditingController(text: widget.usuario['Direccion']);
    _nDocumentoController = TextEditingController(text: widget.usuario['N_Documento']);
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _telefonoController.dispose();
    _direccionController.dispose();
    _nDocumentoController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      final provider = context.read<UsuariosProvider>();
      final success = await provider.updateUsuario(
        widget.usuario['Id_Usuario'],
        {
          'Nombre': _nombreController.text.trim(),
          'Telefono': _telefonoController.text.trim(),
          'Direccion': _direccionController.text.trim(),
          'N_Documento': _nDocumentoController.text.trim(),
        },
      );

      if (!mounted) return;

      if (success) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Usuario actualizado exitosamente'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.error ?? 'Error al actualizar'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<UsuariosProvider>();

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text('Editar Usuario', style: TextStyle(fontWeight: FontWeight.bold)),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nombreController,
                decoration: const InputDecoration(
                  labelText: 'Nombre Completo',
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (value) => value == null || value.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _nDocumentoController,
                decoration: const InputDecoration(
                  labelText: 'Número de Documento',
                  prefixIcon: Icon(Icons.badge),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _telefonoController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Teléfono',
                  prefixIcon: Icon(Icons.phone),
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _direccionController,
                decoration: const InputDecoration(
                  labelText: 'Dirección',
                  prefixIcon: Icon(Icons.location_on),
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
