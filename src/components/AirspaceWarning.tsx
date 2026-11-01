import React from 'react';
import { AlertTriangle, Crosshair, Radio } from 'lucide-react';

interface AirspaceWarningProps {
  active: boolean;
  checkpoint1Cleared: boolean;
  checkpoint2Cleared: boolean;
}

export const AirspaceWarning: React.FC<AirspaceWarningProps> = ({
  active,
  checkpoint1Cleared,
  checkpoint2Cleared,
}) => {
  if (!active) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 50,
      border: '4px dashed rgba(245, 158, 11, 0.6)',
      boxShadow: 'inset 0 0 80px rgba(245, 158, 11, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.5rem',
    }}>
      {/* Top Banner */}
      <div style={{
        alignSelf: 'center',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid #f59e0b',
        borderRadius: '10px',
        padding: '0.6rem 1.5rem',
        boxShadow: '0 0 30px rgba(245, 158, 11, 0.5)',
      }}>
        <AlertTriangle color="#f59e0b" size={22} className="jitter-effect" />
        <div>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            color: '#fbbf24',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '0.04em',
          }}>
            AIRSPACE ALERT: UNREGISTERED PDF DETECTED IN BROWSER STRATOSPHERE
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#e2e8f0',
            fontFamily: 'var(--font-mono)',
          }}>
            Status: Checkpoint 1: {checkpoint1Cleared ? '✅ DE-IONIZED' : '⏳ REQUIRED'} | Checkpoint 2: {checkpoint2Cleared ? '✅ NOTARIZED' : '⏳ REQUIRED'}
          </div>
        </div>
        <Radio color="#06b6d4" size={20} className="pulse-target" />
      </div>

      {/* Crosshair corners */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', opacity: 0.7 }}>
        <Crosshair size={32} color="#f59e0b" />
      </div>
      <div style={{ position: 'absolute', top: '10px', right: '10px', opacity: 0.7 }}>
        <Crosshair size={32} color="#f59e0b" />
      </div>
      <div style={{ position: 'absolute', bottom: '10px', left: '10px', opacity: 0.7 }}>
        <Crosshair size={32} color="#f59e0b" />
      </div>
      <div style={{ position: 'absolute', bottom: '10px', right: '10px', opacity: 0.7 }}>
        <Crosshair size={32} color="#f59e0b" />
      </div>
    </div>
  );
};
