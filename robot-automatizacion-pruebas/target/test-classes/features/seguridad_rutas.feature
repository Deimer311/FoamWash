# language: es
Característica: Seguridad y Proteccion de Rutas
  Como administrador del sistema Foam Wash
  Quiero que las rutas protegidas no sean accesibles para usuarios sin los permisos adecuados
  Para garantizar la seguridad de la informacion del negocio

  @hu-seguridad-01
  Escenario: Un cliente no puede acceder al panel de administrador
    Dado que el cliente ha iniciado sesion en el sistema
    Cuando intenta navegar forzadamente a la ruta "/admin"
    Entonces el sistema deberia impedirle el acceso y redirigirlo
