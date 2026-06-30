import 'dart:math';
import 'package:flutter/material.dart';
import '../models/empleado_model.dart';
import 'package:foamwash/Api/api_constants.dart';

class EmpleadoFlipCard extends StatefulWidget {
  final EmpleadoModel empleado;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const EmpleadoFlipCard({
    super.key,
    required this.empleado,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  State<EmpleadoFlipCard> createState() => _EmpleadoFlipCardState();
}

class _EmpleadoFlipCardState extends State<EmpleadoFlipCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  bool _isFront = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _animation = Tween<double>(begin: 0, end: 1).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _flipCard() {
    if (_isFront) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
    _isFront = !_isFront;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _flipCard,
      child: Stack(
        children: [
          AnimatedBuilder(
            animation: _animation,
            builder: (context, child) {
              final isUnder = _animation.value > 0.5;
              final angle = _animation.value * pi;

              return Transform(
                transform: Matrix4.rotationY(angle),
                alignment: Alignment.center,
                child: isUnder
                    ? Transform(
                        transform: Matrix4.rotationY(pi),
                        alignment: Alignment.center,
                        child: _buildBack(),
                      )
                    : _buildFront(),
              );
            },
          ),
          // Botones superpuestos fijos
          Positioned(
            top: 4,
            right: 4,
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.edit, color: Colors.blue),
                  onPressed: widget.onEdit,
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: widget.onDelete,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFront() {
    final avatarUrl = widget.empleado.fotoPerfil != null && widget.empleado.fotoPerfil!.isNotEmpty
        ? '${ApiConstants.baseUrl.replaceAll('/api', '')}${widget.empleado.fotoPerfil}' // TODO: Usar ApiConstants de forma correcta
        : null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          // Mitad superior azul claro
          Expanded(
            flex: 3,
            child: Container(
              decoration: const BoxDecoration(
                color: Color(0xFFD4E3FF),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Center(
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 3),
                    image: avatarUrl != null
                        ? DecorationImage(
                            image: NetworkImage(avatarUrl),
                            fit: BoxFit.cover,
                          )
                        : const DecorationImage(
                            image: AssetImage('assets/LogoFW.jpeg'),
                            fit: BoxFit.cover,
                          ),
                  ),
                ),
              ),
            ),
          ),
          // Mitad inferior blanca
          Expanded(
            flex: 2,
            child: Container(
              padding: const EdgeInsets.all(12.0),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    widget.empleado.nombre,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF15192C),
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 20,
                    height: 1,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Clic para ver Info',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBack() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF15192C),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.empleado.nombre,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 16),
              _buildInfoRow(Icons.email, widget.empleado.correo),
              const SizedBox(height: 8),
              if (widget.empleado.telefono != null)
                _buildInfoRow(Icons.phone, widget.empleado.telefono!),
              const SizedBox(height: 8),
              _buildInfoRow(
                  Icons.circle,
                  widget.empleado.estado == 'activo' || widget.empleado.estado == null
                      ? 'Activo'
                      : 'Inactivo',
                  color: (widget.empleado.estado == 'activo' || widget.empleado.estado == null)
                      ? Colors.greenAccent
                      : Colors.redAccent),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text, {Color? color}) {
    return Row(
      children: [
        Icon(icon, color: color ?? Colors.white70, size: 16),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: TextStyle(color: color ?? Colors.white70, fontSize: 12),
          ),
        ),
      ],
    );
  }
}
