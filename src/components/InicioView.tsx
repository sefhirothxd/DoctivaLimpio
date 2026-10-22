import React from 'react';
import {
	ArrowUpRight,
	BookOpen,
	ChevronRight,
	FolderKanban,
	Link2,
	Sparkles,
	UsersRound,
} from 'lucide-react';
import { ActiveTab, AuthUser, Course, Resource, Student } from '../types';

interface InicioViewProps {
	resources: Resource[];
	courses: Course[];
	students: Student[];
	user: AuthUser;
	onAddResourceClick: () => void;
	onNavigateTab: (tab: ActiveTab) => void;
	onPreviewResource: (resource: Resource) => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
	resources,
	courses,
	students,
	user,
	onAddResourceClick,
	onNavigateTab,
	onPreviewResource,
}) => {
	const totalStudents = courses.reduce(
		(total, course) => total + course.id.length,
		0
	);

	return (
		<div className="space-y-6">
			<div className="rounded-[36px] bg-[#111112] text-[#f1f0e6] p-7 sm:p-10 relative overflow-hidden shadow-pop">
				<div className="absolute top-6 right-6 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs">
					<span className="w-1.5 h-1.5 rounded-full bg-[#7bfcec]" />
					Sesión activa · {user.rol}
				</div>
				<div className="absolute -bottom-20 -right-24 w-64 h-64 rounded-full bg-[#ebff57] blur-3xl opacity-30 pointer-events-none" />

				<div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div className="max-w-xl">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ebff57] text-black text-xs font-bold">
							<Sparkles className="w-3.5 h-3.5" />
							Panel {user.rol === 'admin' ? 'administrador' : 'de usuario'}
						</div>
						<h2 className="mt-5 text-4xl sm:text-5xl font-black tracking-tight leading-[1]">
							Hola,{' '}
							<span className="text-[#ebff57]">
								{user.estudiante?.nombres.split(' ')[0]}
							</span>
							.
						</h2>
						<p className="mt-4 text-sm text-[#f1f0e6]/70 leading-relaxed">
							Revisa el estado del catálogo, la actividad reciente y accede
							rápido a los recursos de tus cursos.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						{user.rol === 'admin' && (
							<button
								onClick={onAddResourceClick}
								className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#ebff57] hover:bg-[#e5f847] text-black text-sm font-bold cursor-pointer transition-transform hover:-translate-y-0.5"
							>
								<span>Añadir recurso</span>
								<ArrowUpRight className="w-4 h-4" />
							</button>
						)}
						<button
							onClick={() => onNavigateTab('cursos')}
							className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-[#f1f0e6] text-sm font-bold cursor-pointer transition-colors"
						>
							<span>Ver cursos y recursos</span>
							<ChevronRight className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{[
					{
						label: 'Recursos activos',
						value: resources.length,
						hint: 'Viven dentro de cada curso',
						icon: FolderKanban,
						tab: 'cursos' as ActiveTab,
						accent: 'bg-[#ebff57]',
						iconBg: 'bg-black/10',
					},
					{
						label: 'Cursos activos',
						value: courses.length,
						hint: 'Catálogo formativo disponible',
						icon: BookOpen,
						tab: 'cursos' as ActiveTab,
						accent: 'bg-[#7bfcec]',
						iconBg: 'bg-black/10',
					},
					{
						label: 'Usuarios inscritos',
						value: totalStudents,
						hint: `${students.length} alumnos registrados`,
						icon: UsersRound,
						tab: 'alumnos' as ActiveTab,
						accent: 'bg-white',
						iconBg: 'bg-[#f1f0e6]',
					},
				]
					.filter((card) => user.rol === 'admin' || card.tab !== 'alumnos')
					.map((card) => {
						const Icon = card.icon;
						const isDark = card.accent.includes('#111112');
						const Wrapper: React.ElementType = card.tab ? 'button' : 'div';
						return (
							<Wrapper
								key={card.label}
								onClick={
									card.tab
										? () => onNavigateTab(card.tab as ActiveTab)
										: undefined
								}
								className={`text-left rounded-[28px] p-5 shadow-card transition-transform ${card.accent} ${
									card.tab ? 'hover:-translate-y-0.5 cursor-pointer' : ''
								}`}
							>
								<div className="flex items-center justify-between">
									<span
										className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-[#f1f0e6]/60' : 'text-mute'}`}
									>
										{card.label}
									</span>
									<span
										className={`w-9 h-9 rounded-2xl flex items-center justify-center ${card.iconBg}`}
									>
										<Icon className="w-4 h-4" />
									</span>
								</div>
								<div
									className={`text-3xl font-black mt-4 tracking-tight ${isDark ? 'text-[#ebff57]' : 'text-ink'}`}
								>
									{card.value}
								</div>
								<div
									className={`text-xs mt-1 ${isDark ? 'text-[#f1f0e6]/50' : 'text-mute'}`}
								>
									{card.hint}
								</div>
							</Wrapper>
						);
					})}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 rounded-[28px] bg-white shadow-card p-6">
					<div className="flex items-center justify-between pb-4 border-b border-black/5">
						<div>
							<span className="text-[11px] uppercase font-bold tracking-widest text-mute">
								Actividad reciente
							</span>
							<h3 className="text-xl font-black tracking-tight mt-1">
								Últimos recursos publicados
							</h3>
						</div>
						<button
							onClick={() => onNavigateTab('cursos')}
							className="text-xs font-bold text-mute hover:text-ink underline cursor-pointer"
						>
							Ver en cursos
						</button>
					</div>

					<div className="space-y-2 mt-4">
						{resources.slice(0, 4).map((resource) => (
							<button
								key={resource.id}
								onClick={() => onPreviewResource(resource)}
								className="w-full text-left p-4 rounded-2xl bg-[#f1f0e6] hover:bg-[#ebff57] transition-colors flex items-center gap-3 group cursor-pointer"
							>
								<div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center">
									<Link2 className="w-4 h-4" />
								</div>
								<div className="min-w-0 flex-1">
									<h4 className="text-sm font-bold truncate">
										{resource.title}
									</h4>
									<div className="flex flex-wrap items-center gap-2 text-xs text-mute mt-0.5">
										<span className="font-semibold text-ink">
											{resource.subject}
										</span>
										<span>·</span>
										<span>{resource.id.length} cursos</span>
									</div>
								</div>
								<ChevronRight className="w-4 h-4 text-mute group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
							</button>
						))}
					</div>
				</div>

				<div className="rounded-[28px] bg-[#111112] text-[#f1f0e6] p-6 shadow-pop flex flex-col justify-between">
					<div>
						<span className="inline-block px-3 py-1 rounded-full bg-[#ebff57] text-black text-[10px] font-bold uppercase tracking-widest">
							Acceso rápido
						</span>
						<h3 className="text-2xl font-black tracking-tight mt-4">
							Todo lo que necesitas, a un toque.
						</h3>

						<div className="mt-5 space-y-2">
							{[
								{
									title: 'Explorar cursos',
									desc: 'Corel, Photoshop, Articulate…',
									tab: 'cursos' as ActiveTab,
								},
								{
									title: 'Revisar recursos',
									desc: 'Viven dentro de cada curso.',
									tab: 'cursos' as ActiveTab,
								},
								{
									title: 'Ver alumnos',
									desc: 'Consulta registros y accesos.',
									tab: 'alumnos' as ActiveTab,
								},
							]
								.filter(
									(item) => user.rol === 'admin' || item.tab !== 'alumnos'
								)
								.map((item) => (
									<button
										key={item.title}
										onClick={() => onNavigateTab(item.tab)}
										className="w-full text-left p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer"
									>
										<div>
											<div className="text-sm font-bold">{item.title}</div>
											<div className="text-xs text-[#f1f0e6]/60">
												{item.desc}
											</div>
										</div>
										<ChevronRight className="w-4 h-4 text-[#f1f0e6]/40 group-hover:text-[#ebff57] transition-colors" />
									</button>
								))}
						</div>
					</div>

					{user.rol === 'admin' && (
						<button
							onClick={onAddResourceClick}
							className="mt-5 w-full py-3 rounded-full bg-[#ebff57] text-black font-bold text-sm hover:bg-[#e5f847] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
						>
							Iniciar publicación
							<ChevronRight className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};
