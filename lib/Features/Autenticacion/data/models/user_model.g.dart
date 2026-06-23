// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserModel _$UserModelFromJson(Map<String, dynamic> json) => UserModel(
  idUsuario: (json['Id_Usuario'] as num).toInt(),
  nombre: json['Nombre'] as String,
  correo: json['Correo'] as String,
  telefono: json['Telefono'] as String?,
  nDocumento: json['N_Documento'] as String?,
  direccion: json['Direccion'] as String?,
  rolId: (json['rol_Id_Rol'] as num?)?.toInt(),
  fotoPerfil: json['foto_perfil'] as String?,
);

Map<String, dynamic> _$UserModelToJson(UserModel instance) => <String, dynamic>{
  'Id_Usuario': instance.idUsuario,
  'Nombre': instance.nombre,
  'Correo': instance.correo,
  'Telefono': instance.telefono,
  'N_Documento': instance.nDocumento,
  'Direccion': instance.direccion,
  'rol_Id_Rol': instance.rolId,
  'foto_perfil': instance.fotoPerfil,
};
