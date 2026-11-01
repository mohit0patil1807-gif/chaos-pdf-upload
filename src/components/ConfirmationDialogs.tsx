import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, FileText, Bug } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface ConfirmationDialogsProps {
  file: File;
  fileSHA256: string;
  onProceedToDefense: () => void;
  onCancel: () => void;
}

export const ConfirmationDialogs: React.FC<ConfirmationDialogsProps> = ({
  file,
  fileSHA256,
  onProceedToDefense,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [crumbCertified, setCrumbCertified] = useState(false);
  const [sugarFreeCertified, setSugarFreeCertified] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crumbCertified || !sugarFreeCertified) {
      sound.playError();
      setValidationError('Mandatory Clearance: You must tick both declarations certifying zero crumbs or sugar!');
      return;
    }
    sound.playStamp();
    setStep(2);
  };

  const handleStep2Submit = () => {
    sound.playAntAlarm();
    onProceedToDefense();
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
        maxWidth: '520px',
        width: '100%',
        boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Titlebar */}
        <div className="win95-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={13} />
            <span>
              {step === 1 
                ? 'Form 88-ANT: Pre-Ingestion Crumb Certification (Rev. 1997)' 
                : 'Advisory 97-BIO: Insect Pheromone Detection Notice'}
            </span>
          </div>
          <button className="win95-titlebar-btn" onClick={onCancel}>×</button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* File summary */}
          <div className="win95-inset" style={{
            padding: '8px 10px',
            backgroundColor: '#ffffff',
            fontSize: '11px',
            fontFamily: 'var(--font-retro-mono)',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}>
            <div><b>Target Document:</b> {file.name}</div>
            <div><b>Mass:</b> {formatBytes(file.size)} ({file.size.toLocaleString()} bytes)</div>
            {fileSHA256 && (
              <div style={{ wordBreak: 'break-all', fontSize: '9px', color: '#4b5563' }}>
                <b>SHA-256:</b> {fileSHA256}
              </div>
            )}
          </div>

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', color: '#1f2937' }}>
                Pursuant to Section 104-BUG, digital insect colonies are attracted to sweet byte streams. Before entering the quarantine queue, certify that your PDF contains zero picnic hazards:
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--win-dark)',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}>
                  <input
                    type="checkbox"
                    checked={crumbCertified}
                    onChange={(e) => {
                      sound.playBlip();
                      setCrumbCertified(e.target.checked);
                      if (e.target.checked && sugarFreeCertified) setValidationError('');
                    }}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    <b>Affidavit of Zero Crumbs:</b> I solemnly swear this document contains no sandwich crumbs, cookie dust, or muffin flakes.
                  </span>
                </label>

                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--win-dark)',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}>
                  <input
                    type="checkbox"
                    checked={sugarFreeCertified}
                    onChange={(e) => {
                      sound.playBlip();
                      setSugarFreeCertified(e.target.checked);
                      if (e.target.checked && crumbCertified) setValidationError('');
                    }}
                    style={{ marginTop: '2px' }}
                  />
                  <span>
                    <b>Sugar-Free Guarantee:</b> I certify no spilled soda or honey residue has contaminated the PDF payload.
                  </span>
                </label>
              </div>

              {validationError && (
                <div style={{
                  fontSize: '11px',
                  color: '#b91c1c',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #ef4444',
                  padding: '4px 8px',
                  fontWeight: 700,
                }}>
                  ⚠️ {validationError}
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
                  onClick={onCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="win95-btn"
                  style={{ fontWeight: 700 }}
                >
                  Certify Document ➔
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: '12px',
                backgroundColor: '#fefce8',
                border: '1px solid #ca8a04',
              }}>
                <Bug size={28} color="#b45309" style={{ flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                  <div style={{ fontWeight: 800, color: '#78350f', fontSize: '12px' }}>
                    INSECT ASSAULT IMMINENT: DEFEND IN BIG ARENA (20 SECONDS)
                  </div>
                  <div style={{ color: '#1f2937', lineHeight: 1.4 }}>
                    Columns of rogue ants are tracking your PDF. The arena is wide, providing plenty of room to swat every ant before it reaches the center window.
                  </div>
                  <div style={{ color: '#000080', fontWeight: 700, marginTop: '2px' }}>
                    Rule: Survive 20.0s without an ant breach to succeed!
                  </div>
                </div>
              </div>

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
                  onClick={onCancel}
                >
                  Abort
                </button>
                <button
                  type="button"
                  className="win95-btn"
                  onClick={handleStep2Submit}
                  style={{ fontWeight: 700, color: '#b91c1c' }}
                >
                  ⚔️ START 20-SECOND DEFENSE! ➔
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
