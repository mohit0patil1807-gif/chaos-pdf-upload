import React from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface PrematureDropModalProps {
  counterLabel: string;
  elapsedMs: number;
  onDismiss: () => void;
}

export const PrematureDropModal: React.FC<PrematureDropModalProps> = ({
  counterLabel,
  elapsedMs,
  onDismiss,
}) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }}>
      <div className="win95-outset" style={{
        maxWidth: '480px',
        width: '100%',
        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Titlebar */}
        <div className="win95-titlebar" style={{ backgroundColor: '#991b1b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={13} />
            <span>Infraction 97-PRE: Premature Document Release</span>
          </div>
          <button className="win95-titlebar-btn" onClick={onDismiss}>×</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            width: '38px',
            height: '38px',
            backgroundColor: '#fef08a',
            border: '2px solid #ca8a04',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '1px 1px 0px #000',
          }}>
            <Clock size={22} color="#854d0e" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            <div style={{ fontWeight: 700, fontSize: '12px', color: '#991b1b' }}>
              INTAKE TRAY REJECTION: Document Released Before Arming Completion
            </div>

            <div style={{ color: '#1f2937', lineHeight: 1.4 }}>
              Receiving hopper sensors at <b>{counterLabel}</b> were not fully pressurized.
              Federal Standard 97-D requires a continuous dwell of at least <b>1.2 seconds (1,200 ms)</b> to arm the intake mechanism.
            </div>

            <div className="win95-inset" style={{
              padding: '6px 8px',
              backgroundColor: '#f8fafc',
              fontFamily: 'var(--font-retro-mono)',
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}>
              <div><b>Target Counter:</b> {counterLabel}</div>
              <div><b>Recorded Hover Time:</b> {elapsedMs} ms / 1,200 ms</div>
              <div style={{ color: '#b91c1c' }}><b>Deficit:</b> {Math.max(0, 1200 - elapsedMs)} ms remaining to arm</div>
            </div>

            <div style={{ color: '#4b5563', fontStyle: 'italic', fontSize: '10px' }}>
              Tip: Hover cursor steadily over the intake counter until the green circular gauge fills to 100% and displays &quot;ARMED&quot; before releasing the mouse button.
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div style={{
          padding: '8px 16px 12px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
          borderTop: '1px solid var(--win-dark)',
          backgroundColor: 'var(--win-gray)',
        }}>
          <button
            className="win95-btn"
            onClick={() => {
              sound.playBlip();
              onDismiss();
            }}
            style={{ fontWeight: 700 }}
          >
            Acknowledge &amp; Retry Dwell
          </button>
        </div>
      </div>
    </div>
  );
};
