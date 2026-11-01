import React from 'react';
import { XCircle, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface InvalidFileDialogProps {
  fileName: string;
  headerSnippet: string;
  errorReason: string;
  onDismiss: () => void;
}

export const InvalidFileDialog: React.FC<InvalidFileDialogProps> = ({
  fileName,
  headerSnippet,
  errorReason,
  onDismiss,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
    }}>
      <div className="cyber-panel" style={{
        maxWidth: '480px',
        width: '100%',
        border: '1px solid #ef4444',
        boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
        overflow: 'hidden',
      }}>
        {/* Titlebar */}
        <div style={{
          padding: '12px 18px',
          backgroundColor: '#1f2937',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#ef4444" />
            <span style={{ fontWeight: 800, fontSize: '13px', color: '#f87171' }}>
              PAYLOAD REJECTED // NON-PDF FORMAT
            </span>
          </div>
          <button
            type="button"
            className="cyber-btn"
            onClick={onDismiss}
            style={{ padding: '2px 8px', fontSize: '11px' }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <XCircle size={32} color="#ef4444" style={{ flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ fontWeight: 800, color: '#f87171' }}>
                SIGNATURE REJECTION: File lacks &apos;%PDF-&apos; magic bytes.
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.4 }}>
                The ANTivirus ingestion quarantine only accepts verified Adobe Portable Document Format files.
              </div>
            </div>
          </div>

          <div style={{
            padding: '10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div><span style={{ color: '#9ca3af' }}>File Name:</span> {fileName || 'Unnamed'}</div>
            <div><span style={{ color: '#9ca3af' }}>Detected Octets:</span> &quot;{headerSnippet || 'EMPTY'}&quot;</div>
            <div style={{ color: '#f87171' }}><span style={{ color: '#9ca3af' }}>Reason:</span> {errorReason}</div>
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Your application state is preserved. Click Dismiss to drop a valid <code>.pdf</code> document.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="button"
              className="cyber-btn cyber-btn-primary"
              onClick={() => {
                sound.playBlip();
                onDismiss();
              }}
            >
              Dismiss &amp; Try Another File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
