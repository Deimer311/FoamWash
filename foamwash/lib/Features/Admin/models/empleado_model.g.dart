// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'empleado_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

EmpleadoModel _$EmpleadoModelFromJson(Map<String, dynamic> json) =>
    EmpleadoModel(
      id: (json['Id_Usuario'] as num).toInt(),
      nombre: json['Nombre'] as String,
      correo: json['Correo'] as String,
      telefono: json['Telefono'] as String?,
      estado: json['estado'] as String?,
      fotoPerfil: json['foto_perfil'] as String?,
    );

Map<String, dynamic> _$EmpleadoModelToJson(EmpleadoModel instance) =>
    <String, dynamic>{
      'Id_Usuario': instance.id,
      'Nombre': instance.nombre,
      'Correo': instance.correo,
      'Telefono': instance.telefono,
      'estado': instance.estado,
      'foto_perfil': instance.fotoPerfil,
    };
