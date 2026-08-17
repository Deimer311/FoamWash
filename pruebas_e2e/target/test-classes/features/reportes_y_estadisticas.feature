# language: es
Característica: Reportes y Estadísticas
  Como administrador del sistema
  Quiero visualizar estadísticas y generar reportes
  Para evaluar el rendimiento y tomar decisiones estratégicas

  @hu-19
  Escenario: Visualizacion de estadisticas del sistema
    Dado que el administrador accede al dashboard de estadisticas
    Cuando el sistema carga los datos
    Entonces deberia ver graficas de uso, ingresos y servicios realizados

  @hu-18
  Escenario: Generacion de reportes de servicios e ingresos
    Dado que el administrador necesita un reporte detallado
    Cuando filtra los datos por fecha y tipo de servicio
    Entonces deberia poder exportar el reporte en formato PDF o Excel

  @hu-20
  Escenario: Exportacion de datos historicos
    Dado que el administrador requiere respaldar la informacion
    Cuando selecciona la opcion de exportar historial
    Entonces el sistema deberia descargar los indicadores y reportes seleccionados
