// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'service_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ServiceModel _$ServiceModelFromJson(Map<String, dynamic> json) => ServiceModel(
  idServicio: (json['Id_Servicio'] as num).toInt(),
  nombreServicio: json['Nombre_Servicio'] as String,
  precio: json['Precio'] as String,
  descripcion: json['descripcion'] as String,
  imagenUrl: json['imagen_url'] as String?,
  estado: json['estado'] as String,
  duracionEstimada: json['duracion_estimada'] as String?,
);

Map<String, dynamic> _$ServiceModelToJson(ServiceModel instance) =>
    <String, dynamic>{
      'Id_Servicio': instance.idServicio,
      'Nombre_Servicio': instance.nombreServicio,
      'Precio': instance.precio,
      'descripcion': instance.descripcion,
      'imagen_url': instance.imagenUrl,
      'estado': instance.estado,
      'duracion_estimada': instance.duracionEstimada,
    };
