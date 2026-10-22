import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Resource } from '../types';

interface DeleteModalProps {
  isOpen: boolean;
  resource: Resource | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, resource, onClose, onConfirm }) => {
  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-pop p-6" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-[#ebff57] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#f1f0e6] hover:bg-black hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <span className="text-[11px] uppercase tracking-widest font-bold text-mute">Confirmar eliminación</span>
          <h3 className="text-xl font-black mt-1 tracking-tight">¿Eliminar recurso?</h3>
          <p className="mt-2 text-sm text-mute leading-relaxed">
            Vas a desvincular <strong className="text-ink">"{resource.title}"</strong>. Afectará a los{' '}
            <strong className="text-ink">{resource.assignedCourses.length} cursos</strong> asignados.
          </p>
        </div>

        <div className="mt-4 p-3 rounded-2xl bg-[#f1f0e6] text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-mute">Código:</span>
            <span className="font-bold">{resource.code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Materia:</span>
            <span className="font-bold">{resource.subject}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#f1f0e6] hover:bg-black/10 text-sm font-bold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-full bg-black text-[#ebff57] hover:bg-neutral-800 text-sm font-bold cursor-pointer"
          >
            Eliminar definitivamente
          </button>
        </div>
      </div>
    </div>
  );
};
