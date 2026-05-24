import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
};

const LABELS = {
  success: 'Succès',
  error: 'Erreur',
  warning: 'Attention',
  info: 'Info',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-wrapper">
        <div className="toast-stack">
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type] || Info;
            return (
              <div
                key={toast.id}
                className={`toast-card glass ${COLORS[toast.type]} animate-slide-in`}
              >
                <div className="toast-icon-wrap">
                  <Icon className="toast-icon" />
                </div>
                <div className="toast-content">
                  <div className="toast-header">
                    <p className="toast-label">{LABELS[toast.type] || 'Info'}</p>
                    <button
                      onClick={() => removeToast(toast.id)}
                      className="toast-close"
                      aria-label="Fermer la notification"
                    >
                      <X className="toast-close-icon" />
                    </button>
                  </div>
                  <p className="toast-message">{toast.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
