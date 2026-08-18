# language: es
Característica: Autenticación y gestión de perfil
  Como usuario del sistema Foam Wash
  Quiero registrarme, iniciar sesión y gestionar mi perfil
  Para poder acceder a los servicios y mantener mi información actualizada

  @hu-01
  Escenario: Registro exitoso en el sistema como cliente
    Dado que el usuario se encuentra en la pagina de registro
    Cuando llena el formulario con sus datos validos
    Entonces deberia ver un mensaje de confirmacion de registro

  @hu-02
  Escenario: Inicio de sesión exitoso
    Dado que el usuario se encuentra en la pagina de inicio de sesion
    Cuando ingresa credenciales validas de cliente
    Entonces deberia acceder a su panel principal

  @hu-02-negativo
  Escenario: Inicio de sesión fallido por credenciales invalidas
    Dado que el usuario se encuentra en la pagina de inicio de sesion
    Cuando ingresa credenciales invalidas
    Entonces deberia ver un mensaje de error indicando fallo de autenticacion

  @hu-03
  Escenario: Recuperacion de contraseña
    Dado que el usuario olvido su contraseña
    Cuando solicita la recuperacion de contraseña con su correo
    Entonces deberia recibir un enlace de recuperacion valido

  @hu-05
  Escenario: Edicion del perfil de usuario
    Dado que el cliente ha iniciado sesion en el sistema
    Cuando edita su perfil con nueva informacion
    Entonces los cambios deberian guardarse correctamente y ver un mensaje de confirmacion
