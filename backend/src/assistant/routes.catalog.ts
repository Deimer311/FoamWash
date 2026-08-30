export interface RouteConfig {
  path: string;
  name: string;
  isCritical: boolean;
  screenDescription: string;
}

export const ROUTES_CATALOG: RouteConfig[] = [
  {
    path: '/',
    name: 'Inicio / Bienvenida',
    isCritical: false,
    screenDescription: 'Pantalla principal de bienvenida de Foam Wash. Contiene introducción del servicio de lavado de muebles y botones de acceso rápido.',
  },
  {
    path: '/login',
    name: 'Inicio de Sesión',
    isCritical: false,
    screenDescription: 'Pantalla de inicio de sesión segura. Contiene campos de correo electrónico y contraseña, y botón de ingreso.',
  },
  {
    path: '/servicios',
    name: 'Catálogo de Servicios',
    isCritical: false,
    screenDescription: 'Catálogo de servicios de lavado de mobiliario en Bogotá. Muestra lavado de sofás, colchones, sillas de comedor, alfombras y precios asociados.',
  },
  {
    path: '/agendamiento',
    name: 'Agendamiento y Registro de Citas',
    isCritical: false,
    screenDescription: 'Formulario de agendamiento. Permite registrar datos de contacto, dirección, seleccionar fecha y hora en el calendario para el servicio.',
  },
  {
    path: '/pasarela-pago',
    name: 'Pasarela de Pago Seguro',
    isCritical: true,
    screenDescription: 'Zona de transacción crítica. Permite ingresar detalles de facturación para realizar el pago final de la reserva.',
  },
];
