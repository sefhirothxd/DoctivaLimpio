# Traspaso técnico · Intranet Académica

Documento de entrega para quien continúe el desarrollo. Léelo completo antes de tocar código:
explica arquitectura, convenciones visuales, modelo de datos y puntos ciegos conocidos.

---

## 1 · Ficha del proyecto

| Campo      | Valor                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Producto   | Doctiva Learning (doctiva.app): intranet académica con cursos presenciales/virtuales y recursos por enlace.         |
| Stack      | React 19 · Vite 7 · TypeScript 5.9 · Tailwind CSS 4 · lucide-react · canvas-confetti.                               |
| Tipografía | **Satoshi** (Fontshare CDN, pesos 400–900). Fallback: system-ui.                                                    |
| Kit visual | Lima `#ebff57` · Menta `#7bfcec` · Crema `#f1f0e6` · Tinta `#111112` · Gris `#7f7f80`.                              |
| Build      | `vite build` → sitio estático en `dist/`.                                                                           |
| Backend    | Express + Sequelize (repositorio aparte). El front lo consume vía `src/services/api.ts`; contrato en `docs/API.md`. |

## 2 · Puesta en marcha (3 comandos)

```bash
npm install
npm run dev        # http://localhost:5173
```

El login valida contra el backend (`POST /auth/login`); el rol viene en el usuario devuelto.

Variables de entorno (ver `.env.example`): `VITE_API_URL` y `VITE_DEV_API_TARGET`.

## 3 · Qué incluye este paquete y qué se excluyó a propósito

**Incluye:** código fuente (`src/`), `index.html`, configs (`package.json`, `tsconfig.json`,
`vite.config.ts`), docs (`README.md`, `docs/API.md`,
este archivo) y scripts de empaquetado (`scripts/`).

**Excluido (se regenera o es secreto):** `node_modules/` (cientos de MB), `dist/` (build),
`.env` (claves reales), `.git/` (historial, opcional), zips previos.
Si existe `package-lock.json`, **inclúyelo siempre**: garantiza versiones idénticas al instalar.

## 4 · Arquitectura

```
LoginView ──> AuthUser { role: 'admin' | 'usuario' }
                  │
App.tsx (estado global + pestañas ActiveTab)
   ├── Sidebar / Header            navegación y CTA según rol
   ├── InicioView · CursosView (recursos anidados) · AlumnosView · AuditView · SettingsView
   └── api (src/services/api.ts)  fetch + JWT → backend Express/Sequelize
```

Decisiones clave:

1. **Ruteo por pestañas, no por URL.** `ActiveTab` vive en `App.tsx`. Si se necesita deep-linking,
   migrar a `react-router` respetando el guard de rol.
2. **Permisos en un solo punto:** `const canManage = user?.role === 'admin'` en `App.tsx`.
   Todas las vistas reciben `canManage` y ocultan acciones destructivas para `usuario`.
   ⚠️ Es una guardia de UI: la autoridad real debe vivir en RLS/backend.
3. **Un solo cliente HTTP.** Ningún componente usa `fetch`; todo pasa por `api` en `src/services/api.ts`.
   Si cambian rutas o nombres de campos del backend, se ajusta solo ese archivo.
4. **El servidor es la fuente de verdad.** Los handlers de `App.tsx` esperan la respuesta de la API
   antes de tocar el estado y muestran un aviso si falla. `id`, `code`, `registrationNumber`,
   `studentCount`, `author` y `createdAt` los asigna el backend.
5. **Contraseñas solo de escritura.** El front puede asignarlas o reemplazarlas, nunca consultarlas.

## 5 · Mapa de funcionalidad → archivo

| Función                                                  | Archivo                                   |
| -------------------------------------------------------- | ----------------------------------------- |
| Login unificado y roles                                  | `src/components/LoginView.tsx`            |
| Navegación, badges, logout                               | `src/components/Sidebar.tsx`              |
| Búsqueda global, avisos, CTA                             | `src/components/Header.tsx`               |
| KPIs y actividad reciente                                | `src/components/InicioView.tsx`           |
| Cursos como contenedores: alta/baja + recursos anidados  | `src/components/CursosView.tsx`           |
| CRUD de alumnos (modal crear/editar + confirmar borrado) | `src/components/AlumnosView.tsx`          |
| Asistente de publicación en 4 pasos                      | `src/components/ResourceModal.tsx`        |
| Filtros por tipo y búsqueda sobre los recursos anidados  | `src/components/CursosView.tsx`           |
| Visor simulado por tipo (ppt/video/pdf/link)             | `src/components/ResourcePreviewModal.tsx` |
| Auditoría y grupos de permisos                           | `src/components/AuditView.tsx`            |
| Configuración + prueba de conexión al API                | `src/components/SettingsView.tsx`         |
| Tokens de diseño (colores, sombras, Satoshi)             | `src/index.css` (`@theme`) + `index.html` |
| Modelo de dominio                                        | `src/types/index.ts`                      |
| Cliente del backend                                      | `src/services/api.ts`                     |

## 6 · Modelo de datos

Tipos en `src/types/index.ts`; endpoints y reglas del servidor en `docs/API.md`.

- `Resource.assignedCourses` guarda **nombres** de curso (no ids).
- `Course.studentCount` lo calcula el servidor; tras altas/bajas de alumnos el front vuelve a pedir `/cursos`.
- `Student.courseCode` referencia `Course.code`.

## 7 · Convenciones visuales (no romper el kit)

- Radios: tarjetas `rounded-[28px]`–`[36px]`, controles y CTAs `rounded-full`.
- Sombras: `shadow-card` (reposo) y `shadow-pop` (hover/modal) definidas en `index.css`.
- Superficies: blanco sobre crema `#f1f0e6`; paneles oscuros `#111112` con acento lima.
- Estado activo = inversión (fondo tinta + texto lima/menta), nunca solo color:
  todo icono de estado lleva etiqueta o check.
- Micro-interacciones obligatorias en botones primarios: `hover:-translate-y-0.5` + cambio de tono.
- Iconos: **solo lucide-react**. No introducir emojis ni glifos sueltos.
- Tipografía: Satoshi para todo (display 900, cuerpo 400–500). No mezclar familias.

## 8 · Receta: añadir un módulo nuevo

1. Amplía `ActiveTab` en `src/types/index.ts`.
2. Crea `src/components/MiView.tsx` siguiendo el patrón: cabecera con pill de sección,
   tarjetas `rounded-[28px] bg-white shadow-card`, acciones con `canManage`.
3. Regístralo en `Sidebar.tsx` (array `navItems`) con icono lucide y badge de conteo.
4. Monta la vista en `App.tsx` y añade su rama al `tabLabel` del `Header`.
5. Si toca datos: añade el recurso en `src/services/api.ts`, su ruta/modelo en el backend y documéntalo en `docs/API.md`.

## 9 · Puntos ciegos y deuda conocida

- **Token en localStorage:** el JWT se guarda en `localStorage` (`doctiva-token`). Aceptable para una
  intranet; si se endurece, migrar a cookie `httpOnly` en el backend.
- **Permisos:** el front solo oculta acciones. El backend debe validar el rol en cada ruta (ver `docs/API.md`).
- **Fuente por CDN:** en intranets sin internet, descargar Satoshi y servirla desde `public/`.
- **Auditoría:** `AuditView` solo lee `/audit`; el backend debe registrar las acciones reales en cada mutación.
- **Datos para usuarios no admin:** solo cargan cursos y recursos; alumnos y auditoría se piden solo a admin.

## 10 · Checklist de aceptación antes de dar por bueno el traspaso

- [ ] `npm install` limpio sin warnings bloqueantes.
- [ ] Con el backend arriba, `npm run dev` permite iniciar sesión con ambos roles.
- [ ] CRUD de cursos, recursos y alumnos persiste tras recargar.
- [ ] El contador de alumnos por curso se actualiza al crear, mover o borrar alumnos.
- [ ] Cambiar la contraseña de un alumno funciona y la contraseña actual nunca se muestra.
- [ ] Con el backend apagado, la app muestra el aviso de error en lugar de romperse.
- [ ] "Probar conexión" en Configuración responde en verde.
- [ ] `npm run build` genera `dist/` sin errores.
