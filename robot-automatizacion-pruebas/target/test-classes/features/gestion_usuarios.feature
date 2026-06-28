# language: es
Característica: Gestión de usuarios
  Como administrador del sistema
  Quiero gestionar usuarios y roles
  Para controlar el acceso al sistema

  @hu-04
  Escenario: Edicion y desactivacion de usuarios
    Dado que el administrador ha iniciado sesion
    Cuando accede al panel de administracion de usuarios
    Y desactiva a un usuario del sistema
    Entonces el usuario no deberia poder acceder a la plataforma
