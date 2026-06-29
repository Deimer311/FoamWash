import 'package:json_annotation/json_annotation.dart';

part 'reserva_model.g.dart';

@JsonSerializable()
class ReservaModel {
  @JsonKey(name: 'ID_Reserva')
  final int idReserva;

  @JsonKey(name: 'Estado')
  final String estado;

  @JsonKey(name: 'Id_Usuario')
  final int idUsuario;

  @JsonKey(name: 'fecha')
  final String fecha;

  @JsonKey(name: 'Hora')
  final String hora;

  @JsonKey(name: 'Informacion_adicional')
  final String? informacionAdicional;

  @JsonKey(name: 'observacion_Id_Observaciones')
  final int observacionId;

  @JsonKey(name: 'empleado_Id_Usuario')
  final int? empleadoId;

  ReservaModel({
    required this.idReserva,
    required this.estado,
    required this.idUsuario,
    required this.fecha,
    required this.hora,
    this.informacionAdicional,
    required this.observacionId,
    this.empleadoId,
  });

  factory ReservaModel.fromJson(Map<String, dynamic> json) => _$ReservaModelFromJson(json);

  Map<String, dynamic> toJson() => _$ReservaModelToJson(this);
}
