import { useCallback, useEffect, useState } from 'react';
import { BookOpenCheck, Database } from 'lucide-react';
import {
	ActiveTab,
	AuditEntry,
	AuthUser,
	Course,
	NewCourse,
	NewResource,
	Resource,
	Student,
	StudentInput,
	ToastMessage,
} from './types';
import { AlumnosView } from './components/AlumnosView';
import { AuditView } from './components/AuditView';
import { CursosView } from './components/CursosView';
import { DeleteModal } from './components/DeleteModal';
import { Header } from './components/Header';
import { InicioView } from './components/InicioView';
import { LoginView } from './components/LoginView';
import { ResourceModal } from './components/ResourceModal';
import { ResourcePreviewModal } from './components/ResourcePreviewModal';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import {
	API_URL,
	api,
	setUnauthorizedHandler,
	tokenStore,
} from './services/api';

const errorMessage = (error: unknown) =>
	error instanceof Error ? error.message : 'Error desconocido.';

export default function App() {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [activeTab, setActiveTab] = useState<ActiveTab>('cursos');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [courses, setCourses] = useState<Course[]>([]);
	const [resources, setResources] = useState<Resource[]>([]);
	const [students, setStudents] = useState<Student[]>([]);
	const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [defaultCourse, setDefaultCourse] = useState<string | undefined>();
	const [previewResource, setPreviewResource] = useState<Resource | null>(null);
	const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(
		null
	);
	const [toasts, setToasts] = useState<ToastMessage[]>([]);
	const [booting, setBooting] = useState(() => Boolean(tokenStore.get()));
	const [loadingData, setLoadingData] = useState(false);

	const canManage = user?.rol === 'admin';

	const addToast = useCallback(
		(title: string, description?: string, type?: ToastMessage['type']) => {
			const toast: ToastMessage = {
				id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				title,
				description,
				type,
			};
			setToasts((current) => [...current, toast]);
			window.setTimeout(() => {
				setToasts((current) => current.filter((item) => item.id !== toast.id));
			}, 4000);
		},
		[]
	);

	/** Ejecuta una llamada a la API; si falla muestra un aviso y devuelve null. */
	const run = useCallback(
		async <T,>(
			action: () => Promise<T>,
			errorTitle: string
		): Promise<T | null> => {
			try {
				return await action();
			} catch (error) {
				addToast(errorTitle, errorMessage(error), 'warning');
				return null;
			}
		},
		[addToast]
	);

	const resetSession = useCallback(() => {
		setUser(null);
		setCourses([]);
		setResources([]);
		setStudents([]);
		setAuditEntries([]);
		setIsMobileMenuOpen(false);
		setPreviewResource(null);
		setResourceToDelete(null);
		setIsAddModalOpen(false);
	}, []);

	// Restaura la sesión si hay un token guardado
	useEffect(() => {
		setUnauthorizedHandler(resetSession);
		if (!tokenStore.get()) return;
		let alive = true;
		api.auth
			.me()
			.then((me) => alive && setUser(me))
			.catch(() => tokenStore.clear())
			.finally(() => alive && setBooting(false));
		return () => {
			alive = false;
			setUnauthorizedHandler(null);
		};
	}, [resetSession]);

	// Carga de datos al iniciar sesión. Alumnos y auditoría solo para administradores.
	useEffect(() => {
		if (!user) return;
		let alive = true;
		const isAdmin = user.rol === 'admin';
		setLoadingData(true);
		Promise.all([
			api.courses.list(),
			api.resources.list(),
			isAdmin ? api.students.list() : Promise.resolve([] as Student[]),
			isAdmin ? api.audit.list() : Promise.resolve([] as AuditEntry[]),
		])
			.then(([courseList, resourceList, studentList, auditList]) => {
				if (!alive) return;
				setCourses(courseList);
				setResources(resourceList);
				setStudents(studentList);
				setAuditEntries(auditList);
			})
			.catch((error) => {
				if (alive)
					addToast(
						'No se pudieron cargar los datos',
						errorMessage(error),
						'warning'
					);
			})
			.finally(() => {
				if (alive) setLoadingData(false);
			});
		return () => {
			alive = false;
		};
	}, [user, addToast]);

	const refreshCourses = () =>
		run(() => api.courses.list(), 'No se pudieron actualizar los cursos').then(
			(list) => list && setCourses(list)
		);
	const refreshResources = () =>
		run(
			() => api.resources.list(),
			'No se pudieron actualizar los recursos'
		).then((list) => list && setResources(list));
	const refreshStudents = () =>
		run(
			() => api.students.list(),
			'No se pudieron actualizar los alumnos'
		).then((list) => list && setStudents(list));

	const openResourceModal = (courseName?: string) => {
		if (!canManage) {
			addToast(
				'Acceso de consulta',
				'Solo el administrador puede publicar recursos nuevos.'
			);
			return;
		}
		setDefaultCourse(courseName);
		setIsAddModalOpen(true);
	};

	const handleLogin = (authenticatedUser: AuthUser) => {
		setUser(authenticatedUser);
		setActiveTab('cursos');
	};

	const handleLogout = () => {
		api.auth.logout();
		resetSession();
	};

	/* ---------------------------- Recursos ---------------------------- */

	const handleAddResource = async (data: NewResource): Promise<boolean> => {
		const created = await run(
			() => api.resources.create(data),
			'No se pudo publicar el recurso'
		);
		if (!created) return false;
		setResources((current) => [created, ...current]);
		addToast(
			'Recurso publicado',
			`Disponible en ${created.id.length} curso(s).`
		);
		return true;
	};

	const handleDeleteResource = async () => {
		if (!resourceToDelete) return;
		const target = resourceToDelete;
		const done = await run(
			() => api.resources.remove(target.id).then(() => true),
			'No se pudo eliminar el recurso'
		);
		if (!done) return;
		setResources((current) =>
			current.filter((resource) => resource.id !== target.id)
		);
		addToast(
			'Recurso eliminado',
			`Se retiró "${target.title}" del repositorio.`
		);
		setResourceToDelete(null);
	};

	/* ----------------------------- Cursos ----------------------------- */

	const handleAddCourse = async (data: NewCourse): Promise<boolean> => {
		const created = await run(
			() => api.courses.create(data),
			'No se pudo crear el curso'
		);
		if (!created) return false;
		setCourses((current) => [...current, created]);
		addToast('Curso añadido', `${created.name} ya puede recibir recursos.`);
		return true;
	};

	const handleDeleteCourse = async (course: Course) => {
		const done = await run(
			() => api.courses.remove(course.id).then(() => true),
			'No se pudo eliminar el curso'
		);
		if (!done) return;
		setCourses((current) => current.filter((item) => item.id !== course.id));
		// El servidor limpia referencias en recursos y alumnos: se vuelve a leer.
		void refreshResources();
		if (canManage) void refreshStudents();
		addToast('Curso eliminado', `${course.name} fue retirado del catálogo.`);
	};

	/* ---------------------------- Alumnos ----------------------------- */

	const handleAddStudent = async (data: StudentInput): Promise<boolean> => {
		const created = await run(
			() => api.students.create(data),
			'No se pudo añadir el alumno'
		);
		if (!created) return false;
		setStudents((current) => [created, ...current]);
		void refreshCourses(); // el servidor recalcula studentCount
		addToast(
			'Alumno añadido',
			`${created.fullName} ya forma parte del directorio.`
		);
		return true;
	};

	const handleUpdateStudent = async (
		id: string,
		data: Partial<StudentInput>
	): Promise<boolean> => {
		const updated = await run(
			() => api.students.update(id, data),
			'No se pudo actualizar el alumno'
		);
		if (!updated) return false;
		setStudents((current) =>
			current.map((existing) => (existing.id === id ? updated : existing))
		);
		void refreshCourses();
		addToast(
			'Alumno actualizado',
			`Se guardaron los cambios de ${updated.fullName}.`
		);
		return true;
	};

	const handleSetStudentPassword = async (
		student: Student,
		password: string
	): Promise<boolean> => {
		const done = await run(
			() => api.students.setPassword(student.id, password).then(() => true),
			'No se pudo cambiar la contraseña'
		);
		if (!done) return false;
		addToast(
			'Contraseña actualizada',
			`La nueva credencial de ${student.fullName} ya está vigente.`
		);
		return true;
	};

	const handleDeleteStudent = async (student: Student) => {
		const done = await run(
			() => api.students.remove(student.id).then(() => true),
			'No se pudo eliminar el alumno'
		);
		if (!done) return;
		setStudents((current) =>
			current.filter((existing) => existing.id !== student.id)
		);
		void refreshCourses();
		addToast(
			'Alumno eliminado',
			`${student.fullName} fue retirado del directorio.`
		);
	};

	const handleCopyLink = (resource: Resource) => {
		const link =
			resource.url ||
			`https://doctiva.app/recursos/${resource.code.toLowerCase()}`;
		navigator.clipboard?.writeText(link);
		addToast('Enlace copiado', link);
	};

	if (booting || (user && loadingData)) {
		return (
			<div className="min-h-screen bg-[#f1f0e6] flex items-center justify-center p-6">
				<div className="rounded-[32px] bg-[#111112] text-[#f1f0e6] px-10 py-9 shadow-pop flex flex-col items-center gap-5">
					<div className="w-14 h-14 rounded-2xl bg-[#ebff57] text-black flex items-center justify-center animate-pulse">
						<Database className="w-6 h-6" />
					</div>
					<h1 className="font-black tracking-tight text-lg">
						{booting ? 'Verificando sesión' : 'Cargando datos'}
					</h1>
				</div>
			</div>
		);
	}

	if (!user) return <LoginView onLogin={handleLogin} />;

	return (
		<div className="min-h-screen bg-[#f1f0e6] text-ink flex flex-col">
			<Sidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				courseCount={courses.length}
				studentCount={students.length}
				user={user}
				onLogout={handleLogout}
				isMobileOpen={isMobileMenuOpen}
				setIsMobileOpen={setIsMobileMenuOpen}
			/>
			<div className="lg:pl-[292px] flex flex-col flex-1 min-h-screen">
				<Header
					activeTab={activeTab}
					onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					onAddResourceClick={() => openResourceModal()}
					canManage={canManage}
				/>
				<main className="flex-1 p-4 sm:p-6 lg:px-8 lg:pb-8 max-w-7xl w-full mx-auto space-y-6">
					{activeTab === 'inicio' && (
						<InicioView
							resources={resources}
							courses={courses}
							students={students}
							user={user}
							onAddResourceClick={() => openResourceModal()}
							onNavigateTab={setActiveTab}
							onPreviewResource={setPreviewResource}
						/>
					)}

					{activeTab === 'cursos' && (
						<CursosView
							courses={courses}
							resources={resources}
							canManage={canManage}
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							onAddCourse={handleAddCourse}
							onDeleteCourse={handleDeleteCourse}
							onAddResourceForCourse={(courseName) =>
								openResourceModal(courseName)
							}
							onPreviewResource={setPreviewResource}
							onDeleteResource={setResourceToDelete}
							onCopyLink={handleCopyLink}
						/>
					)}

					{activeTab === 'alumnos' && canManage && (
						<AlumnosView
							students={students}
							courses={courses}
							onAddStudent={handleAddStudent}
							onUpdateStudent={handleUpdateStudent}
							onSetPassword={handleSetStudentPassword}
							onDeleteStudent={handleDeleteStudent}
							onNotify={addToast}
						/>
					)}

					{activeTab === 'auditoria' && canManage && (
						<AuditView entries={auditEntries} />
					)}
					{activeTab === 'configuracion' && canManage && (
						<SettingsView
							user={user}
							onNotify={addToast}
							apiUrl={API_URL}
							onTestConnection={async () => {
								try {
									await api.health();
									addToast(
										'Conexión correcta',
										`Servidor disponible en ${API_URL}`
									);
								} catch (error) {
									addToast('Error de conexión', errorMessage(error), 'warning');
								}
							}}
						/>
					)}
				</main>

				<footer className="px-6 lg:px-8 pb-6 pt-2 mt-auto">
					<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-mute">
						<div className="flex items-center gap-2">
							<span className="font-bold text-ink uppercase tracking-widest">
								Doctiva Learning · doctiva.app
							</span>
							<span>·</span>
							<span>Acceso unificado</span>
						</div>
						<div className="inline-flex items-center gap-2">
							<BookOpenCheck className="w-3.5 h-3.5" /> Repositorio verificado
						</div>
					</div>
				</footer>
			</div>

			<ResourceModal
				key={defaultCourse || 'general'}
				isOpen={isAddModalOpen}
				onClose={() => {
					setIsAddModalOpen(false);
					setDefaultCourse(undefined);
				}}
				courses={courses}
				defaultCourse={defaultCourse}
				onAddResource={handleAddResource}
			/>
			<ResourcePreviewModal
				resource={previewResource}
				onClose={() => setPreviewResource(null)}
				onCopyLink={handleCopyLink}
			/>
			<DeleteModal
				isOpen={!!resourceToDelete}
				resource={resourceToDelete}
				onClose={() => setResourceToDelete(null)}
				onConfirm={handleDeleteResource}
			/>
			<ToastContainer
				toasts={toasts}
				onDismiss={(id) =>
					setToasts((current) => current.filter((toast) => toast.id !== id))
				}
			/>
		</div>
	);
}
