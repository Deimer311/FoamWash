import 'package:json_annotation/json_annotation.dart';

part 'service_model.g.dart';

@JsonSerializable()
class ServiceModel {
  @JsonKey(name: 'Id_Servicio')
  final int idServicio;

  @JsonKey(name: 'Nombre_Servicio')
  final String nombreServicio;

  @JsonKey(name: 'Precio')
  final String precio;

  @JsonKey(name: 'descripcion')
  final String descripcion;

  @JsonKey(name: 'imagen_url')
  final String? imagenUrl;

  @JsonKey(name: 'estado')
  final String estado;

  @JsonKey(name: 'duracion_estimada')
  final String? duracionEstimada;

  ServiceModel({
    required this.idServicio,
    required this.nombreServicio,
    required this.precio,
    required this.descripcion,
    this.imagenUrl,
    required this.estado,
    this.duracionEstimada,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) => _$ServiceModelFromJson(json);

  Map<String, dynamic> toJson() => _$ServiceModelToJson(this);
}
