import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  // Enforce maximum 5 notifications
  const displayedToasts = toasts.slice(-5);

  if (displayedToasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '36px',
      right: '16px',
      zIndex: 900,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      maxWidth: '360px',
      width: '100%',
      pointerEvents: 'none',
    }}>
      {displayedToasts.map((toast) => {
        let titleColor = '#000080';
        let icon = <Info size={13} color="#000080" />;

        if (toast.type === 'warning') {
          titleColor = '#b45309';
          icon = <AlertTriangle size={13} color="#b45309" />;
        } else if (toast.type === 'error') {
          titleColor = '#b91c1c';
          icon = <AlertCircle size={13} color="#b91c1c" />;
        } else if (toast.type === 'success') {
          titleColor = '#15803d';
          icon = <CheckCircle2 size={13} color="#15803d" />;
        }

        return (
          <div
            key={toast.id}
            className="win95-outset"
            style={{
              padding: '2px',
              backgroundColor: 'var(--win-gray)',
              boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.4)',
              pointerEvents: 'auto',
            }}
          >
            {/* Toast Mini Titlebar */}
            <div style={{
              backgroundColor: titleColor,
              color: '#ffffff',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10px',
              fontWeight: 700,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {icon}
                <span>DEPARTMENT NOTIFICATION</span>
              </div>
              <button
                className="win95-titlebar-btn"
                onClick={() => onDismiss(toast.id)}
                style={{ width: '13px', height: '12px', fontSize: '8px', lineHeight: '9px' }}
              >
                ×
              </button>
            </div>

            {/* Toast Message Body */}
            <div style={{
              padding: '6px 8px',
              fontSize: '11px',
              color: '#111827',
              backgroundColor: '#f9fafb',
              lineHeight: 1.35,
            }}>
              {toast.message}
            </div>
          </div>
        );
      })}
    </div>
  );
};
