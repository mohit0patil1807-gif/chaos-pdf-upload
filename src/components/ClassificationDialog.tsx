import React, { useState } from 'react';
import { FileCheck, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface ClassificationDialogProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClassificationDialog: React.FC<ClassificationDialogProps> = ({
  file,
  onConfirm,
  onCancel,
}) => {
  const [selectedClass, setSelectedClass] = useState('routine');
  const [certified, setCertified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certified) {
      sound.playError();
      setErrorMsg('Mandatory Certification required: You must swear this PDF contains at least one vowel!');
      return;
    }
    sound.playStamp();
    onConfirm();
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
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        border: '1px solid var(--accent-cyan)',
        boxShadow: '0 0 35px rgba(6, 182, 212, 0.25)',
        overflow: 'hidden',
      }}>
        {/* Retro Window Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: 'rgba(6, 182, 212, 0.12)',
          borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--accent-cyan)" />
            <span style={{
              fontWeight: 800,
              fontSize: '0.88rem',
              fontFamily: 'var(--font-heading)',
              color: '#f8fafc',
              letterSpacing: '0.03em',
            }}>
              FORM 104-B // MANDATORY DOCUMENT CLASSIFICATION
            </span>
          </div>
          <span style={{
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent-cyan)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '0.15rem 0.5rem',
            borderRadius: '4px',
          }}>
            STEP 1 OF 3
          </span>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* File Metadata Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.85rem 1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <FileCheck size={28} color="var(--accent-green)" />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '0.9rem', 
                color: '#f8fafc',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {file.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Payload Size: {formatBytes(file.size)} | MIME: {file.type || 'application/pdf (inferred)'}
              </div>
            </div>
          </div>

          <div>
            <label style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#e2e8f0',
              display: 'block',
              marginBottom: '0.5rem',
            }}>
              Select Archival Category:
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'routine', label: 'Class A: Routine Bureaucratic Drudgery (Recommended for speedy resolution)', hint: 'Standard legal compliance.' },
                { id: 'grocery', label: 'Class B: Strictly Redacted Grocery Manifest', hint: 'Subject to dairy scrutiny.' },
                { id: 'alien', label: 'Class C: Evidence of Extraterrestrial Filing Errors', hint: 'May trigger cosmic investigation.' },
                { id: 'complaint', label: 'Class D: Strongly Worded Non-Binding Memorandum', hint: 'Will be forwarded to an unmonitored mailbox.' },
              ].map(opt => (
                <label
                  key={opt.id}
                  onClick={() => sound.playBlip()}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: selectedClass === opt.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${selectedClass === opt.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.08)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="radio"
                    name="classification"
                    value={opt.id}
                    checked={selectedClass === opt.id}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    style={{ marginTop: '0.2rem', accentColor: 'var(--accent-cyan)' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedClass === opt.id ? '#38bdf8' : '#e2e8f0' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{opt.hint}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Mandatory Certification Checkbox */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              fontSize: '0.78rem',
              color: '#cbd5e1',
              cursor: 'pointer',
              userSelect: 'none',
            }}>
              <input
                type="checkbox"
                checked={certified}
                onChange={(e) => {
                  sound.playBlip();
                  setCertified(e.target.checked);
                  if (e.target.checked) setErrorMsg('');
                }}
                style={{ marginTop: '0.15rem', accentColor: 'var(--accent-cyan)' }}
              />
              <span>
                I swear under penalty of digital perusal that this document is genuine, contains at least one vowel, and will not disrupt local server equilibrium.
              </span>
            </label>
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--accent-rose)',
                fontSize: '0.74rem',
                marginTop: '0.4rem',
              }}>
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <button
              type="button"
              onClick={() => {
                sound.playBeep(200, 'square', 0.1);
                onCancel();
              }}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--text-muted)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              Abort Upload
            </button>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.25rem',
                backgroundColor: 'var(--accent-cyan)',
                border: 'none',
                color: '#090d16',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Sparkles size={15} />
              Submit Classification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
