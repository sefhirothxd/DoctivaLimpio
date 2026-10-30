import type {
	AuditEntry,
	AuthUser,
	Course,
	NewCourse,
	NewResource,
	Resource,
	Student,
	StudentInput,
} from '../types';

/**
 * Cliente HTTP del backend (Express + Sequelize).
 * Todas las llamadas de la app pasan por aquí; ningún componente usa fetch directamente.
 * Contrato de endpoints: docs/API.md
 */

export const API_URL = (import.meta.env.VITE_DEV_API_TARGET ?? '/api').replace(
	/\/$/,
	''
);
const TOKEN_KEY = 'doctiva-token';

export const tokenStore = {
	get: () => localStorage.getItem(TOKEN_KEY),
	set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
	clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
	constructor(
		message: string,
		public readonly status: number
	) {
		super(message);
	}
}

/** Se dispara cuando el backend responde 401 con una sesión activa (token vencido). */
let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (handler: (() => void) | null) => {
	onUnauthorized = handler;
};

async function request<T>(
	path: string,
	options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
	const token = tokenStore.get();
	let response: Response;
	try {
		response = await fetch(`${API_URL}${path}`, {
			method: options.method ?? 'GET',
			headers: {
				'Content-Type': 'application/json',
				...(token && options.auth !== false
					? { Authorization: `Bearer ${token}` }
					: {}),
			},
			body:
				options.body === undefined ? undefined : JSON.stringify(options.body),
		});
	} catch {
		throw new ApiError('No se pudo conectar con el servidor.', 0);
	}

	if (response.status === 401 && options.auth !== false && token) {
		tokenStore.clear();
		onUnauthorized?.();
	}

	if (!response.ok) {
		const payload = await response.json().catch(() => null);
		throw new ApiError(
			payload?.message ?? `El servidor respondió ${response.status}.`,
			response.status
		);
	}

	return response.status === 204
		? (undefined as T)
		: ((await response.json()) as T);
}

const mapStudent = (item: any): Student => ({
	id: item.id,
	userId: item.usuario_id,
	fullName:
		item.nombres && item.apellidos
			? `${item.nombres} ${item.apellidos}`
			: item.fullName || '',
	firstName: item.nombres || item.firstName || '',
	lastName: item.apellidos || item.lastName || '',
	email: item.usuario?.email || item.email || '',
	phone: item.telefono || item.phone || '',
	status:
		(item.usuario?.estado || item.status || 'activo').toLowerCase() === 'activo'
			? 'activo'
			: 'inactivo',
	lastAccess: item.usuario?.ultimo_acceso || item.lastAccess || null,
	enrolledCourses: item.inscripciones
		? item.inscripciones.map((ins: any) => ({
				courseId: ins.curso_id || ins.courseId,
				courseCode: ins.curso?.codigo || ins.courseCode || '',
				courseName: ins.curso?.nombre || ins.courseName || '',
				status: ins.estado_curso || ins.status || 'activo',
			}))
		: item.enrolledCourses || [],
});

export const api = {
	health: () => request<{ ok: boolean }>('/health', { auth: false }),

	auth: {
		async login(email: string, password: string): Promise<AuthUser> {
			// Cambiamos 'user' por 'usuario' para que coincida con el backend
			const { token, usuario } = await request<{
				token: string;
				usuario: AuthUser;
			}>('/usuarios/login', {
				method: 'POST',
				body: { email, password },
				auth: false,
			});
			tokenStore.set(token);
			return usuario; // Retornamos el usuario correctamente
		},
		me: () => request<AuthUser>('/auth/me'),
		logout: () => tokenStore.clear(),
	},

	courses: {
		list: () => request<Course[]>('/cursos'),
		create: (data: NewCourse) =>
			request<Course>('/cursos', { method: 'POST', body: data }),
		remove: (id: string) =>
			request<void>(`/cursos/${encodeURIComponent(id)}`, { method: 'DELETE' }),
	},

	students: {
		list: async (): Promise<Student[]> => {
			const rawStudents = await request<any[]>('/estudiantes');
			return rawStudents.map(mapStudent);
		},
		create: async (data: StudentInput): Promise<Student> => {
			// Traducimos los campos al formato en español que espera el backend
			const payload = {
				email: data.email,
				password: data.password,
				nombres: data.firstName,
				apellidos: data.lastName,
				telefono: data.phone,
				courseId: data.courseId,
				status: data.status,
			};
			const raw = await request<any>('/estudiantes', {
				method: 'POST',
				body: payload,
			});
			return mapStudent(raw);
		},
		update: async (
			id: string,
			data: Partial<StudentInput>
		): Promise<Student> => {
			const payload: any = {
				email: data.email,
				telefono: data.phone,
				status: data.status,
				courseId: data.courseId,
			};
			if (data.firstName) payload.nombres = data.firstName;
			if (data.lastName) payload.apellidos = data.lastName;
			if (data.password) payload.password = data.password;

			const raw = await request<any>(`/estudiantes/${encodeURIComponent(id)}`, {
				method: 'PUT',
				body: payload,
			});
			return mapStudent(raw);
		},
		setPassword: (id: string, password: string) =>
			request<void>(`/estudiantes/${encodeURIComponent(id)}/password`, {
				method: 'PUT',
				body: { password },
			}),
		remove: (id: string) =>
			request<void>(`/estudiantes/${encodeURIComponent(id)}`, {
				method: 'DELETE',
			}),
	},

	resources: {
		list: async (): Promise<Resource[]> => {
			// Recibimos los datos con la estructura original del backend (incluyendo la propiedad "cursos")
			const rawResources = await request<any[]>('/recursos');

			// Mapeamos y transformamos los datos al formato que esperan los componentes de React
			return rawResources.map((item) => ({
				id: item.id,
				codigo: item.codigo,
				titulo: item.titulo,
				descripcion: item.descripcion,
				asignatura: item.asignatura,
				url: item.url,
				autor: item.autor,
				creado_en: item.creado_en,
				// Extraemos los nombres de los cursos para mantener compatibilidad visual
				assignedCourses: item.cursos
					? item.cursos.map((c: any) => c.nombre)
					: [],
				// Extraemos los IDs de los cursos para que el filtro por ID funcione perfecto
				assignedCourseIds: item.cursos ? item.cursos.map((c: any) => c.id) : [],
			}));
		},
		create: (data: NewResource) =>
			request<Resource>('/recursos', { method: 'POST', body: data }),
		remove: (id: string) =>
			request<void>(`/recursos/${encodeURIComponent(id)}`, {
				method: 'DELETE',
			}),
	},

	audit: {
		list: () => request<AuditEntry[]>('/audit'),
	},
};
