import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Cart/providers/cart_provider.dart';
import 'package:foamwash/Features/Services/controllers/scheduling_controller.dart';

class CheckoutStep2View extends StatefulWidget {
  final String direccion;

  const CheckoutStep2View({Key? key, required this.direccion}) : super(key: key);

  @override
  State<CheckoutStep2View> createState() => _CheckoutStep2ViewState();
}

class _CheckoutStep2ViewState extends State<CheckoutStep2View> {
  final SchedulingController _controller = SchedulingController();

  String? _tamanoMuebles;
  DateTime? _selectedDate;
  TimeOfDay? _selectedTime;
  bool _isLoading = false;

  void _presentDatePicker() async {
    final now = DateTime.now();
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (pickedDate != null) {
      setState(() {
        _selectedDate = pickedDate;
      });
    }
  }

  void _presentTimePicker() async {
    final pickedTime = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (pickedTime != null) {
      setState(() {
        _selectedTime = pickedTime;
      });
    }
  }

  void _submitOrder() async {
    if (_tamanoMuebles == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor selecciona el tamaño de los muebles.')));
      return;
    }
    if (_selectedDate == null || _selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Por favor selecciona fecha y hora.')));
      return;
    }

    final cartProvider = context.read<CartProvider>();
    if (cartProvider.items.isEmpty) return;

    setState(() => _isLoading = true);

    try {
      final serviceIds = cartProvider.items.keys.toList();
      final serviceNames = cartProvider.items.values.map((e) => e.service.nombreServicio).toList();
      final total = cartProvider.totalPrice;

      final formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final formattedTime = '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';

      final voucher = await _controller.requestMultipleServices(
        serviceIds: serviceIds,
        serviceNames: serviceNames,
        total: total,
        direccion: widget.direccion,
        tamanoMuebles: _tamanoMuebles!,
        fecha: formattedDate,
        hora: formattedTime,
      );

      if (mounted) {
        _showVoucherDialog(voucher, cartProvider);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString().replaceAll('Exception: ', '')}'),
            backgroundColor: Colors.redAccent,
            duration: const Duration(seconds: 4),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showVoucherDialog(dynamic voucher, CartProvider cartProvider) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Center(
          child: Column(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 60),
              SizedBox(height: 10),
              Text('¡Agendamiento Exitoso!', textAlign: TextAlign.center),
            ],
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID: ${voucher.id}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Text('Fecha: ${voucher.date}'),
            Text('Hora: ${voucher.time}'),
            Text('Total: \$${voucher.total.toStringAsFixed(2)}'),
            const SizedBox(height: 10),
            const Text('Puedes revisar este comprobante en la sección de Agendamientos de tu perfil.', style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        actions: [
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                cartProvider.clearCart();
                Navigator.of(ctx).pop(); // Cierra el modal
                Navigator.of(context).popUntil((route) => route.isFirst || route.settings.name == '/scheduling' || route.settings.name == '/home'); // Vuelve al inicio
              },
              child: const Text('Aceptar'),
            ),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalles del Servicio'),
        backgroundColor: AppTheme.appBarDark,
        foregroundColor: Colors.white,
      ),
      backgroundColor: AppTheme.backgroundWhite,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Tamaño de los muebles', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(border: OutlineInputBorder()),
              hint: const Text('Selecciona una opción'),
              value: _tamanoMuebles,
              items: ['Pequeño', 'Mediano', 'Grande', 'Extra Grande']
                  .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                  .toList(),
              onChanged: (value) => setState(() => _tamanoMuebles = value),
            ),
            const SizedBox(height: 20),
            const Text('Fecha y Hora', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _presentDatePicker,
                    icon: const Icon(Icons.calendar_today),
                    label: Text(_selectedDate == null ? 'Fecha' : DateFormat('dd/MM/yyyy').format(_selectedDate!)),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _presentTimePicker,
                    icon: const Icon(Icons.access_time),
                    label: Text(_selectedTime == null ? 'Hora' : _selectedTime!.format(context)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submitOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('Confirmar Reserva', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }
}
