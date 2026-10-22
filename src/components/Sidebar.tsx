import React from 'react';
import {
	BookOpen,
	ChevronRight,
	DoorOpen,
	Globe,
	GraduationCap,
	Home,
	LogOut,
	Settings,
	ShieldCheck,
	UsersRound,
	X,
} from 'lucide-react';
import { ActiveTab, AuthUser } from '../types';

interface SidebarProps {
	activeTab: ActiveTab;
	setActiveTab: (tab: ActiveTab) => void;
	courseCount: number;
	studentCount: number;
	user: AuthUser;
	onLogout: () => void;
	isMobileOpen: boolean;
	setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
	activeTab,
	setActiveTab,
	courseCount,
	studentCount,
	user,
	onLogout,
	isMobileOpen,
	setIsMobileOpen,
}) => {
	const navItems: Array<{
		id: ActiveTab;
		label: string;
		description: string;
		icon: React.ComponentType<{ className?: string }>;
		badge: string | null;
	}> = [
		{
			id: 'inicio' as ActiveTab,
			label: 'Inicio',
			description: 'Panel general',
			icon: Home,
			badge: null,
		},
		{
			id: 'cursos' as ActiveTab,
			label: 'Cursos',
			description: 'Catálogo formativo',
			icon: BookOpen,
			badge: courseCount.toString(),
		},
		{
			id: 'alumnos' as ActiveTab,
			label: 'Alumnos',
			description: 'Directorio y accesos',
			icon: UsersRound,
			badge: studentCount.toString(),
		},
	].filter((item) => user.rol === 'admin' || item.id !== 'alumnos');

	const adminItems: Array<{
		id: ActiveTab;
		label: string;
		icon: React.ComponentType<{ className?: string }>;
	}> = [
		{
			id: 'auditoria' as ActiveTab,
			label: 'Auditoría & Permisos',
			icon: ShieldCheck,
		},
		{
			id: 'configuracion' as ActiveTab,
			label: 'Configuración General',
			icon: Settings,
		},
	];

	const handleNavClick = (tabId: ActiveTab) => {
		setActiveTab(tabId);
		if (isMobileOpen) setIsMobileOpen(false);
	};

	return (
		<>
			{isMobileOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			<aside
				className={`fixed top-0 left-0 bottom-0 z-50 w-[280px] p-3 transition-transform duration-200 ease-out lg:translate-x-0 ${
					isMobileOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className="h-full flex flex-col justify-between bg-[#111112] text-[#f1f0e6] rounded-[32px] overflow-hidden shadow-pop">
					<div>
						<div className="p-5 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-11 h-11 rounded-2xl bg-[#ebff57] text-black flex items-center justify-center">
									<GraduationCap className="w-6 h-6" />
								</div>
								<div>
									<span className="text-[10px] uppercase tracking-[0.2em] text-[#f1f0e6]/50 font-semibold block">
										doctiva.app
									</span>
									<h1 className="text-base font-black tracking-tight leading-none">
										Doctiva Learning
									</h1>
								</div>
							</div>
							<button
								onClick={() => setIsMobileOpen(false)}
								className="lg:hidden w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
								aria-label="Cerrar menú"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						<div className="mx-5 mb-5 p-3 rounded-2xl bg-white/5 space-y-2">
							<span className="text-[10px] uppercase tracking-widest text-[#f1f0e6]/50 font-semibold block">
								Modalidades disponibles
							</span>
							<div className="flex gap-1.5">
								<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ebff57] text-black text-[10px] font-bold">
									<DoorOpen className="w-3 h-3" />
									Presencial
								</span>
								<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7bfcec] text-black text-[10px] font-bold">
									<Globe className="w-3 h-3" />
									Virtual
								</span>
							</div>
						</div>

						<div className="px-3 space-y-1">
							<div className="px-3 py-1 text-[10px] uppercase tracking-widest text-[#f1f0e6]/40 font-semibold">
								Módulos
							</div>
							{navItems.map((item) => {
								const Icon = item.icon;
								const active = activeTab === item.id;
								return (
									<button
										key={item.id}
										onClick={() => handleNavClick(item.id)}
										className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
											active
												? 'bg-[#ebff57] text-black'
												: 'hover:bg-white/10 text-[#f1f0e6]'
										}`}
									>
										<div className="flex items-center gap-3">
											<span
												className={`w-9 h-9 rounded-xl flex items-center justify-center ${
													active ? 'bg-black/10' : 'bg-white/5'
												}`}
											>
												<Icon className="w-4 h-4" />
											</span>
											<div>
												<div className="text-sm font-bold tracking-tight">
													{item.label}
												</div>
												<div
													className={`text-[11px] ${active ? 'text-black/60' : 'text-[#f1f0e6]/50'}`}
												>
													{item.description}
												</div>
											</div>
										</div>
										{item.badge && (
											<span
												className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
													active
														? 'bg-black text-[#ebff57]'
														: 'bg-white/10 text-[#f1f0e6]'
												}`}
											>
												{item.badge}
											</span>
										)}
									</button>
								);
							})}

							{user.rol === 'admin' && (
								<>
									<div className="pt-4 px-3 py-1 text-[10px] uppercase tracking-widest text-[#f1f0e6]/40 font-semibold">
										Administración
									</div>
									{adminItems.map((item) => {
										const Icon = item.icon;
										const active = activeTab === item.id;
										return (
											<button
												key={item.id}
												onClick={() => handleNavClick(item.id)}
												className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer ${
													active
														? 'bg-[#7bfcec] text-black'
														: 'hover:bg-white/10 text-[#f1f0e6]'
												}`}
											>
												<div className="flex items-center gap-3">
													<span
														className={`w-9 h-9 rounded-xl flex items-center justify-center ${
															active ? 'bg-black/10' : 'bg-white/5'
														}`}
													>
														<Icon className="w-4 h-4" />
													</span>
													<span className="text-sm font-semibold">
														{item.label}
													</span>
												</div>
												<ChevronRight
													className={`w-4 h-4 ${active ? 'text-black/60' : 'text-[#f1f0e6]/40'}`}
												/>
											</button>
										);
									})}
								</>
							)}
						</div>
					</div>

					<div className="p-4 space-y-3">
						<div className="p-3 rounded-2xl bg-[#f1f0e6] text-black flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-2xl bg-[#111112] text-[#ebff57] font-black flex items-center justify-center text-sm">
									{user.estudiante?.nombres.split(' ')[0].charAt(0)}
								</div>
								<div className="min-w-0">
									<div className="text-xs font-bold truncate">
										{user.estudiante?.nombres}
									</div>
									<div className="text-[11px] text-mute truncate">
										{user.rol}
									</div>
								</div>
							</div>
							<button
								title="Cerrar sesión"
								onClick={onLogout}
								className="w-9 h-9 rounded-xl bg-white hover:bg-[#111112] hover:text-[#ebff57] transition-colors flex items-center justify-center border border-black/10 cursor-pointer"
							>
								<LogOut className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
};
