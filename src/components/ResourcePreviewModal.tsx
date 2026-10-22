import React from 'react';
import {
	Calendar,
	CheckCircle,
	Copy,
	ExternalLink,
	Eye,
	Link2,
	UserRound,
	X,
} from 'lucide-react';
import { Resource } from '../types';

interface ResourcePreviewModalProps {
	resource: Resource | null;
	onClose: () => void;
	onCopyLink: (resource: Resource) => void;
}

const hostnameOf = (url: string) => {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
};

export const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
	resource,
	onClose,
	onCopyLink,
}) => {
	if (!resource) return null;

	return (
		<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6">
			<div
				className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-pop max-h-[92vh] flex flex-col overflow-hidden"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="p-5 sm:p-6 border-b border-black/5 flex items-start justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-11 h-11 rounded-2xl bg-[#111112] text-[#ebff57] flex items-center justify-center shrink-0">
							<Link2 className="w-5 h-5" />
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<span className="text-[10px] font-black uppercase tracking-widest bg-[#ebff57] px-2 py-0.5 rounded-full">
									Recurso por enlace
								</span>
								<span className="text-xs text-mute">{resource.code}</span>
							</div>
							<h2 className="text-lg sm:text-xl font-black tracking-tight leading-tight mt-1 truncate">
								{resource.title}
							</h2>
						</div>
					</div>
					<button
						onClick={onClose}
						className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-black hover:text-white flex items-center justify-center cursor-pointer shrink-0"
					>
						<X className="w-4 h-4" />
					</button>
				</div>

				<div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
					{/* Ventana de navegador simulada */}
					<div className="rounded-3xl overflow-hidden bg-[#111112] shadow-pop">
						<div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1b]">
							<div className="flex gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full bg-white/20" />
								<span className="w-2.5 h-2.5 rounded-full bg-white/20" />
								<span className="w-2.5 h-2.5 rounded-full bg-[#ebff57]" />
							</div>
							<div className="flex-1 min-w-0">
								<div className="px-3 py-1.5 rounded-full bg-white/10 text-[11px] text-[#f1f0e6]/80 font-medium truncate inline-flex items-center gap-2 max-w-full">
									<Link2 className="w-3 h-3 shrink-0 text-[#7bfcec]" />
									{resource.url}
								</div>
							</div>
						</div>
						<div className="p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[220px]">
							<div className="w-14 h-14 rounded-2xl bg-[#ebff57] text-black flex items-center justify-center">
								<ExternalLink className="w-6 h-6" />
							</div>
							<div className="max-w-md">
								<h3 className="text-xl font-black text-[#f1f0e6] tracking-tight">
									{hostnameOf(resource.url)}
								</h3>
								<p className="mt-2 text-sm text-[#f1f0e6]/60 leading-relaxed">
									{resource.description}
								</p>
							</div>
							<a
								href={resource.url}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ebff57] text-black text-sm font-bold hover:bg-[#e5f847] transition-transform hover:-translate-y-0.5 cursor-pointer"
							>
								<ExternalLink className="w-4 h-4" />
								Abrir recurso en nueva pestaña
							</a>
						</div>
					</div>

					{/* Metadatos */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
						{[
							{ label: 'Autor', value: resource.author, icon: UserRound },
							{ label: 'Publicado', value: resource.createdAt, icon: Calendar },
							{ label: 'Área', value: resource.subject, icon: CheckCircle },
							{
								label: 'Consultas',
								value: `${resource.id.length} vistas`,
								icon: Eye,
							},
						].map((meta) => (
							<div
								key={meta.label}
								className="rounded-2xl bg-white p-4 shadow-inset-line"
							>
								<span className="text-[10px] uppercase tracking-widest text-mute font-bold">
									{meta.label}
								</span>
								<div className="mt-1 font-bold flex items-center gap-1.5 truncate">
									<meta.icon className="w-3.5 h-3.5 shrink-0" />
									<span className="truncate">{meta.value}</span>
								</div>
							</div>
						))}
					</div>

					{/* Cursos con acceso */}
					<div className="rounded-3xl bg-white p-5 shadow-inset-line space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm font-bold uppercase tracking-wider">
								Cursos con acceso
							</span>
							<span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ebff57]">
								{resource.assignedCourseIds.length} asignados
							</span>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{resource.assignedCourseIds.map((courseId) => (
								<span
									key={courseId}
									className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f1f0e6] font-semibold text-xs"
								>
									<CheckCircle className="w-3.5 h-3.5" />
									{courseId}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="p-5 sm:p-6 border-t border-black/5 flex items-center justify-between gap-3">
					<button
						onClick={() => onCopyLink(resource)}
						className="px-4 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-[#7bfcec] text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
					>
						<Copy className="w-4 h-4" /> Copiar enlace
					</button>
					<button
						onClick={onClose}
						className="px-5 py-2.5 rounded-full bg-[#111112] text-[#ebff57] hover:bg-neutral-800 text-sm font-bold cursor-pointer"
					>
						Cerrar visor
					</button>
				</div>
			</div>
		</div>
	);
};
