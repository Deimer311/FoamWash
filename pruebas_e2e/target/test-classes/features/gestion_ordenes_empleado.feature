# language: es
Característica: Gestión de órdenes por el Empleado
  Como empleado del sistema
  Quiero visualizar, gestionar y finalizar mis servicios asignados
  Para llevar un control de mi jornada laboral

  @hu-12
  Escenario: Visualizacion de agenda de servicios
    Dado que el empleado accede a su panel
    Cuando revisa su agenda de servicios
    Entonces deberia ver el listado de ordenes asignadas por fecha y hora

  @hu-07
  Escenario: Consulta de detalles de la orden
    Dado que el empleado tiene una orden asignada
    Cuando visualiza los detalles de la orden
    Entonces deberia ver el tipo de servicio, observaciones y ubicacion

  @hu-09
  Escenario: Registro de observaciones del servicio
    Dado que el empleado esta atendiendo una orden
    Cuando agrega observaciones sobre el servicio realizado
    Entonces las observaciones deberian quedar guardadas en la orden

  @hu-08
  Escenario: Finalizacion de un servicio
    Dado que el empleado ha terminado el servicio
    Cuando marca la orden como finalizada
    Entonces el estado de la orden deberia actualizarse en el sistema

  @hu-15
  Escenario: Recepcion de notificaciones de nuevos servicios
    Dado que el administrador asigna un nuevo servicio
    Cuando el sistema notifica al empleado
    Entonces el empleado deberia ver los detalles del nuevo servicio
