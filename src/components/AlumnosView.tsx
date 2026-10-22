import React, { useMemo, useState } from 'react';
import {
  Copy,
  Download,
  KeyRound,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  UserRound,
  X,
} from 'lucide-react';
import { Course, Student, StudentInput, StudentStatus } from '../types';

interface AlumnosViewProps {
  students: Student[];
  courses: Course[];
  onAddStudent: (student: StudentInput) => Promise<boolean>;
  onUpdateStudent: (id: string, student: Partial<StudentInput>) => Promise<boolean>;
  onSetPassword: (student: Student, password: string) => Promise<boolean>;
  onDeleteStudent: (student: Student) => void;
  onNotify: (title: string, description?: string) => void;
}

interface StudentDraft {
  fullName: string;
  email: string;
  phone: string;
  courseCode: string;
  status: StudentStatus;
  password: string;
}

const genPassword = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  return `Doc${pick(digits)}${pick(letters)}${pick(digits)}${pick(letters)}#${Math.floor(10 + Math.random() * 89)}`;
};

export const AlumnosView: React.FC<AlumnosViewProps> = ({
  students,
  courses,
  onAddStudent,
  onUpdateStudent,
  onSetPassword,
  onDeleteStudent,
  onNotify,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StudentStatus | 'all'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [pwdStudent, setPwdStudent] = useState<Student | null>(null);
  const [pwdDraft, setPwdDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<StudentDraft>({
    fullName: '',
    email: '',
    phone: '',
    courseCode: '',
    status: 'Activo',
    password: '',
  });
  const [error, setError] = useState('');

  const getCourseName = (code: string) => courses.find((course) => course.code === code)?.name || 'Sin curso';

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const query = searchTerm.toLowerCase();
        const courseName = getCourseName(student.courseCode).toLowerCase();
        const matchesQuery =
          student.fullName.toLowerCase().includes(query) ||
          student.registrationNumber.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          courseName.includes(query);
        const matchesCourse = courseFilter === 'all' || student.courseCode === courseFilter;
        const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
        return matchesQuery && matchesCourse && matchesStatus;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [students, searchTerm, courseFilter, statusFilter, courses],
  );

  const openCreateForm = () => {
    setEditingStudent(null);
    setDraft({
      fullName: '',
      email: '',
      phone: '',
      courseCode: courses[0]?.code || '',
      status: 'Activo',
      password: genPassword(),
    });
    setError('');
    setIsFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setEditingStudent(student);
    setDraft({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      courseCode: student.courseCode,
      status: student.status,
      password: '',
    });
    setError('');
    setIsFormOpen(true);
  };

  const openPasswordModal = (student: Student) => {
    setPwdStudent(student);
    setPwdDraft('');
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStudent(null);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.fullName.trim() || !draft.email.trim()) {
      setError('Nombre completo y correo son obligatorios.');
      return;
    }
    if (!draft.courseCode) {
      setError('Selecciona un curso para el alumno.');
      return;
    }
    if (!editingStudent && !draft.password.trim()) {
      setError('Asigna una contraseña o genera una automáticamente.');
      return;
    }

    const payload: StudentInput = {
      fullName: draft.fullName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      courseCode: draft.courseCode,
      status: draft.status,
      ...(draft.password.trim() ? { password: draft.password.trim() } : {}),
    };

    setSaving(true);
    const ok = editingStudent
      ? await onUpdateStudent(editingStudent.id, payload)
      : await onAddStudent(payload);
    setSaving(false);
    if (ok) closeForm();
  };

  const savePassword = async () => {
    if (!pwdStudent) return;
    if (!pwdDraft.trim()) {
      onNotify('Contraseña vacía', 'Escribe una contraseña o genera una nueva.');
      return;
    }
    setSaving(true);
    const ok = await onSetPassword(pwdStudent, pwdDraft.trim());
    setSaving(false);
    if (ok) setPwdStudent(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 sm:p-7 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#7bfcec]/60 text-xs font-semibold">
            Usuarios y credenciales
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">Alumnos</h2>
          <p className="text-sm text-mute mt-1 max-w-2xl">
            Alta, edición y baja del alumnado. Asigna o cambia la contraseña de acceso a doctiva.app.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#ebff57] hover:bg-[#e5f847] text-black font-bold text-sm cursor-pointer transition-transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Añadir alumno</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="rounded-[28px] bg-white p-4 sm:p-5 shadow-card flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre, matrícula o correo..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#f1f0e6] rounded-full border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="px-4 py-2.5 rounded-full bg-[#f1f0e6] border border-transparent focus:border-black focus:outline-none cursor-pointer text-sm"
          >
            <option value="all">Todos los cursos</option>
            {courses.map((course) => (
              <option key={course.id} value={course.code}>
                {course.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#f1f0e6]">
            {(['all', 'Activo', 'Inactivo'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setStatusFilter(option)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === option ? 'bg-[#111112] text-[#ebff57]' : 'text-mute hover:text-ink'
                }`}
              >
                {option === 'all' ? 'Todos' : option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Listado */}
      <div className="rounded-[28px] bg-white shadow-card overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.6fr_1fr_1fr_.8fr_1fr_auto] gap-4 px-6 py-4 text-[11px] uppercase tracking-widest text-mute font-bold border-b border-black/5 bg-[#f1f0e6]/60">
          <span>Alumno</span>
          <span>Matrícula</span>
          <span>Curso</span>
          <span>Estado</span>
          <span>Último acceso</span>
          <span className="text-right">Acciones</span>
        </div>

        <div className="divide-y divide-black/5">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_.8fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-[#f1f0e6]/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#ebff57] text-black flex items-center justify-center font-black text-sm shrink-0">
                  {student.fullName
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">{student.fullName}</div>
                  <div className="text-xs text-mute flex items-center gap-2 truncate">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{student.email}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm font-semibold">{student.registrationNumber}</div>

              <div>
                <span className="px-3 py-1 rounded-full bg-[#f1f0e6] text-xs font-semibold">
                  {getCourseName(student.courseCode)}
                </span>
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                    student.status === 'Activo' ? 'bg-[#ebff57] text-black' : 'bg-black/5 text-mute'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Activo' ? 'bg-black' : 'bg-mute'}`} />
                  {student.status}
                </span>
              </div>

              <div className="text-xs text-mute flex items-center gap-2">
                <Phone className="w-3 h-3 shrink-0" />
                <span className="truncate">{student.phone}</span>
              </div>

              <div className="flex items-center justify-start md:justify-end gap-1.5">
                <button
                  onClick={() => openPasswordModal(student)}
                  title="Asignar, ver o cambiar contraseña"
                  className="w-9 h-9 rounded-xl bg-[#7bfcec]/50 hover:bg-[#7bfcec] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditForm(student)}
                  title="Editar alumno"
                  className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-[#ebff57] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStudentToDelete(student)}
                  title="Eliminar alumno"
                  className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-black hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f1f0e6] mx-auto flex items-center justify-center">
                <UserRound className="w-6 h-6 text-mute" />
              </div>
              <h3 className="mt-4 font-bold">Sin coincidencias</h3>
              <p className="text-sm text-mute mt-1">Ajusta los filtros o registra un nuevo alumno.</p>
              <button
                onClick={openCreateForm}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111112] text-[#ebff57] text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Añadir alumno
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-black/5 flex items-center justify-between text-xs">
          <span className="text-mute">
            Mostrando <strong className="text-ink">{filteredStudents.length}</strong> de{' '}
            <strong className="text-ink">{students.length}</strong> alumnos
          </span>
          <button
            onClick={() => alert('Exportando padrón de alumnos en CSV...')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f1f0e6] hover:bg-[#7bfcec] font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Modal crear / editar */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg bg-white rounded-[28px] shadow-pop p-6 sm:p-7 max-h-[92vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-mute font-bold">
                  {editingStudent ? 'Editar alumno' : 'Nuevo alumno'}
                </span>
                <h3 className="text-2xl font-black tracking-tight mt-1">
                  {editingStudent ? editingStudent.fullName : 'Añadir al directorio'}
                </h3>
              </div>
              <button
                onClick={closeForm}
                className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="space-y-1 block">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Nombre completo *</span>
                <input
                  value={draft.fullName}
                  onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
                  placeholder="Ej: Ana Martínez López"
                  className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Correo *</span>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                    placeholder="ana.martinez@doctiva.app"
                    className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
                  />
                </label>
                <label className="space-y-1 block">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Teléfono</span>
                  <input
                    value={draft.phone}
                    onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                    placeholder="+34 611 000 000"
                    className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className="space-y-1 block">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Curso *</span>
                  <select
                    value={draft.courseCode}
                    onChange={(event) => setDraft({ ...draft, courseCode: event.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm cursor-pointer"
                  >
                    <option value="">Selecciona un curso</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.code}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-mute block">Estado</span>
                  <div className="flex items-center gap-1 p-1 rounded-full bg-[#f1f0e6]">
                    {(['Activo', 'Inactivo'] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setDraft({ ...draft, status: option })}
                        className={`flex-1 px-3 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          draft.status === option ? 'bg-[#111112] text-[#ebff57]' : 'text-mute hover:text-ink'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-mute block">
                  {editingStudent ? 'Nueva contraseña (opcional)' : 'Contraseña de acceso *'}
                </span>
                <div className="flex gap-2">
                  <input
                    value={draft.password}
                    onChange={(event) => setDraft({ ...draft, password: event.target.value })}
                    placeholder={editingStudent ? 'Déjala vacía para conservar la actual' : 'Ej: Doc#4182'}
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, password: genPassword() })}
                    title="Generar contraseña"
                    className="px-4 rounded-2xl bg-[#7bfcec] hover:bg-[#5eeadb] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Generar
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-[#ebff57]/50 border border-black/10 text-xs font-semibold">{error}</div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-5 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-full bg-[#ebff57] hover:bg-[#e5f847] disabled:opacity-60 text-black text-sm font-bold cursor-pointer"
                >
                  {saving ? 'Guardando...' : editingStudent ? 'Guardar cambios' : 'Añadir alumno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal contraseña: asignar / ver / cambiar */}
      {pwdStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-pop p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#7bfcec] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-mute font-bold">Credencial de acceso</span>
                  <h3 className="text-lg font-black tracking-tight">{pwdStudent.fullName}</h3>
                </div>
              </div>
              <button
                onClick={() => setPwdStudent(null)}
                className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-mute block">
                  Nueva contraseña
                </span>
                <div className="flex gap-2">
                  <input
                    value={pwdDraft}
                    onChange={(event) => setPwdDraft(event.target.value)}
                    placeholder="Escribe o genera una nueva"
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm font-semibold"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(pwdDraft);
                      onNotify('Contraseña copiada', 'Compártela con el alumno: no podrá consultarse después.');
                    }}
                    disabled={!pwdDraft}
                    title="Copiar contraseña"
                    className="w-11 rounded-2xl bg-[#f1f0e6] hover:bg-[#ebff57] disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPwdDraft(genPassword())}
                    title="Generar contraseña segura"
                    className="px-4 rounded-2xl bg-[#7bfcec] hover:bg-[#5eeadb] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Generar
                  </button>
                </div>
                <p className="text-[11px] text-mute">
                  Por seguridad la contraseña actual no se puede consultar, solo reemplazar. El alumno usará la nueva junto a su correo {pwdStudent.email} en doctiva.app.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setPwdStudent(null)}
                className="px-5 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={savePassword}
                disabled={saving}
                className="px-5 py-2.5 rounded-full bg-[#111112] text-[#ebff57] hover:bg-neutral-800 disabled:opacity-60 text-sm font-bold cursor-pointer"
              >
                {saving ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación de borrado */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[28px] shadow-pop p-6" onClick={(event) => event.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-[#ebff57] flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="mt-4 text-xl font-black tracking-tight">Eliminar alumno</h3>
            <p className="text-sm text-mute mt-2">
              Vas a eliminar a <strong className="text-ink">{studentToDelete.fullName}</strong> del directorio y su
              credencial de acceso dejará de funcionar.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-5 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(studentToDelete);
                  setStudentToDelete(null);
                }}
                className="px-5 py-2.5 rounded-full bg-black text-[#ebff57] hover:bg-neutral-800 text-sm font-bold cursor-pointer"
              >
                Eliminar alumno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
