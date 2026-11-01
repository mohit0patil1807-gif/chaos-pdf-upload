import React, { useState, useMemo } from 'react';
import { Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { formatBytes } from '../utils/fileUtils';

interface FileSizeConfirmationModalProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
}

interface SizeOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export const FileSizeConfirmationModal: React.FC<FileSizeConfirmationModalProps> = ({
  file,
  onConfirm,
  onCancel,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Deterministically generate 4 size choices derived from actual file.size
  const options: SizeOption[] = useMemo(() => {
    const actualBytes = file.size;
    const formattedActual = formatBytes(actualBytes);

    const fakeLowBytes = Math.max(16, Math.floor(actualBytes * 0.38));
    const fakeHighBytes = Math.floor(actualBytes * 2.45 + 1024);

    const list: SizeOption[] = [
      {
        id: 'opt_low',
        label: `${formatBytes(fakeLowBytes)} (${fakeLowBytes.toLocaleString()} bytes) — [Estimated Uncompressed Tare]`,
        isCorrect: false,
      },
      {
        id: 'opt_correct',
        label: `${formattedActual} (${actualBytes.toLocaleString()} bytes) — [Official Certified Scale Mass]`,
        isCorrect: true,
      },
      {
        id: 'opt_high',
        label: `${formatBytes(fakeHighBytes)} (${fakeHighBytes.toLocaleString()} bytes) — [Archival Gross Weight]`,
        isCorrect: false,
      },
      {
        id: 'opt_infinite',
        label: 'Infinite Bytes — [Theoretical Quantum Estimate]',
        isCorrect: false,
      },
    ];

    // Simple deterministic permutation based on file size so option position is fixed for this file
    const shift = actualBytes % 3;
    if (shift === 1) {
      return [list[1], list[0], list[2], list[3]];
    } else if (shift === 2) {
      return [list[0], list[2], list[1], list[3]];
    }
    return list;
  }, [file.size]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId) {
      sound.playError();
      setErrorMessage('Selection Required: You must choose a certified mass estimate prior to scale ratifying.');
      return;
    }

    const chosen = options.find(o => o.id === selectedOptionId);
    if (!chosen || !chosen.isCorrect) {
      sound.playError();
      setErrorMessage(
        `TARE ERROR: Departmental balance scales detect a discrepancy. Selected weight does not match the certified physical mass of ${file.size.toLocaleString()} bytes.`
      );
      return;
    }

    sound.playStamp();
    onConfirm();
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
            <Scale size={13} />
            <span>Assessment 97-W: Certified Physical Weight Verification</span>
          </div>
          <button className="win95-titlebar-btn" onClick={onCancel}>×</button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleVerify} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '11px', color: '#1f2937' }}>
            Under Sub-paragraph 4.12(c), citizen dockets must undergo manual tare-weight confirmation. Please consult your document bill of lading and designate the exact certified mass of <b>{file.name}</b>:
          </div>

          {/* Options Radios */}
          <div className="win95-inset" style={{
            padding: '10px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {options.map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: '4px',
                  backgroundColor: selectedOptionId === opt.id ? '#e0f2fe' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="file_size_choice"
                  value={opt.id}
                  checked={selectedOptionId === opt.id}
                  onChange={() => {
                    sound.playBlip();
                    setSelectedOptionId(opt.id);
                    setErrorMessage('');
                  }}
                />
                <span style={{ fontFamily: 'var(--font-retro-mono)' }}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>

          {errorMessage && (
            <div style={{
              fontSize: '11px',
              color: '#b91c1c',
              fontWeight: 700,
              backgroundColor: '#fee2e2',
              padding: '6px 8px',
              border: '1px solid #ef4444',
            }}>
              ⚠️ {errorMessage}
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
              Ratify Certified Weight ➔
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
