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

export const API_URL = (import.meta.env.BACKEND_URL ?? '/api').replace(
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
		list: () => request<Student[]>('/estudiantes'),
		create: (data: StudentInput) =>
			request<Student>('/estudiantes', { method: 'POST', body: data }),
		update: (id: string, data: Partial<StudentInput>) =>
			request<Student>(`/estudiantes/${encodeURIComponent(id)}`, {
				method: 'PUT',
				body: data,
			}),
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
		list: () => request<Resource[]>('/recursos'),
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
