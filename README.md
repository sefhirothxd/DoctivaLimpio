# Doctiva Learning

Aplicación web para la gestión de una intranet académica. Permite consultar cursos y recursos educativos, y ofrece herramientas administrativas para mantener el catálogo de cursos, el directorio de alumnos y los registros de auditoría.

## Funcionalidades

- Inicio de sesión para administradores y usuarios académicos.
- Catálogo de cursos presenciales y virtuales, con información de horarios, docentes y alumnos inscritos.
- Repositorio de recursos educativos publicados mediante enlaces y asociados a cursos.
- Panel de inicio con acceso a cursos, alumnos y recursos.
- Administración de alumnos: alta, edición, eliminación y cambio de contraseña.
- Administración de cursos y recursos.
- Vistas de auditoría y configuración disponibles para administradores.
- Diseño adaptable a dispositivos móviles.

Los permisos de la interfaz dependen del rol de la sesión. La autorización efectiva debe aplicarse también en el backend.

## Tecnologías

- React 19 y TypeScript
- Vite 7
- Tailwind CSS 4
- Lucide React
- API REST externa para autenticación y datos académicos

## Requisitos

- Node.js compatible con Vite 7 (Node.js 20.19+ o 22.12+).
- npm.
- Backend de la API en ejecución. Consulta [docs/API.md](./docs/API.md) para el contrato esperado.

## Desarrollo local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea tu archivo de entorno a partir del ejemplo:

   ```bash
   # macOS / Linux
   cp .env.example .env

   # Windows PowerShell
   Copy-Item .env.example .env
   ```

3. Configura la URL del backend en `.env` y ejecuta la aplicación:

   ```bash
   npm run dev
   ```

   Vite inicia la aplicación en `http://localhost:5173`.

### Configuración del API

La aplicación usa `VITE_API_URL` como URL base del API. Si no se define, utiliza `/api`.

Para usar el proxy de desarrollo de Vite, configura la URL base como `/api` y ajusta `VITE_DEV_API_TARGET` para que apunte al backend local:

```dotenv
VITE_API_URL=/api
VITE_DEV_API_TARGET=http://localhost:3000
```

El proxy reenvía las solicitudes `/api/*` al destino indicado; si se omite `VITE_DEV_API_TARGET`, el destino predeterminado es `http://localhost:3001`.

También puedes configurar `VITE_API_URL` con la URL completa del API, por ejemplo `http://localhost:3001/api`. En ese caso, las solicitudes van directamente a esa dirección y no pasan por el proxy de Vite. En producción, define `VITE_API_URL` con la URL pública del API antes de compilar.

## Comandos

| Comando           | Descripción                                               |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo con recarga en caliente. |
| `npm run build`   | Genera la versión de producción en `dist/`.               |
| `npm run preview` | Sirve localmente la compilación de producción.            |

## Estructura del proyecto

```text
├── docs/
│   └── API.md                  # Contrato del API
├── scripts/
│   ├── pack.ps1                # Empaquetado para Windows
│   └── pack.sh                 # Empaquetado para macOS/Linux
├── src/
│   ├── components/             # Vistas, navegación y modales
│   ├── services/
│   │   └── api.ts              # Cliente HTTP y gestión de sesión
│   ├── types/
│   │   └── index.ts            # Tipos de datos de la aplicación
│   ├── App.tsx                 # Sesión, carga de datos y vistas
│   ├── constants.ts            # Constantes compartidas
│   ├── index.css               # Estilos globales y tema
│   └── main.tsx                # Punto de entrada de React
├── index.html
├── package.json
└── vite.config.ts
```

## Integración con el backend

Las llamadas HTTP se centralizan en `src/services/api.ts`. El cliente cubre autenticación, cursos, alumnos, recursos y auditoría; la sesión se conserva mediante un token en el almacenamiento local del navegador. El backend debe implementar las rutas y los formatos de datos que consume este cliente.

Si la API cambia, compara y actualiza el cliente y la documentación de [docs/API.md](./docs/API.md) para mantener ambos contratos alineados. En producción, si el frontend y el API se publican en orígenes distintos, configura CORS en el servidor para permitir el origen del frontend.
