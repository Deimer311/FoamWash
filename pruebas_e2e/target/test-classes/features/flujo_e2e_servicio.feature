# language: es
Característica: Flujo End-to-End de Servicio
  Como dueño del negocio Foam Wash
  Quiero asegurar que todo el ciclo de vida de una orden funcione correctamente
  Para que los clientes, administradores y empleados interactuen sin problemas

  @hu-e2e-01
  Escenario: Ciclo de vida completo de un servicio (Agendar -> Aprobar -> Completar)
    Dado que "Carlos el Cliente" agenda un servicio de limpieza
    Cuando "Ana la Administradora" aprueba la orden y se la asigna a "Pedro el Trabajador"
    Y "Pedro el Trabajador" atiende y marca la orden como completada
    Entonces "Carlos el Cliente" deberia ver la orden como finalizada en su historial
