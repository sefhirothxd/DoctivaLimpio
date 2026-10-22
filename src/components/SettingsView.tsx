import React, { useState } from 'react';
import { Bell, Cloud, Database, Globe2, MonitorSmartphone, Palette, Save, ShieldCheck, Zap } from 'lucide-react';
import { AuthUser } from '../types';

interface SettingsViewProps {
  user: AuthUser;
  onNotify: (title: string, description?: string) => void;
  apiUrl: string;
  onTestConnection: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onNotify,
  apiUrl,
  onTestConnection,
}) => {
  const [testing, setTesting] = useState(false);

  const handleTestConnection = () => {
    setTesting(true);
    Promise.resolve(onTestConnection()).finally(() => setTesting(false));
  };

  const [institution, setInstitution] = useState('Doctiva Learning · Sede central');
  const [contactEmail, setContactEmail] = useState('soporte@doctiva.app');
  const [timezone, setTimezone] = useState('Europe/Madrid');
  const [language, setLanguage] = useState('Español (es-ES)');
  const [preferences, setPreferences] = useState({
    notifyResources: true,
    notifyAudit: true,
    weeklyReport: false,
    darkSidebar: true,
    autoBackup: true,
  });

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onNotify('Configuración guardada', 'Los cambios se aplicaron a toda la sede.');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 sm:p-7 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-[#ebff57]/60 text-xs font-semibold">Configuración</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-3">Configuración general</h2>
          <p className="text-sm text-mute mt-1 max-w-2xl">
            Ajusta preferencias del centro, notificaciones y comportamiento global del panel.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#111112] text-[#ebff57] flex items-center justify-center font-black">
            {user.initials}
          </div>
          <div>
            <div className="font-bold text-sm">{user.name}</div>
            <div className="text-mute">{user.roleLabel}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-[28px] bg-white p-6 shadow-card space-y-5">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7bfcec] flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Perfil del centro</h3>
              <p className="text-xs text-mute">Datos institucionales visibles en la intranet.</p>
            </div>
          </header>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className="space-y-1 block">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Nombre del centro</span>
              <input
                value={institution}
                onChange={(event) => setInstitution(event.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Email de soporte</span>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Zona horaria</span>
              <select
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm cursor-pointer"
              >
                <option>Europe/Madrid</option>
                <option>Europe/Lisbon</option>
                <option>America/Bogota</option>
                <option>America/Mexico_City</option>
                <option>America/Buenos_Aires</option>
              </select>
            </label>
            <label className="space-y-1 block">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-mute">Idioma del panel</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-[#f1f0e6] border border-transparent focus:bg-white focus:border-black focus:outline-none text-sm cursor-pointer"
              >
                <option>Español (es-ES)</option>
                <option>Português (pt-BR)</option>
                <option>English (en-US)</option>
              </select>
            </label>
          </div>

          <div className="rounded-2xl bg-[#f1f0e6] p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ebff57] flex items-center justify-center shrink-0">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Tema de marca</h4>
              <p className="text-xs text-mute mt-1">
                Kit visual actual: Satoshi + lima <span className="font-bold text-ink">#ebff57</span>, menta{' '}
                <span className="font-bold text-ink">#7bfcec</span> y crema{' '}
                <span className="font-bold text-ink">#f1f0e6</span>.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-card space-y-4">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ebff57] flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Notificaciones</h3>
              <p className="text-xs text-mute">Controla qué avisos recibirán los usuarios.</p>
            </div>
          </header>

          <div className="space-y-2">
            {[
              { key: 'notifyResources' as const, title: 'Nuevos recursos publicados', desc: 'Avisa a los alumnos cuando publicas contenido.' },
              { key: 'notifyAudit' as const, title: 'Alertas de auditoría', desc: 'Recibe eventos críticos por correo.' },
              { key: 'weeklyReport' as const, title: 'Resumen semanal', desc: 'Informe automático cada lunes 08:00.' },
            ].map((option) => (
              <button
                type="button"
                key={option.key}
                onClick={() => togglePreference(option.key)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#f1f0e6] hover:bg-[#ebff57]/40 text-left cursor-pointer transition-colors"
              >
                <div>
                  <div className="text-sm font-bold">{option.title}</div>
                  <div className="text-xs text-mute">{option.desc}</div>
                </div>
                <span
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    preferences[option.key] ? 'bg-[#111112]' : 'bg-black/15'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                      preferences[option.key] ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-[#111112] text-[#f1f0e6] p-6 shadow-pop lg:col-span-2 space-y-4">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ebff57] text-black flex items-center justify-center">
              <MonitorSmartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Preferencias del panel</h3>
              <p className="text-xs text-[#f1f0e6]/60">Comportamiento visual y de sesión.</p>
            </div>
          </header>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: 'darkSidebar' as const, title: 'Menú lateral oscuro', desc: 'Fija el sidebar en modo oscuro Satoshi.' },
              { key: 'autoBackup' as const, title: 'Copia diaria automática', desc: 'Ejecuta backup a las 04:00 cada día.' },
            ].map((option) => (
              <button
                type="button"
                key={option.key}
                onClick={() => togglePreference(option.key)}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-left cursor-pointer transition-colors flex items-start justify-between"
              >
                <div>
                  <div className="text-sm font-bold">{option.title}</div>
                  <div className="text-xs text-[#f1f0e6]/60">{option.desc}</div>
                </div>
                <span
                  className={`relative w-11 h-6 rounded-full transition-colors ml-2 ${
                    preferences[option.key] ? 'bg-[#ebff57]' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                      preferences[option.key] ? 'left-5' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-card space-y-4">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7bfcec] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Seguridad</h3>
              <p className="text-xs text-mute">Sesiones activas y accesos.</p>
            </div>
          </header>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f1f0e6]">
              <div>
                <div className="text-sm font-bold">Verificación en dos pasos</div>
                <div className="text-xs text-mute">Requiere código en cada acceso nuevo.</div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#ebff57]">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f1f0e6]">
              <div>
                <div className="text-sm font-bold">Cierre por inactividad</div>
                <div className="text-xs text-mute">Se cierra sesión tras 30 minutos.</div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7bfcec]">30 min</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f1f0e6]">
              <div>
                <div className="text-sm font-bold">Backups en la nube</div>
                <div className="text-xs text-mute">Almacenados en servidor institucional.</div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white">
                <Cloud className="w-3 h-3" />
                Sync
              </span>
            </div>
          </div>
        </section>

        <section className="lg:col-span-3 rounded-[28px] bg-white p-6 shadow-card space-y-4">
          <header className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111112] text-[#ebff57] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Conexión de datos</h3>
              <p className="text-xs text-mute">Servidor al que se conecta esta aplicación.</p>
            </div>
          </header>

          <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-stretch">
            <div className="p-4 rounded-2xl bg-[#f1f0e6] space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-[#7bfcec] text-black">
                  API REST
                </span>
                <code className="font-bold text-sm break-all">{apiUrl}</code>
              </div>
              <p className="text-xs text-mute leading-relaxed">
                Los datos se leen y guardan en el servidor de Doctiva. La URL se define con{' '}
                <code className="font-bold text-ink">VITE_API_URL</code>.
              </p>
            </div>

            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="px-5 py-3 rounded-full bg-[#111112] text-[#ebff57] hover:bg-neutral-800 disabled:opacity-60 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
              {testing ? 'Probando...' : 'Probar conexión'}
            </button>
          </div>
        </section>

        <div className="lg:col-span-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onNotify('Cambios descartados', 'Se restauraron los valores anteriores.')}
            className="px-5 py-2.5 rounded-full bg-white border border-black/10 hover:bg-[#f1f0e6] text-sm font-bold cursor-pointer"
          >
            Descartar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ebff57] hover:bg-[#e5f847] text-black text-sm font-bold cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar configuración
          </button>
        </div>
      </form>
    </div>
  );
};
