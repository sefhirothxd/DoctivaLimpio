# Doctiva Learning · doctiva.app

Panel de intranet académica construido con **React 19 + Vite 7 + Tailwind CSS 4**, con kit visual
Satoshi (lima `#ebff57`, menta `#7bfcec`, crema `#f1f0e6`, tinta `#111112`).

Incluye: login por rol (admin / usuario), cursos **presenciales y virtuales** con desglose de temario,
recursos publicados siempre mediante enlace (asistente de 4 pasos), directorio de alumnos con CRUD y
gestión de contraseñas, auditoría y configuración. Todos los datos vienen de un **backend propio
(Express + Sequelize)** consumido vía API REST.

## Requisitos

- Node.js 18+ (recomendado LTS 20 o 22)
- El backend corriendo (ver `docs/API.md` para el contrato de endpoints)

## Puesta en marcha

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5173
```

En desarrollo, Vite reenvía `/api/*` a `VITE_DEV_API_TARGET` (por defecto `http://localhost:3000`).
Para producción define `VITE_API_URL` con la URL completa del API antes de compilar.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente. |
| `npm run build` | Compila a `dist/` (sitio estático; sirve con cualquier hosting). |
| `npm run preview` | Sirve el build en localhost:4173. |

## Estructura

```
├── index.html
├── .env.example                # VITE_API_URL y proxy de desarrollo
├── docs/API.md                 # Contrato de endpoints y reglas del servidor
└── src/
    ├── App.tsx                 # Sesión, carga de datos, handlers y pestañas
    ├── constants.ts            # Listas fijas (materias)
    ├── types/index.ts          # Modelo: Course, Student, Resource, AuthUser…
    ├── services/api.ts         # Único punto de acceso al backend (fetch + JWT)
    └── components/             # Login, Sidebar, Header, vistas y modales
```

## Problemas frecuentes

| Síntoma | Solución |
|---|---|
| "No se pudo conectar con el servidor" | Verifica que el backend esté levantado y que `VITE_DEV_API_TARGET` apunte a su puerto. |
| Vuelve al login tras unos minutos | El token JWT venció (respuesta 401); inicia sesión de nuevo. |
| Error de CORS en producción | Habilita CORS en Express para el dominio del frontend. |
| `'npm' no se reconoce…` | Instala Node.js y reabre la terminal. |
