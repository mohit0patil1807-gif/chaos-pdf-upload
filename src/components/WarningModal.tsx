import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface WarningModalProps {
  onProceed: () => void;
  onCancel: () => void;
}

export const WarningModal: React.FC<WarningModalProps> = ({
  onProceed,
  onCancel,
}) => {
  const [protestNotice, setProtestNotice] = useState('');

  const handleProtest = () => {
    sound.playError();
    setProtestNotice(
      'CITIZEN PROTEST DENIED: Protest Form 404-X is currently on backorder from the Federal Printing Office until Q2 1998. To complete document filing, you must accept standard risks.'
    );
  };

  const handleAccept = () => {
    sound.playStamp();
    onProceed();
  };

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
        <div className="win95-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <AlertTriangle size={13} />
            <span>Advisory Circular 97-04: Departmental Risk Notice</span>
          </div>
          <button className="win95-titlebar-btn" onClick={onCancel}>×</button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '34px',
              height: '34px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '1px 1px 0px #000',
            }}>
              <AlertTriangle size={24} color="#000000" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: '#000000' }}>
                DEPARTMENTAL WARNING: Ingestion Side-Effects Advisory
              </div>
              <div style={{ color: '#1f2937', lineHeight: 1.4 }}>
                Ingesting this PDF into the Department central registry may induce the following harmless operational phenomena:
              </div>
              <ul style={{ paddingLeft: '18px', color: '#374151', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <li>Thermal paper roll depletion in adjacent floor facsimile devices.</li>
                <li>Audible 28.8k baud modem handshake whistle over internal telephone lines.</li>
                <li>Minor 16-bit color palette jitter in CRT visual displays.</li>
                <li>Temporary backlog in Deputy Clerk Abernathy&apos;s morning crossword puzzle.</li>
              </ul>
            </div>
          </div>

          {protestNotice && (
            <div className="win95-inset" style={{
              padding: '6px 8px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '10px',
              fontFamily: 'var(--font-retro-mono)',
            }}>
              {protestNotice}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--win-dark)',
          }}>
            <button
              type="button"
              className="win95-btn"
              onClick={handleProtest}
            >
              File Citizen Protest
            </button>
            <button
              type="button"
              className="win95-btn"
              onClick={handleAccept}
              style={{ fontWeight: 700 }}
            >
              I Accept All Bureaucratic Risks ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
