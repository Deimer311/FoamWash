// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cotizacion_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CotizacionModel _$CotizacionModelFromJson(Map<String, dynamic> json) =>
    CotizacionModel(
      idCotizacion: (json['Id_Cotizacion'] as num).toInt(),
      idUsuario: (json['Id_usuario'] as num).toInt(),
      precioCotizado: (json['Precio_cotizado'] as num).toDouble(),
      cantidad: (json['Cantidad'] as num).toInt(),
      tamano: json['Tamaño'] as String,
      fechaCotizacion: json['fecha_cotizacion'] as String?,
      idServicio: (json['Id_servicio'] as num?)?.toInt(),
    );

Map<String, dynamic> _$CotizacionModelToJson(CotizacionModel instance) =>
    <String, dynamic>{
      'Id_Cotizacion': instance.idCotizacion,
      'Id_usuario': instance.idUsuario,
      'Precio_cotizado': instance.precioCotizado,
      'Cantidad': instance.cantidad,
      'Tamaño': instance.tamano,
      'fecha_cotizacion': instance.fechaCotizacion,
      'Id_servicio': instance.idServicio,
    };
