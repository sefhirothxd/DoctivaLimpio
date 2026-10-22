import React from 'react';
import { Bell, BookOpenCheck, Menu, Search, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddResourceClick: () => void;
  canManage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  searchQuery,
  setSearchQuery,
  onAddResourceClick,
  canManage,
}) => {
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    { id: 1, title: 'Nueva entrega registrada', time: 'Hace 12 min', course: 'Photoshop' },
    { id: 2, title: '30 usuarios accedieron a una guía', time: 'Hace 45 min', course: 'Corel Draw' },
    { id: 3, title: 'Sincronización completada', time: 'Hoy 08:00', course: 'Todos los cursos' },
  ];

  const tabLabel: Record<ActiveTab, string> = {
    inicio: 'Inicio',
    cursos: 'Cursos y recursos',
    alumnos: 'Alumnos',
    auditoria: 'Auditoría',
    configuracion: 'Configuración',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#f1f0e6]/85 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden w-10 h-10 rounded-2xl bg-white border border-black/10 hover:bg-[#ebff57] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-mute uppercase tracking-widest">Intranet</span>
            <span className="text-mute">/</span>
            <span className="px-3 py-1 rounded-full bg-white border border-black/10 font-semibold capitalize">
              {tabLabel[activeTab]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden md:block w-64 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar recursos o cursos..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-black/10 rounded-full focus:outline-none focus:border-black text-sm transition"
            />
          </div>

          {canManage && (
            <button
              onClick={onAddResourceClick}
              className="hidden sm:inline-flex items-center gap-2 pl-4 pr-5 py-2.5 rounded-full bg-[#ebff57] hover:bg-[#e5f847] text-black text-sm font-bold cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear recurso</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 rounded-2xl bg-white border border-black/10 hover:bg-[#7bfcec] transition-colors flex items-center justify-center relative cursor-pointer"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#ebff57] border border-black" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-pop border border-black/5 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <span className="text-xs font-bold uppercase tracking-wider">Avisos recientes</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebff57] text-black">3 nuevos</span>
                </div>
                <div className="space-y-2 mt-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 rounded-2xl bg-[#f1f0e6] hover:bg-white transition-colors">
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <BookOpenCheck className="w-3.5 h-3.5 text-mute" />
                        <span>{notification.title}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-mute mt-1">
                        <span>{notification.course}</span>
                        <span>{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-full mt-3 py-2 rounded-full bg-[#111112] text-[#ebff57] text-xs font-bold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
