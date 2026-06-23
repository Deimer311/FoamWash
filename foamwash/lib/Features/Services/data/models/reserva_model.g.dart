// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reserva_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ReservaModel _$ReservaModelFromJson(Map<String, dynamic> json) => ReservaModel(
  idReserva: (json['ID_Reserva'] as num).toInt(),
  estado: json['Estado'] as String,
  idUsuario: (json['Id_Usuario'] as num).toInt(),
  fecha: json['fecha'] as String,
  hora: json['Hora'] as String,
  informacionAdicional: json['Informacion_adicional'] as String?,
  observacionId: (json['observacion_Id_Observaciones'] as num).toInt(),
  empleadoId: (json['empleado_Id_Usuario'] as num?)?.toInt(),
);

Map<String, dynamic> _$ReservaModelToJson(ReservaModel instance) =>
    <String, dynamic>{
      'ID_Reserva': instance.idReserva,
      'Estado': instance.estado,
      'Id_Usuario': instance.idUsuario,
      'fecha': instance.fecha,
      'Hora': instance.hora,
      'Informacion_adicional': instance.informacionAdicional,
      'observacion_Id_Observaciones': instance.observacionId,
      'empleado_Id_Usuario': instance.empleadoId,
    };
