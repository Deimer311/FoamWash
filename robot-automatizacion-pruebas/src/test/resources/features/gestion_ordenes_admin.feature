# language: es
Característica: Gestión de órdenes por el Administrador
  Como administrador del sistema
  Quiero administrar órdenes de servicio y asignar empleados
  Para asegurar la correcta atención y distribución del trabajo

  @hu-06
  Escenario: Creacion y administracion de ordenes de servicio
    Dado que el administrador se encuentra en la gestion de ordenes
    Cuando crea una nueva orden asociada a un cliente
    Entonces la orden deberia registrarse correctamente en el sistema

  @hu-14
  Escenario: Validacion de disponibilidad de empleados
    Dado que el administrador necesita asignar una orden
    Cuando consulta la agenda de los empleados
    Entonces deberia poder ver los bloques ocupados y libres

  @hu-13
  Escenario: Asignacion de servicio a un empleado disponible
    Dado que el administrador ha validado la disponibilidad
    Cuando asigna una orden a un empleado libre
    Entonces la orden deberia quedar vinculada a dicho empleado
