// Clase modelo que representa la entidad Servicio definida en el esquema de la base de datos (Prisma).
// Se encarga de tipar la informacion proveniente de las respuestas de la API.
class ServiceModel {
  final int idServicio;
  final String nombreServicio;
  final String precio;
  final String descripcion;
  final String? imagenUrl;
  final String estado;
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

  // Metodo factory para deserializar el objeto JSON devuelto por el servidor HTTP.
  // Mapea de manera estricta las llaves de la base de datos a las propiedades de la clase en Dart.
  factory ServiceModel.fromJson(Map<String, dynamic> json) {
    return ServiceModel(
      idServicio: json['Id_Servicio'] ?? 0,
      nombreServicio: json['Nombre_Servicio'] ?? '',
      precio: json['Precio']?.toString() ?? '0',
      descripcion: json['descripcion'] ?? '',
      imagenUrl: json['imagen_url'],
      estado: json['estado'] ?? 'activo',
      duracionEstimada: json['duracion_estimada'],
    );
  }
}
