# Contrato del API (Express + Sequelize)

El frontend solo habla con el backend a través de `src/services/api.ts`. Si tus rutas o nombres
de campos son distintos, **ese es el único archivo que debes adaptar**.

- Base URL: `VITE_API_URL` (por defecto `/api`; en desarrollo Vite la reenvía a `VITE_DEV_API_TARGET`).
- Formato: JSON en camelCase. Errores: `{ "message": "Texto legible" }` con el status HTTP correcto.
- Auth: `Authorization: Bearer <JWT>` en todo salvo `/health` y `/auth/login`.
  Un `401` con sesión activa cierra la sesión en el frontend.

## Endpoints

| Método | Ruta                     | Rol        | Body                    | Respuesta                                 |
| ------ | ------------------------ | ---------- | ----------------------- | ----------------------------------------- |
| GET    | `/health`                | público    | —                       | `{ ok: true }`                            |
| POST   | `/auth/login`            | público    | `{ email, password }`   | `{ token, user: AuthUser }`               |
| GET    | `/auth/me`               | cualquiera | —                       | `AuthUser`                                |
| GET    | `/cursos`                | cualquiera | —                       | `Course[]` (con `studentCount` calculado) |
| POST   | `/cursos`                | admin      | `NewCourse`             | `Course` (201)                            |
| DELETE | `/cursos/:id`            | admin      | —                       | 204                                       |
| GET    | `/recursos`              | cualquiera | —                       | `Resource[]` (más recientes primero)      |
| POST   | `/recursos`              | admin      | `NewResource`           | `Resource` (201)                          |
| DELETE | `/recursos/:id`          | admin      | —                       | 204                                       |
| GET    | `/students`              | admin      | —                       | `Student[]`                               |
| POST   | `/students`              | admin      | `StudentInput`          | `Student` (201)                           |
| PUT    | `/students/:id`          | admin      | `Partial<StudentInput>` | `Student`                                 |
| PUT    | `/students/:id/password` | admin      | `{ password }`          | 204                                       |
| DELETE | `/students/:id`          | admin      | —                       | 204                                       |
| GET    | `/audit`                 | admin      | —                       | `AuditEntry[]`                            |

Los tipos están en `src/types/index.ts`.

## Lo que decide el servidor (el frontend ya no lo genera)

- **`id`** de todas las entidades (UUID o autoincremental, siempre devuelto como string).
- **`code`** de cursos (`CUR-001`…) y de recursos (`REC-2026-123`), y **`registrationNumber`** de alumnos.
- **`Course.studentCount`**: `COUNT` de alumnos por `courseCode`. El frontend vuelve a pedir `/cursos`
  después de crear, mover o borrar alumnos.
- **`Resource.author`, `createdAt`, `views`**: autor tomado del JWT.
- **Contraseñas**: se guardan con hash (bcrypt/argon2) y **nunca** se devuelven en `Student`.
  `PUT /students/:id` solo cambia la contraseña si el body trae `password`.
- **Integridad al borrar**:
  - `DELETE /cursos/:id` → alumnos con ese curso quedan con `courseCode = ''`/null y se quita el nombre
    del curso de `Resource.assignedCourses`. El frontend vuelve a leer recursos y alumnos.
  - Valida unicidad de `code`, `registrationNumber` y `email`.
- **Permisos reales**: el frontend solo oculta botones; los roles se validan en cada ruta con middleware.

## Notas de modelado (Sequelize)

| Campo                                       | Sugerencia                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------ |
| `Course.temario`                            | `DataTypes.JSON` (arreglo de `{ id, title, weeks, topics[] }`)           |
| `Resource.assignedCourses`, `Resource.tags` | `DataTypes.JSON`, o tabla pivote si necesitas consultas por curso        |
| `Student.courseCode`                        | FK a `Course.code` con `onDelete: 'SET NULL'`                            |
| `Student.passwordHash`                      | oculto con `defaultScope: { attributes: { exclude: ['passwordHash'] } }` |
| `Student.lastAccess`                        | actualizar en el login del alumno                                        |

`Resource.assignedCourses` guarda **nombres** de curso (así lo usa la UI hoy). Si lo cambias a ids,
ajusta `ResourceModal`, `CursosView` y `CourseDetailModal`.

## CORS

Con el proxy de Vite no hace falta en desarrollo. En producción, si front y API están en dominios
distintos, habilita CORS para el origen del frontend (`app.use(cors({ origin: 'https://doctiva.app' }))`).
