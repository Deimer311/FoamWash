import 'package:json_annotation/json_annotation.dart';

part 'service_model.g.dart';

@JsonSerializable()
class ServiceModel {
  @JsonKey(name: 'Id_Servicio')
  final int idServicio;

  @JsonKey(name: 'Nombre_Servicio')
  final String nombreServicio;

  @JsonKey(name: 'Precio', fromJson: _precioFromJson)
  final String precio;

  @JsonKey(name: 'descripcion')
  final String descripcion;

  @JsonKey(name: 'imagen_url')
  final String? imagenUrl;

  @JsonKey(name: 'estado', defaultValue: 'activo')
  final String estado;

  @JsonKey(name: 'duracion_estimada')
  final String? duracionEstimada;

  ServiceModel({
    required this.idServicio,
    required this.nombreServicio,
    required this.precio,
    required this.descripcion,
    this.imagenUrl,
    this.estado = 'activo',
    this.duracionEstimada,
  });

  static String _precioFromJson(dynamic value) {
    if (value == null) return '0.00';
    return value.toString();
  }

  factory ServiceModel.fromJson(Map<String, dynamic> json) => _$ServiceModelFromJson(json);

  Map<String, dynamic> toJson() => _$ServiceModelToJson(this);
}
