import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Services/data/models/voucher_model.dart';

class AgendamientosView extends StatefulWidget {
  const AgendamientosView({Key? key}) : super(key: key);

  @override
  State<AgendamientosView> createState() => _AgendamientosViewState();
}

class _AgendamientosViewState extends State<AgendamientosView> {
  List<VoucherModel> _vouchers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadVouchers();
  }

  Future<void> _loadVouchers() async {
    final prefs = await SharedPreferences.getInstance();
    final vouchersListStr = prefs.getStringList('user_vouchers') ?? [];
    
    final List<VoucherModel> loaded = [];
    for (var vStr in vouchersListStr) {
      try {
        final Map<String, dynamic> vJson = jsonDecode(vStr);
        loaded.add(VoucherModel.fromJson(vJson));
      } catch (e) {
        // Ignorar
      }
    }

    setState(() {
      _vouchers = loaded;
      _isLoading = false;
    });
  }

  void _showVoucherDetails(VoucherModel voucher) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Center(
          child: Column(
            children: [
              Icon(Icons.receipt_long, color: AppTheme.primaryBlue, size: 50),
              SizedBox(height: 10),
              Text('Detalle de Reserva', textAlign: TextAlign.center),
            ],
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('ID: ${voucher.id}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const Divider(),
            const Text('Servicios:', style: TextStyle(fontWeight: FontWeight.bold)),
            ...voucher.serviceNames.map((s) => Text('- $s')).toList(),
            const Divider(),
            Text('Fecha: ${voucher.date}'),
            Text('Hora: ${voucher.time}'),
            Text('Dirección: ${voucher.address}'),
            const SizedBox(height: 10),
            Text('Total: \$${voucher.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 10),
            Text('Estado: ${voucher.status}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cerrar'),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis Agendamientos'),
        backgroundColor: AppTheme.appBarDark,
        foregroundColor: Colors.white,
      ),
      backgroundColor: AppTheme.backgroundWhite,
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : _vouchers.isEmpty
              ? const Center(child: Text('No tienes agendamientos registrados.', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _vouchers.length,
                  itemBuilder: (context, index) {
                    final voucher = _vouchers[index];
                    return Card(
                      color: AppTheme.cardWhite,
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        leading: const Icon(Icons.calendar_month, color: AppTheme.primaryBlue, size: 40),
                        title: Text('Reserva: ${voucher.date}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('ID: ${voucher.id}\nTotal: \$${voucher.total.toStringAsFixed(2)}'),
                        trailing: const Icon(Icons.chevron_right),
                        isThreeLine: true,
                        onTap: () => _showVoucherDetails(voucher),
                      ),
                    );
                  },
                ),
    );
  }
}
