// ==========================================
// 1. TIPOS BASE Y ENUMS DEL SISTEMA
// ==========================================

export type ActiveTab =
	| 'inicio'
	| 'cursos'
	| 'alumnos'
	| 'auditoria'
	| 'configuracion';

export type UserRole = 'admin' | 'usuario';
export type UserStatus = 'activo' | 'inactivo';
export type CourseStatus = 'activo' | 'finalizado' | 'retirado';
export type Modality = 'Presencial' | 'Virtual';

// ==========================================
// 2. MODELOS DIRECTOS DE LA BD (Sequelize / Supabase)
// ==========================================

/** Tabla: usuarios */
export interface DBUser {
	id: string; // uuid
	email: string;
	password_hash: string;
	rol: UserRole;
	estado: UserStatus;
	ultimo_acceso: string | null; // timestamptz
	creado_en: string; // timestamptz
}

/** Tabla: estudiantes */
export interface DBStudent {
	id: string; // uuid
	usuario_id: string; // uuid (FK usuarios)
	nombres: string;
	apellidos: string;
	telefono: string;
	creado_en: string; // timestamptz
}

/** Tabla: cursos */
export interface DBCourse {
	id: string;
	codigo: string;
	nombre: string;
	docente_nombre: string;
	modalidad: Modality;
	horario: string;
	aula: string;
	descripcion: string;
	creado_en: string;
}

/** Tabla: inscripciones (relación N:M estudiantes <-> cursos) */
export interface DBEnrollment {
	id: string; // uuid
	estudiante_id: string; // uuid (FK estudiantes)
	curso_id: string; // uuid (FK cursos)
	fecha_inscripcion: string; // timestamptz
	fecha_finalizacion: string | null; // timestamptz
	estado_curso: CourseStatus;
	certificado_url: string | null;
}

/** Tabla: recursos */
export interface DBResource {
	id: string;
	codigo: string;
	titulo: string;
	descripcion: string;
	asignatura: string;
	url: string;
	autor: string;
	creado_en: string;
	cursos?: (DBCourse & {
		RecursoCurso?: {
			curso_id: string;
			recurso_id: string;
			asignado_en: string;
		};
	})[];
}

/** Tabla: recursos_curso (tabla intermedia N:M cursos <-> recursos) */
export interface DBCourseResource {
	curso_id: string; // uuid (FK cursos)
	recurso_id: string; // uuid (FK recursos)
	asignado_en: string; // timestamptz
}

// ==========================================
// 3. MODELOS ADAPTADOS PARA EL FRONTEND (Views / UI)
// ==========================================

/** Usuario autenticado en sesión */
export interface AuthUser {
	id: string;
	email: string;
	rol: string;
	estado: string;
	estudiante?: {
		id: string;
		nombres: string;
		apellidos: string;
		telefono?: string;
	};
}

/**
 * Vista Curso (Adaptada a las propiedades reales devueltas por la API)
 */
export interface Course {
	id: string;
	codigo: string; // mapeado desde 'codigo'
	nombre: string; // mapeado desde 'nombre'
	docente_nombre: string; // mapeado desde 'docente_nombre'
	modalidad: Modality; // mapeado desde 'modalidad'
	horario: string; // mapeado desde 'horario'
	aula: string; // mapeado desde 'aula'
	descripcion: string; // mapeado desde 'descripcion'
	studentCount?: number;
	creado_en?: string; // mapeado desde 'creado_en'
	temario?: any[]; // por si tu frontend lo usa por defecto
}

export type NewCourse = Omit<Course, 'id' | 'studentCount' | 'creado_en'> & {
	codigo?: string; // <--- Permitimos que viaje el código desde el formulario
};

/**
 * Vista Alumno (Unifica tabla estudiantes + usuarios + inscripciones)
 */
export interface Student {
	id: string;
	userId: string;
	fullName: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	status: UserStatus;
	lastAccess: string | null;
	enrolledCourses?: {
		courseId: string;
		courseCode: string;
		courseName: string;
		status: string;
	}[];
}

export interface StudentInput {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	password?: string;
	courseId?: string;
	status?: UserStatus;
}

/**
 * Recurso educativo para la interfaz (Actualizado acorde a la estructura de la API)
 */
export interface Resource {
	id: string;
	codigo: string;
	titulo: string;
	descripcion: string;
	asignatura: string;
	url: string;
	autor: string;
	assignedCourses: string[];
	assignedCourseIds: string[];
	creado_en: string;
}

export type NewResource = Omit<
	Resource,
	'id' | 'codigo' | 'creado_en' | 'assignedCourses'
> & {
	assignedCourseIds: string[];
};

export interface NewResourceForm {
	title: string;
	subject: string;
	description: string;
	url: string;
	assignedCourseIds: string[]; // Usamos IDs en lugar de nombres
	notifyDelegates?: boolean;
	dueDate?: string;
	requiresSubmission?: boolean;
}
// ==========================================
// 4. AUDITORÍA Y NOTIFICACIONES
// ==========================================

export interface ToastMessage {
	id: string;
	title: string;
	description?: string;
	type?: 'success' | 'info' | 'warning';
}

export interface AuditEntry {
	id: string;
	actor: string;
	role: UserRole;
	action: string;
	target: string;
	timestamp: string;
	ip: string;
	severity: 'info' | 'warning' | 'critical';
}
