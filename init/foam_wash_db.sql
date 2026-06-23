-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-03-2026 a las 04:31:26
-- Versión del servidor: 8.4.6
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `foam_wash_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificacion`
--

CREATE TABLE `calificacion` (
  `Id_Calificacion` int NOT NULL,
  `empleado_Id_Usuario` int NOT NULL COMMENT 'FK: Empleado calificado',
  `reserva_ID_Reserva` int NOT NULL COMMENT 'FK: Reserva calificada',
  `puntaje` decimal(2,1) NOT NULL COMMENT 'Calificación del 1 al 5',
  `comentario` text COLLATE utf8mb4_general_ci COMMENT 'Comentario del cliente',
  `es_positivo` tinyint(1) DEFAULT '1' COMMENT '1=positivo, 0=negativo',
  `fecha_calificacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `calificacion`
--

INSERT INTO `calificacion` (`Id_Calificacion`, `empleado_Id_Usuario`, `reserva_ID_Reserva`, `puntaje`, `comentario`, `es_positivo`, `fecha_calificacion`) VALUES
(1, 3, 10, 4.8, 'Excelente servicio, muy puntual', 1, '2026-02-23 15:00:08'),
(2, 3, 15, 5.0, 'Perfecto, quedó como nuevo', 1, '2026-02-23 15:00:08'),
(3, 3, 16, 4.5, 'Muy buen trabajo, recomendado', 1, '2026-02-23 15:00:08'),
(4, 3, 17, 4.9, 'Rápido y eficiente', 1, '2026-02-23 15:00:08'),
(5, 3, 18, 4.7, 'Buen servicio', 1, '2026-02-23 15:00:08');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizacion`
--

CREATE TABLE `cotizacion` (
  `Id_Cotizacion` int NOT NULL COMMENT 'PK: Identificador único de la cotización',
  `Id_usuario` int NOT NULL COMMENT 'FK: Usuario que realizó la cotización',
  `Precio_cotizado` decimal(10,2) NOT NULL COMMENT 'Precio final de la cotización',
  `Cantidad` int NOT NULL COMMENT 'Cantidad de servicios cotizados',
  `Tamaño` varchar(45) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Tamaño del mueble',
  `fecha_cotizacion` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la cotización',
  `Id_servicio` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cotizacion`
--

INSERT INTO `cotizacion` (`Id_Cotizacion`, `Id_usuario`, `Precio_cotizado`, `Cantidad`, `Tamaño`, `fecha_cotizacion`, `Id_servicio`) VALUES
(14, 2, 40000.00, 1, 'Estándar', '2026-02-26 10:34:45', NULL),
(15, 2, 40000.00, 1, 'Estándar', '2026-02-26 10:34:45', NULL),
(16, 2, 80000.00, 1, 'Estándar', '2026-02-26 10:38:17', 28),
(17, 2, 90000.00, 1, 'Estándar', '2026-02-26 11:01:57', 22);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `Id_Empleado` int NOT NULL,
  `usuario_Id_Usuario` int NOT NULL COMMENT 'FK: Usuario trabajador',
  `cargo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Cargo del empleado ej: Técnico Senior',
  `fecha_nacimiento` date DEFAULT NULL COMMENT 'Fecha de nacimiento',
  `fecha_ingreso` date DEFAULT NULL COMMENT 'Fecha de ingreso a la empresa',
  `dias_laborales` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Ej: Lunes a Viernes',
  `horario` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Ej: 8:00 AM - 5:00 PM',
  `especialidades` text COLLATE utf8mb4_general_ci COMMENT 'Lista de especialidades separadas por coma',
  `certificaciones` text COLLATE utf8mb4_general_ci COMMENT 'JSON o texto con certificaciones',
  `contacto_emergencia_nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contacto_emergencia_telefono` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`Id_Empleado`, `usuario_Id_Usuario`, `cargo`, `fecha_nacimiento`, `fecha_ingreso`, `dias_laborales`, `horario`, `especialidades`, `certificaciones`, `contacto_emergencia_nombre`, `contacto_emergencia_telefono`) VALUES
(1, 3, 'Técnico de Limpieza Senior', '2000-02-25', NULL, 'martes, miercoles, jueves, viernes, sabado', '08:00 - 17:00', 'sillas, tapiceria', 'Tecnicas de limpieza de sillas, manejo de productos de tapiceria, manejo de productos de pintura.', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id_notificaciones` int NOT NULL COMMENT 'Identificador único de la notificación',
  `descripcion_notificacion` text COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Descripción de la notificación',
  `fecha_notificacion` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación de la notificación',
  `usuario_Id_Usuario` int NOT NULL COMMENT 'FK: Usuario de la notificación'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `observacion`
--

CREATE TABLE `observacion` (
  `Id_Observaciones` int NOT NULL COMMENT 'PK: Identificador único de la observación',
  `Observaciones` text COLLATE utf8mb4_general_ci COMMENT 'Texto de la observación',
  `estado` varchar(45) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Estado de la observación'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `observacion`
--

INSERT INTO `observacion` (`Id_Observaciones`, `Observaciones`, `estado`) VALUES
(1, 'Trabajo completado exitosamente, cliente satisfecho', 'Completado'),
(2, 'Servicio en proceso, se requiere más tiempo', 'En Proceso'),
(3, 'Cliente solicitó cambio de horario', 'Pendiente'),
(4, 'Muebles con manchas difíciles, requiere tratamiento especial', 'En Proceso'),
(5, 'Servicio cancelado por el cliente', 'Cancelado'),
(6, 'Excelente estado del mueble, lavado estándar aplicado', 'Completado'),
(7, 'Cliente no se encontraba en el domicilio, reprogramar', 'Pendiente'),
(8, 'Sin observaciones adicionales', 'activo'),
(14, 'Sin observaciones', 'Pendiente'),
(15, 'Sin observaciones', 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `ID_Reserva` int NOT NULL COMMENT 'PK: Identificador único de la reserva',
  `Estado` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'Pendiente' COMMENT 'Estado actual de la reserva',
  `Id_Usuario` int NOT NULL COMMENT 'FK: Usuario que gestionó la reserva',
  `fecha` date NOT NULL COMMENT 'Fecha programada para la realizacion del servicio',
  `Hora` time NOT NULL COMMENT 'Hora programada para el servicio',
  `Informacion_adicional` text COLLATE utf8mb4_general_ci COMMENT 'Información adicional del cliente',
  `observacion_Id_Observaciones` int NOT NULL COMMENT 'FK: Observación de la reserva',
  `empleado_Id_Usuario` int DEFAULT NULL COMMENT 'FK: Empleado asignado a esta reserva'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reserva`
--

INSERT INTO `reserva` (`ID_Reserva`, `Estado`, `Id_Usuario`, `fecha`, `Hora`, `Informacion_adicional`, `observacion_Id_Observaciones`, `empleado_Id_Usuario`) VALUES
(8, 'Completado', 1, '2026-02-23', '08:00:00', 'Sofá de 3 puestos, manchas de café', 3, 3),
(9, 'En Proceso', 2, '2026-02-23', '10:30:00', 'Silla de oficina con tapizado de cuero', 2, 3),
(10, 'Completado', 5, '2026-02-23', '07:00:00', 'Colchón doble, cliente en 2do piso', 1, 3),
(11, 'Pendiente', 6, '2026-02-24', '09:00:00', 'Alfombra persa 2x3 metros', 3, 3),
(12, 'Pendiente', 1, '2026-02-25', '11:00:00', 'Juego de sala completo 5 piezas', 7, 3),
(13, 'Completado', 2, '2026-02-26', '08:30:00', 'Puff grande color gris', 4, 3),
(14, 'Pendiente', 5, '2026-02-27', '14:00:00', 'Impermeabilización sofá cuero blanco', 3, 3),
(15, 'Completado', 6, '2026-02-20', '09:00:00', 'Lavado de colchón queen size', 1, 3),
(16, 'Completado', 1, '2026-02-18', '10:00:00', 'Sofá esquinero, buen estado', 6, 3),
(17, 'Completado', 2, '2026-02-16', '08:00:00', 'Sillas de comedor x6', 1, 3),
(18, 'Completado', 5, '2026-02-13', '11:00:00', 'Alfombra sala principal', 6, 3),
(19, 'Cancelado', 6, '2026-02-21', '13:00:00', 'Cliente canceló por viaje', 5, 3),
(20, 'Pendiente', 2, '2026-02-28', '11:28:00', NULL, 8, 3),
(26, 'Pendiente', 2, '2026-02-27', '11:00:00', 'Dirección: calle 41 b sur · 79-29, Bogota.D.C. Tel: 3132572934', 14, 3),
(27, 'Pendiente', 2, '2026-02-26', '14:00:00', 'Dir: calle 41 b sur · 79-29, Bogota.D.C. Tel: 3132572934', 15, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `Id_Rol` int NOT NULL COMMENT 'PK: Identificador único del rol',
  `Rol` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre del rol (ej: Administrador, Trabajador, Cliente)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`Id_Rol`, `Rol`) VALUES
(1, 'admin'),
(2, 'trabajador'),
(3, 'cliente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicio`
--

CREATE TABLE `servicio` (
  `Id_Servicio` int NOT NULL COMMENT 'PK: Identificador único del servicio',
  `Nombre_Servicio` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre o descripción del servicio',
  `Precio` decimal(10,2) NOT NULL COMMENT 'Precio del servicio',
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Descripción del servicio',
  `imagen_url` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Campo para guardar la imagen de cada servicio',
  `cotizacion_Id_Cotizacion` int DEFAULT NULL COMMENT 'FK de la cotización (opcional)',
  `reserva_ID_Reserva` int DEFAULT NULL COMMENT 'FK de la reserva (opcional)',
  `estado` varchar(20) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'activo',
  `duracion_estimada` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicio`
--

INSERT INTO `servicio` (`Id_Servicio`, `Nombre_Servicio`, `Precio`, `descripcion`, `imagen_url`, `cotizacion_Id_Cotizacion`, `reserva_ID_Reserva`, `estado`, `duracion_estimada`) VALUES
(22, 'Lavado de muebles', 90000.00, 'Lavado profundo de sofás y sillas, eliminación de manchas y olores persistentes con productos especializados.', '/img/imag1.jpg', NULL, 27, 'activo', NULL),
(23, 'Limpieza sillas de comedor', 7000.00, 'Elimina manchas, suciedad y malos olores de tus sillas con productos especiales.', '/img/imag2.jpg', NULL, NULL, 'activo', NULL),
(24, 'Limpieza de tapetes decorativos', 60000.00, 'Remueve suciedad, polvo y manchas, devolviendo frescura y color vibrante.', '/img/imag3.jpg', NULL, NULL, 'activo', NULL),
(25, 'Lavado de alfombras', 50000.00, 'Limpieza profunda para alfombras pequeñas y medianas con técnicas especializadas.', '/img/imag4.jpg', NULL, NULL, 'activo', NULL),
(26, 'Tapicería de carros', 140000.00, 'Limpieza interior del vehículo: asientos, alfombras y paneles con acabado premium.', '/img/imag5.jpg', NULL, NULL, 'activo', NULL),
(27, 'Lavado de colchones', 90000.00, 'Eliminación de ácaros y manchas, desodorización y secado rápido profesional.', '/img/imag6.jpg', NULL, NULL, 'activo', NULL),
(28, 'Lavado de cortinas', 80000.00, 'Lavado y planchado ligero para cortinas y visillos de todo tipo de tela.', '/img/imag7.jpg', NULL, 26, 'activo', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipo_de_documento`
--

CREATE TABLE `tipo_de_documento` (
  `idTipo_de_Documento` int NOT NULL COMMENT 'Identificador único del tipo de documento',
  `nombre_del_documento` varchar(50) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'Nombre del documento o DNI'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipo_de_documento`
--

INSERT INTO `tipo_de_documento` (`idTipo_de_Documento`, `nombre_del_documento`) VALUES
(1, 'Cédula de Ciudadanía'),
(3, 'Cédula de Extranjería'),
(5, 'NIT'),
(4, 'Pasaporte'),
(7, 'Registro Civil'),
(6, 'RUT'),
(2, 'Tarjeta de Identidad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `Id_Usuario` int NOT NULL COMMENT 'PK: Identificador único del usuario',
  `Nombre` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Nombre del usuario registrado en el sistema',
  `Telefono` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Número de teléfono de contacto',
  `N_Documento` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Número de documento de identificación',
  `Direccion` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Dirección de residencia o lugar de trabajo',
  `Correo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Correo electrónico del usuario',
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'contraseña encritada de cada usuario',
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'activo' COMMENT 'estado del usuario, ejemplo activo.',
  `rol_Id_Rol` int DEFAULT NULL COMMENT 'FK del rol',
  `tipo_de_documento_id_tipo_de_documento` int DEFAULT NULL,
  `reset_token` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'token creado para la restauracion de la contraseña se envia al correo electronico del usuario.',
  `reset_token_expires` datetime DEFAULT NULL COMMENT 'tiempo de expiracion del token de restablecer contraseña.',
  `last_login` datetime DEFAULT NULL COMMENT 'fecha dde ultimo cierre de sesion.',
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'fecha de ultimo inicio de sesion exicitoso.',
  `access_token` text COLLATE utf8mb4_general_ci COMMENT 'Token de acceso (JWT)',
  `refresh_token` text COLLATE utf8mb4_general_ci COMMENT 'Token de refresco (JWT)',
  `token_created_at` datetime DEFAULT NULL COMMENT 'Fecha de creación del token',
  `token_expires_at` datetime DEFAULT NULL COMMENT 'Fecha de expiración del token',
  `foto_perfil` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Ruta de la foto de perfil'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`Id_Usuario`, `Nombre`, `Telefono`, `N_Documento`, `Direccion`, `Correo`, `password_hash`, `estado`, `rol_Id_Rol`, `tipo_de_documento_id_tipo_de_documento`, `reset_token`, `reset_token_expires`, `last_login`, `fecha_registro`, `access_token`, `refresh_token`, `token_created_at`, `token_expires_at`, `foto_perfil`) VALUES
(1, 'Cristian Criollo', '3132572934', '0000000000', 'calle 41 b sur · 79-29', 'cristian.criollotovar@gmail.com', '$2b$10$9r3LdbPC7/b7Rpie0gZSPum7TKcv29BV8Z7epkM/YA2ASmvgDEwS6', 'activo', 3, 1, NULL, NULL, '2026-02-21 14:16:23', '2026-02-08 20:19:39', NULL, NULL, NULL, NULL, NULL),
(2, 'cliente de prueba', '3123586749', NULL, 'calle 25 100-20', 'cliente@gmail.com', '$2b$10$YNEYJdUS1IWM/yeI4zoi8OtjIeyWiC/dRlOvQ2Xe3XIQWfP0JgjpK', 'activo', 3, 1, NULL, NULL, '2026-03-14 19:57:09', '2026-02-10 14:32:03', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjbGllbnRlQGdtYWlsLmNvbSIsInJvbGUiOiJjbGllbnRlIiwiaWF0IjoxNzczNTE4MjI5LCJleHAiOjE3NzQxMjMwMjl9.6UKjwCXSenoewqB8yv1-j2mb3NOnydAdOEOt96HNhyQ', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjbGllbnRlQGdtYWlsLmNvbSIsInJvbGUiOiJjbGllbnRlIiwiaWF0IjoxNzczNTE4MjI5LCJleHAiOjE3NzQxMjMwMjl9.oM9eJYYls2RLgA56JRAmeXZ0aMh7-_B_N_NsGcFdBTs', '2026-03-14 19:57:09', '2026-03-14 20:12:09', '/uploads/empleado_2_1772137208258.png'),
(3, 'trabajador prueba 1', '3212568787', NULL, 'calle 106 A sur 7--26', 'trabajador@gmail.com', '$2b$10$ScBT/gtpto3b72O1AKzHz.Pdu2CufBJ4mmtB.9APbFqTOx7dtS8Ba', 'activo', 2, 1, NULL, NULL, '2026-03-14 19:52:58', '2026-02-10 14:35:10', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0cmFiYWphZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ0cmFiYWphZG9yIiwiaWF0IjoxNzczNTE3OTc4LCJleHAiOjE3NzQxMjI3Nzh9.tPtUbx1nDB_Jtf0TbrXf91XWZzwnX1V0CVnvH6xibAA', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0cmFiYWphZG9yQGdtYWlsLmNvbSIsInJvbGUiOiJ0cmFiYWphZG9yIiwiaWF0IjoxNzczNTE3OTc4LCJleHAiOjE3NzQxMjI3Nzh9.e8hEwVfXGGvF96qNkgM6DgETs23hRuJwfs0PIinKMSo', '2026-03-14 19:52:58', '2026-03-14 20:07:58', '/uploads/fotos/empleado_3_1772137647224.png'),
(4, 'administrador prueba', '3205675987', NULL, 'calle 200 norte 14-7', 'admin@gmail.com', '$2b$10$uYBHcq7WfvaZBX5tMoTLBuRXMjBxVUnC/KJPtlqDnZkgCV0I5vW8C', 'activo', 1, 1, '572939', '2026-03-13 11:27:04', '2026-03-13 11:37:36', '2026-02-10 14:37:46', 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Iiwicm9sZSI6ImFkbWluIiwiaWQiOjQsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzczNDE5ODU2LCJleHAiOjE3NzQwMjQ2NTZ9.ltiLufE-WmLdvjxoj9ggvyrhpXYybYuBHCdHCUGZU2jP2ZFB6I7EeFUv1HzG7VpT', 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Iiwicm9sZSI6ImFkbWluIiwiaWQiOjQsImVtYWlsIjoiYWRtaW5AZ21haWwuY29tIiwiaWF0IjoxNzczNDE5ODU2LCJleHAiOjE3NzQwMjQ2NTZ9.KxaT2XE4PqEoQVq5KHigxUhPi5_r7ImTFA7UjJbSrnHahFuLKzbWF4c0M5TmB6wp', '2026-03-13 11:37:36', '2026-03-13 11:52:36', NULL),
(5, 'michel quintero', '3485012019', NULL, 'calle 200 79-5', 'michel@gmail.com', '$2b$10$ucRuvQ2SxkYYnQJl2KnZTeEBmGqj5NElvF0TdOl0h4o3m/uifvr9m', 'activo', 3, 1, NULL, NULL, '2026-02-09 21:24:56', '2026-02-09 21:24:56', NULL, NULL, NULL, NULL, NULL),
(6, 'jairo vega', '3194371546', NULL, 'carrera 69 j 73 a 26', 'jiar1530@hotmail.com', '$2b$10$RQ2ZxNoTXkru.EMK9qxBA.BzM5gN3zZ9tRr9YYNH04PmK9PDEhBwG', 'activo', 3, 1, NULL, NULL, '2026-02-10 17:19:09', '2026-02-10 17:19:09', NULL, NULL, NULL, NULL, NULL),
(10000027, 'andres tovar', NULL, NULL, NULL, 'tovarcristian431@gmail.com', '$2a$12$mQr4Q2j6foVDFi76CVGCWOUb6Fw49g0A1W3PpM06BNv/oYCJ3Eq3m', 'activo', 1, NULL, '622531', '2026-03-11 22:34:33', '2026-03-11 22:25:47', '2026-03-10 19:48:22', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwMjcsImVtYWlsIjoidG92YXJjcmlzdGlhbjQzMUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMyNjc5NDcsImV4cCI6MTc3Mzg3Mjc0N30.9vnhCNXTRnYw7iiKBmrG4phJtfCdUkBCtYEykAqklaE', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAwMDAwMjcsImVtYWlsIjoidG92YXJjcmlzdGlhbjQzMUBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzMyNjc5NDcsImV4cCI6MTc3Mzg3Mjc0N30.CupRBkUzoVtTpNRIVXTvxtpX2--CJlJs5CLAyBal4_0', '2026-03-11 22:25:47', '2026-03-11 22:40:47', NULL),
(10000028, 'Usuario Nuevo', NULL, NULL, NULL, 'nuevo@gmail.com', '$2a$12$8qLSqVBqeHIwnxiubN5KVeHD6nexEXSlmmXVxgFDKI.3EJ4nbpXLi', 'activo', 3, NULL, NULL, NULL, NULL, NULL, 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxMDAwMDAyOCIsImVtYWlsIjoibnVldm9AZ21haWwuY29tIiwiaWQiOjEwMDAwMDI4LCJyb2xlIjoiY2xpZW50ZSIsImlhdCI6MTc3MzQxNzk2MSwiZXhwIjoxNzc0MDIyNzYxfQ.yCgIg7zfHeYlUdNILEl-W9NH001rtCXgdFWityyevPc2YZzmTnvauHgI6_8UHfeo', 'eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiIxMDAwMDAyOCIsImVtYWlsIjoibnVldm9AZ21haWwuY29tIiwiaWQiOjEwMDAwMDI4LCJyb2xlIjoiY2xpZW50ZSIsImlhdCI6MTc3MzQxNzk2MSwiZXhwIjoxNzc0MDIyNzYxfQ.X_bejDnkdcbR8g83tDu5xO_Hr4AZrsXddGEEyESAciGs0Zv25U6RlLCz8OWJUrHk', '2026-03-13 11:06:01', '2026-03-13 11:21:01', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `calificacion`
--
ALTER TABLE `calificacion`
  ADD PRIMARY KEY (`Id_Calificacion`),
  ADD KEY `empleado_Id_Usuario` (`empleado_Id_Usuario`),
  ADD KEY `reserva_ID_Reserva` (`reserva_ID_Reserva`);

--
-- Indices de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD PRIMARY KEY (`Id_Cotizacion`),
  ADD KEY `fk_cotizacion_usuario_idx` (`Id_usuario`),
  ADD KEY `fk_cotizacion_servicio` (`Id_servicio`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`Id_Empleado`),
  ADD KEY `usuario_Id_Usuario` (`usuario_Id_Usuario`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id_notificaciones`),
  ADD KEY `fk_notificaciones_usuario_idx` (`usuario_Id_Usuario`);

--
-- Indices de la tabla `observacion`
--
ALTER TABLE `observacion`
  ADD PRIMARY KEY (`Id_Observaciones`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`ID_Reserva`),
  ADD KEY `fk_reserva_usuario_idx` (`Id_Usuario`),
  ADD KEY `fk_reserva_observacion_idx` (`observacion_Id_Observaciones`),
  ADD KEY `fk_reserva_empleado` (`empleado_Id_Usuario`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`Id_Rol`);

--
-- Indices de la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD PRIMARY KEY (`Id_Servicio`),
  ADD KEY `fk_servicio_cotizacion_idx` (`cotizacion_Id_Cotizacion`),
  ADD KEY `fk_servicio_reserva_idx` (`reserva_ID_Reserva`);

--
-- Indices de la tabla `tipo_de_documento`
--
ALTER TABLE `tipo_de_documento`
  ADD PRIMARY KEY (`idTipo_de_Documento`),
  ADD UNIQUE KEY `nombre_del_documento_UNIQUE` (`nombre_del_documento`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id_Usuario`),
  ADD UNIQUE KEY `N_Documento` (`N_Documento`),
  ADD UNIQUE KEY `Correo` (`Correo`),
  ADD KEY `fk_usuario_rol1_idx` (`rol_Id_Rol`),
  ADD KEY `fk_usuario_Tipo_de_Documento1_idx` (`tipo_de_documento_id_tipo_de_documento`),
  ADD KEY `idx_access_token` (`access_token`(255));

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `calificacion`
--
ALTER TABLE `calificacion`
  MODIFY `Id_Calificacion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  MODIFY `Id_Cotizacion` int NOT NULL AUTO_INCREMENT COMMENT 'PK: Identificador único de la cotización', AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `Id_Empleado` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id_notificaciones` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la notificación', AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `observacion`
--
ALTER TABLE `observacion`
  MODIFY `Id_Observaciones` int NOT NULL AUTO_INCREMENT COMMENT 'PK: Identificador único de la observación', AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `ID_Reserva` int NOT NULL AUTO_INCREMENT COMMENT 'PK: Identificador único de la reserva', AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `Id_Rol` int NOT NULL AUTO_INCREMENT COMMENT 'PK: Identificador único del rol', AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `servicio`
--
ALTER TABLE `servicio`
  MODIFY `Id_Servicio` int NOT NULL AUTO_INCREMENT COMMENT 'PK: Identificador único del servicio', AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `tipo_de_documento`
--
ALTER TABLE `tipo_de_documento`
  MODIFY `idTipo_de_Documento` int NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del tipo de documento', AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `Id_Usuario` int NOT NULL AUTO_INCREMENT COMMENT 'PK: Identificador único del usuario', AUTO_INCREMENT=10000029;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `calificacion`
--
ALTER TABLE `calificacion`
  ADD CONSTRAINT `calificacion_ibfk_1` FOREIGN KEY (`empleado_Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`),
  ADD CONSTRAINT `calificacion_ibfk_2` FOREIGN KEY (`reserva_ID_Reserva`) REFERENCES `reserva` (`ID_Reserva`);

--
-- Filtros para la tabla `cotizacion`
--
ALTER TABLE `cotizacion`
  ADD CONSTRAINT `fk_cotizacion_servicio` FOREIGN KEY (`Id_servicio`) REFERENCES `servicio` (`Id_Servicio`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cotizacion_usuario` FOREIGN KEY (`Id_usuario`) REFERENCES `usuario` (`Id_Usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD CONSTRAINT `empleado_ibfk_1` FOREIGN KEY (`usuario_Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`);

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `fk_notificaciones_usuario` FOREIGN KEY (`usuario_Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `fk_reserva_empleado` FOREIGN KEY (`empleado_Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reserva_observacion` FOREIGN KEY (`observacion_Id_Observaciones`) REFERENCES `observacion` (`Id_Observaciones`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reserva_usuario` FOREIGN KEY (`Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`) ON UPDATE CASCADE,
  ADD CONSTRAINT `reserva_ibfk_1` FOREIGN KEY (`empleado_Id_Usuario`) REFERENCES `usuario` (`Id_Usuario`);

--
-- Filtros para la tabla `servicio`
--
ALTER TABLE `servicio`
  ADD CONSTRAINT `fk_servicio_cotizacion` FOREIGN KEY (`cotizacion_Id_Cotizacion`) REFERENCES `cotizacion` (`Id_Cotizacion`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_servicio_reserva` FOREIGN KEY (`reserva_ID_Reserva`) REFERENCES `reserva` (`ID_Reserva`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_rol1` FOREIGN KEY (`rol_Id_Rol`) REFERENCES `rol` (`Id_Rol`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_Tipo_de_Documento1` FOREIGN KEY (`tipo_de_documento_id_tipo_de_documento`) REFERENCES `tipo_de_documento` (`idTipo_de_Documento`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
