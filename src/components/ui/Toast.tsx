import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-type-icon success" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-type-icon warning" />;
      case 'error':
        return <AlertCircle size={18} className="toast-type-icon error" />;
      case 'info':
      default:
        return <Info size={18} className="toast-type-icon info" />;
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-card toast-${toast.type} animate-fade-in`}>
          <div className="toast-icon-box">{getIcon(toast.type)}</div>
          <div className="toast-text-box">
            <h5 className="toast-title">{toast.title}</h5>
            {toast.description && <p className="toast-description">{toast.description}</p>}
          </div>
          <button
            className="toast-close-btn"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
