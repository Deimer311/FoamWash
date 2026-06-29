import 'package:json_annotation/json_annotation.dart';

part 'empleado_model.g.dart';

@JsonSerializable()
class EmpleadoModel {
  @JsonKey(name: 'Id_Usuario')
  final int id;

  @JsonKey(name: 'Nombre')
  final String nombre;

  @JsonKey(name: 'Correo')
  final String correo;

  @JsonKey(name: 'Telefono')
  final String? telefono;

  final String? estado;

  @JsonKey(name: 'foto_perfil')
  final String? fotoPerfil;

  EmpleadoModel({
    required this.id,
    required this.nombre,
    required this.correo,
    this.telefono,
    this.estado,
    this.fotoPerfil,
  });

  factory EmpleadoModel.fromJson(Map<String, dynamic> json) =>
      _$EmpleadoModelFromJson(json);

  Map<String, dynamic> toJson() => _$EmpleadoModelToJson(this);
}
