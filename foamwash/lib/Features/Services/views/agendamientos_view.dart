import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:foamwash/theme.dart';
import 'package:foamwash/Features/Autenticacion/providers/auth_provider.dart';
import 'package:foamwash/core/cache/secure_storage_service.dart';
import 'package:foamwash/Api/api_constants.dart';

class AgendamientosView extends StatefulWidget {
  const AgendamientosView({Key? key}) : super(key: key);

  @override
  State<AgendamientosView> createState() => _AgendamientosViewState();
}

class _AgendamientosViewState extends State<AgendamientosView> {
  List<dynamic> _reservas = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchReservas();
    });
  }

  Future<void> _fetchReservas() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final userId = auth.user?.idUsuario;
    
    if (userId == null) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      final token = await SecureStorageService().read('token') ?? '';
      final url = Uri.parse('${ApiConstants.baseUrl}/usuarios/analytics/historial-cliente/$userId');
      
      final res = await http.get(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (res.statusCode == 200 || res.statusCode == 201) {
        final body = jsonDecode(res.body);
        if (body['success'] == true) {
          setState(() {
            final now = DateTime.now();
            final allReservas = List<Map<String, dynamic>>.from(body['data'] ?? []);
            _reservas = allReservas.where((r) {
              final status = r['Estado'];
              if (status == 'Completado' || status == 'Finalizado' || status == 'Cancelado') {
                final fechaObj = r['fecha'] != null ? DateTime.tryParse(r['fecha'].toString()) : null;
                if (fechaObj != null && now.difference(fechaObj).inDays > 7) {
                  return false;
                }
              }
              return true;
            }).toList();
            _isLoading = false;
          });
          return;
        }
      }
    } catch (e) {
      debugPrint('Error fetching reservas: $e');
    }

    setState(() => _isLoading = false);
  }

  void _showVoucherDetails(Map<String, dynamic> reserva) {
    final status = reserva['Estado'] ?? 'Pendiente';
    
    final List<String> steps = ['Pendiente', 'Confirmado', 'En Camino', 'En Proceso', 'Completado'];
    int currentStep = steps.indexOf(status);
    
    if (status == 'Aceptado') currentStep = 1;
    
    final bool isCanceled = status == 'Cancelado';
    if (isCanceled) currentStep = -1;
    if (currentStep == -1 && !isCanceled) currentStep = 0; 

    final DateTime? fechaObj = reserva['fecha'] != null ? DateTime.tryParse(reserva['fecha'].toString()) : null;
    final String fecha = fechaObj != null ? DateFormat('dd/MM/yyyy').format(fechaObj) : 'N/A';
    
    final DateTime? horaObj = reserva['Hora'] != null ? DateTime.tryParse(reserva['Hora'].toString()) : null;
    final String hora = horaObj != null ? DateFormat('HH:mm').format(horaObj) : 'N/A';
    
    final List<dynamic> servicios = reserva['servicios'] ?? [];
    double total = 0;
    for (var s in servicios) {
      total += double.tryParse(s['Precio']?.toString() ?? '0') ?? 0;
    }

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
                      const Icon(Icons.receipt_long, color: AppTheme.primaryBlue, size: 40),
                      const SizedBox(height: 8),
                      const Text('Detalle de Reserva', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      Text('ID: PED-${reserva['ID_Reserva']}', style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                
                const Text('Estado del Servicio', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 12),
                if (isCanceled)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: const [
                        Icon(Icons.cancel, color: Colors.red),
                        SizedBox(width: 8),
                        Text('Reserva Cancelada', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  )
                else
                  _buildTrackerTimeline(currentStep, steps),
                
                const Divider(height: 32),
                
                const Text('Resumen', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 8),
                Text('Fecha: $fecha  •  Hora: $hora', style: const TextStyle(fontSize: 14)),
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

  Widget _buildTrackerTimeline(int currentStep, List<String> steps) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(steps.length, (index) {
        final bool isCompleted = index <= currentStep;
        final bool isLast = index == steps.length - 1;
        
        Color color = isCompleted ? AppTheme.primaryBlue : Colors.grey.shade300;
        
        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                children: [
                  Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      color: isCompleted ? AppTheme.primaryBlue : Colors.white,
                      border: Border.all(color: color, width: 2),
                      shape: BoxShape.circle,
                    ),
                    child: isCompleted ? const Icon(Icons.check, size: 16, color: Colors.white) : null,
                  ),
                  if (!isLast)
                    Expanded(
                      child: Container(
                        width: 2,
                        color: color,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Text(
                    steps[index],
                    style: TextStyle(
                      fontWeight: isCompleted ? FontWeight.bold : FontWeight.normal,
                      color: isCompleted ? Colors.black87 : Colors.grey,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      }),
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
          : RefreshIndicator(
              onRefresh: _fetchReservas,
              child: _reservas.isEmpty
                  ? ListView(
                      children: const [
                        SizedBox(height: 200),
                        Center(child: Text('No tienes agendamientos registrados.', style: TextStyle(color: Colors.grey))),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _reservas.length,
                      itemBuilder: (context, index) {
                        final reserva = _reservas[index];
                        final DateTime? fechaObj = reserva['fecha'] != null ? DateTime.tryParse(reserva['fecha'].toString()) : null;
                        final String fechaStr = fechaObj != null ? DateFormat('dd/MM/yyyy').format(fechaObj) : 'N/A';
                        
                        final List<dynamic> servicios = reserva['servicios'] ?? [];
                        double total = 0;
                        for (var s in servicios) {
                          total += double.tryParse(s['Precio']?.toString() ?? '0') ?? 0;
                        }

                        return Card(
                          color: AppTheme.cardWhite,
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: const Icon(Icons.local_car_wash, color: AppTheme.primaryBlue, size: 40),
                            title: Text('Reserva: $fechaStr', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('ID: PED-${reserva['ID_Reserva']}\nTotal: \$${total.toStringAsFixed(0)}'),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(reserva['Estado'] ?? 'Pendiente', style: TextStyle(color: reserva['Estado'] == 'Cancelado' ? Colors.red : AppTheme.primaryBlue, fontWeight: FontWeight.bold, fontSize: 12)),
                                const Icon(Icons.chevron_right, size: 20),
                              ],
                            ),
                            isThreeLine: true,
                            onTap: () => _showVoucherDetails(reserva),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
