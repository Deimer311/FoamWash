import 'dart:convert';

class VoucherModel {
  final String id;
  final List<String> serviceNames;
  final double total;
  final String date;
  final String time;
  final String address;
  final String status;

  VoucherModel({
    required this.id,
    required this.serviceNames,
    required this.total,
    required this.date,
    required this.time,
    required this.address,
    this.status = 'Agendado',
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'serviceNames': serviceNames,
    'total': total,
    'date': date,
    'time': time,
    'address': address,
    'status': status,
  };

  factory VoucherModel.fromJson(Map<String, dynamic> json) => VoucherModel(
    id: json['id'] ?? '',
    serviceNames: List<String>.from(json['serviceNames'] ?? []),
    total: json['total'] != null ? (json['total'] as num).toDouble() : 0.0,
    date: json['date'] ?? '',
    time: json['time'] ?? '',
    address: json['address'] ?? '',
    status: json['status'] ?? 'Agendado',
  );
}
