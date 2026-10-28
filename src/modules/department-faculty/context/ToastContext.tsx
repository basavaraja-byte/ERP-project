import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, title }]);
      window.setTimeout(() => {
        removeToast(id);
      }, 4800);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[80] flex flex-col gap-2.5 max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          const styles = {
            success: {
              border: 'border-emerald-200 bg-white',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
              bar: 'bg-emerald-600',
              defaultTitle: 'Operation Completed',
            },
            error: {
              border: 'border-red-200 bg-white',
              icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
              bar: 'bg-red-600',
              defaultTitle: 'Validation / Action Blocked',
            },
            warning: {
              border: 'border-amber-200 bg-white',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
              bar: 'bg-amber-500',
              defaultTitle: 'Attention',
            },
            info: {
              border: 'border-blue-200 bg-white',
              icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
              bar: 'bg-blue-600',
              defaultTitle: 'Notice',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden rounded-lg border ${styles.border} shadow-lg p-3.5 flex items-start gap-3`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar}`} />
              {styles.icon}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-800">
                  {toast.title ?? styles.defaultTitle}
                </p>
                <p className="text-sm text-slate-600 mt-0.5 leading-snug">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

