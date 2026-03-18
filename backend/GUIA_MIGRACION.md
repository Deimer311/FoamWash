# 🚀 Guía de Migración: Express → NestJS + Prisma
## Proyecto: Foam Wash API

---

## 📋 ÍNDICE

1. [Estructura del Proyecto](#estructura)
2. [Paso 1: Crear el Proyecto](#paso-1)
3. [Paso 2: Instalar Dependencias](#paso-2)
4. [Paso 3: Configurar Prisma](#paso-3)
5. [Paso 4: Schema de Prisma](#paso-4)
6. [Paso 5: Módulos y Archivos](#paso-5)
7. [Paso 6: Variables de Entorno](#paso-6)
8. [Paso 7: Ejecutar el Proyecto](#paso-7)
9. [Diferencias Clave Express → NestJS](#diferencias)

---

## 🏗️ ESTRUCTURA DEL PROYECTO <a name="estructura"></a>

```
foamwash-backend/
├── src/
│   ├── main.ts                    ← Punto de entrada (reemplaza index.js)
│   ├── app.module.ts              ← Módulo raíz
│   ├── prisma/
│   │   ├── prisma.service.ts      ← Servicio de Prisma (reemplaza db.js)
│   │   └── prisma.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts     ← Reemplaza routes/auth.js + controllers/auth.controller.js
│   │   ├── auth.service.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts  ← Reemplaza middlewares/auth.middleware.js
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── usuarios/
│   │   ├── usuarios.module.ts
│   │   ├── usuarios.controller.ts ← Reemplaza routes/usuarios.js
│   │   └── usuarios.service.ts
│   ├── reservas/
│   │   ├── reservas.module.ts
│   │   ├── reservas.controller.ts ← Reemplaza routes/reservas.js
│   │   └── reservas.service.ts
│   ├── servicios/
│   │   ├── servicios.module.ts
│   │   ├── servicios.controller.ts← Reemplaza routes/servicios.js
│   │   └── servicios.service.ts
│   ├── cotizaciones/
│   │   ├── cotizaciones.module.ts
│   │   ├── cotizaciones.controller.ts
│   │   └── cotizaciones.service.ts
│   ├── empleados/
│   │   ├── empleados.module.ts
│   │   ├── empleados.controller.ts← Reemplaza routes/empleados.js + controllers/empleado.controller.js
│   │   └── empleados.service.ts
│   ├── clientes/
│   │   ├── clientes.module.ts
│   │   ├── clientes.controller.ts ← Reemplaza routes/clientes.js
│   │   └── clientes.service.ts
│   ├── consultas/
│   │   ├── consultas.module.ts
│   │   ├── consultas.controller.ts← Reemplaza routes/consultas.js
│   │   └── consultas.service.ts
│   ├── estadisticas/
│   │   ├── estadisticas.module.ts
│   │   ├── estadisticas.controller.ts
│   │   └── estadisticas.service.ts
│   ├── notificaciones/
│   │   ├── notificaciones.module.ts
│   │   ├── notificaciones.controller.ts
│   │   └── notificaciones.service.ts
│   └── common/
│       ├── decorators/
│       │   └── roles.decorator.ts ← Reemplaza middlewares/roles.middleware.js
│       └── guards/
│           └── roles.guard.ts
├── prisma/
│   └── schema.prisma              ← Mapa de tu base de datos MySQL
├── uploads/                       ← Archivos subidos (igual que antes)
├── .env
├── package.json
└── tsconfig.json
```

---

## PASO 1: Crear el Proyecto <a name="paso-1"></a>

```bash
# 1. Instalar NestJS CLI globalmente
npm install -g @nestjs/cli

# 2. Crear el proyecto
nest new foamwash-backend

# Seleccionar: npm (cuando pregunta el package manager)

# 3. Entrar al proyecto
cd foamwash-backend
```

---

## PASO 2: Instalar Dependencias <a name="paso-2"></a>

```bash
# Prisma (ORM que reemplaza mysql2 + queries manuales)
npm install prisma @prisma/client
npm install -D prisma

# Autenticación JWT (misma lógica, diferente integración)
npm install @nestjs/jwt @nestjs/passport passport passport-jwt cookie-parser
npm install -D @types/passport-jwt @types/cookie-parser

# Validación (reemplaza express-validator)
npm install class-validator class-transformer

# Seguridad
npm install helmet

# Subida de archivos (reemplaza multer)
npm install @nestjs/platform-express multer
npm install -D @types/multer

# Email (igual que antes)
npm install nodemailer
npm install -D @types/nodemailer

# Hash de contraseñas (igual que antes)
npm install bcryptjs
npm install -D @types/bcryptjs

# Variables de entorno
npm install @nestjs/config
```

---

## PASO 3: Configurar Prisma <a name="paso-3"></a>

```bash
# Inicializar Prisma con MySQL
npx prisma init --datasource-provider mysql
```

Esto crea:
- `prisma/schema.prisma` → Aquí defines tus modelos
- `.env` → Aquí va la URL de conexión

Edita el `.env`:
```env
DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/foam_wash_db"
```

---

## PASO 4: Schema de Prisma <a name="paso-4"></a>

El archivo `prisma/schema.prisma` mapea tu base de datos existente.
**Ver archivo: `prisma/schema.prisma`** (incluido en esta guía)

Después de editar el schema, ejecuta:
```bash
# Si ya tienes la BD creada (tu caso), usar esto para generar el cliente:
npx prisma generate

# Si quieres que Prisma lea tu BD existente y genere el schema automáticamente:
npx prisma db pull

# Para ver tu BD en interfaz web:
npx prisma studio
```

---

## PASO 5: Variables de Entorno <a name="paso-6"></a>

Crea `.env` en la raíz:
```env
# Base de datos
DATABASE_URL="mysql://root:PASSWORD@localhost:3306/foam_wash_db"

# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secreto_aqui
JWT_EXPIRES_IN=7d

# Servidor
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email (igual que antes)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM="Foam Wash <tu@gmail.com>"
```

---

## PASO 6: Ejecutar el Proyecto <a name="paso-7"></a>

```bash
# Desarrollo (equivalente a nodemon)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

La API estará en `http://localhost:5000` con los mismos endpoints:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET  /api/auth/me`
- `GET  /api/usuarios`
- `GET  /api/reservas`
- `GET  /api/servicios`
- `GET  /api/cotizaciones`
- `GET  /api/empleados`
- `GET  /api/clientes/:id/perfil`
- `GET  /api/consultas/1-usuarios-por-rol` ... etc
- `GET  /api/estadisticas`
- `GET  /api/notificaciones/:userId`

---

## 🔄 DIFERENCIAS CLAVE Express → NestJS <a name="diferencias"></a>

| Express (antes) | NestJS (ahora) |
|---|---|
| `router.get('/', handler)` | `@Get() handler()` |
| `req.body` | `@Body() dto: CreateDto` |
| `req.params.id` | `@Param('id') id: string` |
| `req.user` | `@Request() req` |
| `res.json(data)` | `return data` (NestJS lo serializa) |
| `res.status(201).json(data)` | `@HttpCode(201)` + `return data` |
| Middleware manual | Guards + Decorators |
| `pool.query(sql)` | `prisma.usuario.findMany()` |
| `try/catch` manual | Filtros de excepción globales |

---

## ⚠️ PUNTOS IMPORTANTES

1. **Prisma reemplaza TODOS los `pool.query()`** — las consultas SQL manuales se convierten en métodos tipados de Prisma.

2. **Los Guards reemplazan los middlewares de auth** — `@UseGuards(JwtAuthGuard)` en vez de `authenticateToken`.

3. **Los DTOs reemplazan express-validator** — clases TypeScript con decoradores `@IsEmail()`, `@IsString()`, etc.

4. **NestJS serializa automáticamente** — no necesitas `res.json()`, solo `return objeto`.

5. **Los módulos agrupan todo** — cada feature tiene su propio módulo que declara controller + service + imports.
