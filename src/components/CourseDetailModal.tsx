import React, { useState } from 'react';
import {
	BookOpen,
	CalendarDays,
	Copy,
	DoorOpen,
	ExternalLink,
	Globe,
	GraduationCap,
	GripVertical,
	Link2,
	ListChecks,
	Pencil,
	Plus,
	Trash2,
	UserRound,
	Users,
	X,
} from 'lucide-react';
import { Course, CourseUpdate, Modality, Resource } from '../types';

interface CourseDetailModalProps {
	course: Course | null;
	resources: Resource[];
	canManage: boolean;
	onClose: () => void;
	onUpdateCourse: (id: string, data: CourseUpdate) => Promise<boolean>;
	onAddResourceForCourse: (courseName: string) => void;
	onPreviewResource: (resource: Resource) => void;
	onDeleteResource: (resource: Resource) => void;
	onCopyLink: (resource: Resource) => void;
	onReorderResources: (courseId: string, ids: string[]) => void;
}

// Fecha legible en hora de Perú (UTC-5), p. ej. "11 sep 2026, 1:24 p. m."
const formatCreated = (iso?: string) => {
	if (!iso) return '';
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return new Intl.DateTimeFormat('es-PE', {
		timeZone: 'America/Lima',
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	}).format(date);
};

const hostnameOf = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
};

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
	course,
	resources,
	canManage,
	onClose,
	onUpdateCourse,
	onAddResourceForCourse,
	onPreviewResource,
	onDeleteResource,
	onCopyLink,
	onReorderResources,
}) => {
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState<CourseUpdate>({
		codigo: '',
		nombre: '',
		descripcion: '',
		docente_nombre: '',
		modalidad: 'Presencial',
		horario: '',
		aula: '',
	});
	const [saving, setSaving] = useState(false);
	const [draggingId, setDraggingId] = useState<string | null>(null);
	const [drop, setDrop] = useState<{
		id: string;
		position: 'before' | 'after';
	} | null>(null);

	if (!course) return null;

	const courseResources = resources
		.filter((resource) => {
			// Si usas IDs de cursos (Recomendado):
			const ids = resource.assignedCourseIds ?? [];
			return ids.includes(course.id);
		})
		.sort((a, b) => {
			// Sin orden guardado, se mantienen al final en su orden original (sort estable).
			const oa = a.courseOrder?.[course.id] ?? Infinity;
			const ob = b.courseOrder?.[course.id] ?? Infinity;
			return oa === ob ? 0 : oa - ob;
		});

	const resetDrag = () => {
		setDraggingId(null);
		setDrop(null);
	};

	const handleDrop = () => {
		if (!draggingId || !drop || draggingId === drop.id) return resetDrag();
		const ids = courseResources.map((r) => String(r.id));
		const from = ids.indexOf(draggingId);
		ids.splice(from, 1);
		const target = ids.indexOf(drop.id);
		ids.splice(drop.position === 'before' ? target : target + 1, 0, draggingId);
		onReorderResources(course.id, ids);
		resetDrag();
	};
	const isVirtual = course.modalidad === 'Virtual';

	const startEdit = () => {
		setDraft({
			codigo: course.codigo ?? '',
			nombre: course.nombre ?? '',
			descripcion: course.descripcion ?? '',
			docente_nombre: course.docente_nombre ?? '',
			modalidad: course.modalidad,
			horario: course.horario ?? '',
			aula: course.aula ?? '',
		});
		setEditing(true);
	};

	const setField = <K extends keyof CourseUpdate>(
		key: K,
		value: CourseUpdate[K]
	) => setDraft((d) => ({ ...d, [key]: value }));

	// Campos obligatorios en el backend (allowNull: false).
	const canSave =
		!saving &&
		[draft.codigo, draft.nombre, draft.docente_nombre, draft.horario, draft.aula]
			.every((v) => v.trim());

	const saveEdit = async () => {
		if (!canSave) return;
		setSaving(true);
		const ok = await onUpdateCourse(course.id, {
			codigo: draft.codigo.trim(),
			nombre: draft.nombre.trim(),
			descripcion: draft.descripcion.trim(),
			docente_nombre: draft.docente_nombre.trim(),
			modalidad: draft.modalidad,
			horario: draft.horario.trim(),
			aula: draft.aula.trim(),
		});
		setSaving(false);
		if (ok) setEditing(false);
	};

	const fieldClass = `w-full rounded-xl px-3 py-2 text-sm outline-none border ${
		isVirtual
			? 'bg-white/10 border-white/20 text-[#f1f0e6]'
			: 'bg-white/80 border-black/20 text-black'
	}`;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6">
			<div
				className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-pop max-h-[92vh] flex flex-col overflow-hidden"
				onClick={(event) => event.stopPropagation()}
			>
				{/* Cabecera del curso */}
				<div
					className={`p-6 sm:p-7 ${isVirtual ? 'bg-[#111112] text-[#f1f0e6]' : 'bg-[#ebff57] text-black'}`}
				>
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-4 min-w-0">
							<div
								className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
									isVirtual
										? 'bg-[#7bfcec] text-black'
										: 'bg-black text-[#ebff57]'
								}`}
							>
								<GraduationCap className="w-6 h-6" />
							</div>
							<div className="min-w-0">
								<div
									className={`flex items-center gap-2 flex-wrap ${editing ? 'hidden' : ''}`}
								>
									<span className="text-[10px] font-black uppercase tracking-widest opacity-70">
										{course.codigo}
									</span>
									<span
										className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
											isVirtual
												? 'bg-[#7bfcec] text-black'
												: 'bg-white text-black'
										}`}
									>
										{isVirtual ? (
											<Globe className="w-3 h-3" />
										) : (
											<DoorOpen className="w-3 h-3" />
										)}
										{course.modalidad}
									</span>
								</div>
								{editing ? (
									<div className="space-y-2 w-[min(36rem,60vw)]">
										<div className="grid grid-cols-2 gap-2">
											<input
												value={draft.codigo}
												onChange={(e) => setField('codigo', e.target.value)}
												placeholder="Código"
												className={fieldClass}
											/>
											<select
												value={draft.modalidad}
												onChange={(e) =>
													setField('modalidad', e.target.value as Modality)
												}
												className={fieldClass}
											>
												<option value="Presencial">Presencial</option>
												<option value="Virtual">Virtual</option>
											</select>
										</div>
										<input
											value={draft.nombre}
											onChange={(e) =>
												setDraft((d) => ({ ...d, nombre: e.target.value }))
											}
											placeholder="Nombre del curso"
											className={`${fieldClass} text-lg font-bold`}
										/>
										<textarea
											value={draft.descripcion}
											onChange={(e) =>
												setDraft((d) => ({ ...d, descripcion: e.target.value }))
											}
											rows={3}
											placeholder="Descripción"
											className={fieldClass}
										/>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
											<input
												value={draft.docente_nombre}
												onChange={(e) => setField('docente_nombre', e.target.value)}
												placeholder="Docente"
												className={fieldClass}
											/>
											<input
												value={draft.horario}
												onChange={(e) => setField('horario', e.target.value)}
												placeholder="Horario"
												className={fieldClass}
											/>
											<input
												value={draft.aula}
												onChange={(e) => setField('aula', e.target.value)}
												placeholder="Aula"
												className={fieldClass}
											/>
										</div>
										<div className="flex gap-2">
											<button
												onClick={saveEdit}
												disabled={!canSave}
												className="px-4 py-1.5 rounded-full bg-black text-[#ebff57] text-xs font-bold cursor-pointer disabled:opacity-50"
											>
												{saving ? 'Guardando…' : 'Guardar'}
											</button>
											<button
												onClick={() => setEditing(false)}
												disabled={saving}
												className="px-4 py-1.5 rounded-full bg-black/10 text-xs font-bold cursor-pointer"
											>
												Cancelar
											</button>
										</div>
									</div>
								) : (
									<>
										<h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mt-1">
											{course.nombre}
										</h2>
										<p
											className={`text-sm mt-1 max-w-xl ${isVirtual ? 'text-[#f1f0e6]/70' : 'text-black/70'}`}
										>
											{course.descripcion}
										</p>
									</>
								)}
							</div>
						</div>
						{canManage && !editing && (
							<button
								onClick={startEdit}
								title="Editar curso"
								className={`ml-auto w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
									isVirtual
										? 'bg-white/10 hover:bg-white/20'
										: 'bg-black/10 hover:bg-black hover:text-[#ebff57]'
								}`}
							>
								<Pencil className="w-4 h-4" />
							</button>
						)}
						<button
							onClick={() => {
								setEditing(false);
								onClose();
							}}
							className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
								isVirtual
									? 'bg-white/10 hover:bg-white/20'
									: 'bg-black/10 hover:bg-black hover:text-[#ebff57]'
							}`}
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					<div
						className={`mt-5 flex items-center gap-3 flex-wrap text-xs font-semibold ${editing ? 'hidden' : ''}`}
					>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}
						>
							<UserRound className="w-3.5 h-3.5" /> {course.docente_nombre}
						</span>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}
						>
							<CalendarDays className="w-3.5 h-3.5" /> {course.horario}
						</span>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}
						>
							<DoorOpen className="w-3.5 h-3.5" /> {course.aula}
						</span>
						<span
							className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}
						>
							<Users className="w-3.5 h-3.5" /> {course.studentCount} alumnos
						</span>
					</div>
				</div>
				<div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-7">
					{/* Recursos del curso */}
					<section>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-black tracking-tight inline-flex items-center gap-2">
								<ListChecks className="w-5 h-5" />
								Recursos del curso
							</h3>
							<span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7bfcec]/60">
								{courseResources.length} enlaces
							</span>
						</div>

						{courseResources.length > 0 ? (
							<ul className="space-y-2">
								{courseResources.map((resource, index) => (
									<li
										key={resource.id}
										draggable={canManage}
										onDragStart={(event) => {
											event.dataTransfer.effectAllowed = 'move';
											setDraggingId(String(resource.id));
										}}
										onDragOver={(event) => {
											if (!draggingId) return;
											event.preventDefault();
											const rect = event.currentTarget.getBoundingClientRect();
											const position =
												event.clientY < rect.top + rect.height / 2
													? 'before'
													: 'after';
											const id = String(resource.id);
											if (drop?.id !== id || drop.position !== position)
												setDrop({ id, position });
										}}
										onDrop={(event) => {
											event.preventDefault();
											handleDrop();
										}}
										onDragEnd={resetDrag}
										className={`relative rounded-2xl bg-white shadow-inset-line p-4 flex flex-col lg:flex-row lg:items-center gap-3 hover:bg-[#f1f0e6] transition-colors ${
											draggingId === String(resource.id) ? 'opacity-40' : ''
										}`}
									>
										{drop?.id === String(resource.id) &&
											draggingId !== String(resource.id) && (
												<span
													className={`absolute left-2 right-2 h-1 rounded-full bg-[#ebff57] ring-1 ring-black pointer-events-none ${
														drop.position === 'before'
															? '-top-1.5'
															: '-bottom-1.5'
													}`}
												/>
											)}
										<div className="flex items-center gap-3 flex-1 min-w-0">
											{canManage && (
												<GripVertical
													className="w-4 h-4 text-mute shrink-0 cursor-grab active:cursor-grabbing"
													aria-label="Arrastrar para reordenar"
												/>
											)}
											<span className="w-11 h-11 rounded-2xl bg-[#111112] text-[#ebff57] flex items-center justify-center shrink-0">
												{index + 1 > 9 ? (
													<span className="text-sm font-black">
														{index + 1}
													</span>
												) : (
													<span className="text-lg font-black">
														0{index + 1}
													</span>
												)}
											</span>
											<div className="min-w-0">
												<button
													onClick={() => onPreviewResource(resource)}
													className="text-sm font-bold text-left hover:underline cursor-pointer line-clamp-1"
												>
													{resource.titulo}
												</button>
												<div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-mute">
													<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-canvas font-semibold">
														<ExternalLink className="w-3 h-3" />
														{hostnameOf(resource.url)}
													</span>
													<span>· {formatCreated(resource.creado_en)}</span>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-1.5 shrink-0">
											<a
												href={resource.url}
												target="_blank"
												rel="noopener noreferrer"
												title="Abrir enlace"
												className="w-9 h-9 rounded-full bg-[#f1f0e6] hover:bg-[#ebff57] transition-colors flex items-center justify-center cursor-pointer"
											>
												<ExternalLink className="w-4 h-4" />
											</a>
											<button
												onClick={() => onCopyLink(resource)}
												title="Copiar enlace"
												className="w-9 h-9 rounded-full bg-[#f1f0e6] hover:bg-[#7bfcec] transition-colors flex items-center justify-center cursor-pointer"
											>
												<Copy className="w-4 h-4" />
											</button>
											{canManage && (
												<button
													onClick={() => onDeleteResource(resource)}
													title="Eliminar recurso"
													className="w-9 h-9 rounded-full bg-[#f1f0e6] hover:bg-black hover:text-white transition-colors flex items-center justify-center cursor-pointer"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											)}
										</div>
									</li>
								))}
							</ul>
						) : (
							<div className="rounded-2xl border-2 border-dashed border-black/10 p-8 text-center space-y-2">
								<BookOpen className="w-6 h-6 mx-auto text-mute" />
								<p className="text-sm font-bold">
									Este curso todavía no tiene recursos publicados.
								</p>
								<p className="text-xs text-mute">
									{canManage
										? 'Añade el primer enlace con el botón inferior.'
										: 'Cuando el administrador publique enlaces, aparecerán aquí.'}
								</p>
							</div>
						)}
					</section>
				</div>

				<div className="p-5 sm:p-6 border-t border-black/5 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2 ml-auto">
						<button
							onClick={onClose}
							className="px-5 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
						>
							Cerrar
						</button>
						{canManage && (
							<button
								onClick={() => onAddResourceForCourse(course.nombre)}
								className="px-5 py-2.5 rounded-full bg-[#ebff57] hover:bg-[#e5f847] text-black text-sm font-bold inline-flex items-center gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
							>
								<Plus className="w-4 h-4" />
								Añadir recurso al curso
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
