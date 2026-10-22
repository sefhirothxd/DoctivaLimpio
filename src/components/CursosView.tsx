import React, { useMemo, useState } from 'react';
import {
	BookOpen,
	CalendarDays,
	ClipboardPlus,
	DoorOpen,
	Globe,
	Link2,
	ListChecks,
	Plus,
	Search,
	Trash2,
	UserRound,
	Users,
	X,
} from 'lucide-react';
import { Course, Modality, NewCourse, Resource } from '../types';
import { CourseDetailModal } from './CourseDetailModal';

interface TemarioUnit {
	id: string;
	title: string;
	weeks: string;
	topics: string[];
}

const DEFAULT_TEMARIO: TemarioUnit[] = [
	{
		id: 'u1',
		title: 'Unidad 1 · Introducción y fundamentos',
		weeks: 'Semanas 1-2',
		topics: ['Bienvenida y objetivos', 'Conceptos base'],
	},
	{
		id: 'u2',
		title: 'Unidad 2 · Práctica aplicada',
		weeks: 'Semanas 3-6',
		topics: ['Ejercicios guiados', 'Proyecto parcial'],
	},
	{
		id: 'u3',
		title: 'Unidad 3 · Proyecto final',
		weeks: 'Semanas 7-8',
		topics: ['Desarrollo', 'Entrega y revisión'],
	},
];

interface CursosViewProps {
	courses: Course[];
	resources: Resource[];
	canManage: boolean;
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	onAddCourse: (course: NewCourse) => Promise<boolean>;
	onDeleteCourse: (course: Course) => void;
	onAddResourceForCourse: (courseName: string) => void;
	onPreviewResource: (resource: Resource) => void;
	onDeleteResource: (resource: Resource) => void;
	onCopyLink: (resource: Resource) => void;
}

const ACCENTS = [
	'bg-[#ebff57] text-black',
	'bg-[#7bfcec] text-black',
	'bg-[#111112] text-[#ebff57]',
	'bg-white text-black shadow-inset-line',
];

export const CursosView: React.FC<CursosViewProps> = ({
	courses,
	resources,
	canManage,
	searchQuery,
	setSearchQuery,
	onAddCourse,
	onDeleteCourse,
	onAddResourceForCourse,
	onPreviewResource,
	onDeleteResource,
	onCopyLink,
}) => {
	const [modalityFilter, setModalityFilter] = useState<Modality | 'all'>('all');
	const [openCourse, setOpenCourse] = useState<Course | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
	const [form, setForm] = useState({
		name: '',
		instructor: '',
		schedule: '',
		room: '',
		description: '',
		modality: 'Presencial' as Modality,
	});
	const [error, setError] = useState('');
	const [saving, setSaving] = useState(false);

	const query = searchQuery.trim().toLowerCase();

	const resourcesOf = (course: Course) =>
		resources.filter((resource) =>
			(resource.assignedCourses ?? []).includes(course.nombre)
		);

	const visibleCourses = useMemo(
		() =>
			courses.filter((course) => {
				const matchesModality =
					modalityFilter === 'all' || course.modalidad === modalityFilter;
				const matchesQuery =
					!query ||
					course.nombre.toLowerCase().includes(query) ||
					course.codigo.toLowerCase().includes(query) ||
					course.docente_nombre.toLowerCase().includes(query) ||
					resourcesOf(course).some(
						(resource) =>
							resource.title.toLowerCase().includes(query) ||
							resource.subject.toLowerCase().includes(query)
					);
				return matchesModality && matchesQuery;
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[courses, resources, query, modalityFilter]
	);

	const updateField = (field: keyof typeof form, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
		setError('');
	};

	const handleAddCourse = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.name.trim() || !form.instructor.trim()) {
			setError('El nombre del curso y el instructor son obligatorios.');
			return;
		}
		if (
			courses.some(
				(course) =>
					course.nombre.toLowerCase() === form.name.trim().toLowerCase()
			)
		) {
			setError('Ya existe un curso con ese nombre.');
			return;
		}

		setSaving(true);
		const ok = await onAddCourse({
			nombre: form.name.trim(),
			docente_nombre: form.instructor.trim(),
			horario: form.schedule.trim() || 'Horario por definir',
			aula:
				form.room.trim() ||
				(form.modality === 'Virtual' ? 'Aula virtual' : 'Aula por definir'),
			descripcion:
				form.description.trim() ||
				'Curso disponible para inscripción y asignación de recursos.',
			modalidad: form.modality,
			temario: DEFAULT_TEMARIO,
		});
		setSaving(false);
		if (!ok) return;
		setForm({
			name: '',
			instructor: '',
			schedule: '',
			room: '',
			description: '',
			modality: 'Presencial',
		});
		setIsFormOpen(false);
	};

	const modalityChips: Array<{
		id: Modality | 'all';
		label: string;
		icon: React.ComponentType<{ className?: string }>;
		count: number;
	}> = [
		{ id: 'all', label: 'Todas', icon: BookOpen, count: courses.length },
		{
			id: 'Presencial',
			label: 'Presencial',
			icon: DoorOpen,
			count: courses.filter((c) => c.modalidad === 'Presencial').length,
		},
		{
			id: 'Virtual',
			label: 'Virtual',
			icon: Globe,
			count: courses.filter((c) => c.modalidad === 'Virtual').length,
		},
	];

	return (
		<div className="space-y-6">
			{/* Cabecera */}
			<div className="rounded-[32px] bg-white p-6 sm:p-7 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<span className="inline-block px-3 py-1 rounded-full bg-[#ebff57]/70 text-xs font-semibold">
						Catálogo formativo · doctiva.app
					</span>
					<h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">
						Cursos
					</h2>
					<p className="text-sm text-mute mt-1 max-w-2xl">
						Explora las tarjetas de cada curso y abre el desglose completo del
						temario con sus recursos por enlace.
					</p>
				</div>
				{canManage && (
					<button
						onClick={() => setIsFormOpen((open) => !open)}
						className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#111112] text-[#ebff57] hover:bg-neutral-800 font-bold text-sm cursor-pointer transition-transform hover:-translate-y-0.5"
					>
						{isFormOpen ? (
							<X className="w-4 h-4" />
						) : (
							<ClipboardPlus className="w-4 h-4" />
						)}
						<span>{isFormOpen ? 'Cerrar formulario' : 'Añadir curso'}</span>
					</button>
				)}
			</div>

			{/* Formulario de nuevo curso */}
			{canManage && isFormOpen && (
				<form
					onSubmit={handleAddCourse}
					className="rounded-[28px] bg-white p-6 shadow-card space-y-4"
				>
					<div className="flex items-center gap-3 pb-3 border-b border-black/5">
						<div className="w-10 h-10 rounded-2xl bg-[#ebff57] flex items-center justify-center">
							<BookOpen className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-lg font-black tracking-tight">Nuevo curso</h3>
							<p className="text-xs text-mute">
								Se creará con un temario base de 3 unidades que podrás
								referenciar.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{[
							{
								key: 'name',
								label: 'Nombre del curso *',
								placeholder: 'Ej: Illustrator avanzado',
							},
							{
								key: 'instructor',
								label: 'Instructor *',
								placeholder: 'Ej: Prof. Ana Valdés',
							},
							{
								key: 'schedule',
								label: 'Horario',
								placeholder: 'Ej: Mar y Jue · 17:00',
							},
							{
								key: 'room',
								label: 'Aula / laboratorio',
								placeholder: 'Ej: Lab. Diseño 04',
							},
						].map((field) => (
							<label key={field.key} className="space-y-1 block">
								<span className="text-[11px] uppercase tracking-wider font-semibold text-mute">
									{field.label}
								</span>
								<input
									value={form[field.key as keyof typeof form]}
									onChange={(event) =>
										updateField(
											field.key as keyof typeof form,
											event.target.value
										)
									}
									placeholder={field.placeholder}
									className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
								/>
							</label>
						))}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
						<div className="space-y-1">
							<span className="text-[11px] uppercase tracking-wider font-semibold text-mute block">
								Modalidad
							</span>
							<div className="flex items-center gap-1 p-1 rounded-full bg-[#f1f0e6]">
								{(['Presencial', 'Virtual'] as Modality[]).map((option) => (
									<button
										key={option}
										type="button"
										onClick={() => updateField('modality', option)}
										className={`flex-1 px-3 py-2 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
											form.modality === option
												? 'bg-[#111112] text-[#ebff57]'
												: 'text-mute hover:text-ink'
										}`}
									>
										{option === 'Presencial' ? (
											<DoorOpen className="w-3.5 h-3.5" />
										) : (
											<Globe className="w-3.5 h-3.5" />
										)}
										{option}
									</button>
								))}
							</div>
						</div>
						<label className="space-y-1 block">
							<span className="text-[11px] uppercase tracking-wider font-semibold text-mute">
								Descripción
							</span>
							<input
								value={form.description}
								onChange={(event) =>
									updateField('description', event.target.value)
								}
								placeholder="Describe brevemente las habilidades que se trabajan..."
								className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
							/>
						</label>
					</div>

					{error && (
						<div className="p-3 rounded-2xl bg-[#ebff57]/50 border border-black/10 text-xs font-semibold">
							{error}
						</div>
					)}

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={saving}
							className="px-5 py-2.5 rounded-full bg-[#ebff57] hover:bg-[#e5f847] disabled:opacity-60 text-black text-sm font-bold cursor-pointer"
						>
							{saving ? 'Guardando...' : 'Guardar curso'}
						</button>
					</div>
				</form>
			)}

			{/* Barra de herramientas */}
			<div className="rounded-[28px] bg-white p-4 sm:p-5 shadow-card flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
				<div className="relative flex-1 max-w-xl">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
					<input
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						placeholder="Buscar curso, instructor o recurso..."
						className="w-full pl-11 pr-4 py-2.5 bg-[#f1f0e6] rounded-full border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm transition"
					/>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					<div className="flex items-center gap-1 p-1 rounded-full bg-[#f1f0e6]">
						{modalityChips.map((chip) => {
							const Icon = chip.icon;
							const active = modalityFilter === chip.id;
							return (
								<button
									key={chip.id}
									onClick={() => setModalityFilter(chip.id)}
									className={`px-3.5 py-2 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
										active
											? 'bg-[#111112] text-[#ebff57]'
											: 'text-mute hover:text-ink'
									}`}
								>
									<Icon className="w-3.5 h-3.5" />
									{chip.label}
									<span
										className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-[#ebff57] text-black' : 'bg-white'}`}
									>
										{chip.count}
									</span>
								</button>
							);
						})}
					</div>
					<span className="text-xs text-mute px-1">
						<strong className="text-ink">{visibleCourses.length}</strong> cursos
					</span>
				</div>
			</div>

			{/* Tarjetas de cursos */}
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
				{visibleCourses.map((course, index) => {
					const courseResources = resourcesOf(course);
					const isVirtual = course.modalidad === 'Virtual';
					const accent = ACCENTS[index % ACCENTS.length];

					return (
						<article
							key={course.id}
							className="rounded-[28px] bg-white shadow-card overflow-hidden flex flex-col hover:shadow-pop hover:-translate-y-0.5 transition-all"
						>
							<button
								onClick={() => setOpenCourse(course)}
								className={`p-5 text-left cursor-pointer ${accent}`}
							>
								<div className="flex items-center justify-between gap-2">
									<span className="text-[10px] font-black uppercase tracking-widest opacity-70">
										{course.codigo}
									</span>
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 text-black text-[10px] font-bold">
										{isVirtual ? (
											<Globe className="w-3 h-3" />
										) : (
											<DoorOpen className="w-3 h-3" />
										)}
										{course.modalidad}
									</span>
								</div>
								<h3 className="mt-3 text-xl font-black tracking-tight leading-tight">
									{course.nombre}
								</h3>
								<p
									className={`mt-1.5 text-xs leading-relaxed line-clamp-2 ${accent.includes('#111112') ? 'text-[#f1f0e6]/70' : 'text-black/70'}`}
								>
									{course.descripcion}
								</p>
							</button>

							<div className="p-5 flex-1 flex flex-col justify-between gap-4">
								<div className="space-y-2 text-xs text-mute">
									<div className="flex items-center gap-2">
										<UserRound className="w-3.5 h-3.5" />
										<span className="font-semibold text-ink">
											{course.docente_nombre}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<CalendarDays className="w-3.5 h-3.5" />
										<span>{course.horario}</span>
										<span className="mx-1 opacity-40">·</span>
										<Users className="w-3.5 h-3.5" />
										<span>{course.studentCount} alumnos</span>
									</div>
								</div>

								<div className="flex items-center gap-2 text-[11px] font-bold">
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f0e6]">
										<ListChecks className="w-3.5 h-3.5" />
										{course.temario?.length} unidades
									</span>
									<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7bfcec]/50">
										<Link2 className="w-3.5 h-3.5" />
										{courseResources.length} recursos
									</span>
								</div>

								<div className="flex items-center gap-2 pt-1">
									<button
										onClick={() => setOpenCourse(course)}
										className="flex-1 px-4 py-2.5 rounded-full bg-[#111112] text-[#ebff57] hover:bg-neutral-800 text-xs font-bold cursor-pointer transition-colors"
									>
										Ver temario y recursos
									</button>
									{canManage && (
										<button
											onClick={() => onAddResourceForCourse(course.nombre)}
											title={`Añadir recurso a ${course.nombre}`}
											className="w-10 h-10 rounded-full bg-[#ebff57] hover:bg-[#e5f847] flex items-center justify-center cursor-pointer transition-transform hover:-translate-y-0.5"
										>
											<Plus className="w-4 h-4" />
										</button>
									)}
									{canManage && (
										<button
											onClick={() => setCourseToDelete(course)}
											title={`Eliminar ${course.nombre}`}
											className="w-10 h-10 rounded-full bg-[#f1f0e6] hover:bg-black hover:text-white flex items-center justify-center cursor-pointer transition-colors"
										>
											<Trash2 className="w-4 h-4" />
										</button>
									)}
								</div>
							</div>
						</article>
					);
				})}
			</div>

			{visibleCourses.length === 0 && (
				<div className="rounded-[28px] bg-white p-12 shadow-card text-center space-y-2">
					<div className="w-14 h-14 rounded-2xl bg-[#ebff57] mx-auto flex items-center justify-center">
						<Search className="w-6 h-6" />
					</div>
					<h3 className="font-black tracking-tight">Sin resultados</h3>
					<p className="text-sm text-mute">
						Ningún curso coincide con la búsqueda o la modalidad seleccionada.
					</p>
					<button
						onClick={() => {
							setSearchQuery('');
							setModalityFilter('all');
						}}
						className="px-4 py-2 rounded-full bg-[#111112] text-[#ebff57] text-xs font-bold cursor-pointer"
					>
						Limpiar filtros
					</button>
				</div>
			)}

			{/* Detalle: temario + recursos */}
			<CourseDetailModal
				course={openCourse}
				resources={resources}
				canManage={canManage}
				onClose={() => setOpenCourse(null)}
				onAddResourceForCourse={(name) => {
					setOpenCourse(null);
					onAddResourceForCourse(name);
				}}
				onPreviewResource={onPreviewResource}
				onDeleteResource={onDeleteResource}
				onCopyLink={onCopyLink}
			/>

			{/* Confirmación de borrado */}
			{courseToDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<div
						className="w-full max-w-md bg-white rounded-[28px] shadow-pop p-6"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="w-12 h-12 rounded-2xl bg-[#ebff57] flex items-center justify-center">
							<Trash2 className="w-5 h-5" />
						</div>
						<h3 className="mt-4 text-xl font-black tracking-tight">
							Eliminar curso
						</h3>
						<p className="text-sm text-mute mt-2">
							¿Quieres eliminar{' '}
							<strong className="text-ink">{courseToDelete.nombre}</strong>? Sus{' '}
							<strong className="text-ink">
								{resourcesOf(courseToDelete).length}
							</strong>{' '}
							recursos perderán esta asignación.
						</p>
						<div className="mt-5 flex items-center justify-end gap-2">
							<button
								onClick={() => setCourseToDelete(null)}
								className="px-5 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
							>
								Cancelar
							</button>
							<button
								onClick={() => {
									onDeleteCourse(courseToDelete);
									setCourseToDelete(null);
									setOpenCourse(null);
								}}
								className="px-5 py-2.5 rounded-full bg-black text-[#ebff57] hover:bg-neutral-800 text-sm font-bold cursor-pointer"
							>
								Eliminar curso
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
