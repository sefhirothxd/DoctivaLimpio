import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Link2,
  Search,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course, NewResource, NewResourceForm } from '../types';
import { SUBJECT_OPTIONS } from '../constants';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  defaultCourse?: string;
  onAddResource: (resource: NewResource) => Promise<boolean>;
}

const emptyForm = (defaultCourse?: string): NewResourceForm => ({
  title: '',
  subject: SUBJECT_OPTIONS[0],
  description: '',
  url: '',
  assignedCourses: defaultCourse ? [defaultCourse] : [],
  notifyDelegates: true,
  dueDate: '',
  requiresSubmission: false,
});

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  courses,
  defaultCourse,
  onAddResource,
}) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<NewResourceForm>(() => emptyForm(defaultCourse));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseSearch, setCourseSearch] = useState('');
  const [publishing, setPublishing] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    setStep(1);
    setForm(emptyForm());
    setErrors({});
    setCourseSearch('');
    onClose();
  };

  const setField = <K extends keyof NewResourceForm>(field: K, value: NewResourceForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[String(field)];
      return next;
    });
  };

  const validate = (currentStep: number) => {
    const nextErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!form.url.trim()) nextErrors.url = 'Pega el enlace del recurso que quieres publicar.';
      else if (!/^https?:\/\//.test(form.url.trim())) nextErrors.url = 'El enlace debe comenzar con http:// o https://';
    }
    if (currentStep === 2) {
      if (!form.title.trim()) nextErrors.title = 'El título es obligatorio.';
      if (!form.description.trim()) nextErrors.description = 'Añade una descripción para orientar al alumno.';
    }
    if (currentStep === 3 && form.assignedCourses.length === 0)
      nextErrors.courses = 'Selecciona al menos un curso.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep((current) => Math.min(current + 1, 4));
  };
  const previous = () => setStep((current) => Math.max(current - 1, 1));

  const toggleCourse = (name: string) => {
    const assigned = form.assignedCourses.includes(name);
    setField(
      'assignedCourses',
      assigned ? form.assignedCourses.filter((course) => course !== name) : [...form.assignedCourses, name],
    );
  };

  const publish = async () => {
    if (!validate(3)) return;
    setPublishing(true);
    const ok = await onAddResource({
      title: form.title.trim(),
      description: form.description.trim(),
      subject: form.subject,
      url: form.url.trim(),
      assignedCourses: form.assignedCourses,
      tags: [form.subject, hostnameOf(form.url.trim()) || 'Enlace'],
      requiresSubmission: form.requiresSubmission,
      dueDate: form.dueDate || undefined,
    });
    setPublishing(false);
    if (!ok) return;
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#ebff57', '#7bfcec', '#111112', '#f1f0e6'],
      });
    } catch {
      /* opcional */
    }
    close();
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.code.toLowerCase().includes(courseSearch.toLowerCase()),
  );

  const totalStudents = courses
    .filter((course) => form.assignedCourses.includes(course.name))
    .reduce((total, course) => total + course.studentCount, 0);

  const domain = hostnameOf(form.url.trim());

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-pop max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-5 sm:p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ebff57] flex items-center justify-center">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-widest text-mute font-bold">Asistente de publicación</span>
              <h2 className="text-xl font-black tracking-tight">Publicar recurso por enlace</h2>
            </div>
          </div>
          <button
            onClick={close}
            className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pasos */}
        <div className="p-4 sm:p-5 bg-[#f1f0e6]/70">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {['Enlace', 'Detalles', 'Cursos', 'Confirmación'].map((label, index) => {
              const number = index + 1;
              const active = step === number;
              const done = step > number;
              return (
                <button
                  key={label}
                  onClick={() => done && setStep(number)}
                  disabled={!done && !active}
                  className={`p-3 rounded-2xl text-left flex items-center gap-2 transition-colors ${
                    active
                      ? 'bg-[#111112] text-[#ebff57]'
                      : done
                        ? 'bg-white hover:bg-[#ebff57]/50 cursor-pointer'
                        : 'bg-white/60 text-mute cursor-not-allowed'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      active ? 'bg-[#ebff57] text-black' : done ? 'bg-[#111112] text-[#ebff57]' : 'bg-black/10'
                    }`}
                  >
                    {done ? '✓' : number}
                  </span>
                  <span className="hidden sm:inline font-bold">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Paso 1: enlace */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black tracking-tight">Paso 1 · Enlace del recurso</h3>
                <p className="text-sm text-mute mt-1">
                  En Doctiva Learning todo material se publica mediante un link: presentaciones, videos, PDFs o herramientas.
                </p>
              </div>

              <label className="space-y-1.5 block">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">URL del recurso *</span>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                  <input
                    type="url"
                    value={form.url}
                    onChange={(event) => setField('url', event.target.value)}
                    placeholder="https://drive.google.com/... · youtube.com/... · notion.so/..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm font-medium"
                  />
                </div>
                {errors.url && (
                  <span className="text-xs font-semibold text-black inline-flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errors.url}
                  </span>
                )}
              </label>

              {domain && !errors.url && (
                <div className="rounded-2xl bg-[#7bfcec]/40 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate">Enlace detectado: {domain}</div>
                      <div className="text-xs text-mute truncate">{form.url}</div>
                    </div>
                  </div>
                  <a
                    href={form.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-full bg-white text-xs font-bold hover:bg-[#ebff57] transition-colors shrink-0 cursor-pointer"
                  >
                    Probar enlace
                  </a>
                </div>
              )}

              <div className="rounded-2xl bg-[#f1f0e6] p-4 text-xs text-mute leading-relaxed">
                <strong className="text-ink">Sugerencia:</strong> comparte enlaces con permisos de lectura activos
                (Drive, Notion, YouTube, Slides, Figma...). El alumno abrirá el recurso directamente desde su curso.
              </div>
            </div>
          )}

          {/* Paso 2: detalles */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-black tracking-tight">Paso 2 · Detalles del recurso</h3>
                <p className="text-sm text-mute mt-1">Completa la información que verán los alumnos en su curso.</p>
              </div>

              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Título del recurso *</span>
                <input
                  value={form.title}
                  onChange={(event) => setField('title', event.target.value)}
                  placeholder="Ej: Clase grabada · Retículas y jerarquía visual"
                  className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
                />
                {errors.title && <span className="text-xs font-semibold text-black">{errors.title}</span>}
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Área</span>
                  <select
                    value={form.subject}
                    onChange={(event) => setField('subject', event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((subject) => (
                      <option key={subject}>{subject}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 block">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Fecha límite (opcional)</span>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setField('dueDate', event.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Descripción *</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setField('description', event.target.value)}
                  placeholder="Explica qué encontrará el alumno y cómo debe usar el enlace..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
                />
                {errors.description && <span className="text-xs font-semibold text-black">{errors.description}</span>}
              </label>

              <div className="p-4 rounded-2xl bg-[#f1f0e6] grid sm:grid-cols-2 gap-3 text-sm font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifyDelegates}
                    onChange={(event) => setField('notifyDelegates', event.target.checked)}
                    className="brand-check w-4 h-4"
                  />
                  Notificar a los alumnos del curso
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requiresSubmission}
                    onChange={(event) => setField('requiresSubmission', event.target.checked)}
                    className="brand-check w-4 h-4"
                  />
                  Requiere entrega posterior
                </label>
              </div>
            </div>
          )}

          {/* Paso 3: cursos */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-black tracking-tight">Paso 3 · Asignar cursos</h3>
                  <p className="text-sm text-mute mt-1">El enlace quedará dentro de cada curso seleccionado.</p>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111112] text-[#ebff57] text-xs font-bold">
                  {form.assignedCourses.length} cursos · {totalStudents} alumnos
                </span>
              </div>

              {errors.courses && (
                <div className="p-3 rounded-2xl bg-[#ebff57]/60 border border-black/10 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errors.courses}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
                  <input
                    value={courseSearch}
                    onChange={(event) => setCourseSearch(event.target.value)}
                    placeholder="Buscar curso..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setField('assignedCourses', courses.map((course) => course.name))}
                  className="px-4 py-2 rounded-full bg-[#111112] text-[#ebff57] text-xs font-bold cursor-pointer"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setField('assignedCourses', [])}
                  className="px-4 py-2 rounded-full bg-white border border-black/10 hover:bg-[#f1f0e6] text-xs font-bold cursor-pointer"
                >
                  Limpiar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto p-1">
                {filteredCourses.map((course) => {
                  const selected = form.assignedCourses.includes(course.name);
                  return (
                    <button
                      type="button"
                      key={course.id}
                      onClick={() => toggleCourse(course.name)}
                      className={`p-4 rounded-2xl text-left flex items-start gap-3 cursor-pointer transition-colors border ${
                        selected ? 'bg-[#ebff57] border-black text-black' : 'bg-white border-black/10 hover:bg-[#f1f0e6]'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          selected ? 'bg-black text-[#ebff57] border-black' : 'border-black/30'
                        }`}
                      >
                        {selected && '✓'}
                      </span>
                      <span className="min-w-0">
                        <span className="font-bold text-sm block">{course.name}</span>
                        <span className={`text-xs mt-0.5 block ${selected ? 'text-black/60' : 'text-mute'}`}>
                          {course.code} · {course.modality} · {course.studentCount} alumnos
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Paso 4: confirmación */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black tracking-tight inline-flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Paso 4 · Confirmar publicación
                </h3>
                <p className="text-sm text-mute mt-1">Revisa la ficha antes de compartir el enlace con los cursos.</p>
              </div>

              <div className="rounded-3xl bg-[#f1f0e6] p-5 space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b border-black/10">
                  <div className="w-11 h-11 rounded-2xl bg-[#111112] text-[#ebff57] flex items-center justify-center shrink-0">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg font-black leading-tight">{form.title}</h4>
                    <span className="text-xs text-mute">{form.subject}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-4 space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-mute font-bold">Enlace publicado</span>
                  <div className="text-sm font-bold truncate inline-flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 shrink-0" />
                    {form.url}
                  </div>
                  <span className="text-xs text-mute">{domain}</span>
                </div>

                <div className="rounded-2xl bg-white p-4 text-sm leading-relaxed">{form.description}</div>

                <div>
                  <span className="text-[10px] uppercase tracking-widest text-mute font-bold">Cursos asignados</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.assignedCourses.map((course) => (
                      <span key={course} className="px-3 py-1 rounded-full bg-[#111112] text-[#ebff57] text-xs font-bold">
                        {course}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input type="checkbox" defaultChecked className="brand-check mt-1 w-4 h-4" />
                <span>Confirmo que el enlace es accesible para los alumnos asignados.</span>
              </label>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="p-5 sm:p-6 border-t border-black/5 flex items-center justify-between gap-2">
          <div>
            {step > 1 && (
              <button
                onClick={previous}
                disabled={publishing}
                className="px-4 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={close}
              disabled={publishing}
              className="px-4 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
            >
              Cancelar
            </button>
            {step < 4 ? (
              <button
                onClick={next}
                className="px-5 py-2.5 rounded-full bg-[#ebff57] hover:bg-[#e5f847] text-black text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={publish}
                disabled={publishing}
                className="px-5 py-2.5 rounded-full bg-[#111112] text-[#ebff57] hover:bg-neutral-800 text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                {publishing ? (
                  'Publicando...'
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Publicar recurso
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
