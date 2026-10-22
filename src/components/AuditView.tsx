import React, { useMemo, useState } from 'react';
import { AlertOctagon, ChevronDown, Download, Filter, KeyRound, Search, ShieldCheck, UserRound } from 'lucide-react';
import { AuditEntry } from '../types';

interface AuditViewProps {
  entries: AuditEntry[];
}

const SEVERITY_STYLE: Record<AuditEntry['severity'], { label: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: { label: 'Informativo', bg: 'bg-[#7bfcec]', icon: ShieldCheck },
  warning: { label: 'Atención', bg: 'bg-[#ebff57]', icon: KeyRound },
  critical: { label: 'Crítico', bg: 'bg-black text-[#ebff57]', icon: AlertOctagon },
};

export const AuditView: React.FC<AuditViewProps> = ({ entries }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AuditEntry['severity'] | 'all'>('all');

  const filtered = useMemo(
    () =>
      entries.filter((entry) => {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          entry.actor.toLowerCase().includes(query) ||
          entry.action.toLowerCase().includes(query) ||
          entry.target.toLowerCase().includes(query);
        const matchesSeverity = severityFilter === 'all' || entry.severity === severityFilter;
        return matchesQuery && matchesSeverity;
      }),
    [entries, searchTerm, severityFilter],
  );

  const permissionGroups = [
    {
      name: 'Administradores',
      description: 'Acceso total al panel, gestión de cursos y usuarios.',
      count: 3,
      color: 'bg-[#ebff57]',
    },
    {
      name: 'Instructores',
      description: 'Publican recursos, revisan entregas y ven analíticas.',
      count: 12,
      color: 'bg-[#7bfcec]',
    },
    {
      name: 'Usuarios',
      description: 'Consultan recursos y realizan entregas de sus cursos.',
      count: 148,
      color: 'bg-white shadow-inset-line',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 sm:p-7 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#7bfcec]/60 text-xs font-semibold">
            Seguridad y trazabilidad
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">Auditoría & permisos</h2>
          <p className="text-sm text-mute mt-1 max-w-2xl">
            Consulta la actividad del sistema, revisa eventos críticos y controla los grupos de permisos.
          </p>
        </div>
        <button
          onClick={() => alert('Exportando registro de auditoría en CSV...')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#111112] text-[#ebff57] hover:bg-neutral-800 font-bold text-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Exportar registro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {permissionGroups.map((group) => (
          <div key={group.name} className={`rounded-[28px] p-5 shadow-card ${group.color}`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest font-bold opacity-70">Grupo</span>
              <span className="w-9 h-9 rounded-2xl bg-black/10 flex items-center justify-center">
                <UserRound className="w-4 h-4" />
              </span>
            </div>
            <h3 className="mt-3 text-lg font-black tracking-tight">{group.name}</h3>
            <p className="text-xs mt-1 opacity-75 leading-relaxed">{group.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-2xl font-black">{group.count}</span>
              <button className="text-xs font-bold underline cursor-pointer">Gestionar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] bg-white shadow-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-mute" />
            <span className="text-sm font-bold">Registro de eventos</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por usuario, acción u objeto..."
                className="w-full sm:w-72 pl-11 pr-4 py-2.5 bg-[#f1f0e6] rounded-full focus:outline-none focus:bg-white text-sm border border-transparent focus:border-black"
              />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#f1f0e6]">
              {(['all', 'info', 'warning', 'critical'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSeverityFilter(option)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors cursor-pointer ${
                    severityFilter === option ? 'bg-[#111112] text-[#ebff57]' : 'text-mute hover:text-ink'
                  }`}
                >
                  {option === 'all' ? 'Todos' : option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="divide-y divide-black/5">
          {filtered.map((entry) => {
            const severity = SEVERITY_STYLE[entry.severity];
            const SeverityIcon = severity.icon;
            return (
              <div key={entry.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${severity.bg}`}>
                    <SeverityIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">
                      {entry.actor}{' '}
                      <span className="text-mute font-medium">— {entry.action}</span>
                    </div>
                    <div className="text-xs text-mute truncate">
                      Sobre <strong className="text-ink">{entry.target}</strong> · IP {entry.ip}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-3 py-1 rounded-full font-bold ${severity.bg}`}>{severity.label}</span>
                  <span className="px-3 py-1 rounded-full bg-[#f1f0e6] font-semibold">{entry.timestamp}</span>
                  <button className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-black hover:text-white flex items-center justify-center cursor-pointer">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-mute">Sin eventos que coincidan con los filtros aplicados.</div>
          )}
        </div>
      </div>
    </div>
  );
};
