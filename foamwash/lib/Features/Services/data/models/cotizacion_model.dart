import 'package:json_annotation/json_annotation.dart';

part 'cotizacion_model.g.dart';

@JsonSerializable()
class CotizacionModel {
  @JsonKey(name: 'Id_Cotizacion')
  final int idCotizacion;

  @JsonKey(name: 'Id_usuario')
  final int idUsuario;

  @JsonKey(name: 'Precio_cotizado')
  final double precioCotizado;

  @JsonKey(name: 'Cantidad')
  final int cantidad;

  @JsonKey(name: 'Tamaño')
  final String tamano;

  @JsonKey(name: 'fecha_cotizacion')
  final String? fechaCotizacion;

  @JsonKey(name: 'Id_servicio')
  final int? idServicio;

  CotizacionModel({
    required this.idCotizacion,
    required this.idUsuario,
    required this.precioCotizado,
    required this.cantidad,
    required this.tamano,
    this.fechaCotizacion,
    this.idServicio,
  });

  factory CotizacionModel.fromJson(Map<String, dynamic> json) => _$CotizacionModelFromJson(json);

  Map<String, dynamic> toJson() => _$CotizacionModelToJson(this);
}
