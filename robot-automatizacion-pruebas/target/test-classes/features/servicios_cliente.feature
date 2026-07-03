# language: es
Característica: Servicios del Cliente
  Como cliente de la aplicación
  Quiero consultar, programar y cotizar servicios de limpieza
  Para poder mantener mis muebles limpios según mi disponibilidad

  @hu-16
  Escenario: Consulta de servicios disponibles
    Dado que el cliente accede al catalogo de servicios
    Cuando filtra por tipo de mobiliario
    Entonces deberia ver el listado de servicios con nombre, descripcion y precio

  @hu-17
  Escenario: Solicitud de cotizacion
    Dado que el cliente desea saber el costo estimado de un servicio
    Cuando envia el formulario de cotizacion con sus datos validos
    Entonces la solicitud deberia guardarse como pendiente y enviar una notificacion

  @hu-11
  Escenario: Programacion de servicio de limpieza
    Dado que el cliente selecciono un servicio
    Cuando escoge fecha, hora y ubicacion disponibles
    Entonces el servicio deberia agendarse y recibir una confirmacion automatica

  @hu-10
  Escenario: Consulta del historial de servicios
    Dado que el cliente ha iniciado sesion
    Cuando accede a la seccion de su perfil
    Entonces deberia ver el listado de sus servicios pasados con fecha y estado
