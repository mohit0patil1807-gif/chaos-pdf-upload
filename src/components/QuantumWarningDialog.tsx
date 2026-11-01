import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface QuantumWarningDialogProps {
  onProceed: () => void;
  onCancel: () => void;
}

export const QuantumWarningDialog: React.FC<QuantumWarningDialogProps> = ({
  onProceed,
  onCancel,
}) => {
  const [jitter, setJitter] = useState(false);
  const [panicMsg, setPanicMsg] = useState('');

  const handlePanic = () => {
    sound.playError();
    setJitter(true);
    setPanicMsg('Panic request logged: Panic denied by Section 4. Cancellation requires 30 business days advance carrier pigeon notice. You must proceed!');
    setTimeout(() => setJitter(false), 500);
  };

  const handleProceed = () => {
    sound.playCheckpointSuccess();
    onProceed();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1rem',
    }}>
      <div 
        className={`glass-panel ${jitter ? 'jitter-effect' : ''}`}
        style={{
          maxWidth: '520px',
          width: '100%',
          border: '1px solid #f59e0b',
          boxShadow: '0 0 35px rgba(245, 158, 11, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Retro Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(245, 158, 11, 0.12)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <span style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              fontFamily: 'var(--font-heading)',
              color: '#f8fafc',
              letterSpacing: '0.03em',
            }}>
              SEISMIC & QUANTUM DECOHERENCE ADVISORY
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: '#f59e0b',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
          }}>
            STEP 2 OF 3
          </span>
        </div>

        {/* Warning Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="hazard-stripe" style={{
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            <div style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <Zap size={16} /> CAUTION: IMMINENT BROWSER TAB PERTURBATION
            </div>
            <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              Ingesting high-density Portable Document Format files may cause momentary thermodynamic compression in your browser's V8 Javascript engine and minor existential doubt among nearby transistors.
            </p>
          </div>

          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            OmniVault™ asserts that no actual PDF bytes will be harmed during ingestion. Do you acknowledge this harmless reality and consent to proceed?
          </p>

          {panicMsg && (
            <div style={{
              fontSize: '0.74rem',
              color: 'var(--accent-rose)',
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              fontFamily: 'var(--font-mono)',
            }}>
              {panicMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <button
              type="button"
              onClick={handlePanic}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#fb7185',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Panic & Re-evaluate Life
            </button>

            <button
              type="button"
              onClick={handleProceed}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.25rem',
                backgroundColor: '#f59e0b',
                border: 'none',
                color: '#090d16',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)',
              }}
            >
              <ShieldCheck size={16} />
              Accept Quantum Risk & Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
