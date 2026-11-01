import React from 'react';
import { Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface NotificationToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  const getIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={16} color="#f59e0b" />;
      case 'error':
        return <XCircle size={16} color="#f43f5e" />;
      case 'success':
        return <CheckCircle size={16} color="#10b981" />;
      default:
        return <Info size={16} color="#06b6d4" />;
    }
  };

  const getBorderColor = (type: ToastNotification['type']) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'error': return '#f43f5e';
      case 'success': return '#10b981';
      default: return '#06b6d4';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column-reverse',
      gap: '0.65rem',
      zIndex: 150,
      maxWidth: '380px',
      width: '100%',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="glass-panel"
          style={{
            pointerEvents: 'auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            borderLeft: `4px solid ${getBorderColor(toast.type)}`,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            animation: 'pulseGlow 3s ease',
          }}
        >
          <div style={{ marginTop: '0.15rem' }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '0.78rem',
              color: '#f8fafc',
              lineHeight: 1.4,
              fontFamily: 'var(--font-mono)',
            }}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playBlip();
              onDismiss(toast.id);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '0.1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};
