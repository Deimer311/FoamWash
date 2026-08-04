# 🚗 Foam Wash — Frontend

Aplicación web para la gestión de servicios de lavado de vehículos. Construida con **React 18** y consumiendo la API REST de **NestJS + Prisma**.

---

## 🛠️ Tecnologías

- React 18
- Axios (con cookies HTTP-Only)
- Context API (AuthContext, CarritoContext)
- CSS modular por componente
- Vite / Create React App

---

## ⚙️ Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de entorno
cp .env.example .env

# 3. Iniciar en desarrollo
npm start
```

El frontend corre en **http://localhost:3000**  
El backend debe estar corriendo en **http://localhost:5000**

---

## 🔐 Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_URL=http://localhost:5000/api
```

Si no existe el `.env`, la app usa `http://localhost:5000/api` por defecto.

---

## 👥 Roles de usuario

| Rol | Redirección tras login | Acceso |
|---|---|---|
| `admin` | `/admin-dashboard` | CRUD completo, reportes, consultas |
| `trabajador` | `/agenda-empleado` | Agenda personal y perfil |
| `cliente` | `/servicios-cliente` | Servicios, cotizaciones y perfil |

---

## 📁 Estructura del proyecto

```
src/
├── App.js                    ← Enrutador principal (switch de páginas)
├── services/
│   ├── api.js                ← Instancia Axios con baseURL y cookies
│   ├── authService.js        ← Login, register, logout, getMe
│   ├── serviciosAPI.js       ← Todos los servicios del backend
│   └── index.js              ← Exportador centralizado
├── components/
│   ├── global/               ← Componentes públicos (Home, Login, Servicios)
│   ├── admin/                ← Dashboard, CRUD, Reportes, Agenda admin
│   ├── empleado/             ← Agenda y perfil del trabajador
│   ├── cliente/              ← Servicios, cotizaciones y perfil del cliente
│   ├── modals/               ← AuthContext, CarritoContext y modales
│   └── css/                  ← Estilos por componente
├── hooks/
│   └── useBubbles.js
└── utils/
    └── AuthUtils.js
```

---

## 🔗 Conexión con el backend

Todos los requests pasan por `src/services/api.js`:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true  // Envía cookies automáticamente
});
```

Los servicios están organizados en `serviciosAPI.js`:

```js
import { serviciosService, usuariosService, reservasService,
         cotizacionesService, estadisticasService,
         notificacionesService, consultasService } from './services/serviciosAPI';
```

---


## 🚀 Scripts disponibles

```bash
npm start        # Desarrollo en http://localhost:3000
npm run build    # Build de producción
npm test         # Ejecutar tests
```