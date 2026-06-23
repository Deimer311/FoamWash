import 'package:json_annotation/json_annotation.dart';

part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  @JsonKey(name: 'Id_Usuario')
  final int idUsuario;

  @JsonKey(name: 'Nombre')
  final String nombre;

  @JsonKey(name: 'Correo')
  final String correo;

  @JsonKey(name: 'Telefono')
  final String? telefono;

  @JsonKey(name: 'N_Documento')
  final String? nDocumento;

  @JsonKey(name: 'Direccion')
  final String? direccion;

  @JsonKey(name: 'rol_Id_Rol')
  final int? rolId;

  @JsonKey(name: 'foto_perfil')
  final String? fotoPerfil;

  UserModel({
    required this.idUsuario,
    required this.nombre,
    required this.correo,
    this.telefono,
    this.nDocumento,
    this.direccion,
    this.rolId,
    this.fotoPerfil,
  });

  // El método factory que llama a la función generada automáticamente
  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);

  // El método toJson que llama a la función generada automáticamente
  Map<String, dynamic> toJson() => _$UserModelToJson(this);
}
