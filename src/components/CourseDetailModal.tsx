import React from 'react';
import {
  BookOpen,
  CalendarDays,
  Copy,
  DoorOpen,
  ExternalLink,
  Globe,
  GraduationCap,
  Link2,
  ListChecks,
  Plus,
  Trash2,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { Course, Resource } from '../types';

interface CourseDetailModalProps {
  course: Course | null;
  resources: Resource[];
  canManage: boolean;
  onClose: () => void;
  onAddResourceForCourse: (courseName: string) => void;
  onPreviewResource: (resource: Resource) => void;
  onDeleteResource: (resource: Resource) => void;
  onCopyLink: (resource: Resource) => void;
}

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
  onAddResourceForCourse,
  onPreviewResource,
  onDeleteResource,
  onCopyLink,
}) => {
  if (!course) return null;

  const courseResources = resources.filter((resource) =>
    resource.assignedCourses.includes(course.name),
  );
  const isVirtual = course.modality === 'Virtual';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-pop max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabecera del curso */}
        <div className={`p-6 sm:p-7 ${isVirtual ? 'bg-[#111112] text-[#f1f0e6]' : 'bg-[#ebff57] text-black'}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  isVirtual ? 'bg-[#7bfcec] text-black' : 'bg-black text-[#ebff57]'
                }`}
              >
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{course.code}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isVirtual ? 'bg-[#7bfcec] text-black' : 'bg-white text-black'
                    }`}
                  >
                    {isVirtual ? <Globe className="w-3 h-3" /> : <DoorOpen className="w-3 h-3" />}
                    {course.modality}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight mt-1">{course.name}</h2>
                <p className={`text-sm mt-1 max-w-xl ${isVirtual ? 'text-[#f1f0e6]/70' : 'text-black/70'}`}>
                  {course.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                isVirtual ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black hover:text-[#ebff57]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3 flex-wrap text-xs font-semibold">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}>
              <UserRound className="w-3.5 h-3.5" /> {course.instructor}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}>
              <CalendarDays className="w-3.5 h-3.5" /> {course.schedule}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}>
              <DoorOpen className="w-3.5 h-3.5" /> {course.room}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isVirtual ? 'bg-white/10' : 'bg-white/70'}`}>
              <Users className="w-3.5 h-3.5" /> {course.studentCount} alumnos
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-7">
          {/* Desglose del temario */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black tracking-tight inline-flex items-center gap-2">
                <ListChecks className="w-5 h-5" />
                Desglose del temario
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f1f0e6]">
                {course.temario.length} unidades
              </span>
            </div>

            <ol className="space-y-3">
              {course.temario.map((unit, index) => (
                <li key={unit.id} className="rounded-2xl bg-[#f1f0e6] p-4 sm:p-5 hover:bg-[#ebff57]/40 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-2xl bg-[#111112] text-[#ebff57] font-black flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h4 className="font-bold text-sm sm:text-base">{unit.title}</h4>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white">{unit.weeks}</span>
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {unit.topics.map((topic) => (
                          <span
                            key={topic}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white shadow-inset-line"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Recursos del curso */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black tracking-tight inline-flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Recursos del curso
              </h3>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#7bfcec]/60">
                {courseResources.length} enlaces
              </span>
            </div>

            {courseResources.length > 0 ? (
              <ul className="space-y-2">
                {courseResources.map((resource) => (
                  <li
                    key={resource.id}
                    className="rounded-2xl bg-white shadow-inset-line p-4 flex flex-col lg:flex-row lg:items-center gap-3 hover:bg-[#f1f0e6] transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="w-11 h-11 rounded-2xl bg-[#111112] text-[#ebff57] flex items-center justify-center shrink-0">
                        <Link2 className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <button
                          onClick={() => onPreviewResource(resource)}
                          className="text-sm font-bold text-left hover:underline cursor-pointer line-clamp-1"
                        >
                          {resource.title}
                        </button>
                        <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-mute">
                          <span>{resource.subject}</span>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f1f0e6] font-semibold">
                            <ExternalLink className="w-3 h-3" />
                            {hostnameOf(resource.url)}
                          </span>
                          <span>· {resource.createdAt}</span>
                          <span>· {resource.views} vistas</span>
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
                <p className="text-sm font-bold">Este curso todavía no tiene recursos publicados.</p>
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
          <span className="text-xs text-mute hidden sm:block">
            doctiva.app · {course.modality} · {course.code}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
            >
              Cerrar
            </button>
            {canManage && (
              <button
                onClick={() => onAddResourceForCourse(course.name)}
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
