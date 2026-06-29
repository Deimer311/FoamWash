import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:foamwash/theme.dart';
import 'package:provider/provider.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
class MisCotizacionesView extends StatefulWidget {
  const MisCotizacionesView({Key? key}) : super(key: key);

  @override
  State<MisCotizacionesView> createState() => _MisCotizacionesViewState();
}

class _MisCotizacionesViewState extends State<MisCotizacionesView> {
  List<Map<String, dynamic>> _cotizaciones = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCotizaciones();
  }

  Future<void> _loadCotizaciones() async {
    setState(() => _isLoading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final List<String> currentList = prefs.getStringList('mis_cotizaciones') ?? [];
      
      final now = DateTime.now();
      final List<Map<String, dynamic>> validas = [];
      final List<String> paraGuardar = [];

      for (final itemStr in currentList) {
        try {
          final Map<String, dynamic> item = jsonDecode(itemStr);
          final expiraStr = item['expiraEn'];
          if (expiraStr != null) {
            final expiraDate = DateTime.tryParse(expiraStr);
            if (expiraDate != null && expiraDate.isAfter(now)) {
              validas.add(item);
              paraGuardar.add(itemStr);
            }
          }
        } catch (_) {}
      }

      // Actualizar prefs limpiando las expiradas
      if (paraGuardar.length != currentList.length) {
        await prefs.setStringList('mis_cotizaciones', paraGuardar);
      }

      // Ordenar de más reciente a más antigua
      validas.sort((a, b) {
        final dateA = DateTime.tryParse(a['creadoEn'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
        final dateB = DateTime.tryParse(b['creadoEn'] ?? '') ?? DateTime.fromMillisecondsSinceEpoch(0);
        return dateB.compareTo(dateA);
      });

      setState(() {
        _cotizaciones = validas;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading cotizaciones: $e');
      setState(() => _isLoading = false);
    }
  }

  void _showVoucherDetails(Map<String, dynamic> cotizacion) {
    final DateTime? fechaObj = cotizacion['fecha'] != null ? DateTime.tryParse(cotizacion['fecha'].toString()) : null;
    final String fecha = fechaObj != null ? DateFormat('dd/MM/yyyy').format(fechaObj) : 'N/A';
    final String hora = cotizacion['Hora']?.toString() ?? 'N/A';
    
    final List<dynamic> servicios = cotizacion['servicios'] ?? [];
    double total = double.tryParse(cotizacion['total']?.toString() ?? '0') ?? 0;
    
    if (total == 0 && servicios.isNotEmpty) {
      total = servicios.fold(0.0, (sum, s) {
        final p = double.tryParse(s['Precio']?.toString() ?? '0') ?? 0;
        final c = double.tryParse(s['cantidad']?.toString() ?? '1') ?? 1;
        return sum + (p * c);
      });
    }

    final DateTime? expiraObj = cotizacion['expiraEn'] != null ? DateTime.tryParse(cotizacion['expiraEn'].toString()) : null;
    final String expiraStr = expiraObj != null ? DateFormat('dd/MM/yyyy HH:mm').format(expiraObj) : 'N/A';

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        child: Container(
          padding: const EdgeInsets.all(20),
          width: double.infinity,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Column(
                    children: [
                      const Icon(Icons.receipt, color: AppTheme.primaryBlue, size: 40),
                      const SizedBox(height: 8),
                      const Text('Detalle de Cotización', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text('COT-${cotizacion['ID_Reserva']}', style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.orange.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    children: [
                      const Icon(Icons.timer, color: Colors.orange),
                      const SizedBox(width: 8),
                      Expanded(child: Text('Válido hasta: $expiraStr', style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold))),
                    ],
                  ),
                ),
                
                const Divider(height: 32),
                
                const Text('Resumen', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                Text('Fecha sugerida: $fecha  •  Hora: $hora', style: const TextStyle(fontSize: 14)),
                const SizedBox(height: 12),
                
                ...servicios.map((s) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text('• ${s['Nombre_Servicio']}')),
                      Text('\$${double.tryParse(s['Precio']?.toString() ?? '0')?.toStringAsFixed(0)}'),
                    ],
                  ),
                )).toList(),
                
                const Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    Text('\$${total.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primaryBlue)),
                  ],
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryBlue, 
                      foregroundColor: Colors.white, 
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text('Cerrar', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            } else {
              final auth = Provider.of<AuthProvider>(context, listen: false);
              if (auth.isAuthenticated) {
                Navigator.pushReplacementNamed(context, '/cliente-cotizacion');
              } else {
                Navigator.pushReplacementNamed(context, '/cotizador');
              }
            }
          },
        ),
        title: const Text('Mis Cotizaciones'),
        backgroundColor: AppTheme.appBarDark,
        foregroundColor: Colors.white,
      ),
      backgroundColor: AppTheme.backgroundWhite,
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadCotizaciones,
              child: _cotizaciones.isEmpty
                  ? ListView(
                      children: const [
                        SizedBox(height: 200),
                        Center(child: Text('No tienes cotizaciones guardadas.', style: TextStyle(color: Colors.grey))),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _cotizaciones.length,
                      itemBuilder: (context, index) {
                        final cotizacion = _cotizaciones[index];
                        final DateTime? fechaObj = cotizacion['fecha'] != null ? DateTime.tryParse(cotizacion['fecha'].toString()) : null;
                        final String fechaStr = fechaObj != null ? DateFormat('dd/MM/yyyy').format(fechaObj) : 'N/A';
                        
                        double total = double.tryParse(cotizacion['total']?.toString() ?? '0') ?? 0;
                        if (total == 0 && (cotizacion['servicios'] as List?)?.isNotEmpty == true) {
                          total = (cotizacion['servicios'] as List).fold(0.0, (sum, s) {
                            final p = double.tryParse(s['Precio']?.toString() ?? '0') ?? 0;
                            final c = double.tryParse(s['cantidad']?.toString() ?? '1') ?? 1;
                            return sum + (p * c);
                          });
                        }

                        return Card(
                          color: AppTheme.cardWhite,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: const Icon(Icons.request_quote, color: AppTheme.primaryBlue, size: 40),
                            title: Text('Sugerida: $fechaStr', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('COT-${cotizacion['ID_Reserva']}\nTotal: \$${total.toStringAsFixed(0)}'),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: const [
                                Text('Local', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
                                Icon(Icons.chevron_right, size: 20),
                              ],
                            ),
                            isThreeLine: true,
                            onTap: () => _showVoucherDetails(cotizacion),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
