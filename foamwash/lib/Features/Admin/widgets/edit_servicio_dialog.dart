import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Services/data/models/service_model.dart';
import 'package:foamwash/Features/Services/providers/services_provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:foamwash/Api/api_constants.dart';

class EditServicioDialog extends StatefulWidget {
  final ServiceModel servicio;
  const EditServicioDialog({super.key, required this.servicio});

  @override
  State<EditServicioDialog> createState() => _EditServicioDialogState();
}

class _EditServicioDialogState extends State<EditServicioDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nombreController;
  late TextEditingController _precioController;
  late TextEditingController _descripcionController;

  File? _imageFile;
  final ImagePicker _picker = ImagePicker();
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _nombreController = TextEditingController(
      text: widget.servicio.nombreServicio,
    );
    _precioController = TextEditingController(text: widget.servicio.precio);
    _descripcionController = TextEditingController(
      text: widget.servicio.descripcion,
    );
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _precioController.dispose();
    _descripcionController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _picker.pickImage(source: ImageSource.gallery);
      if (pickedFile != null) {
        setState(() {
          _imageFile = File(pickedFile.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al seleccionar imagen: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSaving = true);
      final provider = context.read<ServicesProvider>();

      final success = await provider.updateService(
        widget.servicio.idServicio,
        nombre: _nombreController.text.trim(),
        precio: _precioController.text.trim(),
        descripcion: _descripcionController.text.trim(),
      );

      if (!mounted) return;

      if (success) {
        if (_imageFile != null) {
          final imgSuccess = await provider.uploadServiceImage(
            widget.servicio.idServicio,
            _imageFile!.path,
          );
          if (!mounted) return;
          if (!imgSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Servicio actualizado, pero falló al subir la nueva imagen',
                ),
                backgroundColor: Colors.orange,
              ),
            );
            Navigator.of(context).pop();
            return;
          }
        }
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Servicio actualizado exitosamente'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        setState(() => _isSaving = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(provider.error ?? 'Error al actualizar'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildAvatar() {
    ImageProvider? imageProvider;
    if (_imageFile != null) {
      imageProvider = FileImage(_imageFile!);
    } else if (widget.servicio.imagenUrl != null &&
        widget.servicio.imagenUrl!.isNotEmpty) {
      final url = widget.servicio.imagenUrl!;
      imageProvider = NetworkImage(
        url.startsWith('http')
            ? url
            : '${ApiConstants.baseUrl.replaceAll('/api', '')}$url',
      );
    }

    return GestureDetector(
      onTap: _pickImage,
      child: Container(
        width: 100,
        height: 100,
        decoration: BoxDecoration(
          color: Colors.grey.shade200,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.blue.shade200, width: 2),
          image: imageProvider != null
              ? DecorationImage(image: imageProvider, fit: BoxFit.cover)
              : null,
        ),
        child: imageProvider == null
            ? const Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.add_photo_alternate, size: 40, color: Colors.grey),
                  SizedBox(height: 4),
                  Text(
                    'Imagen',
                    style: TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              )
            : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text(
        'Editar Servicio',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildAvatar(),
              const SizedBox(height: 20),
              TextFormField(
                controller: _nombreController,
                decoration: const InputDecoration(
                  labelText: 'Nombre del Servicio',
                  prefixIcon: Icon(Icons.cleaning_services),
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _precioController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Precio',
                  prefixIcon: Icon(Icons.attach_money),
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Requerido' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descripcionController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Descripción',
                  prefixIcon: Icon(Icons.description),
                ),
                validator: (value) =>
                    value == null || value.isEmpty ? 'Requerido' : null,
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isSaving ? null : () => Navigator.of(context).pop(),
          child: const Text('Cancelar', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF007BFF),
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          onPressed: _isSaving ? null : _submit,
          child: _isSaving
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : const Text('Guardar'),
        ),
      ],
    );
  }
}
