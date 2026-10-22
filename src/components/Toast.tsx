import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#111112] text-[#f1f0e6] rounded-2xl shadow-pop p-4 flex items-start justify-between gap-3"
        >
          <div className="flex items-start gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl text-black flex items-center justify-center shrink-0 ${
                toast.type === 'warning' ? 'bg-[#ff9d57]' : 'bg-[#ebff57]'
              }`}
            >
              {toast.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
            <div>
              <h5 className="font-bold text-sm">{toast.title}</h5>
              {toast.description && (
                <p className="text-xs text-[#f1f0e6]/70 mt-0.5 leading-snug">{toast.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
